
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewNoticePage() {
    const [formData, setFormData] = useState({ title: "", content: "", isImportant: false });
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/notices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("Failed");
            alert("공지사항이 등록되었습니다.");
            router.push("/admin/notices");
            router.refresh();
        } catch (err) {
            alert("등록 실패");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/admin/notices" className="flex items-center gap-2 text-gray-500 hover:text-black w-fit">
                <ArrowLeft size={18} /> 목록으로 돌아가기
            </Link>

            <h1 className="text-2xl font-bold text-gray-900">공지사항 등록</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">제목</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-black"
                        placeholder="공지 제목을 입력하세요"
                        required
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={formData.isImportant}
                        onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium text-gray-700">중요 공지로 설정</span>
                </label>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">내용</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-black min-h-[300px]"
                        placeholder="공지 내용을 입력하세요"
                        required
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors"
                    >
                        <Save size={18} />
                        {submitting ? "저장 중..." : "등록하기"}
                    </button>
                </div>
            </form>
        </div>
    );
}
