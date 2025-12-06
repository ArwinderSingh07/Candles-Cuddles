import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomOrderPage } from './pages/CustomOrderPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SpotlightWinterPage } from './pages/SpotlightWinter';
import { SpotlightCustomPage } from './pages/SpotlightCustom';
import { SpotlightGiftsPage } from './pages/SpotlightGifts';
import { ProfilePage } from './pages/ProfilePage';
import { ProfileAddressesPage } from './pages/ProfileAddressesPage';
import { ProfilePaymentsPage } from './pages/ProfilePaymentsPage';
import { ProfileOrdersPage } from './pages/ProfileOrdersPage';
import './index.css';

function App() {
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/addresses" element={<ProfileAddressesPage />} />
        <Route path="/profile/payments" element={<ProfilePaymentsPage />} />
        <Route path="/profile/orders" element={<ProfileOrdersPage />} />
        <Route path="/spotlight/winter" element={<SpotlightWinterPage />} />
        <Route path="/spotlight/custom" element={<SpotlightCustomPage />} />
        <Route path="/spotlight/gifts" element={<SpotlightGiftsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
