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
      xim: dict.navbar.links.xim,
      information: dict.navbar.links.information,
    };
    return pageTitles[page] || page;
  };

  return (
    <aside>
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-4">
            {isCn ? "所有章节" : "All Sections"}
          </div>
          <nav className="space-y-4 text-sm">
            {allPages.map((pageConfig) => {
              const pageKey = pageConfig.page;

              return (
                <div key={pageKey} className="space-y-2">
                  <Link
                    href={`/${lang}${pageConfig.route}`}
                    className="font-medium text-foreground/80 transition hover:text-foreground block"
                  >
                    {getPageTitle(pageKey)}
                  </Link>
                  <div className="space-y-2 pl-4 border-l border-border/60">
                    {pageConfig.sections
                      .filter((section) => {
                        // Filter out device-information from settings page on main page sidebar
                        if (pageKey === "settings" && section.id === "device-information") {
                          return false;
                        }
                        return true;
                      })
                      .map((section) => (
                        <Link
                          key={section.id}
                          href={`/${lang}${pageConfig.route}#${section.id}`}
                          className="block text-xs text-muted-foreground transition hover:text-foreground"
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
