import { NextRequest, NextResponse } from "next/server";
import { pathnameHasLocale } from "./lib/locale";

// Supported locales (hardcoded for Edge runtime compatibility)
const SUPPORTED_LOCALES = ["en", "cn"] as const;
const DEFAULT_LOCALE = "en";

// Simple browser locale detection for Edge runtime (no file system operations)
function detectBrowserLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,zh-CN;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q = "q=1"] = lang.trim().split(";");
      const quality = parseFloat(q.replace("q=", "")) || 1;
      return { code: code.toLowerCase().trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Try to match browser language codes with supported locales
  for (const { code } of languages) {
    // Direct match
    if (SUPPORTED_LOCALES.includes(code as typeof SUPPORTED_LOCALES[number])) {
      return code;
    }

    // Check for Chinese variants (zh, zh-CN, zh-TW, zh-HK)
    if (code.startsWith("zh") || code === "cn") {
      return "cn";
    }

    // Check for English variants (en, en-US, en-GB, etc.)
    if (code.startsWith("en")) {
      return "en";
    }
  }

  // Default to English
  return DEFAULT_LOCALE;
}

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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
