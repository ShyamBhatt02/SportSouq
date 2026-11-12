import { z } from 'zod';
import { EMIRATE_CODES, UAE_PHONE_REGEX } from '@/config/site';
import type { EmirateCode } from '@/types';

/* Shared validation — used by React Hook Form on the client and re-checked by the mock API. */

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, label + ' must be at least 2 characters')
    .max(40, label + ' is too long')
    .regex(/^[\p{L}\s'’.-]+$/u, label + ' can only contain letters');

export const emailSchema = z.string().trim().toLowerCase().min(1, 'Email is required').max(120).pipe(z.email('Enter a valid email address'));

export const uaePhoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .transform((v) => v.replace(/[\s()-]/g, ''))
  .refine((v) => UAE_PHONE_REGEX.test(v), 'Enter a valid UAE number, e.g. 050 123 4567');

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(64, 'Password is too long')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/\d/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol, e.g. @ or #');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(64),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, 'Enter your full name')
      .max(80)
      .regex(/^[\p{L}\s'’.-]+$/u, 'Name can only contain letters')
      .refine((v) => v.split(/\s+/).length >= 2, 'Please enter your first and last name'),
    email: emailSchema,
    phone: uaePhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((v) => v, 'You must accept the terms to continue'),
    marketingOptIn: z.boolean(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type RegisterValues = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const profileSchema = z.object({
  firstName: name('First name'),
  lastName: name('Last name'),
  email: emailSchema,
  phone: uaePhoneSchema,
});
export type ProfileValues = z.input<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a different password' });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const customerInfoSchema = z.object({
  firstName: name('First name'),
  lastName: name('Last name'),
  email: emailSchema,
  phone: uaePhoneSchema,
});
export type CustomerInfoValues = z.input<typeof customerInfoSchema>;

const line = (label: string, min = 2, max = 80) => z.string().trim().min(min, label + ' is required').max(max, label + ' is too long');

export const addressSchema = z.object({
  fullName: line('Full name', 3),
  phone: uaePhoneSchema,
  emirate: z.enum(EMIRATE_CODES as [EmirateCode, ...EmirateCode[]], 'Select an emirate'),
  city: line('City'),
  area: line('Area'),
  building: line('Building / villa name', 1),
  unit: line('Apartment / villa number', 1, 20),
  street: line('Street'),
  landmark: z.string().trim().max(80, 'Landmark is too long').optional().or(z.literal('')),
  label: z.enum(['home', 'office']),
  isDefault: z.boolean(),
});
export type AddressValues = z.input<typeof addressSchema>;

function luhn(num: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export const cardSchema = z.object({
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => /^\d{13,19}$/.test(v), 'Enter a valid card number')
    .refine((v) => luhn(v), 'This card number looks incorrect'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY')
    .refine((v) => {
      const [m, y] = v.split('/').map(Number);
      const exp = new Date(2000 + y, m, 1);
      return exp.getTime() > Date.now();
    }, 'This card has expired'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Enter the 3 or 4 digit security code'),
  cardholder: z.string().trim().min(3, 'Enter the name on the card').max(60).regex(/^[\p{L}\s'’.-]+$/u, 'Letters only'),
});
export type CardValues = z.input<typeof cardSchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Please select a rating').max(5),
  title: z.string().trim().min(3, 'Add a short title').max(80, 'Keep the title under 80 characters'),
  comment: z.string().trim().min(15, 'Tell us a bit more (at least 15 characters)').max(1000, 'Keep it under 1000 characters'),
});
export type ReviewValues = z.infer<typeof reviewSchema>;

export const newsletterSchema = z.object({ email: emailSchema });
export type NewsletterValues = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(60),
  email: emailSchema,
  topic: z.enum(['order', 'product', 'returns', 'partnership', 'other']),
  orderNumber: z.string().trim().max(20).optional().or(z.literal('')),
  message: z.string().trim().min(20, 'Please give us a little more detail (20+ characters)').max(1500),
});
export type ContactValues = z.input<typeof contactSchema>;

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{3,20}$/, '3–20 letters or numbers'),
    description: z.string().trim().min(5, 'Add a short description').max(120),
    type: z.enum(['percentage', 'fixed', 'free-delivery']),
    value: z.number({ error: 'Enter a value' }).min(0).max(10000),
    minOrder: z.number({ error: 'Enter a minimum order' }).min(0).max(100000),
    maxDiscount: z.number().min(0).max(100000).optional(),
    expiresAt: z.string().min(1, 'Choose an expiry date'),
    active: z.boolean(),
    firstOrderOnly: z.boolean(),
    usageLimit: z.number().int().min(1).max(1_000_000).optional(),
  })
  .refine((v) => v.type !== 'percentage' || (v.value > 0 && v.value <= 90), { path: ['value'], message: 'Percentage must be 1–90' })
  .refine((v) => v.type !== 'fixed' || v.value > 0, { path: ['value'], message: 'Enter a discount amount' });
export type CouponFormValues = z.input<typeof couponFormSchema>;

export const productFormSchema = z
  .object({
    name: z.string().trim().min(3, 'Enter a product name').max(100),
    brand: z.string().min(1, 'Choose a brand'),
    sport: z.string().min(1, 'Choose a sport'),
    category: z.string().min(1, 'Choose a category'),
    subcategory: z.string().min(1, 'Choose a subcategory'),
    price: z.number({ error: 'Enter a price' }).positive('Price must be above 0').max(100000),
    originalPrice: z.number({ error: 'Enter the original price' }).positive().max(100000),
    stock: z.number({ error: 'Enter stock' }).int().min(0).max(100000),
    shortDescription: z.string().trim().min(10, 'At least 10 characters').max(200),
    description: z.string().trim().min(20, 'At least 20 characters').max(3000),
    image: z.string().min(1, 'Choose an image'),
    gender: z.enum(['men', 'women', 'unisex', 'kids']),
    status: z.enum(['published', 'draft']),
    featured: z.boolean(),
    bestseller: z.boolean(),
    newArrival: z.boolean(),
    deal: z.boolean(),
  })
  .refine((v) => v.originalPrice >= v.price, { path: ['originalPrice'], message: 'Original price must be ≥ selling price' });
export type ProductFormValues = z.input<typeof productFormSchema>;
