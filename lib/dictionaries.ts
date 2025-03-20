import { Locale } from "./locale";

export type LangProps = { params: Promise<{ lang: Locale }> };

export const dictionaries = {
    en: () => import("@/dictionaries/en.json").then((module) => module.default),
    cn: () => import("@/dictionaries/cn.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
