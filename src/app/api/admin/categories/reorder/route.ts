import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    const adminSession = cookieStore.get("admin_session");
    return !!adminSession;
}

export async function PUT(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    try {
        const { categories } = await req.json();

        if (!Array.isArray(categories)) {
            return apiError("잘못된 요청입니다.", "BAD_REQUEST", 400);
        }

        await db.$transaction(
            categories.map((cat: { id: string; order: number }) =>
                db.category.update({
                    where: { id: cat.id },
                    data: { order: cat.order },
                })
            )
        );

        return apiSuccess({ message: "순서가 변경되었습니다." });
    } catch (error) {
        console.error("Reorder error:", error);
        return apiError("순서 변경에 실패했습니다.", "INTERNAL_ERROR");
    }
}
