import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ShopLayoutClient from "@/components/layout/shop-layout-client";

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    // Explicitly shape the user object to match ShopLayoutClient's expected type
    const user = session?.user ? {
        name: session.user.name || null,
        email: session.user.email || null,
        username: null // session.user might not have username unless customized, so default to null or extend type
    } : null;

    return (
        <ShopLayoutClient user={user}>
            {children}
        </ShopLayoutClient>
    );
}
