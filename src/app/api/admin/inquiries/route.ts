import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

// GET List of Inquiries
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const where: any = {};
        if (status && status !== 'ALL') where.status = status;

        const [inquiries, total] = await Promise.all([
            db.inquiry.findMany({
                where,
                include: {
                    user: { select: { name: true, username: true, email: true } },
                    product: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            db.inquiry.count({ where })
        ]);

        return apiSuccess(inquiries, {
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error: any) {
        return apiError("문의 목록을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}
