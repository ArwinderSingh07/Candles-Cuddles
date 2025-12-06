import { create } from 'zustand';
import type { Product } from '../types';
import { trackCartAction } from '../api/analytics';
import { getSessionId, getUserId } from '../hooks/useAnalytics';

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

const CART_STORAGE_KEY = 'candles_cuddles_cart';

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and filter out invalid items
      return Array.isArray(parsed) ? parsed.filter((item: any) => item?.product?._id && item?.qty > 0) : [];
    }
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCartFromStorage(),
  isOpen: false,
  toggle: (open) => set({ isOpen: typeof open === 'boolean' ? open : !get().isOpen }),
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.product._id === product._id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((item) =>
          item.product._id === product._id ? { ...item, qty: Math.min(item.qty + 1, product.stock ?? 99) } : item,
        );
      } else {
        newItems = [...state.items, { product, qty: 1 }];
        // Track cart addition
        trackCartAction({
          productId: product._id,
          action: 'add',
          sessionId: getSessionId(),
          userId: getUserId(),
        });
      }
      saveCartToStorage(newItems);
      return { items: newItems };
    }),
  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.product._id !== productId);
      // Track cart removal
      trackCartAction({
        productId,
        action: 'remove',
        sessionId: getSessionId(),
        userId: getUserId(),
      });
      saveCartToStorage(newItems);
      return { items: newItems };
    }),
  updateQty: (productId, qty) =>
    set((state) => {
      const newItems = state.items.map((item) =>
        item.product._id === productId ? { ...item, qty: Math.max(1, Math.min(qty, item.product.stock ?? 99)) } : item,
      );
      saveCartToStorage(newItems);
      return { items: newItems };
    }),
  clear: () => {
    saveCartToStorage([]);
    set({ items: [] });
  },
  total: () => get().items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
}));

