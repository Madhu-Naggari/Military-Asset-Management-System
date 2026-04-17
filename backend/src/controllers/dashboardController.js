import mongoose from 'mongoose';

import asyncHandler from '../utils/asyncHandler.js';
import { getDateRange, toObjectIdOrNull } from '../utils/query.js';
import { resolveScopedBaseId } from '../utils/scope.js';
import { getInventorySummary, getNetMovementDetails } from '../services/inventoryService.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query);
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const equipmentTypeId = toObjectIdOrNull(req.query.equipmentTypeId, mongoose);

  const summary = await getInventorySummary({
    baseId,
    equipmentTypeId,
    start,
    end
  });

  res.json({
    success: true,
    data: {
      filters: {
        startDate: start,
        endDate: end,
        baseId,
        equipmentTypeId
      },
      summary
    }
  });
});

export const getDashboardNetMovementDetails = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query);
  const baseId = resolveScopedBaseId(req.user, req.query.baseId);
  const equipmentTypeId = toObjectIdOrNull(req.query.equipmentTypeId, mongoose);

  const details = await getNetMovementDetails({
    baseId,
    equipmentTypeId,
    start,
    end
  });

  res.json({
    success: true,
    data: details
  });
});
