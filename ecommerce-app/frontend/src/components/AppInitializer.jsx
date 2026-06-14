import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchProfile } from '../context/authSlice';
import { fetchCart } from '../context/cartSlice';
import { fetchWishlist } from '../context/wishlistSlice';

/**
 * Runs once on app mount:
 * - applies the persisted dark mode class to <html>
 * - if a token exists, re-fetches the user profile, cart, and wishlist
 *   so the session is restored after a page refresh.
 */
const AppInitializer = ({ children }) => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.theme);
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      dispatch(fetchProfile());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return children;
};

export default AppInitializer;
