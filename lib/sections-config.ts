import type { Locale } from "./locale";

export type SectionItem = {
  id: string;
  labelKey: string; // Translation key for the label
  children?: SectionItem[];
};

export type PageSections = {
  page: string;
  route: string;
  sections: SectionItem[];
};

/**
 * Centralized configuration for all page sections and subsections.
 * This is the single source of truth for navigation structure.
 * 
 * Main page will show ALL sections from ALL pages.
 * Individual pages will show only their own sections.
 */
export const SECTIONS_CONFIG: PageSections[] = [
  {
    page: "setup",
    route: "/setup",
    sections: [
      {
        id: "install-driver",
        labelKey: "setup.sections.install_driver.title",
      },
      {
        id: "flash-makcu",
        labelKey: "setup.sections.flash_makcu.title",
        children: [
          {
            id: "flashing-process",
            labelKey: "setup.sections.flash_makcu.flashing_process.title",
          },
          {
            id: "baud-rate",
            labelKey: "setup.sections.flash_makcu.baud_rate.title",
          },
          {
            id: "power-requirements",
            labelKey: "setup.sections.flash_makcu.power_requirements.title",
          },
        ],
      },
      // These sections will be moved from troubleshooting page
      {
        id: "flash-vs-normal-mode",
        labelKey: "troubleshooting.flash_vs_normal_mode.title",
        children: [
          {
            id: "makcu-structure",
            labelKey: "troubleshooting.flash_vs_normal_mode.makcu_structure.title",
          },
          {
            id: "flash-mode",
            labelKey: "troubleshooting.flash_vs_normal_mode.flash_mode.title",
          },
          {
            id: "normal-mode",
            labelKey: "troubleshooting.flash_vs_normal_mode.normal_mode.title",
          },
          {
            id: "power-requirements-mode",
            labelKey: "troubleshooting.flash_vs_normal_mode.power_requirements.title",
          },
        ],
      },
      {
        id: "connection-status",
        labelKey: "troubleshooting.connection_status.title",
        children: [
          {
            id: "connection-status-overview",
            labelKey: "troubleshooting.connection_status.overview",
          },
        ],
      },
      {
        id: "prerequisites",
        labelKey: "troubleshooting.prerequisites.title",
      },
    ],
  },
  {
    page: "troubleshooting",
    route: "/troubleshooting",
    sections: [
      {
        id: "led-guide",
        labelKey: "troubleshooting.led_guide.title",
        children: [
          {
            id: "left-side",
            labelKey: "troubleshooting.led_guide.left_side.title",
          },
          {
            id: "right-side",
            labelKey: "troubleshooting.led_guide.right_side.title",
          },
        ],
      },
      {
        id: "troubleshooting-steps",
        labelKey: "troubleshooting.troubleshooting_steps.title",
        children: [
          {
            id: "both-fast",
            labelKey: "troubleshooting.troubleshooting_steps.both_fast.title",
          },
          {
            id: "left-fast",
            labelKey: "troubleshooting.troubleshooting_steps.left_fast.title",
          },
          {
            id: "right-fast",
            labelKey: "troubleshooting.troubleshooting_steps.right_fast.title",
          },
          {
            id: "slow-persists",
            labelKey: "troubleshooting.troubleshooting_steps.slow_persists.title",
          },
          {
            id: "led-not-responding",
            labelKey: "troubleshooting.troubleshooting_steps.led_not_responding.title",
          },
          {
            id: "device-not-working",
            labelKey: "troubleshooting.troubleshooting_steps.device_not_working.title",
          },
          {
            id: "baud-rate-mismatch",
            labelKey: "troubleshooting.troubleshooting_steps.baud_rate_mismatch.title",
          },
        ],
      },
      {
        id: "quick-reference",
        labelKey: "troubleshooting.quick_reference.title",
      },
      {
        id: "still-issues",
        labelKey: "troubleshooting.still_issues.title",
      },
    ],
  },
];

/**
 * Get sections for a specific page
 */
export function getSectionsForPage(page: string): SectionItem[] {
  const pageConfig = SECTIONS_CONFIG.find((config) => config.page === page);
  return pageConfig?.sections || [];
}

/**
 * Get all sections from all pages (for main page sidebar)
 */
export function getAllSections(): PageSections[] {
  return SECTIONS_CONFIG;
}

/**
 * Get a section by ID across all pages
 */
export function getSectionById(sectionId: string): {
  section: SectionItem;
  page: string;
  route: string;
} | null {
  for (const pageConfig of SECTIONS_CONFIG) {
    const findSection = (
      items: SectionItem[],
      id: string
    ): SectionItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findSection(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const section = findSection(pageConfig.sections, sectionId);
    if (section) {
      return {
        section,
        page: pageConfig.page,
        route: pageConfig.route,
      };
    }
  }
  return null;
}

