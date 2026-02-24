import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';
interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string;
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{
      item: CartItem;
      restaurantId: number;
      restaurantName: string;
    }>) {
      const { item, restaurantId, restaurantName } = action.payload;

      // Clear cart if switching restaurants
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }

      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;

      const existing = state.items.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.menuItemId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = '';
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;