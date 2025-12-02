import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { LanguageConfig } from "./locale";

// Default languages (used as fallback)
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

// Cache for language configs (server-side only)
let languageConfigsCache: Map<string, LanguageConfig> | null = null;
let localesCache: readonly string[] | null = null;

// Get all language configurations (server-side only)
export function getLanguageConfigs(): Map<string, LanguageConfig> {
  if (languageConfigsCache) {
    return languageConfigsCache;
  }

  const configs = new Map<string, LanguageConfig>();
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

// Get all available locale codes (server-side only)
export function getLocales(): readonly string[] {
  if (localesCache) {
    return localesCache;
  }

  const configs = getLanguageConfigs();
  const codes = Array.from(configs.keys()).sort();
  localesCache = codes as readonly string[];
  return localesCache;
}

// Get language configuration for a locale (server-side only)
export function getLanguageConfig(locale: string): LanguageConfig | undefined {
  const configs = getLanguageConfigs();
  return configs.get(locale);
}

// Get all language configurations (server-side only)
export function getAllLanguageConfigs(): LanguageConfig[] {
  const configs = getLanguageConfigs();
  return Array.from(configs.values()).sort((a, b) => a.code.localeCompare(b.code));
}

// Detect browser language from Accept-Language header (server-side only)
export function detectBrowserLocale(acceptLanguage: string | null): string {
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
    if (locales.includes(code)) {
      return code;
    }

    // Check browser codes in configs
    for (const [localeCode, config] of configs.entries()) {
      if (config.browserCodes.some((bc) => bc.toLowerCase() === code || code.startsWith(bc.toLowerCase() + "-"))) {
        return localeCode;
      }
    }

    // Check language prefix (e.g., "zh" matches "cn")
    const langPrefix = code.split("-")[0];
    for (const [localeCode, config] of configs.entries()) {
      if (config.browserCodes.some((bc) => bc.toLowerCase().startsWith(langPrefix))) {
        return localeCode;
      }
    }
  }

  // Default to first locale
  return locales[0];
}
