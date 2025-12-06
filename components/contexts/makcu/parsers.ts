import type { MakcuStatus, TestStatus, DeviceTestResult, MouseTestResults, KeyboardTestResults } from "./types";
import * as constants from "./constants";

/**
 * Command parser type
 */
export type CommandParser = (payload: Uint8Array) => any;

/**
 * Command parser registry
 */
const commandParserRegistry: Map<number, CommandParser> = new Map();

/**
 * Individual Command Parsers
 */

export function parseCmdMAC1(payload: Uint8Array): { MAC1: string } | null {
  if (payload.length !== 6) return null;
  const mac = Array.from(payload)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  return { MAC1: mac };
}

export function parseCmdMAC2(payload: Uint8Array): { MAC2: string } | null {
  if (payload.length !== 6) return null;
  const mac = Array.from(payload)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  return { MAC2: mac };
}

export function parseCmdTemp(payload: Uint8Array): { TEMP: string } | null {
  if (payload.length !== 4) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 4);
  const temp = view.getFloat32(0, true); // little-endian
  return { TEMP: temp >= 0 ? `${temp.toFixed(1)}c` : "na" };
}

export function parseCmdRAM(payload: Uint8Array): { RAM: number } | null {
  if (payload.length !== 4) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 4);
  const ram = view.getUint32(0, true); // little-endian
  return { RAM: ram };
}

export function parseCmdCPU(payload: Uint8Array): { CPU: string } | null {
  if (payload.length !== 4) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 4);
  const cpu = view.getUint32(0, true); // little-endian
  return { CPU: `${cpu}mhz` };
}

export function parseCmdUptime(payload: Uint8Array): { UPTIME: number } | null {
  if (payload.length !== 4) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 4);
  const uptime = view.getUint32(0, true); // little-endian
  return { UPTIME: uptime };
}

export function parseCmdVID(payload: Uint8Array): { VID: string } | null {
  if (payload.length !== 2) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 2);
  const vid = view.getUint16(0, true); // little-endian
  return { VID: vid.toString(16).toUpperCase().padStart(4, '0') };
}

export function parseCmdPID(payload: Uint8Array): { PID: string } | null {
  if (payload.length !== 2) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 2);
  const pid = view.getUint16(0, true); // little-endian
  return { PID: pid.toString(16).toUpperCase().padStart(4, '0') };
}

export function parseCmdMouseBint(payload: Uint8Array): { MOUSE_BINT: string } | null {
  if (payload.length !== 1) {
    console.warn(`[PARSE MOUSE BINT] Invalid payload length: ${payload.length} (expected 1)`);
    return null;
  }
  const value = payload[0].toString();
  console.log(`[PARSE MOUSE BINT] ✓ Parsed: ${value} (raw byte: ${payload[0]}, polling rate: ${Math.round(1000 / payload[0])}Hz)`);
  return { MOUSE_BINT: value };
}

export function parseCmdKbdBint(payload: Uint8Array): { KBD_BINT: string } | null {
  if (payload.length !== 1) {
    console.warn(`[PARSE KBD BINT] Invalid payload length: ${payload.length} (expected 1)`);
    return null;
  }
  const value = payload[0].toString();
  console.log(`[PARSE KBD BINT] ✓ Parsed: ${value} (raw byte: ${payload[0]}, polling rate: ${Math.round(1000 / payload[0])}Hz)`);
  return { KBD_BINT: value };
}

export function parseCmdString(payload: Uint8Array): string {
  if (payload.length === 0) return "";
  const decoder = new TextDecoder();
  return decoder.decode(payload);
}

export function parseCmdFWVersion(payload: Uint8Array): { FW: string } | null {
  const str = parseCmdString(payload);
  return str ? { FW: str } : null;
}

export function parseCmdMakcuVersion(payload: Uint8Array): { MAKCU: string } | null {
  const str = parseCmdString(payload);
  return str ? { MAKCU: str } : null;
}

export function parseCmdVendor(payload: Uint8Array): { VENDOR?: string } | null {
  const str = parseCmdString(payload);
  return str ? { VENDOR: str } : {};
}

export function parseCmdModel(payload: Uint8Array): { MODEL?: string } | null {
  const str = parseCmdString(payload);
  return str ? { MODEL: str } : {};
}

export function parseCmdOrigSerial(payload: Uint8Array): { ORIGINAL_SERIAL?: string } | null {
  const str = parseCmdString(payload);
  return str ? { ORIGINAL_SERIAL: str } : {};
}

export function parseCmdSpoofSerial(payload: Uint8Array): { SPOOFED_SERIAL?: string } | null {
  const str = parseCmdString(payload);
  return str ? { SPOOFED_SERIAL: str } : {};
}

export function parseCmdSpoofActive(payload: Uint8Array): { SPOOF_ACTIVE: boolean } | null {
  if (payload.length !== 1) return null;
  return { SPOOF_ACTIVE: payload[0] === 1 };
}

export function parseCmdScreenW(payload: Uint8Array): { SCREEN_W: number } | null {
  if (payload.length !== 2) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 2);
  const w = view.getInt16(0, true); // little-endian
  return { SCREEN_W: w };
}

export function parseCmdScreenH(payload: Uint8Array): { SCREEN_H: number } | null {
  if (payload.length !== 2) return null;
  const view = new DataView(payload.buffer, payload.byteOffset, 2);
  const h = view.getInt16(0, true); // little-endian
  return { SCREEN_H: h };
}

export function parseCmdFault(payload: Uint8Array): { FAULT?: any } | null {
  // Fault structure parsing - can be extended later
  return payload.length > 0 ? { FAULT: payload } : {};
}

/**
 * Parse STATUS response (17 bytes from MCU)
 */
export function parseStatusResponse(data: Uint8Array): MakcuStatus | null {
  if (data.length < 17) {
    console.warn(`[PARSE STATUS] Invalid length: ${data.length} bytes (expected 17)`);
    return null;
  }
  
  const view = new DataView(data.buffer, data.byteOffset, 17);
  
  const mcuAlive = data[0] === 0x01;
  const deviceAttached = data[1] === 0x01;
  const uptime = view.getUint32(2, true);        // little-endian
  const sofCount = view.getUint32(6, true);
  const freeRamKb = view.getUint16(10, true);
  const hasFault = data[12] === 0x01;
  const temp = view.getFloat32(13, true);        // little-endian float, -1.0 if unavailable
  
  const status: MakcuStatus = {
    mcuAlive,
    deviceAttached,
    uptime,
    sofCount,
    freeRamKb,
    hasFault,
    temp,
    lastPollTime: Date.now(),
  };
  
  // Detailed logging of parsed values
  console.log(`[PARSE STATUS] Parsed STATUS response (${data.length} bytes):`, {
    mcuAlive,
    deviceAttached,
    uptime: `${uptime}s (${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s)`,
    sofCount,
    freeRamKb: `${freeRamKb}kb`,
    hasFault,
    temp: temp >= 0 ? `${temp.toFixed(1)}°C` : "unavailable",
    rawBytes: Array.from(data.slice(0, 17)).map(b => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`).join(' ')
  });
  
  return status;
}

/**
 * Parse device test response
 */
function parseTestByte(value: number): TestStatus {
  if (value === 1) return "pass";
  if (value === 2) return "not_supported";
  return "fail";
}

export function parseDeviceTestResponse(data: Uint8Array): DeviceTestResult | null {
  if (data.length < 4) return null;
  
  const header = data[0];
  if (header !== 0x01) {
    return { success: false, testMode: 0, mousePresent: false, keyboardPresent: false };
  }
  
  const testMode = data[1];
  const mousePresent = data[2] === 1;
  const keyboardPresent = data[3] === 1;
  
  let pos = 4;
  const result: DeviceTestResult = {
    success: true,
    testMode,
    mousePresent,
    keyboardPresent,
  };
  
  // Parse mouse results (10 bytes)
  if (mousePresent && (testMode & 0x01) && pos + 10 <= data.length) {
    result.mouse = {
      button1: parseTestByte(data[pos++]),
      button2: parseTestByte(data[pos++]),
      button3: parseTestByte(data[pos++]),
      button4: parseTestByte(data[pos++]),
      button5: parseTestByte(data[pos++]),
      xAxis: parseTestByte(data[pos++]),
      yAxis: parseTestByte(data[pos++]),
      wheel: parseTestByte(data[pos++]),
      pan: parseTestByte(data[pos++]),
      tilt: parseTestByte(data[pos++]),
    };
  }
  
  // Parse keyboard results (3 bytes)
  if (keyboardPresent && (testMode & 0x02) && pos + 3 <= data.length) {
    result.keyboard = {
      keyPress: parseTestByte(data[pos++]),
      keyRelease: parseTestByte(data[pos++]),
      modifiers: parseTestByte(data[pos++]),
    };
  }
  
  return result;
}

/**
 * Register all command parsers
 */
export function registerCommandParsers(): void {
  commandParserRegistry.set(constants.UART0_CMD_GET_MAC1, parseCmdMAC1);
  commandParserRegistry.set(constants.UART0_CMD_GET_MAC2, parseCmdMAC2);
  commandParserRegistry.set(constants.UART0_CMD_GET_TEMP, parseCmdTemp);
  commandParserRegistry.set(constants.UART0_CMD_GET_RAM, parseCmdRAM);
  commandParserRegistry.set(constants.UART0_CMD_GET_CPU, parseCmdCPU);
  commandParserRegistry.set(constants.UART0_CMD_GET_UPTIME, parseCmdUptime);
  commandParserRegistry.set(constants.UART0_CMD_GET_VID, parseCmdVID);
  commandParserRegistry.set(constants.UART0_CMD_GET_PID, parseCmdPID);
  commandParserRegistry.set(constants.UART0_CMD_GET_MOUSE_BINT, parseCmdMouseBint);
  commandParserRegistry.set(constants.UART0_CMD_GET_KBD_BINT, parseCmdKbdBint);
  commandParserRegistry.set(constants.UART0_CMD_GET_FW_VERSION, parseCmdFWVersion);
  commandParserRegistry.set(constants.UART0_CMD_GET_MAKCU_VERSION, parseCmdMakcuVersion);
  commandParserRegistry.set(constants.UART0_CMD_GET_VENDOR, parseCmdVendor);
  commandParserRegistry.set(constants.UART0_CMD_GET_MODEL, parseCmdModel);
  commandParserRegistry.set(constants.UART0_CMD_GET_ORIG_SERIAL, parseCmdOrigSerial);
  commandParserRegistry.set(constants.UART0_CMD_GET_SPOOF_SERIAL, parseCmdSpoofSerial);
  commandParserRegistry.set(constants.UART0_CMD_GET_SPOOF_ACTIVE, parseCmdSpoofActive);
  commandParserRegistry.set(constants.UART0_CMD_GET_SCREEN_W, parseCmdScreenW);
  commandParserRegistry.set(constants.UART0_CMD_GET_SCREEN_H, parseCmdScreenH);
  commandParserRegistry.set(constants.UART0_CMD_GET_FAULT, parseCmdFault);
}

/**
 * Route API command to its parser
 */
export function routeApiCommand(cmd: number, payload: Uint8Array): any | null {
  const parser = commandParserRegistry.get(cmd);
  if (!parser) {
    console.warn(`[API ROUTER] No parser registered for command 0x${cmd.toString(16).toUpperCase()}`);
    return null;
  }
  
  try {
    return parser(payload);
  } catch (error) {
    console.error(`[API ROUTER] Error parsing command 0x${cmd.toString(16).toUpperCase()}:`, error);
    return null;
  }
}

/**
 * Register a new command parser
 */
export function registerApiCommandParser(cmd: number, parser: CommandParser): void {
  commandParserRegistry.set(cmd, parser);
  console.log(`[API ROUTER] Registered parser for command 0x${cmd.toString(16).toUpperCase()}`);
}

// Initialize parser registry on module load
registerCommandParsers();

