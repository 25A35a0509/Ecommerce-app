import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchCart, updateCartItem, removeFromCart } from '../context/cartSlice';
import { getImageUrl } from '../services/api';
import { formatPrice } from '../utils/helpers';

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_FEE = 10;
const TAX_RATE = 0.08;

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, subtotal, totalItems, loading } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = async (productId, newQty, stock) => {
    if (newQty < 1 || newQty > stock) return;
    setUpdatingId(productId);
    await dispatch(updateCartItem({ productId, quantity: newQty }));
    setUpdatingId(null);
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Please log in to view your cart
        </h2>
        <Link to="/login" className="btn-primary mt-4 inline-flex">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">
        Shopping Cart {totalItems > 0 && `(${totalItems})`}
      </h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex gap-4 p-4">
              <div className="skeleton h-20 w-20 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="mb-4 text-slate-300 dark:text-slate-600" size={48} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your cart is empty</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Looks like you haven't added anything yet.
          </p>
          <Link to="/products" className="btn-primary mt-4">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart items */}
          <div className="space-y-3 lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const product = item.product;
                const price = product.discountPrice || product.price;
                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card flex gap-4 p-4"
                  >
                    <Link to={`/products/${product._id}`} className="flex-shrink-0">
                      <img
                        src={getImageUrl(product.images?.[0]?.url)}
                        alt={product.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-primary dark:text-white"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {formatPrice(price)}
                      </p>
                      {product.stock < 5 && (
                        <p className="mt-1 text-xs text-amber-500">Only {product.stock} left in stock</p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-dark-border">
                          <button
                            onClick={() => handleQuantityChange(product._id, item.quantity - 1, product.stock)}
                            disabled={updatingId === product._id || item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center text-slate-500 hover:text-primary disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product._id, item.quantity + 1, product.stock)}
                            disabled={updatingId === product._id || item.quantity >= product.stock}
                            className="flex h-8 w-8 items-center justify-center text-slate-500 hover:text-primary disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(product._id)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 p-5">
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
                  <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-100 dark:border-dark-border pt-4 text-base font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary mt-4 w-full py-3">
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
