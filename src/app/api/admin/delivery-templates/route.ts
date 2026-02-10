import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    return !!cookieStore.get("admin_session");
}

export async function GET() {
    if (!isAdmin()) return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);

    try {
        const templates = await db.deliveryTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return apiSuccess(templates);
    } catch (e) {
        return apiError("배송 템플릿을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function POST(req: Request) {
    if (!isAdmin()) return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);

    try {
        const body = await req.json();
        const { name, shippingInfo, returnInfo } = body;

        if (!name) return apiError("템플릿 이름은 필수입니다.", "MISSING_FIELDS", 400);

        const template = await db.deliveryTemplate.create({
            data: {
                name,
                shippingInfo: shippingInfo || "",
                returnInfo: returnInfo || ""
            }
        });
        return apiSuccess(template, undefined, 201);
    } catch (e) {
        return apiError("배송 템플릿 생성에 실패했습니다.", "INTERNAL_ERROR");
    }
}
