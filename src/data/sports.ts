import type { Sport, SportFilterDefinition, SportSlug } from '@/types';

export const SPORTS: Sport[] = [
  {
    slug: 'football',
    name: 'Football',
    tagline: 'Own every touch.',
    description:
      'From Friday-night five-a-side in Al Quoz to league weekends in Abu Dhabi — boots for every surface, match balls, goalkeeper gear and training kit built for the UAE game.',
    image: 'footballBootBall',
    banner: 'footballStadiumLights',
    accent: '#16a34a',
    icon: 'football',
    hasCollection: true,
  },
  {
    slug: 'cricket',
    name: 'Cricket',
    tagline: 'Built for the long innings.',
    description:
      'English and Kashmir willow bats, certified helmets, pads and balls trusted by academy players and weekend league teams across Sharjah, Dubai and Abu Dhabi.',
    image: 'cricketBatsman',
    banner: 'cricketStadiumNight',
    accent: '#b45309',
    icon: 'cricket',
    hasCollection: true,
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    tagline: 'Rise above the rim.',
    description:
      'Indoor and outdoor balls, court shoes with responsive cushioning and breathable kit for pickup games, school teams and club leagues.',
    image: 'basketballBallCourt',
    banner: 'basketballArena',
    accent: '#ea580c',
    icon: 'basketball',
    hasCollection: false,
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    tagline: 'Every point, precisely.',
    description:
      'Rackets for every playing style, pressurised balls, all-court shoes and performance clothing designed for hot UAE courts.',
    image: 'tennisRacketYellow',
    banner: 'tennisClayAerial',
    accent: '#ca8a04',
    icon: 'tennis',
    hasCollection: true,
  },
  {
    slug: 'running',
    name: 'Running',
    tagline: 'Chase the sunrise.',
    description:
      'Road and trail shoes, GPS watches, hydration and heat-ready apparel for Kite Beach mornings, Al Qudra long runs and race-day PBs.',
    image: 'runningRoad',
    banner: 'runningGroup',
    accent: '#2563eb',
    icon: 'running',
    hasCollection: true,
  },
  {
    slug: 'fitness',
    name: 'Fitness',
    tagline: 'Stronger every session.',
    description:
      'Dumbbells, kettlebells, resistance bands, yoga mats and home-gym equipment to train hard whatever the temperature outside.',
    image: 'fitnessDumbbellGrip',
    banner: 'fitnessBarbell',
    accent: '#7c3aed',
    icon: 'fitness',
    hasCollection: true,
  },
  {
    slug: 'cycling',
    name: 'Cycling',
    tagline: 'Ride further.',
    description:
      'Road, gravel and city bikes, certified helmets, lights and kit for Al Qudra loops, Hudayriyat laps and the Jebel Jais climb.',
    image: 'bikeRoadWall',
    banner: 'cyclistsCoast',
    accent: '#0891b2',
    icon: 'cycling',
    hasCollection: false,
  },
  {
    slug: 'swimming',
    name: 'Swimming',
    tagline: 'Make waves.',
    description:
      'Chlorine-resistant swimwear, anti-fog goggles, caps and training aids for the pool, the open water at JBR and triathlon season.',
    image: 'swimCapGoggles',
    banner: 'swimLanesAerial',
    accent: '#0284c7',
    icon: 'swimming',
    hasCollection: false,
  },
  {
    slug: 'boxing',
    name: 'Boxing & Combat',
    tagline: 'Train like a fighter.',
    description:
      'Gloves, hand wraps, heavy bags and protective gear for boxing, Muay Thai and MMA — from first class to fight night.',
    image: 'boxingGlovesDark',
    banner: 'boxingPads',
    accent: '#dc2626',
    icon: 'boxing',
    hasCollection: false,
  },
  {
    slug: 'outdoor',
    name: 'Outdoor',
    tagline: 'Explore the Emirates.',
    description:
      'Hiking, camping and adventure gear for Hajar Mountain trails, desert camping in Liwa and winter weekends in Hatta.',
    image: 'hikingTrail',
    banner: 'mountainLake',
    accent: '#65a30d',
    icon: 'outdoor',
    hasCollection: false,
  },
];

export const SPORT_MAP = Object.fromEntries(SPORTS.map((s) => [s.slug, s])) as Record<SportSlug, Sport>;

export function getSport(slug: string | undefined): Sport | undefined {
  return SPORTS.find((s) => s.slug === slug);
}

/** Sport-specific attribute filters (rendered only when relevant). */
export const SPORT_FILTERS: SportFilterDefinition[] = [
  { sport: 'football', key: 'bootType', label: 'Boot type', options: ['Speed', 'Control', 'Touch', 'Junior'] },
  { sport: 'football', key: 'surface', label: 'Surface', options: ['Firm Ground', 'Artificial Grass', 'Turf', 'Indoor Court'] },
  { sport: 'cricket', key: 'batType', label: 'Bat type', options: ['English Willow', 'Kashmir Willow'] },
  { sport: 'cricket', key: 'batSize', label: 'Bat size', options: ['Size 5', 'Size 6', 'Harrow', 'Short Handle', 'Long Handle'] },
  { sport: 'running', key: 'runningType', label: 'Running type', options: ['Road', 'Trail', 'Race', 'Track'] },
  { sport: 'tennis', key: 'racketWeight', label: 'Racket weight', options: ['Light (under 285g)', 'Medium (285–300g)', 'Heavy (over 300g)'] },
  { sport: 'fitness', key: 'equipmentType', label: 'Equipment type', options: ['Free Weights', 'Resistance', 'Yoga & Recovery', 'Cardio', 'Strength Accessories'] },
];

export function getSportFilters(sports: string[]): SportFilterDefinition[] {
  return SPORT_FILTERS.filter((f) => sports.includes(f.sport));
}
