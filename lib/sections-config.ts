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
    firmware: 1,
    setup: 2,
    settings: 3,
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
        labelKey: "api.sections.transport",
      },
      {
        id: "mouse-buttons",
        labelKey: "api.sections.mouse_buttons.title",
        children: [
          { id: "buttons-individual", labelKey: "api.sections.mouse_buttons.buttons_individual" },
          { id: "click", labelKey: "api.sections.mouse_buttons.click" },
          { id: "turbo", labelKey: "api.sections.mouse_buttons.turbo" },
        ],
      },
      {
        id: "mouse-movement",
        labelKey: "api.sections.mouse_movement.title",
        children: [
          { id: "move", labelKey: "api.sections.mouse_movement.move" },
          { id: "moveto", labelKey: "api.sections.mouse_movement.moveto" },
          { id: "wheel", labelKey: "api.sections.mouse_movement.wheel" },
          { id: "pan", labelKey: "api.sections.mouse_movement.pan" },
          { id: "tilt", labelKey: "api.sections.mouse_movement.tilt" },
          { id: "getpos", labelKey: "api.sections.mouse_movement.getpos" },
          { id: "silent", labelKey: "api.sections.mouse_movement.silent" },
        ],
      },
      {
        id: "mouse-advanced",
        labelKey: "api.sections.mouse_advanced.title",
        children: [
          { id: "mo", labelKey: "api.sections.mouse_advanced.mo" },
          { id: "lock", labelKey: "api.sections.mouse_advanced.lock" },
          { id: "catch", labelKey: "api.sections.mouse_advanced.catch" },
        ],
      },
      {
        id: "keyboard",
        labelKey: "api.sections.keyboard.title",
        children: [
          { id: "down", labelKey: "api.sections.keyboard.down" },
          { id: "up", labelKey: "api.sections.keyboard.up" },
          { id: "press", labelKey: "api.sections.keyboard.press" },
          { id: "string", labelKey: "api.sections.keyboard.string" },
          { id: "init", labelKey: "api.sections.keyboard.init" },
          { id: "isdown", labelKey: "api.sections.keyboard.isdown" },
          { id: "mask", labelKey: "api.sections.keyboard.mask" },
          { id: "remap", labelKey: "api.sections.keyboard.remap" },
        ],
      },
      {
        id: "streaming",
        labelKey: "api.sections.streaming.title",
        children: [
          { id: "keys-stream", labelKey: "api.sections.streaming.keys" },
          { id: "buttons-stream", labelKey: "api.sections.streaming.buttons" },
          { id: "axis-stream", labelKey: "api.sections.streaming.axis" },
          { id: "mouse-stream", labelKey: "api.sections.streaming.mouse" },
        ],
      },
      {
        id: "screen",
        labelKey: "api.sections.screen.title",
        children: [
          { id: "screen-cmd", labelKey: "api.sections.screen.screen_cmd" },
        ],
      },
      {
        id: "system",
        labelKey: "api.sections.system.title",
        children: [
          { id: "help", labelKey: "api.sections.system.help" },
          { id: "info", labelKey: "api.sections.system.info" },
          { id: "version", labelKey: "api.sections.system.version" },
          { id: "device", labelKey: "api.sections.system.device" },
          { id: "fault", labelKey: "api.sections.system.fault" },
          { id: "reboot", labelKey: "api.sections.system.reboot" },
          { id: "serial", labelKey: "api.sections.system.serial" },
        ],
      },
      {
        id: "config",
        labelKey: "api.sections.config.title",
        children: [
          { id: "log", labelKey: "api.sections.config.log" },
          { id: "echo", labelKey: "api.sections.config.echo" },
          { id: "baud", labelKey: "api.sections.config.baud" },
          { id: "hs", labelKey: "api.sections.config.hs" },
          { id: "release", labelKey: "api.sections.config.release" },
        ],
      },
      {
        id: "baud-binary",
        labelKey: "api.sections.baud_binary",
      },
      {
        id: "no-usb",
        labelKey: "api.sections.no_usb",
      },
      {
        id: "limits",
        labelKey: "api.sections.limits",
      },
    ],
  },
  {
    page: "firmware",
    route: "/firmware",
    sections: [
      {
        id: "flashing-steps",
        labelKey: "tools.sections.steps.title",
      },
      {
        id: "flashing-tool",
        labelKey: "tools.sections.flashing_tool.title",
      },
      {
        id: "firmware-selection",
        labelKey: "tools.sections.firmware_selection.title",
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
        id: "baud-rate",
        labelKey: "setup.sections.flash_makcu.baud_rate.title",
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
  {
    page: "settings",
    route: "/settings",
    sections: [
      {
        id: "status",
        labelKey: "settings.sections.status",
      },
      {
        id: "prerequisites",
        labelKey: "settings.prerequisites.title",
      },
      {
        id: "baud-rate",
        labelKey: "settings.baud_rate.title",
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
          { id: "xim-configuration", labelKey: "xim.sections.setup.xim_configuration.title" },
          { id: "makcu-setup", labelKey: "xim.sections.setup.makcu_setup.title" },
          { id: "connection", labelKey: "xim.sections.setup.connection.title" },
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

