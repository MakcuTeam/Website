"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getAllSections, type SectionItem } from "@/lib/sections-config";
import { Dictionary } from "@/lib/dictionaries";
import { NavMenu } from "./navbar";
import { ChevronRight } from "lucide-react";

type HomeSidebarProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Main page sidebar component.
 * Shows ALL sections from ALL pages (master index).
 * Includes top navigation links at the top.
 */
export default function HomeSidebar({ lang, dict }: HomeSidebarProps) {
  const allPages = getAllSections();
  const isCn = lang === "cn";

  const getLabel = (labelKey: string): string => {
    // Navigate through the dictionary using the key path
    const keys = labelKey.split(".");
    let value: any = dict;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return labelKey; // Fallback to key if not found
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

  const [hoveredSections, setHoveredSections] = useState<Set<string>>(new Set());

  const renderSection = (section: SectionItem, pageRoute: string, level: number = 0) => {
    const label = getLabel(section.labelKey);
    const href = `/${lang}${pageRoute}#${section.id}`;
    const hasChildren = section.children && section.children.length > 0;
    const sectionKey = `${pageRoute}-${section.id}`;
    const isHovered = hoveredSections.has(sectionKey);

    return (
      <div
        key={section.id}
        className={level > 0 ? "mt-2" : ""}
        onMouseEnter={() => hasChildren && setHoveredSections((prev) => new Set(prev).add(sectionKey))}
        onMouseLeave={() => setHoveredSections((prev) => {
          const next = new Set(prev);
          next.delete(sectionKey);
          return next;
        })}
      >
        <Link
          href={href}
          className={`flex items-center gap-1.5 transition hover:text-foreground ${
            level === 0
              ? "font-medium text-foreground/80 text-sm"
              : "text-xs text-muted-foreground"
          }`}
        >
          {hasChildren && (
            <ChevronRight
              className={`h-3 w-3 transition-transform ${
                isHovered ? "rotate-90" : ""
              }`}
            />
          )}
          <span>{label}</span>
        </Link>
        {hasChildren && isHovered && (
          <ul className="space-y-1.5 border-l border-border/60 pl-4 mt-2 ml-1.5">
            {section.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/${lang}${pageRoute}#${child.id}`}
                  className="block text-xs text-muted-foreground transition hover:text-foreground py-1"
                >
                  {getLabel(child.labelKey)}
                </Link>
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
          {/* Top Navigation Links */}
          <div className="mb-6 pb-4 border-b border-border/60">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-3">
              {isCn ? "导航" : "Navigation"}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <NavMenu isSheet={false} dict={dict} />
            </div>
          </div>

          {/* All Sections from All Pages */}
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-4">
            {isCn ? "所有章节" : "All Sections"}
          </div>
          <nav className="space-y-6 text-sm">
            {allPages.map((pageConfig) => (
              <div key={pageConfig.page} className="space-y-3">
                <div className="font-semibold text-foreground/90 text-base">
                  {getPageTitle(pageConfig.page)}
                </div>
                <div className="space-y-2 pl-2">
                  {pageConfig.sections.map((section) =>
                    renderSection(section, pageConfig.route)
                  )}
                </div>
              </div>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

