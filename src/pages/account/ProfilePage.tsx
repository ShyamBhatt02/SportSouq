import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { changePasswordSchema, profileSchema, type ChangePasswordValues, type ProfileValues } from '@/schemas';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { authService } from '@/services/authService';
import { getErrorMessage, type ApiErrorBody } from '@/services/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <h2 className="text-lg font-bold text-fg">{title}</h2>
      {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ProfilePage() {
  const { t } = useI18n();
  const { user, setUser } = useAuth();
  const toast = useToast();
  useSeo({ title: t.account.profile, noindex: true });

  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : undefined,
  });
  const password = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const saveProfile = profile.handleSubmit(async (v) => {
    try {
      const updated = await authService.updateProfile(v);
      setUser(updated);
      toast.success(t.toast.profileSaved);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  const savePassword = password.handleSubmit(async (v) => {
    try {
      await authService.changePassword(v);
      password.reset();
      toast.success(t.toast.passwordChanged);
    } catch (err) {
      const body = err instanceof AxiosError ? (err.response?.data as ApiErrorBody | undefined) : undefined;
      if (body?.fields?.currentPassword) password.setError('currentPassword', { message: body.fields.currentPassword });
      toast.error(getErrorMessage(err));
    }
  });

  const pe = profile.formState.errors;
  const we = password.formState.errors;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-fg">{t.account.profile}</h1>
      <Card title={t.account.personalInfo} description="Keep your details up to date for smooth deliveries.">
        <form onSubmit={saveProfile} noValidate className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" required autoComplete="given-name" error={pe.firstName?.message} {...profile.register('firstName')} />
          <Input label="Last name" required autoComplete="family-name" error={pe.lastName?.message} {...profile.register('lastName')} />
          <Input label={t.auth.email} type="email" readOnly disabled hint={t.account.emailLocked} {...profile.register('email')} />
          <Input label={t.auth.phone} type="tel" required autoComplete="tel" error={pe.phone?.message} {...profile.register('phone')} />
          <div className="sm:col-span-2">
            <Button type="submit" loading={profile.formState.isSubmitting} disabled={!profile.formState.isDirty}>
              {t.common.saveChanges}
            </Button>
          </div>
        </form>
      </Card>
      <Card title={t.account.changePassword} description="Use at least 8 characters with a mix of letters, numbers and symbols.">
        <form onSubmit={savePassword} noValidate className="grid max-w-md gap-4">
          <Input label={t.account.currentPassword} type="password" required autoComplete="current-password" error={we.currentPassword?.message} {...password.register('currentPassword')} />
          <Input label={t.account.newPassword} type="password" required autoComplete="new-password" error={we.newPassword?.message} {...password.register('newPassword')} />
          <Input label={t.auth.confirmPassword} type="password" required autoComplete="new-password" error={we.confirmPassword?.message} {...password.register('confirmPassword')} />
          <div>
            <Button type="submit" variant="secondary" loading={password.formState.isSubmitting}>
              {t.account.updatePassword}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
