import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';

const perks = [
  { icon: Truck, title: 'Free Shipping', desc: 'On all orders over $100' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% protected checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here to help anytime" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredData, latestData, categoriesData] = await Promise.all([
          productService.getProducts({ featured: 'true', limit: 4 }),
          productService.getProducts({ sortBy: 'createdAt', order: 'desc', limit: 8 }),
          productService.getCategories(),
        ]);
        setFeatured(featuredData.products);
        setLatest(latestData.products);
        setCategories(categoriesData.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-700 to-primary-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
              New Season Arrivals
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              Everything you need, <br /> all in one place
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              Discover thousands of quality products at unbeatable prices, with fast shipping and
              hassle-free returns.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-base font-bold text-white backdrop-blur transition-colors hover:bg-white/20">
                View Featured
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card flex flex-col items-center p-4 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <perk.icon size={20} />
              </div>
              <div className="mt-2 sm:mt-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{perk.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{perk.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900 dark:text-white">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="flex-shrink-0 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-primary hover:text-primary"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {(loading || featured.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Featured Products</h2>
            <Link to="/products?featured=true" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Latest products */}
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">New Arrivals</h2>
          <Link to="/products?sortBy=createdAt&order=desc" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : latest.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No products available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-700 to-primary-900 p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to start shopping?</h2>
          <p className="mt-2 text-white/80">Browse our full catalog and find your next favorite thing.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105">
            Explore Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
