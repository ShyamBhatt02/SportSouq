import type { Product, Review, SportSlug } from '@/types';
import { createRng, hashString, pick } from '@/utils/random';

const AUTHORS: [string, string][] = [
  ['Ahmed K.', 'Dubai'], ['Fatima A.', 'Abu Dhabi'], ['Rohit S.', 'Sharjah'], ['Emily W.', 'Dubai'], ['Yousef M.', 'Al Ain'],
  ['Mariam H.', 'Ajman'], ['Daniel P.', 'Dubai Marina'], ['Sana Q.', 'JLT, Dubai'], ['Mohammed R.', 'Ras Al Khaimah'],
  ['Grace L.', 'Abu Dhabi'], ['Vikram N.', 'Al Barsha'], ['Noura S.', 'Fujairah'], ['Carlos F.', 'Business Bay'],
  ['Hessa M.', 'Umm Al Quwain'], ['Arjun P.', 'Silicon Oasis'], ['Olivia B.', 'Arabian Ranches'], ['Tariq Z.', 'Sharjah'],
  ['Mei C.', 'Yas Island'], ['Rashid A.', 'Khalifa City'], ['Hannah D.', 'Jumeirah'],
];

const SPORT_POSITIVE: Record<SportSlug, string[]> = {
  football: [
    'Played three five-a-side games in these already and the grip on artificial turf is excellent. Lockdown is great on cuts.',
    'Used it for weekend league in Al Barsha. Quality is exactly what I expected from the brand, and delivery was next morning.',
    'My son’s academy coach recommended this. Fits true to size and has held up well after a month of training.',
  ],
  cricket: [
    'The pick-up is beautiful and the middle is huge. Knocked-in properly so I could use it in nets immediately.',
    'Used it through a full season in the Sharjah league. Great protection, comfortable even in the heat.',
    'Seam stays proud for a long time. Good swing in the evening matches under lights.',
  ],
  basketball: [
    'Grip on the indoor court is fantastic and the cushioning saves my knees. Great value compared to the mall.',
    'Holds up on the outdoor courts at Safa Park — no peeling after weeks of use in the sun.',
    'True to size, supportive and looks great. Arrived the same day in Dubai.',
  ],
  tennis: [
    'Solid, stable feel and really easy to control. Switched from my old racket and noticed the difference immediately.',
    'Bounce is consistent and they last longer than other balls on the hard courts at our club.',
    'Comfortable straight out of the box, excellent lateral support for sliding on hard courts.',
  ],
  running: [
    'Took these on a 21K along Al Qudra and my legs felt fresh. Breathable enough for humid mornings.',
    'Battery life is incredible and the GPS is accurate even between the Marina towers.',
    'Perfect for my morning runs on Kite Beach. Stays cold for hours and doesn’t leak in my bag.',
  ],
  fitness: [
    'Great quality for the price. Built my apartment gym around these and they don’t damage the floor.',
    'Super sturdy, no wobble, and the grip is solid even when my hands are sweaty.',
    'Exactly what I needed for home workouts. Delivery to Sharjah was quick and well packaged.',
  ],
  cycling: [
    'Arrived pre-assembled and perfectly tuned. Did my first Al Qudra loop the next morning.',
    'Comfortable for long rides and keeps me visible early in the morning. Highly recommend.',
    'Light, comfortable and great ventilation for summer riding in Abu Dhabi.',
  ],
  swimming: [
    'No leaks and no fogging even during an hour-long session. Comfortable strap.',
    'Chlorine resistance is legit — still looks new after months of training at the club.',
    'Great for open-water swims at JBR. Quick delivery and good price.',
  ],
  boxing: [
    'Excellent padding and wrist support. My knuckles feel protected even during heavy bag rounds.',
    'Used them in my boxing classes in JLT — comfortable, breathable and well made.',
    'Solid build quality. The delivery team helped carry it upstairs, which was a big help.',
  ],
  outdoor: [
    'Took it camping in Liwa — easy to set up and kept us comfortable all night.',
    'Comfortable and grippy on the Hatta trails. Kept my feet dry crossing the wadi.',
    'Great capacity and the back panel stays ventilated. Perfect for weekend hikes in the Hajar mountains.',
  ],
};

const GENERIC_POSITIVE = [
  'Exactly as described, authentic product and arrived well packaged. Will order again.',
  'Better price than the malls and delivery was faster than expected. Very happy.',
  'Top quality. Cash on Delivery made it easy and the courier was on time.',
  'Fantastic product and great customer service on WhatsApp when I had a sizing question.',
];
const TITLES_5 = ['Absolutely love it', 'Best purchase this year', 'Worth every dirham', 'Excellent quality', 'Highly recommend', 'Five stars'];
const TITLES_4 = ['Very good', 'Great value', 'Happy with it', 'Solid choice', 'Does the job well'];
const TITLES_3 = ['Decent, but…', 'Okay for the price', 'Mixed feelings'];
const TITLES_LOW = ['Not for me', 'Disappointed', 'Sizing was off'];
const MIXED = [
  'Good product overall, but runs slightly small — consider going half a size up.',
  'Does what it should, though I expected slightly better finishing at this price.',
  'Works fine for training. Colour is a little different to the photos.',
];
const NEGATIVE = [
  'Didn’t suit me, but the return was easy — collected from my home in two days and refunded quickly.',
  'Quality is fine but the fit wasn’t right for me. Exchange process was simple though.',
];

function ratingFor(target: number, rng: () => number): number {
  const r = rng();
  if (target >= 4.7) return r < 0.82 ? 5 : r < 0.97 ? 4 : 3;
  if (target >= 4.5) return r < 0.66 ? 5 : r < 0.92 ? 4 : r < 0.98 ? 3 : 2;
  return r < 0.5 ? 5 : r < 0.82 ? 4 : r < 0.94 ? 3 : 2;
}

const DAY = 86_400_000;

export function generateReviews(products: Product[], now = Date.now()): Review[] {
  const reviews: Review[] = [];
  for (const p of products) {
    const rng = createRng(hashString(p.id + 'reviews'));
    const n = 3 + (hashString(p.slug) % 4);
    for (let i = 0; i < n; i++) {
      const rating = ratingFor(p.rating, rng);
      const [author, location] = pick(rng, AUTHORS);
      const comment = rating >= 4 ? (rng() < 0.65 ? pick(rng, SPORT_POSITIVE[p.sport]) : pick(rng, GENERIC_POSITIVE)) : rating === 3 ? pick(rng, MIXED) : pick(rng, NEGATIVE);
      const title = rating === 5 ? pick(rng, TITLES_5) : rating === 4 ? pick(rng, TITLES_4) : rating === 3 ? pick(rng, TITLES_3) : pick(rng, TITLES_LOW);
      reviews.push({
        id: 'r-' + p.id + '-' + i,
        productId: p.id,
        userId: null,
        author,
        location,
        rating,
        title,
        comment,
        createdAt: new Date(now - Math.floor(rng() * 300 + 1) * DAY).toISOString(),
        verified: rng() < 0.85,
        helpful: Math.floor(rng() * 40),
        status: 'approved',
      });
    }
  }
  // A small moderation queue for the admin panel.
  const queue: [number, number, string, string][] = [
    [0, 5, 'Fastest boots I’ve owned', 'Wore them for our Thursday game in Al Quoz — instantly felt quicker. Arrived the same afternoon.'],
    [35, 4, 'Great daily trainer', 'Comfortable and responsive. Took one run to break in. Sizing is accurate.'],
    [46, 2, 'Handle came loose', 'One handle felt loose after a week. Contacted support and they arranged a replacement.'],
    [74, 5, 'Perfect for Muay Thai class', 'Great wrist support and really well stitched. Arrived next day in Ajman.'],
    [81, 3, 'Good tent, a bit heavy', 'Pitches in seconds as promised but heavier than I expected to carry far.'],
    [21, 1, 'Wrong colour delivered', 'Received black instead of red. Customer service is arranging an exchange.'],
  ];
  queue.forEach(([idx, rating, title, comment], i) => {
    const p = products[idx % products.length];
    reviews.push({
      id: 'r-pending-' + i,
      productId: p.id,
      userId: null,
      author: AUTHORS[(i * 3) % AUTHORS.length][0],
      location: AUTHORS[(i * 3) % AUTHORS.length][1],
      rating,
      title,
      comment,
      createdAt: new Date(now - (i + 1) * 0.6 * DAY).toISOString(),
      verified: true,
      helpful: 0,
      status: 'pending',
    });
  });
  return reviews;
}
