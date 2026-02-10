"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import ShopSidebar from "@/components/layout/shop-sidebar";
import SearchBar from "@/components/ui/search-bar";
import TopBanner from "@/components/ui/top-banner";
import CustomerCenterDropdown from "@/components/ui/customer-center-dropdown";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartContext";

export default function ShopLayoutClient({
    children,
    user
}: {
    children: React.ReactNode;
    user: { name?: string | null; email?: string | null; image?: string | null; username?: string | null } | null;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const isLoggedIn = !!user;
    const { itemCount } = useCart();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Rolling Banner */}
            <TopBanner />

            <div className="flex flex-1 relative">
                <ShopSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} initialUser={user} />

                {/* Mobile Header (visible only on small screens) */}
                <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-100 px-4 py-3 flex items-center justify-between mt-[32px]">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="font-bold text-lg">Dbaek</Link>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                {/* Main Content Area */}
                <main
                    className={cn(
                        "flex-1 w-full transition-all duration-300",
                        isSidebarOpen ? "lg:ml-[260px]" : "lg:ml-0"
                    )}
                >
                    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 w-full max-w-2xl">
                            {/* Desktop Toggle Button */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                            >
                                <Menu size={20} />
                            </button>

                            {/* Search Bar Component */}
                            <div className="flex-1">
                                <SearchBar />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {isLoggedIn ? (
                                <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1">
                                    <User size={16} />
                                    마이페이지
                                </Link>
                            ) : (
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black">로그인</Link>
                            )}

                            <Link href="/cart" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                                장바구니 ({itemCount})
                            </Link>
                            <CustomerCenterDropdown />
                        </div>
                    </header>

                    <div className="p-6 max-w-7xl mx-auto mt-[60px] lg:mt-0">
                        {children}
                    </div>

                    <footer className="mt-auto border-t border-gray-100 bg-white py-12 px-6">
                        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
                            © 2024 Dbaek. All rights reserved.
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
