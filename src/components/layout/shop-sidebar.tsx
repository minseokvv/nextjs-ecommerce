"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ShoppingBag,
    List,
    User,
    Package,
    LayoutDashboard,
    Headphones,
    LogIn,
    ChevronLeft,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShopSidebar({
    isOpen,
    setIsOpen,
    initialUser
}: {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    initialUser: { name?: string | null; email?: string | null; image?: string | null } | null;
}) {
    const { data: session } = useSession();
    // Use session if available, otherwise fallback to initialUser for immediate render
    const user = session?.user || initialUser;
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

    useEffect(() => {
        // Fetch Categories
        fetch("/api/categories")
            .then(res => res.json())
            .then(json => {
                setCategories(json.data || []);
            })
            .catch(err => console.error(err));

    }, []);

    return (
        <>
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col",
                    isOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-black text-white p-2 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Dbaek</span>
                    </Link>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">

                    {/* User Menu */}
                    <div className="pb-4 border-b border-gray-100 space-y-1">
                        <div className="px-2 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">나의 쇼핑</div>
                        {user ? (
                            <>
                                <div className="px-4 py-2 mb-2 bg-blue-50 rounded-xl">
                                    <p className="text-sm font-bold text-blue-900">{user.name || "회원"}님 환영합니다</p>
                                </div>
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium">
                                    <User size={18} /> 내 정보
                                </Link>
                                <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium">
                                    <Package size={18} /> 주문 조회
                                </Link>
                                <button onClick={() => import("next-auth/react").then(mod => mod.signOut())} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                                    <LogIn size={18} /> 로그아웃
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-sm font-medium">
                                <LogIn size={18} /> 로그인 / 회원가입
                            </Link>
                        )}
                    </div>

                    {/* Collapsible Categories */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                <List size={18} />
                                전체 상품 보기
                            </span>
                            {isCategoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {/* Submenu */}
                        {isCategoriesOpen && (
                            <div className="mt-1 ml-4 space-y-1 border-l border-gray-100 pl-2">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 font-medium hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    전체 보기
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/?category=${cat.id}`}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-100">
                    <Link href="/cs" className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">
                        <Headphones size={20} />
                        고객센터
                    </Link>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
