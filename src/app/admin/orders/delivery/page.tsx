"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Printer, Download, Package, Truck, CheckSquare } from "lucide-react";

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    memo?: string;
    trackingNumber?: string;
    carrier?: string;
    recipientName?: string;
    user: {
        name: string | null;
        username: string | null;
    };
    items: {
        quantity: number;
        product: { name: string; supplier?: string | null };
        option?: string | null;
        price: number;
    }[];
}

export default function DeliveryManagementPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filters
    const [page, setPage] = useState(1);
    const limit = 20;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Re-use orders API but filtering for "Waiting" statuses typically?
            // User asked for "Delivery Waiting Management" but mentioned columns like "Order Date".
            // Let's fetch all initially or filtered. Usually "Waiting" implies PAID or PREPARING.
            // But user might want to see all to manage them. Let's default to PAID/PREPARING/SHIPPED for this view?
            // "Delivery Waiting" usually means [PAID] -> Need to Prepare.
            // Let's list everything but focus on management columns.

            const res = await fetch(`/api/admin/orders?page=${page}&limit=${limit}&status=ALL`); // We need pagination API update
            const json = await res.json();

            // Handle both old array format (fallback) and new paginated object
            // Handle standardized API response format
            if (json.data && Array.isArray(json.data)) {
                setOrders(json.data);
                setTotalPages(json.meta?.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === orders.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(orders.map(o => o.id)));
    };

    // Bulk Actions
    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (selectedIds.size === 0) return alert("선택된 주문이 없습니다.");
        if (!confirm(`선택한 ${selectedIds.size}건을 '${newStatus}' 상태로 변경하시겠습니까?`)) return;

        try {
            await Promise.all(Array.from(selectedIds).map(id =>
                fetch("/api/admin/orders", {
                    method: "PUT",
                    body: JSON.stringify({ id, status: newStatus })
                })
            ));
            alert("처리되었습니다.");
            fetchOrders();
            setSelectedIds(new Set());
        } catch (e) {
            alert("일부 처리에 실패했습니다.");
        }
    };

    const handleExcelDownload = () => {
        alert("엑셀 다운로드 기능은 준비중입니다. (Mock)");
    };

    const handlePrintLabel = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">배송 대기 관리</h2>
                <div className="flex gap-2">
                    <button onClick={handleExcelDownload} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                        <Download size={16} /> 엑셀 다운로드
                    </button>
                    <button onClick={handlePrintLabel} className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm">
                        <Printer size={16} /> 운송장/주문서 인쇄
                    </button>
                </div>
            </div>

            {/* Bulk Action Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-gray-700">선택한 주문({selectedIds.size}건):</span>
                <button
                    onClick={() => handleBulkStatusUpdate("PREPARING")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 text-sm font-medium"
                >
                    <Package size={16} /> 배송준비중 처리
                </button>
                <button
                    onClick={() => handleBulkStatusUpdate("SHIPPED")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 text-sm font-medium"
                >
                    <Truck size={16} /> 배송중 처리
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto min-h-[500px]">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <input type="checkbox" checked={selectedIds.size === orders.length && orders.length > 0} onChange={toggleSelectAll} />
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">주문일 (결제일)</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">주문번호</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">주문자/수령자</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">운송장정보</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">공급사</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">상품명/옵션</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-500">수량</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-500">결제금액</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">메모</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={10} className="px-6 py-20 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" />Loading...</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelect(order.id)} />
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(order.createdAt).toISOString().split('T')[0]}<br />
                                    <span className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                </td>
                                <td className="px-4 py-3 font-mono text-gray-600">{order.id.slice(0, 8)}</td>
                                <td className="px-4 py-3">
                                    <div>{order.user.name || order.user.username}</div>
                                    <div className="text-xs text-gray-400">수령: {order.recipientName || "-"}</div>
                                </td>
                                <td className="px-4 py-3">
                                    {/* Tracking Input Placeholder */}
                                    <input
                                        defaultValue={order.trackingNumber || ""}
                                        placeholder="입력"
                                        className="w-24 text-xs border rounded p-1 mb-1"
                                    />
                                    <div className="text-xs text-blue-600 font-medium">{order.status}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{order.items[0]?.product.supplier || "-"}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{order.items[0]?.product.name}</div>
                                    {order.items[0]?.option && <div className="text-xs text-gray-500">옵션: {order.items[0].option}</div>}
                                    {order.items.length > 1 && <div className="text-xs text-gray-400">외 {order.items.length - 1}건</div>}
                                </td>
                                <td className="px-4 py-3 text-center">{order.items.reduce((a, c) => a + c.quantity, 0)}</td>
                                <td className="px-4 py-3 text-right font-bold">{order.total.toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{order.memo || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 items-center">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50 text-sm"
                >
                    Prev
                </button>
                <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
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
