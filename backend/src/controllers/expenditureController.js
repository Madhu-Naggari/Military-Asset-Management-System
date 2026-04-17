import mongoose from 'mongoose';

import Base from '../models/Base.js';
import EquipmentType from '../models/EquipmentType.js';
import Expenditure from '../models/Expenditure.js';
import { createAuditLog } from '../services/auditService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getDateRange, toObjectIdOrNull } from '../utils/query.js';
import { ensureBaseAccess, resolveScopedBaseId } from '../utils/scope.js';

export const createExpenditure = asyncHandler(async (req, res) => {
  const { base, equipmentType, quantity, expendedAt, reason, operationReference, remarks } = req.body;

  ensureBaseAccess(req.user, base);
  await Promise.all([Base.findById(base), EquipmentType.findById(equipmentType)]);

  const expenditure = await Expenditure.create({
    base,
    equipmentType,
    quantity,
    expendedAt,
    reason,
    operationReference,
    remarks,
    createdBy: req.user._id
  });

  await createAuditLog({
    req,
    actorId: req.user._id,
    action: 'CREATE_EXPENDITURE',
    module: 'expenditure',
    resourceId: expenditure._id,
    metadata: { base, equipmentType, quantity, reason }
  });

  const populatedExpenditure = await Expenditure.findById(expenditure._id).populate(
    'base equipmentType createdBy',
    'name code email'
  );

  res.status(201).json({
    success: true,
    data: populatedExpenditure
  });
});

export const getExpenditures = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query);
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const equipmentTypeId = toObjectIdOrNull(req.query.equipmentTypeId, mongoose);

  const expenditures = await Expenditure.find({
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    expendedAt: {
      $gte: start,
      $lte: end
    }
  })
    .populate('base equipmentType createdBy', 'name code email')
    .sort({ expendedAt: -1 });

  res.json({
    success: true,
    data: expenditures
  });
});
