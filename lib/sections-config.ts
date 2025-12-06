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
// Helper function to sort pages alphabetically
const sortPagesAlphabetically = (pages: PageSections[]): PageSections[] => {
  const pageOrder: Record<string, number> = {
    api: 0,
    information: 1,
    setup: 2,
    "device-control": 3,
    troubleshooting: 4,
    xim: 5,
  };
  return pages.sort((a, b) => {
    const aOrder = pageOrder[a.page] ?? 999;
    const bOrder = pageOrder[b.page] ?? 999;
    return aOrder - bOrder;
  });
};

export const SECTIONS_CONFIG: PageSections[] = sortPagesAlphabetically([
  {
    page: "api",
    route: "/api",
    sections: [
      {
        id: "transport",
        labelKey: "api.sections.legacy",
      },
      {
        id: "binary-protocol-format",
        labelKey: "api.sections.binary",
      },
    ],
  },
  {
    page: "information",
    route: "/information",
    sections: [
      {
        id: "what-is-makcu",
        labelKey: "information.what_is_makcu.title",
        children: [
          {
            id: "important-requirements",
            labelKey: "information.what_is_makcu.important_notes.title",
          },
        ],
      },
      {
        id: "what-is-it-used-for",
        labelKey: "information.what_is_it_used_for.title",
        children: [
          {
            id: "device-communication",
            labelKey: "information.what_is_it_used_for.device_communication.title",
          },
        ],
      },
      {
        id: "capabilities",
        labelKey: "information.capabilities.title",
        children: [
          {
            id: "can-do",
            labelKey: "information.capabilities.can_do.title",
          },
          {
            id: "cannot-do",
            labelKey: "information.capabilities.cannot_do.title",
          },
          {
            id: "important-reminders",
            labelKey: "information.capabilities.important_reminders.title",
          },
          {
            id: "console-support",
            labelKey: "information.capabilities.console_support.title",
          },
        ],
      },
      {
        id: "preflashed-vs-unflashed",
        labelKey: "information.preflashed_vs_unflashed.title",
        children: [
          {
            id: "preflashed",
            labelKey: "information.preflashed_vs_unflashed.preflashed.title",
          },
          {
            id: "unflashed",
            labelKey: "information.preflashed_vs_unflashed.unflashed.title",
          },
        ],
      },
      {
        id: "usb-ports",
        labelKey: "information.usb_ports.title",
        children: [
          {
            id: "usb1",
            labelKey: "information.usb_ports.usb1.title",
          },
          {
            id: "usb2",
            labelKey: "information.usb_ports.usb2.title",
          },
          {
            id: "usb3",
            labelKey: "information.usb_ports.usb3.title",
          },
          {
            id: "usb-summary",
            labelKey: "information.usb_ports.summary.title",
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
        id: "baud-rate",
        labelKey: "setup.sections.flash_makcu.baud_rate.title",
      },
    ],
  },
  {
    page: "setup",
    route: "/setup",
    sections: [
      {
        id: "requirements",
        labelKey: "setup.sections.requirements.title",
      },
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
        ],
      },
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
    ],
  },
  {
    page: "troubleshooting",
    route: "/troubleshooting",
    sections: [
      {
        id: "led-status",
        labelKey: "troubleshooting.quick_reference.title",
      },
      {
        id: "troubleshooting-steps",
        labelKey: "troubleshooting.troubleshooting_steps.title",
        children: [
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
          {
            id: "cannot-flash-website",
            labelKey: "troubleshooting.troubleshooting_steps.cannot_flash_website.title",
          },
          {
            id: "button-held-still-looping",
            labelKey: "troubleshooting.troubleshooting_steps.button_held_still_looping.title",
          },
        ],
      },
      {
        id: "still-issues",
        labelKey: "troubleshooting.still_issues.title",
      },
    ],
  },
  {
    page: "device-control",
    route: "/device-control",
    sections: [
      {
        id: "device-information",
        labelKey: "device_control.sections.device_information",
      },
      {
        id: "device-test",
        labelKey: "device_control.sections.device_test",
      },
      {
        id: "firmware-selection",
        labelKey: "tools.sections.firmware_selection.title",
      },
      {
        id: "serial-terminal",
        labelKey: "device_control.sections.serial_terminal",
      },
    ],
  },
  {
    page: "xim",
    route: "/xim",
    sections: [
      {
        id: "xim-setup",
        labelKey: "xim.sections.setup.title",
        children: [
          { id: "prerequisites", labelKey: "xim.sections.setup.prerequisites.title" },
          { id: "step1-prepare-xim", labelKey: "xim.sections.setup.step1_prepare_xim.title" },
          { id: "step2-prepare-makcu", labelKey: "xim.sections.setup.step2_prepare_makcu.title" },
          { id: "step3-connect", labelKey: "xim.sections.setup.step3_connect.title" },
        ],
      },
    ],
  },
]);

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

