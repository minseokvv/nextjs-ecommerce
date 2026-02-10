"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        price: number;
        stock: number;
        maxQuantity?: number | null;
        minQuantity: number;
    };
}

export default function ProductActions({ product }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(product.minQuantity || 1);
    const [loading, setLoading] = useState(false);

    const increaseQty = () => {
        if (product.stock <= quantity) return alert("재고가 부족합니다.");
        if (product.maxQuantity && quantity >= product.maxQuantity) return alert(`최대 ${product.maxQuantity}개까지 구매 가능합니다.`);
        setQuantity(q => q + 1);
    };

    const decreaseQty = () => {
        if (quantity <= product.minQuantity) return;
        setQuantity(q => q - 1);
    };

    const handleAddToCart = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, quantity })
            });

            if (res.status === 401) {
                if (confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
                    window.location.href = "/login";
                }
                return;
            }

            if (!res.ok) throw new Error("Failed to add to cart");

            if (confirm("상품이 장바구니에 담겼습니다.\n장바구니로 이동하시겠습니까?")) {
                window.location.href = "/cart";
            }
        } catch (error) {
            alert("장바구니 담기에 실패했습니다.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const items = [{ productId: product.id, quantity, price: product.price }];
            // Basic shipping info from user profile (skipped for 'Buy Now' quick action mock, normally passed from checkout form)
            // For this mock, we send empty or default, assuming backend allows nullable or we fetch user address in backend if needed?
            // Actually, backend expects shippingInfo. Let's provide dummy or prompt.
            // Since we don't have a checkout page yet, we will just pass empty and let backend handle or user update later.
            // But wait, schema says shippingAddress is optional? Yes.

            const resOrder = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    shippingInfo: {
                        recipientName: "구매자", // Placeholder
                        address: "기본 배송지",
                        zipcode: ""
                    }
                })
            });

            if (resOrder.status === 401) {
                if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                    window.location.href = "/login";
                }
                return;
            }

            const dataOrder = await resOrder.json();
            if (!resOrder.ok) throw new Error(dataOrder.error?.message || "주문 실패");

            // 2. Simulate Payment
            const resPay = await fetch(`/api/orders/${dataOrder.data?.orderId}/pay`, { method: "POST" });
            if (!resPay.ok) throw new Error("Payment failed");

            alert("주문이 완료되었습니다!");
            window.location.href = `/orders/${dataOrder.data?.orderId}`;

        } catch (error: any) {
            alert(error.message || "주문에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100">
                <span className="text-gray-600 font-medium">구매 수량</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                            onClick={decreaseQty}
                            disabled={quantity <= product.minQuantity}
                            className="p-2 text-gray-500 hover:text-black disabled:opacity-30"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                        <button
                            onClick={increaseQty}
                            disabled={quantity >= product.stock}
                            className="p-2 text-gray-500 hover:text-black disabled:opacity-30"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-lg">총 상품 금액</span>
                <div className="text-right">
                    <span className="text-sm text-gray-500 mr-2">총 수량 {quantity}개</span>
                    <span className="text-2xl font-bold text-blue-600">{(product.price * quantity).toLocaleString()}원</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleAddToCart}
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <ShoppingCart size={20} />
                    {loading ? "담는 중..." : "장바구니"}
                </button>
                <button
                    onClick={handleBuyNow}
                    className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
                >
                    <CreditCard size={20} />
                    바로 구매
                </button>
            </div>
        </div>
    );
}
