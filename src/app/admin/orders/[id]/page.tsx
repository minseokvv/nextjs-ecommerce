"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ArrowLeft, Package, Truck, User } from "lucide-react";
import { format } from "date-fns";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [status, setStatus] = useState("");
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${params.id}`);
            if (!res.ok) throw new Error("Failed");
            const json = await res.json();
            const orderData = json.data;
            setOrder(orderData);
            setStatus(orderData.status);
            setCarrier(orderData.carrier || "");
            setTrackingNumber(orderData.trackingNumber || "");
        } catch (error) {
            alert("주문 정보를 불러오는데 실패했습니다.");
            router.push("/admin/orders");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/orders/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    carrier,
                    trackingNumber
                })
            });

            if (!res.ok) throw new Error("Update failed");
            alert("저장되었습니다.");
            fetchOrder();
        } catch (error) {
            alert("업데이트 실패");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">로딩 중...</div>;
    if (!order) return <div className="p-8">주문이 없습니다.</div>;

    const STATUS_OPTIONS = [
        { value: "PENDING", label: "입금대기" },
        { value: "PAID", label: "결제완료" },
        { value: "PREPARING", label: "배송준비" },
        { value: "SHIPPED", label: "배송중" },
        { value: "DELIVERED", label: "배송완료" },
        { value: "CANCELLED", label: "주문취소" },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">주문 상세 관리</h2>
                    <p className="text-sm text-gray-500">주문번호: {order.id}</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "변경사항 저장"}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Order Status & Delivery */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            배송 및 상태 관리
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>주문 상태</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>택배사</Label>
                                <Input
                                    placeholder="예: CJ대한통운, 우체국"
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>운송장 번호</Label>
                                <Input
                                    placeholder="숫자만 입력"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Info */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            주문자 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">이름</span>
                            <span className="font-medium">{order.user.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">아이디</span>
                            <span>{order.user.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">연락처</span>
                            <span>{order.user.phone}</span>
                        </div>
                        <div className="pt-2 border-t mt-2">
                            <p className="font-semibold mb-1">배송지</p>
                            <p className="text-gray-600">
                                {order.shippingAddress || order.user.address || "주소 정보 없음"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="col-span-1 md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            주문 상품 목록
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">상품명</th>
                                        <th className="px-4 py-3 text-right">수량</th>
                                        <th className="px-4 py-3 text-right">가격</th>
                                        <th className="px-4 py-3 text-right">합계</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 font-medium">{item.product.name}</td>
                                            <td className="px-4 py-3 text-right">{item.quantity}개</td>
                                            <td className="px-4 py-3 text-right">{item.price.toLocaleString()}원</td>
                                            <td className="px-4 py-3 text-right font-bold">{(item.price * item.quantity).toLocaleString()}원</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold">
                                        <td colSpan={3} className="px-4 py-3 text-right">총 결제 금액</td>
                                        <td className="px-4 py-3 text-right text-lg text-red-600">{order.total.toLocaleString()}원</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
