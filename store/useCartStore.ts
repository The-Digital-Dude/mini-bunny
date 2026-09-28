import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { trackAddToCart } from '@/lib/analytics'

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
  setGroupId?: string;  // shared UUID for items added together as a set
}

interface CartState {
  items: CartItem[];
  isGiftWrapped: boolean;
  giftMessage: string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setGiftWrap: (wrapped: boolean) => void;
  setGiftMessage: (message: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isGiftWrapped: false,
      giftMessage: "",
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => {
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "add_to_cart", productId: item.productId }),
        }).catch(() => {})
        trackAddToCart({ id: item.productId, name: item.name, price: item.price, quantity: item.quantity })
        return set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        })),
      setGiftWrap: (isGiftWrapped) => set({ isGiftWrapped }),
      setGiftMessage: (giftMessage) => set({ giftMessage }),
      clearCart: () => set({ items: [], isGiftWrapped: false, giftMessage: "" }),
    }),
    {
      name: 'clothing-cart-storage',
      partialize: (state) => ({
        items: state.items,
        isGiftWrapped: state.isGiftWrapped,
        giftMessage: state.giftMessage,
      }),
    }
  )
)
