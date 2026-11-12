import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Home } from 'lucide-react';
import type { Address, AddressInput, EmirateCode } from '@/types';
import { addressSchema, type AddressValues } from '@/schemas';
import { EMIRATES, getEmirate } from '@/config/site';
import { formatPhone } from '@/utils/format';
import { Input, Select } from '@/components/ui/Field';
import { Checkbox } from '@/components/ui/Choice';
import { cn } from '@/utils/cn';

interface AddressFormProps {
  initial?: Partial<AddressInput>;
  onSubmit: (values: AddressInput) => void | Promise<void>;
  footer: (state: { submitting: boolean }) => ReactNode;
  showDefault?: boolean;
  id?: string;
}

export function toAddressInput(v: AddressValues): AddressInput {
  return {
    fullName: v.fullName.trim(),
    phone: formatPhone(v.phone),
    emirate: v.emirate,
    city: v.city.trim(),
    area: v.area.trim(),
    building: v.building.trim(),
    unit: v.unit.trim(),
    street: v.street.trim(),
    landmark: v.landmark?.trim() || undefined,
    label: v.label,
    isDefault: v.isDefault,
  };
}

/** UAE address form: Emirate → City → Area, building/villa, apartment/villa number, street, landmark, label. */
export function AddressForm({ initial, onSubmit, footer, showDefault = true, id = 'address-form' }: AddressFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      emirate: (initial?.emirate ?? '') as EmirateCode,
      city: initial?.city ?? '',
      area: initial?.area ?? '',
      building: initial?.building ?? '',
      unit: initial?.unit ?? '',
      street: initial?.street ?? '',
      landmark: initial?.landmark ?? '',
      label: initial?.label ?? 'home',
      isDefault: initial?.isDefault ?? false,
    },
  });
  const emirate = watch('emirate');
  const label = watch('label');
  const cities = emirate ? getEmirate(emirate).cities : [];

  // Default the city to the emirate's main city when the emirate changes.
  useEffect(() => {
    if (!emirate) return;
    const current = watch('city');
    if (!current || !getEmirate(emirate).cities.includes(current)) setValue('city', getEmirate(emirate).cities[0], { shouldValidate: false });
  }, [emirate, setValue, watch]);

  return (
    <form id={id} onSubmit={handleSubmit((v) => onSubmit(toAddressInput(v)))} noValidate className="grid gap-4 sm:grid-cols-2">
      <Input label="Full name" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Mobile number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="050 123 4567" error={errors.phone?.message} {...register('phone')} />
      <Select label="Emirate" required placeholder="Select emirate" options={EMIRATES.map((e) => ({ value: e.code, label: e.name }))} error={errors.emirate?.message} {...register('emirate')} />
      <div>
        <Input label="City" required list={id + '-cities'} autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        <datalist id={id + '-cities'}>
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <Input label="Area / community" required placeholder="e.g. Dubai Marina, Al Nahda" autoComplete="address-level3" error={errors.area?.message} {...register('area')} />
      <Input label="Street" required placeholder="e.g. Al Marsa Street" autoComplete="address-line1" error={errors.street?.message} {...register('street')} />
      <Input label="Building / villa name" required placeholder="e.g. Marina Gate 2" error={errors.building?.message} {...register('building')} />
      <Input label="Apartment / villa number" required placeholder="e.g. Apt 2304" autoComplete="address-line2" error={errors.unit?.message} {...register('unit')} />
      <Input label="Nearest landmark" hint="Optional — helps our drivers find you faster" placeholder="e.g. Next to Marina Mall" wrapperClassName="sm:col-span-2" error={errors.landmark?.message} {...register('landmark')} />
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold text-fg">Address label</legend>
        <div className="flex gap-3">
          {(['home', 'office'] as const).map((l) => (
            <label key={l} className={cn('flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition sm:flex-none', label === l ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-line-strong text-fg hover:border-fg')}>
              <input type="radio" value={l} className="sr-only" {...register('label')} />
              {l === 'home' ? <Home className="h-4 w-4" aria-hidden="true" /> : <Building2 className="h-4 w-4" aria-hidden="true" />}
              {l === 'home' ? 'Home' : 'Office'}
            </label>
          ))}
        </div>
      </fieldset>
      {showDefault && <Checkbox label="Set as my default address" className="sm:col-span-2" {...register('isDefault')} />}
      <div className="sm:col-span-2">{footer({ submitting: isSubmitting })}</div>
    </form>
  );
}

export function AddressSummary({ address, compact }: { address: Omit<Address, 'id' | 'userId' | 'isDefault'> | AddressInput; compact?: boolean }) {
  return (
    <address className={cn('not-italic leading-relaxed text-fg-muted', compact ? 'text-xs' : 'text-sm')}>
      <span className="font-semibold text-fg">{address.fullName}</span>
      <br />
      {address.unit}, {address.building}
      <br />
      {address.street}, {address.area}
      <br />
      {address.city}, {getEmirate(address.emirate).name}, UAE
      {address.landmark && (
        <>
          <br />
          <span className="text-fg-subtle">Near {address.landmark}</span>
        </>
      )}
      <br />
      {address.phone}
    </address>
  );
}
