import { Router } from 'express';

import { createAssignment, getAssignments } from '../controllers/assignmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(protect);
router
  .route('/')
  .get(getAssignments)
  .post(authorize('admin', 'base_commander'), createAssignment);

export default router;
