"use client";

import { useCart } from "@/components/shop/CartContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";

export default function CartPage() {
    const { items, removeItem, itemCount, subtotal, isLoading } = useCart();

    if (isLoading && itemCount === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <h1 className="text-3xl font-bold text-slate-900 mb-8">장바구니</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        {items.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
                                <p className="text-slate-500 mb-4">장바구니가 비어있습니다.</p>
                                <Link href="/products">
                                    <Button>쇼핑 계속하기</Button>
                                </Link>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="bg-white p-6 rounded-lg border border-slate-200 flex gap-6">
                                    <div className="relative h-24 w-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                        {item.product.images[0] ? (
                                            <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400 text-xs">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                                            <p className="font-bold text-slate-900">{item.product.price.toLocaleString()} 원</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                수량: {item.quantity}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                            >
                                                <Trash2 className="h-4 w-4" /> 삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">주문 요약</h2>
                            <div className="flex justify-between mb-2 text-slate-600">
                                <span>소계</span>
                                <span>{subtotal.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between mb-4 text-slate-600">
                                <span>배송비</span>
                                <span>무료</span>
                            </div>
                            <div className="border-t border-slate-200 pt-4 mb-6 flex justify-between font-bold text-lg text-slate-900">
                                <span>총 결제금액</span>
                                <span>{subtotal.toLocaleString()} 원</span>
                            </div>
                            <Link href="/checkout">
                                <Button className="w-full" size="lg" disabled={itemCount === 0}>
                                    주문하기
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
