import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).populate('assignedBase', 'name code');

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user._id,
    role: user.role,
    assignedBase: user.assignedBase?._id || null
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBase: user.assignedBase
      }
    }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        assignedBase: req.user.assignedBase
      }
    }
  });
});
