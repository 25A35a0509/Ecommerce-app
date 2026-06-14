import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Minus, Plus, Check, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { productService } from '../services/productService';
import { getImageUrl } from '../services/api';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToCart } from '../context/cartSlice';
import { toggleWishlistItem } from '../context/wishlistSlice';
import StarRating from '../components/StarRating';
import { ReviewItem, ReviewForm } from '../components/Review';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '../utils/helpers';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { products: wishlistProducts } = useAppSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isWishlisted = wishlistProducts.some((p) => p._id === id);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductById(id);
      setProduct(data.product);
      setReviews(data.reviews);
      setActiveImage(0);
      setQuantity(1);

      // Fetch related products from same category
      const relatedData = await productService.getProducts({
        category: data.product.category,
        limit: 4,
      });
      setRelated(relatedData.products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
    toast.success('Added to cart');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to use your wishlist');
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  const handleReviewSubmit = async (data) => {
    try {
      if (editingReview) {
        await productService.updateReview(id, editingReview._id, data);
        toast.success('Review updated');
        setEditingReview(null);
      } else {
        await productService.createReview(id, data);
        toast.success('Review submitted');
      }
      await fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async () => {
    try {
      await productService.deleteReview(id, deleteTarget._id);
      toast.success('Review deleted');
      await fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square w-full" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product not found</h2>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          Back to Products
        </Link>
      </div>
    );
  }

  const discountPercent = getDiscountPercent(product);
  const price = getEffectivePrice(product);
  const userHasReviewed = reviews.some((r) => r.user?._id === user?._id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/products" className="hover:text-primary">Products</Link>
        {' / '}
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
          {product.category}
        </Link>
        {' / '}
        <span className="text-slate-700 dark:text-slate-200">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="card relative aspect-square overflow-hidden">
            <img
              src={getImageUrl(product.images?.[activeImage]?.url)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {discountPercent && (
              <span className="badge absolute left-4 top-4 bg-red-500 text-white">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-semibold uppercase text-primary">{product.category}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.ratings?.average || 0} />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({product.ratings?.count || 0} review{product.ratings?.count !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatPrice(price)}
            </span>
            {discountPercent && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <Check size={16} /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="font-semibold text-red-500">Out of Stock</span>
            )}
          </div>

          {product.brand && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Brand: <span className="font-semibold text-slate-700 dark:text-slate-200">{product.brand}</span>
            </p>
          )}

          {/* Quantity selector & actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-dark-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-primary"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-semibold text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-primary"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 py-3"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>

            <button
              onClick={handleToggleWishlist}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 dark:border-dark-border text-slate-500 transition-colors hover:text-red-500"
            >
              <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-dark-border pt-6">
            {[
              { icon: Truck, text: 'Fast Delivery' },
              { icon: ShieldCheck, text: 'Secure Payment' },
              { icon: RotateCcw, text: '30-Day Returns' },
            ].map((b) => (
              <div key={b.text} className="flex flex-col items-center text-center">
                <b.icon size={20} className="mb-1 text-primary" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 card p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Customer Reviews ({reviews.length})
        </h2>

        {isAuthenticated && !userHasReviewed && !editingReview && (
          <div className="mb-6">
            <ReviewForm onSubmit={handleReviewSubmit} />
          </div>
        )}

        {editingReview && (
          <div className="mb-6">
            <ReviewForm
              initialData={editingReview}
              onSubmit={handleReviewSubmit}
              onCancel={() => setEditingReview(null)}
            />
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                onEdit={setEditingReview}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />
    </div>
  );
};

export default ProductDetail;
