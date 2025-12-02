import { Locale, getLocales } from "./locale";
import { cache } from "react";

export type LangProps = { params: Promise<{ lang: Locale }> };

// Dynamically create dictionary loaders based on available locales
function createDictionaryLoaders() {
  const locales = getLocales();
  const loaders: Record<string, () => Promise<any>> = {};

  for (const locale of locales) {
    loaders[locale] = () =>
      import(`@/langs/${locale}.dict.json`).then((module) => module.default);
  }

  return loaders;
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
