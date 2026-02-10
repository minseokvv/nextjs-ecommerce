import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return apiError("상품 ID가 필요합니다.", "MISSING_FIELDS", 400);

    const inquiries = await db.inquiry.findMany({
        where: {
            productId: productId ? productId : undefined
        },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return apiSuccess(inquiries);
}

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const { title, content, isSecret, productId } = await req.json();

        const inquiry = await db.inquiry.create({
            data: {
                userId: sessionId,
                title,
                content,
                isSecret: isSecret || false,
                productId: productId || null
            }
        });

        return apiSuccess(inquiry, undefined, 201);
    } catch (error: any) {
        return apiError("문의 등록에 실패했습니다.", "INTERNAL_ERROR");
    }
}
