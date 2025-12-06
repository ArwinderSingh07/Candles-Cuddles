import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomOrderPage } from './pages/CustomOrderPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SpotlightWinterPage } from './pages/SpotlightWinter';
import { SpotlightCustomPage } from './pages/SpotlightCustom';
import { SpotlightGiftsPage } from './pages/SpotlightGifts';
import { ProfilePage } from './pages/ProfilePage';
import { ProfileAddressesPage } from './pages/ProfileAddressesPage';
import { ProfilePaymentsPage } from './pages/ProfilePaymentsPage';
import { ProfileOrdersPage } from './pages/ProfileOrdersPage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ScentFinderPage } from './pages/ScentFinderPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminProductFormPage } from './pages/AdminProductFormPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminBehaviorAnalyticsPage } from './pages/AdminBehaviorAnalyticsPage';
import { AdminRoute } from './components/AdminRoute';
import { usePageTracking } from './hooks/useAnalytics';
import './index.css';

function App() {
  // Track page views
  usePageTracking();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/custom-order" element={<CustomOrderPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/addresses" element={<ProfileAddressesPage />} />
        <Route path="/profile/payments" element={<ProfilePaymentsPage />} />
        <Route path="/profile/orders" element={<ProfileOrdersPage />} />
        <Route path="/spotlight/winter" element={<SpotlightWinterPage />} />
        <Route path="/spotlight/custom" element={<SpotlightCustomPage />} />
        <Route path="/spotlight/gifts" element={<SpotlightGiftsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/scent-finder" element={<ScentFinderPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <AdminRoute>
              <AdminProductFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics/behavior"
          element={
            <AdminRoute>
              <AdminBehaviorAnalyticsPage />
            </AdminRoute>
          }
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
