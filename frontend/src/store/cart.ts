import { create } from 'zustand';
import type { Product } from '../types';

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  toggle: (open?: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  toggle: (open) => set({ isOpen: typeof open === 'boolean' ? open : !get().isOpen }),
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.product._id === product._id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product._id === product._id ? { ...item, qty: Math.min(item.qty + 1, product.stock) } : item,
          ),
        };
      }
      return { items: [...state.items, { product, qty: 1 }] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product._id !== productId),
    })),
  updateQty: (productId, qty) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product._id === productId ? { ...item, qty: Math.max(1, Math.min(qty, item.product.stock)) } : item,
      ),
    })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
}));

