export const getDateRange = (query) => {
  const now = new Date();
  const start = query.startDate
    ? new Date(query.startDate)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = query.endDate ? new Date(query.endDate) : now;

  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const toObjectIdOrNull = (value, mongoose) => {
  if (!value) {
    return null;
  }

  return mongoose.Types.ObjectId.isValid(value) ? value : null;
};
