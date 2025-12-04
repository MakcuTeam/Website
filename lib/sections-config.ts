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
    information: 2,
    setup: 3,
    settings: 4,
    troubleshooting: 5,
    xim: 6,
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
        id: "mouse-remap",
        labelKey: "api.sections.mouse_remap.title",
        children: [
          { id: "remap-button", labelKey: "api.sections.mouse_remap.remap_button" },
          { id: "remap-axis", labelKey: "api.sections.mouse_remap.remap_axis" },
          { id: "invert-x", labelKey: "api.sections.mouse_remap.invert_x" },
          { id: "invert-y", labelKey: "api.sections.mouse_remap.invert_y" },
          { id: "swap-xy", labelKey: "api.sections.mouse_remap.swap_xy" },
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
        id: "steps",
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
        id: "prerequisites",
        labelKey: "settings.prerequisites.title",
      },
      {
        id: "device-information",
        labelKey: "settings.sections.device_information",
        children: [
          {
            id: "device-test",
            labelKey: "settings.sections.device_test",
          },
          {
            id: "serial-terminal",
            labelKey: "settings.sections.serial_terminal",
          },
        ],
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

