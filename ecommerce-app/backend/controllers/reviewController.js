import Review from '../models/Review.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * Recalculates and persists a product's average rating and review count
 * based on all current reviews for that product.
 */
const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  await Product.findByIdAndUpdate(productId, {
    'ratings.average': Math.round(average * 10) / 10,
    'ratings.count': count,
    numReviews: count,
  });
};

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existingReview = await Review.findOne({ product: productId, user: req.user._id });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    comment,
  });

  await recalculateProductRating(productId);

  const populatedReview = await Review.findById(review._id).populate(
    'user',
    'name profileImage'
  );

  res.status(201).json({ success: true, review: populatedReview });
});

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, reviews });
});

// @desc    Update the current user's review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this review');
  }

  review.rating = rating ?? review.rating;
  review.comment = comment ?? review.comment;
  await review.save();

  await recalculateProductRating(review.product);

  res.status(200).json({ success: true, review });
});

// @desc    Delete a review (owner or admin)
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});
