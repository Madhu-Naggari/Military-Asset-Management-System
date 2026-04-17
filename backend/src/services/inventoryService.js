import Assignment from '../models/Assignment.js';
import Expenditure from '../models/Expenditure.js';
import Purchase from '../models/Purchase.js';
import Transfer from '../models/Transfer.js';

const sumFromModel = async (Model, match) => {
  const [result] = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);

  return result?.total || 0;
};

const getTimeBoundMatch = (field, start, end) => ({
  [field]: {
    $gte: start,
    $lte: end
  }
});

const getPrePeriodMatch = (field, start) => ({
  [field]: {
    $lt: start
  }
});

export const getInventorySummary = async ({ baseId, equipmentTypeId, start, end }) => {
  const purchaseFilter = {
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {})
  };
  const transferInFilter = {
    ...(baseId ? { toBase: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {})
  };
  const transferOutFilter = {
    ...(baseId ? { fromBase: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {})
  };
  const assignmentFilter = {
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {})
  };
  const expenditureFilter = {
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {})
  };

  const [
    openingPurchases,
    openingTransferIn,
    openingTransferOut,
    openingAssignments,
    openingExpenditures,
    periodPurchases,
    periodTransferIn,
    periodTransferOut,
    periodAssignments,
    periodExpenditures
  ] = await Promise.all([
    sumFromModel(Purchase, { ...purchaseFilter, ...getPrePeriodMatch('purchasedAt', start) }),
    sumFromModel(Transfer, { ...transferInFilter, ...getPrePeriodMatch('transferredAt', start) }),
    sumFromModel(Transfer, { ...transferOutFilter, ...getPrePeriodMatch('transferredAt', start) }),
    sumFromModel(Assignment, { ...assignmentFilter, ...getPrePeriodMatch('assignedAt', start) }),
    sumFromModel(Expenditure, { ...expenditureFilter, ...getPrePeriodMatch('expendedAt', start) }),
    sumFromModel(Purchase, { ...purchaseFilter, ...getTimeBoundMatch('purchasedAt', start, end) }),
    sumFromModel(Transfer, { ...transferInFilter, ...getTimeBoundMatch('transferredAt', start, end) }),
    sumFromModel(Transfer, { ...transferOutFilter, ...getTimeBoundMatch('transferredAt', start, end) }),
    sumFromModel(Assignment, { ...assignmentFilter, ...getTimeBoundMatch('assignedAt', start, end) }),
    sumFromModel(Expenditure, { ...expenditureFilter, ...getTimeBoundMatch('expendedAt', start, end) })
  ]);

  const openingBalance =
    openingPurchases + openingTransferIn - openingTransferOut - openingAssignments - openingExpenditures;
  const netMovement = periodPurchases + periodTransferIn - periodTransferOut;
  const closingBalance = openingBalance + netMovement - periodAssignments - periodExpenditures;

  return {
    openingBalance,
    closingBalance,
    netMovement,
    purchases: periodPurchases,
    transferIn: periodTransferIn,
    transferOut: periodTransferOut,
    assigned: periodAssignments,
    expended: periodExpenditures
  };
};

export const getNetMovementDetails = async ({ baseId, equipmentTypeId, start, end }) => {
  const purchaseMatch = {
    ...(baseId ? { base: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    ...getTimeBoundMatch('purchasedAt', start, end)
  };
  const transferInMatch = {
    ...(baseId ? { toBase: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    ...getTimeBoundMatch('transferredAt', start, end)
  };
  const transferOutMatch = {
    ...(baseId ? { fromBase: baseId } : {}),
    ...(equipmentTypeId ? { equipmentType: equipmentTypeId } : {}),
    ...getTimeBoundMatch('transferredAt', start, end)
  };

  const [purchases, transferIn, transferOut] = await Promise.all([
    Purchase.find(purchaseMatch)
      .populate('base equipmentType', 'name code category')
      .sort({ purchasedAt: -1 })
      .limit(10),
    Transfer.find(transferInMatch)
      .populate('fromBase toBase equipmentType', 'name code category')
      .sort({ transferredAt: -1 })
      .limit(10),
    Transfer.find(transferOutMatch)
      .populate('fromBase toBase equipmentType', 'name code category')
      .sort({ transferredAt: -1 })
      .limit(10)
  ]);

  return { purchases, transferIn, transferOut };
};
