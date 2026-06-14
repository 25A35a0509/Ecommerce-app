export const formatPrice = (price) => {
  return `$${Number(price || 0).toFixed(2)}`;
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/**
 * Returns the effective selling price for a product
 * (discount price if present and lower than regular price).
 */
export const getEffectivePrice = (product) => {
  if (!product) return 0;
  return product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
};

/**
 * Returns the discount percentage for display (e.g. "20% OFF"),
 * or null if there is no active discount.
 */
export const getDiscountPercent = (product) => {
  if (!product?.discountPrice || product.discountPrice >= product.price) return null;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
};

export const orderStatusColors = {
  processing: {
    bg: 'bg-blue-100 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Processing',
  },
  shipped: {
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Shipped',
  },
  delivered: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Delivered',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    label: 'Cancelled',
  },
};

export const paymentStatusColors = {
  pending: {
    bg: 'bg-slate-100 dark:bg-slate-700/40',
    text: 'text-slate-600 dark:text-slate-300',
    label: 'Pending',
  },
  paid: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Paid',
  },
  failed: {
    bg: 'bg-red-100 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    label: 'Failed',
  },
  refunded: {
    bg: 'bg-purple-100 dark:bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    label: 'Refunded',
  },
};
