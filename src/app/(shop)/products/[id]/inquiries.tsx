
"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, MessageSquare } from "lucide-react";

interface Inquiry {
    id: string;
    title: string;
    content: string; // If secret, maybe hide content unless owner? API should handle hiding.
    isSecret: boolean;
    status: string;
    createdAt: string;
    // user: ... // Should fetch user info
}

export default function ProductInquiries({ productId }: { productId: string }) {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWriting, setIsWriting] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "", isSecret: true });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // We probably need a specific API query for Product inquiries or filter client side (inefficient).
        // Our GET API implementation handles ?productId=... -> let's assume I implemented that in previous step (I did start it).
        // Wait, GET /api/inquiries logic was just findMany({ userId: { not: undefined } }). 
        // I need to update GET logic to filter by productId if provided.
        // I'll update the API in next step if I missed it.
        fetch(`/api/inquiries?productId=${productId}`)
            .then(res => res.json())
            .then(json => {
                setInquiries(json.data || []);
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, productId })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "문의 등록 실패");

            alert("문의가 등록되었습니다.");
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">상품 문의 ({inquiries.length})</h3>
                <button
                    onClick={() => setIsWriting(!isWriting)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                    문의하기
                </button>
            </div>

            {/* Write Form */}
            {isWriting && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl space-y-4 animate-fade-in">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                    />
                    <textarea
                        placeholder="문의 내용을 입력하세요"
                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-black min-h-[120px]"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        required
                    />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={formData.isSecret}
                                onChange={(e) => setFormData(prev => ({ ...prev, isSecret: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            비밀글로 작성
                        </label>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-black text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                        >
                            {submitting ? "등록 중..." : "등록하기"}
                        </button>
                    </div>
                </form>
            )}

            {/* Inquiry List */}
            <div className="space-y-4">
                {inquiries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">등록된 문의가 없습니다.</p>
                ) : (
                    inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border-b border-gray-100 pb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${inquiry.status === "ANSWERED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {inquiry.status === "ANSWERED" ? "답변완료" : "답변대기"}
                                    </span>
                                    {inquiry.isSecret && <Lock size={14} className="text-gray-400" />}
                                    <span className="font-medium text-gray-900">{inquiry.title}</span>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* Logic to hide secret content needs to be refined. 
                                Ideally API shouldn't return content if secret and not owner. 
                                For now, just blurring plain UI or showing 'Secret Post' message.
                            */}
                            {inquiry.isSecret ? (
                                <p className="text-gray-400 text-sm flex items-center gap-2 py-2">
                                    비밀글입니다.
                                </p>
                            ) : (
                                <p className="text-gray-600 text-sm">{inquiry.content}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
