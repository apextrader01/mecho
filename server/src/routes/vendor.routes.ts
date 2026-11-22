import { Router } from 'express';
import {
  getVendorProfile,
  toggleVendorOnline,
  updateVendorSettings,
  getVendorEarnings
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.get('/profile', requireAuth, requireRole(Role.VENDOR), getVendorProfile);
router.patch('/availability', requireAuth, requireRole(Role.VENDOR), toggleVendorOnline);
router.patch('/settings', requireAuth, requireRole(Role.VENDOR), updateVendorSettings);
router.get('/earnings', requireAuth, requireRole(Role.VENDOR), getVendorEarnings);

export default router;
