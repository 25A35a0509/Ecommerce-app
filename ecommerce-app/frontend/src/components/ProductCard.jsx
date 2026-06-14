import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import { getImageUrl } from '../services/api';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToCart } from '../context/cartSlice';
import { toggleWishlistItem } from '../context/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { products: wishlistProducts } = useAppSelector((state) => state.wishlist);

  const isWishlisted = wishlistProducts.some((p) => p._id === product._id);
  const discountPercent = getDiscountPercent(product);
  const price = getEffectivePrice(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success('Added to cart');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to use your wishlist');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/products/${product._id}`} className="card group block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
          <img
            src={getImageUrl(product.images?.[0]?.url)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {discountPercent && (
            <span className="badge absolute left-3 top-3 bg-red-500 text-white">
              -{discountPercent}%
            </span>
          )}

          {product.stock === 0 && (
            <span className="badge absolute right-3 top-3 bg-slate-900/80 text-white">
              Out of Stock
            </span>
          )}

          <button
            onClick={handleToggleWishlist}
            className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur transition-colors hover:text-red-500 dark:bg-dark-card/90 dark:text-slate-300"
          >
            <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium uppercase text-slate-400">{product.category}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
            {product.name}
          </h3>

          <div className="mt-2">
            <StarRating
              rating={product.ratings?.average || 0}
              count={product.ratings?.count || 0}
              showValue
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {formatPrice(price)}
              </span>
              {discountPercent && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
