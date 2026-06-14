import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../context/authSlice';
import { resetCart } from '../context/cartSlice';
import { resetWishlist } from '../context/wishlistSlice';
import { toggleDarkMode } from '../context/themeSlice';
import { getInitials } from '../utils/helpers';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);
  const { darkMode } = useAppSelector((state) => state.theme);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products');
    setMobileOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    dispatch(resetWishlist());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-700 text-white shadow-glow">
            <ShoppingCart size={18} />
          </div>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            Shop<span className="text-primary">Sphere</span>
          </span>
        </Link>

        {/* Search bar (desktop) */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-xl md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="input-field pl-10"
          />
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link
            to="/wishlist"
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Heart size={20} />
          </Link>

          <Link
            to="/cart"
            className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-xs font-bold text-white">
                  {getInitials(user?.name)}
                </div>
                <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl">
                  <div className="border-b border-slate-100 dark:border-dark-border px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Package size={16} /> My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-b-2xl border-t border-slate-100 dark:border-dark-border px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2">
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {mobileOpen && (
        <div className="border-t border-slate-100 dark:border-dark-border px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </form>
        </div>
      )}

      {/* Category nav (desktop) */}
      <nav className="hidden border-t border-slate-100 dark:border-dark-border md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 lg:px-8">
          <Link to="/products" className="transition-colors hover:text-primary">
            All Products
          </Link>
          <Link to="/products?featured=true" className="transition-colors hover:text-primary">
            Featured
          </Link>
          <Link to="/products?sortBy=createdAt&order=desc" className="transition-colors hover:text-primary">
            New Arrivals
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
