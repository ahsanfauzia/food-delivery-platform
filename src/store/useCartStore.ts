import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  isVeg: boolean;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, "quantity">, restaurantId: string, restaurantName: string) => { success: boolean; error?: string };
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (item, rId, rName) => {
        const state = get();

        // Business Rule: Can only add items from the same restaurant
        if (state.restaurantId && state.restaurantId !== rId) {
          return {
            success: false,
            error: `Your cart contains items from "${state.restaurantName}". Clear your cart to add items from "${rName}".`,
          };
        }

        const existingItemIndex = state.items.findIndex((i) => i.id === item.id);
        let newItems = [...state.items];

        if (existingItemIndex > -1) {
          newItems[existingItemIndex].quantity += 1;
        } else {
          newItems.push({ ...item, quantity: 1 });
        }

        set({
          items: newItems,
          restaurantId: rId,
          restaurantName: rName,
        });

        return { success: true };
      },

      removeItem: (itemId) => {
        const state = get();
        const newItems = state.items.filter((item) => item.id !== itemId);
        
        if (newItems.length === 0) {
          set({ items: [], restaurantId: null, restaurantName: null });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (itemId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          state.removeItem(itemId);
          return;
        }

        const newItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, restaurantName: null });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "foodie-cart-storage",
    }
  )
);
