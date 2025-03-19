import { Locale } from "./locale";

export type LangProps = { params: Promise<{ lang: Locale }> };

const dictionaries = {
    en: () => import("@/dictionaries/en").then((module) => module.default),
    cn: () => import("@/dictionaries/cn").then((module) => module.default),
    
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
