import { Router } from 'express';
import {
  getAdminDashboardStats,
  getVendorsList,
  updateKycStatus,
  getLiveDispatchesMap,
  getCustomersList
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.get('/dashboard-stats', requireAuth, requireRole(Role.ADMIN), getAdminDashboardStats);
router.get('/vendors', requireAuth, requireRole(Role.ADMIN), getVendorsList);
router.get('/customers', requireAuth, requireRole(Role.ADMIN), getCustomersList);
router.patch('/vendors/:vendorId/kyc', requireAuth, requireRole(Role.ADMIN), updateKycStatus);
router.get('/live-map', requireAuth, requireRole(Role.ADMIN), getLiveDispatchesMap);

export default router;
