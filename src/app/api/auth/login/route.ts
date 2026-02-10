import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await db.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            },
        });

        const isValid = user && (await bcrypt.compare(password, user.password));

        if (!user || !isValid) {
            return apiError("이메일 또는 비밀번호가 올바르지 않습니다.", "INVALID_CREDENTIALS", 401);
        }

        // Set session cookie
        cookies().set("session_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        if (user.role === "ADMIN") {
            cookies().set("admin_session", user.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24,
                path: "/",
            });
        }

        return apiSuccess({ isAdmin: user.role === "ADMIN" });
    } catch (error: any) {
        console.error("Login Error:", error);
        return apiError("서버 오류가 발생했습니다.", "INTERNAL_ERROR");
    }
}
