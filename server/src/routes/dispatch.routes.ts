import { Router } from 'express';
import {
  createDispatchRequest,
  getNearbyDispatchesForVendor,
  acceptDispatch,
  updateDispatchStatus,
  verifyStartOtp,
  completeDispatch,
  getDispatchById,
  getMyDispatches
} from '../controllers/dispatch.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { Role } from '../types';

const router = Router();

router.post('/request', requireAuth, createDispatchRequest);
router.get('/my', requireAuth, getMyDispatches);
router.get('/vendor-feed', requireAuth, requireRole(Role.VENDOR), getNearbyDispatchesForVendor);
router.get('/:id', requireAuth, getDispatchById);
router.patch('/:id/accept', requireAuth, requireRole(Role.VENDOR), acceptDispatch);
router.patch('/:id/status', requireAuth, updateDispatchStatus);
router.post('/:id/verify-start-otp', requireAuth, requireRole(Role.VENDOR), verifyStartOtp);
router.post('/:id/complete', requireAuth, requireRole(Role.VENDOR), upload.single('proofPhoto'), completeDispatch);

export default router;
