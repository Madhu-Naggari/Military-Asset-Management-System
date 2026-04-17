import mongoose from 'mongoose';

import Base from '../models/Base.js';
import EquipmentType from '../models/EquipmentType.js';
import Transfer from '../models/Transfer.js';
import { createAuditLog } from '../services/auditService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getDateRange, toObjectIdOrNull } from '../utils/query.js';
import { ensureTransferAccess, resolveScopedBaseId } from '../utils/scope.js';

export const createTransfer = asyncHandler(async (req, res) => {
  const { fromBase, toBase, equipmentType, quantity, transferredAt, reason } = req.body;

  if (String(fromBase) === String(toBase)) {
    const error = new Error('Source and destination bases must be different.');
    error.statusCode = 400;
    throw error;
  }

  ensureTransferAccess(req.user, fromBase, toBase);
  await Promise.all([Base.findById(fromBase), Base.findById(toBase), EquipmentType.findById(equipmentType)]);

  const transfer = await Transfer.create({
    fromBase,
    toBase,
    equipmentType,
    quantity,
    transferredAt,
    reason,
    createdBy: req.user._id
  });

  await createAuditLog({
    req,
    actorId: req.user._id,
    action: 'CREATE_TRANSFER',
    module: 'transfer',
    resourceId: transfer._id,
    metadata: { fromBase, toBase, equipmentType, quantity }
  });

  const populatedTransfer = await Transfer.findById(transfer._id).populate(
    'fromBase toBase equipmentType createdBy',
    'name code email'
  );

  res.status(201).json({
    success: true,
    data: populatedTransfer
  });
});

export const getTransfers = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query);
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const equipmentTypeId = toObjectIdOrNull(req.query.equipmentTypeId, mongoose);

  const transfers = await Transfer.find({
    ...(baseId
      ? {
          $or: [{ fromBase: baseId }, { toBase: baseId }]
        }
      : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    transferredAt: {
      $gte: start,
      $lte: end
    }
  })
    .populate('fromBase toBase equipmentType createdBy', 'name code email')
    .sort({ transferredAt: -1 });

  res.json({
    success: true,
    data: transfers
  });
});
