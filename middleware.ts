import { NextResponse } from "next/server";

// Testing phase: skip all auth checks
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
