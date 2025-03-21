import { NextRequest, NextResponse } from "next/server";
import { getLocale, pathnameHasLocale } from "./lib/locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = pathnameHasLocale(pathname);
  if (hasLocale) return;
  if (pathname.includes("favicon.ico")) {
    return;
  }
  const locale = getLocale(pathname);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
