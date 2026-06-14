import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';

/**
 * Protects routes by verifying the JWT sent in the Authorization header
 * (Bearer token) or in an httpOnly cookie. Attaches the authenticated
 * user document (minus password) to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    res.status(401);
    throw new Error('User not found, authorization denied');
  }

  next();
});

/**
 * Restricts access to users whose role is included in the allowed list.
 * Must be used after `protect` so req.user is populated.
 *
 * Usage: router.delete('/:id', protect, authorize('admin'), deleteProduct)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
};
