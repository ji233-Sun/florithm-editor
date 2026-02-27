import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getIronSession<SessionData>(
    request,
    NextResponse.next(),
    sessionOptions
  );
  const isLoggedIn = !!session.userId;

  // Auth pages: redirect logged-in users to home
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected pages: redirect guests to login
  if (!isLoggedIn && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth/* (auth endpoints must be accessible)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files
     * - data/* (static config/image files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|data/).*)",
  ],
};
