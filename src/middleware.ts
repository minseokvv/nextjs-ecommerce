import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const isAdminPath = req.nextUrl.pathname.startsWith("/admin") ||
                           req.nextUrl.pathname.startsWith("/api/admin");

        if (isAdminPath && req.nextauth.token?.role !== "ADMIN") {
            if (req.nextUrl.pathname.startsWith("/api/")) {
                // Return 401 for API routes
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            // Redirect for page routes
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*", "/cart", "/orders", "/profile"],
};
