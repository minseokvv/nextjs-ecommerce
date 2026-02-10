import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId) {
            return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);
        }

        const orderId = params.id;

        const order = await db.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return apiError("주문을 찾을 수 없습니다.", "NOT_FOUND", 404);
        }

        if (order.userId !== sessionId) {
            // Owner check (could extend for admin)
        }

        const updatedOrder = await db.order.update({
            where: { id: orderId },
            data: { status: "PAID" }
        });

        return apiSuccess({ order: updatedOrder });

    } catch (error: any) {
        return apiError("결제 처리에 실패했습니다.", "INTERNAL_ERROR");
    }
}
