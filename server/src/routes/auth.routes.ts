import { Router } from 'express';
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  getCurrentUser,
  updateProfile,
  updatePreferredLang
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/preferred-lang', requireAuth, updatePreferredLang);

export default router;
