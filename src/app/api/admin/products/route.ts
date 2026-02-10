import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

function isAdmin() {
    const cookieStore = cookies();
    const adminSession = cookieStore.get("admin_session");
    return !!adminSession;
}

export async function GET() {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    try {
        const products = await db.product.findMany({
            include: {
                category: true,
                images: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return apiSuccess(products);
    } catch (error) {
        console.error("[PRODUCTS_GET]", error);
        return apiError("상품 목록을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function POST(req: Request) {
    if (!isAdmin()) {
        return apiError("권한이 없습니다.", "UNAUTHORIZED", 401);
    }

    try {
        const body = await req.json();
        const {
            name,
            description,
            price,
            stock,
            categoryId,
            images,
            status,
            purchaseLimit,
            minQuantity,
            maxQuantity
        } = body;

        if (!name || !price || !categoryId || !images || !images.length) {
            return apiError("필수 항목이 누락되었습니다.", "MISSING_FIELDS", 400);
        }

        const product = await db.product.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
                status,
                purchaseLimit,
                minQuantity,
                maxQuantity,
                imageUrl: images[0],
                images: {
                    createMany: {
                        data: images.map((url: string) => ({ url })),
                    },
                },
            },
        });

        return apiSuccess(product, undefined, 201);
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        return apiError("상품 등록에 실패했습니다.", "INTERNAL_ERROR");
    }
}
