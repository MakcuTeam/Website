// Language configuration type
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  browserCodes: string[];
}

// Default languages (used for client-side and fallback)
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

// Client-side cache (only uses default languages)
let clientLocalesCache: readonly string[] | null = null;
let clientConfigsCache: Map<string, LanguageConfig> | null = null;

// Get default language configs (client-safe)
function getDefaultLanguageConfigs(): Map<string, LanguageConfig> {
  if (clientConfigsCache) {
    return clientConfigsCache;
  }

  const configs = new Map<string, LanguageConfig>();
  for (const config of DEFAULT_LANGUAGES) {
    configs.set(config.code, config);
  }
  clientConfigsCache = configs;
  return configs;
}

// Get all available locale codes (client-safe, uses defaults)
export function getLocales(): readonly string[] {
  if (clientLocalesCache) {
    return clientLocalesCache;
  }

  const configs = getDefaultLanguageConfigs();
  const codes = Array.from(configs.keys()).sort();
  clientLocalesCache = codes as readonly string[];
  return codes;
}

// Get language configuration for a locale (client-safe)
export function getLanguageConfig(locale: string): LanguageConfig | undefined {
  const configs = getDefaultLanguageConfigs();
  return configs.get(locale);
}

// Get all language configurations (client-safe, uses defaults)
export function getAllLanguageConfigs(): LanguageConfig[] {
  const configs = getDefaultLanguageConfigs();
  return Array.from(configs.values()).sort((a, b) => a.code.localeCompare(b.code));
}

// Type for locale
export type Locale = typeof DEFAULT_LANGUAGES[number]["code"] | string;

// Get locale from pathname (client-safe)
export function getLocale(pathname: string): Locale {
  const locales = getLocales();
  const [locale] = pathname.split("/").filter(Boolean);
  return locales.includes(locale as Locale) ? (locale as Locale) : locales[0];
}

// Check if pathname has a locale (client-safe)
export function pathnameHasLocale(pathname: string): boolean {
  const locales = getLocales();
  return locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
}

// Get next locale in cycle (client-safe)
export function getNextLocale(currentLocale: Locale): Locale {
  const locales = getLocales();
  const currentIndex = locales.indexOf(currentLocale);
  const nextIndex = (currentIndex + 1) % locales.length;
  return locales[nextIndex];
}
