"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CartItem {
    id: string; // CartItem ID or Product ID for local
    productId: string;
    quantity: number;
    product: {
        name: string;
        price: number;
        imageUrl: string | null;
        images: { url: string }[];
    };
}

interface CartContextType {
    items: CartItem[];
    addItem: (productId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    fetchCart: () => Promise<void>;
    itemCount: number;
    subtotal: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: async () => { },
    removeItem: async () => { },
    updateQuantity: async () => { },
    fetchCart: async () => { },
    itemCount: 0,
    subtotal: 0,
    isLoading: false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCart = async () => {
        try {
            // Don't set loading true on refresh if we want silent update, 
            // but for now simple approach
            // setIsLoading(true); 
            // Only set loading if items empty?

            const res = await fetch("/api/cart");
            const json = await res.json();
            setItems(json.data?.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            // setIsLoading(false);
        }
    };

    // Fetch cart on mount/session change
    useEffect(() => {
        const init = async () => {
            if (session?.user) {
                setIsLoading(true);
                await fetchCart();
                setIsLoading(false);
            } else {
                // Todo: Load from LocalStorage for guest
                setItems([]);
            }
        };
        init();
    }, [session]);

    const addItem = async (productId: string, quantity: number) => {
        if (!session?.user) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            await fetch("/api/cart", {
                method: "POST",
                body: JSON.stringify({ productId, quantity }),
            });
            await fetchCart(); // Refresh
        } catch (e) {
            console.error(e);
            alert("장바구니 담기에 실패했습니다.");
        }
    };

    const removeItem = async (itemId: string) => {
        if (!session?.user) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to remove item");
            }
            await fetchCart(); // Refresh cart after deletion
        } catch (e) {
            console.error(e);
            alert("상품 삭제에 실패했습니다.");
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!session?.user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (quantity < 1) {
            await removeItem(itemId);
            return;
        }

        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });
            if (!res.ok) {
                throw new Error("Failed to update quantity");
            }
            await fetchCart(); // Refresh cart after update
        } catch (e) {
            console.error(e);
            alert("수량 변경에 실패했습니다.");
        }
    };

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, fetchCart, itemCount, subtotal, isLoading }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
