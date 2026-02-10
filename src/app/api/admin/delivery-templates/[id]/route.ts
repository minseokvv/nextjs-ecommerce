import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    return !!cookieStore.get("admin_session");
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    if (!isAdmin()) return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);

    try {
        const body = await req.json();
        const { name, shippingInfo, returnInfo } = body;

        const template = await db.deliveryTemplate.update({
            where: { id: params.id },
            data: { name, shippingInfo, returnInfo }
        });
        return apiSuccess(template);
    } catch (e) {
        return apiError("배송 템플릿 수정에 실패했습니다.", "INTERNAL_ERROR");
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    if (!isAdmin()) return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);

    try {
        await db.deliveryTemplate.delete({
            where: { id: params.id }
        });
        return apiSuccess({ message: "배송 템플릿이 삭제되었습니다." });
    } catch (e) {
        return apiError("배송 템플릿 삭제에 실패했습니다.", "INTERNAL_ERROR");
    }
}
