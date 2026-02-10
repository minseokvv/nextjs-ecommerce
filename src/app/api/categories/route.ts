import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET() {
    try {
        const categories = await db.category.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true }
        });
        return apiSuccess(categories);
    } catch (error) {
        return apiError("카테고리를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}
