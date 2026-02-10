"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProductDetailClientProps {
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        stock: number;
        images: { url: string }[];
        status: string;
        category: { name: string };
    };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedImage, setSelectedImage] = useState(
        product.images[0]?.url || ""
    );
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, Math.min(product.stock, prev + delta)));
    };

    const handleAddToCart = async () => {
        if (!session?.user) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
        }

        setIsAdding(true);
        try {
            await addItem(product.id, quantity);
            alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`);
            // Optionally redirect to cart or stay on page
            // router.push("/cart");
        } catch (error) {
            console.error("Failed to add to cart:", error);
            alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 border border-slate-200">
                    {selectedImage ? (
                        <Image
                            src={selectedImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {product.images.map((image, i) => (
                        <button
                            key={i}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2",
                                selectedImage === image.url
                                    ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-1"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            )}
                            onClick={() => setSelectedImage(image.url)}
                        >
                            <Image
                                src={image.url}
                                alt={`${product.name} thumbnail ${i + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">
                        {product.price.toLocaleString()} 원
                    </span>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        product.status === "SALE" ? "bg-green-100 text-green-700" :
                            product.status === "SOLD_OUT" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                    )}>
                        {product.status.replace("_", " ")}
                    </span>
                </div>

                <div className="my-6 border-t border-gray-200" />

                <div className="prose prose-sm text-gray-500 max-w-none mb-8">
                    <p className="whitespace-pre-line">{product.description}</p>
                </div>

                <div className="mt-auto space-y-6">
                    <div className="flex items-center gap-4">
// Localized
                        <span className="font-medium text-gray-900">수량</span>
                        <div className="flex items-center rounded-md border border-gray-300">
                            <button
                                className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1 || product.status !== "SALE"}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= product.stock || product.status !== "SALE"}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">
                            {product.stock}개 남음
                        </span>
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg h-14"
                        onClick={handleAddToCart}
                        disabled={product.status !== "SALE" || product.stock === 0 || isAdding}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isAdding ? "추가 중..." : product.status === "SALE" ? "장바구니 담기" : "구매 불가"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
