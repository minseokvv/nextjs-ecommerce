import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);
        }

        const {
            name,
            address,
            phone,
            depositorName, // 추가됨
        } = await req.json();

        if (!name || !address || !phone || !depositorName) {
            return apiError("배송 정보와 입금자명을 모두 입력해주세요.", "MISSING_FIELDS", 400);
        }

        const cart = await db.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return apiError("장바구니가 비어있습니다.", "BAD_REQUEST", 400);
        }

        let total = 0;
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return apiError(`${item.product.name}의 재고가 부족합니다.`, "INSUFFICIENT_STOCK", 400);
            }
            total += item.product.price * item.quantity;
        }

        const order = await db.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: session.user.id,
                    total,
                    status: "PENDING",
                    recipientName: name,
                    recipientPhone: phone,
                    shippingAddress: address,
                    depositorName: depositorName, // 저장
                }
            });

            for (const item of cart.items) {
                const currentProduct = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true, name: true }
                });

                if (!currentProduct || currentProduct.stock < item.quantity) {
                    throw new Error(`${currentProduct?.name || item.productId}의 재고가 부족합니다.`);
                }

                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    }
                });

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            return newOrder;
        });

        return apiSuccess({ orderId: order.id }, undefined, 201);
    } catch (error) {
        console.error("[ORDER_POST]", error);
        return apiError("주문 처리 중 오류가 발생했습니다.", "INTERNAL_ERROR");
    }
}
