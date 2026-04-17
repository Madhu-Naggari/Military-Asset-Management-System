import { Router } from 'express';

import { createTransfer, getTransfers } from '../controllers/transferController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(protect);
router
  .route('/')
  .get(getTransfers)
  .post(authorize('admin', 'base_commander', 'logistics_officer'), createTransfer);

export default router;
