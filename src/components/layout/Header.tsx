"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <Container>
                <div className="flex h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6 text-indigo-600" />
                        <span className="text-xl font-bold text-slate-900">Dbaek</span>
                    </Link>
                </div>
            </Container>
        </header>
    );
}
