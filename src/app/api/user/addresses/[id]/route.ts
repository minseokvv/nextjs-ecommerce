import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

// 주소 삭제
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const address = await db.address.findUnique({
            where: { id: params.id }
        });

        if (!address || address.userId !== session.user.id) {
            return apiError("주소를 찾을 수 없거나 권한이 없습니다.", "NOT_FOUND", 404);
        }

        await db.address.delete({
            where: { id: params.id }
        });

        return apiSuccess({ message: "주소가 삭제되었습니다." });
    } catch (error) {
        console.error("[ADDRESS_DELETE]", error);
        return apiError("주소 삭제에 실패했습니다.", "INTERNAL_ERROR");
    }
}

// 주소 수정
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const address = await db.address.findUnique({
            where: { id: params.id }
        });

        if (!address || address.userId !== session.user.id) {
            return apiError("주소를 찾을 수 없거나 권한이 없습니다.", "NOT_FOUND", 404);
        }

        const body = await req.json();
        const { name, recipient, phone, address: addr, detailAddress, zipcode, isDefault } = body;

        // 트랜잭션으로 처리
        const updatedAddress = await db.$transaction(async (tx) => {
            if (isDefault) {
                // 기존 기본 배송지 해제
                await tx.address.updateMany({
                    where: { userId: session.user.id, isDefault: true },
                    data: { isDefault: false }
                });
            }

            return await tx.address.update({
                where: { id: params.id },
                data: {
                    name,
                    recipient,
                    phone,
                    address: addr,
                    detailAddress,
                    zipcode,
                    isDefault
                }
            });
        });

        return apiSuccess(updatedAddress);
    } catch (error) {
        console.error("[ADDRESS_PUT]", error);
        return apiError("주소 수정에 실패했습니다.", "INTERNAL_ERROR");
    }
}
