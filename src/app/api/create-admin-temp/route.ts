import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET() {
    try {
        const username = "admin123";
        const password = "admin";

        const existing = await db.user.findFirst({
            where: { username }
        });

        if (existing) {
            return apiSuccess({ message: "이미 존재하는 관리자 계정입니다.", user: existing });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                username,
                password: hashedPassword,
                name: "관리자",
                email: "admin@myoeemyo.com",
                role: "ADMIN"
            }
        });

        return apiSuccess({ user }, undefined, 201);

    } catch (error: any) {
        return apiError("관리자 계정 생성에 실패했습니다.", "INTERNAL_ERROR");
    }
}
