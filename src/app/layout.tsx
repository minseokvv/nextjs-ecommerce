import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Keep correct import
import "./globals.css";
import { Providers } from "@/components/providers"; // Correct absolute import

import { Footer } from "@/components/layout/Footer"; // Correct import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dbaek",
    description: "프리미엄 쇼핑 경험, Dbaek",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="flex min-h-screen flex-col">

                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
