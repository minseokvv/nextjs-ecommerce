import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    const adminSession = cookieStore.get("admin_session");
    return !!adminSession;
}

export async function GET(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // ✅ N+1 최적화: 하나의 쿼리로 이번 달 전체 조회 후 JS에서 오늘/이번달 분리
        // 기존: todayOrders + monthOrders (2개 쿼리, 오늘 데이터 중복 조회)
        // 개선: 이번 달 1개 쿼리 → 오늘 것은 JS 필터
        const monthOrders = await db.order.findMany({
            where: { createdAt: { gte: startOfMonth } },
            select: { total: true, status: true, createdAt: true }
        });

        const todayOrders = monthOrders.filter(o => new Date(o.createdAt) >= startOfDay);

        const calcStats = (orders: { total: number; status: string }[]) => {
            const sales = orders
                .filter(o => ["PAID", "SHIPPED", "COMPLETED", "PREPARING"].includes(o.status))
                .reduce((acc, cur) => acc + cur.total, 0);

            const refund = orders
                .filter(o => o.status === "CANCELLED")
                .reduce((acc, cur) => acc + cur.total, 0);

            return { sales, refund, count: orders.length };
        };

        return apiSuccess({
            today: calcStats(todayOrders),
            month: calcStats(monthOrders)
        });

    } catch (error) {
        return apiError("주문 통계를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}
