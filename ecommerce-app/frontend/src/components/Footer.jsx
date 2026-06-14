import { Link } from 'react-router-dom';
import { ShoppingCart, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-700 text-white">
                <ShoppingCart size={18} />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Shop<span className="text-primary">Sphere</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Quality products, fast shipping, and a shopping experience you'll love.
            </p>
            <div className="mt-4 flex gap-3">
              {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/products" className="hover:text-primary">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-primary">Featured</Link></li>
              <li><Link to="/products?sortBy=createdAt&order=desc" className="hover:text-primary">New Arrivals</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Account</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/profile" className="hover:text-primary">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-primary">Order History</Link></li>
              <li><Link to="/cart" className="hover:text-primary">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>Shipping & Returns</li>
              <li>FAQ</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 dark:border-dark-border pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
