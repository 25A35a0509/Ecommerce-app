import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-extrabold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h2>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
