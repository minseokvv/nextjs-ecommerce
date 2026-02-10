import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ProfileEditForm from "./profile-edit-form";

export default async function ProfileEditPage() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: { id: sessionId }
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/profile" className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">내 정보 수정</h1>
            </div>

            <ProfileEditForm user={user} />
        </div>
    );
}
