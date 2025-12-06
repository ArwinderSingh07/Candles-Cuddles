import { Router } from 'express';
import { liveness, readiness } from '../controllers/health.controller';
import {
  listProducts,
  getProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminListProducts,
} from '../controllers/products.controller';
import { createOrder, verifyOrder, listOrders, adminUpdateOrderStatus, deleteOrder } from '../controllers/orders.controller';
import { getPresignedUploadUrl } from '../controllers/uploads.controller';
import { handleRazorpayWebhook } from '../controllers/webhook.controller';
import { adminLogin, createAdminUser } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { createRateLimiter } from '../middlewares/rateLimiter';
import { metricsRegistry } from '../config/metrics';
import {
  createOrUpdateCustomer,
  signInCustomer,
  getCustomer,
  getCustomerByEmail,
  updateCustomer,
  updateCustomerAddresses,
  updateCustomerPaymentMethods,
  getCustomerOrders,
  changePassword,
} from '../controllers/customer.controller';
import { requestPasswordReset, verifyOTPAndResetPassword } from '../controllers/passwordReset.controller';
import { submitContactForm } from '../controllers/contact.controller';
import { submitCustomOrder } from '../controllers/customOrder.controller';
import { subscribeNewsletter, unsubscribeNewsletter } from '../controllers/newsletter.controller';
import {
  createReview,
  getProductReviews,
  getCustomerReview,
  updateReview,
  deleteReview,
  getRecentReviews,
} from '../controllers/reviews.controller';
import { authenticateCustomer } from '../middlewares/customerAuth';
import {
  trackPageView,
  trackProductView,
  trackCartAction,
  getTrafficMetrics,
  getProductEngagement,
} from '../controllers/analytics.controller';

const router = Router();
const adminRouter = Router();

router.get('/health', liveness);
router.get('/ready', readiness);
router.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});

router.get('/products', listProducts);
router.get('/products/:id', getProduct);

router.post('/orders/create', createOrder);
router.post('/orders/verify', verifyOrder);

router.post('/uploads/presign', getPresignedUploadUrl);

router.post('/customers', createOrUpdateCustomer);
router.post('/customers/signin', signInCustomer);
router.post('/customers/password/reset', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), requestPasswordReset);
router.post('/customers/password/verify-otp', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), verifyOTPAndResetPassword);

router.post('/contact', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), submitContactForm);
router.post('/custom-orders', createRateLimiter({ max: 3, windowMs: 15 * 60 * 1000 }), submitCustomOrder);

router.post('/newsletter/subscribe', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), subscribeNewsletter);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);

// Review routes
router.get('/reviews/product/:productId', getProductReviews);
router.get('/reviews/product/:productId/customer', authenticateCustomer, getCustomerReview);
router.get('/reviews/recent', getRecentReviews); // Public endpoint for testimonials
router.post('/reviews', createRateLimiter({ max: 10, windowMs: 60 * 60 * 1000 }), authenticateCustomer, createReview);
router.patch('/reviews/:id', authenticateCustomer, updateReview);
router.delete('/reviews/:id', authenticateCustomer, deleteReview);

router.get('/customers/email', getCustomerByEmail);
router.get('/customers/:id', getCustomer);
router.patch('/customers/:id', updateCustomer);
router.post('/customers/:id/password/change', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), changePassword);
router.put('/customers/:id/addresses', updateCustomerAddresses);
router.put('/customers/:id/payment-methods', updateCustomerPaymentMethods);
router.get('/customers/:id/orders', getCustomerOrders);

router.post('/webhook/razorpay', handleRazorpayWebhook);

adminRouter.post('/login', adminLogin);
adminRouter.post('/users', authenticate, requireRole(['admin']), createAdminUser);

adminRouter.use(authenticate, requireRole(['admin', 'staff']));
adminRouter.get('/orders', listOrders);
adminRouter.patch('/orders/:id/status', adminUpdateOrderStatus);
adminRouter.delete('/orders/:id', deleteOrder);
adminRouter.get('/products', adminListProducts);
adminRouter.post('/products', adminCreateProduct);
adminRouter.patch('/products/:id', adminUpdateProduct);
adminRouter.delete('/products/:id', adminDeleteProduct);
adminRouter.get('/analytics/traffic', getTrafficMetrics);
adminRouter.get('/analytics/products', getProductEngagement);
router.use('/admin', adminRouter);

// Public analytics tracking endpoints (no auth required)
router.post('/analytics/pageview', trackPageView);
router.post('/analytics/productview', trackProductView);
router.post('/analytics/cartaction', trackCartAction);

export { router as routes };

