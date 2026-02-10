import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const { email, password, name, phone, username, zipcode, address, marketingConsent } = await req.json();

        if (!email || !password || !name || !username) {
            return apiError("필수 정보를 모두 입력해주세요.", "MISSING_FIELDS", 400);
        }

        if (username.length < 5) {
            return apiError("아이디는 5자 이상이어야 합니다.", "VALIDATION_ERROR", 400);
        }

        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            },
        });

        if (existingUser) {
            return apiError("이미 존재하는 이메일 또는 아이디입니다.", "DUPLICATE", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                name,
                phone,
                zipcode,
                address,
                marketingConsent: marketingConsent || false,
                role: "USER"
            },
        });

        return apiSuccess({ userId: user.id }, undefined, 201);

    } catch (error) {
        console.error("Signup error:", error);
        return apiError("회원가입 처리 중 오류가 발생했습니다.", "INTERNAL_ERROR");
    }
}
