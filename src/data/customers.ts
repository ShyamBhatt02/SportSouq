import type { EmirateCode } from '@/types';
import { createRng, pick, randInt } from '@/utils/random';

export interface SeedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  emirate: EmirateCode;
  registeredAt: string;
}

const FIRST = [
  'Mohammed', 'Ahmed', 'Fatima', 'Mariam', 'Khalid', 'Hamdan', 'Noura', 'Saeed', 'Rashid', 'Huda',
  'Omar', 'Yousef', 'Layla', 'Rania', 'Tariq', 'Karim', 'Nadia', 'Hassan', 'Salma', 'Ali',
  'Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Imran', 'Ayesha', 'Bilal', 'Zara',
  'James', 'Emma', 'Oliver', 'Sophie', 'Daniel', 'Hannah', 'Lucas', 'Chloe', 'Ryan', 'Grace',
  'Jose', 'Maria', 'Mark', 'Angela', 'Paolo', 'Andrea', 'Dmitri', 'Elena', 'Kenji', 'Mei',
];
const LAST = [
  'Al Mansoori', 'Al Nahyan', 'Al Maktoum', 'Al Suwaidi', 'Al Ketbi', 'Al Falasi', 'Al Shamsi', 'Al Mazrouei', 'Haddad', 'Khoury',
  'Nasser', 'Saleh', 'Farouk', 'Mahmoud', 'Sharma', 'Patel', 'Nair', 'Menon', 'Iyer', 'Khan',
  'Qureshi', 'Siddiqui', 'Thompson', 'Walker', 'Clarke', 'Hughes', 'Murphy', 'Santos', 'Reyes', 'Cruz',
  'Garcia', 'Ivanova', 'Petrov', 'Tanaka', 'Chen', 'Wong', 'Fernandes', 'D’Souza', 'Kapoor', 'Hussain',
];
const EMIRATE_WEIGHTS: [EmirateCode, number][] = [
  ['dubai', 0.42], ['abu-dhabi', 0.24], ['sharjah', 0.16], ['ajman', 0.07], ['ras-al-khaimah', 0.05], ['fujairah', 0.03], ['umm-al-quwain', 0.03],
];

function weightedEmirate(rng: () => number): EmirateCode {
  let r = rng();
  for (const [code, w] of EMIRATE_WEIGHTS) {
    if ((r -= w) <= 0) return code;
  }
  return 'dubai';
}

const DAY = 86_400_000;

export function generateCustomers(count = 240, now = Date.now()): SeedCustomer[] {
  const rng = createRng(20260101);
  const list: SeedCustomer[] = [];
  for (let i = 0; i < count; i++) {
    const first = pick(rng, FIRST);
    const last = pick(rng, LAST);
    // Registration skews recent, reflecting customer growth over 14 months.
    const daysAgo = Math.floor(Math.pow(rng(), 0.75) * 420);
    const prefix = String(randInt(rng, 0, 9));
    list.push({
      id: 'c-' + String(i + 1).padStart(4, '0'),
      name: first + ' ' + last,
      email: (first + '.' + last).toLowerCase().replace(/[^a-z.]/g, '') + (i % 7 === 0 ? String(i) : '') + '@example.com',
      phone: '+971 5' + prefix + ' ' + String(randInt(rng, 100, 999)) + ' ' + String(randInt(rng, 1000, 9999)),
      emirate: weightedEmirate(rng),
      registeredAt: new Date(now - daysAgo * DAY - randInt(rng, 0, 86_000) * 1000).toISOString(),
    });
  }
  return list.sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
}
