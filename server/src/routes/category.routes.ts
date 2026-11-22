import { Router } from 'express';
import { getAllCategories, getCategoryBySlug, upsertCategory } from '../controllers/category.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/upsert', requireAuth, requireRole(Role.ADMIN), upsertCategory);

export default router;
