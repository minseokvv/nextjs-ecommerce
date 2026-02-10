import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, CreditCard, Package, Users, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Overview } from "@/components/admin/Overview";
import Link from "next/link";

export const revalidate = 0;

export default async function DashboardPage() {
    // ✅ N+1 최적화: 모든 쿼리를 Promise.all로 병렬 실행
    const [
        totalRevenue,
        salesCount,
        stockCount,
        lowStockCount,
        userCount,
        pendingOrderCount,
        recentOrders,
        monthlyGrouped,
    ] = await Promise.all([
        // 1. 총 매출 집계
        db.order.aggregate({
            where: { status: { in: ["PAID", "SHIPPED", "COMPLETED", "PREPARING", "DELIVERED"] } },
            _sum: { total: true },
        }),

        // 2. 총 판매 건수
        db.order.count({
            where: { status: { in: ["PAID", "SHIPPED", "COMPLETED", "PREPARING", "DELIVERED"] } },
        }),

        // 3. 판매 중 상품 수
        db.product.count({
            where: { status: "SALE" },
        }),

        // 4. 재고 부족 상품 수
        db.product.count({
            where: { status: "SALE", stock: { lte: 5 } },
        }),

        // 5. 회원 수
        db.user.count({
            where: { role: "USER" },
        }),

        // 6. 처리 대기 주문 수
        db.order.count({
            where: { status: { in: ["PENDING", "PAID"] } },
        }),

        // 7. 최근 주문 5건 (효율적 단일 쿼리 + include)
        db.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                total: true,
                status: true,
                createdAt: true,
                user: {
                    select: { name: true, username: true },
                },
                items: {
                    take: 1,
                    select: {
                        product: { select: { name: true } },
                    },
                },
            },
        }),

        // 8. ✅ 월별 매출 집계 (최근 12개월, 최소 필드만 조회)
        db.order.findMany({
            where: {
                status: { in: ["PAID", "SHIPPED", "COMPLETED", "PREPARING", "DELIVERED"] },
                createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) },
            },
            select: { createdAt: true, total: true },
        }),
    ]);

    // 월별 그래프 데이터 변환 (JS 집계 - 최소 필드만 로딩했으므로 효율적)
    const monthlySales: Record<string, number> = {};
    for (const order of monthlyGrouped) {
        const monthKey = `${order.createdAt.getMonth() + 1}월`;
        monthlySales[monthKey] = (monthlySales[monthKey] || 0) + order.total;
    }

    const graphData = Object.keys(monthlySales).length > 0
        ? Object.entries(monthlySales)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => parseInt(a.name) - parseInt(b.name))
        : [{ name: "데이터 없음", total: 0 }];

    // 주문 상태 한국어 매핑
    const statusMap: Record<string, { label: string; color: string }> = {
        PENDING: { label: "입금대기", color: "text-yellow-600 bg-yellow-50" },
        PAID: { label: "결제완료", color: "text-blue-600 bg-blue-50" },
        PREPARING: { label: "배송준비", color: "text-indigo-600 bg-indigo-50" },
        SHIPPED: { label: "배송중", color: "text-purple-600 bg-purple-50" },
        DELIVERED: { label: "배송완료", color: "text-green-600 bg-green-50" },
        COMPLETED: { label: "구매확정", color: "text-emerald-600 bg-emerald-50" },
        CANCELLED: { label: "주문취소", color: "text-red-600 bg-red-50" },
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 매출</CardTitle>
                        <span className="h-4 w-4 text-muted-foreground flex items-center justify-center font-bold">₩</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalRevenue._sum.total || 0).toLocaleString()} 원</div>
                        <p className="text-xs text-muted-foreground">누적 결제 완료 금액</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 판매량</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesCount} 건</div>
                        <p className="text-xs text-muted-foreground">누적 결제 완료 주문</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">판매 중 상품</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center justify-between">
                            {stockCount} 개
                        </div>
                        <div className="flex items-center text-xs text-red-500 mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            재고 5개 미만: {lowStockCount}개
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">회원 수</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount} 명</div>
                        <p className="text-xs text-muted-foreground">일반 회원 총계</p>
                    </CardContent>
                </Card>
            </div>

            {/* 처리 대기 알림 */}
            {pendingOrderCount > 0 && (
                <Link href="/admin/orders/list" className="block">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between hover:bg-amber-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-bold text-amber-800">
                                처리 대기 중인 주문이 {pendingOrderCount}건 있습니다.
                            </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-600" />
                    </div>
                </Link>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>월별 매출 현황</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={graphData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>최근 주문</CardTitle>
                        <Link
                            href="/admin/orders/list"
                            className="text-xs text-blue-600 hover:underline font-medium"
                        >
                            전체 보기
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">주문 내역이 없습니다.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => {
                                    const statusInfo = statusMap[order.status] || { label: order.status, color: "text-gray-600 bg-gray-50" };
                                    const productName = order.items[0]?.product?.name || "상품";
                                    const itemSuffix = order.items.length > 1 ? ` 외` : "";

                                    return (
                                        <Link
                                            key={order.id}
                                            href={`/admin/orders/${order.id}`}
                                            className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {order.user.name || order.user.username || "회원"}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {productName}{itemSuffix}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {order.total.toLocaleString()}원
                                                </p>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
