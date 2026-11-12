import type { Address, StoredUser } from '@/types';
import { addressSchema, changePasswordSchema, emailSchema, profileSchema, registerSchema } from '@/schemas';
import { formatPhone } from '@/utils/format';
import { sanitizeSingleLine } from '@/utils/sanitize';
import { uid } from '@/utils/random';
import { db } from '../db';
import { hashPassword } from '../crypto';
import { ApiError, publicUser, requireUser, route, str } from '../router';

const SESSION_DAYS_REMEMBER = 30;
const SESSION_HOURS = 12;

function createSession(userId: string, remember: boolean) {
  const expiresAt = new Date(Date.now() + (remember ? SESSION_DAYS_REMEMBER * 86_400_000 : SESSION_HOURS * 3_600_000)).toISOString();
  const session = { token: uid('tok_') + uid(), userId, expiresAt };
  db.addSession(session);
  return session;
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? 'form');
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

/* Simple brute-force throttle per email (per tab session). */
const failedAttempts = new Map<string, { count: number; until: number }>();

route('POST', '/auth/login', async (ctx) => {
  const email = str(ctx.body, 'email', 120).trim().toLowerCase();
  const password = str(ctx.body, 'password', 64);
  const remember = ctx.body.remember === true;
  const lock = failedAttempts.get(email);
  if (lock && lock.until > Date.now()) {
    throw new ApiError(429, 'Too many attempts. Please wait a minute and try again.', 'rate_limited');
  }
  const user = db.users().find((u) => u.email === email);
  const hash = await hashPassword(email, password);
  if (!user || user.passwordHash !== hash) {
    const count = (lock?.count ?? 0) + 1;
    failedAttempts.set(email, { count, until: count >= 5 ? Date.now() + 60_000 : 0 });
    throw new ApiError(401, 'Incorrect email or password.', 'invalid_credentials');
  }
  failedAttempts.delete(email);
  return { user: publicUser(user), session: createSession(user.id, remember) };
});

route('POST', '/auth/register', async (ctx) => {
  const parsed = registerSchema.safeParse(ctx.body);
  if (!parsed.success) throw new ApiError(422, 'Please check the highlighted fields.', 'validation', fieldErrors(parsed.error.issues));
  const v = parsed.data;
  if (db.users().some((u) => u.email === v.email)) {
    throw new ApiError(409, 'An account with this email already exists.', 'email_taken', { email: 'This email is already registered — try signing in.' });
  }
  const [firstName, ...rest] = sanitizeSingleLine(v.fullName, 80).split(/\s+/);
  const user: StoredUser = {
    id: uid('u-'),
    firstName,
    lastName: rest.join(' '),
    email: v.email,
    phone: formatPhone(v.phone),
    role: 'customer',
    createdAt: new Date().toISOString(),
    marketingOptIn: v.marketingOptIn,
    avatarColor: ['#d43b0c', '#2563eb', '#15803d', '#7c3aed', '#0891b2'][Math.floor(Math.random() * 5)],
    passwordHash: await hashPassword(v.email, v.password),
  };
  db.addUser(user);
  return { user: publicUser(user), session: createSession(user.id, true) };
});

route('POST', '/auth/logout', (ctx) => {
  if (ctx.token) db.removeSession(ctx.token);
  return { ok: true };
});

route('GET', '/auth/me', (ctx) => publicUser(requireUser(ctx)));

/** Always succeeds so attackers cannot enumerate registered emails. */
route('POST', '/auth/forgot-password', (ctx) => {
  const parsed = emailSchema.safeParse(ctx.body.email);
  if (!parsed.success) throw new ApiError(422, 'Enter a valid email address.', 'validation');
  return { ok: true };
});

route('PATCH', '/account/profile', (ctx) => {
  const user = requireUser(ctx);
  const parsed = profileSchema.safeParse(ctx.body);
  if (!parsed.success) throw new ApiError(422, 'Please check the highlighted fields.', 'validation', fieldErrors(parsed.error.issues));
  const v = parsed.data;
  if (v.email !== user.email) {
    // Email is the login identity; changing it requires a verified flow handled by support.
    throw new ApiError(400, 'To change your email address, please contact customer care.', 'email_locked', { email: 'Email can’t be changed here' });
  }
  const marketingOptIn = typeof ctx.body.marketingOptIn === 'boolean' ? ctx.body.marketingOptIn : user.marketingOptIn;
  const updated = db.updateUser(user.id, {
    firstName: sanitizeSingleLine(v.firstName, 40),
    lastName: sanitizeSingleLine(v.lastName, 40),
    phone: formatPhone(v.phone),
    marketingOptIn,
  });
  return publicUser(updated!);
});

route('POST', '/account/password', async (ctx) => {
  const user = requireUser(ctx);
  const parsed = changePasswordSchema.safeParse(ctx.body);
  if (!parsed.success) throw new ApiError(422, 'Please check the highlighted fields.', 'validation', fieldErrors(parsed.error.issues));
  if ((await hashPassword(user.email, parsed.data.currentPassword)) !== user.passwordHash) {
    throw new ApiError(400, 'Your current password is incorrect.', 'wrong_password', { currentPassword: 'Incorrect password' });
  }
  db.updateUser(user.id, { passwordHash: await hashPassword(user.email, parsed.data.newPassword) });
  return { ok: true };
});

/* ---------------- Addresses ---------------- */

function cleanAddress(body: Record<string, unknown>): Omit<Address, 'id' | 'userId'> {
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, 'Please check the highlighted fields.', 'validation', fieldErrors(parsed.error.issues));
  const v = parsed.data;
  return {
    fullName: sanitizeSingleLine(v.fullName, 80),
    phone: formatPhone(v.phone),
    emirate: v.emirate,
    city: sanitizeSingleLine(v.city, 80),
    area: sanitizeSingleLine(v.area, 80),
    building: sanitizeSingleLine(v.building, 80),
    unit: sanitizeSingleLine(v.unit, 20),
    street: sanitizeSingleLine(v.street, 80),
    landmark: v.landmark ? sanitizeSingleLine(v.landmark, 80) : undefined,
    label: v.label,
    isDefault: v.isDefault,
  };
}

function normaliseDefaults(list: Address[], preferredId?: string): Address[] {
  if (!list.length) return list;
  const target = preferredId ?? list.find((a) => a.isDefault)?.id ?? list[0].id;
  return list.map((a) => ({ ...a, isDefault: a.id === target }));
}

route('GET', '/account/addresses', (ctx) => db.addresses(requireUser(ctx).id));

route('POST', '/account/addresses', (ctx) => {
  const user = requireUser(ctx);
  const existing = db.addresses(user.id);
  if (existing.length >= 10) throw new ApiError(400, 'You can save up to 10 addresses.', 'limit');
  const address: Address = { ...cleanAddress(ctx.body), id: uid('a-'), userId: user.id };
  const list = normaliseDefaults([...existing, address], address.isDefault || !existing.length ? address.id : undefined);
  db.saveAddresses(user.id, list);
  return list.find((a) => a.id === address.id);
});

route('PUT', '/account/addresses/:id', (ctx) => {
  const user = requireUser(ctx);
  const existing = db.addresses(user.id);
  if (!existing.some((a) => a.id === ctx.params.id)) throw new ApiError(404, 'Address not found.', 'not_found');
  const data = cleanAddress(ctx.body);
  const list = normaliseDefaults(
    existing.map((a) => (a.id === ctx.params.id ? { ...a, ...data } : a)),
    data.isDefault ? ctx.params.id : undefined,
  );
  db.saveAddresses(user.id, list);
  return list.find((a) => a.id === ctx.params.id);
});

route('DELETE', '/account/addresses/:id', (ctx) => {
  const user = requireUser(ctx);
  const list = normaliseDefaults(db.addresses(user.id).filter((a) => a.id !== ctx.params.id));
  db.saveAddresses(user.id, list);
  return { ok: true };
});

route('POST', '/account/addresses/:id/default', (ctx) => {
  const user = requireUser(ctx);
  const list = normaliseDefaults(db.addresses(user.id), ctx.params.id);
  db.saveAddresses(user.id, list);
  return list;
});
