import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { SPORTS } from '@/data/sports';
import { SITE } from '@/config/site';
import { Logo } from '@/components/common/Logo';
import { PaymentBadges, SocialLinks } from '@/components/common/BrandIcons';
import { DeliveryPerks } from '@/components/common/DeliveryPerks';

export function Footer() {
  const { t } = useI18n();
  const columns = [
    {
      title: t.footer.shop,
      links: [
        { to: '/shop', label: 'All products' },
        { to: '/deals', label: t.nav.deals },
        { to: '/new-arrivals', label: t.nav.newArrivals },
        { to: '/best-sellers', label: t.nav.bestSellers },
        { to: '/category/sportswear', label: 'Sportswear' },
        { to: '/category/sports-shoes', label: 'Sports Shoes' },
      ],
    },
    {
      title: t.footer.sports,
      links: SPORTS.slice(0, 7).map((s) => ({ to: '/sport/' + s.slug, label: s.name })),
    },
    {
      title: t.footer.support,
      links: [
        { to: '/contact', label: 'Contact us' },
        { to: '/account/orders', label: 'Track your order' },
        { to: '/policies/shipping', label: 'Delivery information' },
        { to: '/policies/returns', label: 'Returns & exchanges' },
        { to: '/contact#faq', label: 'FAQs' },
      ],
    },
    {
      title: t.footer.about,
      links: [
        { to: '/about', label: 'Our story' },
        { to: '/about#stores', label: 'Fulfilment centre' },
        { to: '/about#athletes', label: 'Community & athletes' },
        { to: '/contact', label: 'Corporate & team orders' },
      ],
    },
    {
      title: t.footer.policies,
      links: [
        { to: '/policies/terms', label: 'Terms of sale' },
        { to: '/policies/privacy', label: 'Privacy policy' },
        { to: '/policies/returns', label: 'Return policy' },
        { to: '/policies/warranty', label: 'Warranty' },
        { to: '/policies/shipping', label: 'Shipping policy' },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-ink-950 text-ink-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="border-b border-white/10">
        <div className="container-page py-6">
          <DeliveryPerks perks={['free', 'sameDay', 'cod', 'returns', 'authentic']} layout="row" tone="inverted" className="justify-between gap-y-4" />
        </div>
      </div>
      <div className="container-page grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo inverted animate={false} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
            The UAE’s home for performance sports gear. Authentic brands, AED pricing and fast delivery to all seven emirates — from the pitch to the pool to the peaks of Hatta.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
              <a href={'tel:' + SITE.supportPhone.replace(/\s/g, '')} className="hover:text-white">{SITE.supportPhone}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
              <span>WhatsApp {SITE.whatsapp}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
              <a href={'mailto:' + SITE.supportEmail} className="hover:text-white">{SITE.supportEmail}</a>
            </li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-bold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 sm:col-span-3 lg:col-span-5">
            <h3 className="text-sm font-bold text-white">{t.footer.social}</h3>
            <SocialLinks className="mt-4" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-400 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>{t.footer.rights(new Date().getFullYear())} · {t.footer.trn}</p>
            <p className="text-ink-500">{t.footer.demo}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-ink-500">{t.footer.paymentsAccepted}</span>
            <PaymentBadges />
          </div>
        </div>
      </div>
    </footer>
  );
}
