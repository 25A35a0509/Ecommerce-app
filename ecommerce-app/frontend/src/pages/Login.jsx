import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { loginUser, clearError } from '../context/authSlice';
import { fetchCart } from '../context/cartSlice';
import { fetchWishlist } from '../context/wishlistSlice';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!');
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    }
  };

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Sign in to continue shopping
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              className="input-field pl-10"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
              })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label-text">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-field pl-10 pr-10"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <LogIn size={16} />
              Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
};

export default Login;
