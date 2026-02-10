import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import Link from "next/link";

// Revalidate every minute
export const revalidate = 60;

export default async function AdminOrdersPage() {
    const orders = await db.order.findMany({
        include: {
            user: true,
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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">주문 관리</h2>
            </div>

            <div className="rounded-md border">
                {/* TODO: Create proper Table component or use HTML */}
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-slate-100/50">
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">주문번호</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">주문자</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">상태</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">금액</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">날짜</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">주소</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b transition-colors hover:bg-slate-100/50">
                                    <td className="p-4 align-middle">
                                        <Link href={`/admin/orders/${order.id}`} className="hover:underline text-blue-600 font-medium">
                                            {order.id.slice(0, 8)}...
                                        </Link>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {order.user.name}<br />
                                        <span className="text-xs text-gray-400">{order.user.email}</span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {order.status === 'PAID' ? '결제완료' :
                                                order.status === 'PENDING' ? '입금대기' :
                                                    order.status === 'PREPARING' ? '배송준비' :
                                                        order.status === 'SHIPPED' ? '배송중' :
                                                            order.status === 'DELIVERED' ? '배송완료' :
                                                                order.status === 'CANCELLED' ? '취소됨' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{order.total.toLocaleString()} 원</td>
                                    <td className="p-4 align-middle">{format(order.createdAt, "yyyy-MM-dd")}</td>
                                    <td className="p-4 align-middle truncate max-w-[200px]" title={order.shippingAddress || ""}>
                                        {order.shippingAddress}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
