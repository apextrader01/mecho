import { Router } from 'express';
import {
  getProducts,
  createProduct,
  createOrder,
  updateOrderStatus,
  createSubscription,
  getMySubscriptions,
  logSubscriptionDelivery,
  toggleSubscriptionStatus
} from '../controllers/commerce.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { Role } from '../types';

const router = Router();

// Catalog
router.get('/products', getProducts);
router.post('/products', requireAuth, requireRole(Role.VENDOR), upload.single('image'), createProduct);

// Orders
router.post('/orders', requireAuth, createOrder);
router.patch('/orders/:id/status', requireAuth, requireRole(Role.VENDOR), upload.single('proofPhoto'), updateOrderStatus);

// Subscriptions
router.post('/subscriptions', requireAuth, createSubscription);
router.get('/subscriptions/my', requireAuth, getMySubscriptions);
router.patch('/subscriptions/:id/status', requireAuth, toggleSubscriptionStatus);
router.post('/subscriptions/:subscriptionId/log', requireAuth, requireRole(Role.VENDOR), upload.single('proofPhoto'), logSubscriptionDelivery);

export default router;
