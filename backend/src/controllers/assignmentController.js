import mongoose from 'mongoose';

import Assignment from '../models/Assignment.js';
import Base from '../models/Base.js';
import EquipmentType from '../models/EquipmentType.js';
import { createAuditLog } from '../services/auditService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getDateRange, toObjectIdOrNull } from '../utils/query.js';
import { ensureBaseAccess, resolveScopedBaseId } from '../utils/scope.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const { base, equipmentType, quantity, assigneeName, assigneeIdentifier, assignedAt, purpose, remarks } =
    req.body;

  ensureBaseAccess(req.user, base);
  await Promise.all([Base.findById(base), EquipmentType.findById(equipmentType)]);

  const assignment = await Assignment.create({
    base,
    equipmentType,
    quantity,
    assigneeName,
    assigneeIdentifier,
    assignedAt,
    purpose,
    remarks,
    createdBy: req.user._id
  });

  await createAuditLog({
    req,
    actorId: req.user._id,
    action: 'CREATE_ASSIGNMENT',
    module: 'assignment',
    resourceId: assignment._id,
    metadata: { base, equipmentType, quantity, assigneeName }
  });

  const populatedAssignment = await Assignment.findById(assignment._id).populate(
    'base equipmentType createdBy',
    'name code email'
  );

  res.status(201).json({
    success: true,
    data: populatedAssignment
  });
});

export const getAssignments = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query);
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const equipmentTypeId = toObjectIdOrNull(req.query.equipmentTypeId, mongoose);

  const assignments = await Assignment.find({
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    assignedAt: {
      $gte: start,
      $lte: end
    }
  })
    .populate('base equipmentType createdBy', 'name code email')
    .sort({ assignedAt: -1 });

  res.json({
    success: true,
    data: assignments
  });
});
