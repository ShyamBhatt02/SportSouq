import type { Address, AuthSession, Category, Coupon, Order, Product, Review, ReviewStatus, StoredUser } from '@/types';
import { SEED_PRODUCTS } from '@/data/products';
import { SEED_COUPONS } from '@/data/coupons';
import { SEED_ADDRESSES, SEED_USERS } from '@/data/users';
import { CATEGORIES } from '@/data/categories';
import { generateCustomers, type SeedCustomer } from '@/data/customers';
import { generateOrders } from '@/data/orders';
import { generateReviews } from '@/data/reviews';
import { STORAGE_KEYS } from '@/config/site';
import { readStorage, writeStorage, isObject } from '@/utils/storage';

/**
 * In-browser mock database. Seed data is generated deterministically in memory;
 * only the *delta* created by users/admins is persisted to localStorage, which
 * keeps storage small and lets seeds evolve between releases (SCHEMA_VERSION).
 */

const SCHEMA_VERSION = 4;

interface PersistedState {
  version: number;
  productOverrides: Record<string, Partial<Product>>;
  createdProducts: Product[];
  deletedProductIds: string[];
  users: StoredUser[];
  addresses: Address[];
  orders: Order[];
  orderOverrides: Record<string, Pick<Order, 'status' | 'timeline' | 'paymentStatus'> & { trackingNumber?: string }>;
  reviews: Review[];
  reviewStatus: Record<string, ReviewStatus | 'deleted'>;
  coupons: Coupon[] | null;
  categories: Category[] | null;
  sessions: AuthSession[];
  newsletter: string[];
  contactMessages: { name: string; email: string; topic: string; message: string; at: string }[];
}

function emptyState(): PersistedState {
  return {
    version: SCHEMA_VERSION,
    productOverrides: {},
    createdProducts: [],
    deletedProductIds: [],
    users: SEED_USERS.map((u) => ({ ...u })),
    addresses: SEED_ADDRESSES.map((a) => ({ ...a })),
    orders: [],
    orderOverrides: {},
    reviews: [],
    reviewStatus: {},
    coupons: null,
    categories: null,
    sessions: [],
    newsletter: [],
    contactMessages: [],
  };
}

function loadState(): PersistedState {
  const stored = readStorage<PersistedState | null>(STORAGE_KEYS.db, null, (v): v is PersistedState => isObject(v));
  if (!stored || stored.version !== SCHEMA_VERSION) return emptyState();
  return { ...emptyState(), ...stored };
}

class MockDb {
  private state: PersistedState = loadState();
  private seed?: { customers: SeedCustomer[]; orders: Order[]; reviews: Review[] };
  private productCache: Product[] | null = null;
  private orderCache: Order[] | null = null;

  private seeds() {
    if (!this.seed) {
      const now = Date.now();
      const customers = generateCustomers(240, now);
      this.seed = {
        customers,
        orders: generateOrders(SEED_PRODUCTS, customers, now),
        reviews: generateReviews(SEED_PRODUCTS, now),
      };
    }
    return this.seed;
  }

  private persist() {
    writeStorage(STORAGE_KEYS.db, this.state);
  }

  /* ---------------- Products ---------------- */

  products(): Product[] {
    if (!this.productCache) {
      const deleted = new Set(this.state.deletedProductIds);
      const merged = SEED_PRODUCTS.filter((p) => !deleted.has(p.id)).map((p) => {
        const o = this.state.productOverrides[p.id];
        return o ? { ...p, ...o } : p;
      });
      this.productCache = [...merged, ...this.state.createdProducts.filter((p) => !deleted.has(p.id))];
    }
    return this.productCache;
  }

  updateProduct(id: string, patch: Partial<Product>): Product | undefined {
    const created = this.state.createdProducts.findIndex((p) => p.id === id);
    if (created >= 0) {
      this.state.createdProducts[created] = { ...this.state.createdProducts[created], ...patch };
    } else {
      this.state.productOverrides[id] = { ...this.state.productOverrides[id], ...patch };
    }
    this.productCache = null;
    this.persist();
    return this.products().find((p) => p.id === id);
  }

  createProduct(product: Product): Product {
    this.state.createdProducts.push(product);
    this.productCache = null;
    this.persist();
    return product;
  }

  deleteProduct(id: string): void {
    this.state.deletedProductIds.push(id);
    this.productCache = null;
    this.persist();
  }

  /* ---------------- Orders ---------------- */

  orders(): Order[] {
    if (!this.orderCache) {
      const all = [...this.seeds().orders, ...this.state.orders].map((o) => {
        const ov = this.state.orderOverrides[o.id];
        return ov ? { ...o, ...ov } : o;
      });
      this.orderCache = all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return this.orderCache;
  }

  addOrder(order: Order): void {
    this.state.orders.push(order);
    this.orderCache = null;
    this.persist();
  }

  updateOrder(id: string, patch: PersistedState['orderOverrides'][string]): void {
    const created = this.state.orders.findIndex((o) => o.id === id);
    if (created >= 0) this.state.orders[created] = { ...this.state.orders[created], ...patch };
    else this.state.orderOverrides[id] = patch;
    this.orderCache = null;
    this.persist();
  }

  nextOrderSeq(): number {
    return 2000 + this.state.orders.length + Math.floor(Math.random() * 7000);
  }

  /* ---------------- Users / sessions / addresses ---------------- */

  users(): StoredUser[] {
    return this.state.users;
  }

  addUser(user: StoredUser): void {
    this.state.users.push(user);
    this.persist();
  }

  updateUser(id: string, patch: Partial<StoredUser>): StoredUser | undefined {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx < 0) return undefined;
    this.state.users[idx] = { ...this.state.users[idx], ...patch };
    this.persist();
    return this.state.users[idx];
  }

  sessions(): AuthSession[] {
    return this.state.sessions;
  }

  addSession(session: AuthSession): void {
    const now = Date.now();
    this.state.sessions = [...this.state.sessions.filter((s) => new Date(s.expiresAt).getTime() > now), session].slice(-20);
    this.persist();
  }

  removeSession(token: string): void {
    this.state.sessions = this.state.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  addresses(userId: string): Address[] {
    return this.state.addresses.filter((a) => a.userId === userId);
  }

  saveAddresses(userId: string, list: Address[]): void {
    this.state.addresses = [...this.state.addresses.filter((a) => a.userId !== userId), ...list];
    this.persist();
  }

  /* ---------------- Reviews ---------------- */

  reviews(): Review[] {
    return [...this.seeds().reviews, ...this.state.reviews]
      .filter((r) => this.state.reviewStatus[r.id] !== 'deleted')
      .map((r) => {
        const s = this.state.reviewStatus[r.id];
        return s && s !== 'deleted' ? { ...r, status: s } : r;
      });
  }

  addReview(review: Review): void {
    this.state.reviews.push(review);
    this.persist();
  }

  setReviewStatus(id: string, status: ReviewStatus | 'deleted'): void {
    this.state.reviewStatus[id] = status;
    this.persist();
  }

  /* ---------------- Coupons / categories / misc ---------------- */

  coupons(): Coupon[] {
    return this.state.coupons ?? SEED_COUPONS;
  }

  saveCoupons(list: Coupon[]): void {
    this.state.coupons = list;
    this.persist();
  }

  categories(): Category[] {
    return this.state.categories ?? CATEGORIES;
  }

  saveCategories(list: Category[]): void {
    this.state.categories = list;
    this.persist();
  }

  customers(): SeedCustomer[] {
    return this.seeds().customers;
  }

  addNewsletter(email: string): boolean {
    if (this.state.newsletter.includes(email)) return false;
    this.state.newsletter.push(email);
    this.persist();
    return true;
  }

  addContactMessage(msg: PersistedState['contactMessages'][number]): void {
    this.state.contactMessages = [...this.state.contactMessages, msg].slice(-50);
    this.persist();
  }

  /** Clears all user-generated data (used by Settings → "Reset demo data"). */
  reset(): void {
    this.state = emptyState();
    this.productCache = null;
    this.orderCache = null;
    this.persist();
  }
}

export const db = new MockDb();
