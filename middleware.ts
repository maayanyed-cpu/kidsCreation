import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isAuthenticated = !!session?.user;

  // Public paths — no auth needed
  const isPublicPath =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/auth/") ||
    nextUrl.pathname.startsWith("/api/auth/");

  if (!isAuthenticated && !isPublicPath) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to onboarding if not complete
  if (
    isAuthenticated &&
    !session.user.onboarding_complete &&
    !nextUrl.pathname.startsWith("/onboarding") &&
    !nextUrl.pathname.startsWith("/auth/") &&
    !nextUrl.pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
