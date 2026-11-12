import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { SPORTS } from '@/data/sports';
import { PageHeader } from '@/components/common/Section';
import { Breadcrumb } from '@/components/ui/Navigation';
import { SportIcon } from '@/components/common/SportIcon';
import { ProductListing } from '@/components/product/ProductListing';

export function ShopPage() {
  const { t } = useI18n();
  useSeo({ title: 'Shop all sports gear', description: 'Browse the full SportSouq range — boots, bats, rackets, running shoes, fitness equipment and sportswear with AED pricing and fast UAE delivery.' });
  return (
    <>
      <PageHeader title={t.nav.shop} description="Every sport. Every level. Authentic gear from the world’s best brands, delivered across the UAE.">
        <Breadcrumb items={[{ label: t.nav.shop }]} />
      </PageHeader>
      <div className="container-page py-6">
        <nav aria-label="Quick sport links" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {SPORTS.map((s) => (
            <Link key={s.slug} to={'/sport/' + s.slug} className="flex shrink-0 items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg transition hover:border-fg">
              <SportIcon name={s.icon} className="h-4 w-4 text-brand-600" />
              {s.slug === 'boxing' ? 'Boxing' : s.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container-page pb-16">
        <ProductListing />
      </div>
    </>
  );
}
