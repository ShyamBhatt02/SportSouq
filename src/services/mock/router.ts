import type { StoredUser, User } from '@/types';
import { db } from './db';

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, message: string, code = 'error', fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export interface RequestContext {
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, unknown>;
  token: string | null;
}

type Handler = (ctx: RequestContext) => unknown | Promise<unknown>;
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Route {
  method: Method;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

const routes: Route[] = [];

export function route(method: Method, path: string, handler: Handler): void {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' +
      path.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, key: string) => {
        keys.push(key);
        return '([^\\/]+)';
      }) +
      '\\/?$',
  );
  routes.push({ method, pattern, keys, handler });
}

export async function dispatch(method: string, path: string, ctx: Omit<RequestContext, 'params'>): Promise<{ status: number; data: unknown }> {
  for (const r of routes) {
    if (r.method !== method.toUpperCase()) continue;
    const m = r.pattern.exec(path);
    if (!m) continue;
    const params: Record<string, string> = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    const data = await r.handler({ ...ctx, params });
    return { status: method.toUpperCase() === 'POST' ? 201 : 200, data };
  }
  throw new ApiError(404, 'Endpoint not found: ' + method + ' ' + path, 'not_found');
}

/* ---------------- Auth helpers for handlers ---------------- */

export function publicUser(u: StoredUser): User {
  // Strip the password hash before anything leaves the "server".
  const { passwordHash: _omit, ...rest } = u;
  void _omit;
  return rest;
}

export function currentUser(ctx: Pick<RequestContext, 'token'>): StoredUser | null {
  if (!ctx.token) return null;
  const session = db.sessions().find((s) => s.token === ctx.token);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) return null;
  return db.users().find((u) => u.id === session.userId) ?? null;
}

export function requireUser(ctx: RequestContext): StoredUser {
  const user = currentUser(ctx);
  if (!user) throw new ApiError(401, 'Please sign in to continue.', 'unauthenticated');
  return user;
}

export function requireAdmin(ctx: RequestContext): StoredUser {
  const user = requireUser(ctx);
  if (user.role !== 'admin') throw new ApiError(403, 'Admin access required.', 'forbidden');
  return user;
}

export function str(body: Record<string, unknown>, key: string, max = 500): string {
  const v = body[key];
  return typeof v === 'string' ? v.slice(0, max) : '';
}
