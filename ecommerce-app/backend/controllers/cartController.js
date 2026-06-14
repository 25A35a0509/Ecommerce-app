import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * Retrieves the current user's cart, populating product details,
 * and creates an empty cart document if one doesn't exist yet.
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name price discountPrice images stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price discountPrice images stock'
    );
  }

  return cart;
};

/**
 * Computes a cart summary (subtotal, item count) from populated cart items.
 * Filters out any items whose referenced product was deleted.
 */
const buildCartSummary = (cart) => {
  const validItems = cart.items.filter((item) => item.product);

  const subtotal = validItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: validItems,
    subtotal: Math.round(subtotal * 100) / 100,
    totalItems,
  };
};

// @desc    Get the current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const summary = buildCartSummary(cart);

  res.status(200).json({ success: true, cart: { _id: cart._id, ...summary } });
});

// @desc    Add a product to the cart (or increase quantity if it exists)
// @route   POST /api/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + Number(quantity);
    if (newQuantity > product.stock) {
      res.status(400);
      throw new Error(`Cannot add more than available stock (${product.stock})`);
    }
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      priceAtAdd: product.discountPrice || product.price,
    });
  }

  await cart.save();

  const populatedCart = await getOrCreateCart(req.user._id);
  const summary = buildCartSummary(populatedCart);

  res.status(200).json({ success: true, cart: { _id: populatedCart._id, ...summary } });
});

// @desc    Update the quantity of an item in the cart
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    res.status(400);
    throw new Error('Product ID and quantity are required');
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1. Use the remove endpoint to delete an item.');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product no longer exists');
  }

  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available in stock`);
  }

  item.quantity = Number(quantity);
  await cart.save();

  const populatedCart = await getOrCreateCart(req.user._id);
  const summary = buildCartSummary(populatedCart);

  res.status(200).json({ success: true, cart: { _id: populatedCart._id, ...summary } });
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  const populatedCart = await getOrCreateCart(req.user._id);
  const summary = buildCartSummary(populatedCart);

  res.status(200).json({ success: true, cart: { _id: populatedCart._id, ...summary } });
});

// @desc    Clear all items from the cart (used after successful checkout)
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({ success: true, cart: { items: [], subtotal: 0, totalItems: 0 } });
});
