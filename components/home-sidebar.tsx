"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getAllSections, type SectionItem } from "@/lib/sections-config";
import { Dictionary } from "@/lib/dictionaries";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeSidebarProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Main page sidebar component.
 * Shows ALL sections from ALL pages (master index).
 * Initially shows only page titles, expands sections on hover.
 */
export default function HomeSidebar({ lang, dict }: HomeSidebarProps) {
  const allPages = getAllSections();
  const isCn = lang === "cn";
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);

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
              const isPageHovered = hoveredPage === pageKey;

              return (
                <div
                  key={pageKey}
                  className="relative"
                  onMouseEnter={() => setHoveredPage(pageKey)}
                  onMouseLeave={() => setHoveredPage(null)}
                >
                  <Link
                    href={`/${lang}${pageConfig.route}`}
                    className="flex items-center gap-1.5 font-medium text-foreground/80 transition hover:text-foreground"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isPageHovered ? "rotate-90" : ""
                      )}
                    />
                    <span>{getPageTitle(pageKey)}</span>
                  </Link>
                  {isPageHovered && (
                    <div className="space-y-2 pl-4 mt-2 border-l border-border/60">
                      {pageConfig.sections.map((section) => (
                        <div key={section.id} className="space-y-2">
                          <Link
                            href={`/${lang}${pageConfig.route}#${section.id}`}
                            className="font-medium text-foreground/80 transition hover:text-foreground"
                          >
                            {getLabel(section.labelKey)}
                          </Link>
                          {section.children && section.children.length > 0 && (
                            <ul className="space-y-1 border-l border-border/60 pl-3 text-xs text-muted-foreground">
                              {section.children.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/${lang}${pageConfig.route}#${child.id}`}
                                    className="transition hover:text-foreground"
                                  >
                                    {getLabel(child.labelKey)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

