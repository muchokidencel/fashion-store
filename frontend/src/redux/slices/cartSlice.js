import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  },
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalQuantity += 1;
      state.totalPrice += action.payload.price;
    },
    removeFromCart(state, action) {
      const item = state.items.find(i => i._id === action.payload);
      if (item) {
        state.totalQuantity -= item.quantity;
        state.totalPrice   -= item.price * item.quantity;
        state.items = state.items.filter(i => i._id !== action.payload);
      }
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) {
        state.totalQuantity += quantity - item.quantity;
        state.totalPrice    += (quantity - item.quantity) * item.price;
        item.quantity = quantity;
      }
    },
    clearCart(state) {
      state.items         = [];
      state.totalQuantity = 0;
      state.totalPrice    = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;