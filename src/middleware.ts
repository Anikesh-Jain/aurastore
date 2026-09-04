import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin-only route guard
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/?error=unauthorized_admin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "default_development_secret_32_chars_long_minimum",
    pages: {
      signIn: "/auth/signin",
      error: "/auth/signin",
    },
    cookies: {
      sessionToken: {
        name:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
      },
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public routes that don't need auth
        if (
          pathname === "/" ||
          pathname.startsWith("/products") ||
          pathname.startsWith("/categories") ||
          pathname.startsWith("/cart") ||
          pathname.startsWith("/wishlist") ||
          pathname.startsWith("/auth") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/webhooks")
        ) {
          return true;
        }

        // Protected routes (admin, checkout, profile, orders) require a valid session token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};

