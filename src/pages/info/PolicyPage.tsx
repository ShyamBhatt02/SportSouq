import { NavLink, useParams } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { Breadcrumb } from '@/components/ui/Navigation';
import { NotFoundContent } from '@/pages/errors/NotFoundPage';
import { cn } from '@/utils/cn';

interface Policy {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: 'Delivery & shipping policy',
    updated: '1 October 2026',
    intro: 'We deliver to every address in the seven emirates of the UAE, Monday to Saturday.',
    sections: [
      { heading: 'Delivery times', body: ['Dubai: same-day for orders placed before 2:00pm GST (Mon–Sat), otherwise next business day.', 'Abu Dhabi and Sharjah: 1–2 business days.', 'Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain: 2–3 business days.', 'Large items such as bicycles, spin bikes and basketball hoops: 2–4 business days with a two-person crew.'] },
      { heading: 'Delivery fees', body: ['Standard delivery is free on orders above AED 200; otherwise AED 15.', 'Express delivery: AED 30. Same-day delivery (Dubai only): AED 45.', 'Cash on Delivery orders carry an AED 10 handling fee. All fees are subject to 5% VAT.'] },
      { heading: 'Tracking', body: ['You will receive SMS and email updates when your order ships and when it is out for delivery. Signed-in customers can follow every step under My account → Orders.'] },
    ],
  },
  returns: {
    title: 'Returns & exchanges',
    updated: '1 October 2026',
    intro: 'Changed your mind? You have 30 days from delivery to return eligible items for a full refund.',
    sections: [
      { heading: 'Eligibility', body: ['Items must be unused, unwashed and in original packaging with tags attached.', 'Footwear must be tried on indoors only. Personalised items, opened swimwear (for hygiene reasons) and mouthguards cannot be returned unless faulty.'] },
      { heading: 'How to return', body: ['Contact customer care or reply to your order email to book a free collection. Our courier collects from any UAE address.', 'Refunds are issued to the original payment method within 5–7 business days of collection. COD orders are refunded by bank transfer.'] },
      { heading: 'Exchanges', body: ['Need a different size? Request an exchange and we will deliver the new item when we collect the original, subject to stock.'] },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    updated: '1 October 2026',
    intro: 'We respect your privacy and handle personal data in line with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data.',
    sections: [
      { heading: 'What we collect', body: ['Contact details, delivery addresses and order history needed to fulfil your orders.', 'We never store full card numbers or security codes — payment data is handled by our PCI-DSS certified payment partner.'] },
      { heading: 'How we use it', body: ['To process and deliver orders, provide customer support, prevent fraud and — only with your consent — send offers and newsletters.'] },
      { heading: 'Your rights', body: ['You can access, correct or delete your personal data at any time from your account or by emailing care@sportsouq.ae.'] },
    ],
  },
  terms: {
    title: 'Terms of sale',
    updated: '1 October 2026',
    intro: 'These terms apply to purchases made on SportSouq by customers in the United Arab Emirates.',
    sections: [
      { heading: 'Pricing', body: ['All prices are in UAE Dirhams (AED). Product prices are shown excluding 5% VAT, which is added at checkout and shown on your tax invoice.', 'We reserve the right to correct pricing errors; if an error affects your order we will contact you before dispatch.'] },
      { heading: 'Orders', body: ['Your order is confirmed when you receive an order confirmation email. We may cancel orders affected by stock errors or suspected fraud, with a full refund.'] },
      { heading: 'Coupons', body: ['One coupon per order. Coupons cannot be exchanged for cash and are subject to their individual minimum spend, expiry and usage conditions.'] },
    ],
  },
  warranty: {
    title: 'Warranty',
    updated: '1 October 2026',
    intro: 'Every product sold on SportSouq is covered by the manufacturer’s warranty.',
    sections: [
      { heading: 'Coverage', body: ['Electronics such as GPS watches and bike lights: 12–24 months depending on the brand.', 'Footwear and apparel: 6 months against manufacturing defects.', 'Fitness equipment and bicycles: frame and structural warranties as specified by the manufacturer.'] },
      { heading: 'Making a claim', body: ['Contact customer care with your order number and photos of the issue. We will arrange inspection, repair or replacement with the brand on your behalf.'] },
    ],
  },
};

export function PolicyPage() {
  const { slug } = useParams();
  const policy = slug ? POLICIES[slug] : undefined;
  useSeo({ title: policy?.title ?? 'Policy', description: policy?.intro, noindex: !policy });
  if (!policy) return <NotFoundContent />;
  return (
    <div className="container-page py-10 pb-16">
      <Breadcrumb items={[{ label: 'Policies' }, { label: policy.title }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Policies" className="flex gap-2 overflow-x-auto lg:flex-col">
          {Object.entries(POLICIES).map(([key, p]) => (
            <NavLink key={key} to={'/policies/' + key} className={({ isActive }) => cn('shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold', isActive ? 'bg-fg text-canvas' : 'text-fg-muted hover:bg-surface-muted hover:text-fg')}>
              {p.title}
            </NavLink>
          ))}
        </nav>
        <article className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-fg sm:text-4xl">{policy.title}</h1>
          <p className="mt-2 text-xs text-fg-subtle">Last updated {policy.updated}</p>
          <p className="mt-6 text-lg leading-relaxed text-fg-muted">{policy.intro}</p>
          {policy.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="text-xl font-bold text-fg">{s.heading}</h2>
              <ul className="mt-3 list-disc space-y-2 ps-5 leading-relaxed text-fg-muted marker:text-brand-600">
                {s.body.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
