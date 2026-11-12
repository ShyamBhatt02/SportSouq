import type {
  AgeGroup,
  CategorySlug,
  EmirateCode,
  Gender,
  Product,
  ProductColor,
  ProductVariant,
  SportSlug,
  VariantAxis,
} from '@/types';
import type { PhotoKey } from './images';
import { createRng, hashString } from '@/utils/random';
import { EMIRATE_CODES, LOW_STOCK_DEFAULT } from '@/config/site';
import { subcategoryName } from './categories';
import { SPORT_MAP } from './sports';

/* ---------------- Seed helpers ---------------- */

const C = {
  black: { name: 'Black', hex: '#111827' },
  white: { name: 'White', hex: '#f8fafc' },
  red: { name: 'Crimson', hex: '#dc2626' },
  orange: { name: 'Blaze Orange', hex: '#f97316' },
  volt: { name: 'Volt', hex: '#c6f432' },
  navy: { name: 'Navy', hex: '#1e3a8a' },
  blue: { name: 'Royal Blue', hex: '#2563eb' },
  sky: { name: 'Sky Blue', hex: '#38bdf8' },
  green: { name: 'Pitch Green', hex: '#15803d' },
  olive: { name: 'Olive', hex: '#556b2f' },
  grey: { name: 'Grey', hex: '#9ca3af' },
  charcoal: { name: 'Charcoal', hex: '#374151' },
  pink: { name: 'Rose', hex: '#f472b6' },
  purple: { name: 'Purple', hex: '#7c3aed' },
  yellow: { name: 'Sun Yellow', hex: '#facc15' },
  teal: { name: 'Teal', hex: '#0d9488' },
  sand: { name: 'Desert Sand', hex: '#d6c3a1' },
  natural: { name: 'Natural Willow', hex: '#e7d3a8' },
} satisfies Record<string, ProductColor>;

const SHOE = ['38', '39', '40', '41', '42', '43', '44', '45'];
const KIDS_SHOE = ['30', '31', '32', '33', '34', '35', '36'];
const CLOTH = ['S', 'M', 'L', 'XL', 'XXL'];
const CLOTH_W = ['XS', 'S', 'M', 'L', 'XL'];

type Flags = string; // f = featured, b = bestseller, n = new arrival, d = deal

interface Seed {
  n: string;
  b: string;
  s: SportSlug;
  c?: CategorySlug;
  sub: string;
  p: number;
  o?: number;
  r: number;
  rc: number;
  st: number;
  sales: number;
  f?: Flags;
  g?: Gender;
  a?: AgeGroup;
  img: PhotoKey[];
  col: ProductColor[];
  sizes?: string[];
  cfg?: [label: string, priceDelta: number][];
  gv?: Gender[];
  sd: string;
  ab: string;
  hl: string[];
  sp: Record<string, string>;
  at?: Record<string, string>;
  tags?: string[];
  also?: [CategorySlug, string][];
  bulky?: boolean;
  emirates?: EmirateCode[];
}

/* ---------------- Seeds (97 products) ---------------- */

const SEEDS: Seed[] = [
  // ===================== FOOTBALL =====================
  {
    n: 'Mercurial Vapor 16 Elite FG', b: 'Nike', s: 'football', sub: 'football-boots', p: 1099, o: 1299, r: 4.8, rc: 214, st: 36, sales: 820, f: 'fbd',
    g: 'men', img: ['footballBootStep', 'footballBootBall', 'footballKick'], col: [C.orange, C.black], sizes: SHOE,
    sd: 'Elite speed boot with a featherweight Vaporposite+ upper and Zoom Air unit for explosive first steps.',
    ab: 'Built for players who live on the shoulder of the last defender. The Vaporposite+ upper wraps the foot like a second skin, while a full-length plate with an integrated Zoom Air unit delivers snap off the mark on natural pitches.',
    hl: ['Zoom Air unit in the forefoot for responsive acceleration', 'Grippy Vaporposite+ upper for close control at speed', 'Chevron studs tuned for firm natural grass'],
    sp: { Surface: 'Firm Ground (FG)', 'Boot type': 'Speed', 'Upper material': 'Vaporposite+ mesh', Weight: '185 g (UK 9)', Closure: 'Lace-up with Flyknit collar' },
    at: { bootType: 'Speed', surface: 'Firm Ground' }, tags: ['boots', 'speed', 'firm ground', 'elite'], also: [['sports-shoes', 'football-shoes']],
  },
  {
    n: 'Predator Elite AG', b: 'Adidas', s: 'football', sub: 'football-boots', p: 949, r: 4.7, rc: 96, st: 28, sales: 310, f: 'nf',
    g: 'men', img: ['footballBootBall', 'footballTouch', 'footballStadiumLights'], col: [C.black, C.red], sizes: SHOE,
    sd: 'Control boot with Strikeskin rubber fins for extra bite on the ball — optimised for artificial grass.',
    ab: 'The Predator returns with Strikeskin fins across the instep for more swerve and spin on every pass and shot. An AG-specific stud layout with rounded studs reduces stud pressure on the artificial pitches common across UAE academies.',
    hl: ['Strikeskin rubber fins for spin and control', 'Rounded studs engineered for artificial grass', 'Fold-over tongue for a clean striking surface'],
    sp: { Surface: 'Artificial Grass (AG)', 'Boot type': 'Control', 'Upper material': 'Hybridtouch 2.0 synthetic', Weight: '230 g (UK 9)', Closure: 'Laceless with fold-over tongue' },
    at: { bootType: 'Control', surface: 'Artificial Grass' }, tags: ['boots', 'control', 'artificial grass'], also: [['sports-shoes', 'football-shoes']],
  },
  {
    n: 'Future 7 Pro TF', b: 'Puma', s: 'football', sub: 'football-boots', p: 449, o: 529, r: 4.5, rc: 158, st: 42, sales: 540, f: 'd',
    g: 'men', img: ['footballDribble', 'footballBootStep'], col: [C.blue, C.white], sizes: SHOE,
    sd: 'Agile, adaptive turf boot with a FUZIONFIT360 band for lockdown on five-a-side pitches.',
    ab: 'Made for the cages and turf pitches where most UAE weeknight games happen. A compression FUZIONFIT360 band hugs the midfoot, and the rubber turf outsole grips without catching, so you can cut and turn with confidence.',
    hl: ['Rubber turf outsole for five-a-side and cage football', 'Adaptive FUZIONFIT360 midfoot band', 'Cushioned insole for hard surfaces'],
    sp: { Surface: 'Turf (TF)', 'Boot type': 'Touch', 'Upper material': 'Knitted PWRTAPE upper', Weight: '255 g (UK 9)', Closure: 'Lace-up' },
    at: { bootType: 'Touch', surface: 'Turf' }, tags: ['boots', 'turf', 'five-a-side'], also: [['sports-shoes', 'football-shoes']],
  },
  {
    n: 'Copa Pure 2 League Junior FG', b: 'Adidas', s: 'football', sub: 'football-boots', p: 239, o: 279, r: 4.6, rc: 87, st: 33, sales: 290, f: 'd',
    g: 'kids', a: 'kids', img: ['footballKids', 'footballBallGrass'], col: [C.white, C.navy], sizes: KIDS_SHOE,
    sd: 'Soft-touch junior boot with a padded leather-feel forefoot for young players learning the game.',
    ab: 'A comfortable first proper boot for academy players. The soft synthetic forefoot gives a clean first touch, and a durable firm-ground soleplate keeps young feet stable through weekend tournaments.',
    hl: ['Soft padded forefoot for clean first touch', 'Durable FG soleplate', 'Easy-on heel pull tab for kids'],
    sp: { Surface: 'Firm Ground (FG)', 'Boot type': 'Junior', 'Upper material': 'Soft synthetic leather', Closure: 'Lace-up' },
    at: { bootType: 'Junior', surface: 'Firm Ground' }, tags: ['kids', 'junior', 'boots', 'academy'], also: [['sports-shoes', 'football-shoes']],
  },
  {
    n: 'Flight Premier Match Ball', b: 'Nike', s: 'football', sub: 'footballs', p: 649, o: 749, r: 4.9, rc: 302, st: 54, sales: 1180, f: 'fbd',
    g: 'unisex', img: ['footballBallGrass', 'footballMatchBall', 'footballStadiumBall'], col: [C.white], sizes: ['Size 5'],
    sd: 'FIFA Quality Pro match ball with Aerowsculpt grooves for a truer, more stable flight.',
    ab: 'The ball used at the highest level of the game. Moulded Aerowsculpt grooves disrupt airflow for a consistent flight, and a 4-layer casing with thermally bonded panels keeps its shape through a full season.',
    hl: ['FIFA Quality Pro certified', 'Aerowsculpt grooves for stable flight', 'Thermally bonded, water-resistant casing'],
    sp: { Certification: 'FIFA Quality Pro', Size: '5 (official match)', Construction: 'Thermally bonded 4-layer', Bladder: 'Butyl, high air retention' },
    tags: ['match ball', 'fifa quality pro', 'ball'],
  },
  {
    n: 'UCL Club Training Ball', b: 'Adidas', s: 'football', sub: 'footballs', p: 99, r: 4.6, rc: 412, st: 120, sales: 2100, f: 'b',
    g: 'unisex', img: ['footballBallClassic', 'footballTrainingBalls'], col: [C.white, C.blue], sizes: ['Size 3', 'Size 4', 'Size 5'],
    sd: 'Durable machine-stitched training ball with a butyl bladder — perfect for drills and park kickabouts.',
    ab: 'A tough, reliable training ball that holds its air and its shape. The machine-stitched TPU cover shrugs off concrete and turf, making it ideal for school PE, academy drills and evening games at the beach.',
    hl: ['Machine-stitched TPU cover', 'Butyl bladder for best air retention', 'Available in sizes 3, 4 and 5'],
    sp: { Construction: 'Machine-stitched', Cover: 'TPU', Bladder: 'Butyl', Use: 'Training & recreation' },
    tags: ['training ball', 'ball', 'kids'],
  },
  {
    n: 'teamFINAL Match Jersey', b: 'Puma', s: 'football', sub: 'football-jerseys', p: 189, o: 229, r: 4.4, rc: 64, st: 70, sales: 360, f: 'd',
    g: 'men', img: ['footballJersey', 'footballKids'], col: [C.red, C.white, C.navy], sizes: CLOTH,
    sd: 'Lightweight match jersey with dryCELL moisture management for 90 minutes in the heat.',
    ab: 'Engineered for club and school teams playing through UAE humidity. dryCELL fabric pulls sweat away from the skin, and mesh ventilation zones under the arms and down the back keep you cool from kick-off to final whistle.',
    hl: ['dryCELL moisture-wicking fabric', 'Mesh ventilation panels', 'Team printing ready (via our team orders desk)'],
    sp: { Material: '100% recycled polyester', Fit: 'Regular', Technology: 'dryCELL', Care: 'Machine wash 30°C' },
    tags: ['jersey', 'team kit', 'kit'], also: [['sportswear', 'jerseys']],
  },
  {
    n: 'Mercurial Lite Shin Guards', b: 'Nike', s: 'football', sub: 'shin-guards', p: 79, r: 4.5, rc: 233, st: 140, sales: 1550, f: 'b',
    g: 'unisex', img: ['footballDribble', 'footballPitch'], col: [C.black, C.orange], sizes: ['S', 'M', 'L'],
    sd: 'Low-profile shin guards with a lightweight composite shell and breathable foam backing.',
    ab: 'Protection you barely notice. A slim composite shell spreads impact across the shin, and perforated EVA backing lets heat escape — essential for summer evening fixtures.',
    hl: ['Low-profile composite shell', 'Perforated, breathable EVA backing', 'Comes with compression sleeves'],
    sp: { Shell: 'Polypropylene composite', Backing: 'Perforated EVA foam', Certification: 'CE EN 13061' },
    tags: ['protection', 'shin pads'],
  },
  {
    n: 'Predator Pro Goalkeeper Gloves', b: 'Adidas', s: 'football', sub: 'goalkeeper-equipment', p: 349, o: 399, r: 4.7, rc: 118, st: 26, sales: 400, f: 'd',
    g: 'unisex', img: ['footballStadiumBall', 'footballNight'], col: [C.black, C.white], sizes: ['7', '8', '9', '10', '11'],
    sd: 'Pro-level keeper gloves with 4 mm URG 2.0 latex palms for confident catching in any condition.',
    ab: 'For keepers who want to command their box. The URG 2.0 latex palm gives sticky grip in dry and humid conditions, while the negative cut and wraparound strap create a precise, secure fit.',
    hl: ['4 mm URG 2.0 grip latex', 'Negative cut for close ball contact', 'Wraparound wrist strap'],
    sp: { Palm: '4 mm URG 2.0 latex', Cut: 'Negative', Closure: 'Wraparound strap', 'Finger protection': 'No' },
    tags: ['goalkeeper', 'gloves'],
  },
  {
    n: 'Kipsta Agility Training Set', b: 'Decathlon', s: 'football', sub: 'football-training', p: 129, o: 159, r: 4.4, rc: 141, st: 64, sales: 700, f: 'd',
    g: 'unisex', img: ['footballTrainingBalls', 'footballPitch'], col: [C.yellow], sizes: [],
    sd: 'Speed ladder, 10 cones and 4 mini hurdles in one carry bag for footwork and agility sessions.',
    ab: 'Everything a coach or self-motivated player needs for footwork drills. The 4 m speed ladder, flexible cones and adjustable hurdles pack into a single drawstring bag that fits in any kit bag.',
    hl: ['4 m speed ladder with adjustable rungs', '10 flexible cones and 4 mini hurdles', 'Drawstring carry bag included'],
    sp: { Contents: 'Ladder, 10 cones, 4 hurdles, bag', 'Ladder length': '4 m', Material: 'PP and PVC' },
    tags: ['agility', 'training', 'coaching'],
  },
  {
    n: 'Hustle 6.0 Pro Kit Backpack', b: 'Under Armour', s: 'football', sub: 'football-accessories', p: 219, r: 4.6, rc: 92, st: 48, sales: 350,
    g: 'unisex', img: ['backpackRugged', 'backpackNavy'], col: [C.black, C.charcoal], sizes: [],
    sd: 'Water-resistant backpack with a vented boot compartment and padded laptop sleeve.',
    ab: 'Training straight after school or the office? The vented base compartment keeps muddy boots away from your clothes, and the UA Storm finish repels water from sprinklers and sudden winter showers.',
    hl: ['Separate ventilated boot compartment', 'UA Storm water-repellent finish', 'Padded 15-inch laptop sleeve'],
    sp: { Capacity: '29 L', Material: 'Polyester with UA Storm', Dimensions: '50 x 33 x 17 cm' },
    tags: ['bag', 'backpack', 'kit bag'],
  },

  // ===================== CRICKET =====================
  {
    n: 'Sunny Tonny Classic English Willow Bat', b: 'SG', s: 'cricket', sub: 'cricket-bats', p: 1299, o: 1499, r: 4.8, rc: 76, st: 18, sales: 240, f: 'fbd',
    g: 'men', img: ['cricketBatsman', 'cricketStadiumDusk', 'cricketGround'], col: [C.natural], cfg: [['Short Handle', 0], ['Long Handle', 50]],
    sd: 'Grade 1 English willow bat with a massive edge profile and a low-middle sweet spot.',
    ab: 'Hand-pressed from Grade 1 English willow with 10–12 straight grains, the Sunny Tonny Classic offers a big, forgiving middle and thick edges for powerful drives. Knocked-in and oiled by our partner workshop in Sharjah before dispatch.',
    hl: ['Grade 1 English willow, 10–12 grains', 'Pre-knocked and oiled, ready to play', 'Singapore cane handle with anti-shock grip'],
    sp: { 'Bat material': 'Grade 1 English Willow', 'Bat size': 'Short / Long Handle', Weight: '1,180–1,220 g', Grains: '10–12 straight grains', Handle: 'Singapore cane' },
    at: { batType: 'English Willow', batSize: 'Short Handle|Long Handle' }, tags: ['bat', 'english willow', 'match bat'],
  },
  {
    n: 'Genius Grand Edition English Willow Bat', b: 'MRF', s: 'cricket', sub: 'cricket-bats', p: 1849, o: 2099, r: 4.9, rc: 54, st: 9, sales: 160, f: 'fn',
    g: 'men', img: ['cricketGround', 'cricketBatsman'], col: [C.natural], cfg: [['Short Handle', 0], ['Long Handle', 60]],
    sd: 'Player-grade English willow with a high spine and concave back for elite power hitting.',
    ab: 'The Grand Edition is selected from the top 3% of English willow clefts. A high spine and scooped back keep the pick-up light while maximising wood behind the ball — built for top-order hitters in UAE leagues.',
    hl: ['Player-grade willow (top 3% clefts)', 'High spine, concave back for balanced pick-up', 'Hand-crafted and individually weighed'],
    sp: { 'Bat material': 'Player Grade English Willow', 'Bat size': 'Short / Long Handle', Weight: '1,160–1,200 g', Grains: '12+ straight grains', Edge: '40 mm' },
    at: { batType: 'English Willow', batSize: 'Short Handle|Long Handle' }, tags: ['bat', 'english willow', 'premium'],
  },
  {
    n: 'Kahuna Pro 5.0 Kashmir Willow Bat', b: 'Kookaburra', s: 'cricket', sub: 'cricket-bats', p: 349, o: 399, r: 4.4, rc: 188, st: 46, sales: 690, f: 'bd',
    g: 'unisex', img: ['cricketStadiumDusk', 'cricketGround'], col: [C.natural], cfg: [['Size 5', -40], ['Size 6', -20], ['Harrow', -10], ['Short Handle', 0]],
    sd: 'Durable Kashmir willow bat ideal for nets, tape-ball and junior leagues.',
    ab: 'A hard-wearing Kashmir willow bat that delivers dependable performance for training and club cricket. Available in junior sizes so young players can move up without compromising balance.',
    hl: ['Seasoned Kashmir willow', 'Junior sizes available (Size 5, 6, Harrow)', 'Toe guard and anti-scuff sheet fitted'],
    sp: { 'Bat material': 'Kashmir Willow', 'Bat size': 'Size 5 to Short Handle', Weight: '1,050–1,200 g (size dependent)', Handle: 'Cane with rubber grip' },
    at: { batType: 'Kashmir Willow', batSize: 'Size 5|Size 6|Harrow|Short Handle' }, tags: ['bat', 'kashmir willow', 'junior', 'nets'],
  },
  {
    n: 'Regulation Leather Cricket Ball 156g', b: 'Kookaburra', s: 'cricket', sub: 'cricket-balls', p: 89, r: 4.7, rc: 265, st: 150, sales: 1900, f: 'b',
    g: 'unisex', img: ['cricketBallGrass', 'cricketGlovesBall'], col: [C.red, C.white], sizes: [],
    sd: 'Hand-stitched four-piece leather match ball meeting senior men’s regulation weight.',
    ab: 'A four-piece, hand-stitched alum-tanned leather ball with a pronounced seam for swing and seam movement. The red ball is ideal for multi-day formats; the white version is used in limited-overs and floodlit matches.',
    hl: ['Four-piece hand-stitched leather', 'Regulation 156 g for senior cricket', 'Red and white versions available'],
    sp: { Weight: '156 g', Construction: '4-piece, hand-stitched', Leather: 'Alum-tanned', Grade: 'Match' },
    tags: ['ball', 'leather ball', 'match'],
  },
  {
    n: 'Test Batting Gloves', b: 'SG', s: 'cricket', sub: 'batting-gloves', p: 229, o: 259, r: 4.5, rc: 97, st: 40, sales: 420, f: 'd',
    g: 'unisex', img: ['cricketGlovesBall', 'cricketBatsman'], col: [C.white], sizes: ['Youth', 'Men', 'Men Large'], cfg: [['Right-handed', 0], ['Left-handed', 0]],
    sd: 'Sausage-finger batting gloves with high-density foam and a sheep-leather palm.',
    ab: 'Proven protection for match batting. High-density foam rolls protect the fingers, a split-side thumb adds flexibility, and the soft sheep-leather palm gives a natural feel on the handle.',
    hl: ['High-density foam finger rolls', 'Sheep-leather palm for feel', 'Towelling wristband absorbs sweat'],
    sp: { Palm: 'Sheep leather', Protection: 'HD foam + fibre inserts', Wrist: 'Towelling band' },
    tags: ['gloves', 'protection', 'batting'],
  },
  {
    n: 'Aeroselect Cricket Helmet', b: 'SG', s: 'cricket', sub: 'cricket-helmets', p: 329, o: 379, r: 4.6, rc: 71, st: 22, sales: 230,
    g: 'unisex', img: ['cricketStadiumNight', 'cricketBatsman'], col: [C.navy, C.green], sizes: ['S', 'M', 'L'],
    sd: 'Lightweight helmet with a titanium grille and air-flow vents — certified to BS 7928:2013.',
    ab: 'Protection without the heat. Large vents channel air across the head, and the lightweight titanium grille keeps weight down for long innings. Fully certified to the latest British safety standard.',
    hl: ['Certified to BS 7928:2013', 'Lightweight titanium grille', 'Removable, washable liner'],
    sp: { Certification: 'BS 7928:2013', Grille: 'Titanium', Shell: 'ABS', Liner: 'Removable foam' },
    tags: ['helmet', 'protection', 'safety'],
  },
  {
    n: 'Pro 3.0 Batting Pads', b: 'Kookaburra', s: 'cricket', sub: 'cricket-pads', p: 279, r: 4.5, rc: 58, st: 30, sales: 190,
    g: 'unisex', img: ['cricketGround', 'cricketStadiumDusk'], col: [C.white], sizes: ['Youth', 'Men'], cfg: [['Right-handed', 0], ['Left-handed', 0]],
    sd: 'Lightweight traditional-cane pads with a moulded knee roll and quick-release straps.',
    ab: 'Traditional cane reinforcement meets modern lightweight foam. A moulded knee roll and wide instep give stable protection, and the quick-release straps make swapping in and out at the fall of a wicket effortless.',
    hl: ['Cane-reinforced, high-density foam', 'Moulded knee roll', 'Quick-release velcro straps'],
    sp: { Protection: 'Cane + HD foam', Straps: '3 x velcro', Weight: '1.4 kg pair (Men)' },
    tags: ['pads', 'protection'],
  },
  {
    n: 'CK4030 Cricket Spikes', b: 'New Balance', s: 'cricket', sub: 'cricket-shoes', p: 499, o: 599, r: 4.6, rc: 63, st: 27, sales: 210, f: 'nd',
    g: 'men', img: ['shoeWhiteCourt', 'shoeWhiteStreet'], col: [C.white], sizes: SHOE,
    sd: 'Full-spike cricket shoe with FuelCell cushioning built for fast bowlers and all-rounders.',
    ab: 'Engineered with fast bowlers in mind, the CK4030 pairs a FuelCell midsole with a TPU spike plate for grip and stability through your delivery stride. The supportive upper locks the foot in at the crease.',
    hl: ['FuelCell midsole for energy return', 'Replaceable metal spikes', 'Reinforced toe drag area'],
    sp: { Outsole: 'TPU plate with 9 metal spikes', Midsole: 'FuelCell', Upper: 'Synthetic with mesh' },
    tags: ['shoes', 'spikes', 'bowling'], also: [['sports-shoes', 'training-shoes']],
  },
  {
    n: 'Pro Duffle Wheelie Kit Bag', b: 'SG', s: 'cricket', sub: 'cricket-bags', p: 399, r: 4.7, rc: 49, st: 19, sales: 150, f: 'n',
    g: 'unisex', img: ['backpackRugged', 'backpackNavy'], col: [C.navy, C.black], sizes: [],
    sd: 'Large wheeled kit bag with separate bat sleeves and a ventilated shoe compartment.',
    ab: 'Carries a full set of kit from car park to pavilion. Two padded bat sleeves, a ventilated shoe pocket and smooth inline wheels make it the bag of choice for weekend league cricketers.',
    hl: ['Two padded bat sleeves', 'Ventilated shoe compartment', 'Smooth inline wheels and trolley handle'],
    sp: { Capacity: '110 L', Dimensions: '90 x 35 x 35 cm', Material: '600D polyester' },
    tags: ['bag', 'kit bag', 'wheelie'],
  },

  // ===================== BASKETBALL =====================
  {
    n: 'LeBron Witness 8', b: 'Nike', s: 'basketball', sub: 'basketball-shoes', p: 529, o: 599, r: 4.7, rc: 184, st: 38, sales: 640, f: 'bd',
    g: 'men', img: ['shoeRedHigh', 'shoeHighTop', 'basketballDunk'], col: [C.red, C.black], sizes: SHOE,
    sd: 'Supportive court shoe with a full-length Air Zoom unit and a stable wide base.',
    ab: 'Power and protection for strong drivers to the rim. A forefoot Zoom Air unit adds bounce, while the wide outsole and padded collar keep you stable through hard cuts and landings.',
    hl: ['Forefoot Air Zoom unit', 'Wide, stable outsole', 'Padded collar for ankle comfort'],
    sp: { Cushioning: 'Air Zoom + foam', Support: 'Mid-top', Outsole: 'Herringbone rubber' },
    tags: ['shoes', 'court'], also: [['sports-shoes', 'basketball-shoes']],
  },
  {
    n: 'Curry Flow 11', b: 'Under Armour', s: 'basketball', sub: 'basketball-shoes', p: 649, r: 4.8, rc: 72, st: 24, sales: 260, f: 'nf',
    g: 'men', img: ['shoeWhiteBlue', 'shoeHighTop'], col: [C.white, C.blue], sizes: SHOE,
    sd: 'Rubberless UA Flow outsole for elite grip and lightweight, explosive guard play.',
    ab: 'UA Flow foam doubles as the outsole, cutting weight while delivering a sticky grip on indoor courts. Ideal for shifty guards who play off quick stops, crossovers and step-backs.',
    hl: ['Rubberless UA Flow grip', 'Lightweight warp upper', 'Low-profile for court feel'],
    sp: { Cushioning: 'UA Flow', Support: 'Low-top', Outsole: 'UA Flow (rubberless)' },
    tags: ['shoes', 'court', 'guard'], also: [['sports-shoes', 'basketball-shoes']],
  },
  {
    n: 'TF-1000 Legacy Indoor Basketball', b: 'Spalding', s: 'basketball', sub: 'basketballs', p: 249, r: 4.8, rc: 211, st: 60, sales: 820, f: 'b',
    g: 'unisex', img: ['basketballBallCourt', 'basketballNet'], col: [C.orange], sizes: ['Size 6', 'Size 7'],
    sd: 'Premium composite indoor game ball with a soft, moisture-absorbing cover.',
    ab: 'A favourite of school and club leagues. The ZK microfibre composite cover absorbs moisture for a consistent grip in humid sports halls, and deep channels make ball control feel natural.',
    hl: ['ZK microfibre composite cover', 'Moisture-absorbing for humid halls', 'Official size 7 and women’s size 6'],
    sp: { Cover: 'ZK microfibre composite', Use: 'Indoor', Sizes: '6 and 7' },
    tags: ['ball', 'indoor'],
  },
  {
    n: 'NBA Forge Outdoor Basketball', b: 'Wilson', s: 'basketball', sub: 'basketballs', p: 129, o: 159, r: 4.5, rc: 336, st: 90, sales: 1400, f: 'bd',
    g: 'unisex', img: ['basketballHoopNight', 'basketballHoopSky'], col: [C.orange], sizes: ['Size 5', 'Size 6', 'Size 7'],
    sd: 'Tough rubber-composite outdoor ball built for public courts and hot asphalt.',
    ab: 'Built to survive outdoor courts in the UAE sun. A durable composite cover with deep pebbling keeps grip consistent, and it holds its bounce game after game on concrete and asphalt.',
    hl: ['Durable outdoor composite', 'Deep channel design', 'Kids sizes available'],
    sp: { Cover: 'Rubber composite', Use: 'Outdoor', Sizes: '5, 6 and 7' },
    tags: ['ball', 'outdoor', 'street'],
  },
  {
    n: 'Dri-FIT Icon Basketball Shorts', b: 'Nike', s: 'basketball', sub: 'basketball-shorts', p: 149, r: 4.6, rc: 129, st: 85, sales: 760, f: 'b',
    g: 'men', img: ['basketballHoopNight', 'basketballDunk'], col: [C.black, C.navy, C.red], sizes: CLOTH,
    sd: 'Classic 8-inch mesh shorts with sweat-wicking Dri-FIT technology.',
    ab: 'Lightweight mesh shorts with Dri-FIT to pull sweat away from your skin. The elastic waistband with drawcord stays put through every crossover and sprint up the court.',
    hl: ['Dri-FIT sweat-wicking mesh', '8-inch inseam', 'Side pockets'],
    sp: { Material: '100% recycled polyester', Inseam: '8 in', Fit: 'Loose' },
    tags: ['shorts', 'apparel'], also: [['sportswear', 'shorts']],
  },
  {
    n: 'Legends Basketball Jersey', b: 'Adidas', s: 'basketball', sub: 'basketball-jerseys', p: 169, r: 4.4, rc: 44, st: 55, sales: 200, f: 'n',
    g: 'men', img: ['basketballDunk', 'basketballArena'], col: [C.white, C.purple], sizes: CLOTH,
    sd: 'Breathable reversible jersey designed for pickup games and team training.',
    ab: 'A reversible, lightweight jersey that switches between two colours for scrimmages. AEROREADY fabric keeps you dry, and the open armholes give full range of motion for shooting.',
    hl: ['Reversible two-colour design', 'AEROREADY moisture management', 'Open armholes for free movement'],
    sp: { Material: 'Recycled polyester mesh', Fit: 'Relaxed', Technology: 'AEROREADY' },
    tags: ['jersey', 'apparel', 'reversible'], also: [['sportswear', 'jerseys']],
  },
  {
    n: 'Portable Basketball Hoop System 54"', b: 'Spalding', s: 'basketball', sub: 'basketball-training', p: 1899, o: 2199, r: 4.6, rc: 38, st: 7, sales: 70, f: 'd',
    g: 'unisex', img: ['basketballHoopSky', 'basketballRim'], col: [C.black], sizes: [],
    sd: 'Height-adjustable portable hoop with a 54" shatter-proof backboard for driveways and villas.',
    ab: 'Bring the court home. The 54-inch polycarbonate backboard and adjustable height (2.3–3.05 m) suit kids and adults alike, and the 132 L base fills with water or sand for stability in UAE winds.',
    hl: ['54" shatter-proof polycarbonate backboard', 'Height adjusts 2.3–3.05 m', 'Free assembly in Dubai, Abu Dhabi & Sharjah'],
    sp: { Backboard: '54" polycarbonate', 'Height range': '2.3–3.05 m', Base: '132 L (water or sand)' },
    tags: ['hoop', 'home court', 'training'], bulky: true, emirates: ['dubai', 'abu-dhabi', 'sharjah', 'ajman'],
  },

  // ===================== TENNIS =====================
  {
    n: 'Pro Staff 97 v14 Racket', b: 'Wilson', s: 'tennis', sub: 'tennis-rackets', p: 1049, o: 1199, r: 4.8, rc: 67, st: 16, sales: 190, f: 'fd',
    g: 'unisex', img: ['tennisRacketCourt', 'tennisRacketBlue', 'tennisPlayer'], col: [C.black], sizes: ['L2', 'L3', 'L4'],
    sd: 'Classic control racket with a 97 sq in head and braided graphite for precise, feel-rich hitting.',
    ab: 'A tour favourite for all-court players. Braided graphite and basalt fibres deliver a plush, stable feel, while the 97 sq in head rewards clean ball striking with pinpoint control.',
    hl: ['97 sq in head for control', 'Braided graphite + basalt for feel', 'Supplied unstrung (stringing service available)'],
    sp: { 'Head size': '97 sq in', Weight: '315 g (unstrung)', Balance: '31.0 cm (7 pts HL)', 'String pattern': '16 x 19' },
    at: { racketWeight: 'Heavy (over 300g)' }, tags: ['racket', 'control', 'advanced'],
  },
  {
    n: 'Pure Aero 2026 Racket', b: 'Babolat', s: 'tennis', sub: 'tennis-rackets', p: 999, r: 4.8, rc: 41, st: 21, sales: 150, f: 'nf',
    g: 'unisex', img: ['tennisRacketYellow', 'tennisBallsAir'], col: [C.yellow, C.black], sizes: ['L1', 'L2', 'L3'],
    sd: 'Spin machine with an aerodynamic frame and 100 sq in head for heavy topspin baseliners.',
    ab: 'Designed for modern baseline tennis. The aero-modular beam slices through the air for faster racket-head speed, and the open 16 x 19 pattern helps you generate heavy topspin that kicks up off the court.',
    hl: ['Aerodynamic frame for racket-head speed', 'Open string pattern for spin', 'Cortex Pure Feel dampening'],
    sp: { 'Head size': '100 sq in', Weight: '300 g (unstrung)', Balance: '32.0 cm', 'String pattern': '16 x 19' },
    at: { racketWeight: 'Medium (285–300g)' }, tags: ['racket', 'spin', 'intermediate'],
  },
  {
    n: 'EZONE 100L Racket', b: 'Yonex', s: 'tennis', sub: 'tennis-rackets', p: 849, o: 949, r: 4.7, rc: 52, st: 19, sales: 170, f: 'd',
    g: 'unisex', img: ['tennisRacketBlue', 'tennisCourt'], col: [C.blue], sizes: ['L1', 'L2', 'L3'],
    sd: 'Lightweight, forgiving racket with Isometric head shape for an enlarged sweet spot.',
    ab: 'Easy power for developing players and juniors stepping up. Yonex’s square Isometric head expands the sweet spot, and the lighter 280 g frame is easy to swing fast without fatigue.',
    hl: ['Isometric head for a larger sweet spot', 'Lightweight 280 g frame', 'Vibration-dampening grommets'],
    sp: { 'Head size': '100 sq in', Weight: '280 g (unstrung)', Balance: '33.0 cm', 'String pattern': '16 x 19' },
    at: { racketWeight: 'Light (under 285g)' }, tags: ['racket', 'lightweight', 'beginner'],
  },
  {
    n: 'US Open Extra Duty Tennis Balls', b: 'Wilson', s: 'tennis', sub: 'tennis-balls', p: 39, r: 4.7, rc: 520, st: 300, sales: 3200, f: 'b',
    g: 'unisex', img: ['tennisBallMotion', 'tennisBallHand', 'tennisBallsAir'], col: [C.volt], cfg: [['1 can (4 balls)', 0], ['3 cans', 70], ['6 cans', 145]],
    sd: 'Official ball of the US Open — extra-duty felt for hard courts.',
    ab: 'The pressurised ball trusted on hard courts worldwide. Extra-duty felt stands up to abrasive UAE hard courts, and the consistent bounce lasts for several sets.',
    hl: ['Extra-duty felt for hard courts', 'Pressurised for consistent bounce', 'ITF approved'],
    sp: { Type: 'Pressurised', Felt: 'Extra Duty', Approval: 'ITF', 'Balls per can': '4' },
    tags: ['balls', 'hard court'],
  },
  {
    n: 'Gel-Resolution 9 Tennis Shoes', b: 'ASICS', s: 'tennis', sub: 'tennis-shoes', p: 599, o: 699, r: 4.7, rc: 133, st: 31, sales: 480, f: 'bd',
    g: 'men', img: ['shoeWhiteCourt', 'tennisCourtSit'], col: [C.white, C.blue], sizes: SHOE,
    sd: 'Stable all-court shoe with DYNAWALL support and a 6-month outsole durability guarantee.',
    ab: 'Stability for aggressive movers. DYNAWALL technology supports the midfoot through lateral slides, and GEL cushioning softens impact on hard courts during long baseline rallies.',
    hl: ['DYNAWALL lateral stability', 'Rearfoot GEL cushioning', 'AHAR+ durable outsole'],
    sp: { Surface: 'All court', Cushioning: 'GEL + FF BLAST', Drop: '9 mm' },
    tags: ['shoes', 'court'], also: [['sports-shoes', 'tennis-shoes']],
  },
  {
    n: 'Court Dri-FIT Advantage Polo', b: 'Nike', s: 'tennis', sub: 'tennis-clothing', p: 189, r: 4.5, rc: 61, st: 66, sales: 260,
    g: 'unisex', gv: ['men', 'women'], img: ['tennisPlayer', 'tennisCourtSit'], col: [C.white, C.navy], sizes: CLOTH,
    sd: 'Stretchy, breathable polo with a sweat-wicking knit for hot afternoon matches.',
    ab: 'Stay cool and unrestricted through three sets. Dri-FIT knit fabric moves sweat away from your skin, and the stretch construction follows you through every serve and overhead.',
    hl: ['Dri-FIT moisture management', 'Four-way stretch knit', 'Men’s and women’s fits'],
    sp: { Material: '88% polyester, 12% elastane', Fit: 'Standard', Technology: 'Dri-FIT' },
    tags: ['polo', 'apparel'], also: [['sportswear', 't-shirts']],
  },
  {
    n: 'Super Grap Overgrip (3-Pack)', b: 'Yonex', s: 'tennis', sub: 'tennis-grips', p: 35, r: 4.8, rc: 410, st: 220, sales: 2600, f: 'b',
    g: 'unisex', img: ['tennisRacketClay', 'tennisRacketCourt'], col: [C.white, C.yellow, C.black], sizes: [],
    sd: 'The world’s best-selling overgrip — tacky, thin and absorbent.',
    ab: 'A thin, tacky overgrip that keeps your racket secure even with sweaty hands in UAE humidity. Each pack contains three grips with finishing tape.',
    hl: ['Tacky feel, thin 0.6 mm profile', 'Absorbs sweat', 'Three grips per pack'],
    sp: { Thickness: '0.6 mm', Quantity: '3 grips', Length: '1,200 mm' },
    tags: ['grip', 'overgrip'],
  },
  {
    n: 'Super Tour 9-Pack Racket Bag', b: 'Wilson', s: 'tennis', sub: 'tennis-bags', p: 449, r: 4.6, rc: 33, st: 14, sales: 90,
    g: 'unisex', img: ['backpackNavy', 'tennisCourt'], col: [C.black, C.red], sizes: [],
    sd: 'Three-compartment racket bag with Thermoguard lining to protect strings from heat.',
    ab: 'Leaving your rackets in a hot car can ruin string tension. The Thermoguard-lined compartments protect up to nine rackets, with a separate vented shoe pocket and backpack straps.',
    hl: ['Holds up to 9 rackets', 'Thermoguard heat protection', 'Vented shoe compartment'],
    sp: { Capacity: '9 rackets', Compartments: '3', Carry: 'Backpack straps + handle' },
    tags: ['bag', 'racket bag'],
  },

  // ===================== RUNNING =====================
  {
    n: 'Air Zoom Pegasus 41', b: 'Nike', s: 'running', sub: 'running-shoes', p: 499, o: 599, r: 4.7, rc: 486, st: 24, sales: 2350, f: 'fbd',
    g: 'men', img: ['shoeRed', 'shoeWhiteOrange', 'runningRoad'], col: [C.red, C.white], sizes: SHOE,
    sd: 'The trusted daily trainer — now with ReactX foam and dual Zoom Air units for a springier ride.',
    ab: 'A daily trainer that does it all, from easy recovery runs along Jumeirah to tempo sessions at Al Qudra. ReactX foam returns more energy than ever, and Zoom Air units in the heel and forefoot add a responsive pop.',
    hl: ['ReactX foam with 13% more energy return', 'Dual Zoom Air units', 'Engineered mesh for breathability in the heat'],
    sp: { Cushioning: 'ReactX + Zoom Air', 'Running type': 'Road — daily trainer', Drop: '10 mm', Weight: '285 g (UK 9)' },
    at: { runningType: 'Road' }, tags: ['shoes', 'daily trainer', 'road', 'pegasus'], also: [['sports-shoes', 'running-shoes']],
  },
  {
    n: 'Gel-Nimbus 27', b: 'ASICS', s: 'running', sub: 'running-shoes', p: 699, r: 4.8, rc: 214, st: 30, sales: 980, f: 'nb',
    g: 'women', img: ['shoeGreyFloating', 'shoeWhiteStreet'], col: [C.grey, C.white], sizes: SHOE,
    sd: 'Max-cushion comfort with FF BLAST PLUS ECO foam and PureGEL for long, easy miles.',
    ab: 'Plush, protective cushioning for long runs and recovery days. FF BLAST PLUS ECO foam and PureGEL soften every landing, and the knit upper adapts to your foot as it swells in the heat.',
    hl: ['FF BLAST PLUS ECO foam', 'PureGEL for soft landings', 'Stretch knit upper'],
    sp: { Cushioning: 'Maximum', 'Running type': 'Road — long run', Drop: '8 mm', Weight: '255 g (UK 6)' },
    at: { runningType: 'Road' }, tags: ['shoes', 'cushioned', 'long run'], also: [['sports-shoes', 'running-shoes']],
  },
  {
    n: 'Fresh Foam X 1080v14', b: 'New Balance', s: 'running', sub: 'running-shoes', p: 649, o: 749, r: 4.7, rc: 158, st: 26, sales: 610, f: 'd',
    g: 'men', img: ['shoeOlive', 'shoeTan'], col: [C.olive, C.sand], sizes: SHOE,
    sd: 'Premium neutral trainer with Fresh Foam X for a soft, smooth ride from 5K to marathon.',
    ab: 'Soft but never sluggish. A thick slab of Fresh Foam X with a rocker shape keeps you rolling efficiently through long efforts, and the Hypoknit upper offers targeted stretch and support.',
    hl: ['Fresh Foam X midsole', 'Rocker geometry for smooth transitions', 'Hypoknit upper'],
    sp: { Cushioning: 'High', 'Running type': 'Road — daily trainer', Drop: '6 mm', Weight: '295 g (UK 9)' },
    at: { runningType: 'Road' }, tags: ['shoes', 'neutral', 'cushioned'], also: [['sports-shoes', 'running-shoes']],
  },
  {
    n: 'Adizero Adios Pro 4', b: 'Adidas', s: 'running', sub: 'running-shoes', p: 1049, r: 4.9, rc: 88, st: 15, sales: 330, f: 'nf',
    g: 'unisex', img: ['shoeLime', 'runningTrack'], col: [C.volt, C.white], sizes: SHOE,
    sd: 'Elite carbon-rod race shoe built for PBs at the Dubai Marathon and beyond.',
    ab: 'Race-day weapon. ENERGYRODS 2.0 carbon-infused glass fibre rods and LIGHTSTRIKE PRO foam combine for a propulsive, efficient stride from the first kilometre to the last.',
    hl: ['ENERGYRODS 2.0 carbon-infused rods', 'LIGHTSTRIKE PRO super foam', 'World Athletics compliant'],
    sp: { Cushioning: 'LIGHTSTRIKE PRO', 'Running type': 'Race — marathon', Drop: '6.5 mm', Weight: '215 g (UK 9)' },
    at: { runningType: 'Race' }, tags: ['shoes', 'carbon', 'race day', 'marathon'], also: [['sports-shoes', 'running-shoes']],
  },
  {
    n: 'Pegasus Trail 5 GORE-TEX', b: 'Nike', s: 'running', sub: 'running-shoes', p: 599, r: 4.6, rc: 74, st: 20, sales: 250, f: 'n',
    g: 'unisex', img: ['shoeColorPop', 'runningTrail'], col: [C.orange, C.teal], sizes: SHOE,
    sd: 'Road-to-trail shoe with a waterproof GORE-TEX upper and grippy all-terrain outsole.',
    ab: 'Made for Hatta trails, wadi crossings and the occasional winter downpour. A GORE-TEX upper keeps feet dry, and the multi-surface lugs transition smoothly from tarmac to rocky singletrack.',
    hl: ['Waterproof GORE-TEX upper', 'All-terrain rubber lugs', 'ReactX foam for comfort'],
    sp: { Cushioning: 'ReactX', 'Running type': 'Trail', Drop: '9.5 mm', Weight: '310 g (UK 9)' },
    at: { runningType: 'Trail' }, tags: ['shoes', 'trail', 'waterproof'], also: [['sports-shoes', 'outdoor-shoes']],
  },
  {
    n: 'Forerunner 265 GPS Watch', b: 'Garmin', s: 'running', sub: 'running-watches', p: 1699, o: 1899, r: 4.8, rc: 198, st: 22, sales: 720, f: 'fbd',
    g: 'unisex', img: ['watchBlack', 'watchWrist'], col: [C.black, C.white], sizes: [],
    sd: 'AMOLED running watch with training readiness, HRV status and up to 13 days of battery.',
    ab: 'Your personal running coach. A vivid AMOLED display, multi-band GPS for accuracy between Dubai Marina towers, and daily suggested workouts tuned to your recovery help you train smarter.',
    hl: ['Bright AMOLED touchscreen', 'Multi-band GPS for urban accuracy', 'Training readiness and HRV status'],
    sp: { Display: '1.3" AMOLED', Battery: 'Up to 13 days (smartwatch)', GPS: 'Multi-band', 'Water rating': '5 ATM' },
    tags: ['watch', 'gps', 'wearable'],
  },
  {
    n: 'Forerunner 965 GPS Watch', b: 'Garmin', s: 'running', sub: 'running-watches', p: 2399, r: 4.9, rc: 81, st: 11, sales: 260, f: 'n',
    g: 'unisex', img: ['watchWrist', 'watchWhite'], col: [C.charcoal, C.white], sizes: [],
    sd: 'Premium triathlon watch with full-colour maps, titanium bezel and 23-day battery life.',
    ab: 'For the runner who also swims, rides and races triathlons. Full-colour onboard maps, a titanium bezel and advanced training metrics make it the ultimate multisport companion.',
    hl: ['Onboard full-colour maps', 'Titanium bezel', 'Up to 23 days battery'],
    sp: { Display: '1.4" AMOLED', Battery: 'Up to 23 days', GPS: 'Multi-band', 'Water rating': '5 ATM' },
    tags: ['watch', 'gps', 'triathlon', 'wearable'],
  },
  {
    n: 'Launch Elite Running Tee', b: 'Under Armour', s: 'running', sub: 'running-clothing', p: 149, r: 4.5, rc: 102, st: 90, sales: 540, f: 'b',
    g: 'unisex', gv: ['men', 'women'], img: ['runningStairs', 'runningSunset'], col: [C.black, C.orange, C.sky], sizes: CLOTH,
    sd: 'Ultra-light running tee with laser-perforated ventilation and reflective details.',
    ab: 'Feather-light fabric that dries fast in the Gulf heat. Laser-perforated panels dump heat where you need it most, and reflective details keep you visible on early-morning runs.',
    hl: ['Laser-perforated ventilation', 'Anti-odour technology', 'Reflective logos'],
    sp: { Material: '100% polyester', Fit: 'Fitted', Technology: 'Iso-Chill' },
    tags: ['tee', 'apparel', 'reflective'], also: [['sportswear', 't-shirts']],
  },
  {
    n: 'Kiprun Insulated Bottle 500ml', b: 'Decathlon', s: 'running', sub: 'hydration', p: 59, r: 4.6, rc: 290, st: 160, sales: 1800, f: 'b',
    g: 'unisex', img: ['bottleGreen', 'bottleClear'], col: [C.green, C.black, C.white], sizes: [],
    sd: 'Double-wall stainless steel bottle that keeps water cold for 24 hours.',
    ab: 'Ice-cold water even after a day in the car. Double-wall vacuum insulation keeps drinks cold for 24 hours, and the leak-proof cap fits easily in a gym bag or bike cage.',
    hl: ['Cold for 24 h, hot for 12 h', 'Leak-proof screw cap', 'BPA-free stainless steel'],
    sp: { Capacity: '500 ml', Material: '18/8 stainless steel', Insulation: 'Double-wall vacuum' },
    tags: ['bottle', 'hydration'],
  },
  {
    n: 'Kiprun Hydration Belt 2 x 250ml', b: 'Decathlon', s: 'running', sub: 'hydration', p: 89, r: 4.3, rc: 75, st: 50, sales: 320, f: 'n',
    g: 'unisex', img: ['bottleClear', 'runningSunset'], col: [C.black], sizes: ['S/M', 'L/XL'],
    sd: 'Bounce-free hydration belt with two soft flasks and a phone pocket.',
    ab: 'Carry fluids on long runs without bounce. Two 250 ml soft flasks sit snugly on the hips, and a stretch pocket holds your phone, keys and gels.',
    hl: ['Two 250 ml soft flasks', 'Bounce-free stretch fit', 'Phone pocket fits up to 6.7"'],
    sp: { Capacity: '2 x 250 ml', Pocket: 'Fits phones up to 6.7"', Weight: '140 g' },
    tags: ['hydration', 'belt', 'long run'],
  },
  {
    n: 'Sport Wireless Headphones', b: 'Reebok', s: 'running', sub: 'running-accessories', p: 199, o: 249, r: 4.2, rc: 66, st: 40, sales: 210, f: 'd',
    g: 'unisex', img: ['headphones'], col: [C.black], sizes: [],
    sd: 'Sweat-resistant wireless headphones with 30-hour battery and secure fit.',
    ab: 'Music that keeps up with your training. IPX5 sweat resistance, a secure folding headband and 30-hour battery cover a full week of workouts on one charge.',
    hl: ['IPX5 sweat resistant', '30-hour battery', 'Bluetooth 5.3 with fast pairing'],
    sp: { Battery: '30 hours', Rating: 'IPX5', Connectivity: 'Bluetooth 5.3' },
    tags: ['headphones', 'audio', 'accessories'],
  },

  // ===================== FITNESS =====================
  {
    n: 'Domyos Hex Dumbbell Pair', b: 'Decathlon', s: 'fitness', sub: 'dumbbells', p: 89, r: 4.7, rc: 512, st: 140, sales: 3100, f: 'fb',
    g: 'unisex', img: ['hexDumbbells', 'dumbbellRack'], col: [C.black], cfg: [['2.5 kg pair', 0], ['5 kg pair', 60], ['7.5 kg pair', 110], ['10 kg pair', 160]],
    sd: 'Rubber-coated hexagonal dumbbells that won’t roll — sold in pairs.',
    ab: 'The home-gym essential. Hexagonal heads stop the dumbbells rolling away, the rubber coating protects your floors, and the knurled chrome handles give a secure grip even when your hands are sweaty.',
    hl: ['Anti-roll hexagonal heads', 'Floor-friendly rubber coating', 'Knurled chrome handles'],
    sp: { Material: 'Cast iron, rubber-coated', Weight: '2.5–10 kg per dumbbell', 'Resistance level': 'Fixed weight' },
    at: { equipmentType: 'Free Weights' }, tags: ['dumbbells', 'home gym', 'weights'],
  },
  {
    n: 'Adjustable Dumbbell 2–24 kg', b: 'Reebok', s: 'fitness', sub: 'dumbbells', p: 1299, o: 1599, r: 4.8, rc: 143, st: 17, sales: 420, f: 'fd',
    g: 'unisex', img: ['fitnessDumbbellGrip', 'fitnessCurl'], col: [C.black], sizes: [],
    sd: 'Fifteen dumbbells in one — dial from 2 to 24 kg in seconds.',
    ab: 'Save space in your apartment without compromising your training. Turn the dial to select from 15 weight settings between 2 and 24 kg, and the tray stores everything neatly when you are done.',
    hl: ['15 weight settings, 2–24 kg', 'Dial selection in seconds', 'Compact storage tray included'],
    sp: { Material: 'Steel plates, ABS housing', Weight: '2–24 kg (single dumbbell)', 'Resistance level': '15 increments' },
    at: { equipmentType: 'Free Weights' }, tags: ['dumbbells', 'adjustable', 'home gym'],
  },
  {
    n: 'Domyos Neoprene Dumbbells Pair', b: 'Decathlon', s: 'fitness', sub: 'dumbbells', p: 49, r: 4.5, rc: 233, st: 110, sales: 1200,
    g: 'women', img: ['pinkDumbbell', 'yogaStretch'], col: [C.pink, C.teal], cfg: [['1 kg pair', 0], ['2 kg pair', 20], ['3 kg pair', 40]],
    sd: 'Soft-touch neoprene dumbbells for toning, Pilates and dance cardio.',
    ab: 'Light dumbbells with a comfortable neoprene finish that won’t slip in sweaty hands. Perfect for toning classes, Pilates and physiotherapy routines at home.',
    hl: ['Non-slip neoprene coating', 'Colour-coded by weight', 'Sold in pairs'],
    sp: { Material: 'Cast iron, neoprene coating', Weight: '1–3 kg per dumbbell', 'Resistance level': 'Light' },
    at: { equipmentType: 'Free Weights' }, tags: ['dumbbells', 'toning', 'pilates'],
  },
  {
    n: 'Competition Kettlebell', b: 'Reebok', s: 'fitness', sub: 'kettlebells', p: 149, r: 4.7, rc: 96, st: 45, sales: 380, f: 'n',
    g: 'unisex', img: ['backSquat', 'gymBright'], col: [C.charcoal], cfg: [['8 kg', 0], ['12 kg', 40], ['16 kg', 80], ['20 kg', 120], ['24 kg', 160]],
    sd: 'Steel competition kettlebell with uniform size across weights and a precise handle.',
    ab: 'Every weight shares the same dimensions, so your technique stays consistent as you progress. The smooth, wide handle is ideal for swings, cleans and snatches.',
    hl: ['Uniform size across all weights', 'Smooth powder-coated handle', 'Flat base for stability'],
    sp: { Material: 'Steel, powder-coated', Weight: '8–24 kg', 'Resistance level': 'Fixed weight' },
    at: { equipmentType: 'Free Weights' }, tags: ['kettlebell', 'strength', 'crossfit'],
  },
  {
    n: 'Resistance Band Set (5 Levels)', b: 'Under Armour', s: 'fitness', sub: 'resistance-bands', p: 119, o: 139, r: 4.6, rc: 188, st: 95, sales: 960, f: 'bd',
    g: 'unisex', img: ['dumbbellsBand', 'gymBright'], col: [C.black], sizes: [],
    sd: 'Five colour-coded latex loop bands from extra-light to extra-heavy, with a travel pouch.',
    ab: 'A complete resistance-training kit that fits in a carry-on. Five colour-coded bands cover glute activation, mobility and assisted pull-ups — ideal for hotel rooms and home workouts.',
    hl: ['Five resistance levels (5–40 kg)', 'Natural latex, snap-resistant', 'Travel pouch and exercise guide'],
    sp: { Material: 'Natural latex', Weight: '220 g set', 'Resistance level': 'XL to XH (5–40 kg)' },
    at: { equipmentType: 'Resistance' }, tags: ['bands', 'mobility', 'travel'],
  },
  {
    n: 'Premium Yoga Mat 8mm', b: 'Adidas', s: 'fitness', sub: 'yoga-mats', p: 199, r: 4.7, rc: 154, st: 58, sales: 640, f: 'fn',
    g: 'unisex', img: ['yogaMatRoll', 'yogaMats', 'yogaStretch'], col: [C.charcoal, C.teal, C.purple], sizes: [],
    sd: 'Extra-thick 8 mm mat with a non-slip textured surface and carry strap.',
    ab: 'Extra cushioning for knees and joints on hard floors. The closed-cell surface resists sweat and is easy to wipe clean, and the textured grip holds steady through flows.',
    hl: ['8 mm cushioning', 'Non-slip, closed-cell surface', 'Carry strap included'],
    sp: { Material: 'TPE', Thickness: '8 mm', Dimensions: '183 x 61 cm', Weight: '1.2 kg' },
    at: { equipmentType: 'Yoga & Recovery' }, tags: ['yoga', 'mat', 'pilates'],
  },
  {
    n: 'Kimjaly Comfort Yoga Mat 5mm', b: 'Decathlon', s: 'fitness', sub: 'yoga-mats', p: 89, o: 109, r: 4.5, rc: 402, st: 130, sales: 2400, f: 'bd',
    g: 'unisex', img: ['yogaMats', 'yogaSunset'], col: [C.green, C.grey, C.pink], sizes: [],
    sd: 'Lightweight everyday yoga mat with good grip and 5 mm comfort.',
    ab: 'A dependable mat for studio classes and home practice. Light enough to carry to sunset yoga on the beach, with a grippy surface for standing poses.',
    hl: ['5 mm comfort', 'Lightweight at 900 g', 'Double-sided texture'],
    sp: { Material: 'PVC-free foam', Thickness: '5 mm', Dimensions: '173 x 61 cm' },
    at: { equipmentType: 'Yoga & Recovery' }, tags: ['yoga', 'mat'],
  },
  {
    n: 'SR-4 Indoor Spin Bike', b: 'Reebok', s: 'fitness', sub: 'exercise-equipment', p: 2999, o: 3499, r: 4.6, rc: 57, st: 8, sales: 110, f: 'fd',
    g: 'unisex', img: ['spinBikes', 'gymBright'], col: [C.black], sizes: [],
    sd: 'Studio-style spin bike with a 20 kg flywheel, magnetic resistance and Bluetooth app support.',
    ab: 'Skip the summer heat and ride indoors. A heavy 20 kg flywheel delivers a smooth, road-like feel, while silent magnetic resistance means you can train early without waking the household.',
    hl: ['20 kg flywheel for a smooth ride', 'Silent magnetic resistance (32 levels)', 'Bluetooth — works with popular training apps'],
    sp: { Material: 'Steel frame', Weight: '52 kg', 'Resistance level': '32 magnetic levels', 'Max user weight': '130 kg' },
    at: { equipmentType: 'Cardio' }, tags: ['spin bike', 'cardio', 'home gym'], bulky: true, emirates: ['dubai', 'abu-dhabi', 'sharjah', 'ajman', 'ras-al-khaimah'],
  },
  {
    n: 'Olympic Barbell & Plates Set 60 kg', b: 'Decathlon', s: 'fitness', sub: 'exercise-equipment', p: 1499, r: 4.7, rc: 46, st: 10, sales: 95, f: 'n',
    g: 'unisex', img: ['deadlift', 'plates', 'backSquat'], col: [C.black], sizes: [],
    sd: '20 kg Olympic bar with 40 kg of rubber bumper plates and spring collars.',
    ab: 'The foundation of a serious home gym. A 20 kg Olympic bar with smooth bearings and 40 kg of rubber bumper plates lets you squat, deadlift and press with confidence.',
    hl: ['20 kg Olympic bar (2.2 m)', '40 kg rubber bumper plates', 'Spring collars included'],
    sp: { Material: 'Steel bar, rubber plates', Weight: '60 kg total', 'Resistance level': 'Adjustable' },
    at: { equipmentType: 'Free Weights' }, tags: ['barbell', 'plates', 'strength'], bulky: true,
  },
  {
    n: 'Ab Wheel Pro', b: 'Reebok', s: 'fitness', sub: 'fitness-accessories', p: 79, r: 4.4, rc: 221, st: 75, sales: 1100,
    g: 'unisex', img: ['abRoller', 'gymMono'], col: [C.black], sizes: [],
    sd: 'Dual-wheel ab roller with ergonomic handles and a knee pad.',
    ab: 'One of the most effective core tools available. Dual wheels add stability for beginners, and the foam knee pad cushions hard floors.',
    hl: ['Stable dual-wheel design', 'Ergonomic foam handles', 'Knee pad included'],
    sp: { Material: 'Steel axle, TPR wheels', Weight: '1.1 kg', 'Resistance level': 'Bodyweight' },
    at: { equipmentType: 'Strength Accessories' }, tags: ['core', 'abs'],
  },
  {
    n: 'Doorway Pull-Up Bar', b: 'Adidas', s: 'fitness', sub: 'fitness-accessories', p: 149, r: 4.5, rc: 117, st: 40, sales: 520, f: 'd', o: 179,
    g: 'unisex', img: ['pullupBar', 'gymMono'], col: [C.black], sizes: [],
    sd: 'No-screw doorway pull-up bar with multiple grip positions.',
    ab: 'Install in seconds without tools or drilling — ideal for rental apartments. Multiple grip positions let you train wide pull-ups, chin-ups and neutral-grip rows.',
    hl: ['No screws or drilling', 'Wide, narrow and neutral grips', 'Supports up to 130 kg'],
    sp: { Material: 'Steel with foam grips', Weight: '2.4 kg', 'Resistance level': 'Bodyweight', 'Max load': '130 kg' },
    at: { equipmentType: 'Strength Accessories' }, tags: ['pull-up', 'calisthenics', 'home gym'],
  },
  {
    n: 'Speed Rope 2.0', b: 'Nike', s: 'fitness', sub: 'fitness-accessories', p: 69, r: 4.4, rc: 188, st: 100, sales: 870,
    g: 'unisex', img: ['fitnessRopes', 'fitnessTrainer'], col: [C.black, C.volt], sizes: [],
    sd: 'Adjustable speed rope with ball-bearing handles for fast, smooth rotations.',
    ab: 'Burn serious calories in a small space. Ball-bearing handles spin smoothly for double-unders, and the cable length adjusts in seconds to suit your height.',
    hl: ['Ball-bearing handles', 'Adjustable cable length', 'Weighted handles for rhythm'],
    sp: { Material: 'Coated steel cable', Weight: '180 g', 'Resistance level': 'Cardio' },
    at: { equipmentType: 'Cardio' }, tags: ['skipping', 'cardio', 'conditioning'],
  },

  // ===================== CYCLING =====================
  {
    n: 'Allez Sport Road Bike', b: 'Specialized', s: 'cycling', sub: 'bicycles', p: 4999, o: 5699, r: 4.8, rc: 39, st: 9, sales: 60, f: 'fd',
    g: 'unisex', img: ['bikeRoadWall', 'bikeBlack', 'cyclistsCoast'], col: [C.black, C.red], sizes: ['52 cm', '54 cm', '56 cm', '58 cm'],
    sd: 'Aluminium road bike with Shimano Sora 2x9 gearing — perfect for Al Qudra and Meydan loops.',
    ab: 'A light, responsive aluminium frame with a carbon fork that smooths out the road buzz. Shimano Sora 18-speed gearing has the range for both flat desert cycle tracks and the climb to Jebel Hafeet.',
    hl: ['E5 premium aluminium frame', 'Carbon fork', 'Shimano Sora 2x9 drivetrain'],
    sp: { 'Frame type': 'E5 aluminium road', 'Wheel size': '700c', Gearing: 'Shimano Sora 2x9', Weight: '9.4 kg (56 cm)' },
    tags: ['road bike', 'bike', 'al qudra'], bulky: true,
  },
  {
    n: 'Sirrus 2.0 Hybrid Bike', b: 'Specialized', s: 'cycling', sub: 'bicycles', p: 2499, r: 4.6, rc: 28, st: 12, sales: 45, f: 'n',
    g: 'unisex', img: ['bikeCommuter', 'bikeUrban'], col: [C.charcoal, C.white], sizes: ['S', 'M', 'L'],
    sd: 'Fast, comfortable fitness hybrid with flat bars and hydraulic disc brakes.',
    ab: 'A versatile hybrid for fitness rides, commuting through Downtown or weekend laps at Hudayriyat Island. Hydraulic disc brakes give confident stopping, and the upright position keeps rides comfortable.',
    hl: ['Lightweight A1 aluminium frame', 'Hydraulic disc brakes', 'Upright, comfortable geometry'],
    sp: { 'Frame type': 'A1 aluminium hybrid', 'Wheel size': '700c', Gearing: 'Shimano 1x8', Weight: '11.2 kg (M)' },
    tags: ['hybrid', 'bike', 'commuter'], bulky: true,
  },
  {
    n: 'Triban RC120 Road Bike', b: 'Decathlon', s: 'cycling', sub: 'bicycles', p: 1899, o: 2199, r: 4.6, rc: 214, st: 14, sales: 300, f: 'bd',
    g: 'unisex', img: ['bikeWhite', 'bikeStudio'], col: [C.white, C.navy], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sd: 'The best-value entry road bike: comfortable geometry, disc brakes and 16 gears.',
    ab: 'The ideal first road bike. A comfortable endurance geometry, mechanical disc brakes and a wide gear range make it easy to build your fitness — and our Dubai workshop pre-assembles every bike.',
    hl: ['Endurance geometry', 'Mechanical disc brakes', 'Pre-assembled and tuned in Dubai'],
    sp: { 'Frame type': '6061 aluminium endurance', 'Wheel size': '700c', Gearing: 'microSHIFT 2x8', Weight: '10.2 kg (M)' },
    tags: ['road bike', 'bike', 'beginner'], bulky: true,
  },
  {
    n: 'Align II MIPS Helmet', b: 'Specialized', s: 'cycling', sub: 'cycling-helmets', p: 249, r: 4.7, rc: 133, st: 48, sales: 640, f: 'b',
    g: 'unisex', img: ['cyclistsCoast', 'cyclingPeloton'], col: [C.black, C.white], sizes: ['S/M', 'M/L', 'XL'],
    sd: 'MIPS-equipped helmet with an integrated visor and easy-adjust fit system.',
    ab: 'Proven protection for every ride. A MIPS liner helps reduce rotational forces in certain impacts, and the Headset SX fit system makes dialling in a secure fit quick and easy.',
    hl: ['MIPS rotational impact protection', 'Integrated visor', 'Headset SX fit system'],
    sp: { Certification: 'CE EN 1078', Technology: 'MIPS', Weight: '340 g (M/L)' },
    tags: ['helmet', 'safety'],
  },
  {
    n: 'Van Rysel Racer Cycling Jersey', b: 'Decathlon', s: 'cycling', sub: 'cycling-jerseys', p: 149, r: 4.5, rc: 87, st: 60, sales: 380,
    g: 'men', img: ['cyclingPeloton', 'cyclistForest'], col: [C.navy, C.red], sizes: CLOTH,
    sd: 'Aero-fit jersey with breathable mesh panels and three rear pockets.',
    ab: 'A close-fitting jersey that stays cool on long desert rides. Mesh side panels ventilate, a full-length zip lets you dump heat on climbs, and three rear pockets carry nutrition and a phone.',
    hl: ['Breathable mesh side panels', 'Full-length zip', 'Three rear pockets + zip pocket'],
    sp: { Material: 'Recycled polyester', Fit: 'Race fit', 'UV protection': 'UPF 50+' },
    tags: ['jersey', 'apparel', 'cycling kit'],
  },
  {
    n: 'Van Rysel Endurance Bib Shorts', b: 'Decathlon', s: 'cycling', sub: 'cycling-shorts', p: 199, r: 4.6, rc: 69, st: 44, sales: 260, f: 'n',
    g: 'men', img: ['cyclistForest', 'bikeGravel'], col: [C.black], sizes: CLOTH,
    sd: 'Multi-density chamois bib shorts for comfort on 100 km+ rides.',
    ab: 'Comfort that lasts from the first kilometre to the hundredth. A multi-density chamois supports sit bones, and the mesh bib straps keep everything in place without overheating.',
    hl: ['Multi-density endurance chamois', 'Breathable mesh bibs', 'Silicone leg grippers'],
    sp: { Material: 'Polyamide / elastane', Chamois: 'Endurance multi-density', 'UV protection': 'UPF 50+' },
    tags: ['bib shorts', 'apparel', 'cycling kit'],
  },
  {
    n: 'Varia RTL515 Radar Tail Light', b: 'Garmin', s: 'cycling', sub: 'cycling-lights', p: 799, r: 4.8, rc: 58, st: 16, sales: 130, f: 'n',
    g: 'unisex', img: ['bikeUrban', 'bikeGravel'], col: [C.black], sizes: [],
    sd: 'Rear-view radar that warns of approaching vehicles up to 140 m behind.',
    ab: 'Ride safer on shared roads. The radar alerts you to vehicles approaching from behind on your bike computer or phone, while the tail light is visible up to 1.6 km away in daylight.',
    hl: ['Radar alerts up to 140 m', 'Daylight-visible tail light', 'Up to 16 hours battery'],
    sp: { Visibility: 'Up to 1.6 km', Battery: 'Up to 16 h', Connectivity: 'ANT+ / Bluetooth' },
    tags: ['light', 'radar', 'safety'],
  },
  {
    n: 'Body Geometry Sport Gel Gloves', b: 'Specialized', s: 'cycling', sub: 'cycling-gloves', p: 129, r: 4.5, rc: 74, st: 52, sales: 290,
    g: 'unisex', img: ['bikeGravel', 'cyclistsCoast'], col: [C.black, C.red], sizes: ['S', 'M', 'L', 'XL'],
    sd: 'Short-finger gloves with Body Geometry gel pads to reduce hand numbness.',
    ab: 'Ergonomically placed gel pads relieve pressure on the ulnar nerve, reducing numbness on long rides, while the breathable mesh back keeps hands cool.',
    hl: ['Body Geometry gel pads', 'Breathable mesh back', 'Easy-off finger pulls'],
    sp: { Material: 'Synthetic leather palm, mesh back', Padding: 'Gel' },
    tags: ['gloves', 'comfort'],
  },

  // ===================== SWIMMING =====================
  {
    n: 'Futura Biofuse Flexiseal Goggles', b: 'Speedo', s: 'swimming', sub: 'goggles', p: 99, r: 4.6, rc: 342, st: 120, sales: 2200, f: 'b',
    g: 'unisex', img: ['swimCapGoggles', 'swimButterfly'], col: [C.black, C.blue, C.pink], sizes: [],
    sd: 'Comfortable, leak-free training goggles with anti-fog lenses and UV protection.',
    ab: 'Flexiseal technology creates a comfortable, leak-free seal, and anti-fog lenses with UV protection keep your vision clear in outdoor pools and open water at JBR.',
    hl: ['Flexiseal leak-free seal', 'Anti-fog, UV-protected lenses', 'Easy-adjust split strap'],
    sp: { Lens: 'Polycarbonate, anti-fog', 'UV protection': 'Yes', Strap: 'Split silicone' },
    tags: ['goggles', 'training'],
  },
  {
    n: 'Endurance+ Medalist Swimsuit', b: 'Speedo', s: 'swimming', sub: 'swimwear', p: 199, o: 229, r: 4.7, rc: 154, st: 64, sales: 590, f: 'd',
    g: 'women', img: ['swimLane', 'swimOpenWater'], col: [C.navy, C.black, C.purple], sizes: CLOTH_W,
    sd: 'Chlorine-resistant training swimsuit that lasts up to 20 times longer than regular fabric.',
    ab: 'Endurance+ fabric resists chlorine, sun cream and oils, holding its shape and colour through hundreds of pool sessions. The medalist back gives freedom through the shoulders.',
    hl: ['Endurance+ 100% chlorine resistant', 'Medalist back for shoulder freedom', 'UPF 50+ sun protection'],
    sp: { Material: 'Endurance+ (polyester / PBT)', Fit: 'Training', 'UV protection': 'UPF 50+' },
    tags: ['swimsuit', 'swimwear', 'training'],
  },
  {
    n: 'Hyperboom Jammer', b: 'Speedo', s: 'swimming', sub: 'swimwear', p: 179, r: 4.5, rc: 88, st: 58, sales: 360, f: 'n',
    g: 'men', img: ['swimDive', 'swimLanesAerial'], col: [C.navy, C.black], sizes: ['28', '30', '32', '34', '36'],
    sd: 'Chlorine-resistant jammer with a bold Hyperboom print for training and club racing.',
    ab: 'A durable training jammer with knee-length coverage and a secure drawcord waist. Endurance+ fabric resists fading in chlorine and sun.',
    hl: ['Endurance+ chlorine resistance', 'Knee-length jammer cut', 'Internal drawcord'],
    sp: { Material: 'Endurance+', Fit: 'Jammer', 'UV protection': 'UPF 50+' },
    tags: ['jammer', 'swimwear'],
  },
  {
    n: 'Plain Moulded Silicone Swim Cap', b: 'Speedo', s: 'swimming', sub: 'swimming-caps', p: 45, r: 4.6, rc: 197, st: 150, sales: 1500,
    g: 'unisex', img: ['swimButterfly', 'swimCapGoggles'], col: [C.black, C.white, C.blue, C.pink], sizes: [],
    sd: 'Durable moulded silicone cap — snag-free and easy to put on.',
    ab: 'Moulded silicone means fewer creases and less drag. Gentle on hair, comfortable for long sessions, and tough enough to last a full season.',
    hl: ['Moulded silicone, wrinkle-free', 'Easy on, easy off', 'Reduces drag'],
    sp: { Material: '100% silicone', Fit: 'One size' },
    tags: ['cap', 'swim cap'],
  },
  {
    n: 'Nabaiji Kickboard & Pull Buoy Set', b: 'Decathlon', s: 'swimming', sub: 'swimming-training', p: 79, o: 95, r: 4.5, rc: 121, st: 70, sales: 480, f: 'd',
    g: 'unisex', img: ['swimLanesAerial', 'swimLane'], col: [C.blue], sizes: [],
    sd: 'Closed-cell foam kickboard and pull buoy for leg and upper-body drills.',
    ab: 'Two essential training aids in one set. Use the kickboard to isolate your legs, and the pull buoy to focus on your stroke and upper-body strength.',
    hl: ['Closed-cell EVA foam', 'Ergonomic hand grips', 'Mesh carry bag'],
    sp: { Material: 'EVA foam', Contents: 'Kickboard + pull buoy' },
    tags: ['kickboard', 'pull buoy', 'training'],
  },
  {
    n: 'Nabaiji Microfibre Towel L', b: 'Decathlon', s: 'swimming', sub: 'swim-towels', p: 69, r: 4.4, rc: 205, st: 110, sales: 1300, f: 'b',
    g: 'unisex', img: ['swimDive', 'swimOpenWater'], col: [C.blue, C.teal, C.grey], sizes: [],
    sd: 'Ultra-compact, quick-dry microfibre towel that packs down to the size of a water bottle.',
    ab: 'Absorbs up to four times its weight in water and dries twice as fast as cotton — ideal for the pool, the beach and travel.',
    hl: ['Quick-dry microfibre', 'Compact carry pouch', 'Large 80 x 130 cm'],
    sp: { Material: 'Microfibre', Dimensions: '80 x 130 cm', Weight: '220 g' },
    tags: ['towel', 'travel'],
  },
  {
    n: 'Fury Training Fins', b: 'Speedo', s: 'swimming', sub: 'swimming-accessories', p: 129, r: 4.5, rc: 63, st: 40, sales: 210, f: 'n',
    g: 'unisex', img: ['swimLane', 'swimButterfly'], col: [C.black, C.yellow], sizes: ['36-37', '38-39', '40-41', '42-43', '44-45'],
    sd: 'Short-blade training fins for building leg strength and ankle flexibility.',
    ab: 'Short blades keep your kick rate high and natural, building leg strength and ankle flexibility without straining your knees.',
    hl: ['Short blade for natural kick', 'Soft, comfortable foot pocket', 'Drainage vents'],
    sp: { Material: 'Silicone / TPR', Blade: 'Short' },
    tags: ['fins', 'training'],
  },

  // ===================== BOXING =====================
  {
    n: 'Pro Style Training Gloves', b: 'Everlast', s: 'boxing', sub: 'boxing-gloves', p: 199, r: 4.6, rc: 402, st: 90, sales: 1900, f: 'fb',
    g: 'unisex', img: ['boxingGloveFloor', 'boxingGlovesDark'], col: [C.black, C.red], cfg: [['10 oz', 0], ['12 oz', 10], ['14 oz', 20], ['16 oz', 30]],
    sd: 'Versatile training gloves with layered foam padding for bag work and pad sessions.',
    ab: 'A reliable all-round glove for boxing fitness classes and bag work. Layered foam distributes impact, the full-wrap hook-and-loop closure provides wrist support, and the mesh palm keeps hands cooler.',
    hl: ['Layered foam padding', 'Full-wrap wrist closure', 'Breathable mesh palm'],
    sp: { Material: 'Synthetic leather', Padding: 'Layered foam', Closure: 'Hook and loop' },
    tags: ['gloves', 'boxing', 'training'],
  },
  {
    n: 'Speed 500 Boxing Gloves', b: 'Adidas', s: 'boxing', sub: 'boxing-gloves', p: 349, o: 399, r: 4.7, rc: 112, st: 34, sales: 410, f: 'nd',
    g: 'unisex', img: ['boxingGloveBench', 'boxingWoman'], col: [C.black, C.white], cfg: [['12 oz', 0], ['14 oz', 15], ['16 oz', 30]],
    sd: 'Premium sparring gloves with Flash Dry lining and injected-moulded foam.',
    ab: 'Built for sparring and serious training. Injected-moulded foam spreads impact evenly to protect both you and your partner, and Flash Dry lining fights moisture and odour.',
    hl: ['Injected-moulded foam', 'Flash Dry moisture-wicking lining', 'Pre-curved for natural fist'],
    sp: { Material: 'PU leather', Padding: 'Injected-moulded foam', Closure: 'Hook and loop' },
    tags: ['gloves', 'sparring'],
  },
  {
    n: 'Heavy Bag 100 lb', b: 'Everlast', s: 'boxing', sub: 'punch-bags', p: 899, o: 1049, r: 4.7, rc: 64, st: 9, sales: 120, f: 'd',
    g: 'unisex', img: ['boxingClass', 'boxingGlovesDark'], col: [C.black], sizes: [],
    sd: 'Pre-filled 100 lb heavy bag with heavy-duty nylon straps and swivel.',
    ab: 'Pre-filled with a blend of fibres and sand for a solid, consistent feel. Heavy-duty nylon straps and a swivel chain allow natural movement and quick installation.',
    hl: ['Pre-filled, 100 lb (45 kg)', 'Heavy-duty nylon straps', 'Chain and swivel included'],
    sp: { Weight: '45 kg', Height: '120 cm', Material: 'Nevatear synthetic' },
    tags: ['heavy bag', 'home gym'], bulky: true, emirates: ['dubai', 'abu-dhabi', 'sharjah', 'ajman', 'ras-al-khaimah'],
  },
  {
    n: '180" Hand Wraps', b: 'Everlast', s: 'boxing', sub: 'hand-wraps', p: 39, r: 4.7, rc: 488, st: 260, sales: 3400, f: 'b',
    g: 'unisex', img: ['boxingWoman', 'boxingGloveFloor'], col: [C.black, C.red, C.blue], sizes: [],
    sd: 'Semi-elastic 180-inch hand wraps for knuckle and wrist support.',
    ab: 'Your first line of defence against hand injuries. Semi-elastic cotton blend conforms to your hand, with thumb loop and hook-and-loop closure.',
    hl: ['180" length for full support', 'Semi-elastic cotton blend', 'Thumb loop and closure'],
    sp: { Length: '180 in (4.5 m)', Material: 'Cotton / polyester blend' },
    tags: ['wraps', 'protection'],
  },
  {
    n: 'Adistar Pro Head Guard', b: 'Adidas', s: 'boxing', sub: 'head-guards', p: 279, r: 4.5, rc: 41, st: 18, sales: 110, f: 'n',
    g: 'unisex', img: ['boxingPads', 'boxingClass'], col: [C.red, C.blue], sizes: ['S', 'M', 'L'],
    sd: 'Competition-style head guard with full cheek protection and adjustable fit.',
    ab: 'Shock-absorbing foam surrounds the head and cheeks, and a laced crown with chin strap gives a secure, customisable fit for sparring.',
    hl: ['Shock-absorbing foam', 'Full cheek protection', 'Adjustable lace and chin strap'],
    sp: { Material: 'PU leather', Padding: 'Multi-layer foam' },
    tags: ['head guard', 'sparring', 'protection'],
  },
  {
    n: 'Protex Shin Instep Guards', b: 'Everlast', s: 'boxing', sub: 'protective-equipment', p: 179, r: 4.4, rc: 37, st: 0, sales: 95,
    g: 'unisex', img: ['boxingGloveBench', 'boxingPads'], col: [C.black], sizes: ['S/M', 'L/XL'],
    sd: 'Shin and instep protectors for Muay Thai and kickboxing.',
    ab: 'Dense foam padding protects shins and insteps during kick drills and sparring, while elastic sleeves keep the guards secure.',
    hl: ['Dense foam padding', 'Instep protection', 'Secure elastic fit'],
    sp: { Material: 'Synthetic leather', Padding: 'Dense foam' },
    tags: ['muay thai', 'kickboxing', 'protection'],
  },
  {
    n: 'Outshock Curved Focus Mitts', b: 'Decathlon', s: 'boxing', sub: 'combat-training', p: 129, o: 149, r: 4.5, rc: 92, st: 40, sales: 350, f: 'd',
    g: 'unisex', img: ['boxingPads', 'boxingWoman'], col: [C.black], sizes: [],
    sd: 'Curved focus mitts for partner pad work and combination drills.',
    ab: 'Curved shape catches punches naturally and protects the holder’s wrists. Ideal for partner drills at home or personal training sessions.',
    hl: ['Curved catching surface', 'Padded wrist support', 'Sold as a pair'],
    sp: { Material: 'PU', Padding: 'High-density foam' },
    tags: ['mitts', 'pads', 'partner training'],
  },

  // ===================== OUTDOOR =====================
  {
    n: 'VECTIV Fastpack Hiking Boots', b: 'The North Face', s: 'outdoor', sub: 'hiking', p: 799, o: 899, r: 4.7, rc: 66, st: 20, sales: 170, f: 'fd',
    g: 'men', img: ['hikingBoots', 'hikerValley'], col: [C.sand, C.charcoal], sizes: SHOE,
    sd: 'Lightweight waterproof hiking boot with a VECTIV rocker for propulsion on rough trails.',
    ab: 'Ready for the rocky scrambles of the Hajar Mountains. A FUTURELIGHT waterproof-breathable upper keeps feet dry in wadis, and the VECTIV 3D plate stabilises every step on uneven ground.',
    hl: ['FUTURELIGHT waterproof-breathable', 'VECTIV 3D rocker plate', 'SURFACECTRL grippy rubber'],
    sp: { Upper: 'FUTURELIGHT', Outsole: 'SURFACECTRL rubber', Weight: '520 g (UK 9)' },
    tags: ['boots', 'hiking', 'waterproof', 'hatta'], also: [['sports-shoes', 'outdoor-shoes']],
  },
  {
    n: 'Quechua 2 Seconds Easy Tent 3P', b: 'Decathlon', s: 'outdoor', sub: 'camping', p: 549, o: 649, r: 4.7, rc: 288, st: 25, sales: 720, f: 'bd',
    g: 'unisex', img: ['tentView', 'tentStars', 'campCanyon'], col: [C.sand, C.green], sizes: [],
    sd: 'Pop-up 3-person tent that pitches in seconds — made for desert and mountain weekends.',
    ab: 'Throw it, and it pitches itself. The Fresh & Black fabric blocks 99% of daylight and keeps the interior cooler — a game-changer for sunrise lie-ins on desert camping trips.',
    hl: ['Pitches in 2 seconds', 'Fresh & Black fabric keeps it cool and dark', 'Wind-resistant up to 50 km/h'],
    sp: { Capacity: '3 people', 'Packed size': '79 x 79 x 13 cm', Weight: '4.4 kg' },
    tags: ['tent', 'camping', 'desert'],
  },
  {
    n: 'Forclaz Trek 100 Backpack 50L', b: 'Decathlon', s: 'outdoor', sub: 'backpacks', p: 299, r: 4.6, rc: 141, st: 33, sales: 360, f: 'n',
    g: 'unisex', img: ['backpackGreen', 'hikingTrail'], col: [C.green, C.charcoal], sizes: [],
    sd: 'Comfortable 50 L trekking pack with an adjustable back system and rain cover.',
    ab: 'Carry everything you need for multi-day trekking. The adjustable back system fits a wide range of torso lengths, and the integrated rain cover protects your kit in mountain storms.',
    hl: ['Adjustable back length', 'Integrated rain cover', 'Hip-belt pockets'],
    sp: { Capacity: '50 L', Weight: '1.6 kg', Material: 'Polyester' },
    tags: ['backpack', 'trekking'],
  },
  {
    n: 'Borealis Backpack 28L', b: 'The North Face', s: 'outdoor', sub: 'backpacks', p: 449, r: 4.7, rc: 207, st: 37, sales: 560, f: 'b',
    g: 'unisex', img: ['backpackNavy', 'backpackRugged'], col: [C.navy, C.black], sizes: [],
    sd: 'Iconic everyday backpack with FlexVent suspension and a padded laptop sleeve.',
    ab: 'From the office to the trailhead. The FlexVent suspension system is cushioned and breathable, and a padded laptop sleeve and organiser pockets keep daily essentials sorted.',
    hl: ['FlexVent suspension', 'Padded 15" laptop sleeve', 'Bungee cord external storage'],
    sp: { Capacity: '28 L', Weight: '1.1 kg', Material: 'Recycled polyester' },
    tags: ['backpack', 'everyday'],
  },
  {
    n: 'Flight Lightriser Wind Jacket', b: 'The North Face', s: 'outdoor', sub: 'outdoor-clothing', p: 549, o: 629, r: 4.5, rc: 39, st: 22, sales: 90, f: 'nd',
    g: 'men', img: ['bomberJacket', 'mountainLake'], col: [C.sand, C.black], sizes: CLOTH,
    sd: 'Packable windproof jacket for cool mountain mornings and desert evenings.',
    ab: 'Winter evenings in the desert and early starts on Jebel Jais can be surprisingly cold. This featherweight windproof shell packs into its own pocket and blocks the chill without overheating.',
    hl: ['Windproof, water-repellent shell', 'Packs into its own pocket', 'Adjustable hood'],
    sp: { Material: 'Recycled nylon ripstop', Weight: '120 g', Fit: 'Athletic' },
    tags: ['jacket', 'windproof', 'packable'], also: [['sportswear', 'jackets']],
  },
  {
    n: 'Quechua BL200 Rechargeable Lantern', b: 'Decathlon', s: 'outdoor', sub: 'outdoor-accessories', p: 79, r: 4.6, rc: 175, st: 90, sales: 900, f: 'b',
    g: 'unisex', img: ['campfire', 'campTrailer'], col: [C.sand], sizes: [],
    sd: 'USB-rechargeable camping lantern with 200 lumens and a warm-light mode.',
    ab: 'Light up the campsite. Warm and cool light modes, a hanging hook and a USB-C rechargeable battery make it perfect for camping in Liwa or the Hatta mountains.',
    hl: ['200 lumens, two colour modes', 'USB-C rechargeable', 'Up to 24 hours runtime'],
    sp: { Output: '200 lumens', Battery: 'Li-ion, up to 24 h', Charging: 'USB-C' },
    tags: ['lantern', 'camping', 'light'],
  },
  {
    n: 'Forclaz MT500 Trekking Poles', b: 'Decathlon', s: 'outdoor', sub: 'hiking', p: 149, r: 4.5, rc: 82, st: 41, sales: 260,
    g: 'unisex', img: ['hikingTrail', 'mountainLake'], col: [C.charcoal], sizes: [],
    sd: 'Adjustable aluminium trekking poles with cork grips and quick-lock clamps (pair).',
    ab: 'Take load off your knees on long descents. Cork grips absorb sweat, and quick-lock clamps let you adjust length on the go.',
    hl: ['Cork grips', 'Quick-lock adjusters', 'Sold as a pair'],
    sp: { Material: 'Aluminium', Length: '100–135 cm', Weight: '470 g (pair)' },
    tags: ['poles', 'hiking'],
  },

  // ===================== SPORTSWEAR =====================
  {
    n: 'Dri-FIT Legend Training Tee', b: 'Nike', s: 'fitness', c: 'sportswear', sub: 't-shirts', p: 119, r: 4.6, rc: 612, st: 180, sales: 4200, f: 'fb',
    g: 'unisex', gv: ['men', 'women'], img: ['teeBlack', 'teeWhite'], col: [C.black, C.white], sizes: CLOTH,
    sd: 'The gym staple — soft Dri-FIT tee that keeps you dry through every set.',
    ab: 'Soft, breathable and sweat-wicking. The Dri-FIT Legend tee is the go-to for gym sessions, bootcamps and everyday training.',
    hl: ['Dri-FIT moisture-wicking', 'Soft, lightweight jersey', 'Men’s and women’s fits'],
    sp: { Material: '100% polyester', Fit: 'Standard', Technology: 'Dri-FIT' },
    tags: ['tee', 't-shirt', 'gym'],
  },
  {
    n: 'Essentials 3-Stripes Tracksuit', b: 'Adidas', s: 'fitness', c: 'sportswear', sub: 'tracksuits', p: 349, o: 399, r: 4.6, rc: 188, st: 50, sales: 640, f: 'bd',
    g: 'women', img: ['tracksuitYellow', 'sweatWhite'], col: [C.yellow, C.white, C.black], sizes: CLOTH_W,
    sd: 'Classic two-piece tracksuit in soft tricot with the iconic 3-Stripes.',
    ab: 'A timeless tracksuit for warm-ups, travel and weekend errands. Soft tricot fabric, zipped pockets and ribbed cuffs.',
    hl: ['Soft tricot fabric', 'Zip pockets', 'Ribbed cuffs and hem'],
    sp: { Material: 'Recycled polyester tricot', Fit: 'Regular' },
    tags: ['tracksuit', 'athleisure'],
  },
  {
    n: 'Evostripe High-Waist Joggers', b: 'Puma', s: 'fitness', c: 'sportswear', sub: 'training-clothing', p: 229, r: 4.4, rc: 77, st: 46, sales: 280, f: 'n',
    g: 'women', img: ['joggersPink', 'sweatWhite'], col: [C.pink, C.grey], sizes: CLOTH_W,
    sd: 'Relaxed, high-waisted joggers in soft dryCELL fabric for training and lounging.',
    ab: 'High-waisted and comfortable with a tapered leg. dryCELL fabric wicks moisture, so they work as well in the gym as on the sofa.',
    hl: ['High-rise waistband', 'dryCELL moisture-wicking', 'Tapered leg with cuffs'],
    sp: { Material: 'Cotton / polyester blend', Fit: 'Relaxed' },
    tags: ['joggers', 'athleisure'],
  },
  {
    n: 'Rival Fleece Hoodie', b: 'Under Armour', s: 'fitness', c: 'sportswear', sub: 'training-clothing', p: 249, o: 289, r: 4.7, rc: 241, st: 62, sales: 990, f: 'bd',
    g: 'men', img: ['hoodieGrey', 'sweatWhite'], col: [C.grey, C.black, C.navy], sizes: CLOTH,
    sd: 'Ultra-soft cotton-blend fleece hoodie for warm-ups and cool winter evenings.',
    ab: 'Soft, warm and light. The brushed interior traps heat for winter evenings and air-conditioned gyms, and the kangaroo pocket keeps essentials close.',
    hl: ['Brushed fleece interior', 'Kangaroo pocket', 'Ribbed cuffs and hem'],
    sp: { Material: '80% cotton, 20% polyester', Fit: 'Loose' },
    tags: ['hoodie', 'fleece', 'winter'],
  },
  {
    n: 'Athletics Woven Jacket', b: 'New Balance', s: 'running', c: 'sportswear', sub: 'jackets', p: 399, r: 4.5, rc: 36, st: 28, sales: 85, f: 'n',
    g: 'unisex', img: ['bomberJacket', 'runningSunset'], col: [C.sand, C.black], sizes: CLOTH,
    sd: 'Lightweight water-resistant woven jacket with a relaxed athletic fit.',
    ab: 'A packable layer for windy runs along the Corniche and cooler evenings. Water-resistant woven fabric, zip pockets and an adjustable hem.',
    hl: ['Water-resistant woven shell', 'Zip hand pockets', 'Adjustable hem'],
    sp: { Material: 'Recycled polyester', Fit: 'Relaxed' },
    tags: ['jacket', 'lightweight'],
  },
  {
    n: 'One High-Waisted Leggings', b: 'Nike', s: 'fitness', c: 'sportswear', sub: 'leggings', p: 219, r: 4.7, rc: 356, st: 80, sales: 1800, f: 'fb',
    g: 'women', img: ['yogaPlank', 'yogaStretch'], col: [C.black, C.navy, C.olive], sizes: CLOTH_W,
    sd: 'Buttery-soft high-waisted leggings with Dri-FIT and a hidden waistband pocket.',
    ab: 'Soft, squat-proof and supportive. The high-rise waistband stays in place through yoga flows and HIIT, and a hidden pocket holds your locker key.',
    hl: ['Squat-proof, opaque fabric', 'High-rise waistband', 'Hidden waistband pocket'],
    sp: { Material: '83% polyester, 17% spandex', Fit: 'Tight', Technology: 'Dri-FIT' },
    tags: ['leggings', 'yoga', 'gym'],
  },
  {
    n: 'Launch 7" Running Shorts', b: 'Under Armour', s: 'running', c: 'sportswear', sub: 'shorts', p: 159, o: 179, r: 4.5, rc: 98, st: 70, sales: 520, f: 'd',
    g: 'men', img: ['runningRoad', 'runningStairs'], col: [C.black, C.blue], sizes: CLOTH,
    sd: 'Lightweight running shorts with a built-in liner and zip back pocket.',
    ab: 'Light, stretchy and quick-drying with a comfortable built-in brief liner. A zip back pocket keeps keys and cards secure on long runs.',
    hl: ['Built-in brief liner', 'Zip back pocket', 'Reflective details'],
    sp: { Material: 'Polyester / elastane', Inseam: '7 in', Fit: 'Standard' },
    tags: ['shorts', 'running'],
  },
  {
    n: 'Performance Graphic Tee', b: 'Adidas', s: 'football', c: 'sportswear', sub: 't-shirts', p: 129, r: 4.3, rc: 54, st: 75, sales: 240,
    g: 'unisex', img: ['teePrint', 'teeWhite'], col: [C.sand, C.white], sizes: CLOTH,
    sd: 'Soft cotton-blend graphic tee for training and everyday wear.',
    ab: 'A relaxed, soft tee with a bold retro graphic — made for warm-ups, travel days and everyday wear.',
    hl: ['Soft cotton-blend jersey', 'Relaxed fit', 'Screen-printed graphic'],
    sp: { Material: '60% cotton, 40% recycled polyester', Fit: 'Relaxed' },
    tags: ['tee', 'graphic'],
  },

  // ===================== SPORTS SHOES =====================
  {
    n: 'Metcon 9 Training Shoes', b: 'Nike', s: 'fitness', c: 'sports-shoes', sub: 'training-shoes', p: 599, r: 4.8, rc: 276, st: 34, sales: 1150, f: 'fb',
    g: 'men', img: ['shoeGreyFloating', 'fitnessGym'], col: [C.grey, C.black], sizes: SHOE,
    sd: 'Stable, flat training shoe with a Hyperlift heel and rope-climb-ready grip.',
    ab: 'The gold standard for functional fitness. A wide, flat heel keeps you planted for heavy lifts, and the rubber wrap grips the rope during climbs.',
    hl: ['Stable Hyperlift heel plate', 'Rope-climb rubber wrap', 'Breathable mesh upper'],
    sp: { Cushioning: 'React foam (forefoot)', Drop: '4 mm', Use: 'Lifting & HIIT' },
    tags: ['training shoes', 'crossfit', 'gym'], also: [['fitness', 'fitness-accessories']],
  },
  {
    n: 'Nano X4 Training Shoes', b: 'Reebok', s: 'fitness', c: 'sports-shoes', sub: 'training-shoes', p: 549, o: 649, r: 4.7, rc: 154, st: 29, sales: 540, f: 'nd',
    g: 'unisex', img: ['shoeTan', 'backSquat'], col: [C.sand, C.black], sizes: SHOE,
    sd: 'Versatile cross-training shoe with Floatride Energy Foam and a lift-ready base.',
    ab: 'Equally at home under a barbell or on a sprint. Floatride Energy Foam cushions jumps and runs, while the wide heel clip keeps you stable during lifts.',
    hl: ['Floatride Energy Foam', 'Lift-and-run chassis', 'Durable Flexweave knit upper'],
    sp: { Cushioning: 'Floatride Energy Foam', Drop: '7 mm', Use: 'Cross-training' },
    tags: ['training shoes', 'crossfit'],
  },
  {
    n: 'Court Vision Low Trainers', b: 'Nike', s: 'basketball', c: 'sports-shoes', sub: 'training-shoes', p: 329, o: 379, r: 4.5, rc: 302, st: 64, sales: 1700, f: 'bd',
    g: 'unisex', img: ['shoeWhiteStreet', 'shoeHighTop'], col: [C.white, C.black], sizes: SHOE,
    sd: 'Retro basketball-inspired low-top with a crisp leather upper.',
    ab: 'Inspired by 80s court classics, the Court Vision Low pairs a crisp leather-and-synthetic upper with a cushioned foam midsole for all-day comfort.',
    hl: ['Leather and synthetic upper', 'Foam midsole', 'Rubber cupsole'],
    sp: { Upper: 'Leather / synthetic', Midsole: 'Foam', Use: 'Lifestyle & light training' },
    tags: ['trainers', 'lifestyle', 'retro'],
  },
  {
    n: 'Velocity Nitro 3 Running Shoes', b: 'Puma', s: 'running', c: 'sports-shoes', sub: 'running-shoes', p: 449, o: 529, r: 4.6, rc: 121, st: 36, sales: 470, f: 'd',
    g: 'women', img: ['shoePastel', 'runningSunset'], col: [C.pink, C.sky], sizes: SHOE,
    sd: 'Responsive daily trainer with NITRO foam and PUMAGRIP outsole.',
    ab: 'A lively, versatile trainer for daily miles and tempo efforts. Nitrogen-infused NITRO foam is light and bouncy, and PUMAGRIP rubber holds on wet and dry roads.',
    hl: ['NITRO nitrogen-infused foam', 'PUMAGRIP outsole', 'Engineered mesh upper'],
    sp: { Cushioning: 'NITRO foam', 'Running type': 'Road — daily trainer', Drop: '10 mm', Weight: '230 g (UK 5)' },
    at: { runningType: 'Road' }, tags: ['shoes', 'daily trainer'], also: [['running', 'running-shoes']],
  },
  {
    n: 'Gel-Kayano 31', b: 'ASICS', s: 'running', sub: 'running-shoes', p: 679, o: 749, r: 4.7, rc: 167, st: 3, sales: 610, f: 'd',
    g: 'men', img: ['shoeWhiteOrange', 'runningTrack'], col: [C.white, C.navy], sizes: SHOE,
    sd: 'Supportive stability shoe with 4D GUIDANCE SYSTEM for overpronators.',
    ab: 'Stability without stiffness. The 4D GUIDANCE SYSTEM adapts to your stride to help keep you stable as you fatigue, and PureGEL softens landings on hard Dubai pavements.',
    hl: ['4D GUIDANCE SYSTEM', 'PureGEL cushioning', 'Engineered knit upper'],
    sp: { Cushioning: 'FF BLAST PLUS ECO + PureGEL', 'Running type': 'Road — stability', Drop: '10 mm', Weight: '305 g (UK 9)' },
    at: { runningType: 'Road' }, tags: ['shoes', 'stability'], also: [['sports-shoes', 'running-shoes']],
  },
];

/* ---------------- Builder ---------------- */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/["'’”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SPORT_CODE: Record<SportSlug, string> = {
  football: 'FB', cricket: 'CR', basketball: 'BB', tennis: 'TN', running: 'RN',
  fitness: 'FT', cycling: 'CY', swimming: 'SW', boxing: 'BX', outdoor: 'OD',
};

function code(text: string, len = 3): string {
  return text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, len).padEnd(len, 'X');
}

const DAY = 86_400_000;

/** Midnight (Dubai) of the current day — deals end on stable boundaries so timers don’t reset on refresh. */
function nextDubaiMidnight(offsetDays: number): string {
  const now = new Date();
  const dubaiNow = new Date(now.getTime() + 4 * 3_600_000);
  const midnightUtc = Date.UTC(dubaiNow.getUTCFullYear(), dubaiNow.getUTCMonth(), dubaiNow.getUTCDate() + 1 + offsetDays) - 4 * 3_600_000;
  return new Date(midnightUtc).toISOString();
}

function buildVariants(seed: Seed, sku: string, index: number): { axes: VariantAxis[]; variants: ProductVariant[] } {
  const rng = createRng(hashString(seed.n) + index);
  const axes: VariantAxis[] = [];
  const colorOpts = seed.col.map((c) => c.name);
  if (colorOpts.length > 1) axes.push('color');
  const sizeOpts = seed.sizes && seed.sizes.length > 1 ? seed.sizes : [];
  if (sizeOpts.length) axes.push('size');
  const genderOpts = seed.gv ?? [];
  if (genderOpts.length) axes.push('gender');
  const cfgOpts = seed.cfg ?? [];
  if (cfgOpts.length) axes.push('config');

  const combos: Partial<Record<VariantAxis, string>>[] = [{}];
  const expand = (axis: VariantAxis, values: string[]) => {
    if (!values.length) return;
    const next: Partial<Record<VariantAxis, string>>[] = [];
    for (const combo of combos) for (const v of values) next.push({ ...combo, [axis]: v });
    combos.splice(0, combos.length, ...next);
  };
  expand('color', colorOpts.length > 1 ? colorOpts : []);
  expand('size', sizeOpts);
  expand('gender', genderOpts);
  expand('config', cfgOpts.map(([label]) => label));

  // Distribute the seed stock across variants; a few variants sell out for realism.
  const weights = combos.map(() => 0.4 + rng());
  const weightSum = weights.reduce((a, b) => a + b, 0);
  let remaining = seed.st;
  const variants = combos.map((attributes, i) => {
    const soldOut = combos.length > 4 && rng() < 0.12;
    let stock = soldOut ? 0 : Math.max(0, Math.round((weights[i] / weightSum) * seed.st));
    if (i === combos.length - 1) stock = soldOut ? 0 : Math.max(0, remaining);
    stock = Math.min(stock, Math.max(remaining, 0));
    remaining -= stock;
    const delta = cfgOpts.find(([label]) => label === attributes.config)?.[1] ?? 0;
    const colorIndex = attributes.color ? colorOpts.indexOf(attributes.color) : 0;
    const parts = [sku];
    if (attributes.color) parts.push(code(attributes.color, 3));
    if (attributes.size) parts.push(code(attributes.size, 4));
    if (attributes.gender) parts.push(attributes.gender === 'women' ? 'W' : 'M');
    if (attributes.config) parts.push(code(attributes.config, 4));
    return {
      id: sku.toLowerCase() + '-' + i,
      sku: parts.join('-'),
      attributes,
      price: seed.p + delta,
      originalPrice: (seed.o ?? seed.p) + delta,
      stock,
      image: seed.img[colorIndex % seed.img.length],
    } satisfies ProductVariant;
  });
  // Guarantee at least one purchasable variant when the product has stock.
  if (seed.st > 0 && variants.every((v) => v.stock === 0)) variants[0].stock = seed.st;
  return { axes, variants };
}

function deliveryText(seed: Seed): string {
  if (seed.bulky) return '2–4 business days · free installation in select emirates';
  return 'Same-day in Dubai · 1–3 business days across the UAE';
}

function buildProduct(seed: Seed, index: number): Product {
  const id = 'p' + String(index + 1).padStart(3, '0');
  const slug = slugify(seed.b + ' ' + seed.n);
  const sku = code(seed.b) + '-' + SPORT_CODE[seed.s] + '-' + String(1000 + index * 7);
  const { axes, variants } = buildVariants(seed, sku, index);
  const flags = seed.f ?? '';
  const original = seed.o ?? seed.p;
  const discount = original > seed.p ? Math.round(((original - seed.p) / original) * 100) : 0;
  const category: CategorySlug = seed.c ?? seed.s;
  const sportName = SPORT_MAP[seed.s].name;
  const stock = variants.reduce((sum, v) => sum + v.stock, 0);
  const createdAt = new Date(Date.now() - (flags.includes('n') ? 3 + (index % 26) : 45 + ((index * 37) % 400)) * DAY).toISOString();

  const description = [
    seed.ab,
    'Why you will love it: ' + seed.hl.map((h) => h.charAt(0).toLowerCase() + h.slice(1)).join('; ') + '.',
    seed.bulky
      ? 'Large item: delivered by our two-person crew within 2–4 business days. Free assembly is available in Dubai, Abu Dhabi and Sharjah.'
      : 'Ships from our Dubai fulfilment centre with tracked delivery to all seven emirates, Cash on Delivery and 30-day easy returns.',
  ].join('\n\n');

  return {
    id,
    name: seed.b + ' ' + seed.n,
    slug,
    brand: seed.b,
    category,
    subcategory: seed.sub,
    secondaryCategories: (seed.also ?? []).map(([c, s]) => ({ category: c, subcategory: s })),
    sport: seed.s,
    description,
    shortDescription: seed.sd,
    highlights: seed.hl,
    price: seed.p,
    originalPrice: original,
    discountPercentage: discount,
    currency: 'AED',
    images: seed.img,
    thumbnail: seed.img[0],
    rating: seed.r,
    reviewCount: seed.rc,
    stock,
    sku,
    colors: seed.col,
    sizes: seed.sizes ?? [],
    configurations: (seed.cfg ?? []).map(([label]) => label),
    genders: seed.gv ?? [seed.g ?? 'unisex'],
    variantAxes: axes,
    variants,
    tags: Array.from(new Set([sportName.toLowerCase(), subcategoryName(seed.sub).toLowerCase(), seed.b.toLowerCase(), ...(seed.tags ?? [])])),
    featured: flags.includes('f'),
    bestseller: flags.includes('b'),
    newArrival: flags.includes('n'),
    deal: flags.includes('d'),
    dealEndsAt: flags.includes('d') ? nextDubaiMidnight(index % 3) : undefined,
    gender: seed.g ?? 'unisex',
    ageGroup: seed.a ?? (seed.g === 'kids' ? 'kids' : 'adult'),
    deliveryEstimate: deliveryText(seed),
    availableEmirates: seed.emirates ?? [...EMIRATE_CODES],
    specs: Object.entries(seed.sp).map(([label, value]) => ({ label, value })),
    attributes: seed.at ?? {},
    salesCount: seed.sales,
    createdAt,
    status: 'published',
    lowStockThreshold: seed.bulky ? 3 : LOW_STOCK_DEFAULT,
  };
}

export const SEED_PRODUCTS: Product[] = SEEDS.map(buildProduct);
