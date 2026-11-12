import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageSpinner } from '@/components/ui/Spinner';
import { AdminRoute, GuestOnlyRoute, ProtectedRoute } from './guards';
import { RouteErrorPage } from '@/pages/errors/RouteErrorPage';

/* Every page is code-split; named exports are adapted for React.lazy. */
function page<T extends Record<string, ComponentType>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}

const HomePage = page(() => import('@/pages/home/HomePage'), 'HomePage');
const ShopPage = page(() => import('@/pages/shop/ShopPage'), 'ShopPage');
const SearchPage = page(() => import('@/pages/shop/SearchPage'), 'SearchPage');
const SportPage = page(() => import('@/pages/sport/SportPage'), 'SportPage');
const CategoryPage = page(() => import('@/pages/category/CategoryPage'), 'CategoryPage');
const CollectionPage = page(() => import('@/pages/sport/CollectionPage'), 'CollectionPage');
const DealsPage = page(() => import('@/pages/shop/CuratedPages'), 'DealsPage');
const NewArrivalsPage = page(() => import('@/pages/shop/CuratedPages'), 'NewArrivalsPage');
const BestSellersPage = page(() => import('@/pages/shop/CuratedPages'), 'BestSellersPage');
const ProductPage = page(() => import('@/pages/product/ProductPage'), 'ProductPage');
const WishlistPage = page(() => import('@/pages/cart/WishlistPage'), 'WishlistPage');
const CartPage = page(() => import('@/pages/cart/CartPage'), 'CartPage');
const CheckoutPage = page(() => import('@/pages/checkout/CheckoutPage'), 'CheckoutPage');
const OrderConfirmationPage = page(() => import('@/pages/checkout/OrderConfirmationPage'), 'OrderConfirmationPage');
const AboutPage = page(() => import('@/pages/info/InfoPages'), 'AboutPage');
const ContactPage = page(() => import('@/pages/info/InfoPages'), 'ContactPage');
const PolicyPage = page(() => import('@/pages/info/PolicyPage'), 'PolicyPage');
const LoginPage = page(() => import('@/pages/auth/AuthPages'), 'LoginPage');
const RegisterPage = page(() => import('@/pages/auth/AuthPages'), 'RegisterPage');
const ForgotPasswordPage = page(() => import('@/pages/auth/AuthPages'), 'ForgotPasswordPage');
const AccountLayout = page(() => import('@/pages/account/AccountLayout'), 'AccountLayout');
const AccountDashboard = page(() => import('@/pages/account/AccountDashboard'), 'AccountDashboard');
const ProfilePage = page(() => import('@/pages/account/ProfilePage'), 'ProfilePage');
const OrdersPage = page(() => import('@/pages/account/OrdersPage'), 'OrdersPage');
const OrderDetailsPage = page(() => import('@/pages/account/OrderDetailsPage'), 'OrderDetailsPage');
const AddressesPage = page(() => import('@/pages/account/AddressesPage'), 'AddressesPage');
const SettingsPage = page(() => import('@/pages/account/SettingsPage'), 'SettingsPage');
const AccountWishlistPage = page(() => import('@/pages/cart/WishlistPage'), 'AccountWishlistPage');
const AdminLayout = page(() => import('@/pages/admin/AdminLayout'), 'AdminLayout');
const AdminDashboard = page(() => import('@/pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminProducts = page(() => import('@/pages/admin/AdminProducts'), 'AdminProducts');
const AdminOrders = page(() => import('@/pages/admin/AdminOrders'), 'AdminOrders');
const AdminCustomers = page(() => import('@/pages/admin/AdminCustomers'), 'AdminCustomers');
const AdminCategories = page(() => import('@/pages/admin/AdminCategories'), 'AdminCategories');
const AdminInventory = page(() => import('@/pages/admin/AdminInventory'), 'AdminInventory');
const AdminCoupons = page(() => import('@/pages/admin/AdminCoupons'), 'AdminCoupons');
const AdminReviews = page(() => import('@/pages/admin/AdminReviews'), 'AdminReviews');
const AdminAnalytics = page(() => import('@/pages/admin/AdminAnalytics'), 'AdminAnalytics');
const NotFoundPage = page(() => import('@/pages/errors/NotFoundPage'), 'NotFoundPage');

const s = (node: ReactNode) => <Suspense fallback={<PageSpinner />}>{node}</Suspense>;

export const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'shop', element: <ShopPage /> },
        { path: 'search', element: <SearchPage /> },
        { path: 'sport/:slug', element: <SportPage /> },
        { path: 'category/:slug', element: <CategoryPage /> },
        { path: 'collections/:slug', element: <CollectionPage /> },
        { path: 'product/:slug', element: <ProductPage /> },
        { path: 'deals', element: <DealsPage /> },
        { path: 'new-arrivals', element: <NewArrivalsPage /> },
        { path: 'best-sellers', element: <BestSellersPage /> },
        { path: 'wishlist', element: <WishlistPage /> },
        { path: 'cart', element: <CartPage /> },
        { path: 'checkout', element: <CheckoutPage /> },
        { path: 'order-confirmation', element: <OrderConfirmationPage /> },
        { path: 'about', element: <AboutPage /> },
        { path: 'contact', element: <ContactPage /> },
        { path: 'policies/:slug', element: <PolicyPage /> },
        { path: 'login', element: <GuestOnlyRoute><LoginPage /></GuestOnlyRoute> },
        { path: 'register', element: <GuestOnlyRoute><RegisterPage /></GuestOnlyRoute> },
        { path: 'forgot-password', element: <ForgotPasswordPage /> },
        {
          path: 'account',
          element: <ProtectedRoute>{s(<AccountLayout />)}</ProtectedRoute>,
          children: [
            { index: true, element: <AccountDashboard /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'orders', element: <OrdersPage /> },
            { path: 'orders/:id', element: <OrderDetailsPage /> },
            { path: 'wishlist', element: <AccountWishlistPage /> },
            { path: 'addresses', element: <AddressesPage /> },
            { path: 'settings', element: <SettingsPage /> },
          ],
        },
        { path: '404', element: <NotFoundPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
    {
      path: 'admin',
      errorElement: <RouteErrorPage />,
      element: <AdminRoute>{s(<AdminLayout />)}</AdminRoute>,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'products', element: <AdminProducts /> },
        { path: 'orders', element: <AdminOrders /> },
        { path: 'customers', element: <AdminCustomers /> },
        { path: 'categories', element: <AdminCategories /> },
        { path: 'inventory', element: <AdminInventory /> },
        { path: 'coupons', element: <AdminCoupons /> },
        { path: 'reviews', element: <AdminReviews /> },
        { path: 'analytics', element: <AdminAnalytics /> },
        { path: '*', element: <Navigate to="/admin" replace /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
