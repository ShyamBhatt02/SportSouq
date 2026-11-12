import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send, Users, Warehouse, Zap } from 'lucide-react';
import { contactSchema, type ContactValues } from '@/schemas';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { miscService } from '@/services/orderService';
import { getErrorMessage } from '@/services/api/client';
import { SITE } from '@/config/site';
import { SafeImage } from '@/components/ui/SafeImage';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Accordion } from '@/components/ui/Disclosure';
import { SportBanner } from '@/components/sports/SportComponents';
import { SectionHeading } from '@/components/common/Section';
import { DeliveryPerks } from '@/components/common/DeliveryPerks';

/* ---------------- About ---------------- */

export function AboutPage() {
  useSeo({ title: 'About SportSouq', description: 'SportSouq is a UAE sports e-commerce platform delivering authentic gear to all seven emirates from our Dubai fulfilment centre.' });
  const stats = [
    { value: '40,000+', label: 'Athletes served' },
    { value: '7', label: 'Emirates, every day' },
    { value: '20', label: 'Leading brands' },
    { value: '4.8/5', label: 'Average rating' },
  ];
  return (
    <>
      <SportBanner
        title="Built in the UAE, for UAE athletes"
        eyebrow="Our story"
        description="SportSouq started with a simple frustration: finding the right boots, bats and running shoes in the UAE meant mall-hopping, inconsistent prices and long waits. We built the store we wanted to shop at."
        image="cyclingPeloton"
        crumbs={[{ label: 'About' }]}
        stats={stats.map((s) => ({ label: s.label, value: s.value }))}
      />
      <div className="container-page py-14">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="What we believe" title="Sport belongs to everyone" />
            <div className="space-y-4 leading-relaxed text-fg-muted">
              <p>From a Friday five-a-side in Al Quoz to a sunrise run on Kite Beach, from cricket nets in Sharjah to a Hatta mountain trail — the UAE is one of the most active, diverse sporting communities in the world.</p>
              <p>We stock only authentic gear from authorised distributors, price everything transparently in dirhams, and invest in delivery that respects your time: same-day in Dubai and next day to most of the country.</p>
              <p>Our team of coaches, runners and club players test what we sell and help you choose — on chat, WhatsApp or the phone.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SafeImage src="footballKids" alt="Young footballers with their coach" width={500} ratio={1.2} wrapperClassName="rounded-3xl aspect-[5/6]" />
            <SafeImage src="runningGroup" alt="Runners training together" width={500} ratio={1.2} wrapperClassName="mt-12 rounded-3xl aspect-[5/6]" />
          </div>
        </section>

        <section id="stores" className="mt-20 scroll-mt-28 rounded-[2rem] bg-surface-muted p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { icon: Warehouse, title: 'Dubai fulfilment centre', text: '6,000 m² in Al Quoz with climate-controlled storage so rubber, foam and electronics arrive in perfect condition.' },
              { icon: Zap, title: 'Same-day delivery', text: 'Our own fleet covers Dubai with same-day slots; trusted partners deliver next day to Abu Dhabi and Sharjah.' },
              { icon: Users, title: 'Community first', text: 'We sponsor academies, run clubs and grassroots tournaments across the Emirates every season.' },
            ].map((b) => (
              <div key={b.title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <b.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-fg">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="athletes" className="mt-20 scroll-mt-28">
          <SectionHeading eyebrow="Community & athletes" title="Proud partners of UAE grassroots sport" description="Team kit, academy discounts and corporate wellness programmes — talk to our team orders desk." action={{ label: 'Contact team orders', to: '/contact' }} />
          <div className="grid gap-4 sm:grid-cols-3">
            {['cricketBatsman', 'boxingWoman', 'swimButterfly'].map((img) => (
              <SafeImage key={img} src={img} alt="" width={600} ratio={0.8} wrapperClassName="rounded-3xl aspect-[5/4]" />
            ))}
          </div>
        </section>
        <DeliveryPerks perks={['free', 'sameDay', 'cod', 'returns', 'secure', 'authentic']} className="mt-16 lg:grid-cols-3" />
      </div>
    </>
  );
}

/* ---------------- Contact ---------------- */

const FAQ = [
  { q: 'How fast is delivery?', a: 'Dubai orders placed before 2pm arrive the same day. Abu Dhabi and Sharjah take 1–2 business days; Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain take 2–3 business days. We deliver Monday to Saturday.' },
  { q: 'Is delivery free?', a: 'Standard delivery is free on orders above AED 200 to every emirate. Below that, standard delivery is AED 15. Express (AED 30) and same-day Dubai (AED 45) are also available.' },
  { q: 'Can I pay cash on delivery?', a: 'Yes — Cash on Delivery is available across all seven emirates for orders up to AED 3,000. A AED 10 handling fee applies. Our drivers also accept card payments at the door.' },
  { q: 'What is your return policy?', a: 'Return unworn items in their original packaging within 30 days for a full refund. We collect free from your door anywhere in the UAE. Refunds are processed within 5–7 business days of collection.' },
  { q: 'Are your products authentic?', a: 'Always. We buy directly from brands and their authorised regional distributors, and every product carries the manufacturer’s warranty.' },
  { q: 'Do prices include VAT?', a: 'Product prices are shown before 5% UAE VAT, which is calculated and shown separately at checkout. Your tax invoice (TRN 100 4567 8900 003) is emailed with your order confirmation.' },
];

export function ContactPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [ticket, setTicket] = useState<string | null>(null);
  useSeo({ title: 'Contact us', description: 'Get help with orders, delivery, returns and product advice. Chat, WhatsApp or call SportSouq customer care, Mon–Sat 9am–9pm.' });
  const order = params.get('order') ?? '';
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', topic: order ? 'order' : 'product', orderNumber: order, message: '' },
  });
  const onSubmit = handleSubmit(async (v) => {
    try {
      const res = await miscService.contact(v);
      setTicket(res.ticket);
      toast.success(t.toast.messageSent, { description: 'Ticket ' + res.ticket });
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  const channels = [
    { icon: Phone, title: 'Call us', value: SITE.supportPhone, href: 'tel:' + SITE.supportPhone.replace(/\s/g, '') },
    { icon: MessageCircle, title: 'WhatsApp', value: SITE.whatsapp, href: 'https://wa.me/' + SITE.whatsapp.replace(/\D/g, '') },
    { icon: Mail, title: 'Email', value: SITE.supportEmail, href: 'mailto:' + SITE.supportEmail },
    { icon: Clock, title: 'Hours', value: SITE.hours },
  ];

  return (
    <>
      <div className="border-b border-line bg-surface-muted/60">
        <div className="container-page py-10">
          <Breadcrumb items={[{ label: 'Contact' }]} />
          <h1 className="mt-3 text-3xl font-black tracking-tight text-fg sm:text-4xl">How can we help?</h1>
          <p className="mt-2 max-w-xl text-fg-muted">Our UAE-based team replies within 24 hours — usually much faster.</p>
        </div>
      </div>
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          {channels.map((c) => {
            const content = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-fg-subtle">{c.title}</span>
                  <span className="block font-bold text-fg">{c.value}</span>
                </span>
              </>
            );
            return c.href ? (
              <a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-fg">
                {content}
              </a>
            ) : (
              <div key={c.title} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                {content}
              </div>
            );
          })}
          <div className="flex items-start gap-4 rounded-2xl bg-surface-muted p-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <p className="text-sm text-fg-muted">{SITE.address}</p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <section className="rounded-3xl border border-line bg-surface p-5 sm:p-8" aria-labelledby="form-h">
            <h2 id="form-h" className="text-xl font-extrabold text-fg">
              Send us a message
            </h2>
            {ticket ? (
              <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center" role="status">
                <CheckCircle2 className="h-12 w-12 text-success-600" aria-hidden="true" />
                <p className="text-lg font-bold text-fg">Thanks — we’ve got your message.</p>
                <p className="text-sm text-fg-muted">
                  Your reference is <span className="font-mono font-bold text-fg">{ticket}</span>. We’ll reply by email within 24 hours.
                </p>
                <Button variant="outline" onClick={() => setTicket(null)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input label="Your name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
                <Select
                  label="Topic"
                  required
                  options={[
                    { value: 'order', label: 'An existing order' },
                    { value: 'product', label: 'Product advice' },
                    { value: 'returns', label: 'Returns & exchanges' },
                    { value: 'partnership', label: 'Team / corporate orders' },
                    { value: 'other', label: 'Something else' },
                  ]}
                  error={errors.topic?.message}
                  {...register('topic')}
                />
                <Input label="Order number" hint="Optional, e.g. SS-20261111-1024" error={errors.orderNumber?.message} {...register('orderNumber')} />
                <Textarea label="Message" required rows={6} wrapperClassName="sm:col-span-2" maxLength={1500} error={errors.message?.message} {...register('message')} />
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" loading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </section>
          <section id="faq" className="mt-10 scroll-mt-28" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-2xl font-extrabold text-fg">
              Frequently asked questions
            </h2>
            <Accordion className="mt-4" items={FAQ.map((f, i) => ({ key: String(i), title: f.q, content: <p className="text-sm leading-relaxed text-fg-muted">{f.a}</p> }))} defaultOpen={['0']} />
            <ButtonLink to="/policies/shipping" variant="link" className="mt-4">
              Read our full delivery policy →
            </ButtonLink>
          </section>
        </div>
      </div>
    </>
  );
}
