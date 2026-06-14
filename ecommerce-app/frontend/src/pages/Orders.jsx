import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatDate, formatPrice, orderStatusColors, paymentStatusColors } from '../utils/helpers';
import { getImageUrl } from '../services/api';
import Pagination from '../components/Pagination';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderService
      .getMyOrders({ page, limit: 10 })
      .then((data) => {
        setOrders(data.orders);
        setPagination({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">My Orders</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-4 text-slate-300 dark:text-slate-600" size={48} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders yet</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            When you place an order, it will show up here.
          </p>
          <Link to="/products" className="btn-primary mt-4">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => {
              const statusConfig = orderStatusColors[order.orderStatus] || orderStatusColors.processing;
              const paymentConfig = paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending;

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="card flex flex-col gap-4 p-4 transition-shadow hover:shadow-glow sm:flex-row sm:items-center"
                >
                  <div className="flex -space-x-3">
                    {order.orderItems.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={getImageUrl(item.image)}
                        alt=""
                        className="h-14 w-14 rounded-xl border-2 border-white object-cover dark:border-dark-card"
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-slate-100 text-xs font-bold text-slate-600 dark:border-dark-card dark:bg-slate-700 dark:text-slate-300">
                        +{order.orderItems.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400">
                      Placed on {formatDate(order.createdAt)} · {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                    <span className={`badge ${paymentConfig.bg} ${paymentConfig.text}`}>{paymentConfig.label}</span>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>

                  <ChevronRight className="hidden text-slate-400 sm:block" size={20} />
                </Link>
              );
            })}
          </div>

          <div className="mt-6">
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
