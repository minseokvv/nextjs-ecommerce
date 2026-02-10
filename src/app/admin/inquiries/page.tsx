
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, Clock } from "lucide-react";

interface Inquiry {
    id: string;
    title: string;
    user: { name: string; username: string };
    product?: { name: string };
    status: string;
    createdAt: string;
}

export default function AdminInquiryList() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchInquiries();
    }, [page, statusFilter]);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/inquiries?page=${page}&limit=10&status=${statusFilter}`);
            const json = await res.json();
            setInquiries(json.data || []);
            setTotalPages(json.meta?.totalPages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">1:1 문의 관리</h2>
                <div className="flex gap-2">
                    {["ALL", "OPEN", "ANSWERED"].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {status === "ALL" ? "전체" : status === "OPEN" ? "답변대기" : "답변완료"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">분류/상품</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-400" /></td></tr>
                        ) : inquiries.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-gray-500">문의 내역이 없습니다.</td></tr>
                        ) : (
                            inquiries.map(inquiry => (
                                <tr key={inquiry.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {inquiry.status === "ANSWERED" ? (
                                            <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                                                <CheckCircle size={14} /> 답변완료
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full w-fit">
                                                <Clock size={14} /> 답변대기
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {inquiry.product ? `[상품] ${inquiry.product.name}` : "일반 문의"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/inquiries/${inquiry.id}`} className="text-gray-900 font-medium hover:text-blue-600 hover:underline block truncate max-w-xs">
                                            {inquiry.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {inquiry.user?.name || inquiry.user?.username || "알 수 없음"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(inquiry.createdAt).toISOString().split('T')[0]}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-4 items-center">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50 text-sm"
                >
                    이전
                </button>
                <span className="text-sm font-medium px-2">{page} / {totalPages || 1}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50 text-sm"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
