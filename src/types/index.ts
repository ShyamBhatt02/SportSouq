/* ------------------------------------------------------------------
 * SportSouq domain types. Shared by data, services, hooks and UI.
 * ------------------------------------------------------------------ */

export type ID = string;

export type EmirateCode = 'dubai' | 'abu-dhabi' | 'sharjah' | 'ajman' | 'ras-al-khaimah' | 'fujairah' | 'umm-al-quwain';

export interface Emirate {
  code: EmirateCode;
  name: string;
  /** Business days for standard delivery [min, max]. 0 = same day. */
  standardDays: [number, number];
  expressDays: number;
  sameDay: boolean;
  cities: string[];
}

export type SportSlug =
  | 'football'
  | 'cricket'
  | 'basketball'
  | 'tennis'
  | 'running'
  | 'fitness'
  | 'cycling'
  | 'swimming'
  | 'boxing'
  | 'outdoor';

export type CategorySlug = SportSlug | 'sportswear' | 'sports-shoes';

export interface Subcategory {
  slug: string;
  name: string;
  category: CategorySlug;
  image: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  image: string;
  subcategories: Subcategory[];
  /** True if this category is one of the 10 sports. */
  isSport: boolean;
}

export interface Sport {
  slug: SportSlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
  banner: string;
  accent: string;
  icon: SportIconName;
  hasCollection: boolean;
}

export type SportIconName =
  | 'football'
  | 'cricket'
  | 'basketball'
  | 'tennis'
  | 'running'
  | 'fitness'
  | 'cycling'
  | 'swimming'
  | 'boxing'
  | 'outdoor';

export interface Brand {
  slug: string;
  name: string;
  country: string;
  founded: number;
}

export type Gender = 'men' | 'women' | 'unisex' | 'kids';
export type AgeGroup = 'adult' | 'youth' | 'kids';
export type VariantAxis = 'color' | 'size' | 'gender' | 'config';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductVariant {
  id: ID;
  sku: string;
  attributes: Partial<Record<VariantAxis, string>>;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
}

export type ProductStatus = 'published' | 'draft';

export interface Product {
  id: ID;
  name: string;
  slug: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  /** Additional listing placements, e.g. running shoe also under sports-shoes. */
  secondaryCategories: { category: CategorySlug; subcategory: string }[];
  sport: SportSlug;
  description: string;
  shortDescription: string;
  highlights: string[];
  price: number;
  originalPrice: number;
  discountPercentage: number;
  currency: 'AED';
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  colors: ProductColor[];
  sizes: string[];
  configurations: string[];
  genders: Gender[];
  variantAxes: VariantAxis[];
  variants: ProductVariant[];
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  deal: boolean;
  dealEndsAt?: string;
  gender: Gender;
  ageGroup: AgeGroup;
  deliveryEstimate: string;
  availableEmirates: EmirateCode[];
  specs: ProductSpec[];
  /** Filterable sport-specific attributes, e.g. { surface: 'Firm Ground' } */
  attributes: Record<string, string>;
  salesCount: number;
  createdAt: string;
  status: ProductStatus;
  lowStockThreshold: number;
}

export type SortOption =
  | 'recommended'
  | 'newest'
  | 'best-selling'
  | 'top-rated'
  | 'price-asc'
  | 'price-desc'
  | 'discount';

export type AvailabilityFilter = 'in-stock' | 'low-stock' | 'all';

export interface ProductQuery {
  q?: string;
  sport?: SportSlug[];
  category?: CategorySlug[];
  subcategory?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  size?: string[];
  color?: string[];
  gender?: Gender[];
  ageGroup?: AgeGroup[];
  availability?: AvailabilityFilter;
  discount?: number;
  attributes?: Record<string, string[]>;
  flags?: ('deal' | 'newArrival' | 'bestseller' | 'featured')[];
  ids?: ID[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  includeDrafts?: boolean;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  hex?: string;
}

export interface ProductFacets {
  sports: FacetOption[];
  categories: FacetOption[];
  subcategories: FacetOption[];
  brands: FacetOption[];
  sizes: FacetOption[];
  colors: FacetOption[];
  genders: FacetOption[];
  ageGroups: FacetOption[];
  attributes: Record<string, FacetOption[]>;
  priceRange: { min: number; max: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductListResponse extends Paginated<Product> {
  facets: ProductFacets;
}

export interface SportFilterDefinition {
  key: string;
  label: string;
  sport: SportSlug;
  options: string[];
}

/* ---------------- Cart / Wishlist ---------------- */

export interface CartItem {
  key: string;
  productId: ID;
  variantId: ID;
  slug: string;
  name: string;
  brand: string;
  image: string;
  sku: string;
  sport: SportSlug;
  category: CategorySlug;
  attributes: Partial<Record<VariantAxis, string>>;
  price: number;
  originalPrice: number;
  quantity: number;
  maxStock: number;
}

/* ---------------- Users / Auth ---------------- */

export type UserRole = 'customer' | 'admin';

export interface User {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  avatarColor?: string;
  marketingOptIn: boolean;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface AuthSession {
  token: string;
  userId: ID;
  expiresAt: string;
}

/* ---------------- Addresses ---------------- */

export type AddressLabel = 'home' | 'office';

export interface Address {
  id: ID;
  userId: ID;
  fullName: string;
  phone: string;
  emirate: EmirateCode;
  city: string;
  area: string;
  building: string;
  unit: string;
  street: string;
  landmark?: string;
  label: AddressLabel;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'userId'>;

/* ---------------- Checkout / Orders ---------------- */

export type DeliveryMethodId = 'standard' | 'express' | 'same-day';

export interface DeliveryMethod {
  id: DeliveryMethodId;
  name: string;
  description: string;
  fee: number;
  /** Order subtotal above which this method is free (null = never). */
  freeAbove: number | null;
}

export interface DeliveryQuote {
  method: DeliveryMethod;
  available: boolean;
  reason?: string;
  fee: number;
  estimatedFrom: string;
  estimatedTo: string;
  label: string;
}

export type PaymentMethodId = 'card' | 'apple-pay' | 'cod';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  fee: number;
}

export interface PaymentSummary {
  method: PaymentMethodId;
  label: string;
  cardBrand?: string;
  cardLast4?: string;
  transactionId?: string;
}

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface OrderItem {
  productId: ID;
  variantId: ID;
  slug: string;
  name: string;
  brand: string;
  image: string;
  sku: string;
  sport: SportSlug;
  category: CategorySlug;
  attributes: Partial<Record<VariantAxis, string>>;
  price: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  delivery: number;
  codFee: number;
  vat: number;
  total: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: string;
  note: string;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: ID;
  number: string;
  userId: ID | null;
  customer: OrderCustomer;
  items: OrderItem[];
  address: Omit<Address, 'id' | 'userId' | 'isDefault'>;
  delivery: { method: DeliveryMethodId; name: string; estimatedFrom: string; estimatedTo: string };
  payment: PaymentSummary;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  couponCode?: string;
  totals: OrderTotals;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  trackingNumber?: string;
}

export interface CreateOrderInput {
  customer: OrderCustomer;
  items: OrderItem[];
  address: Order['address'];
  deliveryMethod: DeliveryMethodId;
  payment: PaymentSummary;
  couponCode?: string;
  saveAddress?: boolean;
}

/* ---------------- Coupons ---------------- */

export type CouponType = 'percentage' | 'fixed' | 'free-delivery';

export interface Coupon {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  active: boolean;
  firstOrderOnly?: boolean;
  sports?: SportSlug[];
  usageLimit?: number;
  usedCount: number;
}

export type CouponValidationStatus =
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'inactive'
  | 'min-not-reached'
  | 'not-applicable'
  | 'first-order-only'
  | 'limit-reached';

export interface CouponValidation {
  status: CouponValidationStatus;
  coupon?: Coupon;
  discount: number;
  freeDelivery: boolean;
  /** For min-not-reached: amount still needed. */
  shortfall?: number;
}

/* ---------------- Reviews ---------------- */

export type ReviewStatus = 'approved' | 'pending' | 'rejected';

export interface Review {
  id: ID;
  productId: ID;
  userId: ID | null;
  author: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
  status: ReviewStatus;
}

export interface ReviewInput {
  productId: ID;
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

/* ---------------- Customers / Admin ---------------- */

export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  emirate: EmirateCode;
  registeredAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export type AnalyticsRange = 'today' | '7d' | '30d' | '3m' | '12m';

export interface TimeSeriesPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface BreakdownPoint {
  key: string;
  name: string;
  revenue: number;
  units: number;
}

export interface AnalyticsKpis {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  productsSold: number;
  averageOrderValue: number;
}

export interface AnalyticsData {
  range: AnalyticsRange;
  kpis: AnalyticsKpis;
  /** Null when the previous period predates the order history (no fair comparison). */
  previous: AnalyticsKpis | null;
  series: TimeSeriesPoint[];
  bySport: BreakdownPoint[];
  byCategory: BreakdownPoint[];
  customerGrowth: { label: string; total: number; new: number }[];
  topProducts: { id: ID; name: string; image: string; units: number; revenue: number }[];
  statusBreakdown: { status: OrderStatus; count: number }[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  sport: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface ThemePreference {
  theme: 'light' | 'dark' | 'system';
}

export interface UserPreferences extends ThemePreference {
  emirate: EmirateCode;
  locale: 'en' | 'ar';
  newsletter: boolean;
  orderUpdates: boolean;
}
