import type { Category, CategorySlug, Subcategory } from '@/types';

type SubSeed = [slug: string, name: string, image: string];

function subs(category: CategorySlug, list: SubSeed[]): Subcategory[] {
  return list.map(([slug, name, image]) => ({ slug, name, category, image }));
}

export const CATEGORIES: Category[] = [
  {
    slug: 'football',
    name: 'Football',
    shortName: 'Football',
    isSport: true,
    image: 'footballBootBall',
    description: 'Boots, balls, jerseys and protection for every level of the beautiful game.',
    subcategories: subs('football', [
      ['football-boots', 'Football Boots', 'footballBootStep'],
      ['footballs', 'Footballs', 'footballBallGrass'],
      ['football-jerseys', 'Jerseys', 'footballJersey'],
      ['shin-guards', 'Shin Guards', 'footballDribble'],
      ['goalkeeper-equipment', 'Goalkeeper Equipment', 'footballStadiumBall'],
      ['football-training', 'Training Equipment', 'footballTrainingBalls'],
      ['football-accessories', 'Football Accessories', 'footballTouch'],
    ]),
  },
  {
    slug: 'cricket',
    name: 'Cricket',
    shortName: 'Cricket',
    isSport: true,
    image: 'cricketBatsman',
    description: 'Willow, leather and protection for nets sessions and match days.',
    subcategories: subs('cricket', [
      ['cricket-bats', 'Cricket Bats', 'cricketBatsman'],
      ['cricket-balls', 'Cricket Balls', 'cricketBallGrass'],
      ['batting-gloves', 'Batting Gloves', 'cricketGlovesBall'],
      ['cricket-helmets', 'Cricket Helmets', 'cricketStadiumNight'],
      ['cricket-pads', 'Cricket Pads', 'cricketGround'],
      ['cricket-shoes', 'Cricket Shoes', 'shoeWhiteCourt'],
      ['cricket-bags', 'Cricket Bags', 'backpackRugged'],
      ['cricket-accessories', 'Cricket Accessories', 'cricketStadiumDusk'],
    ]),
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    shortName: 'Basketball',
    isSport: true,
    image: 'basketballBallCourt',
    description: 'Court-ready shoes, grippy balls and breathable kit.',
    subcategories: subs('basketball', [
      ['basketball-shoes', 'Basketball Shoes', 'shoeRedHigh'],
      ['basketballs', 'Basketballs', 'basketballBallCourt'],
      ['basketball-jerseys', 'Jerseys', 'basketballDunk'],
      ['basketball-shorts', 'Shorts', 'basketballHoopNight'],
      ['basketball-training', 'Training Equipment', 'basketballRim'],
      ['basketball-accessories', 'Accessories', 'basketballNet'],
    ]),
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    shortName: 'Tennis',
    isSport: true,
    image: 'tennisRacketYellow',
    description: 'Rackets, balls, shoes and apparel for every surface.',
    subcategories: subs('tennis', [
      ['tennis-rackets', 'Tennis Rackets', 'tennisRacketBlue'],
      ['tennis-balls', 'Tennis Balls', 'tennisBallMotion'],
      ['tennis-shoes', 'Tennis Shoes', 'shoeWhiteCourt'],
      ['tennis-clothing', 'Tennis Clothing', 'tennisCourtSit'],
      ['tennis-grips', 'Grips', 'tennisRacketClay'],
      ['tennis-bags', 'Bags', 'backpackNavy'],
      ['tennis-accessories', 'Accessories', 'tennisBallHand'],
    ]),
  },
  {
    slug: 'running',
    name: 'Running',
    shortName: 'Running',
    isSport: true,
    image: 'runningRoad',
    description: 'Shoes, watches and heat-ready kit for road, trail and track.',
    subcategories: subs('running', [
      ['running-shoes', 'Running Shoes', 'shoeLime'],
      ['running-clothing', 'Running Clothing', 'runningStairs'],
      ['running-watches', 'Running Watches', 'watchWrist'],
      ['hydration', 'Hydration', 'bottleGreen'],
      ['running-accessories', 'Running Accessories', 'headphones'],
    ]),
  },
  {
    slug: 'fitness',
    name: 'Fitness',
    shortName: 'Fitness',
    isSport: true,
    image: 'fitnessDumbbellGrip',
    description: 'Strength, conditioning, yoga and recovery equipment for home and gym.',
    subcategories: subs('fitness', [
      ['dumbbells', 'Dumbbells', 'hexDumbbells'],
      ['kettlebells', 'Kettlebells', 'fitnessRopes'],
      ['resistance-bands', 'Resistance Bands', 'dumbbellsBand'],
      ['yoga-mats', 'Yoga Mats', 'yogaMatRoll'],
      ['exercise-equipment', 'Exercise Equipment', 'spinBikes'],
      ['fitness-accessories', 'Fitness Accessories', 'abRoller'],
    ]),
  },
  {
    slug: 'cycling',
    name: 'Cycling',
    shortName: 'Cycling',
    isSport: true,
    image: 'bikeRoadWall',
    description: 'Bikes, helmets, lights and kit for road, gravel and city riding.',
    subcategories: subs('cycling', [
      ['bicycles', 'Bicycles', 'bikeBlack'],
      ['cycling-helmets', 'Helmets', 'cyclistsCoast'],
      ['cycling-jerseys', 'Cycling Jerseys', 'cyclingPeloton'],
      ['cycling-shorts', 'Cycling Shorts', 'cyclistForest'],
      ['cycling-gloves', 'Gloves', 'bikeGravel'],
      ['cycling-lights', 'Lights', 'bikeUrban'],
      ['cycling-accessories', 'Cycling Accessories', 'bikeStudio'],
    ]),
  },
  {
    slug: 'swimming',
    name: 'Swimming',
    shortName: 'Swimming',
    isSport: true,
    image: 'swimCapGoggles',
    description: 'Swimwear, goggles, caps and training aids for pool and open water.',
    subcategories: subs('swimming', [
      ['swimwear', 'Swimwear', 'swimLane'],
      ['goggles', 'Goggles', 'swimCapGoggles'],
      ['swimming-caps', 'Swimming Caps', 'swimButterfly'],
      ['swimming-training', 'Training Equipment', 'swimLanesAerial'],
      ['swim-towels', 'Towels', 'swimDive'],
      ['swimming-accessories', 'Swimming Accessories', 'swimOpenWater'],
    ]),
  },
  {
    slug: 'boxing',
    name: 'Boxing & Combat',
    shortName: 'Boxing',
    isSport: true,
    image: 'boxingGlovesDark',
    description: 'Gloves, wraps, bags and protection for striking sports.',
    subcategories: subs('boxing', [
      ['boxing-gloves', 'Boxing Gloves', 'boxingGloveFloor'],
      ['punch-bags', 'Punch Bags', 'boxingClass'],
      ['hand-wraps', 'Hand Wraps', 'boxingWoman'],
      ['head-guards', 'Head Guards', 'boxingPads'],
      ['protective-equipment', 'Protective Equipment', 'boxingGloveBench'],
      ['combat-training', 'Training Equipment', 'boxingGlovesDark'],
    ]),
  },
  {
    slug: 'outdoor',
    name: 'Outdoor',
    shortName: 'Outdoor',
    isSport: true,
    image: 'hikingTrail',
    description: 'Hiking, camping and adventure essentials for the mountains and the desert.',
    subcategories: subs('outdoor', [
      ['hiking', 'Hiking', 'hikerValley'],
      ['camping', 'Camping', 'tentView'],
      ['outdoor-clothing', 'Outdoor Clothing', 'hikingTrail'],
      ['backpacks', 'Backpacks', 'backpackGreen'],
      ['outdoor-accessories', 'Outdoor Accessories', 'campfire'],
    ]),
  },
  {
    slug: 'sportswear',
    name: 'Sportswear',
    shortName: 'Sportswear',
    isSport: false,
    image: 'tracksuitYellow',
    description: 'Training tees, jerseys, shorts, tracksuits and layers for every workout.',
    subcategories: subs('sportswear', [
      ['t-shirts', 'T-Shirts', 'teeWhite'],
      ['jerseys', 'Jerseys', 'footballJersey'],
      ['shorts', 'Shorts', 'runningStairs'],
      ['tracksuits', 'Tracksuits', 'tracksuitYellow'],
      ['jackets', 'Jackets', 'bomberJacket'],
      ['leggings', 'Leggings', 'yogaPlank'],
      ['training-clothing', 'Training Clothing', 'hoodieGrey'],
    ]),
  },
  {
    slug: 'sports-shoes',
    name: 'Sports Shoes',
    shortName: 'Shoes',
    isSport: false,
    image: 'shoeRed',
    description: 'Performance footwear for the pitch, road, court and trail.',
    subcategories: subs('sports-shoes', [
      ['football-shoes', 'Football Shoes', 'footballBootStep'],
      ['running-shoes', 'Running Shoes', 'shoeLime'],
      ['basketball-shoes', 'Basketball Shoes', 'shoeRedHigh'],
      ['tennis-shoes', 'Tennis Shoes', 'shoeWhiteCourt'],
      ['training-shoes', 'Training Shoes', 'shoeGreyFloating'],
      ['outdoor-shoes', 'Outdoor Shoes', 'hikingBoots'],
    ]),
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<CategorySlug, Category>;

export const ALL_SUBCATEGORIES: Subcategory[] = CATEGORIES.flatMap((c) => c.subcategories);

export function getCategory(slug: string | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategory(slug: string | undefined): Subcategory | undefined {
  return ALL_SUBCATEGORIES.find((s) => s.slug === slug);
}

export function subcategoryName(slug: string): string {
  return getSubcategory(slug)?.name ?? slug;
}
