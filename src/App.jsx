import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomeScreen } from '@/screens/HomeScreen'
import { AboutScreen } from '@/screens/AboutScreen'
import { ContactScreen } from '@/screens/ContactScreen'
import { CartScreen } from '@/screens/CartScreen'
import { CheckoutScreen } from '@/screens/CheckoutScreen'
import { WishlistScreen } from '@/screens/WishlistScreen'
import { LoginScreen } from '@/screens/LoginScreen'
import { SignUpScreen } from '@/screens/SignUpScreen'
import { ProductDetailScreen } from '@/screens/ProductDetailScreen'
import { NotFoundScreen } from '@/screens/NotFoundScreen'

/**
 * App router — the MainLayout (Navbar + Outlet + Footer) wraps every route,
 * mirroring the original Next.js root layout. 9 real routes + a 404 catch-all.
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
        <Route path="/404" element={<NotFoundScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}

export default App
