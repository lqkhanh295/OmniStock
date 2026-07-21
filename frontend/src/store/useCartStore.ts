import { create } from 'zustand'

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
    totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
            return {
                items: state.items.map(i => i.productId === item.productId 
                    ? { ...i, quantity: i.quantity + item.quantity } : i)
            };
        }
        return { items: [...state.items, item] };
    }),
    removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
    })),
    clearCart: () => set({ items: [] }),
    totalAmount: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}));
