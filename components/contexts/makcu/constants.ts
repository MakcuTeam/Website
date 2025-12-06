/**
 * Binary Protocol Constants
 * Frame format: [0x50] [CMD] [LEN_LO] [LEN_HI] [PAYLOAD...] [CRC_LO] [CRC_HI]
 * Note: UART0 uses 0x50, UART1 uses 0x5A (0x50+0xA) to avoid misdirection
 */
export const UART0_START_BYTE = 0x50;  /* UART0=0x50, UART1=0x5A */

/**
 * UART0 Binary API Commands - Individual data field commands
 */
export const UART0_CMD_STATUS = 0xB1;   /* Lightweight status poll (17 bytes) */
export const UART0_CMD_GET_MAC1 = 0xB2;  /* MAC1 - device side (6 bytes) */
export const UART0_CMD_GET_MAC2 = 0xB3;  /* MAC2 - USB host side (6 bytes) */
export const UART0_CMD_GET_TEMP = 0xB4;  /* Temperature (4 bytes float) */
export const UART0_CMD_GET_RAM = 0xB5;   /* Free RAM (4 bytes uint32, KB) */
export const UART0_CMD_GET_CPU = 0xB6;   /* CPU frequency (4 bytes uint32, MHz) */
export const UART0_CMD_GET_UPTIME = 0xB7; /* Uptime (4 bytes uint32, seconds) */
export const UART0_CMD_GET_VID = 0xB8;    /* VID (2 bytes uint16) */
export const UART0_CMD_GET_PID = 0xB9;    /* PID (2 bytes uint16) */
export const UART0_CMD_GET_MOUSE_BINT = 0xBA; /* Mouse bInterval (1 byte) */
export const UART0_CMD_GET_KBD_BINT = 0xBB;   /* Keyboard bInterval (1 byte) */
export const UART0_CMD_GET_FW_VERSION = 0xBC;  /* FW version string (variable length) */
export const UART0_CMD_GET_MAKCU_VERSION = 0xBD; /* MAKCU version string (variable length) */
export const UART0_CMD_GET_VENDOR = 0xBE;       /* Vendor string (variable length) */
export const UART0_CMD_GET_MODEL = 0xBF;        /* Model string (variable length) */
export const UART0_CMD_GET_ORIG_SERIAL = 0xC0;  /* Original serial (variable length) */
export const UART0_CMD_GET_SPOOF_SERIAL = 0xC1; /* Spoofed serial (variable length) */
export const UART0_CMD_GET_SPOOF_ACTIVE = 0xC2; /* Spoof active flag (1 byte) */
export const UART0_CMD_GET_SCREEN_W = 0xC3;     /* Screen width (2 bytes int16) */
export const UART0_CMD_GET_SCREEN_H = 0xC4;     /* Screen height (2 bytes int16) */
export const UART0_CMD_GET_FAULT = 0xC5;        /* Fault data (parse_fault_t structure) */

/**
 * Connection Constants
 */
export const BAUD_RATES = {
  HIGH_SPEED: 4000000,
  STANDARD: 115200,
  FLASH_MODE: 921600,
  ROM_BOOTLOADER: 115200,
} as const;

export const SERIAL_PORT_CONFIG = {
  dataBits: 8,
  stopBits: 1,
  parity: "none" as const,
  flowControl: "none" as const,
} as const;

export const CONNECTION_DELAYS = {
  PORT_STABILIZATION: 50, // ms to wait after opening port
} as const;

export const CONNECTION_TIMEOUTS = {
  STATUS_FRAME_BYTES: 21, // 6 overhead + 15 payload
  MAX_FRAME_BYTES: 2566,
  SILENCE_SYMBOLS: 10,
} as const;

/**
 * Cookie constants
 */
export const DEVICE_INFO_COOKIE = "makcu_device_info";
export const DEVICE_INFO_EXPIRY_HOURS = 24 * 365; // 1 year

