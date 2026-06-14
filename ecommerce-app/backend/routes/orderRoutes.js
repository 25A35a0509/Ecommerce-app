import express from 'express';
import {
  placeOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { orderValidation, orderStatusValidation, validate } from '../validations/validators.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// User routes
router.post('/', orderValidation, validate, placeOrder);
router.get('/my-orders', getMyOrders);

// Admin routes
router.get('/stats/dashboard', authorize('admin'), getOrderStats);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), orderStatusValidation, validate, updateOrderStatus);

// Single order (owner or admin) - placed after specific routes to avoid
// ':id' from accidentally matching 'my-orders' or 'stats'
router.get('/:id', getOrderById);

export default router;
