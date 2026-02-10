import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const order = await db.order.findUnique({
            where: { id: params.id },
            include: {
                user: { select: { name: true, email: true, phone: true, username: true } },
                items: {
                    include: {
                        product: { select: { name: true, imageUrl: true } }
                    }
                }
            }
        });

        if (!order) {
            return apiError("주문을 찾을 수 없습니다.", "NOT_FOUND", 404);
        }

        return apiSuccess(order);
    } catch (error) {
        return apiError("주문 정보를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();

        const order = await db.order.update({
            where: { id: params.id },
            data: {
                status: body.status,
                trackingNumber: body.trackingNumber,
                carrier: body.carrier,
            },
        });

        return apiSuccess(order);
    } catch (error) {
        return apiError("주문 업데이트에 실패했습니다.", "INTERNAL_ERROR");
    }
}
