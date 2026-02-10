
"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Star } from "lucide-react";
import Link from "next/link";

interface Notice {
    id: string;
    title: string;
    isImportant: boolean;
    createdAt: string;
}

export default function AdminNoticeList() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/notices")
            .then(res => res.json())
            .then(json => {
                if (json.data) setNotices(Array.isArray(json.data) ? json.data : []);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">공지사항 관리</h2>
                <Link
                    href="/admin/notices/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800"
                >
                    <Plus size={16} /> 공지 등록
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">중요</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">작성일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-400" /></td></tr>
                        ) : notices.length === 0 ? (
                            <tr><td colSpan={3} className="py-20 text-center text-gray-500">등록된 공지사항이 없습니다.</td></tr>
                        ) : (
                            notices.map(notice => (
                                <tr key={notice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {notice.isImportant && <Star size={16} className="fill-yellow-400 text-yellow-400" />}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/notices/${notice.id}`} className="font-medium text-gray-900 hover:text-blue-600 block">
                                            {notice.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
