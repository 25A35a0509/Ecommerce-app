import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../services/wishlistService';

const initialState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await wishlistService.getWishlist();
      return data.wishlist.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
    }
  }
);

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { wishlist } = getState();
      const exists = wishlist.products.some((p) => p._id === productId);

      const data = exists
        ? await wishlistService.removeFromWishlist(productId)
        : await wishlistService.addToWishlist(productId);

      return data.wishlist.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.products = action.payload;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
