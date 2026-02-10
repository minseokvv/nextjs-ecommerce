import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    const adminSession = cookieStore.get("admin_session");
    return !!adminSession;
}

export async function GET(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    // Extract search parameters from URL
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const searchType = searchParams.get('searchType');

    const where: any = {};

    // 1. Date Filter
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        where.createdAt = { gte: start, lte: end };
    }

    // 2. Status Filter
    if (status && status !== 'ALL') {
        where.status = status;
    }

    // 3. Keyword Search
    if (keyword) {
        if (searchType === 'orderNo') {
            where.id = { contains: keyword };
        } else if (searchType === 'trackingNo') {
            where.trackingNumber = { contains: keyword };
        } else if (searchType === 'depositor') {
            where.depositorName = { contains: keyword };
        } else if (searchType === 'phone') {
            where.user = { phone: { contains: keyword } };
        } else {
            // Default: name or username
            where.user = {
                OR: [
                    { name: { contains: keyword } },
                    { username: { contains: keyword } }
                ]
            };
        }
    }

    try {
        const [orders, total] = await Promise.all([
            db.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: { name: true, email: true, username: true, phone: true }
                    },
                    items: {
                        include: { product: true }
                    }
                }
            }),
            db.order.count({ where })
        ]);

        return apiSuccess(orders, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return apiError("주문 목록을 불러오지 못했습니다.", "INTERNAL_ERROR");
    }
}

export async function PUT(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    try {
        const body = await req.json();
        const { id, status, trackingNumber, carrier } = body;

        if (!id) {
            return apiError("주문 ID가 필요합니다.", "MISSING_FIELDS", 400);
        }

        const data: any = {};
        if (status) data.status = status;
        if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
        if (carrier !== undefined) data.carrier = carrier;

        const order = await db.order.update({
            where: { id },
            data,
        });

        return apiSuccess(order);
    } catch (error) {
        return apiError("주문 업데이트에 실패했습니다.", "INTERNAL_ERROR");
    }
}
