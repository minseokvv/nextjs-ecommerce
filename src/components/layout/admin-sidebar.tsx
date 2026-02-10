"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut, ChevronDown, ChevronRight, List, BarChart3, Truck, Settings, User as UserIcon } from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOrderOpen, setIsOrderOpen] = useState(true); // Default open for visibility

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    return (
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white flex flex-col">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
                <h1 className="text-xl font-bold text-gray-900">관리자 센터</h1>
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/dashboard") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">대시보드</span>
                </Link>

                <Link
                    href="/admin/products"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/products") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                >
                    <Package size={20} />
                    <span className="font-medium">상품 관리</span>
                </Link>

                <Link
                    href="/admin/categories"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/categories") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                >
                    <List size={20} />
                    <span className="font-medium">카테고리 관리</span>
                </Link>

                <Link
                    href="/admin/users"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/users") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                >
                    <UserIcon size={20} />
                    <span className="font-medium">회원 관리</span>
                </Link>

                {/* Collapsible Order Management */}
                <div>
                    <button
                        onClick={() => setIsOrderOpen(!isOrderOpen)}
                        className={`w-full flex items-center justify-between gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/orders") ? "bg-gray-50 text-black" : "text-gray-700"}`}
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingCart size={20} />
                            <span className="font-medium">주문 관리</span>
                        </div>
                        {isOrderOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {isOrderOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                            <Link
                                href="/admin/orders/dashboard"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 hover:text-black ${pathname === "/admin/orders/dashboard" ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-500"}`}
                            >
                                <BarChart3 size={16} />
                                주문 대시보드
                            </Link>
                            <Link
                                href="/admin/orders/list"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 hover:text-black ${pathname === "/admin/orders/list" ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-500"}`}
                            >
                                <List size={16} />
                                전체 주문 조회
                            </Link>
                            <Link
                                href="/admin/orders/delivery"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 hover:text-black ${pathname === "/admin/orders/delivery" ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-500"}`}
                            >
                                <Truck size={16} />
                                배송 대기 관리
                            </Link>
                        </div>
                    )}
                </div>

                <Link
                    href="/admin/statistics"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/statistics") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                >
                    <BarChart3 size={20} />
                    <span className="font-medium">매출 통계</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="px-4 text-xs font-semibold text-gray-400 mb-2">고객 지원</p>
                    <Link
                        href="/admin/inquiries"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/inquiries") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                    >
                        <UserIcon size={20} />
                        <span className="font-medium">1:1 문의 관리</span>
                    </Link>
                    <Link
                        href="/admin/notices"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/notices") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                    >
                        <List size={20} />
                        <span className="font-medium">공지사항 관리</span>
                    </Link>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="px-4 text-xs font-semibold text-gray-400 mb-2">설정</p>
                    <Link
                        href="/admin/settings/delivery"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 hover:text-black ${isActive("/admin/settings/delivery") ? "bg-gray-100 text-black font-semibold" : "text-gray-700"}`}
                    >
                        <Settings size={20} />
                        <span className="font-medium">배송 템플릿 관리</span>
                    </Link>
                </div>
            </nav>

            <div className="border-t border-gray-200 p-4">
                <Link
                    href="/api/auth/logout"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50"
                >
                    <LogOut size={20} />
                    <span className="font-medium">로그아웃</span>
                </Link>
            </div>
        </aside>
    );
}
