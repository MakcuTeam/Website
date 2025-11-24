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
  const [hoveredSections, setHoveredSections] = useState<Set<string>>(new Set());

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

  const renderSection = (
    section: SectionItem,
    pageRoute: string,
    level: number = 0,
    parentKey: string = ""
  ) => {
    const label = getLabel(section.labelKey);
    const href = `/${lang}${pageRoute}#${section.id}`;
    const hasChildren = section.children && section.children.length > 0;
    const sectionKey = `${pageRoute}-${section.id}`;
    const isHovered = hoveredSections.has(sectionKey);

    return (
      <div
        key={section.id}
        className={cn("relative", level > 0 ? "mt-2" : "")}
        onMouseEnter={() => {
          if (hasChildren) {
            setHoveredSections((prev) => new Set(prev).add(sectionKey));
          }
        }}
        onMouseLeave={() => {
          if (hasChildren) {
            setHoveredSections((prev) => {
              const next = new Set(prev);
              next.delete(sectionKey);
              return next;
            });
          }
        }}
      >
        <Link
          href={href}
          className={cn(
            "flex items-center gap-1.5 transition hover:text-foreground py-1",
            level === 0
              ? "font-medium text-foreground/80 text-sm"
              : "text-xs text-muted-foreground"
          )}
        >
          {hasChildren && (
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                isHovered ? "rotate-90" : ""
              )}
            />
          )}
          <span>{label}</span>
        </Link>
        {hasChildren && isHovered && section.children && (
          <ul className="space-y-1.5 border-l border-border/60 pl-4 mt-2 ml-1.5">
            {section.children.map((child) => (
              <li key={child.id}>
                {renderSection(child, pageRoute, level + 1, sectionKey)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
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
                    className="flex items-center gap-1.5 font-semibold text-foreground/90 text-base transition hover:text-foreground py-1"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isPageHovered ? "rotate-90" : ""
                      )}
                    />
                    <span>{getPageTitle(pageKey)}</span>
                  </Link>
                  {isPageHovered && (
                    <div className="space-y-2 pl-4 mt-2 border-l border-border/60">
                      {pageConfig.sections.map((section) =>
                        renderSection(section, pageConfig.route, 0)
                      )}
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

