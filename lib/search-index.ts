import { SECTIONS_CONFIG, type SectionItem } from "./sections-config";
import type { Dictionary } from "./dictionaries";
import type { Locale } from "./locale";

export type SearchResult = {
  id: string;
  page: string;
  route: string;
  label: string;
  labelKey: string;
  fullPath: string; // e.g., "Setup > Install CH343 Driver"
  level: number; // 0 for section, 1 for subsection, etc.
};

/**
 * Builds a searchable index from the centralized sections config.
 * Includes page titles, section labels, and dictionary translations.
 */
export function buildSearchIndex(dict: Dictionary, lang: Locale): SearchResult[] {
  const results: SearchResult[] = [];

  const getLabel = (labelKey: string): string => {
    const keys = labelKey.split(".");
    let value: any = dict;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return labelKey;
    }
    return typeof value === "string" ? value : labelKey;
  };

  const getPageTitle = (page: string): string => {
    const pageTitles: Record<string, string> = {
      setup: dict.navbar.links.setup,
      troubleshooting: dict.navbar.links.troubleshooting,
      api: dict.navbar.links.api,
      firmware: dict.navbar.links.makcu_tools,
      settings: dict.navbar.links.settings,
    };
    return pageTitles[page] || page;
  };

  const processSection = (
    section: SectionItem,
    page: string,
    route: string,
    level: number = 0,
    parentPath: string = ""
  ) => {
    const label = getLabel(section.labelKey);
    const pageTitle = getPageTitle(page);
    const fullPath = parentPath
      ? `${pageTitle} > ${parentPath} > ${label}`
      : `${pageTitle} > ${label}`;

    results.push({
      id: section.id,
      page,
      route,
      label,
      labelKey: section.labelKey,
      fullPath,
      level,
    });

    if (section.children) {
      section.children.forEach((child) => {
        processSection(
          child,
          page,
          route,
          level + 1,
          parentPath ? `${parentPath} > ${label}` : label
        );
      });
    }
  };

  SECTIONS_CONFIG.forEach((pageConfig) => {
    pageConfig.sections.forEach((section) => {
      processSection(section, pageConfig.page, pageConfig.route);
    });
  });

  return results;
}

/**
 * Search the index for matching results.
 * Searches in labels and full paths.
 */
export function searchIndex(
  query: string,
  dict: Dictionary,
  lang: Locale,
  maxResults: number = 10
): SearchResult[] {
  if (!query.trim()) return [];

  const index = buildSearchIndex(dict, lang);
  const lowerQuery = query.toLowerCase().trim();

  const matches = index.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(lowerQuery);
    const pathMatch = item.fullPath.toLowerCase().includes(lowerQuery);
    const keyMatch = item.labelKey.toLowerCase().includes(lowerQuery);
    return labelMatch || pathMatch || keyMatch;
  });

  // Sort by relevance: exact matches first, then by position in path
  matches.sort((a, b) => {
    const aExact = a.label.toLowerCase() === lowerQuery;
    const bExact = b.label.toLowerCase() === lowerQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const aStarts = a.label.toLowerCase().startsWith(lowerQuery);
    const bStarts = b.label.toLowerCase().startsWith(lowerQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return a.level - b.level; // Prefer top-level sections
  });

  return matches.slice(0, maxResults);
}

