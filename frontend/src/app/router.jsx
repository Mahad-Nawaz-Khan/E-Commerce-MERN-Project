import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../components/layout/main-layout'
import { UserDashboardLayout } from '../components/layout/user-dashboard-layout'
import { AdminDashboardLayout } from '../components/layout/admin-dashboard-layout'
import { UserRoute } from '../components/ui/user-route'
import { AdminRoute } from '../components/ui/admin-route'
import { HomeScreen } from '../screens/HomeScreen'
import { AboutScreen } from '../screens/AboutScreen'
import { ContactScreen } from '../screens/ContactScreen'
import { CartScreen } from '../screens/CartScreen'
import { CheckoutScreen } from '../screens/CheckoutScreen'
import { WishlistScreen } from '../screens/WishlistScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { SignUpScreen } from '../screens/SignUpScreen'
import { VerifyEmailScreen } from '../screens/VerifyEmailScreen'
import { ProductDetailScreen } from '../screens/ProductDetailScreen'
import { NotFoundScreen } from '../screens/NotFoundScreen'
import { ShopScreen } from '../screens/ShopScreen'
import { ContentPage } from '../screens/ContentPage'
import { FaqScreen } from '../screens/FaqScreen'
import { policySections, termsSections } from '../data/siteContent'

// User Dashboard Screens
import { DashboardScreen as UserDashboard } from '../screens/user/dashboard-screen'
import { OrdersListScreen as UserOrders } from '../screens/user/orders-list-screen'
import { OrderDetailScreen as UserOrderDetail } from '../screens/user/order-detail-screen'
import { AddressesScreen } from '../screens/user/addresses-screen'
import { ProfileScreen } from '../screens/user/profile-screen'
import { SecurityScreen } from '../screens/user/security-screen'

// Admin Dashboard Screens
import { AdminDashboardScreen } from '../screens/admin/dashboard-screen'
import { ProductsListScreen } from '../screens/admin/products-list-screen'
import { CategoriesScreen } from '../screens/admin/categories-screen'
import { OrdersListScreen as AdminOrders } from '../screens/admin/orders-list-screen'
import { OrderDetailScreen as AdminOrderDetail } from '../screens/admin/order-detail-screen'
import { CustomersListScreen } from '../screens/admin/customers-list-screen'
import { CustomerDetailScreen } from '../screens/admin/customer-detail-screen'
import { AnalyticsScreen } from '../screens/admin/analytics-screen'
import { ReviewsScreen } from '../screens/admin/reviews-screen'
import { SettingsScreen } from '../screens/admin/settings-screen'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/wishlist" element={<WishlistScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/sign-up" element={<SignUpScreen />} />
        <Route path="/verify-email" element={<VerifyEmailScreen />} />
        <Route path="/product/:slug" element={<ProductDetailScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/privacy-policy" element={<ContentPage title="Privacy Policy" intro="This policy explains what information Exclusive collects and how we use and protect it." sections={policySections} />} />
        <Route path="/terms-of-use" element={<ContentPage title="Terms of Use" intro="These terms describe the rules that apply when you browse, shop, or create an account with Exclusive." sections={termsSections} />} />
        <Route path="/faq" element={<FaqScreen />} />
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
        <Route index element={<UserDashboard />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="orders/:id" element={<UserOrderDetail />} />
        <Route path="addresses" element={<AddressesScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="security" element={<SecurityScreen />} />
        <Route path="wishlist" element={<WishlistScreen />} />
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
        <Route index element={<AdminDashboardScreen />} />
        <Route path="products" element={<ProductsListScreen />} />
        <Route path="categories" element={<CategoriesScreen />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="customers" element={<CustomersListScreen />} />
        <Route path="customers/:id" element={<CustomerDetailScreen />} />
        <Route path="analytics" element={<AnalyticsScreen />} />
        <Route path="reviews" element={<ReviewsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  )
}
