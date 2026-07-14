import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

const Contact = lazy(() => import('./screens/Contact'))
const PrivacyPolicy = lazy(() => import('./screens/PrivacyPolicy'))
const TermsOfUse = lazy(() => import('./screens/TermsOfUse'))
const FAQ = lazy(() => import('./screens/FAQ'))

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Loading page...
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/contact" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
