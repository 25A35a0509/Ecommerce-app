import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleDarkMode } from '../context/themeSlice';
import { getInitials } from '../utils/helpers';

const titleMap = {
  '/admin': 'Dashboard Overview',
  '/admin/products': 'Product Management',
  '/admin/orders': 'Order Management',
  '/admin/users': 'User Management',
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode } = useAppSelector((state) => state.theme);

  const path = window.location.pathname;
  const title = titleMap[path] || 'Admin';

  return (
    <div className="flex min-h-screen bg-surface dark:bg-dark">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white lg:text-xl">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-xs font-bold text-white">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
