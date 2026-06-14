import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatDate, formatPrice, orderStatusColors, paymentStatusColors, getInitials } from '../../utils/helpers';
import { TableRowSkeleton } from '../../components/Skeletons';
import Pagination from '../../components/Pagination';

const statusOptions = ['processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders({
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setOrders(data.orders);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-left text-xs font-semibold uppercase text-slate-400">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const paymentConfig = paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending;
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-[10px] font-bold text-white">
                            {getInitials(order.user?.name)}
                          </div>
                          <span className="text-slate-700 dark:text-slate-200">{order.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${paymentConfig.bg} ${paymentConfig.text}`}>{paymentConfig.label}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`rounded-lg border-0 px-2 py-1.5 text-xs font-semibold capitalize ${orderStatusColors[order.orderStatus]?.bg} ${orderStatusColors[order.orderStatus]?.text}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminOrders;
