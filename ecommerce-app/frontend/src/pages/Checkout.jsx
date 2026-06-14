import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CreditCard, Truck, Wallet, Smartphone, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchCart } from '../context/cartSlice';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/helpers';
import { getImageUrl } from '../services/api';

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_FEE = 10;
const TAX_RATE = 0.08;

const paymentMethods = [
  { value: 'COD', label: 'Cash on Delivery', icon: Truck },
  { value: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'PayPal', label: 'PayPal', icon: Wallet },
];

const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, subtotal, loading } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      street: user?.addresses?.[0]?.street || '',
      city: user?.addresses?.[0]?.city || '',
      state: user?.addresses?.[0]?.state || '',
      postalCode: user?.addresses?.[0]?.postalCode || '',
      country: user?.addresses?.[0]?.country || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const res = await orderService.placeOrder({
        orderItems,
        shippingAddress: data,
        paymentMethod,
      });

      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Please log in to checkout
        </h2>
        <Link to="/login" className="btn-primary mt-4 inline-flex">
          Sign In
        </Link>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add some items before checking out.
        </p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Shipping & payment */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Shipping Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-text">Full Name</label>
                <input className="input-field" {...register('fullName', { required: 'Full name is required' })} />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="label-text">Street Address</label>
                <input className="input-field" {...register('street', { required: 'Street address is required' })} />
                {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
              </div>

              <div>
                <label className="label-text">City</label>
                <input className="input-field" {...register('city', { required: 'City is required' })} />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
              </div>

              <div>
                <label className="label-text">State / Province</label>
                <input className="input-field" {...register('state', { required: 'State is required' })} />
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
              </div>

              <div>
                <label className="label-text">Postal Code</label>
                <input className="input-field" {...register('postalCode', { required: 'Postal code is required' })} />
                {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
              </div>

              <div>
                <label className="label-text">Country</label>
                <input className="input-field" {...register('country', { required: 'Country is required' })} />
                {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="label-text">Phone Number</label>
                <input className="input-field" {...register('phone', { required: 'Phone number is required' })} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Payment Method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                    paymentMethod === method.value
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-dark-border hover:border-slate-300'
                  }`}
                >
                  <method.icon size={20} className={paymentMethod === method.value ? 'text-primary' : 'text-slate-400'} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{method.label}</span>
                </button>
              ))}
            </div>
            {paymentMethod !== 'COD' && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Lock size={12} />
                This is a demo checkout — no real payment will be processed.
              </p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-5">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Order Summary</h3>

            <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3">
                  <img
                    src={getImageUrl(item.product.images?.[0]?.url)}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-dark-border pt-4 text-sm">
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
            </div>

            <div className="mt-4 flex justify-between border-t border-slate-100 dark:border-dark-border pt-4 text-base font-bold text-slate-900 dark:text-white">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button type="submit" disabled={placing} className="btn-primary mt-4 w-full py-3">
              {placing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                `Place Order — ${formatPrice(total)}`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
