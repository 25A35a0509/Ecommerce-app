import Product from '../models/Product.js';
import Review from '../models/Review.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all products with search, filter, sort & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const query = {};

  // Full-text-ish search across name/description/brand
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (featured === 'true') query.isFeatured = true;

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortObj = { [sortBy]: sortOrder };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get a single product by ID (with its reviews)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, product, reviews });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, brand, stock, isFeatured } =
    req.body;

  // Uploaded images come through multer as req.files (array)
  const images = (req.files || []).map((file) => ({
    url: `/uploads/${file.filename}`,
    alt: name,
  }));

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice: discountPrice || null,
    category,
    brand,
    stock,
    images,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, description, price, discountPrice, category, brand, stock, isFeatured } =
    req.body;

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (discountPrice !== undefined) product.discountPrice = discountPrice || null;
  if (category !== undefined) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (stock !== undefined) product.stock = stock;
  if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

  // If new images were uploaded, append them to the existing list
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      alt: product.name,
    }));
    product.images.push(...newImages);
  }

  const updatedProduct = await product.save();

  res.status(200).json({ success: true, product: updatedProduct });
});

// @desc    Remove a single image from a product by index
// @route   DELETE /api/products/:id/images/:imageIndex
// @access  Private/Admin
export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const index = parseInt(req.params.imageIndex);

  if (Number.isNaN(index) || index < 0 || index >= product.images.length) {
    res.status(400);
    throw new Error('Invalid image index');
  }

  product.images.splice(index, 1);
  await product.save();

  res.status(200).json({ success: true, product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  await Review.deleteMany({ product: product._id });

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Get distinct categories (for filter dropdowns)
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.status(200).json({ success: true, categories });
});
