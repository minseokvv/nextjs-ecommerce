"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, ShoppingBag, MapPin, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
    id: string;
    product: { name: string; imageUrl: string | null };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: string | null;
    trackingNumber: string | null;
}

interface UserDetail {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    phone: string | null;
    address: string | null;
    zipcode: string | null;
    detailAddress: string | null;
    role: string;
    grade: string;
    createdAt: string;
    orders: Order[];
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${params.id}`);
            if (!res.ok) throw new Error("Load failed");
            const data = await res.json();
            setUser(data.data);
        } catch (error) {
            console.error(error);
            alert("회원 정보를 불러오는데 실패했습니다.");
            router.push("/admin/users");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">로딩 중...</div>;
    if (!user) return <div className="p-8">회원이 없습니다.</div>;

    const getStatusText = (status: string) => {
        const map: { [key: string]: string } = {
            PENDING: "입금대기",
            PAID: "결제완료",
            PREPARING: "배송준비",
            SHIPPED: "배송중",
            DELIVERED: "배송완료",
            CANCELLED: "취소됨"
        };
        return map[status] || status;
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">회원 상세 정보</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* User Profile Card */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            기본 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="font-semibold text-gray-500">이름</span>
                            <span className="col-span-2">{user.name || "-"}</span>

                            <span className="font-semibold text-gray-500">아이디</span>
                            <span className="col-span-2">{user.username || "-"}</span>

                            <span className="font-semibold text-gray-500">이메일</span>
                            <span className="col-span-2 break-all">{user.email || "-"}</span>

                            <span className="font-semibold text-gray-500">전화번호</span>
                            <span className="col-span-2">{user.phone || "-"}</span>

                            <span className="font-semibold text-gray-500">등급</span>
                            <span className="col-span-2">{user.grade}</span>

                            <span className="font-semibold text-gray-500">가입일</span>
                            <span className="col-span-2">{format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Card */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            배송지 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm">
                            <p className="font-semibold mb-1">기본 주소</p>
                            <p>{user.address ? `(${user.zipcode}) ${user.address} ${user.detailAddress || ""}` : "등록된 주소가 없습니다."}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            활동 요약
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg text-center">
                                <p className="text-xs text-slate-500 mb-1">총 주문</p>
                                <p className="text-xl font-bold">{user.orders.length}회</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg text-center">
                                <p className="text-xs text-slate-500 mb-1">총 구매액</p>
                                <p className="text-xl font-bold">
                                    {user.orders
                                        .filter(o => o.status !== 'CANCELLED' && o.status !== 'PENDING')
                                        .reduce((acc, curr) => acc + curr.total, 0)
                                        .toLocaleString()}원
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order History */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            주문 기록
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">주문번호</th>
                                        <th className="px-4 py-3">날짜</th>
                                        <th className="px-4 py-3">상품</th>
                                        <th className="px-4 py-3">금액</th>
                                        <th className="px-4 py-3">상태</th>
                                        <th className="px-4 py-3">운송장</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">주문 내역이 없습니다.</td>
                                        </tr>
                                    ) : (
                                        user.orders.map((order) => (
                                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                                                <td className="px-4 py-3 text-gray-500">{format(new Date(order.createdAt), "yyyy-MM-dd")}</td>
                                                <td className="px-4 py-3">
                                                    {order.items.length > 0 ? (
                                                        <span>
                                                            {order.items[0].product.name}
                                                            {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                                                        </span>
                                                    ) : "-"}
                                                </td>
                                                <td className="px-4 py-3 font-semibold">{order.total.toLocaleString()}원</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                                                    `}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{order.trackingNumber || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
