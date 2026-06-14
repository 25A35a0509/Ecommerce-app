import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAppSelector } from '../../hooks/useRedux';
import { useDebounce } from '../../hooks/useDebounce';
import { getInitials, formatDate } from '../../utils/helpers';
import { TableRowSkeleton } from '../../components/Skeletons';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminUsers = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers({
        search: debouncedSearch || undefined,
        page,
        limit: 10,
      });
      setUsers(data.users);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await authService.updateUserRole(userId, newRole);
      toast.success('User role updated');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await authService.deleteUser(deleteTarget._id);
      toast.success('User deleted');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-left text-xs font-semibold uppercase text-slate-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-xs font-bold text-white">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={updatingId === u._id || u._id === currentUser?._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`rounded-lg border-0 px-2 py-1.5 text-xs font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u._id !== currentUser?._id && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminUsers;
