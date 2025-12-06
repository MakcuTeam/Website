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
      {
        id: "binary-protocol-format",
        labelKey: "api.sections.binary_protocol_format",
      },
      {
        id: "binary-api-mouse",
        labelKey: "api.sections.binary_api_mouse",
        children: [
          {
            id: "binary-mouse-buttons",
            labelKey: "api.sections.binary_mouse_buttons",
            children: [
              { id: "binary-buttons-stream", labelKey: "api.sections.binary_buttons_stream" },
              { id: "binary-click", labelKey: "api.sections.binary_click" },
              { id: "binary-individual-buttons", labelKey: "api.sections.binary_individual_buttons" },
            ],
          },
          {
            id: "binary-mouse-movement",
            labelKey: "api.sections.binary_mouse_movement",
            children: [
              { id: "binary-move", labelKey: "api.sections.binary_move" },
              { id: "binary-moveto", labelKey: "api.sections.binary_moveto" },
              { id: "binary-wheel", labelKey: "api.sections.binary_wheel" },
              { id: "binary-pan", labelKey: "api.sections.binary_pan" },
              { id: "binary-tilt", labelKey: "api.sections.binary_tilt" },
              { id: "binary-silent", labelKey: "api.sections.binary_silent" },
            ],
          },
          {
            id: "binary-mouse-streaming",
            labelKey: "api.sections.binary_mouse_streaming",
            children: [
              { id: "binary-axis-stream", labelKey: "api.sections.binary_axis_stream" },
              { id: "binary-mouse-stream", labelKey: "api.sections.binary_mouse_stream" },
            ],
          },
          {
            id: "binary-mouse-advanced",
            labelKey: "api.sections.binary_mouse_advanced",
            children: [
              { id: "binary-catch", labelKey: "api.sections.binary_catch" },
              { id: "binary-getpos", labelKey: "api.sections.binary_getpos" },
              { id: "binary-mo", labelKey: "api.sections.binary_mo" },
              { id: "binary-remap-button", labelKey: "api.sections.binary_remap_button" },
              { id: "binary-turbo", labelKey: "api.sections.binary_turbo" },
            ],
          },
        ],
      },
      {
        id: "binary-api-keyboard",
        labelKey: "api.sections.binary_api_keyboard",
        children: [
          {
            id: "binary-keyboard-basic",
            labelKey: "api.sections.binary_keyboard_basic",
            children: [
              { id: "binary-down", labelKey: "api.sections.binary_down" },
              { id: "binary-up", labelKey: "api.sections.binary_up" },
              { id: "binary-press", labelKey: "api.sections.binary_press" },
              { id: "binary-string", labelKey: "api.sections.binary_string" },
              { id: "binary-init", labelKey: "api.sections.binary_init" },
              { id: "binary-isdown", labelKey: "api.sections.binary_isdown" },
            ],
          },
          {
            id: "binary-keyboard-streaming",
            labelKey: "api.sections.binary_keyboard_streaming",
            children: [
              { id: "binary-keyboard-stream", labelKey: "api.sections.binary_keyboard_stream" },
            ],
          },
          {
            id: "binary-keyboard-config",
            labelKey: "api.sections.binary_keyboard_config",
            children: [
              { id: "binary-disable", labelKey: "api.sections.binary_disable" },
              { id: "binary-mask", labelKey: "api.sections.binary_mask" },
              { id: "binary-remap", labelKey: "api.sections.binary_remap" },
            ],
          },
        ],
      },
      {
        id: "binary-api-general",
        labelKey: "api.sections.binary_api_general",
        children: [
          {
            id: "binary-general-config",
            labelKey: "api.sections.binary_general_config",
            children: [
              { id: "binary-baud", labelKey: "api.sections.binary_baud" },
              { id: "binary-bypass", labelKey: "api.sections.binary_bypass" },
              { id: "binary-echo", labelKey: "api.sections.binary_echo" },
              { id: "binary-hs", labelKey: "api.sections.binary_hs" },
              { id: "binary-led", labelKey: "api.sections.binary_led" },
              { id: "binary-log", labelKey: "api.sections.binary_log" },
              { id: "binary-release", labelKey: "api.sections.binary_release" },
              { id: "binary-screen", labelKey: "api.sections.binary_screen" },
              { id: "binary-serial", labelKey: "api.sections.binary_serial" },
            ],
          },
          {
            id: "binary-general-system",
            labelKey: "api.sections.binary_general_system",
            children: [
              { id: "binary-device", labelKey: "api.sections.binary_device" },
              { id: "binary-fault", labelKey: "api.sections.binary_fault" },
              { id: "binary-info", labelKey: "api.sections.binary_info" },
              { id: "binary-reboot", labelKey: "api.sections.binary_reboot" },
              { id: "binary-version", labelKey: "api.sections.binary_version" },
            ],
          },
        ],
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

