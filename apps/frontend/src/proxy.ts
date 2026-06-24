import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "session_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/perfil");
  const isAuthRoute = pathname.startsWith("/auth");
  const isOAuthCallback = pathname.startsWith("/auth/callback");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isAuthRoute && !isOAuthCallback && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
