import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, MailCheck, Phone, ShieldCheck, User } from 'lucide-react';
import { forgotPasswordSchema, loginSchema, registerSchema, type ForgotPasswordValues, type LoginValues, type RegisterValues } from '@/schemas';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api/client';
import type { ApiErrorBody } from '@/services/api/client';
import { safeRedirect } from '@/utils/sanitize';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Checkbox } from '@/components/ui/Choice';
import { InlineAlert } from '@/components/ui/States';
import { SafeImage } from '@/components/ui/SafeImage';
import { DeliveryPerks } from '@/components/common/DeliveryPerks';
import { AxiosError } from 'axios';

function AuthShell({ title, subtitle, children, image = 'runningStairs' }: { title: string; subtitle: string; children: ReactNode; image?: string }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-10rem)] items-stretch gap-10 py-8 lg:grid-cols-2 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-full max-w-md flex-col justify-center">
        <h1 className="font-display text-3xl font-black tracking-tight text-fg sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </motion.div>
      <div className="relative hidden overflow-hidden rounded-[2rem] bg-ink-950 lg:block">
        <SafeImage src={image} alt="" width={900} ratio={1.2} wrapperClassName="absolute! inset-0" className="opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="font-display text-3xl font-black leading-tight">
            Join 40,000+ athletes
            <br />
            <span className="text-volt-400">training smarter across the UAE.</span>
          </p>
          <DeliveryPerks perks={['sameDay', 'cod', 'returns']} layout="list" tone="inverted" className="mt-6" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Login ---------------- */

export function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'), '/account');
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', remember: true } });
  useSeo({ title: t.auth.signIn, noindex: true });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      const user = await login(v);
      toast.success(t.auth.welcome(user.firstName));
      navigate(user.role === 'admin' && redirect === '/account' ? '/admin' : redirect, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  const fill = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <AuthShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      <div className="mb-6 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-500/5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {t.auth.demoTitle}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { label: t.auth.demoCustomer, email: 'test@sportsouq.ae', pw: 'Test@1234' },
            { label: t.auth.demoAdmin, email: 'admin@sportsouq.ae', pw: 'Admin@1234' },
          ].map((d) => (
            <button key={d.email} type="button" onClick={() => fill(d.email, d.pw)} className="rounded-xl bg-surface px-3 py-2 text-start text-xs ring-1 ring-line transition hover:ring-brand-500">
              <span className="block font-bold text-fg">
                {t.auth.useAccount} {d.label}
              </span>
              <span className="block truncate text-fg-muted">{d.email}</span>
              <span className="block font-mono text-fg-subtle">{d.pw}</span>
            </button>
          ))}
        </div>
      </div>
      {error && (
        <InlineAlert tone="danger" className="mb-4">
          {error}
        </InlineAlert>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input label={t.auth.email} type="email" autoComplete="email" required leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
        <Input label={t.auth.password} type="password" autoComplete="current-password" required leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
        <div className="flex items-center justify-between">
          <Checkbox label={t.auth.remember} {...register('remember')} />
          <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">
            {t.auth.forgot}
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} fullWidth>
          {isSubmitting ? t.auth.signingIn : t.auth.signIn}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-fg-muted">
        {t.auth.noAccount}{' '}
        <Link to={'/register' + (params.get('redirect') ? '?redirect=' + encodeURIComponent(redirect) : '')} className="font-bold text-brand-600 hover:underline">
          {t.auth.createAccount}
        </Link>
      </p>
    </AuthShell>
  );
}

/* ---------------- Register ---------------- */

function passwordScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12 && s === 4) s = 4;
  return pw ? Math.max(s, 1) - (pw.length < 8 ? 1 : 0) : 0;
}

function PasswordStrength({ value }: { value: string }) {
  const { t } = useI18n();
  const score = passwordScore(value);
  const colors = ['bg-danger-500', 'bg-danger-500', 'bg-warning-500', 'bg-info-600', 'bg-success-500'];
  if (!value) return null;
  return (
    <div className="-mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i < score ? colors[score] : 'bg-surface-sunken')} />
        ))}
      </div>
      <p className="mt-1 text-xs text-fg-subtle">Password strength: {t.auth.passwordStrength[score]}</p>
    </div>
  );
}

export function RegisterPage() {
  const { t } = useI18n();
  const { register: signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'), '/account');
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, control, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false, marketingOptIn: true },
  });
  const password = useWatch({ control, name: 'password' });
  useSeo({ title: t.auth.createAccount, noindex: true });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      const user = await signUp(v);
      toast.success(t.auth.welcomeNew(user.firstName), { description: 'Use code WELCOME10 for 10% off your first order.' });
      navigate(redirect, { replace: true });
    } catch (err) {
      const body = err instanceof AxiosError ? (err.response?.data as ApiErrorBody | undefined) : undefined;
      if (body?.fields) {
        for (const [k, msg] of Object.entries(body.fields)) setFieldError(k as keyof RegisterValues, { message: msg });
      }
      setError(getErrorMessage(err));
    }
  });

  return (
    <AuthShell title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle} image="footballDribble">
      {error && (
        <InlineAlert tone="danger" className="mb-4">
          {error}
        </InlineAlert>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input label={t.auth.fullName} required autoComplete="name" leftIcon={<User className="h-4 w-4" />} error={errors.fullName?.message} {...register('fullName')} />
        <Input label={t.auth.email} type="email" required autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
        <Input label={t.auth.phone} type="tel" inputMode="tel" required autoComplete="tel" placeholder="050 123 4567" leftIcon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register('phone')} />
        <Input label={t.auth.password} type="password" required autoComplete="new-password" hint="8+ characters with upper & lower case, a number and a symbol" leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
        <PasswordStrength value={password ?? ''} />
        <Input label={t.auth.confirmPassword} type="password" required autoComplete="new-password" leftIcon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <div className="space-y-3">
          <Checkbox
            label={
              <>
                I agree to the{' '}
                <Link to="/policies/terms" className="font-semibold text-brand-600 hover:underline" target="_blank">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/policies/privacy" className="font-semibold text-brand-600 hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </>
            }
            aria-invalid={!!errors.acceptTerms || undefined}
            {...register('acceptTerms')}
          />
          {errors.acceptTerms && (
            <p role="alert" className="text-xs font-medium text-danger-600">
              {errors.acceptTerms.message}
            </p>
          )}
          <Checkbox label={t.auth.marketing} {...register('marketingOptIn')} />
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} fullWidth>
          {isSubmitting ? t.auth.creating : t.auth.createAccount}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-fg-muted">
        {t.auth.haveAccount}{' '}
        <Link to={'/login' + (params.get('redirect') ? '?redirect=' + encodeURIComponent(redirect) : '')} className="font-bold text-brand-600 hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}

/* ---------------- Forgot password ---------------- */

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });
  useSeo({ title: t.auth.forgotTitle, noindex: true });
  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });
  return (
    <AuthShell title={t.auth.forgotTitle} subtitle={t.auth.forgotSubtitle} image="swimLane">
      {sentTo ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-line bg-surface p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-600 dark:bg-success-600/15">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-fg" role="status">
            {t.auth.forgotSent}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">Sent to {sentTo}. The link expires in 30 minutes.</p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t.auth.backToLogin}
          </Link>
        </motion.div>
      ) : (
        <>
          {error && (
            <InlineAlert tone="danger" className="mb-4">
              {error}
            </InlineAlert>
          )}
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Input label={t.auth.email} type="email" required autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
            <Button type="submit" size="lg" loading={isSubmitting} fullWidth>
              {t.auth.sendLink}
            </Button>
          </form>
          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-fg-muted hover:text-fg">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t.auth.backToLogin}
          </Link>
        </>
      )}
    </AuthShell>
  );
}
