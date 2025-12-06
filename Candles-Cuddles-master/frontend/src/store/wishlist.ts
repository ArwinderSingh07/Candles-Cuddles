import { create } from 'zustand';

const WISHLIST_STORAGE_KEY = 'candles_cuddles_wishlist';

// Load wishlist from localStorage
const loadWishlistFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    }
  } catch (error) {
    console.error('Failed to load wishlist from storage:', error);
  }
  return [];
};

// Save wishlist to localStorage
const saveWishlistToStorage = (productIds: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(productIds));
  } catch (error) {
    console.error('Failed to save wishlist to storage:', error);
  }
};

interface WishlistState {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: loadWishlistFromStorage(),
  addItem: (productId) =>
    set((state) => {
      if (state.items.includes(productId)) return state;
      const newItems = [...state.items, productId];
      saveWishlistToStorage(newItems);
      return { items: newItems };
    }),
  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((id) => id !== productId);
      saveWishlistToStorage(newItems);
      return { items: newItems };
    }),
  toggleItem: (productId) => {
    const isInWishlist = get().items.includes(productId);
    if (isInWishlist) {
      get().removeItem(productId);
    } else {
      get().addItem(productId);
    }
  },
  isInWishlist: (productId) => get().items.includes(productId),
  clear: () => {
    saveWishlistToStorage([]);
    set({ items: [] });
  },
}));

