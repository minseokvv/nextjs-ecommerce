import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const inquiry = await db.inquiry.findUnique({
            where: { id: params.id },
            include: { user: true, product: true }
        });
        if (!inquiry) return apiError("문의를 찾을 수 없습니다.", "NOT_FOUND", 404);
        return apiSuccess(inquiry);
    } catch (error: any) {
        return apiError("문의 정보를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

// PUT Answer to Inquiry
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const { answer, status } = await req.json();

        const updateData: any = {};
        if (answer) {
            updateData.answer = answer;
            updateData.answeredAt = new Date();
            updateData.status = "ANSWERED";
        }
        if (status) updateData.status = status;

        const updated = await db.inquiry.update({
            where: { id },
            data: updateData
        });

        return apiSuccess(updated);
    } catch (error: any) {
        return apiError("답변 등록에 실패했습니다.", "INTERNAL_ERROR");
    }
}
