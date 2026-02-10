import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

// GET - List all reviews for admin
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const [reviews, total] = await Promise.all([
            db.review.findMany({
                include: {
                    user: { select: { name: true, username: true, email: true } },
                    product: { select: { id: true, name: true, imageUrl: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db.review.count(),
        ]);

        return apiSuccess(reviews, {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error: any) {
        return apiError("리뷰 목록을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

// DELETE - Delete a review by ID (moderation)
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return apiError("리뷰 ID가 필요합니다.", "MISSING_FIELDS", 400);
        }

        await db.review.delete({ where: { id } });
        return apiSuccess({ message: "리뷰가 삭제되었습니다." });
    } catch (error: any) {
        return apiError("리뷰 삭제에 실패했습니다.", "INTERNAL_ERROR");
    }
}
