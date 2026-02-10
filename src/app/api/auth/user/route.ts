import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId) {
            return apiSuccess({ user: null });
        }

        const user = await db.user.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                phone: true,
                zipcode: true,
                address: true,
                detailAddress: true
            }
        });

        if (!user) {
            return apiSuccess({ user: null });
        }

        return apiSuccess({ user });
    } catch (error) {
        return apiError("사용자 정보를 불러올 수 없습니다.", "INTERNAL_ERROR");
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId) {
            return apiError("로그인이 필요합니다.", "UNAUTHORIZED", 401);
        }

        const body = await req.json();
        const { email, name, phone, zipcode, address, detailAddress } = body;

        if (email) {
            const existingUser = await db.user.findFirst({
                where: {
                    email: email,
                    NOT: { id: sessionId }
                }
            });

            if (existingUser) {
                return apiError("이미 사용 중인 이메일입니다.", "DUPLICATE", 400);
            }
        }

        const updatedUser = await db.user.update({
            where: { id: sessionId },
            data: {
                email,
                name,
                phone,
                zipcode,
                address,
                detailAddress
            }
        });

        return apiSuccess({ user: updatedUser });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return apiError("프로필 업데이트에 실패했습니다.", "INTERNAL_ERROR");
    }
}
