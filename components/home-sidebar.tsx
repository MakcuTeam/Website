"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getAllSections } from "@/lib/sections-config";
import { Dictionary } from "@/lib/dictionaries";

type HomeSidebarProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Main page sidebar component.
 * Shows ALL sections from ALL pages (master index).
 * Shows 2 levels: page titles and first-level sections (expanded by default).
 */
export default function HomeSidebar({ lang, dict }: HomeSidebarProps) {
  const allPages = getAllSections();
  const isCn = lang === "cn";

  const getLabel = (labelKey: string): string => {
    // Navigate through the dictionary using the key path
    const keys = labelKey.split(".");
    let value: any = dict;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        // Try to provide a human-readable fallback
        const lastKey = keys[keys.length - 1];
        if (lastKey.includes("_")) {
          // Convert snake_case to Title Case as fallback
          return lastKey
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
        return lastKey.charAt(0).toUpperCase() + lastKey.slice(1);
    }
      value = value[key];
    }
    
    if (value === undefined || value === null || typeof value !== "string") {
      // Try to provide a human-readable fallback
      const lastKey = keys[keys.length - 1];
      if (lastKey.includes("_")) {
        // Convert snake_case to Title Case as fallback
        return lastKey
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
      return lastKey.charAt(0).toUpperCase() + lastKey.slice(1);
    }
    
    return value;
  };

  const getPageTitle = (page: string): string => {
    const pageTitles: Record<string, string> = {
      setup: dict.navbar.links.setup,
      troubleshooting: dict.navbar.links.troubleshooting,
      api: dict.navbar.links.api,
      firmware: dict.navbar.links.makcu_tools,
      "device-control": dict.navbar.links.device_control,
      xim: dict.navbar.links.xim,
      information: dict.navbar.links.information,
    };
    return pageTitles[page] || page;
  };

  return (
    <aside>
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-5">
          <nav className="space-y-4 text-sm">
            {allPages.map((pageConfig) => {
              const pageKey = pageConfig.page;

              return (
                <div key={pageKey} className="space-y-2">
                  <Link
                    href={`/${lang}${pageConfig.route}`}
                    className="font-medium text-black dark:text-white transition hover:underline cursor-pointer block"
                  >
                    {getPageTitle(pageKey)}
                  </Link>
                  <div className="space-y-2 pl-4 border-l border-border/60">
                    {pageConfig.sections.map((section) => (
                      <Link
                        key={section.id}
                        href={`/${lang}${pageConfig.route}#${section.id}`}
                        className="block text-xs text-muted-foreground transition hover:text-black dark:hover:text-white"
                      >
                        {getLabel(section.labelKey)}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}
