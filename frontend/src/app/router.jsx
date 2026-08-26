import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../components/layout/main-layout'
import { UserDashboardLayout } from '../components/layout/user-dashboard-layout'
import { AdminDashboardLayout } from '../components/layout/admin-dashboard-layout'
import { UserRoute } from '../components/ui/user-route'
import { AdminRoute } from '../components/ui/admin-route'
import { Spinner } from '../components/ui/spinner'
import { HomeScreen } from '../screens/HomeScreen'
import { NotFoundScreen } from '../screens/NotFoundScreen'
import { policySections, termsSections } from '../data/siteContent'

// Route-level code splitting. Home stays eager for instant first paint; every
// other screen loads on demand behind a per-route Suspense boundary so the
// shell (navbar/footer) never flashes away mid-navigation.
const load = (loader) => lazy(loader)

const AboutScreen = load(() => import('../screens/AboutScreen').then((m) => ({ default: m.AboutScreen })))
const ContactScreen = load(() => import('../screens/ContactScreen').then((m) => ({ default: m.ContactScreen })))
const CartScreen = load(() => import('../screens/CartScreen').then((m) => ({ default: m.CartScreen })))
const CheckoutScreen = load(() => import('../screens/CheckoutScreen').then((m) => ({ default: m.CheckoutScreen })))
const WishlistScreen = load(() => import('../screens/WishlistScreen').then((m) => ({ default: m.WishlistScreen })))
const LoginScreen = load(() => import('../screens/LoginScreen').then((m) => ({ default: m.LoginScreen })))
const SignUpScreen = load(() => import('../screens/SignUpScreen').then((m) => ({ default: m.SignUpScreen })))
const VerifyEmailScreen = load(() => import('../screens/VerifyEmailScreen').then((m) => ({ default: m.VerifyEmailScreen })))
const ProductDetailScreen = load(() => import('../screens/ProductDetailScreen').then((m) => ({ default: m.ProductDetailScreen })))
const ShopScreen = load(() => import('../screens/ShopScreen').then((m) => ({ default: m.ShopScreen })))
const ContentPage = load(() => import('../screens/ContentPage').then((m) => ({ default: m.ContentPage })))
const FaqScreen = load(() => import('../screens/FaqScreen').then((m) => ({ default: m.FaqScreen })))

// User Dashboard Screens
const UserDashboard = load(() => import('../screens/user/dashboard-screen').then((m) => ({ default: m.DashboardScreen })))
const UserOrders = load(() => import('../screens/user/orders-list-screen').then((m) => ({ default: m.OrdersListScreen })))
const UserOrderDetail = load(() => import('../screens/user/order-detail-screen').then((m) => ({ default: m.OrderDetailScreen })))
const AddressesScreen = load(() => import('../screens/user/addresses-screen').then((m) => ({ default: m.AddressesScreen })))
const ProfileScreen = load(() => import('../screens/user/profile-screen').then((m) => ({ default: m.ProfileScreen })))
const SecurityScreen = load(() => import('../screens/user/security-screen').then((m) => ({ default: m.SecurityScreen })))

// Admin Dashboard Screens
const AdminDashboardScreen = load(() => import('../screens/admin/dashboard-screen').then((m) => ({ default: m.AdminDashboardScreen })))
const ProductsListScreen = load(() => import('../screens/admin/products-list-screen').then((m) => ({ default: m.ProductsListScreen })))
const CategoriesScreen = load(() => import('../screens/admin/categories-screen').then((m) => ({ default: m.CategoriesScreen })))
const AdminOrders = load(() => import('../screens/admin/orders-list-screen').then((m) => ({ default: m.OrdersListScreen })))
const AdminOrderDetail = load(() => import('../screens/admin/order-detail-screen').then((m) => ({ default: m.OrderDetailScreen })))
const CustomersListScreen = load(() => import('../screens/admin/customers-list-screen').then((m) => ({ default: m.CustomersListScreen })))
const CustomerDetailScreen = load(() => import('../screens/admin/customer-detail-screen').then((m) => ({ default: m.CustomerDetailScreen })))
const AnalyticsScreen = load(() => import('../screens/admin/analytics-screen').then((m) => ({ default: m.AnalyticsScreen })))
const ReviewsScreen = load(() => import('../screens/admin/reviews-screen').then((m) => ({ default: m.ReviewsScreen })))
const SettingsScreen = load(() => import('../screens/admin/settings-screen').then((m) => ({ default: m.SettingsScreen })))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8 text-[var(--color-primary)]" />
    </div>
  )
}

const withSuspense = (node) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/about" element={withSuspense(<AboutScreen />)} />
        <Route path="/contact" element={withSuspense(<ContactScreen />)} />
        <Route path="/cart" element={withSuspense(<CartScreen />)} />
        <Route path="/checkout" element={withSuspense(<CheckoutScreen />)} />
        <Route path="/wishlist" element={withSuspense(<WishlistScreen />)} />
        <Route path="/login" element={withSuspense(<LoginScreen />)} />
        <Route path="/sign-up" element={withSuspense(<SignUpScreen />)} />
        <Route path="/verify-email" element={withSuspense(<VerifyEmailScreen />)} />
        <Route path="/product/:slug" element={withSuspense(<ProductDetailScreen />)} />
        <Route path="/shop" element={withSuspense(<ShopScreen />)} />
        <Route path="/privacy-policy" element={withSuspense(<ContentPage title="Privacy Policy" intro="This policy explains what information Exclusive collects and how we use and protect it." sections={policySections} />)} />
        <Route path="/terms-of-use" element={withSuspense(<ContentPage title="Terms of Use" intro="These terms describe the rules that apply when you browse, shop, or create an account with Exclusive." sections={termsSections} />)} />
        <Route path="/faq" element={withSuspense(<FaqScreen />)} />
      </Route>

      {/* User Dashboard routes (wrapped in MainLayout so navbar/footer persist) */}
      <Route
        path="/account"
        element={
          <MainLayout>
            <UserRoute>
              <UserDashboardLayout />
            </UserRoute>
          </MainLayout>
        }
      >
        <Route index element={withSuspense(<UserDashboard />)} />
        <Route path="orders" element={withSuspense(<UserOrders />)} />
        <Route path="orders/:id" element={withSuspense(<UserOrderDetail />)} />
        <Route path="addresses" element={withSuspense(<AddressesScreen />)} />
        <Route path="profile" element={withSuspense(<ProfileScreen />)} />
        <Route path="security" element={withSuspense(<SecurityScreen />)} />
        <Route path="wishlist" element={withSuspense(<WishlistScreen />)} />
      </Route>

      {/* Admin Dashboard routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardLayout />
          </AdminRoute>
        }
      >
        <Route index element={withSuspense(<AdminDashboardScreen />)} />
        <Route path="products" element={withSuspense(<ProductsListScreen />)} />
        <Route path="categories" element={withSuspense(<CategoriesScreen />)} />
        <Route path="orders" element={withSuspense(<AdminOrders />)} />
        <Route path="orders/:id" element={withSuspense(<AdminOrderDetail />)} />
        <Route path="customers" element={withSuspense(<CustomersListScreen />)} />
        <Route path="customers/:id" element={withSuspense(<CustomerDetailScreen />)} />
        <Route path="analytics" element={withSuspense(<AnalyticsScreen />)} />
        <Route path="reviews" element={withSuspense(<ReviewsScreen />)} />
        <Route path="settings" element={withSuspense(<SettingsScreen />)} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  )
}
