import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return apiError("상품 ID가 필요합니다.", "MISSING_FIELDS", 400);

    const reviews = await db.review.findMany({
        where: { productId },
        include: { user: { select: { name: true, username: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return apiSuccess(reviews);
}

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const { productId, rating, content } = await req.json();

        const orderCount = await db.order.count({
            where: {
                userId: sessionId,
                status: { in: ["PAID", "SHIPPED", "COMPLETED"] },
                items: { some: { productId } }
            }
        });

        if (orderCount === 0) {
            return apiError("상품을 구매한 사용자만 리뷰를 작성할 수 있습니다.", "FORBIDDEN", 403);
        }

        const review = await db.review.create({
            data: {
                userId: sessionId,
                productId,
                rating: Number(rating),
                content
            }
        });

        return apiSuccess(review, undefined, 201);
    } catch (error: any) {
        return apiError("리뷰 작성에 실패했습니다.", "INTERNAL_ERROR");
    }
}
