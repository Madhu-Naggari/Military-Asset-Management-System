import mongoose from 'mongoose';

import Base from '../models/Base.js';
import EquipmentType from '../models/EquipmentType.js';
import Purchase from '../models/Purchase.js';
import { createAuditLog } from '../services/auditService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getDateRange, toObjectIdOrNull } from '../utils/query.js';
import { ensureBaseAccess, resolveScopedBaseId } from '../utils/scope.js';

export const createPurchase = asyncHandler(async (req, res) => {
  const { base, equipmentType, quantity, unitCost, vendor, purchasedAt, referenceNo, remarks } = req.body;

  ensureBaseAccess(req.user, base);
  await Promise.all([Base.findById(base), EquipmentType.findById(equipmentType)]);

  const purchase = await Purchase.create({
    base,
    equipmentType,
    quantity,
    unitCost,
    vendor,
    purchasedAt,
    referenceNo,
    remarks,
    createdBy: req.user._id
  });

  await createAuditLog({
    req,
    actorId: req.user._id,
    action: 'CREATE_PURCHASE',
    module: 'purchase',
    resourceId: purchase._id,
    metadata: { base, equipmentType, quantity }
  });

  const populatedPurchase = await Purchase.findById(purchase._id).populate('base equipmentType createdBy', 'name code email');

  res.status(201).json({
    success: true,
    data: populatedPurchase
  });
});

export const getPurchases = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query);
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const equipmentTypeId = toObjectIdOrNull(req.query.equipmentTypeId, mongoose);

  const purchases = await Purchase.find({
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    purchasedAt: {
      $gte: start,
      $lte: end
    }
  })
    .populate('base equipmentType createdBy', 'name code email')
    .sort({ purchasedAt: -1 });

  res.json({
    success: true,
    data: purchases
  });
});
