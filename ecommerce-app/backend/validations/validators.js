import { body, validationResult } from 'express-validator';

/**
 * Generic handler that checks for validation errors collected by
 * express-validator and throws a 400 error with a combined message
 * if any are found.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const messages = errors.array().map((err) => err.msg);
    throw new Error(messages.join(', '));
  }
  next();
};

// ----------------------- Auth -----------------------

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ----------------------- Products -----------------------

export const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 150 })
    .withMessage('Name cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('discountPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
];

// ----------------------- Cart -----------------------

export const cartItemValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

// ----------------------- Orders -----------------------

export const orderValidation = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('paymentMethod')
    .optional()
    .isIn(['COD', 'Card', 'PayPal', 'UPI'])
    .withMessage('Invalid payment method'),
];

export const orderStatusValidation = [
  body('orderStatus')
    .isIn(['processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

// ----------------------- Reviews -----------------------

export const reviewValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];
