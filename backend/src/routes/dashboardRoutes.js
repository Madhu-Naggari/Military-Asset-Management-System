import { Router } from 'express';

import {
  getDashboardNetMovementDetails,
  getDashboardSummary
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/summary', getDashboardSummary);
router.get('/net-movement-details', getDashboardNetMovementDetails);

export default router;
