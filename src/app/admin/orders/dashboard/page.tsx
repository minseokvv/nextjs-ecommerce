"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

interface OrderStats {
    today: { sales: number; refund: number; count: number };
    month: { sales: number; refund: number; count: number };
}

export default function OrderDashboard() {
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We need a new stats endpoint or use existing one with params
        // For now, let's assume we fetch from /api/admin/orders/stats
        fetch("/api/admin/orders/stats")
            .then(res => res.json())
            .then(json => {
                setStats(json.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!stats) return <div className="p-10 text-center">데이터를 불러오지 못했습니다.</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">주문 대시보드</h2>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {new Date().toLocaleDateString()} 기준
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Today Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        오늘의 현황
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)] flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200">
                            <p className="text-sm font-medium text-gray-500">오늘 매출</p>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold text-blue-600">{stats.today.sales.toLocaleString()}</span>
                                <span className="text-base font-medium text-gray-400 mb-1">원</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)] flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200">
                            <p className="text-sm font-medium text-gray-500">오늘 환불</p>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold text-rose-500">{stats.today.refund.toLocaleString()}</span>
                                <span className="text-base font-medium text-gray-400 mb-1">원</span>
                            </div>
                        </div>
                    </div>
                    {/* Additional Stat for Today */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700">오늘 접수된 주문</span>
                        <span className="text-xl font-bold text-blue-900">{stats.today.count}건</span>
                    </div>
                </div>

                {/* Month Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                        이번 달 현황
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-purple-50 shadow-[0_4px_20px_-10px_rgba(168,85,247,0.15)] flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200">
                            <p className="text-sm font-medium text-gray-500">이번 달 매출</p>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold text-gray-900">{stats.month.sales.toLocaleString()}</span>
                                <span className="text-base font-medium text-gray-400 mb-1">원</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-purple-50 shadow-[0_4px_20px_-10px_rgba(168,85,247,0.15)] flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200">
                            <p className="text-sm font-medium text-gray-500">이번 달 환불</p>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold text-rose-500">{stats.month.refund.toLocaleString()}</span>
                                <span className="text-base font-medium text-gray-400 mb-1">원</span>
                            </div>
                        </div>
                    </div>
                    {/* Additional Stat for Month */}
                    <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700">이번 달 누적 주문</span>
                        <span className="text-xl font-bold text-purple-900">{stats.month.count}건</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
