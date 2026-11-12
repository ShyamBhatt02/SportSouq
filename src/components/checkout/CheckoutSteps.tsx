import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Banknote, Building2, Check, CreditCard, Home, Lock, MapPin, Plus, ScanFace, Truck, Zap } from 'lucide-react';
import { CHECKOUT_STEPS, useCheckout, type CheckoutStep } from '@/context/CheckoutContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAddresses } from '@/hooks/queries';
import { useI18n } from '@/i18n/I18nProvider';
import { customerInfoSchema, cardSchema, type CardValues, type CustomerInfoValues } from '@/schemas';
import { PAYMENT_METHODS, COD_FEE, getEmirate } from '@/config/site';
import { formatDay, formatPhone, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { RadioCard, Checkbox } from '@/components/ui/Choice';
import { Modal } from '@/components/ui/Overlay';
import { InlineAlert } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddressForm, AddressSummary } from '@/components/account/AddressForm';
import { LogoMark } from '@/components/common/Logo';

/* ---------------- Stepper ---------------- */

export function CheckoutStepper() {
  const { t } = useI18n();
  const { step, stepIndex, canVisit, goTo } = useCheckout();
  const labels = t.checkout.steps;
  return (
    <nav aria-label="Checkout progress">
      <div className="sm:hidden">
        <p className="text-sm font-semibold text-fg">
          Step {stepIndex + 1} of {CHECKOUT_STEPS.length} · <span className="text-brand-600">{labels[stepIndex]}</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
          <motion.div className="h-full rounded-full bg-brand-600" animate={{ width: ((stepIndex + 1) / CHECKOUT_STEPS.length) * 100 + '%' }} />
        </div>
      </div>
      <ol className="hidden items-center sm:flex">
        {CHECKOUT_STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = s === step;
          const clickable = i < stepIndex && canVisit(s) && s !== 'confirmation';
          return (
            <li key={s} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => goTo(s as CheckoutStep)}
                aria-current={current ? 'step' : undefined}
                className="group flex items-center gap-2 disabled:cursor-default"
              >
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition', done ? 'bg-success-600 text-white' : current ? 'bg-brand-600 text-white ring-4 ring-brand-500/20' : 'bg-surface-sunken text-fg-subtle')}>
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn('hidden text-sm font-semibold md:inline', current ? 'text-fg' : done ? 'text-fg-muted group-enabled:group-hover:text-fg' : 'text-fg-subtle')}>{labels[i]}</span>
              </button>
              {i < CHECKOUT_STEPS.length - 1 && <span className={cn('mx-3 h-0.5 flex-1 rounded-full', i < stepIndex ? 'bg-success-500' : 'bg-line')} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepNav({ onBack, nextLabel, loading, nextDisabled, form }: { onBack?: () => void; nextLabel: string; loading?: boolean; nextDisabled?: boolean; form?: string }) {
  const { t } = useI18n();
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}>
          {t.common.back}
        </Button>
      ) : (
        <Link to="/cart" className="text-center text-sm font-semibold text-fg-muted hover:text-fg sm:text-start">
          ← Back to bag
        </Link>
      )}
      <Button type="submit" form={form} size="lg" loading={loading} disabled={nextDisabled} rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}>
        {nextLabel}
      </Button>
    </div>
  );
}

export function StepCard({ title, description, children, icon }: { title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">{icon}</span>}
        <div>
          <h2 className="text-xl font-extrabold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/* ---------------- 1. Contact ---------------- */

export function ContactStep() {
  const { t } = useI18n();
  const { user } = useAuth();
  const checkout = useCheckout();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: checkout.customer ?? { firstName: '', lastName: '', email: '', phone: '' },
  });
  // The signed-in prefill can arrive after mount; apply it unless the shopper already typed.
  useEffect(() => {
    if (checkout.customer && !isDirty) reset(checkout.customer);
  }, [checkout.customer, isDirty, reset]);
  const onSubmit = handleSubmit((v) => {
    checkout.update({ customer: { firstName: v.firstName.trim(), lastName: v.lastName.trim(), email: v.email, phone: formatPhone(v.phone) } });
    checkout.next();
  });
  return (
    <StepCard title={t.checkout.contact} description={t.checkout.contactHint} icon={<span className="text-sm font-black">1</span>}>
      {!user && (
        <p className="mb-5 rounded-xl bg-surface-muted px-4 py-3 text-sm text-fg-muted">
          {t.checkout.haveAccount}{' '}
          <Link to="/login?redirect=/checkout" className="font-bold text-brand-600 hover:underline">
            {t.auth.signIn}
          </Link>{' '}
          for faster checkout — or continue as a guest.
        </p>
      )}
      <form id="contact-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" required autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last name" required autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        <Input label={t.auth.email} required type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label={t.auth.phone} required type="tel" inputMode="tel" autoComplete="tel" placeholder="050 123 4567" hint="We’ll text delivery updates to this number" error={errors.phone?.message} {...register('phone')} />
      </form>
      <StepNav nextLabel="Continue to address" form="contact-form" />
    </StepCard>
  );
}

/* ---------------- 2. Address ---------------- */

export function AddressStep() {
  const { t } = useI18n();
  const { user } = useAuth();
  const checkout = useCheckout();
  const addresses = useAddresses();
  const saved = addresses.data ?? [];
  const [mode, setMode] = useState<'saved' | 'new'>(checkout.addressId || (!checkout.address && user) ? 'saved' : 'new');
  const [selected, setSelected] = useState<string | null>(checkout.addressId);
  const effectiveSelected = selected ?? saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? null;
  const useSaved = !!user && mode === 'saved' && saved.length > 0;

  const continueWithSaved = () => {
    const a = saved.find((x) => x.id === effectiveSelected);
    if (!a) return;
    const { id, userId, ...rest } = a;
    void userId;
    checkout.update({ address: rest, addressId: id, saveAddress: false });
    checkout.next();
  };

  return (
    <StepCard title={t.checkout.address} description="We deliver to all seven emirates." icon={<MapPin className="h-5 w-5" />}>
      {user && addresses.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : useSaved ? (
        <>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-fg">{t.checkout.savedAddresses}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {saved.map((a) => (
                <RadioCard
                  key={a.id}
                  name="saved-address"
                  checked={effectiveSelected === a.id}
                  onChange={() => setSelected(a.id)}
                  icon={a.label === 'home' ? <Home className="h-4.5 w-4.5" /> : <Building2 className="h-4.5 w-4.5" />}
                  label={
                    <span className="flex items-center gap-2">
                      {a.label === 'home' ? 'Home' : 'Office'}
                      {a.isDefault && <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-bold uppercase text-fg-muted">{t.account.defaultAddress}</span>}
                    </span>
                  }
                >
                  <div className="ps-8">
                    <AddressSummary address={a} compact />
                  </div>
                </RadioCard>
              ))}
              <button type="button" onClick={() => setMode('new')} className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong p-4 text-sm font-semibold text-fg-muted transition hover:border-fg hover:text-fg">
                <Plus className="h-5 w-5" aria-hidden="true" /> {t.checkout.newAddress}
              </button>
            </div>
          </fieldset>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              continueWithSaved();
            }}
          >
            <StepNav onBack={checkout.back} nextLabel="Deliver here" nextDisabled={!effectiveSelected} />
          </form>
        </>
      ) : (
        <>
          {user && saved.length > 0 && (
            <button type="button" onClick={() => setMode('saved')} className="mb-4 text-sm font-bold text-brand-600 hover:underline">
              ← Use a saved address
            </button>
          )}
          <AddressForm
            id="checkout-address"
            showDefault={false}
            initial={checkout.addressId ? undefined : checkout.address ?? { fullName: checkout.customer ? checkout.customer.firstName + ' ' + checkout.customer.lastName : '', phone: checkout.customer?.phone ?? '' }}
            onSubmit={(address) => {
              checkout.update({ address, addressId: null });
              checkout.next();
            }}
            footer={() => (
              <>
                {user && (
                  <Checkbox label={t.checkout.saveAddress} checked={checkout.saveAddress} onChange={(e) => checkout.update({ saveAddress: e.target.checked })} />
                )}
                <StepNav onBack={checkout.back} nextLabel="Continue to delivery" />
              </>
            )}
          />
        </>
      )}
    </StepCard>
  );
}

/* ---------------- 3. Delivery ---------------- */

export function DeliveryStep() {
  const { t } = useI18n();
  const checkout = useCheckout();
  const firstAvailable = checkout.quotes.find((q) => q.available)?.method.id ?? null;
  const [choice, setChoice] = useState(checkout.selectedQuote?.method.id ?? firstAvailable);
  const emirate = getEmirate(checkout.address?.emirate);
  const icons = { standard: <Truck className="h-5 w-5" />, express: <Zap className="h-5 w-5" />, 'same-day': <Zap className="h-5 w-5 fill-current" /> };
  return (
    <StepCard title={t.checkout.deliveryMethod} description={'Delivering to ' + emirate.name + (checkout.hasBulky ? ' · includes a large item (two-person delivery)' : '')} icon={<Truck className="h-5 w-5" />}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!choice) return;
          checkout.update({ deliveryMethod: choice });
          checkout.next();
        }}
      >
        <fieldset className="grid gap-3">
          <legend className="sr-only">{t.checkout.deliveryMethod}</legend>
          {checkout.quotes.map((q) => (
            <RadioCard
              key={q.method.id}
              name="delivery"
              value={q.method.id}
              checked={choice === q.method.id}
              disabled={!q.available}
              onChange={() => setChoice(q.method.id)}
              icon={icons[q.method.id]}
              label={q.method.name}
              description={q.available ? q.method.description : q.reason}
              trailing={!q.available ? <span className="text-xs font-semibold text-fg-subtle">{t.checkout.unavailable}</span> : q.fee === 0 ? <span className="text-success-600">{t.cart.free}</span> : formatPrice(q.fee)}
            >
              {q.available && (
                <p className="ps-16 text-xs font-semibold text-fg">
                  Estimated: <span className="text-brand-600 dark:text-brand-400">{q.label}</span>
                  <span className="font-normal text-fg-subtle"> · {formatDay(q.estimatedTo)}</span>
                </p>
              )}
            </RadioCard>
          ))}
        </fieldset>
        <StepNav onBack={checkout.back} nextLabel="Continue to payment" nextDisabled={!choice} />
      </form>
    </StepCard>
  );
}

/* ---------------- 4. Payment ---------------- */

function cardBrand(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return 'Card';
}

function formatCardNumber(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}

export function PaymentStep() {
  const { t } = useI18n();
  const checkout = useCheckout();
  const [method, setMethod] = useState(checkout.paymentMethod ?? 'card');
  const [applePayOpen, setApplePayOpen] = useState(false);
  const [applePayState, setApplePayState] = useState<'idle' | 'processing' | 'done'>('idle');
  const totalWithCod = checkout.totals.total - checkout.totals.codFee * 1.05 + COD_FEE * 1.05;
  const codBlocked = totalWithCod > 3000;
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { cardNumber: '', expiry: '', cvv: '', cardholder: checkout.card?.holder ?? '' },
  });
  const brand = cardBrand(watch('cardNumber') ?? '');

  const proceed = () => {
    checkout.next();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'card') {
      void handleSubmit((v) => {
        // Keep only brand + last 4 digits. The full number and CVV are discarded here.
        const digits = v.cardNumber.replace(/\D/g, '');
        checkout.update({ paymentMethod: 'card', card: { brand: cardBrand(digits), last4: digits.slice(-4), holder: v.cardholder.trim() }, applePayAuthorised: false });
        proceed();
      })();
    } else if (method === 'apple-pay') {
      if (checkout.applePayAuthorised && checkout.paymentMethod === 'apple-pay') proceed();
      else setApplePayOpen(true);
    } else {
      if (codBlocked) return;
      checkout.update({ paymentMethod: 'cod', card: null, applePayAuthorised: false });
      proceed();
    }
  };

  const authoriseApplePay = () => {
    setApplePayState('processing');
    window.setTimeout(() => {
      setApplePayState('done');
      window.setTimeout(() => {
        checkout.update({ paymentMethod: 'apple-pay', applePayAuthorised: true, card: null });
        setApplePayOpen(false);
        setApplePayState('idle');
        proceed();
      }, 700);
    }, 1300);
  };

  const icons = { card: <CreditCard className="h-5 w-5" />, 'apple-pay': <ScanFace className="h-5 w-5" />, cod: <Banknote className="h-5 w-5" /> };

  return (
    <StepCard title={t.checkout.payment} description={t.checkout.secureNote} icon={<Lock className="h-5 w-5" />}>
      <form onSubmit={onSubmit} noValidate>
        <fieldset className="grid gap-3">
          <legend className="sr-only">{t.checkout.payment}</legend>
          {PAYMENT_METHODS.map((pm) => (
            <RadioCard
              key={pm.id}
              name="payment"
              checked={method === pm.id}
              onChange={() => setMethod(pm.id)}
              disabled={pm.id === 'cod' && codBlocked}
              icon={icons[pm.id]}
              label={pm.name}
              description={pm.id === 'cod' && codBlocked ? 'Available for orders up to AED 3,000' : pm.description}
              trailing={pm.fee ? '+' + formatPrice(pm.fee) : undefined}
            >
              <AnimatePresence initial={false}>
                {method === pm.id && pm.id === 'card' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid gap-4 pt-2 sm:grid-cols-2">
                      <Input
                        label="Card number"
                        required
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        wrapperClassName="sm:col-span-2"
                        error={errors.cardNumber?.message}
                        rightSlot={<span className="pe-2 text-xs font-bold text-fg-subtle">{brand}</span>}
                        {...register('cardNumber', { onChange: (e) => setValue('cardNumber', formatCardNumber(e.target.value)) })}
                      />
                      <Input label="Expiry (MM/YY)" required inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" error={errors.expiry?.message} {...register('expiry', { onChange: (e) => setValue('expiry', formatExpiry(e.target.value)) })} />
                      <Input label="CVV" required type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="•••" error={errors.cvv?.message} {...register('cvv')} />
                      <Input label="Cardholder name" required autoComplete="cc-name" wrapperClassName="sm:col-span-2" error={errors.cardholder?.message} {...register('cardholder')} />
                    </div>
                    <InlineAlert tone="info" className="mt-4 text-xs">
                      {t.checkout.cardTestHint}
                    </InlineAlert>
                    {checkout.card && (
                      <p className="mt-2 text-xs text-fg-subtle">
                        Previously entered: {checkout.card.brand} •••• {checkout.card.last4} — for your security, please re-enter your card details.
                      </p>
                    )}
                  </motion.div>
                )}
                {method === pm.id && pm.id === 'apple-pay' && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ps-16 text-xs text-fg-muted">
                    {checkout.applePayAuthorised ? '✓ Apple Pay authorised' : t.checkout.applePayNote}
                  </motion.p>
                )}
                {method === pm.id && pm.id === 'cod' && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ps-16 text-xs text-fg-muted">
                    {t.checkout.codNote}
                  </motion.p>
                )}
              </AnimatePresence>
            </RadioCard>
          ))}
        </fieldset>
        <StepNav onBack={checkout.back} nextLabel={method === 'apple-pay' && !checkout.applePayAuthorised ? t.checkout.applePayButton : 'Review order'} nextDisabled={method === 'cod' && codBlocked} />
      </form>

      <Modal open={applePayOpen} onClose={() => applePayState === 'idle' && setApplePayOpen(false)} size="sm" title="Apple Pay" hideTitle>
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex w-full items-center justify-between rounded-2xl bg-surface-muted p-4">
            <span className="flex items-center gap-2 text-sm font-bold text-fg">
              <LogoMark size={28} animate={false} /> SportSouq
            </span>
            <span className="font-display text-lg font-extrabold text-fg">{formatPrice(checkout.totals.total - checkout.totals.codFee * 1.05, { decimals: true })}</span>
          </div>
          <motion.div
            animate={applePayState === 'processing' ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={cn('flex h-20 w-20 items-center justify-center rounded-full', applePayState === 'done' ? 'bg-success-600 text-white' : 'bg-ink-950 text-white dark:bg-white dark:text-ink-950')}
          >
            {applePayState === 'done' ? <Check className="h-10 w-10" strokeWidth={3} /> : <ScanFace className="h-10 w-10" />}
          </motion.div>
          <p className="text-sm font-semibold text-fg" role="status">
            {applePayState === 'idle' ? 'Confirm with Face ID' : applePayState === 'processing' ? 'Authorising…' : 'Done'}
          </p>
          <Button fullWidth size="lg" variant="secondary" onClick={authoriseApplePay} loading={applePayState === 'processing'} disabled={applePayState !== 'idle'} data-autofocus>
            Confirm payment
          </Button>
          <p className="text-[11px] text-fg-subtle">Simulated Apple Pay sheet — no real payment is taken.</p>
        </div>
      </Modal>
    </StepCard>
  );
}

/* ---------------- 5. Review ---------------- */

export function ReviewStep({ onPlace, placing, error }: { onPlace: () => void; placing: boolean; error: string | null }) {
  const { t } = useI18n();
  const checkout = useCheckout();
  const cart = useCart();
  const payLabel =
    checkout.paymentMethod === 'card' && checkout.card
      ? checkout.card.brand + ' •••• ' + checkout.card.last4
      : checkout.paymentMethod === 'apple-pay'
        ? 'Apple Pay'
        : 'Cash on Delivery';
  const block = (title: string, step: CheckoutStep, content: React.ReactNode) => (
    <div className="rounded-2xl border border-line p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{title}</h3>
        <button type="button" onClick={() => checkout.goTo(step)} className="text-xs font-bold text-brand-600 hover:underline">
          {t.checkout.edit}
        </button>
      </div>
      {content}
    </div>
  );
  return (
    <StepCard title={t.checkout.review} description="Please confirm everything looks right." icon={<Check className="h-5 w-5" />}>
      <div className="grid gap-3 sm:grid-cols-2">
        {checkout.customer &&
          block(
            t.checkout.contactLabel,
            'contact',
            <p className="text-sm text-fg-muted">
              <span className="font-semibold text-fg">{checkout.customer.firstName} {checkout.customer.lastName}</span>
              <br />
              {checkout.customer.email}
              <br />
              {checkout.customer.phone}
            </p>,
          )}
        {checkout.address && block(t.checkout.deliverTo, 'address', <AddressSummary address={checkout.address} />)}
        {checkout.selectedQuote &&
          block(
            t.checkout.deliveryMethod,
            'delivery',
            <p className="text-sm text-fg-muted">
              <span className="font-semibold text-fg">{checkout.selectedQuote.method.name}</span> · {checkout.selectedQuote.fee ? formatPrice(checkout.selectedQuote.fee) : t.cart.free}
              <br />
              Arrives {checkout.selectedQuote.label}
            </p>,
          )}
        {block(t.checkout.payWith, 'payment', <p className="text-sm font-semibold text-fg">{payLabel}</p>)}
      </div>
      <div className="mt-5 rounded-2xl border border-line">
        <h3 className="border-b border-line px-4 py-3 text-xs font-bold uppercase tracking-wider text-fg-subtle">
          {t.checkout.items} ({cart.count})
        </h3>
        <ul className="divide-y divide-line">
          {cart.items.map((i) => (
            <li key={i.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-semibold text-fg">{i.name}</span>
                <span className="text-xs text-fg-muted">
                  {[i.attributes.color, i.attributes.size && 'Size ' + i.attributes.size, i.attributes.config].filter(Boolean).join(' · ')} × {i.quantity}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
      {error && (
        <InlineAlert tone="danger" className="mt-5">
          <p className="font-bold">{t.checkout.failed}</p>
          <p className="mt-0.5">{error}</p>
        </InlineAlert>
      )}
      <p className="mt-5 text-xs text-fg-subtle">{t.checkout.terms}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={checkout.back} leftIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}>
          {t.common.back}
        </Button>
        <Button size="lg" onClick={onPlace} loading={placing} leftIcon={!placing ? <Lock className="h-4 w-4" /> : undefined}>
          {placing ? t.checkout.placing : t.checkout.placeOrder + ' · ' + formatPrice(checkout.totals.total, { decimals: true })}
        </Button>
      </div>
    </StepCard>
  );
}
