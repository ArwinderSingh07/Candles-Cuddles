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

