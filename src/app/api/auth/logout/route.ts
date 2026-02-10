import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiError } from "@/lib/utils";

export async function GET() {
    try {
        const cookieStore = cookies();
        cookieStore.delete("session_id");
        cookieStore.delete("admin_session");

        return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
    } catch (error) {
        return apiError("로그아웃에 실패했습니다.", "INTERNAL_ERROR");
    }
}
