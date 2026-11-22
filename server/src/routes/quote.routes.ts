import { Router } from 'express';
import {
  createRfq,
  getVendorRfqInbox,
  submitQuote,
  getRfqDetails,
  acceptQuote,
  getCustomerRfqs
} from '../controllers/quote.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { Role } from '../types';

const router = Router();

router.post('/rfq', requireAuth, upload.array('attachments', 5), createRfq);
router.get('/my-rfqs', requireAuth, getCustomerRfqs);
router.get('/vendor-inbox', requireAuth, requireRole(Role.VENDOR), getVendorRfqInbox);
router.get('/:id', requireAuth, getRfqDetails);
router.post('/:rfqId/submit', requireAuth, requireRole(Role.VENDOR), submitQuote);
router.post('/:rfqId/accept/:quoteId', requireAuth, acceptQuote);

export default router;
