"use client";

import { useCart } from "@/components/shop/CartContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { AddressListModal } from "@/components/shop/AddressListModal";
import { formatPhoneNumber } from "@/lib/utils";

export default function CheckoutPage() {
    const { items, subtotal, isLoading, fetchCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        address: "",
        phone: "",
        depositorName: session?.user?.name || "",
    });

    if (isLoading) return <div className="py-20 text-center">Loading...</div>;
    if (items.length === 0) {
        return (
            <div className="py-20 text-center">
                <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
                <Button onClick={() => router.push("/")}>쇼핑 계속하기</Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "주문 처리에 실패했습니다.");
            }

            // 카트 상태 갱신 (비우기)
            await fetchCart();

            // 주문 완료 페이지로 이동
            router.push(`/orders/success/${data.data.orderId}`);

        } catch (e: any) {
            console.error(e);
            alert(e.message || "주문 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <h1 className="text-3xl font-bold text-slate-900 mb-8">주문 결제</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-row items-center justify-between">
                                    <CardTitle>배송 정보</CardTitle>
                                    <AddressListModal onSelect={(addr) => {
                                        setFormData({
                                            ...formData,
                                            name: addr.recipient,
                                            phone: addr.phone,
                                            address: `${addr.address} ${addr.detailAddress || ""}`.trim()
                                        });
                                    }} />
                                </div>
                                <CardDescription>상품을 받으실 분의 정보를 입력해주세요.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">받는 분 성함</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="홍길동"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">전화번호</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            required
                                            placeholder="010-1234-5678"
                                            maxLength={13}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">주소</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                            placeholder="상세 주소를 입력해주세요 (동, 호수 등)"
                                        />
                                    </div>

                                    <div className="pt-4 border-t mt-4">
                                        <h3 className="font-semibold mb-4">결제 정보 (무통장 입금)</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="depositor">입금자명</Label>
                                            <Input
                                                id="depositor"
                                                value={formData.depositorName}
                                                onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
                                                required
                                                placeholder="입금하시는 분 성함"
                                            />
                                            <p className="text-xs text-gray-500">
                                                * 주문 완료 후 안내되는 계좌로 입금해주시면 확인 후 배송이 시작됩니다.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>주문 상품 ({items.length}개)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                            <div className="relative h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {item.product.imageUrl ? (
                                                    <Image
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-gray-500">No Image</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{item.product.name}</p>
                                                <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                                            </div>
                                            <div className="font-semibold whitespace-nowrap">
                                                {(item.product.price * item.quantity).toLocaleString()} 원
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 mt-4 space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>상품 금액</span>
                                        <span>{subtotal.toLocaleString()} 원</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>배송비</span>
                                        <span>0 원</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl text-slate-900 pt-2 border-t">
                                        <span>총 결제금액</span>
                                        <span>{subtotal.toLocaleString()} 원</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    form="checkout-form"
                                    className="w-full mt-6 py-6 text-lg"
                                    disabled={loading}
                                >
                                    {loading ? "주문 처리 중..." : `${subtotal.toLocaleString()}원 결제하기`}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
}
