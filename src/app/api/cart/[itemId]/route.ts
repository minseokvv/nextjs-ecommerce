import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

// PUT: Update Quantity
export async function PUT(req: Request, { params }: { params: { itemId: string } }) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;
        if (!sessionId) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const { quantity } = await req.json();

        // Verify User owns the cart item
        const item = await db.cartItem.findUnique({
            where: { id: params.itemId },
            include: { cart: true }
        });

        if (!item || item.cart.userId !== sessionId) {
            return apiError("항목을 찾을 수 없거나 권한이 없습니다.", "NOT_FOUND", 404);
        }

        if (quantity < 1) {
            // Remove if quantity is less than 1 (Optional, but usually better to use DELETE)
            await db.cartItem.delete({ where: { id: params.itemId } });
        } else {
            await db.cartItem.update({
                where: { id: params.itemId },
                data: { quantity }
            });
        }

        return apiSuccess({ message: "수량이 업데이트되었습니다." });
    } catch (error) {
        return apiError("수량 업데이트에 실패했습니다.", "INTERNAL_ERROR");
    }
}

// DELETE: Remove Item
export async function DELETE(req: Request, { params }: { params: { itemId: string } }) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;
        if (!sessionId) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const item = await db.cartItem.findUnique({
            where: { id: params.itemId },
            include: { cart: true }
        });

        if (!item || item.cart.userId !== sessionId) {
            return apiError("항목을 찾을 수 없거나 권한이 없습니다.", "NOT_FOUND", 404);
        }

        await db.cartItem.delete({ where: { id: params.itemId } });

        return apiSuccess({ message: "장바구니에서 삭제되었습니다." });
    } catch (error) {
        return apiError("삭제에 실패했습니다.", "INTERNAL_ERROR");
    }
}
