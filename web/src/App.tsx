import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import UtilityBar from './components/layout/UtilityBar'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import MobileBottomNav from './components/layout/MobileBottomNav'
import AssistantWidget from './components/assistant/AssistantWidget'
import { Canvas3DHost } from './components/product/Product3DViewer'
import ErrorBoundary from './components/common/ErrorBoundary'
import PageError from './components/common/PageError'
import Home from './pages/Home'

// Home is the landing page and stays in the main bundle; every other page loads on first visit.
const Shop = lazy(() => import('./pages/Shop'))
const Xerox = lazy(() => import('./pages/Xerox'))
const OrderStatus = lazy(() => import('./pages/OrderStatus'))
const Cart = lazy(() => import('./pages/Cart'))

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-navy"
      >
        {t('common.skipToContent')}
      </a>
      <ScrollManager />
      <UtilityBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {/* Keyed by path: moving to another page clears a caught error. */}
        <ErrorBoundary key={pathname} fallback={<PageError />}>
          <Suspense fallback={<div aria-busy="true" className="min-h-[60vh]" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
      <AssistantWidget />
      <Canvas3DHost />
    </div>
  )
}

export default function App() {
  return (
    // Last resort for errors outside a page (header, footer); pages have their own boundary in Layout.
    <ErrorBoundary fallback={<PageError />}>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="xerox" element={<Xerox />} />
          <Route path="order-status" element={<OrderStatus />} />
          <Route path="cart" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
