"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import type { SectionItem } from "@/lib/sections-config";
import { Dictionary } from "@/lib/dictionaries";

type PageSidebarProps = {
  sections: SectionItem[];
  currentPage: string;
  lang: Locale;
  dict: Dictionary;
};

/**
 * Reusable sidebar component for individual pages.
 * Shows sections filtered for the current page.
 */
export default function PageSidebar({
  sections,
  currentPage,
  lang,
  dict,
}: PageSidebarProps) {
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

  const renderSection = (section: SectionItem, level: number = 0) => {
    const label = getLabel(section.labelKey);
    const href = `/${lang}${currentPage}#${section.id}`;

    return (
      <div key={section.id} className={level > 0 ? "mt-2" : ""}>
        <Link
          href={href}
          className={`block transition hover:text-foreground ${
            level === 0
              ? "font-medium text-foreground/80"
              : "text-xs text-muted-foreground"
          }`}
        >
          {label}
        </Link>
        {section.children && section.children.length > 0 && (
          <ul
            className={`space-y-1 border-l border-border/60 pl-3 ${
              level === 0 ? "mt-2" : "mt-1"
            }`}
          >
            {section.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/${lang}${currentPage}#${child.id}`}
                  className="block text-xs text-muted-foreground transition hover:text-foreground"
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

  const isCn = lang === "cn";

  return (
    <aside>
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {isCn ? "目录" : "Contents"}
          </div>
          <nav className="mt-4 space-y-3 text-sm">
            {sections.map((section) => renderSection(section))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

