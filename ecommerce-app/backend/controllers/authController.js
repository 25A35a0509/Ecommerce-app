import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * Builds a safe user object for API responses (excludes password).
 */
const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  phone: user.phone,
  addresses: user.addresses,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Role is intentionally NOT taken from req.body to prevent
  // privilege escalation - all new signups are 'user' by default.
  const user = await User.create({ name, email, password, role: 'user' });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: formatUser(user),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password since the schema excludes it by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: formatUser(user),
  });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, user: formatUser(user) });
});

// @desc    Update current user's profile (name, phone, password, addresses)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;

  if (req.body.addresses) {
    user.addresses = req.body.addresses;
  }

  // If a new image was uploaded via multer, req.file will be populated
  if (req.file) {
    user.profileImage = `/uploads/${req.file.filename}`;
  }

  if (req.body.password) {
    user.password = req.body.password; // re-hashed by pre('save') hook
  }

  const updatedUser = await user.save();

  res.status(200).json({ success: true, user: formatUser(updatedUser) });
});

// @desc    Get all users (admin user management)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    users: users.map(formatUser),
  });
});

// @desc    Update a user's role (admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "admin" or "user"');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.status(200).json({ success: true, user: formatUser(user) });
});

// @desc    Delete a user (admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account from here');
  }

  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
