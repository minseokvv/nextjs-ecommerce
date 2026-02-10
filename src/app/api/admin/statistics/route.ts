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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'daily';
    const now = new Date();

    let startDate = new Date();
    let endDate = new Date();

    if (type === 'monthly') {
        startDate.setMonth(now.getMonth() - 5);
        startDate.setDate(1);
    } else if (type === 'weekly') {
        startDate.setDate(now.getDate() - 7 * 8);
    } else {
        startDate.setDate(now.getDate() - 13);
    }

    if (searchParams.get('startDate')) startDate = new Date(searchParams.get('startDate')!);
    if (searchParams.get('endDate')) endDate = new Date(searchParams.get('endDate')!);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    try {
        const orders = await db.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'COMPLETED', 'CANCELLED'] }
            },
            orderBy: { createdAt: 'asc' }
        });

        const aggregated: Record<string, { sales: number; refund: number; count: number }> = {};

        const init = (key: string) => {
            if (!aggregated[key]) aggregated[key] = { sales: 0, refund: 0, count: 0 };
        };

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key = "";

            if (type === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (type === 'weekly') {
                const day = date.getDay();
                const diff = date.getDate() - day;
                const startOfWeek = new Date(date);
                startOfWeek.setDate(diff);
                key = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')} 주`;
            } else {
                key = date.toISOString().split('T')[0];
            }

            init(key);

            if (order.status === 'CANCELLED') {
                aggregated[key].refund += order.total;
            } else {
                aggregated[key].sales += order.total;
                aggregated[key].count += 1;
            }
        });

        const result = Object.entries(aggregated).map(([label, data]) => ({
            label,
            sales: data.sales,
            refund: data.refund,
            netSales: data.sales - data.refund,
            count: data.count
        }));

        const summary = {
            totalSales: result.reduce((acc, cur) => acc + cur.sales, 0),
            totalRefund: result.reduce((acc, cur) => acc + cur.refund, 0),
            totalNet: result.reduce((acc, cur) => acc + cur.netSales, 0)
        };

        return apiSuccess({ chart: result, summary });

    } catch (error) {
        console.error(error);
        return apiError("통계를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}
