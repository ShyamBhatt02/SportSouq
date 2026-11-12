import type { Address, StoredUser } from '@/types';

/**
 * Pre-seeded mock accounts. Passwords are never stored in plain text — only a
 * salted SHA-256 hash (see services/mock/crypto.ts). Credentials for testing:
 *   Customer: test@sportsouq.ae  / Test@1234
 *   Admin:    admin@sportsouq.ae / Admin@1234
 */
export const TEST_USER_ID = 'u-test';
export const ADMIN_USER_ID = 'u-admin';

const DAY = 86_400_000;

export const SEED_USERS: StoredUser[] = [
  {
    id: TEST_USER_ID,
    firstName: 'Aisha',
    lastName: 'Rahman',
    email: 'test@sportsouq.ae',
    phone: '+971 50 123 4567',
    role: 'customer',
    createdAt: new Date(Date.now() - 210 * DAY).toISOString(),
    avatarColor: '#d43b0c',
    marketingOptIn: true,
    passwordHash: 'eb17d8e134f79c8e3a2e2f1f9f18e201eb8fd81dc4e4f901af2334855c769e3c',
  },
  {
    id: ADMIN_USER_ID,
    firstName: 'Omar',
    lastName: 'Khalifa',
    email: 'admin@sportsouq.ae',
    phone: '+971 4 555 0123',
    role: 'admin',
    createdAt: new Date(Date.now() - 400 * DAY).toISOString(),
    avatarColor: '#141b2b',
    marketingOptIn: false,
    passwordHash: 'c82fd90ed94ab45ce4ed1b89a8625ca7a765860ddc405147f589a3e804e8fca3',
  },
];

export const SEED_ADDRESSES: Address[] = [
  {
    id: 'a-test-home',
    userId: TEST_USER_ID,
    fullName: 'Aisha Rahman',
    phone: '+971 50 123 4567',
    emirate: 'dubai',
    city: 'Dubai',
    area: 'Dubai Marina',
    building: 'Marina Gate 2',
    unit: 'Apt 2304',
    street: 'Al Marsa Street',
    landmark: 'Next to Dubai Marina Mall',
    label: 'home',
    isDefault: true,
  },
  {
    id: 'a-test-office',
    userId: TEST_USER_ID,
    fullName: 'Aisha Rahman',
    phone: '+971 50 123 4567',
    emirate: 'abu-dhabi',
    city: 'Abu Dhabi',
    area: 'Al Maryah Island',
    building: 'Al Sila Tower',
    unit: 'Office 1810',
    street: 'Hamouda Bin Ali Al Dhaheri Street',
    landmark: 'ADGM Square',
    label: 'office',
    isDefault: false,
  },
];
