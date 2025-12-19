import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Check for Lucia auth session cookie
  const sessionCookie = req.cookies.get("auth_session");
  const isAuth = !!sessionCookie;
  
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register") || 
                     req.nextUrl.pathname.startsWith("/auth");

  // Allow auth pages and auth API routes to pass through
  if (isAuthPage || req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // For protected routes, check if authenticated
  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/auth/v2/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // For admin routes, we'll check role in the layout (can't access user data in Edge Runtime easily)
  // The admin layout will handle role-based redirects

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/onboarding", "/auth/:path*"],
};

