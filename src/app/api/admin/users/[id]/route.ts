import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await db.user.findUnique({
            where: { id: params.id },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                reviews: true,
                inquiries: true,
            }
        });

        if (!user) {
            return apiError("회원을 찾을 수 없습니다.", "NOT_FOUND", 404);
        }

        return apiSuccess(user);
    } catch (error) {
        return apiError("회원 정보를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const user = await db.user.update({
            where: { id: params.id },
            data: body,
        });
        return apiSuccess(user);
    } catch (error) {
        return apiError("회원 정보 업데이트에 실패했습니다.", "INTERNAL_ERROR");
    }
}
