const getBaseIdentifier = (baseValue) => {
  if (!baseValue) {
    return null;
  }

  if (typeof baseValue === 'string') {
    return baseValue;
  }

  if (baseValue._id) {
    return String(baseValue._id);
  }

  return String(baseValue);
};

export const resolveScopedBaseId = (user, requestedBaseId) => {
  if (user.role === 'admin') {
    return requestedBaseId || null;
  }

  if (!user.assignedBase) {
    return null;
  }

  const assignedBaseId = getBaseIdentifier(user.assignedBase);

  if (requestedBaseId && requestedBaseId !== assignedBaseId) {
    const error = new Error('You do not have access to the requested base.');
    error.statusCode = 403;
    throw error;
  }

  return assignedBaseId;
};

export const ensureBaseAccess = (user, baseId) => {
  if (user.role === 'admin') {
    return;
  }

  if (!user.assignedBase || getBaseIdentifier(user.assignedBase) !== String(baseId)) {
    const error = new Error('Base access denied.');
    error.statusCode = 403;
    throw error;
  }
};

export const ensureTransferAccess = (user, fromBase, toBase) => {
  if (user.role === 'admin') {
    return;
  }

  const assignedBaseId = getBaseIdentifier(user.assignedBase) || '';

  if (![String(fromBase), String(toBase)].includes(assignedBaseId)) {
    const error = new Error('Transfer access denied for this route.');
    error.statusCode = 403;
    throw error;
  }
};
