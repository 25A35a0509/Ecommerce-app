import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation, validate } from '../validations/validators.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);

// Authenticated user routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// Admin-only user management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
