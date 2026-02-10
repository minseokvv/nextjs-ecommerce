
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface InquiryDetail {
    id: string;
    title: string;
    content: string;
    answer?: string;
    answeredAt?: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string; phone: string };
    product?: { id: string; name: string; imageUrl: string };
}

export default function AdminInquiryDetail({ params }: { params: { id: string } }) {
    const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch single inquiry logic using list API filtered by ID or separate GET ID API?
        // I didn't create GET /api/admin/inquiries/[id].
        // I will just use the PUT endpoint if I convert it to support GET or add GET to it.
        // Actually, List API doesn't support ID filter.
        // I should add GET to `src/app/api/admin/inquiries/[id]/route.ts`.
        // For now, let's update the Route to support GET first.
        fetch(`/api/admin/inquiries/${params.id}`)
            .then(res => res.json())
            .then(json => {
                setInquiry(json.data);
                if (json.data?.answer) setAnswer(json.data.answer);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/inquiries/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer })
            });
            if (!res.ok) throw new Error("Failed");
            alert("답변이 등록되었습니다.");
            router.refresh();
            // Fetch updated data
            const json = await res.json();
            setInquiry(json.data);
        } catch (err) {
            alert("저장 실패");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!inquiry) return <div className="p-10 text-center">문의를 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/admin/inquiries" className="flex items-center gap-2 text-gray-500 hover:text-black w-fit">
                <ArrowLeft size={18} /> 목록으로 돌아가기
            </Link>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${inquiry.status === "ANSWERED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                    {inquiry.status === "ANSWERED" ? "답변완료" : "답변대기"}
                                </span>
                                <span className="text-gray-400 text-sm">{new Date(inquiry.createdAt).toLocaleString()}</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">{inquiry.title}</h1>
                        </div>
                        <div className="text-right text-sm">
                            <div className="font-bold text-gray-900">{inquiry.user.name}</div>
                            <div className="text-gray-500">{inquiry.user.email}</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {inquiry.product && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                {/* Image placeholder */}
                                {inquiry.product.imageUrl && <img src={inquiry.product.imageUrl} className="w-full h-full object-cover rounded-lg" />}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">문의 상품</p>
                                <p className="font-bold text-gray-900">{inquiry.product.name}</p>
                            </div>
                        </div>
                    )}

                    <div className="prose max-w-none text-gray-800 whitespace-pre-line">
                        {inquiry.content}
                    </div>
                </div>

                {/* Answer Form */}
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        관리자 답변
                        {inquiry.status === "ANSWERED" && <span className="text-xs font-normal text-gray-500">(수정 가능)</span>}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="답변 내용을 입력하세요..."
                            className="w-full min-h-[150px] p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center gap-2"
                            >
                                <Send size={18} />
                                {submitting ? "저장 중..." : "답변 등록/수정"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
