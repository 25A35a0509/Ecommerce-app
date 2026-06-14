import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={false}
        className={`fixed left-0 top-0 z-40 h-full w-64 transform border-r border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-700 text-white">
                <Store size={18} />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Shop<span className="text-primary">Sphere</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Admin Panel
          </p>

          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}
                    />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="adminActiveIndicator"
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="m-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
            >
              <Store size={16} />
              Back to Store
            </NavLink>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
