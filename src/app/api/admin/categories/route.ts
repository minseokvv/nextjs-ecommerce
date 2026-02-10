import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    const adminSession = cookieStore.get("admin_session");
    return !!adminSession;
}

export async function GET() {
    try {
        const categories = await db.category.findMany({
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ],
            include: { _count: { select: { products: true } } }
        });
        return apiSuccess(categories);
    } catch (error) {
        return apiError("카테고리 목록을 불러오지 못했습니다.", "INTERNAL_ERROR");
    }
}

export async function POST(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    try {
        const { name } = await req.json();

        if (!name) {
            return apiError("카테고리 이름을 입력해주세요.", "MISSING_FIELDS", 400);
        }

        const category = await db.category.create({
            data: { name },
        });

        return apiSuccess(category, undefined, 201);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return apiError("이미 존재하는 카테고리 이름입니다.", "DUPLICATE", 409);
        }
        return apiError("카테고리 생성 중 오류가 발생했습니다.", "INTERNAL_ERROR");
    }
}

export async function DELETE(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return apiError("삭제할 카테고리 ID가 필요합니다.", "MISSING_FIELDS", 400);
    }

    try {
        await db.category.delete({
            where: { id },
        });
        return apiSuccess({ message: "카테고리가 삭제되었습니다." });
    } catch (error) {
        return apiError("삭제할 수 없습니다. 연결된 상품이 있는지 확인해주세요.", "INTERNAL_ERROR");
    }
}
