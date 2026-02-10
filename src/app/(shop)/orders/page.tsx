import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { format } from "date-fns";
import Image from "next/image";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const orders = await db.order.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <h1 className="text-3xl font-bold text-slate-900 mb-8">주문 내역</h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
                        <p>주문 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>주문번호 #{order.id.slice(0, 8)}</CardTitle>
                                            <CardDescription>
                                                주문일자: {format(order.createdAt, "yyyy년 MM월 dd일")}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{order.total.toLocaleString()} 원</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {order.status === "PENDING" ? "주문접수" :
                                                    order.status === "PAID" ? "결제완료" :
                                                        order.status === "PREPARING" ? "상품준비중" :
                                                            order.status === "SHIPPED" ? "배송중" :
                                                                order.status === "DELIVERED" ? "배송완료" :
                                                                    order.status === "CANCELLED" ? "취소됨" : order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        받는분: {order.recipientName} {order.depositorName && ` | 입금자: ${order.depositorName}`}
                                    </div>
                                    {order.status === "PENDING" && (
                                        <div className="mt-4 bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                                            <p className="font-semibold">입금 안내</p>
                                            <p>신한은행 110-123-456789 (예금주: 묘오묘)</p>
                                            <p className="text-xs mt-1">입금자명: <strong>{order.depositorName}</strong> | 입금금액: <strong>{order.total.toLocaleString()}원</strong></p>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-center">
                                                <div className="relative h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                    {item.product.imageUrl && (
                                                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-gray-500">수량: {item.quantity}</p>
                                                </div>
                                                <div>
                                                    {(item.price * item.quantity).toLocaleString()} 원
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
                }
            </Container >
        </div >
    );
}
