import { Router } from 'express';
import { sendMessage, getThreadMessages } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/send', requireAuth, upload.single('image'), sendMessage);
router.get('/messages', requireAuth, getThreadMessages);

export default router;
