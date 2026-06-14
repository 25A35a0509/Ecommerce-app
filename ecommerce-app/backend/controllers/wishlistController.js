import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * Retrieves the user's wishlist, populating product details,
 * creating an empty wishlist if one doesn't exist.
 */
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate(
    'products',
    'name price discountPrice images ratings stock'
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
    wishlist = await Wishlist.findById(wishlist._id).populate(
      'products',
      'name price discountPrice images ratings stock'
    );
  }

  return wishlist;
};

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  res.status(200).json({ success: true, wishlist });
});

// @desc    Add a product to the wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  const populated = await getOrCreateWishlist(req.user._id);
  res.status(200).json({ success: true, wishlist: populated });
});

// @desc    Remove a product from the wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();

  const populated = await getOrCreateWishlist(req.user._id);
  res.status(200).json({ success: true, wishlist: populated });
});
