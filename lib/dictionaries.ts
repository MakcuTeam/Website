import { Locale } from "./locale";
import { getLocales } from "./locale-server";
import { cache } from "react";

export type LangProps = { params: Promise<{ lang: Locale }> };

// Dynamically create dictionary loaders based on available locales
function createDictionaryLoaders() {
  try {
    const locales = getLocales();
    const loaders: Record<string, () => Promise<any>> = {};

    for (const locale of locales) {
      loaders[locale] = () =>
        import(`@/langs/${locale}.dict.json`).then((module) => module.default);
    }

    return loaders;
  } catch (error) {
    console.error("Error creating dictionary loaders:", error);
    // Fallback to default locales
    return {
      en: () => import(`@/langs/en.dict.json`).then((module) => module.default),
      cn: () => import(`@/langs/cn.dict.json`).then((module) => module.default),
    };
  }
}

// Get dictionary loaders (cached)
const getDictionaryLoaders = cache(() => createDictionaryLoaders());

const getDictionaryUncached = async (locale: Locale) => {
  const loaders = getDictionaryLoaders();
  const loader = loaders[locale];
  
  if (!loader) {
    // Fallback to first locale if locale not found
    const locales = getLocales();
    const fallbackLoader = loaders[locales[0]];
    return fallbackLoader();
  }
  
  return loader();
};

export const getDictionary = cache(getDictionaryUncached);

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
