import { SECTIONS_CONFIG, type SectionItem } from "./sections-config";
import type { Dictionary } from "./dictionaries";
import type { Locale } from "./locale";

export type SearchResult = {
  id: string;
  page: string;
  route: string;
  label: string;
  labelKey: string;
  fullPath: string;
  level: number;
};

/**
 * Recursively extracts all string values from a dictionary object
 */
function extractAllStrings(obj: any, results: Set<string> = new Set()): Set<string> {
  if (obj === null || obj === undefined) return results;
  
  if (typeof obj === "string" && obj.length > 2) {
    results.add(obj.toLowerCase());
    return results;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === "string" && item.length > 2) {
        results.add(item.toLowerCase());
      } else if (typeof item === "object") {
        extractAllStrings(item, results);
      }
    });
    return results;
  }
  
  if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (typeof value === "string" && value.length > 2) {
        results.add(value.toLowerCase());
      } else if (typeof value === "object") {
        extractAllStrings(value, results);
      }
    });
  }
  
  return results;
}

/**
 * Builds a searchable index from the centralized sections config.
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
      "device-control": dict.navbar.links.device_control,
      xim: dict.navbar.links.xim,
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
 * Searches in labels, full paths, and all dictionary content.
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
  
  // Extract all searchable strings from dictionary
  const allDictStrings = extractAllStrings(dict);

  const matches = index.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(lowerQuery);
    const pathMatch = item.fullPath.toLowerCase().includes(lowerQuery);
    const keyMatch = item.labelKey.toLowerCase().includes(lowerQuery);
    
    // Check if query matches any dictionary content related to this section
    const sectionDict = getSectionDict(dict, item.labelKey);
    const sectionStrings = extractAllStrings(sectionDict);
    const contentMatch = Array.from(sectionStrings).some(str => str.includes(lowerQuery));
    
    // Also check if query appears in any dictionary string
    const globalMatch = Array.from(allDictStrings).some(str => str.includes(lowerQuery));
    
    return labelMatch || pathMatch || keyMatch || contentMatch || (globalMatch && item.level === 0);
  });

  // Sort by relevance
  matches.sort((a, b) => {
    const aExact = a.label.toLowerCase() === lowerQuery;
    const bExact = b.label.toLowerCase() === lowerQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const aStarts = a.label.toLowerCase().startsWith(lowerQuery);
    const bStarts = b.label.toLowerCase().startsWith(lowerQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return a.level - b.level;
  });

  return matches.slice(0, maxResults);
}

function getSectionDict(dict: Dictionary, labelKey: string): any {
  const keys = labelKey.split(".");
  let value: any = dict;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return {};
  }
  return value || {};
}
