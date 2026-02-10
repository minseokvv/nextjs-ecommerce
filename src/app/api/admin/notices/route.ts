import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        const notices = await db.notice.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return apiSuccess(notices);
    } catch (error: any) {
        return apiError("공지사항을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function POST(req: Request) {
    try {
        const { title, content, isImportant } = await req.json();
        const notice = await db.notice.create({
            data: { title, content, isImportant: isImportant || false }
        });
        return apiSuccess(notice, undefined, 201);
    } catch (error: any) {
        return apiError("공지사항 등록에 실패했습니다.", "INTERNAL_ERROR");
    }
}
