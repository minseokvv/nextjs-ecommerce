import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

// 주소 목록 조회
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const addresses = await db.address.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return apiSuccess(addresses);
    } catch (error) {
        console.error("[ADDRESS_GET]", error);
        return apiError("주소 목록을 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

// 주소 추가
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);

        const body = await req.json();
        const { name, recipient, phone, address, detailAddress, zipcode, isDefault } = body;

        if (!name || !recipient || !phone || !address) {
            return apiError("필수 항목을 모두 입력해주세요.", "MISSING_FIELDS", 400);
        }

        // 주소 개수 제한 확인 (최대 5개)
        const count = await db.address.count({ where: { userId: session.user.id } });
        if (count >= 5) {
            return apiError("배송지는 최대 5개까지만 저장할 수 있습니다.", "LIMIT_EXCEEDED", 400);
        }

        // 첫 주소이거나 기본 배송지로 설정한 경우
        const shouldBeDefault = count === 0 || isDefault;

        // 트랜잭션으로 처리 (기본 배송지 업데이트 포함)
        const newAddress = await db.$transaction(async (tx) => {
            if (shouldBeDefault) {
                // 기존 기본 배송지 해제
                await tx.address.updateMany({
                    where: { userId: session.user.id, isDefault: true },
                    data: { isDefault: false }
                });
            }

            return await tx.address.create({
                data: {
                    userId: session.user.id,
                    name,
                    recipient,
                    phone,
                    address,
                    detailAddress,
                    zipcode,
                    isDefault: shouldBeDefault
                }
            });
        });

        return apiSuccess(newAddress, undefined, 201);
    } catch (error) {
        console.error("[ADDRESS_POST]", error);
        return apiError("주소 추가에 실패했습니다.", "INTERNAL_ERROR");
    }
}
