import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    const error = new Error('Authorization token is required.');
    error.statusCode = 401;
    throw error;
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).populate('assignedBase', 'name code');

  if (!user || !user.active) {
    const error = new Error('User account is invalid or inactive.');
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});
