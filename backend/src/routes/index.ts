import { Router } from 'express';
import { liveness, readiness } from '../controllers/health.controller';
import {
  listProducts,
  getProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../controllers/products.controller';
import { createOrder, verifyOrder, listOrders, adminUpdateOrderStatus } from '../controllers/orders.controller';
import { getPresignedUploadUrl } from '../controllers/uploads.controller';
import { handleRazorpayWebhook } from '../controllers/webhook.controller';
import { adminLogin, createAdminUser } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { metricsRegistry } from '../config/metrics';
import {
  createOrUpdateCustomer,
  getCustomer,
  updateCustomer,
  updateCustomerAddresses,
  updateCustomerPaymentMethods,
  getCustomerOrders,
} from '../controllers/customer.controller';

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
router.get('/customers/:id', getCustomer);
router.patch('/customers/:id', updateCustomer);
router.put('/customers/:id/addresses', updateCustomerAddresses);
router.put('/customers/:id/payment-methods', updateCustomerPaymentMethods);
router.get('/customers/:id/orders', getCustomerOrders);

router.post('/webhook/razorpay', handleRazorpayWebhook);

adminRouter.post('/login', adminLogin);
adminRouter.post('/users', authenticate, requireRole(['admin']), createAdminUser);

adminRouter.use(authenticate, requireRole(['admin', 'staff']));
adminRouter.get('/orders', listOrders);
adminRouter.patch('/orders/:id/status', adminUpdateOrderStatus);
adminRouter.post('/products', adminCreateProduct);
adminRouter.patch('/products/:id', adminUpdateProduct);
adminRouter.delete('/products/:id', adminDeleteProduct);

router.use('/admin', adminRouter);

export { router as routes };

