import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

// GET - List all banners
export async function GET() {
    try {
        const banners = await db.banner.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        });
        return apiSuccess(banners);
    } catch (error: any) {
        return apiError("배너 목록을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

// POST - Create a new banner
export async function POST(req: Request) {
    try {
        const { title, imageUrl, link, isActive } = await req.json();

        if (!title || !imageUrl) {
            return apiError("제목과 이미지 URL은 필수입니다.", "MISSING_FIELDS", 400);
        }

        const maxOrder = await db.banner.aggregate({ _max: { order: true } });
        const nextOrder = (maxOrder._max.order || 0) + 1;

        const banner = await db.banner.create({
            data: {
                title,
                imageUrl,
                link: link || null,
                isActive: isActive ?? true,
                order: nextOrder,
            },
        });

        return apiSuccess(banner, undefined, 201);
    } catch (error: any) {
        return apiError("배너 등록에 실패했습니다.", "INTERNAL_ERROR");
    }
}

// DELETE - Delete a banner by ID
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return apiError("배너 ID가 필요합니다.", "MISSING_FIELDS", 400);
        }

        await db.banner.delete({ where: { id } });
        return apiSuccess({ message: "배너가 삭제되었습니다." });
    } catch (error: any) {
        return apiError("배너 삭제에 실패했습니다.", "INTERNAL_ERROR");
    }
}

// PUT - Update banner (toggle active, reorder, etc.)
export async function PUT(req: Request) {
    try {
        const body = await req.json();

        // Batch reorder
        if (body.banners && Array.isArray(body.banners)) {
            await db.$transaction(
                body.banners.map((b: { id: string; order: number }) =>
                    db.banner.update({
                        where: { id: b.id },
                        data: { order: b.order },
                    })
                )
            );
            return apiSuccess({ message: "순서가 변경되었습니다." });
        }

        // Single update (toggle active, etc.)
        if (body.id) {
            const updateData: any = {};
            if (body.isActive !== undefined) updateData.isActive = body.isActive;
            if (body.title) updateData.title = body.title;
            if (body.link !== undefined) updateData.link = body.link;

            const updated = await db.banner.update({
                where: { id: body.id },
                data: updateData,
            });
            return apiSuccess(updated);
        }

        return apiError("잘못된 요청입니다.", "BAD_REQUEST", 400);
    } catch (error: any) {
        return apiError("배너 업데이트에 실패했습니다.", "INTERNAL_ERROR");
    }
}
