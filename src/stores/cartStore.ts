import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItemType {
  id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
}

export interface AppliedCoupon {
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscount?: number | null;
  minOrderValue: number;
}

interface CartState {
  items: CartItemType[];
  coupon: AppliedCoupon | null;
  addItem: (product: Omit<CartItemType, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getCartCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getTaxAmount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          const newQty = Math.min(existingItem.quantity + quantity, product.stock);
          set({
            items: items.map((item) =>
              item.id === product.id ? { ...item, quantity: newQty } : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, quantity: Math.min(quantity, product.stock) }],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id === productId) {
              const validQty = Math.min(quantity, item.stock);
              return { ...item, quantity: validQty };
            }
            return item;
          }),
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      getCartCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const itemPrice = item.discountPrice ?? item.price;
          return total + itemPrice * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;

        if (!coupon || subtotal < coupon.minOrderValue) {
          return 0;
        }

        let discount = 0;
        if (coupon.discountPercent) {
          discount = (subtotal * coupon.discountPercent) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.discountAmount) {
          discount = coupon.discountAmount;
        }

        return Math.min(discount, subtotal);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        // Free shipping on orders over ₹1,999
        return subtotal >= 1999 ? 0 : 150;
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        // 18% GST (Standard) included or calculated
        return Math.round(subtotal * 0.18);
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: "aurastore-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

