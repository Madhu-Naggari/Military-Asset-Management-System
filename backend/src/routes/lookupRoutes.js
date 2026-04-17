import { Router } from 'express';

import { getBases, getEquipmentTypes, getUsers } from '../controllers/lookupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/bases', getBases);
router.get('/equipment-types', getEquipmentTypes);
router.get('/users', getUsers);

export default router;
