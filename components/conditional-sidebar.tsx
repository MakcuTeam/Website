"use client";

import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import PageSidebar from "./page-sidebar";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/dictionaries";
import type { SectionItem } from "@/lib/sections-config";

type ConditionalSidebarProps = {
  sections: SectionItem[];
  currentPage: string;
  lang: Locale;
  dict: Dictionary;
};

export function ConditionalSidebar({
  sections,
  currentPage,
  lang,
  dict,
}: ConditionalSidebarProps) {
  const { status } = useMakcuConnection();
  
  // Hide sidebar when disconnected or in fault state
  // Only show when connected (regardless of mode)
  if (status === "disconnected" || status === "fault") {
    return null;
  }

  return (
    <PageSidebar
      sections={sections}
      currentPage={currentPage}
      lang={lang}
      dict={dict}
    />
  );
}

