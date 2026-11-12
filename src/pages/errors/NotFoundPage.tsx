import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { SPORTS } from '@/data/sports';
import { ButtonLink } from '@/components/ui/Button';
import { SportIcon } from '@/components/common/SportIcon';

export function NotFoundContent() {
  const { t } = useI18n();
  return (
    <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
      <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="font-display text-[7rem] font-black leading-none tracking-tighter text-fg sm:text-[10rem]">
        4<span className="text-brand-600">0</span>4
      </motion.p>
      <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">{t.errors.notFoundTitle}</h1>
      <p className="mt-3 max-w-md text-fg-muted">{t.errors.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" leftIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}>
          {t.common.home}
        </ButtonLink>
        <ButtonLink to="/search" variant="outline" leftIcon={<Search className="h-4 w-4" />}>
          {t.common.search}
        </ButtonLink>
      </div>
      <ul className="mt-12 flex max-w-2xl flex-wrap justify-center gap-2">
        {SPORTS.map((s) => (
          <li key={s.slug}>
            <Link to={'/sport/' + s.slug} className="flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg hover:border-fg">
              <SportIcon name={s.icon} className="h-4 w-4 text-brand-600" /> {s.slug === 'boxing' ? 'Boxing' : s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useI18n();
  useSeo({ title: t.errors.notFoundTitle, noindex: true });
  return <NotFoundContent />;
}
