import { useSeo } from '@/hooks/useSeo';
import { SITE } from '@/config/site';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';
import { FeaturedSports, FlashDeals, Hero, Newsletter, ProductRow, ShoesCollection, ShopBySport, SportswearCollection, Testimonials, UaeDeals, WhySportSouq } from './HomeSections';

export function HomePage() {
  useSeo({
    title: 'SportSouq — Gear Up. Play Better. | Sports Store UAE',
    description: 'Premium sports gear and equipment delivered across the UAE. Football, cricket, running, fitness and more — AED pricing, same-day Dubai delivery and Cash on Delivery.',
    image: 'runningTrack',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      name: SITE.name,
      url: SITE.url,
      slogan: SITE.tagline,
      areaServed: 'AE',
      currenciesAccepted: 'AED',
      paymentAccepted: 'Credit Card, Apple Pay, Cash on Delivery',
      potentialAction: { '@type': 'SearchAction', target: SITE.url + '/search?q={search_term_string}', 'query-input': 'required name=search_term_string' },
    },
  });

  return (
    <>
      <Hero />
      <ShopBySport />
      <FlashDeals />
      <ProductRow flag="bestseller" eyebrow="Best sellers" title="What the UAE is buying" to="/best-sellers" sort="best-selling" />
      <ProductRow flag="newArrival" eyebrow="New arrivals" title="Fresh drops this month" to="/new-arrivals" sort="newest" />
      <FeaturedSports />
      <ShoesCollection />
      <SportswearCollection />
      <UaeDeals />
      <WhySportSouq />
      <div className="container-page">
        <ProductRecommendations kind="recently-viewed" />
      </div>
      <Testimonials />
      <Newsletter />
    </>
  );
}
