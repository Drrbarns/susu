import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "juli_token";

const PUBLIC_ROUTES = ["/", "/how-it-works", "/plans", "/faqs", "/contact", "/blog", "/testimonials", "/terms", "/privacy", "/group-rules"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/verify-otp"];
const ADMIN_ROLES = ["admin", "super_admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Let public routes through
  if (PUBLIC_ROUTES.some((route) => pathname === route) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect /app/* routes
  if (pathname.startsWith("/app")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // We do a basic cookie check here. Full role checking happens client-side
    // because we'd need to decode the JWT which adds latency.
    // The admin layout component does the proper role check.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
