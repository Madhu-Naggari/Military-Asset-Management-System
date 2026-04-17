import Base from '../models/Base.js';
import EquipmentType from '../models/EquipmentType.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { resolveScopedBaseId } from '../utils/scope.js';

export const getBases = asyncHandler(async (req, res) => {
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const bases = await Base.find(baseId ? { _id: baseId } : {}).sort({ name: 1 });

  res.json({
    success: true,
    data: bases
  });
});

export const getEquipmentTypes = asyncHandler(async (_req, res) => {
  const equipmentTypes = await EquipmentType.find().sort({ name: 1 });

  res.json({
    success: true,
    data: equipmentTypes
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);

  const users = await User.find(baseId ? { assignedBase: baseId } : {})
    .select('name email role assignedBase')
    .populate('assignedBase', 'name code')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: users
  });
});
