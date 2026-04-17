import { Router } from 'express';

import { createPurchase, getPurchases } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(protect);
router
  .route('/')
  .get(getPurchases)
  .post(authorize('admin', 'base_commander', 'logistics_officer'), createPurchase);

export default router;
