import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);
        }

        const cart = await db.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: { include: { images: true } },
                    },
                },
            },
        });

        return apiSuccess(cart || { items: [] });
    } catch (error) {
        console.error("[CART_GET]", error);
        return apiError("장바구니를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);
        }

        const { productId, quantity } = await req.json();

        if (!productId || !quantity) {
            return apiError("필수 항목이 누락되었습니다.", "MISSING_FIELDS", 400);
        }

        // Find or create cart
        let cart = await db.cart.findUnique({
            where: { userId: session.user.id },
        });

        if (!cart) {
            cart = await db.cart.create({
                data: { userId: session.user.id },
            });
        }

        // Check if item exists
        const existingItem = await db.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
            }
        });

        if (existingItem) {
            // Update quantity
            await db.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            // Create new item
            await db.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                }
            });
        }

        return apiSuccess({ message: "장바구니에 추가되었습니다." }, undefined, 201);
    } catch (error) {
        console.error("[CART_POST]", error);
        return apiError("장바구니 추가에 실패했습니다.", "INTERNAL_ERROR");
    }
}
