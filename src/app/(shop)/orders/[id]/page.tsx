import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import Link from "next/link";

interface Props {
    params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
        redirect("/login");
    }

    const order = await db.order.findUnique({
        where: { id: params.id },
        include: {
            items: {
                include: { product: true }
            }
        }
    });

    if (!order) {
        notFound();
    }

    if (order.userId !== sessionId) {
        // Not authorized to view this order
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in-up space-y-8">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/orders" className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">주문 상세</h1>
            </div>

            {/* Status & ID */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold mb-2 ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                            order.status === 'PAID' ? 'bg-blue-50 text-blue-700' :
                                order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700' :
                                    order.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                        'bg-gray-100 text-gray-600'
                        }`}>
                        {order.status === 'PENDING' ? '결제대기' :
                            order.status === 'PAID' ? '결제완료' :
                                order.status === 'PREPARING' ? '배송준비' :
                                    order.status === 'SHIPPED' ? '배송중' :
                                        order.status === 'COMPLETED' ? '배송완료' :
                                            order.status === 'CANCELLED' ? '취소됨' : order.status}
                    </span>
                    <p className="text-sm text-gray-500">주문일자 <span className="text-gray-900 font-medium ml-1">{new Date(order.createdAt).toLocaleString()}</span></p>
                    <p className="text-sm text-gray-500">주문번호 <span className="text-gray-900 font-medium ml-1">{order.id}</span></p>
                </div>
                {/* Actions (Future: Cancel button, Tracker button) */}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Package size={18} className="text-gray-400" />
                    <h3 className="font-bold text-gray-900">주문 상품</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {order.items.map(item => (
                        <div key={item.id} className="p-6 flex gap-4 md:gap-6">
                            <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                {item.product.imageUrl ? (
                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 py-1">
                                <Link href={`/products/${item.product.id}`} className="font-bold text-gray-900 text-lg hover:underline decoration-gray-300 underline-offset-4">
                                    {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">
                                    {item.quantity}개 / {item.price.toLocaleString()}원
                                </p>
                            </div>
                            <div className="text-right font-bold text-gray-900 self-center">
                                {(item.price * item.quantity).toLocaleString()}원
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                        <MapPin size={18} className="text-gray-400" />
                        <h3 className="font-bold text-gray-900">배송지 정보</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">받는 분</span>
                            <span className="text-gray-900 font-medium">{order.recipientName || order.user?.name || "정보 없음"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">연락처</span>
                            <span className="text-gray-900 font-medium">{order.recipientPhone || "정보 없음"}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-50">
                            <span className="block text-gray-500 mb-1">주소</span>
                            <p className="text-gray-900 leading-relaxed">
                                {order.shippingAddress ? (
                                    <>
                                        {order.shippingZipcode && <span className="text-gray-500 mr-2">[{order.shippingZipcode}]</span>}
                                        {order.shippingAddress}
                                    </>
                                ) : "주소 정보 없음"}
                            </p>
                        </div>
                        {order.memo && (
                            <div className="mt-2 pt-2 border-t border-gray-50">
                                <span className="block text-gray-500 mb-1">배송 메모</span>
                                <p className="text-gray-900">{order.memo}</p>
                            </div>
                        )}
                        {/* Tracking Info if available */}
                        {order.trackingNumber && (
                            <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                                <Truck size={18} className="text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm text-gray-900">운송장 정보</p>
                                    <p className="text-sm text-gray-600">{order.carrier || "택배사"} {order.trackingNumber}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                        <CreditCard size={18} className="text-gray-400" />
                        <h3 className="font-bold text-gray-900">결제 정보</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">총 상품금액</span>
                            <span className="text-gray-900 font-medium">{order.total.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">배송비</span>
                            <span className="text-gray-900 font-medium md:text-blue-600 md:font-semibold">무료</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-2 pt-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-bold text-lg">최종 결제금액</span>
                            <span className="text-blue-600 font-bold text-xl">{order.total.toLocaleString()}원</span>
                        </div>
                        {order.depositorName && (
                            <p className="text-xs text-gray-400 text-right mt-1">입금자명: {order.depositorName}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
