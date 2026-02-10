"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, User as UserIcon, Shield } from "lucide-react";
import Link from "next/link";

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    grade: string;
    phone: string;
    createdAt: string;
    _count: {
        orders: number;
    }
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const GRADES = [
        { value: "BASIC", label: "일반회원" },
        { value: "MEMBER", label: "멤버" },
        { value: "VIP", label: "VIP" }
    ];

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
            });
            const res = await fetch(`/api/admin/users?${query}`);
            const json = await res.json();
            setUsers(json.data?.users || []);
            setTotalPages(json.data?.totalPages || 1);
            setTotal(json.data?.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = async (userId: string, newGrade: string) => {
        // Optimistic Update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, grade: newGrade } : u));

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grade: newGrade })
            });
            if (!res.ok) throw new Error("Update failed");
            // alert("등급이 변경되었습니다.");
        } catch (error) {
            console.error(error);
            alert("등급 변경 실패");
            fetchUsers(); // Revert
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">회원 관리</h1>
                    <p className="text-gray-500">전체 회원 {total}명</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="이름, 이메일, 아이디 검색"
                        className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">회원정보</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">연락처</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">구매등급</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">권한</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">주문수</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">가입일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400">데이터를 불러오는 중...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <Link href={`/admin/users/${user.id}`} className="hover:underline">
                                                        <div className="font-bold text-gray-900">{user.name || "이름없음"}</div>
                                                    </Link>
                                                    <div className="text-sm text-gray-500">{user.email || user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {user.phone || "-"}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <select
                                                value={user.grade || "BASIC"}
                                                onChange={(e) => handleGradeChange(user.id, e.target.value)}
                                                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none cursor-pointer"
                                            >
                                                {GRADES.map(g => (
                                                    <option key={g.value} value={g.value}>{g.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                }`}>
                                                {user.role === 'ADMIN' ? '관리자' : '일반'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center font-medium text-gray-900">
                                            {user._count.orders}건
                                        </td>
                                        <td className="py-4 px-6 text-right text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                    >
                        <ChevronLeft size={16} /> 이전
                    </button>
                    <span className="text-sm text-gray-500 font-medium">{page} / {totalPages} 페이지</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                    >
                        다음 <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
