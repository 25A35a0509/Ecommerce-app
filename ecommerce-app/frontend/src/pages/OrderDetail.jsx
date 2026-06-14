import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, CheckCircle2, Truck, Home, XCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatDate, formatDateTime, formatPrice, orderStatusColors, paymentStatusColors } from '../utils/helpers';
import { getImageUrl } from '../services/api';

const trackingSteps = [
  { key: 'processing', label: 'Order Placed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="skeleton h-8 w-1/3 mb-6" />
        <div className="skeleton h-48 w-full mb-4" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error || 'Order not found'}</h2>
        <Link to="/orders" className="btn-primary mt-4 inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusConfig = orderStatusColors[order.orderStatus] || orderStatusColors.processing;
  const paymentConfig = paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending;
  const currentStepIndex = trackingSteps.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
          <span className={`badge ${paymentConfig.bg} ${paymentConfig.text}`}>{paymentConfig.label}</span>
        </div>
      </div>

      {/* Tracking timeline */}
      {!isCancelled ? (
        <div className="card mb-6 p-6">
          <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Order Tracking</h2>
          <div className="flex items-center justify-between">
            {trackingSteps.map((step, i) => {
              const isComplete = i <= currentStepIndex;
              return (
                <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div className={`h-0.5 flex-1 ${i <= currentStepIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        isComplete ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                      }`}
                    >
                      {isComplete ? <CheckCircle2 size={20} /> : <step.icon size={18} />}
                    </div>
                    {i < trackingSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 ${i < currentStepIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                  </div>
                  <p className={`mt-2 text-xs font-semibold ${isComplete ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  {step.key === 'delivered' && order.deliveredAt && (
                    <p className="text-xs text-slate-400">{formatDate(order.deliveredAt)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card mb-6 flex items-center gap-3 p-6 text-red-500">
          <XCircle size={24} />
          <div>
            <p className="font-bold">Order Cancelled</p>
            <p className="text-sm text-red-400">This order has been cancelled and items have been restocked.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Items</h2>
          <div className="space-y-4">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 dark:border-dark-border pb-4 last:border-0 last:pb-0">
                <img src={getImageUrl(item.image)} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <Link to={`/products/${item.product}`} className="text-sm font-semibold text-slate-900 hover:text-primary dark:text-white">
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6 lg:col-span-1">
          <div className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <MapPin size={16} /> Shipping Address
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CreditCard size={16} /> Payment
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Method: {order.paymentMethod}</p>
            <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-dark-border pt-3 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Items</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Tax</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-dark-border pt-2 text-base font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
