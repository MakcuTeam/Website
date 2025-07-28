import { Locale } from "./locale";
import { cache } from "react";
export type LangProps = { params: Promise<{ lang: Locale }> };

export const dictionaries = {
    en: () => import("@/dictionaries/en.json").then((module) => module.default),
    cn: () => import("@/dictionaries/cn.json").then((module) => module.default),
};


const getDictionaryUncached = async (locale: Locale) => dictionaries[locale]();

export const getDictionary = cache(getDictionaryUncached);

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
