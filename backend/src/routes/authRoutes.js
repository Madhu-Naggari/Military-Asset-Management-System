import { Router } from 'express';

import { getProfile, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', protect, getProfile);

export default router;
