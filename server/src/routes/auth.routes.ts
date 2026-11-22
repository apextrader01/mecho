import { Router } from 'express';
import { register, login, getCurrentUser, updatePreferredLang } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/preferred-lang', requireAuth, updatePreferredLang);

export default router;
