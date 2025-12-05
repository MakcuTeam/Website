"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { ESPLoader, LoaderOptions, Transport } from "esptool-js";
import { serial } from "web-serial-polyfill";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════════
 * Binary Protocol Constants and Functions
 * Frame format: [0x50] [CMD] [LEN_LO] [LEN_HI] [PAYLOAD...] [CRC_LO] [CRC_HI]
 * Note: UART0 uses 0x50, UART1 uses 0x5A (0x50+0xA) to avoid misdirection
 * ═══════════════════════════════════════════════════════════════════════════ */
const UART0_START_BYTE = 0x50;  /* UART0=0x50, UART1=0x5A */
const UART0_CMD_WEBSITE = 0xB0;

// CRC16-CCITT lookup table for faster calculation
const CRC16_TABLE = (() => {
  const table = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
    table[i] = crc & 0xFFFF;
  }
  return table;
})();

function crc16_ccitt(data: Uint8Array): number {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = ((crc << 8) ^ CRC16_TABLE[((crc >> 8) ^ data[i]) & 0xFF]) & 0xFFFF;
  }
  return crc;
}

// Build a binary framed request
function buildBinaryFrame(cmd: number, payload: Uint8Array | null = null): Uint8Array {
  const payloadLen = payload ? payload.length : 0;
  const frameLen = 6 + payloadLen;  // START(1) + CMD(1) + LEN(2) + PAYLOAD + CRC(2)
  const frame = new Uint8Array(frameLen);
  
  frame[0] = UART0_START_BYTE;
  frame[1] = cmd;
  frame[2] = payloadLen & 0xFF;
  frame[3] = (payloadLen >> 8) & 0xFF;
  
  if (payload && payloadLen > 0) {
    frame.set(payload, 4);
  }
  
  // Calculate CRC over everything except CRC itself
  const crc = crc16_ccitt(frame.slice(0, 4 + payloadLen));
  frame[4 + payloadLen] = crc & 0xFF;
  frame[4 + payloadLen + 1] = (crc >> 8) & 0xFF;
  
  return frame;
}

// Parse a binary framed response - returns payload or null if invalid
function parseBinaryFrame(data: Uint8Array): { cmd: number; payload: Uint8Array } | null {
  // Find start byte (UART0 uses 0x50)
  let startIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === UART0_START_BYTE) {
      startIdx = i;
      break;
    }
  }
  
  if (startIdx < 0 || data.length < startIdx + 6) {
    return null;  // No start byte or not enough data for minimal frame
  }
  
  const cmd = data[startIdx + 1];
  const payloadLen = data[startIdx + 2] | (data[startIdx + 3] << 8);
  const totalFrameLen = 6 + payloadLen;
  
  if (data.length < startIdx + totalFrameLen) {
    return null;  // Not enough data
  }
  
  // Extract frame
  const frame = data.slice(startIdx, startIdx + totalFrameLen);
  
  // Verify CRC
  const calcCrc = crc16_ccitt(frame.slice(0, 4 + payloadLen));
  const rxCrc = frame[4 + payloadLen] | (frame[4 + payloadLen + 1] << 8);
  
  if (calcCrc !== rxCrc) {
    console.warn(`Binary frame CRC mismatch: calc=0x${calcCrc.toString(16)} rx=0x${rxCrc.toString(16)}`);
    return null;
  }
  
  // Extract payload
  const payload = payloadLen > 0 ? frame.slice(4, 4 + payloadLen) : new Uint8Array(0);
  
  return { cmd, payload };
}

const DEVICE_INFO_COOKIE = "makcu_device_info";
const DEVICE_INFO_EXPIRY_HOURS = 1;

function setCookie(name: string, value: string, hours: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function parseAndStoreDeviceInfoBinary(data: Uint8Array): void {
  // Try to decode readable strings from the data
  const decoder = new TextDecoder();
  let searchPos = 0;
  const foundStrings: string[] = [];
  while (searchPos < data.length - 1) {
    // Look for null-terminated strings (printable ASCII)
    if (data[searchPos] >= 0x20 && data[searchPos] < 0x7F) {
      let strStart = searchPos;
      let strEnd = searchPos;
      while (strEnd < data.length && data[strEnd] >= 0x20 && data[strEnd] < 0x7F) {
        strEnd++;
      }
      if (strEnd < data.length && data[strEnd] === 0x00 && strEnd - strStart >= 2) {
        const str = decoder.decode(data.slice(strStart, strEnd));
        foundStrings.push(`[${strStart}-${strEnd}]: "${str}"`);
        searchPos = strEnd + 1;
      } else {
        searchPos++;
      }
    } else {
      searchPos++;
    }
  }
  
  if (data.length < 1) {
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    return;
  }

  let pos = 0;
  const header = data[pos++];
  
  // Header: 0x00 = no device, 0x01 = has device
  if (header === 0x00) {
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    return;
  }

  // New format: 360 bytes (1 header + 6 MAC1 + 6 MAC2 + 4 TEMP + 4 RAM + 4 CPU + 4 UP + 2 VID + 2 PID + 1 MOUSE_BINT + 1 KBD_BINT + 32 FW + 32 MAKCU + 64 VENDOR + 64 MODEL + 64 ORIGINAL_SERIAL + 64 SPOOFED_SERIAL + 1 SPOOF_ACTIVE + 2 SCREEN_W + 2 SCREEN_H)
  const NEW_FORMAT_SIZE = 360;
  
  if (header !== 0x01 || data.length < NEW_FORMAT_SIZE) {
    // Invalid or incomplete response
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    return;
  }
  const deviceInfo: Record<string, any> = {};

  // MAC1 (6 bytes)
  const mac1Bytes = data.slice(pos, pos + 6);
  const mac1 = Array.from(mac1Bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  deviceInfo.MAC1 = mac1;
  pos += 6;

  // MAC2 (6 bytes)
  const mac2Bytes = data.slice(pos, pos + 6);
  const mac2 = Array.from(mac2Bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  deviceInfo.MAC2 = mac2;
  pos += 6;

  // TEMP (float, 4 bytes)
  const tempView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const temp = tempView.getFloat32(0, true); // little-endian
  if (temp >= 0) {
    deviceInfo.TEMP = `${temp.toFixed(1)}c`;
  } else {
    deviceInfo.TEMP = "na";
  }
  pos += 4;

  // RAM (uint32_t, 4 bytes)
  const ramView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const ram = ramView.getUint32(0, true); // little-endian
  deviceInfo.RAM = `${ram}kb`;
  pos += 4;

  // CPU (uint32_t, 4 bytes)
  const cpuView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const cpu = cpuView.getUint32(0, true); // little-endian
  deviceInfo.CPU = `${cpu}mhz`;
  pos += 4;

  // Uptime (uint32_t, 4 bytes, seconds)
  const uptimeView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const uptimeSeconds = uptimeView.getUint32(0, true); // little-endian
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  deviceInfo.UP = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  pos += 4;

  // VID (uint16_t, 2 bytes)
  const vidView = new DataView(data.buffer, data.byteOffset + pos, 2);
  const vid = vidView.getUint16(0, true); // little-endian
  deviceInfo.VID = vid.toString(16).toUpperCase().padStart(4, '0');
  pos += 2;

  // PID (uint16_t, 2 bytes)
  const pidView = new DataView(data.buffer, data.byteOffset + pos, 2);
  const pid = pidView.getUint16(0, true); // little-endian
  deviceInfo.PID = pid.toString(16).toUpperCase().padStart(4, '0');
  pos += 2;

  // MOUSE_BINT (uint8_t, 1 byte)
  deviceInfo.MOUSE_BINT = data[pos++].toString();

  // KBD_BINT (uint8_t, 1 byte)
  deviceInfo.KBD_BINT = data[pos++].toString();

  // FW version string (null-terminated, max 32 bytes)
  const fwEnd = data.indexOf(0, pos);
  if (fwEnd >= pos) {
    deviceInfo.FW = new TextDecoder().decode(data.slice(pos, fwEnd));
  }
  pos += 32;

  // MAKCU version string (null-terminated, max 32 bytes)
  const makcuEnd = data.indexOf(0, pos);
  if (makcuEnd >= pos) {
    deviceInfo.MAKCU = new TextDecoder().decode(data.slice(pos, makcuEnd));
  }
  pos += 32;

  // VENDOR string (null-terminated, max 64 bytes)
  const vendorEnd = data.indexOf(0, pos);
  if (vendorEnd >= pos) {
    const vendor = new TextDecoder().decode(data.slice(pos, vendorEnd));
    if (vendor) deviceInfo.VENDOR = vendor;
  }
  pos += 64;

  // MODEL string (null-terminated, max 64 bytes)
  const modelEnd = data.indexOf(0, pos);
  if (modelEnd >= pos) {
    const model = new TextDecoder().decode(data.slice(pos, modelEnd));
    if (model) deviceInfo.MODEL = model;
  }
  pos += 64;

  // ORIGINAL_SERIAL string (null-terminated, max 64 bytes)
  const origSerialEnd = data.indexOf(0, pos);
  if (origSerialEnd >= pos) {
    const origSerial = new TextDecoder().decode(data.slice(pos, origSerialEnd));
    if (origSerial) deviceInfo.ORIGINAL_SERIAL = origSerial;
  }
  pos += 64;

  // SPOOFED_SERIAL string (null-terminated, max 64 bytes)
  const spoofSerialEnd = data.indexOf(0, pos);
  if (spoofSerialEnd >= pos) {
    const spoofSerial = new TextDecoder().decode(data.slice(pos, spoofSerialEnd));
    if (spoofSerial) deviceInfo.SPOOFED_SERIAL = spoofSerial;
  }
  pos += 64;

  // SPOOF_ACTIVE flag (1 byte: 0=not spoofed, 1=spoofed)
  if (pos < data.length) {
    const spoofActive = data[pos++];
    deviceInfo.SPOOF_ACTIVE = spoofActive === 1;
  } else {
    deviceInfo.SPOOF_ACTIVE = false;
  }

  // SCREEN_W (int16_t, 2 bytes, little-endian)
  let screenW = 0;
  if (pos + 1 < data.length) {
    const screenWView = new DataView(data.buffer, data.byteOffset + pos, 2);
    screenW = screenWView.getInt16(0, true); // little-endian
    pos += 2;
  } else {
    pos += 2;
  }

  // SCREEN_H (int16_t, 2 bytes, little-endian)
  let screenH = 0;
  if (pos + 1 < data.length) {
    const screenHView = new DataView(data.buffer, data.byteOffset + pos, 2);
    screenH = screenHView.getInt16(0, true); // little-endian
    pos += 2;
  } else {
    pos += 2;
  }

  // Combine screen dimensions into a single field
  if (screenW > 0 && screenH > 0) {
    deviceInfo.SCREEN_SIZE = `${screenW}x${screenH}`;
  }

  // Store in cookie as JSON (only if we have vendor or model)
  if (deviceInfo.VENDOR || deviceInfo.MODEL) {
    const jsonStr = JSON.stringify(deviceInfo);
    setCookie(DEVICE_INFO_COOKIE, jsonStr, DEVICE_INFO_EXPIRY_HOURS);
  } else {
    setCookie(DEVICE_INFO_COOKIE, "", 0);
  }
}

export function getDeviceInfo(): Record<string, string> | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${DEVICE_INFO_COOKIE}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (cookieValue) {
      try {
        return JSON.parse(cookieValue);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

/* ═══ Device Test Types ═══ */
export type TestStatus = "pass" | "fail" | "not_supported" | "not_tested";

export interface MouseTestResults {
  button1: TestStatus;
  button2: TestStatus;
  button3: TestStatus;
  button4: TestStatus;
  button5: TestStatus;
  xAxis: TestStatus;
  yAxis: TestStatus;
  wheel: TestStatus;
  pan: TestStatus;
  tilt: TestStatus;
}

export interface KeyboardTestResults {
  keyPress: TestStatus;
  keyRelease: TestStatus;
  modifiers: TestStatus;
}

export interface DeviceTestResult {
  success: boolean;
  testMode: number;
  mousePresent: boolean;
  keyboardPresent: boolean;
  mouse?: MouseTestResults;
  keyboard?: KeyboardTestResults;
}

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

export type ConnectionMode = "normal" | "flash" | null;
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "fault";

interface MakcuConnectionState {
  status: ConnectionStatus;
  mode: ConnectionMode;
  port: SerialPort | null;
  transport: Transport | null;
  loader: ESPLoader | null;
  comPort: string | null;
  detectedBaudRate: number | null;
}

interface SerialDataCallback {
  (data: Uint8Array, isBinary: boolean): void;
}

interface MakcuConnectionContextType extends MakcuConnectionState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommandAndReadResponse: (command: string, timeoutMs?: number) => Promise<Uint8Array | null>;
  sendBinaryCommand: (cmd: number, payload?: Uint8Array, timeoutMs?: number) => Promise<Uint8Array | null>;
  subscribeToSerialData: (callback: SerialDataCallback) => () => void;
  isConnecting: boolean;
  browserSupported: boolean;
}

const MakcuConnectionContext = createContext<MakcuConnectionContextType | undefined>(undefined);

export function MakcuConnectionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MakcuConnectionState>({
    status: "disconnected",
    mode: null,
    port: null,
    transport: null,
    loader: null,
    comPort: null,
    detectedBaudRate: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<MakcuConnectionState>(state);
  const serialDataSubscribersRef = useRef<Set<SerialDataCallback>>(new Set());

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const Navigator = navigator as Navigator & { serial?: Serial };
      setBrowserSupported(!!Navigator.serial);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
      healthCheckRef.current = null;
    }
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        // Ignore
      }
      try {
        readerRef.current.releaseLock();
      } catch (e) {
        // Ignore
      }
      readerRef.current = null;
    }
    if (writerRef.current) {
      try {
        writerRef.current.releaseLock();
      } catch (e) {
        // Ignore
      }
      writerRef.current = null;
    }
  }, []);

  // Calculate timeout based on 8N1 symbol periods (like firmware UART hardware timeout)
  // 8N1 format: 10 bits per symbol (1 start + 8 data + 1 stop)
  // Uses symbol periods of silence to detect end of frame (same as ESP32 UART hardware)
  // Formula: (symbol_periods * 10 bits) / baud_rate * 1000ms
  // 
  // For frame transmission: max frame size + silence detection
  // For silence detection: 10-20 symbol periods (firmware uses 20 = 2 bytes)
  // For fast detection (connection phase): use shorter timeout to fail fast
  const calculateTimeout = (baudRate: number, maxFrameBytes: number = 2566, silenceSymbols: number = 10, fastMode: boolean = false): number => {
    const bitsPerSymbol = 10; // 8N1: 1 start + 8 data + 1 stop
    
    // Frame transmission time
    const frameTimeMs = (maxFrameBytes * bitsPerSymbol * 1000) / baudRate;
    
    // Silence detection time (10 symbol periods = 100 bits = end of frame indicator)
    // This mimics ESP32 UART hardware timeout behavior
    // In fast mode, use fewer symbol periods for quicker failure detection
    const silenceSymbolsToUse = fastMode ? 5 : silenceSymbols;
    const silenceTimeMs = (silenceSymbolsToUse * bitsPerSymbol * 1000) / baudRate;
    
    // Total: frame time + silence detection + small overhead for Windows/WebSerial
    // In fast mode, reduce overhead for quicker detection
    const overheadMs = fastMode ? 10 : 20;
    const calculatedTimeout = Math.ceil(frameTimeMs + silenceTimeMs + overheadMs);
    
    // Minimum 50ms (for very fast baud rates), maximum 3000ms (safety limit)
    // In fast mode, cap at 500ms for quick failure
    const maxTimeout = fastMode ? 500 : 3000;
    return Math.max(50, Math.min(maxTimeout, calculatedTimeout));
  };

  // Calculate optimal retry count based on baud rate
  // Faster baud rates need fewer retries (less likely to have errors)
  // Retry delay also uses 8N1 symbol periods for consistency
  const calculateMaxRetries = (baudRate: number): number => {
    if (baudRate >= 2000000) return 3; // 4M baud: 3 retries
    if (baudRate >= 1000000) return 4; // 1M+ baud: 4 retries
    return 5; // 115200 baud: 5 retries (more prone to errors)
  };

  // Calculate retry delay based on 8N1 symbol periods
  // Uses symbol periods to ensure clean separation between retries
  // 5-10 symbol periods = enough time for line to clear
  const calculateRetryDelay = (baudRate: number, symbolPeriods: number = 5): number => {
    const bitsPerSymbol = 10; // 8N1
    const delayMs = (symbolPeriods * bitsPerSymbol * 1000) / baudRate;
    // Minimum 10ms, maximum 200ms (safety limits)
    return Math.max(10, Math.min(200, Math.ceil(delayMs)));
  };

  // Try to connect in normal mode with specific baud rate and timeout
  // Timeout and retries are automatically calculated based on baud rate
  const tryNormalMode = async (port: SerialPort, baudRate: number, timeout?: number, maxRetries?: number): Promise<boolean> => {
    const calculatedTimeout = timeout ?? calculateTimeout(baudRate);
    const calculatedRetries = maxRetries ?? calculateMaxRetries(baudRate);
    
    console.log(`[TRY NORMAL MODE] Baud: ${baudRate}, Timeout: ${calculatedTimeout}ms, Retries: ${calculatedRetries}`);
    
      if (!port.writable || !port.readable) {
        return false;
      }

    for (let attempt = 1; attempt <= calculatedRetries; attempt++) {
      try {
        // Send command
      const writer = port.writable.getWriter();
        const binaryCommand = buildBinaryFrame(UART0_CMD_WEBSITE, null);
        console.log(`[TRY NORMAL MODE] Attempt ${attempt}/${calculatedRetries}`);
        await writer.write(binaryCommand);
        writer.releaseLock();

        // Read response
      const reader = port.readable.getReader();
      readerRef.current = reader;

      let timeoutId: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise<Uint8Array | null>((resolve) => {
        timeoutId = setTimeout(() => {
          reader.cancel().catch(() => {});
            resolve(null);
          }, calculatedTimeout);
      });

        const readPromise = (async (): Promise<Uint8Array | null> => {
        const chunks: Uint8Array[] = [];
        try {
          while (true) {
            const { value, done } = await reader.read();
              if (done) break;
            chunks.push(value);
            
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            
              // Look for binary frame
              let frameStart = -1;
            for (let i = 0; i < combined.length; i++) {
                if (combined[i] === UART0_START_BYTE) {
                  frameStart = i;
                  break;
                }
              }
              
              if (frameStart >= 0 && combined.length >= frameStart + 6) {
                const payloadLen = combined[frameStart + 2] | (combined[frameStart + 3] << 8);
                const totalFrameLen = 6 + payloadLen;
                
                if (combined.length >= frameStart + totalFrameLen) {
                  const parsed = parseBinaryFrame(combined.slice(frameStart));
                  if (parsed && parsed.cmd === UART0_CMD_WEBSITE) {
                    if (timeoutId) clearTimeout(timeoutId);
                    return parsed.payload;
            }
          }
        }
        
              if (totalLength > 3000) break;
            }
          } catch (e) {
            // Read error
          }
          return null;
      })();

        const response = await Promise.race([readPromise, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        
        if (response && response.length >= 1) {
          parseAndStoreDeviceInfoBinary(response);
          return true;
        }
        
        // Cleanup and retry
        reader.releaseLock();
        readerRef.current = null;
        
        if (attempt < calculatedRetries) {
          const retryDelay = calculateRetryDelay(baudRate, 5);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`[TRY NORMAL MODE] Error:`, error);
        if (readerRef.current) {
          try { readerRef.current.releaseLock(); } catch (e) {}
          readerRef.current = null;
        }
        if (attempt < calculatedRetries) {
          const retryDelay = calculateRetryDelay(baudRate, 5);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      }

      return false;
  };

  // Try to connect in flash mode
  // Note: Flash mode uses its own baud rates (921600 for flash, 115200 for ROM)
  // The website baud rate setting is ignored - ESPLoader handles its own baud rates
  // After flashing, users reconnect anyway, so baud rate returns to website value
  const tryFlashMode = async (port: SerialPort): Promise<{ transport: Transport; loader: ESPLoader } | null> => {
    try {
      // Close the port first if it's open (required before reopening for flash mode)
      try {
        await port.close();
      } catch (e) {
        // Port might not be open
      }

      // Reopen for flash mode - Transport/ESPLoader will use its own baud rates
      // This ignores the website baud rate setting (115200 or 4M)
      const transport = new Transport(port as any, false, false);
      const flashOptions: LoaderOptions = {
        transport,
        baudrate: 921600,  // Flash mode baud rate (independent of website setting)
        romBaudrate: 115200,  // ROM bootloader baud rate
        terminal: {
          clean() {},
          writeLine() {},
          write() {},
        },
        debugLogging: false,
      };

      const loader = new ESPLoader(flashOptions);
      await loader.main();
      
      return { transport, loader };
    } catch (error) {
      return null;
    }
  };

  // Get COM port name (if available)
  // Note: WebSerial API doesn't expose COM port numbers for security/privacy reasons
  // This function returns null as COM port information is not available via WebSerial
  const getComPort = (_port: SerialPort): string | null => {
    // WebSerial API specification doesn't provide COM port information
    // The port selection dialog shows the device name, but not the COM port number
    // This is by design for security and privacy reasons
    return null;
  };

  const connect = useCallback(async () => {
    if (isConnecting) {
      return;
    }
    if (state.status === "connected") {
      return;
    }

    setIsConnecting(true);
    setState((prev) => ({ ...prev, status: "connecting" }));

    try {
      const Navigator = navigator as Navigator & { serial?: Serial };
      if (!Navigator.serial) {
        throw new Error("WebSerial API not supported");
      }

      // Request port
      const selectedPort = await Navigator.serial.requestPort();
      
      // Auto-detect baud rate: Try 4M first (faster), then 115200, then flash mode
      // This minimizes connection time for devices that support 4M baud
      let detectedBaudRate: number | null = null;
      let normalModeSuccess = false;

      // Step 1: Try 4M (4000000) first - fastest, timeout ~100ms
      // Use minimal retries (1 attempt) for fast detection - if it fails, likely flash mode
      try {
        await selectedPort.open({
          baudRate: 4000000,
          dataBits: 8,
          stopBits: 1,
          parity: "none",
          flowControl: "none",
        });
        // Single attempt with fast timeout for quick detection
        const fastTimeout = calculateTimeout(4000000, 2566, 10, true);
        normalModeSuccess = await tryNormalMode(selectedPort, 4000000, fastTimeout, 1);
        if (normalModeSuccess) {
          detectedBaudRate = 4000000;
        } else {
          await selectedPort.close();
        }
      } catch (error) {
        try {
          await selectedPort.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      // Step 2: If 4M failed, try 115200 - slower but more compatible
      // Use minimal retries (1 attempt) for fast detection
      if (!normalModeSuccess) {
        try {
          await selectedPort.open({
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            flowControl: "none",
          });
          // Single attempt with fast timeout for quick detection
          const fastTimeout = calculateTimeout(115200, 2566, 10, true);
          normalModeSuccess = await tryNormalMode(selectedPort, 115200, fastTimeout, 1);
          if (normalModeSuccess) {
            detectedBaudRate = 115200;
          } else {
            await selectedPort.close();
          }
        } catch (error) {
          try {
            await selectedPort.close();
          } catch (e) {
            // Ignore close errors
          }
        }
      }

      // Step 3: If normal mode succeeded, set state
      if (normalModeSuccess && detectedBaudRate) {
        const comPort = getComPort(selectedPort);
        setState({
          status: "connected",
          mode: "normal",
          port: selectedPort,
          transport: null,
          loader: null,
          comPort,
          detectedBaudRate,
        });
        toast.success(`Connected in Normal mode (${detectedBaudRate === 115200 ? "115200" : "4M"})`);
        return;
      }

      // Step 4: If both normal mode attempts failed, try flash mode
      await cleanup();
      const flashResult = await tryFlashMode(selectedPort);

      if (flashResult) {
        // Flash mode connected successfully
        const comPort = getComPort(selectedPort);
        setState({
          status: "connected",
          mode: "flash",
          port: selectedPort,
          transport: flashResult.transport,
          loader: flashResult.loader,
          comPort,
          detectedBaudRate: null, // Flash mode doesn't use website baud rates
        });
        toast.success("Connected in Flash mode");
        return;
      }

      // Both normal mode (500ms timeout) and flash mode failed
      // Set status to fault
      try {
        await selectedPort.close();
      } catch (e) {
        // Ignore close errors
      }
      setState((prev) => ({ ...prev, status: "fault", mode: null, port: null, detectedBaudRate: null }));
      toast.error("Connection failed - device not responding");

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Must be handling a user gesture")) {
        setState((prev) => ({ ...prev, status: "fault" }));
        toast.error(message);
      } else {
        setState((prev) => ({ ...prev, status: "disconnected" }));
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, state.status, cleanup]);

  // Internal disconnect function that uses stateRef to avoid stale closures
  const performDisconnect = useCallback(async () => {
    const currentState = stateRef.current;
    
    // First cleanup all readers/writers
    await cleanup();
    
    // Close loader if exists
    if (currentState.loader) {
      try {
        await currentState.loader.after();
      } catch (e) {
        // Ignore
      }
    }

    // Transport cleanup is handled by closing the port
    // No need to explicitly close transport

    // Close port - this is critical
    if (currentState.port) {
      try {
        // Make sure port is closed properly
        if (currentState.port.readable) {
          const reader = currentState.port.readable.getReader();
          try {
            await reader.cancel();
          } catch (e) {
            // Ignore
          }
          try {
            reader.releaseLock();
          } catch (e) {
            // Ignore
          }
        }
        if (currentState.port.writable) {
          const writer = currentState.port.writable.getWriter();
          try {
            writer.releaseLock();
          } catch (e) {
            // Ignore
          }
        }
        await currentState.port.close();
      } catch (e) {
        // Ignore - port might already be closed
        console.warn("Error closing port:", e);
      }
    }

    // Clear device info cookie when disconnecting
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    
    // Reset state
      setState({
        status: "disconnected",
        mode: null,
        port: null,
        transport: null,
        loader: null,
        comPort: null,
        detectedBaudRate: null,
      });
    
    toast.info("Disconnected");
  }, [cleanup]);

  // Public disconnect function
  const disconnect = useCallback(async () => {
    await performDisconnect();
  }, [performDisconnect]);

  // Listen for physical disconnection events - this is the MAIN handler for all disconnect events
  // All pages (settings, firmware, navbar) will automatically update via the global state
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const Navigator = navigator as Navigator & { serial?: Serial };
    if (!Navigator.serial) return;

    const handleDisconnect = async (event: Event) => {
      // Use stateRef to get the latest state
      const currentState = stateRef.current;
      // Check if we have an active connection
      if (currentState.status === "connected" && currentState.port) {
        // The port has been physically disconnected - use the main disconnect function
        // This will update the global state, which will automatically update:
        // - The navbar button (via MakcuConnectionButton)
        // - The Device Control page (via MakcuSettings component)
        // - The firmware page (via DeviceTool component)
        await performDisconnect();
      }
    };

    Navigator.serial.addEventListener("disconnect", handleDisconnect);

    return () => {
      Navigator.serial?.removeEventListener("disconnect", handleDisconnect);
    };
  }, [performDisconnect]);

  // Continuous serial data reading and broadcasting for subscribers (serial terminal)
  // This loop continuously reads from the port and broadcasts to all subscribers
  useEffect(() => {
    if (state.status !== "connected" || !state.port || !state.port.readable) {
      return;
    }

    let isReading = false;
    let shouldStop = false;

    const startContinuousReading = async () => {
      if (isReading) {
        console.log("[CONTINUOUS READER] Already reading, skipping");
        return;
      }
      
      // Wait a bit for connection to stabilize and readerRef to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (shouldStop || stateRef.current.status !== "connected") {
        return;
      }

      isReading = true;

      // Get the reader (reuse existing if available, otherwise create new)
      let reader = readerRef.current;
      if (!reader) {
        try {
          console.log("[CONTINUOUS READER] Creating new reader");
          reader = stateRef.current.port!.readable!.getReader();
          readerRef.current = reader;
        } catch (e) {
          console.error("[CONTINUOUS READER] Failed to get reader:", e);
          isReading = false;
          return;
        }
      } else {
        console.log("[CONTINUOUS READER] Reusing existing reader");
      }

      console.log("[CONTINUOUS READER] Started continuous reading loop");
      
      // NOTE: This is NOT a busy loop! await reader.read() suspends the async function
      // and waits for OS-level COM port notifications. CPU usage is ~0% when idle.
      // The browser uses OS APIs (WaitCommEvent on Windows, epoll on Linux) to wake
      // this promise only when data arrives - it's event-driven, not polling.

      try {
        while (!shouldStop && stateRef.current.status === "connected" && stateRef.current.port) {
          try {
            // This await suspends the function until data arrives - NO CPU USED while waiting
            const { value, done } = await reader.read();
            if (done) {
              console.log("[CONTINUOUS READER] Reader done");
              break;
            }

            if (value && value.length > 0) {
              // Console log RX bytes
              const hexBytes = Array.from(new Uint8Array(value))
                .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
                .join(" ");
              console.log(`[CONTINUOUS READER] RX (${value.length} bytes):`, hexBytes);
              
              try {
                const textData = new TextDecoder("utf-8", { fatal: false }).decode(value);
                console.log(`[CONTINUOUS READER] RX (text):`, textData.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\0/g, "\\0"));
              } catch (e) {
                console.log(`[CONTINUOUS READER] RX: Binary data (not text)`);
              }

              // Broadcast to all subscribers immediately
              serialDataSubscribersRef.current.forEach((callback: SerialDataCallback) => {
                try {
                  callback(value, false);
                } catch (e) {
                  console.error("[CONTINUOUS READER] Subscriber error:", e);
                }
              });
            }
          } catch (error) {
            console.error("[CONTINUOUS READER] Read error:", error);
            // Don't break on error - might be temporary, keep trying
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error("[CONTINUOUS READER] Reader loop error:", error);
      } finally {
        isReading = false;
        console.log("[CONTINUOUS READER] Stopped continuous reading loop");
      }
    };

    // Start reading after connection is established
    startContinuousReading();

    return () => {
      shouldStop = true;
      isReading = false;
      console.log("[CONTINUOUS READER] Cleanup - stopping reader loop");
    };
  }, [state.status, state.port]);

  // Health check for connection - detects when port becomes inaccessible
  // Uses performDisconnect to ensure all components are updated
  useEffect(() => {
    if (state.status === "connected" && state.port) {
      healthCheckRef.current = setInterval(async () => {
        // Use stateRef to get the latest state
        const currentState = stateRef.current;
        if (currentState.port) {
          try {
            // Try to check if port is still accessible
            if (currentState.port.readable && currentState.port.writable) {
              // Connection is still alive
            } else {
              // Port is no longer accessible - use main disconnect function
              await performDisconnect();
            }
          } catch (error) {
            // Port is likely disconnected - use main disconnect function
            await performDisconnect();
          }
        }
      }, 1000);
    } else {
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
        healthCheckRef.current = null;
      }
    }

    return () => {
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
    };
  }, [state.status, state.port, performDisconnect]);

  // Send command and read response using existing reader
  const sendCommandAndReadResponse = useCallback(async (command: string, timeoutMs: number = 5000): Promise<Uint8Array | null> => {
    const currentState = stateRef.current;
    if (!currentState.port || currentState.status !== "connected") {
      return null;
    }

    try {
      // Check if readable is locked
      const readable = currentState.port.readable;
      if (!readable) {
        console.log(`[SEND COMMAND] Port readable stream not available`);
        return null;
      }

      // Get a writer (temporarily)
      const writer = currentState.port.writable?.getWriter();
      if (!writer) {
        console.log(`[SEND COMMAND] Port not writable`);
        return null;
      }

      // Send command
      const commandBytes = new TextEncoder().encode(command);
      const hexBytes = Array.from(commandBytes)
        .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");
      console.log(`[SEND COMMAND] TX (${commandBytes.length} bytes):`, hexBytes);
      console.log(`[SEND COMMAND] TX (text):`, command.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
      
      await writer.write(commandBytes);
      console.log(`[SEND COMMAND] Successfully wrote ${commandBytes.length} bytes`);
      writer.releaseLock();

      // Use existing reader if available (it's kept for monitoring)
      const reader = readerRef.current;
      if (!reader) {
        return null;
      }

      // Read response with timeout using the existing reader
      const chunks: Uint8Array[] = [];
      let responseReceived = false;
      let timeoutId: NodeJS.Timeout | null = null;

      const timeoutPromise = new Promise<Uint8Array | null>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(null);
        }, timeoutMs);
      });

      const readPromise = (async (): Promise<Uint8Array | null> => {
        try {
          // Read until we get a complete response or timeout
          let readCount = 0;
          const maxReads = 100; // Safety limit
          
          while (readCount < maxReads && !responseReceived) {
            const { value, done } = await reader.read();
            if (done) break;
            
            if (value) {
              chunks.push(value);
              
              // Combine chunks and check for binary response
              const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }

              // Look for binary response (starts with 0x00 or 0x01)
              for (let i = 0; i < combined.length; i++) {
                if (combined[i] === 0x00 || combined[i] === 0x01) {
                  // Found binary header, check if we have enough data (at least 4 bytes)
                  if (i + 4 <= combined.length) {
                    // Estimate expected size - we need at least the header
                    // For devicetest, minimum is 4 bytes, max is around 20 bytes
                    // If we have at least 4 bytes, we can parse it
                    responseReceived = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    return combined.slice(i);
                  }
                }
              }

              // Safety: if we have a lot of data and found a binary header, try to return it
              if (totalLength >= 4) {
                for (let i = 0; i < combined.length; i++) {
                  if (combined[i] === 0x00 || combined[i] === 0x01) {
                    responseReceived = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    return combined.slice(i);
                  }
                }
              }
            }
            
            readCount++;
          }

          // Final attempt to find binary data
          if (chunks.length > 0) {
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            
            for (let i = 0; i < combined.length; i++) {
              if (combined[i] === 0x00 || combined[i] === 0x01) {
                responseReceived = true;
                if (timeoutId) clearTimeout(timeoutId);
                return combined.slice(i);
              }
            }
          }

          return null;
        } catch (error) {
          return null;
        }
      })();

      const result = await Promise.race([readPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      
      return result;
    } catch (error) {
      return null;
    }
  }, []);

  // Send binary API command and wait for binary response
  // 
  // Protocol Coexistence:
  // - Text commands (terminal): Send text like ".website()\n" or "km.info()\n"
  //   → Firmware detects text (starts with '.' or 'k') → parses as text command
  //   → Returns text response → Terminal displays it
  // 
  // - Binary commands (API): Send binary frame [0x50] [CMD] [LEN] [PAYLOAD] [CRC]
  //   → Firmware detects 0x50 start byte → parses as binary command
  //   → Returns binary framed response → API extracts payload
  // 
  // Both protocols coexist because:
  // 1. Different start bytes: Binary=0x50, Text='.' or 'k'
  // 2. Firmware parser checks start byte first, routes accordingly
  // 3. Terminal and API can operate simultaneously without interference
  // 4. Continuous reader broadcasts all data, but each consumer filters what it needs
  //
  // Usage example:
  //   const response = await sendBinaryCommand(UART0_CMD_WEBSITE);
  //   if (response) { /* parse website binary data */ }
  const sendBinaryCommand = useCallback(async (
    cmd: number, 
    payload?: Uint8Array, 
    timeoutMs?: number,
    maxRetries?: number
  ): Promise<Uint8Array | null> => {
    const currentState = stateRef.current;
    if (currentState.status !== "connected" || !currentState.port) {
      console.log(`[BINARY API] Not connected`);
      return null;
    }

    // Auto-calculate timeout and retries based on detected baud rate
    const baudRate = currentState.detectedBaudRate ?? 115200; // Default to 115200 if unknown
    const calculatedTimeout = timeoutMs ?? calculateTimeout(baudRate);
    const calculatedRetries = maxRetries ?? calculateMaxRetries(baudRate);

    // Retry loop: attempt up to calculatedRetries times
    for (let attempt = 1; attempt <= calculatedRetries; attempt++) {
      try {
        // Build and send binary frame
        const frame = buildBinaryFrame(cmd, payload || null);
        console.log(`[BINARY API] Attempt ${attempt}/${calculatedRetries}: Sending command 0x${cmd.toString(16)}`);

        const writer = currentState.port.writable?.getWriter();
        if (!writer) {
          console.log(`[BINARY API] Port not writable`);
          return null;
        }

        await writer.write(frame);
        writer.releaseLock();

        // Get reader
        const reader = currentState.port.readable?.getReader();
        if (!reader) {
          console.log(`[BINARY API] No reader available`);
          return null;
        }

        // Read binary response with timeout
        const chunks: Uint8Array[] = [];
        let responseReceived = false;
        let timeoutId: NodeJS.Timeout | null = null;

        const timeoutPromise = new Promise<Uint8Array | null>((resolve) => {
          timeoutId = setTimeout(() => {
            console.log(`[BINARY API] Timeout waiting for response (${calculatedTimeout}ms, attempt ${attempt}/${calculatedRetries})`);
            resolve(null);
          }, calculatedTimeout);
        });

        const readPromise = (async (): Promise<Uint8Array | null> => {
          try {
            let readCount = 0;
            const maxReads = 200; // Safety limit
            
            while (readCount < maxReads && !responseReceived) {
              const { value, done } = await reader.read();
              if (done) break;
              
              if (value) {
                chunks.push(value);
                
                // Combine chunks and look for binary frame
                const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) {
                  combined.set(chunk, offset);
                  offset += chunk.length;
                }

                // Look for binary frame (starts with 0x50)
                const parsed = parseBinaryFrame(combined);
                if (parsed && parsed.cmd === cmd) {
                  console.log(`[BINARY API] Received valid binary response (attempt ${attempt}/${calculatedRetries}), payload size: ${parsed.payload.length}`);
                  responseReceived = true;
                  if (timeoutId) clearTimeout(timeoutId);
                  return parsed.payload;
                } else if (parsed === null && chunks.length > 0) {
                  // CRC mismatch - will retry
                  console.warn(`[BINARY API] CRC mismatch (attempt ${attempt}/${calculatedRetries})`);
                }
              }
              
              readCount++;
            }

            return null;
          } catch (error) {
            console.error(`[BINARY API] Read error (attempt ${attempt}/${calculatedRetries}):`, error);
            return null;
          }
        })();

        const result = await Promise.race([readPromise, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        
        // Cleanup reader
        reader.releaseLock();
        
        // If we got a valid response, return it
        if (result && result instanceof Uint8Array && result.length > 0) {
          return result;
        }
        
        // Retry if not last attempt
        if (attempt < calculatedRetries) {
          const retryDelay = calculateRetryDelay(baudRate, 5);
          console.log(`[BINARY API] Retrying in ${retryDelay}ms... (attempt ${attempt}/${calculatedRetries} failed)`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      } catch (error) {
        console.error(`[BINARY API] Error on attempt ${attempt}/${calculatedRetries}:`, error);
        if (attempt < calculatedRetries) {
          const retryDelay = calculateRetryDelay(baudRate, 5);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      }
    }
    
    return null;
  }, []);

  // Subscribe to serial data
  const subscribeToSerialData = useCallback((callback: SerialDataCallback) => {
    serialDataSubscribersRef.current.add(callback);
    // Return unsubscribe function
    return () => {
      serialDataSubscribersRef.current.delete(callback);
    };
  }, []);

  const value: MakcuConnectionContextType = {
    ...state,
    connect,
    disconnect,
    sendCommandAndReadResponse,
    sendBinaryCommand,
    subscribeToSerialData,
    isConnecting,
    browserSupported,
  };

  return (
    <MakcuConnectionContext.Provider value={value}>
      {children}
    </MakcuConnectionContext.Provider>
  );
}

export function useMakcuConnection() {
  const context = useContext(MakcuConnectionContext);
  if (context === undefined) {
    throw new Error("useMakcuConnection must be used within a MakcuConnectionProvider");
  }
  return context;
}

