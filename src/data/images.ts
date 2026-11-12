/**
 * Verified image library (Unsplash, free licence). Every ID here was checked
 * to return HTTP 200 and to visually match its key. Components never hardcode
 * URLs — they reference keys and build sized URLs via `imageUrl()`.
 */
export const PHOTOS = {
  // Football
  footballStadiumBall: 'photo-1574629810360-7efbbe195018',
  footballBallGrass: 'photo-1579952363873-27f3bade9f55',
  footballBootBall: 'photo-1431324155629-1a6deb1dec8d',
  footballBootStep: 'photo-1606925797300-0b35e9d1794e',
  footballNight: 'photo-1511886929837-354d827aae26',
  footballDribble: 'photo-1614632537190-23e4146777db',
  footballMatchBall: 'photo-1551958219-acbc608c6377',
  footballTrainingBalls: 'photo-1560272564-c83b66b1ad12',
  footballKick: 'photo-1575361204480-aadea25e6e68',
  footballBallClassic: 'photo-1589487391730-58f20eb2c308',
  footballStadiumLights: 'photo-1489944440615-453fc2b6a9a9',
  footballPitch: 'photo-1522778119026-d647f0596c20',
  footballTouch: 'photo-1600679472829-3044539ce8ed',
  footballKids: 'photo-1526232761682-d26e03ac148e',
  footballJersey: 'photo-1577212017184-80cc0da11082',
  // Cricket
  cricketBallGrass: 'photo-1531415074968-036ba1b575da',
  cricketStadiumNight: 'photo-1540747913346-19e32dc3e97e',
  cricketBatsman: 'photo-1624526267942-ab0ff8a3e972',
  cricketGlovesBall: 'photo-1593341646782-e0b495cff86d',
  cricketStadiumDusk: 'photo-1512719994953-eabf50895df7',
  cricketGround: 'photo-1607734834519-d8576ae60ea6',
  // Basketball
  basketballHoopNight: 'photo-1546519638-68e109498ffc',
  basketballBallCourt: 'photo-1519861531473-9200262188bf',
  basketballArena: 'photo-1504450758481-7338eba7524a',
  basketballDunk: 'photo-1608245449230-4ac19066d2d0',
  basketballHoopSky: 'photo-1494199505258-5f95387f933c',
  basketballNet: 'photo-1515523110800-9415d13b84a8',
  basketballRim: 'photo-1518063319789-7217e6706b04',
  // Tennis
  tennisClayAerial: 'photo-1554068865-24cecd4e34b8',
  tennisPlayer: 'photo-1622279457486-62dcc4a431d6',
  tennisCourtSit: 'photo-1595435934249-5df7ed86e1c0',
  tennisBallHand: 'photo-1530915534664-4ac6423816b7',
  tennisBallsAir: 'photo-1595435742656-5272d0b3fa82',
  tennisRacketClay: 'photo-1599586120429-48281b6f0ece',
  tennisCourt: 'photo-1551773188-0801da12ddae',
  tennisBallMotion: 'photo-1587280501635-68a0e82cd5ff',
  tennisRacketBlue: 'photo-1622163642998-1ea32b0bbc67',
  tennisRacketCourt: 'photo-1542144582-1ba00456b5e3',
  tennisRacketYellow: 'photo-1560012057-4372e14c5085',
  // Running & shoes
  runningGroup: 'photo-1552674605-db6ffd4facb5',
  runningStairs: 'photo-1476480862126-209bfaa8edc8',
  runningRoad: 'photo-1571008887538-b36bb32f4571',
  runningTrail: 'photo-1486218119243-13883505764c',
  runningSunset: 'photo-1594882645126-14020914d58d',
  runningTrack: 'photo-1461896836934-ffe607ba8211',
  shoeRed: 'photo-1542291026-7eec264c27ff',
  shoeLime: 'photo-1606107557195-0e29a4b5b4aa',
  shoePastel: 'photo-1595950653106-6c9ebd614d3a',
  shoeWhiteOrange: 'photo-1600185365483-26d7a4cc7519',
  shoeWhiteCourt: 'photo-1608231387042-66d1773070a5',
  shoeWhiteStreet: 'photo-1460353581641-37baddab0fa2',
  shoeGreyFloating: 'photo-1491553895911-0055eca6402d',
  shoeTan: 'photo-1549298916-b41d501d3772',
  shoeOlive: 'photo-1539185441755-769473a23570',
  shoeHighTop: 'photo-1556906781-9a412961c28c',
  shoeWhiteBlue: 'photo-1579338559194-a162d19bf842',
  shoeRedHigh: 'photo-1575537302964-96cd47c06b1b',
  shoeColorPop: 'photo-1606890658317-7d14490b76fd',
  hikingBoots: 'photo-1520639888713-7851133b1ed0',
  watchWhite: 'photo-1523275335684-37898b6baf30',
  watchWrist: 'photo-1508685096489-7aacd43bd3b1',
  watchApps: 'photo-1579586337278-3befd40fd17a',
  watchBlack: 'photo-1544117519-31a4b719223d',
  bottleGreen: 'photo-1602143407151-7111542de6e8',
  bottleClear: 'photo-1523362628745-0c100150b504',
  headphones: 'photo-1505740420928-5e560c06d30e',
  // Fitness
  fitnessBarbell: 'photo-1517836357463-d25dfeac3438',
  fitnessGym: 'photo-1534438327276-14e5300c3a48',
  fitnessDumbbellGrip: 'photo-1583454110551-21f2fa2afe61',
  fitnessTrainer: 'photo-1571019614242-c5c5dee9f50b',
  fitnessCurl: 'photo-1581009146145-b5ef050c2e1e',
  fitnessRopes: 'photo-1599058917212-d750089bc07e',
  yogaMats: 'photo-1601925260368-ae2f83cf8b7f',
  yogaSunset: 'photo-1544367567-0f2fcb009e0b',
  spinBikes: 'photo-1598289431512-b97b0917affc',
  dumbbellRack: 'photo-1576678927484-cc907957088c',
  gymBright: 'photo-1540497077202-7c8a3999166f',
  backSquat: 'photo-1574680096145-d05b474e2155',
  gymMono: 'photo-1571902943202-507ec2618e8f',
  deadlift: 'photo-1517963879433-6ad2b056d712',
  dumbbellsBand: 'photo-1584735935682-2f2b69dff9d2',
  abRoller: 'photo-1598632640487-6ea4a4e8b963',
  plates: 'photo-1620188467120-5042ed1eb5da',
  yogaPlank: 'photo-1518611012118-696072aa579a',
  pullupBar: 'photo-1541534741688-6078c6bfb5c5',
  hexDumbbells: 'photo-1638536532686-d610adfc8e5c',
  pinkDumbbell: 'photo-1586401100295-7a8096fd231a',
  yogaMatRoll: 'photo-1592432678016-e910b452f9a2',
  yogaStretch: 'photo-1599447421416-3414500d18a5',
  // Cycling
  bikeWhite: 'photo-1485965120184-e220f721d03e',
  bikeBlack: 'photo-1532298229144-0ec0c57515c7',
  cyclistsCoast: 'photo-1541625602330-2277a4c46182',
  bikeUrban: 'photo-1507035895480-2b3156c31fc8',
  bikeRoadWall: 'photo-1576435728678-68d0fbf94e91',
  cyclingPeloton: 'photo-1517649763962-0c623066013b',
  bikeStudio: 'photo-1571068316344-75bc76f77890',
  bikeCommuter: 'photo-1559348349-86f1f65817fe',
  bikeGravel: 'photo-1511994298241-608e28f14fde',
  cyclistForest: 'photo-1534787238916-9ba6764efd4f',
  // Swimming
  swimButterfly: 'photo-1530549387789-4c1017266635',
  swimLane: 'photo-1519315901367-f34ff9154487',
  swimLanesAerial: 'photo-1560090995-01632a28895b',
  swimDive: 'photo-1600965962361-9035dbfd1c50',
  swimCapGoggles: 'photo-1622629797619-c100e3e67e2e',
  swimOpenWater: 'photo-1438029071396-1e831a7fa6d8',
  // Boxing
  boxingGlovesDark: 'photo-1549719386-74dfcbf7dbed',
  boxingPads: 'photo-1517438322307-e67111335449',
  boxingGloveFloor: 'photo-1615117972428-28de67cda58e',
  boxingGloveBench: 'photo-1583473848882-f9a5bc7fd2ee',
  boxingWoman: 'photo-1584464491033-06628f3a6b7b',
  boxingClass: 'photo-1590556409324-aa1d726e5c3c',
  // Outdoor
  hikingTrail: 'photo-1551632811-561732d1e306',
  tentView: 'photo-1504280390367-361c6d9f38f4',
  backpackGreen: 'photo-1622260614153-03223fb72052',
  backpackNavy: 'photo-1553062407-98eeb64c6a62',
  mountainLake: 'photo-1464822759023-fed622ff2c3b',
  campfire: 'photo-1478131143081-80f7f84ca84d',
  hikerValley: 'photo-1501555088652-021faa106b9b',
  campCanyon: 'photo-1445308394109-4ec2920981b1',
  campTrailer: 'photo-1523987355523-c7b5b0dd90a7',
  tentStars: 'photo-1537905569824-f89f14cceb68',
  backpackRugged: 'photo-1547949003-9792a18a2601',
  // Apparel
  teeWhite: 'photo-1521572163474-6864f9cf17ab',
  teeBlack: 'photo-1618354691373-d851c5c3a990',
  sweatWhite: 'photo-1620799140408-edc6dcb6d633',
  teePrint: 'photo-1576566588028-4147f3842f27',
  tracksuitYellow: 'photo-1515886657613-9f3515b0c78f',
  joggersPink: 'photo-1594633312681-425c7b97ccd1',
  hoodieGrey: 'photo-1556821840-3a63f95609a7',
  bomberJacket: 'photo-1591047139829-d91aecb6caea',
  // UAE / lifestyle
  dubaiBurjAlArab: 'photo-1518684079-3c830dcef090',
  // People (testimonials)
  person1: 'photo-1507003211169-0a1dd7228f2d',
  person2: 'photo-1494790108377-be9c29b29330',
  person3: 'photo-1500648767791-00dcc994a43e',
  person4: 'photo-1438761681033-6461ffad8d80',
  person5: 'photo-1472099645785-5658abf4ff4e',
  person6: 'photo-1544005313-94ddf0286df2',
} as const;

export type PhotoKey = keyof typeof PHOTOS;

const UNSPLASH = 'https://images.unsplash.com/';

function isExternal(src: string): boolean {
  return src.startsWith('http') || src.startsWith('data:') || src.startsWith('/') || src.startsWith('blob:');
}

/** Builds a sized, cropped, auto-format image URL from a photo key or raw id/url. */
export function imageUrl(src: string, width = 800, height?: number, quality = 75): string {
  if (!src) return '';
  if (isExternal(src)) return src;
  const id = (PHOTOS as Record<string, string>)[src] ?? src;
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(width), q: String(quality) });
  if (height) params.set('h', String(height));
  return UNSPLASH + id + '?' + params.toString();
}

/** Responsive srcset for a given aspect ratio (height / width). */
export function imageSrcSet(src: string, widths: number[], ratio?: number): string | undefined {
  if (!src || isExternal(src)) return undefined;
  return widths.map((w) => imageUrl(src, w, ratio ? Math.round(w * ratio) : undefined) + ' ' + w + 'w').join(', ');
}
