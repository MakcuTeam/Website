import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Language configuration type
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  browserCodes: string[];
}

// Default languages (used as fallback and for client-side)
const DEFAULT_LANGUAGES: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    browserCodes: ["en", "en-US", "en-GB", "en-AU", "en-CA"],
  },
  {
    code: "cn",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    browserCodes: ["zh", "zh-CN", "zh-TW", "zh-HK", "cn"],
  },
];

// Cache for language configs
let languageConfigsCache: Map<string, LanguageConfig> | null = null;
let localesCache: readonly string[] | null = null;

// Check if we're in a server environment
function isServer(): boolean {
  return typeof window === "undefined";
}

// Get all language configurations
function getLanguageConfigs(): Map<string, LanguageConfig> {
  if (languageConfigsCache) {
    return languageConfigsCache;
  }

  const configs = new Map<string, LanguageConfig>();

  // On client side, use default languages
  if (!isServer()) {
    for (const config of DEFAULT_LANGUAGES) {
      configs.set(config.code, config);
    }
    languageConfigsCache = configs;
    return configs;
  }

  // On server side, load from filesystem
  const langsDir = join(process.cwd(), "langs");

  try {
    const files = readdirSync(langsDir);
    for (const file of files) {
      if (file.endsWith(".json") && !file.endsWith(".dict.json")) {
        const filePath = join(langsDir, file);
        const content = readFileSync(filePath, "utf-8");
        const config: LanguageConfig = JSON.parse(content);
        configs.set(config.code, config);
      }
    }
  } catch (error) {
    console.error("Error loading language configs:", error);
    // Fallback to default languages
    for (const config of DEFAULT_LANGUAGES) {
      configs.set(config.code, config);
    }
  }

  languageConfigsCache = configs;
  return configs;
}

// Get all available locale codes
export function getLocales(): readonly string[] {
  if (localesCache) {
    return localesCache;
  }

  const configs = getLanguageConfigs();
  const codes = Array.from(configs.keys()).sort();
  localesCache = codes as readonly string[];
  return localesCache;
}

// Get language configuration for a locale
export function getLanguageConfig(locale: string): LanguageConfig | undefined {
  const configs = getLanguageConfigs();
  return configs.get(locale);
}

// Get all language configurations
export function getAllLanguageConfigs(): LanguageConfig[] {
  const configs = getLanguageConfigs();
  return Array.from(configs.values()).sort((a, b) => a.code.localeCompare(b.code));
}

// Type for locale
export type Locale = typeof DEFAULT_LANGUAGES[number]["code"] | string;

// Get locale from pathname
export function getLocale(pathname: string): Locale {
  const locales = getLocales();
  const [locale] = pathname.split("/").filter(Boolean);
  return locales.includes(locale as Locale) ? (locale as Locale) : locales[0];
}

// Check if pathname has a locale
export function pathnameHasLocale(pathname: string): boolean {
  const locales = getLocales();
  return locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
}

// Detect browser language from Accept-Language header
export function detectBrowserLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return getLocales()[0];
  }

  const locales = getLocales();
  const configs = getLanguageConfigs();
  
  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,zh-CN;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q = "q=1"] = lang.trim().split(";");
      const quality = parseFloat(q.replace("q=", "")) || 1;
      return { code: code.toLowerCase().trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Try to match browser language codes with our language configs
  for (const { code } of languages) {
    // Direct match
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }

    // Check browser codes in configs
    for (const [localeCode, config] of configs.entries()) {
      if (config.browserCodes.some((bc) => bc.toLowerCase() === code || code.startsWith(bc.toLowerCase() + "-"))) {
        return localeCode as Locale;
      }
    }

    // Check language prefix (e.g., "zh" matches "cn")
    const langPrefix = code.split("-")[0];
    for (const [localeCode, config] of configs.entries()) {
      if (config.browserCodes.some((bc) => bc.toLowerCase().startsWith(langPrefix))) {
        return localeCode as Locale;
      }
    }
  }

  // Default to first locale
  return locales[0];
}

// Get next locale in cycle
export function getNextLocale(currentLocale: Locale): Locale {
  const locales = getLocales();
  const currentIndex = locales.indexOf(currentLocale);
  const nextIndex = (currentIndex + 1) % locales.length;
  return locales[nextIndex];
}
