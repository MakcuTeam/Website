import { NextRequest, NextResponse } from "next/server";
import { getLocale, pathnameHasLocale } from "./lib/locale";
import { detectBrowserLocale } from "./lib/locale-server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = pathnameHasLocale(pathname);
  
  if (hasLocale) return;
  
  if (pathname.includes("favicon.ico")) {
    return;
  }

  // Detect browser language from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  const detectedLocale = detectBrowserLocale(acceptLanguage);
  
  request.nextUrl.pathname = `/${detectedLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
