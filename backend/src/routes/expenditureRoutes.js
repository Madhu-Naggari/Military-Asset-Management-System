import { Router } from 'express';

import { createExpenditure, getExpenditures } from '../controllers/expenditureController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(protect);
router
  .route('/')
  .get(getExpenditures)
  .post(authorize('admin', 'base_commander'), createExpenditure);

export default router;
