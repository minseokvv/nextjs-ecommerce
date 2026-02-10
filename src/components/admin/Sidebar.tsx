"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    List,
    MessageCircle,
    Star,
    Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
    {
        label: "대시보드",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        color: "text-sky-500",
    },
    {
        label: "상품 관리",
        icon: Package,
        href: "/admin/products",
        color: "text-violet-500",
    },
    {
        label: "주문 관리",
        icon: ShoppingCart,
        href: "/admin/orders",
        color: "text-pink-700",
    },
    {
        label: "회원 관리",
        icon: Users,
        href: "/admin/users",
        color: "text-orange-700",
    },
    {
        label: "카테고리 관리",
        icon: List,
        href: "/admin/categories",
        color: "text-emerald-500",
    },
    {
        label: "문의 관리",
        icon: MessageCircle,
        href: "/admin/inquiries",
        color: "text-amber-500",
    },
    {
        label: "리뷰 관리",
        icon: Star,
        href: "/admin/reviews",
        color: "text-yellow-500",
    },
    {
        label: "배너 관리",
        icon: Image,
        href: "/admin/banners",
        color: "text-cyan-500",
    },
    {
        label: "설정",
        icon: Settings,
        href: "/admin/settings",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/admin/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">관리자 패널</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname.startsWith(route.href) ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
