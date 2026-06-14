import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getCategories,
} from '../controllers/productController.js';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { productValidation, reviewValidation, validate } from '../validations/validators.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ----------------------- Public product routes -----------------------
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// ----------------------- Admin product management -----------------------
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  productValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id/images/:imageIndex', protect, authorize('admin'), deleteProductImage);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// ----------------------- Reviews (nested under product) -----------------------
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, reviewValidation, validate, createReview);
router.put('/:id/reviews/:reviewId', protect, reviewValidation, validate, updateReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

export default router;
