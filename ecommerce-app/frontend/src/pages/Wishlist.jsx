import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchWishlist } from '../context/wishlistSlice';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Heart className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Please log in to view your wishlist
        </h2>
        <Link to="/login" className="btn-primary mt-4 inline-flex">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">My Wishlist</h1>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Heart className="mb-4 text-slate-300 dark:text-slate-600" size={48} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Save items you love by clicking the heart icon.
          </p>
          <Link to="/products" className="btn-primary mt-4">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
