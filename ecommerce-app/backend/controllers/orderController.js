import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/emailService.js';

// Flat shipping & tax rules used to compute order totals server-side.
// Keeping this logic on the backend prevents the client from manipulating totals.
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_FEE = 10;
const TAX_RATE = 0.08; // 8%

// @desc    Place a new order (checkout)
// @route   POST /api/orders
// @access  Private
export const placeOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Re-validate each item against the database to prevent price tampering
  // and ensure stock availability at the time of order.
  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
    }

    const price = product.discountPrice || product.price;
    itemsPrice += price * item.quantity;

    validatedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price,
      quantity: item.quantity,
    });
  }

  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalAmount =
    Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice: Math.round(itemsPrice * 100) / 100,
    shippingPrice,
    taxPrice,
    totalAmount,
    // COD orders are marked pending; card/UPI/paypal are treated as
    // paid immediately in this simplified flow (no real gateway integration)
    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
  });

  // Decrement stock for each purchased product
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear the user's cart after a successful order
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Fire-and-forget email confirmation (does not block the response)
  sendOrderConfirmationEmail(req.user, order).catch((err) =>
    console.error('Failed to send order confirmation email:', err.message)
  );

  res.status(201).json({ success: true, order });
});

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only the order owner or an admin can view it
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({ success: true, order });
});

// @desc    Get the current user's order history
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// @desc    Get all orders (admin order dashboard)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.orderStatus = status;

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// @desc    Update order status (admin order tracking)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = orderStatus;

  if (orderStatus === 'delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') {
      order.paymentStatus = 'paid';
    }
  }

  if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
    // Restock items if the order is cancelled before delivery
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  const updatedOrder = await order.save();

  const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');

  // Fire-and-forget status update email
  if (populatedOrder.user?.email) {
    sendOrderStatusEmail(populatedOrder.user, populatedOrder).catch((err) =>
      console.error('Failed to send order status email:', err.message)
    );
  }

  res.status(200).json({ success: true, order: updatedOrder });
});

// @desc    Get sales statistics for the admin dashboard
// @route   GET /api/orders/stats/dashboard
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalRevenueAgg, statusBreakdown, recentOrders, topProductsAgg] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            name: { $first: '$orderItems.name' },
            totalSold: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  // Revenue over the last 7 days for a sales trend chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      statusBreakdown,
      recentOrders,
      topProducts: topProductsAgg,
      dailyRevenue,
    },
  });
});
