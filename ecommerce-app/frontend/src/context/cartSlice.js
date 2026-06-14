import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const data = await cartService.getCart();
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const data = await cartService.addToCart(productId, quantity);
      return data.cart;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await cartService.updateCartItem(productId, quantity);
      return data.cart;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await cartService.removeFromCart(productId);
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const data = await cartService.clearCart();
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.items = action.payload.items || [];
      state.subtotal = action.payload.subtotal || 0;
      state.totalItems = action.payload.totalItems || 0;
      state.loading = false;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, setCart);
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
