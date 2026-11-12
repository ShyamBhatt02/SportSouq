import type { Brand } from '@/types';

/** Mock brand directory (demo data only — SportSouq is not affiliated with these brands). */
export const BRANDS: Brand[] = [
  { slug: 'nike', name: 'Nike', country: 'USA', founded: 1964 },
  { slug: 'adidas', name: 'Adidas', country: 'Germany', founded: 1949 },
  { slug: 'puma', name: 'Puma', country: 'Germany', founded: 1948 },
  { slug: 'under-armour', name: 'Under Armour', country: 'USA', founded: 1996 },
  { slug: 'new-balance', name: 'New Balance', country: 'USA', founded: 1906 },
  { slug: 'asics', name: 'ASICS', country: 'Japan', founded: 1949 },
  { slug: 'reebok', name: 'Reebok', country: 'UK', founded: 1958 },
  { slug: 'wilson', name: 'Wilson', country: 'USA', founded: 1914 },
  { slug: 'yonex', name: 'Yonex', country: 'Japan', founded: 1946 },
  { slug: 'kookaburra', name: 'Kookaburra', country: 'Australia', founded: 1890 },
  { slug: 'sg', name: 'SG', country: 'India', founded: 1931 },
  { slug: 'mrf', name: 'MRF', country: 'India', founded: 1946 },
  { slug: 'spalding', name: 'Spalding', country: 'USA', founded: 1876 },
  { slug: 'decathlon', name: 'Decathlon', country: 'France', founded: 1976 },
  { slug: 'garmin', name: 'Garmin', country: 'USA', founded: 1989 },
  { slug: 'speedo', name: 'Speedo', country: 'Australia', founded: 1914 },
  { slug: 'everlast', name: 'Everlast', country: 'USA', founded: 1910 },
  { slug: 'specialized', name: 'Specialized', country: 'USA', founded: 1974 },
  { slug: 'the-north-face', name: 'The North Face', country: 'USA', founded: 1966 },
  { slug: 'babolat', name: 'Babolat', country: 'France', founded: 1875 },
];

export const BRAND_NAMES = BRANDS.map((b) => b.name);
