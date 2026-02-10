import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        const whereCondition = search ? {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            db.user.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    role: true,
                    grade: true,
                    phone: true,
                    createdAt: true,
                    _count: {
                        select: { orders: true }
                    }
                }
            }),
            db.user.count({ where: whereCondition })
        ]);

        return apiSuccess(users, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Admin Users GET Error:", error);
        return apiError("회원 목록을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}
