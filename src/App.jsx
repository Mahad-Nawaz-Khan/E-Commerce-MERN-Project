import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomeScreen } from './screens/HomeScreen'
import { AboutScreen } from './screens/AboutScreen'
import { ContactScreen } from './screens/ContactScreen'
import { CartScreen } from './screens/CartScreen'
import { CheckoutScreen } from './screens/CheckoutScreen'
import { WishlistScreen } from './screens/WishlistScreen'
import { LoginScreen } from './screens/LoginScreen'
import { SignUpScreen } from './screens/SignUpScreen'
import { ProductDetailScreen } from './screens/ProductDetailScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'
import { ShopScreen } from './screens/ShopScreen'
import { ContentPage } from './screens/ContentPage'
import { FaqScreen } from './screens/FaqScreen'
import { AdminScreen } from './screens/AdminScreen'
import { policySections, termsSections } from './data/siteContent'

/**
 * App router — the MainLayout (Navbar + Outlet + Footer) wraps every route,
 * a root layout. 9 real routes + a 404 catch-all.
 */
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/wishlist" element={<WishlistScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/sign-up" element={<SignUpScreen />} />
        <Route path="/product/:slug" element={<ProductDetailScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route
          path="/privacy-policy"
          element={<ContentPage title="Privacy Policy" intro="This policy explains what information Exclusive collects and how we use and protect it." sections={policySections} />}
        />
        <Route
          path="/terms-of-use"
          element={<ContentPage title="Terms of Use" intro="These terms describe the rules that apply when you browse, shop, or create an account with Exclusive." sections={termsSections} />}
        />
        <Route path="/faq" element={<FaqScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}

export default App
