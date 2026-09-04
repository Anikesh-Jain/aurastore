import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItemType {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  categoryName?: string;
  inStock: boolean;
}

interface WishlistState {
  items: WishlistItemType[];
  toggleWishlist: (product: WishlistItemType) => boolean;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);

        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
          return false;
        } else {
          set({ items: [...items, product] });
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "aurastore-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

