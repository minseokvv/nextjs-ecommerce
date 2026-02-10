import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { CheckCircle2, Copy } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const revalidate = 0;

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return notFound();

    const order = await db.order.findUnique({
        where: { id: params.id, userId: session.user.id },
        include: {
            items: {
                include: { product: true }
            }
        }
    });

    if (!order) return notFound();

    const bankInfo = {
        bank: "신한은행",
        accountNumber: "110-123-456789",
        accountHolder: "묘오묘(홍길동)"
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Success Message */}
                    <div className="text-center space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-3xl font-bold text-gray-900">주문이 완료되었습니다!</h1>
                        <p className="text-gray-600">
                            주문번호: <span className="font-mono font-bold text-gray-900">{order.id}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            아래 계좌로 입금해 주시면 확인 후 배송이 시작됩니다.
                        </p>
                    </div>

                    {/* Bank Info */}
                    <Card className="border-2 border-blue-100 bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="text-blue-900">입금 계좌 안내</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">은행 / 예금주</p>
                                    <p className="font-medium text-gray-900">{bankInfo.bank} / {bankInfo.accountHolder}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 space-y-1 text-right">
                                    <p className="text-sm text-gray-500">계좌번호</p>
                                    <p className="text-xl font-bold text-blue-600 font-mono tracking-wider">{bankInfo.accountNumber}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-blue-100/50 rounded-lg text-blue-800">
                                <span className="font-semibold">총 결제금액 (입금하실 금액)</span>
                                <span className="text-xl font-bold">{order.total.toLocaleString()}원</span>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                * 주문 후 24시간 이내에 입금되지 않으면 주문이 자동으로 취소될 수 있습니다.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>주문 상품 정보</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                        <div className="relative h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {item.product.imageUrl ? (
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{(item.price * item.quantity).toLocaleString()}원</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">받는사람</p>
                                    <p className="font-medium">{order.recipientName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">연락처</p>
                                    <p className="font-medium">{order.recipientPhone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 mb-1">배송지</p>
                                    <p className="font-medium">{order.shippingAddress}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 mb-1">입금자명</p>
                                    <p className="font-medium">{order.depositorName}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center gap-4 pt-4">
                        <Link
                            href="/"
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            홈으로 가기
                        </Link>
                        <Link
                            href="/orders"
                            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                        >
                            주문 내역 보기
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
