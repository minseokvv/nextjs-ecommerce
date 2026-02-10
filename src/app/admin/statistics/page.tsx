"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface StatData {
    label: string;
    sales: number;
    refund: number;
    netSales: number;
    count: number;
}

export default function StatisticsPage() {
    const [type, setType] = useState("daily"); // daily, weekly, monthly
    const [data, setData] = useState<StatData[]>([]);
    const [summary, setSummary] = useState({ totalSales: 0, totalRefund: 0, totalNet: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [type]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/statistics?type=${type}`);
            const json = await res.json();
            const result = json.data || {};
            if (result.chart) setData(result.chart);
            if (result.summary) setSummary(result.summary);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const maxVal = Math.max(...data.map(d => d.sales), 1);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">매출 통계</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {["daily", "weekly", "monthly"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${type === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {t === "daily" ? "일별" : t === "weekly" ? "주별" : "월별"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">기간 총 매출</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.totalSales.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">기간 순매출 (매출-환불)</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.totalNet.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">기간 환불액</p>
                            <p className="text-2xl font-bold text-gray-900">{summary.totalRefund.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">매출 추이</h3>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        <Loader2 className="animate-spin mr-2" /> 데이터를 불러오는 중...
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">데이터가 없습니다.</div>
                ) : (
                    <div className="h-64 flex items-end gap-2 md:gap-4">
                        {data.map((item, idx) => {
                            const heightPercent = Math.max((item.sales / maxVal) * 100, 4); // min 4% height
                            return (
                                <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                        {item.label}<br />
                                        매출: {item.sales.toLocaleString()}원<br />
                                        순익: {item.netSales.toLocaleString()}원
                                    </div>

                                    {/* Bar - Sales */}
                                    <div
                                        style={{ height: `${heightPercent}%` }}
                                        className="w-full bg-blue-100 hover:bg-blue-200 rounded-t-md relative transition-all duration-300"
                                    >
                                        {/* Bar - Net Sales Overlay (Darker) */}
                                        <div
                                            style={{ height: `${(item.netSales / item.sales) * 100}%` }}
                                            className="w-full bg-blue-500 rounded-t-md absolute bottom-0 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="text-[10px] md:text-xs text-center text-gray-500 mt-2 truncate">
                                        {item.label.split('-').slice(1).join('/')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">날짜/기간</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">총 매출</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">환불</th>
                            <th className="px-6 py-3 text-right font-medium text-blue-600">순매출</th>
                            <th className="px-6 py-3 text-center font-medium text-gray-500">결제건수</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.slice().reverse().map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-900 font-medium">{item.label}</td>
                                <td className="px-6 py-4 text-right">{item.sales.toLocaleString()}원</td>
                                <td className="px-6 py-4 text-right text-rose-500">{item.refund > 0 ? `-${item.refund.toLocaleString()}` : "0"}원</td>
                                <td className="px-6 py-4 text-right font-bold text-blue-600">{item.netSales.toLocaleString()}원</td>
                                <td className="px-6 py-4 text-center text-gray-500">{item.count}건</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
