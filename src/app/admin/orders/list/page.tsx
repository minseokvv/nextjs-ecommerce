"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Calendar, RefreshCcw } from "lucide-react";

interface Order {
    id: string;
    total: number;
    status: string;
    trackingNumber?: string;
    carrier?: string;
    depositorName?: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
        username: string | null;
        phone: string | null;
    };
    items: {
        product: { name: string };
    }[];
}

const STATUS_MAP: Record<string, string> = {
    PENDING: "입금 대기",
    PAID: "결제 완료",
    PREPARING: "배송 준비",
    SHIPPED: "배송 중",
    COMPLETED: "배송 완료",
    CANCELLED: "취소/환불",
};

export default function OrderList({ searchParams }: { searchParams: { startDate?: string; endDate?: string; status?: string; range?: string } }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        startDate: searchParams.startDate || "",
        endDate: searchParams.endDate || "",
        searchType: "orderNo", // orderNo, trackingNo, depositor, name, phone
        keyword: "",
        status: searchParams.status || "ALL"
    });

    useEffect(() => {
        // Initialize range if provided
        if (searchParams.range === 'month') {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const end = new Date().toISOString().split('T')[0];
            setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
            fetchOrders(start, end, "ALL", "", "orderNo");
        } else if (searchParams.startDate && searchParams.endDate) {
            fetchOrders(searchParams.startDate, searchParams.endDate, searchParams.status || "ALL", "", "orderNo");
        } else {
            fetchOrders();
        }
    }, [searchParams]);

    // Pagination State for List Page
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // ... useEffect dependency update ...
    useEffect(() => {
        // ... (existing logic) ...
        fetchOrders();
    }, [searchParams, page]); // Add page dependency

    const fetchOrders = async (start = filters.startDate, end = filters.endDate, status = filters.status, kw = filters.keyword, type = filters.searchType) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20"); // Default limit

        if (start && end) {
            params.append("startDate", start);
            params.append("endDate", end);
        }
        if (status && status !== 'ALL') params.append("status", status);
        if (kw) {
            params.append("keyword", kw);
            params.append("searchType", type);
        }

        try {
            const res = await fetch(`/api/admin/orders?${params.toString()}`);
            const json = await res.json();

            if (json.data) {
                setOrders(json.data);
                setTotalPages(json.meta?.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders();
    };

    const setDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        const f = (d: Date) => d.toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, startDate: f(start), endDate: f(end) }));
    };

    const updateStatus = async (id: string, status: string, trackingNumber?: string, carrier?: string) => {
        try {
            await fetch("/api/admin/orders", {
                method: "PUT",
                body: JSON.stringify({ id, status, trackingNumber, carrier }),
            });
            fetchOrders(); // Refresh
        } catch (err) {
            alert("업데이트 실패");
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-900">전체 주문 조회</h2>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                {/* Date Range */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[60px]">기간</span>
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                        {[
                            { label: "어제", days: 1 },
                            { label: "오늘", days: 0 },
                            { label: "3일", days: 3 },
                            { label: "7일", days: 7 },
                            { label: "15일", days: 15 },
                            { label: "1개월", days: 30 },
                            { label: "3개월", days: 90 },
                        ].map(opt => (
                            <button
                                key={opt.label}
                                onClick={() => setDateRange(opt.days)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:text-blue-600 rounded-md transition-colors"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="border border-gray-200 rounded-lg px-2 py-1.5"
                        />
                        <span>~</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="border border-gray-200 rounded-lg px-2 py-1.5"
                        />
                    </div>
                </div>

                {/* Status & Search */}
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-[60px]">검색</span>
                        <select
                            value={filters.searchType}
                            onChange={(e) => setFilters({ ...filters, searchType: e.target.value })}
                            className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
                        >
                            <option value="orderNo">주문번호</option>
                            <option value="trackingNo">배송번호</option>
                            <option value="name">수령인 명</option>
                            <option value="phone">전화번호</option>
                            <option value="depositor">입금자명</option>
                        </select>
                        <input
                            placeholder="검색어를 입력하세요"
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
                        />
                    </div>

                    <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800">
                        <Search size={16} />
                        검색
                    </button>
                    <button type="button" onClick={() => fetchOrders()} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">
                        <RefreshCcw size={16} />
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {["주문일시", "주문번호", "상품정보", "구매자/입금자", "결제금액", "상태/배송관리"].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" />Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500">검색된 주문이 없습니다.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toISOString().split('T')[0]}<br />
                                        <span className="text-xs text-gray-300">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                        {order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {order.items[0]?.product.name}
                                        {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.user.name || order.user.username}<br />
                                        <span className="text-xs text-gray-400">{order.user.phone}</span>
                                        {order.depositorName && (
                                            <div className="mt-1 text-xs text-blue-600 font-medium">
                                                입금자: {order.depositorName}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {order.total.toLocaleString()}원
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="space-y-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`text-xs font-semibold rounded px-2 py-1 border-0 ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {Object.entries(STATUS_MAP).map(([k, v]) => (
                                                    <option key={k} value={k}>{v}</option>
                                                ))}
                                            </select>

                                            {/* Tracking Input if SHIPPED/COMPLETED */}
                                            {["PREPARING", "SHIPPED", "COMPLETED"].includes(order.status) && (
                                                <div className="flex gap-1">
                                                    <input
                                                        placeholder="송장번호"
                                                        defaultValue={order.trackingNumber || ""}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== order.trackingNumber)
                                                                updateStatus(order.id, order.status, e.target.value, order.carrier)
                                                        }}
                                                        className="w-24 text-xs border rounded p-1"
                                                    />
                                                    <select
                                                        defaultValue={order.carrier || "CJ대한통운"}
                                                        onChange={(e) => updateStatus(order.id, order.status, order.trackingNumber, e.target.value)}
                                                        className="w-20 text-xs border rounded p-1"
                                                    >
                                                        <option value="CJ대한통운">CJ</option>
                                                        <option value="우체국택배">우체국</option>
                                                        <option value="로젠택배">로젠</option>
                                                        <option value="한진택배">한진</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
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
                    Prev
                </button>
                <span className="text-sm font-medium px-2">{page} / {totalPages || 1}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50 text-sm"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
