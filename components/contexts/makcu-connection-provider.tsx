"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { ESPLoader, LoaderOptions, Transport } from "esptool-js";
import { serial } from "web-serial-polyfill";
import { toast } from "sonner";

const DEVICE_INFO_COOKIE = "makcu_device_info";
const DEVICE_INFO_EXPIRY_HOURS = 1;

function setCookie(name: string, value: string, hours: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function parseAndStoreDeviceInfoBinary(data: Uint8Array): void {
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ========== STARTING PARSE ==========");
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Data length:", data.length);
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Full data array:", Array.from(data));
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Data as hex:", Array.from(data).map(b => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`).join(' '));
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: First 100 bytes:", Array.from(data.slice(0, Math.min(100, data.length))));
  
  // Try to decode readable strings from the data
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ========== DECODING READABLE STRINGS ==========");
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
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Found readable strings:", foundStrings);
  
  // Show structure breakdown
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ========== STRUCTURE BREAKDOWN ==========");
  let debugPos = 1; // After header
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 5, ": MAC1");
  debugPos += 6;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 5, ": MAC2");
  debugPos += 6;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 3, ": TEMP (float)");
  debugPos += 4;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 3, ": RAM (uint32)");
  debugPos += 4;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 3, ": CPU (uint32)");
  debugPos += 4;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 3, ": UP (uint32)");
  debugPos += 4;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 1, ": VID (uint16)");
  debugPos += 2;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 1, ": PID (uint16)");
  debugPos += 2;
  console.log("[DEBUG] Position", debugPos, ": MOUSE_BINT (uint8)");
  debugPos += 1;
  console.log("[DEBUG] Position", debugPos, ": KBD_BINT (uint8)");
  debugPos += 1;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 31, ": FW (32 bytes)");
  debugPos += 32;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 31, ": MAKCU (32 bytes)");
  debugPos += 32;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 63, ": VENDOR (64 bytes)");
  debugPos += 64;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 63, ": MODEL (64 bytes)");
  debugPos += 64;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 63, ": ORIGINAL_SERIAL (64 bytes) - CURRENT POSITION");
  debugPos += 64;
  console.log("[DEBUG] Position", debugPos, "-", debugPos + 63, ": SPOOFED_SERIAL (64 bytes)");
  debugPos += 64;
  console.log("[DEBUG] Position", debugPos, ": SPOOF_ACTIVE (1 byte)");
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Expected total:", debugPos + 1, "bytes");
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Actual received:", data.length, "bytes");
  
  if (data.length < 1) {
    console.warn("[DEBUG] parseAndStoreDeviceInfoBinary: Data too short (< 1 byte)");
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    return;
  }

  let pos = 0;
  const header = data[pos++];
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Header byte:", header, `(0x${header.toString(16).padStart(2, '0').toUpperCase()})`);
  
  // Header: 0x00 = no device, 0x01 = has device
  if (header === 0x00) {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Header indicates no device (0x00)");
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    return;
  }

  // New format: 356 bytes (1 header + 6 MAC1 + 6 MAC2 + 4 TEMP + 4 RAM + 4 CPU + 4 UP + 2 VID + 2 PID + 1 MOUSE_BINT + 1 KBD_BINT + 32 FW + 32 MAKCU + 64 VENDOR + 64 MODEL + 64 ORIGINAL_SERIAL + 64 SPOOFED_SERIAL + 1 SPOOF_ACTIVE)
  const NEW_FORMAT_SIZE = 356;
  
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Expected size:", NEW_FORMAT_SIZE, "Actual size:", data.length, "Difference:", data.length - NEW_FORMAT_SIZE);
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Missing bytes:", Math.max(0, NEW_FORMAT_SIZE - data.length));
  
  if (header !== 0x01 || data.length < NEW_FORMAT_SIZE) {
    // Invalid or incomplete response
    console.warn("[DEBUG] parseAndStoreDeviceInfoBinary: Invalid header or data too short. Header:", header, "Expected: 1, Data length:", data.length, "Required:", NEW_FORMAT_SIZE);
    console.warn("[DEBUG] parseAndStoreDeviceInfoBinary: Missing", Math.max(0, NEW_FORMAT_SIZE - data.length), "bytes");
    console.warn("[DEBUG] parseAndStoreDeviceInfoBinary: Last 20 bytes received:", Array.from(data.slice(Math.max(0, data.length - 20))));
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    return;
  }

  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Valid header (0x01), starting to parse fields...");
  const deviceInfo: Record<string, any> = {};

  // MAC1 (6 bytes)
  const mac1Bytes = data.slice(pos, pos + 6);
  const mac1 = Array.from(mac1Bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  deviceInfo.MAC1 = mac1;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MAC1:", mac1, "bytes:", Array.from(mac1Bytes));
  pos += 6;

  // MAC2 (6 bytes)
  const mac2Bytes = data.slice(pos, pos + 6);
  const mac2 = Array.from(mac2Bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
  deviceInfo.MAC2 = mac2;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MAC2:", mac2, "bytes:", Array.from(mac2Bytes));
  pos += 6;

  // TEMP (float, 4 bytes)
  const tempView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const temp = tempView.getFloat32(0, true); // little-endian
  if (temp >= 0) {
    deviceInfo.TEMP = `${temp.toFixed(1)}c`;
  } else {
    deviceInfo.TEMP = "na";
  }
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: TEMP:", deviceInfo.TEMP, "raw float:", temp);
  pos += 4;

  // RAM (uint32_t, 4 bytes)
  const ramView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const ram = ramView.getUint32(0, true); // little-endian
  deviceInfo.RAM = `${ram}kb`;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: RAM:", deviceInfo.RAM, "raw:", ram);
  pos += 4;

  // CPU (uint32_t, 4 bytes)
  const cpuView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const cpu = cpuView.getUint32(0, true); // little-endian
  deviceInfo.CPU = `${cpu}mhz`;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: CPU:", deviceInfo.CPU, "raw:", cpu);
  pos += 4;

  // Uptime (uint32_t, 4 bytes, seconds)
  const uptimeView = new DataView(data.buffer, data.byteOffset + pos, 4);
  const uptimeSeconds = uptimeView.getUint32(0, true); // little-endian
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  deviceInfo.UP = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: UP:", deviceInfo.UP, "raw seconds:", uptimeSeconds);
  pos += 4;

  // VID (uint16_t, 2 bytes)
  const vidView = new DataView(data.buffer, data.byteOffset + pos, 2);
  const vid = vidView.getUint16(0, true); // little-endian
  deviceInfo.VID = vid.toString(16).toUpperCase().padStart(4, '0');
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: VID:", deviceInfo.VID, "raw:", vid);
  pos += 2;

  // PID (uint16_t, 2 bytes)
  const pidView = new DataView(data.buffer, data.byteOffset + pos, 2);
  const pid = pidView.getUint16(0, true); // little-endian
  deviceInfo.PID = pid.toString(16).toUpperCase().padStart(4, '0');
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: PID:", deviceInfo.PID, "raw:", pid);
  pos += 2;

  // MOUSE_BINT (uint8_t, 1 byte)
  deviceInfo.MOUSE_BINT = data[pos++].toString();
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MOUSE_BINT:", deviceInfo.MOUSE_BINT);

  // KBD_BINT (uint8_t, 1 byte)
  deviceInfo.KBD_BINT = data[pos++].toString();
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: KBD_BINT:", deviceInfo.KBD_BINT);

  // FW version string (null-terminated, max 32 bytes)
  const fwEnd = data.indexOf(0, pos);
  if (fwEnd >= pos) {
    deviceInfo.FW = new TextDecoder().decode(data.slice(pos, fwEnd));
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: FW:", deviceInfo.FW);
  } else {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: FW: not found (no null terminator)");
  }
  pos += 32;

  // MAKCU version string (null-terminated, max 32 bytes)
  const makcuEnd = data.indexOf(0, pos);
  if (makcuEnd >= pos) {
    deviceInfo.MAKCU = new TextDecoder().decode(data.slice(pos, makcuEnd));
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MAKCU:", deviceInfo.MAKCU);
  } else {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MAKCU: not found (no null terminator)");
  }
  pos += 32;

  // VENDOR string (null-terminated, max 64 bytes)
  const vendorEnd = data.indexOf(0, pos);
  if (vendorEnd >= pos) {
    const vendor = new TextDecoder().decode(data.slice(pos, vendorEnd));
    if (vendor) deviceInfo.VENDOR = vendor;
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: VENDOR:", deviceInfo.VENDOR || "(empty)");
  } else {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: VENDOR: not found (no null terminator)");
  }
  pos += 64;

  // MODEL string (null-terminated, max 64 bytes)
  const modelEnd = data.indexOf(0, pos);
  if (modelEnd >= pos) {
    const model = new TextDecoder().decode(data.slice(pos, modelEnd));
    if (model) deviceInfo.MODEL = model;
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MODEL:", deviceInfo.MODEL || "(empty)");
  } else {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: MODEL: not found (no null terminator)");
  }
  pos += 64;

  // ORIGINAL_SERIAL string (null-terminated, max 64 bytes)
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: At position", pos, "for ORIGINAL_SERIAL, remaining bytes:", data.length - pos);
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ORIGINAL_SERIAL bytes:", Array.from(data.slice(pos, pos + 64)));
  const origSerialEnd = data.indexOf(0, pos);
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ORIGINAL_SERIAL null terminator at:", origSerialEnd);
  if (origSerialEnd >= pos) {
    const origSerial = new TextDecoder().decode(data.slice(pos, origSerialEnd));
    if (origSerial) deviceInfo.ORIGINAL_SERIAL = origSerial;
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ORIGINAL_SERIAL decoded:", deviceInfo.ORIGINAL_SERIAL || "(empty)");
  } else {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: ORIGINAL_SERIAL: not found (no null terminator)");
  }
  pos += 64;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: After ORIGINAL_SERIAL, pos:", pos, "remaining:", data.length - pos);

  // SPOOFED_SERIAL string (null-terminated, max 64 bytes)
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: At position", pos, "for SPOOFED_SERIAL, remaining bytes:", data.length - pos);
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: SPOOFED_SERIAL bytes:", Array.from(data.slice(pos, pos + 64)));
  const spoofSerialEnd = data.indexOf(0, pos);
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: SPOOFED_SERIAL null terminator at:", spoofSerialEnd);
  if (spoofSerialEnd >= pos) {
    const spoofSerial = new TextDecoder().decode(data.slice(pos, spoofSerialEnd));
    if (spoofSerial) deviceInfo.SPOOFED_SERIAL = spoofSerial;
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: SPOOFED_SERIAL decoded:", deviceInfo.SPOOFED_SERIAL || "(empty)");
  } else {
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: SPOOFED_SERIAL: not found (no null terminator)");
  }
  pos += 64;
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: After SPOOFED_SERIAL, pos:", pos, "remaining:", data.length - pos);

  // SPOOF_ACTIVE flag (1 byte: 0=not spoofed, 1=spoofed)
  if (pos < data.length) {
    const spoofActive = data[pos++];
    deviceInfo.SPOOF_ACTIVE = spoofActive === 1;
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: SPOOF_ACTIVE at pos", pos - 1, "value:", spoofActive, "boolean:", deviceInfo.SPOOF_ACTIVE);
  } else {
    console.error("[DEBUG] parseAndStoreDeviceInfoBinary: SPOOF_ACTIVE: position", pos, "exceeds data length", data.length);
    deviceInfo.SPOOF_ACTIVE = false;
  }

  // Store in cookie as JSON (only if we have vendor or model)
  console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Final parsed deviceInfo:", JSON.stringify(deviceInfo, null, 2));
  if (deviceInfo.VENDOR || deviceInfo.MODEL) {
    const jsonStr = JSON.stringify(deviceInfo);
    console.log("[DEBUG] parseAndStoreDeviceInfoBinary: Storing deviceInfo in cookie, length:", jsonStr.length);
    setCookie(DEVICE_INFO_COOKIE, jsonStr, DEVICE_INFO_EXPIRY_HOURS);
  } else {
    console.warn("[DEBUG] parseAndStoreDeviceInfoBinary: No VENDOR or MODEL found, not storing in cookie");
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

interface MakcuConnectionContextType extends MakcuConnectionState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
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

  // Try to connect in normal mode with specific baud rate and timeout
  const tryNormalMode = async (port: SerialPort, baudRate: number, timeout: number): Promise<boolean> => {
    try {
      console.log("[DEBUG] tryNormalMode: Starting normal mode connection");
      if (!port.writable || !port.readable) {
        console.error("[DEBUG] tryNormalMode: Port not writable or readable");
        return false;
      }

      // Get writer
      const writer = port.writable.getWriter();
      writerRef.current = writer;

      // Send website command (binary format)
      const websiteCommand = ".website()\n";
      console.log(`[DEBUG] tryNormalMode: Sending command at ${baudRate} baud:`, websiteCommand);
      console.log("[DEBUG] tryNormalMode: Command bytes:", Array.from(new TextEncoder().encode(websiteCommand)));
      await writer.write(new TextEncoder().encode(websiteCommand));
      console.log(`[DEBUG] tryNormalMode: Command sent, waiting for response (timeout: ${timeout}ms)...`);

      // Get reader
      const reader = port.readable.getReader();
      readerRef.current = reader;
      console.log("[DEBUG] tryNormalMode: Reader obtained, starting to read...");

      // Read response with timeout (configurable)
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<Uint8Array>((_, reject) => {
        timeoutId = setTimeout(() => {
          console.warn(`[DEBUG] tryNormalMode: Timeout (${timeout}ms) waiting for response at ${baudRate} baud`);
          reader.cancel().catch(() => {});
          reject(new Error("Timeout waiting for response"));
        }, timeout);
      });

      const readPromise = (async () => {
        const chunks: Uint8Array[] = [];
        try {
          while (true) {
            console.log("[DEBUG] tryNormalMode: Reading chunk...");
            const { value, done } = await reader.read();
            if (done) {
              console.log("[DEBUG] tryNormalMode: Reader done");
              break;
            }
            console.log("[DEBUG] tryNormalMode: Received chunk, length:", value.length, "bytes:", Array.from(value.slice(0, Math.min(50, value.length))));
            chunks.push(value);
            
            // Combine chunks to check for binary data
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            
            // Look for binary header (0x00 or 0x01) - might be preceded by text
            let binaryStart = -1;
            for (let i = 0; i < combined.length; i++) {
              if (combined[i] === 0x00 || combined[i] === 0x01) {
                // Check if this looks like the start of our binary data
                // Binary data should be at least 290 bytes after header
                if (i + 290 <= combined.length) {
                  binaryStart = i;
                  break;
                }
              }
            }
            
            // If we found binary data and have enough bytes, return it
            if (binaryStart >= 0 && combined.length >= binaryStart + 290) {
              console.log("[DEBUG] tryNormalMode: Found binary data at offset", binaryStart, "total length:", combined.length);
              console.log("[DEBUG] tryNormalMode: Data before binary start:", Array.from(combined.slice(0, binaryStart)).map(b => String.fromCharCode(b)).join(''));
              console.log("[DEBUG] tryNormalMode: Binary header byte:", combined[binaryStart], `(0x${combined[binaryStart].toString(16).padStart(2, '0').toUpperCase()})`);
              // Wait a bit more to ensure we have the complete response
              await new Promise(resolve => setTimeout(resolve, 200));
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
              // Return only the binary portion
              const binaryData = combined.slice(binaryStart);
              console.log("[DEBUG] tryNormalMode: Returning binary data, length:", binaryData.length);
              console.log("[DEBUG] tryNormalMode: First 20 bytes of binary data:", Array.from(binaryData.slice(0, 20)));
              return binaryData;
            }
            
            // If we have data but no binary header yet, keep reading
            if (totalLength > 500) {
              // Too much data without finding binary - might be an error
              console.warn("[DEBUG] tryNormalMode: Too much data (>500 bytes) without finding binary header");
              break;
            }
          }
        } catch (error) {
          console.error("[DEBUG] tryNormalMode: Error during read:", error);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          throw error;
        }
        // Combine all chunks into single Uint8Array
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Try to find binary data in the final combined array
        let binaryStart = -1;
        for (let i = 0; i < combined.length; i++) {
          if (combined[i] === 0x00 || combined[i] === 0x01) {
            if (i + 290 <= combined.length) {
              binaryStart = i;
              break;
            }
          }
        }
        
        if (binaryStart >= 0) {
          console.log("[DEBUG] tryNormalMode: Found binary data in final combined array at offset", binaryStart);
          const binaryData = combined.slice(binaryStart);
          console.log("[DEBUG] tryNormalMode: Binary header byte:", binaryData[0], `(0x${binaryData[0].toString(16).padStart(2, '0').toUpperCase()})`);
          console.log("[DEBUG] tryNormalMode: First 20 bytes of binary data:", Array.from(binaryData.slice(0, 20)));
          return binaryData;
        }
        
        console.log("[DEBUG] tryNormalMode: No binary header found, returning all data, length:", combined.length);
        console.log("[DEBUG] tryNormalMode: First 50 bytes of all data:", Array.from(combined.slice(0, Math.min(50, combined.length))));
        return combined;
      })();

      try {
        console.log("[DEBUG] tryNormalMode: Racing read promise vs timeout...");
        const response = await Promise.race([readPromise, timeoutPromise]);
        console.log("[DEBUG] tryNormalMode: Got response, type:", typeof response, "length:", response instanceof Uint8Array ? response.length : "N/A");
        
        // Parse and store device info from binary response
        if (response && response instanceof Uint8Array) {
          console.log("[DEBUG] tryNormalMode: Parsing device info from binary response");
          console.log("[DEBUG] tryNormalMode: Response data being passed to parser - length:", response.length);
          console.log("[DEBUG] tryNormalMode: Response data first 20 bytes:", Array.from(response.slice(0, Math.min(20, response.length))));
          parseAndStoreDeviceInfoBinary(response);
        }
        
        // Check if we got a valid response (at least 1 byte)
        if (response && response instanceof Uint8Array && response.length >= 1) {
          console.log("[DEBUG] tryNormalMode: Valid response received, connection successful!");
          // Keep reader active for monitoring
          if (writerRef.current) {
            writerRef.current.releaseLock();
            writerRef.current = null;
          }
          return true;
        } else {
          console.warn("[DEBUG] tryNormalMode: Invalid or empty response");
        }
      } catch (error) {
        console.error("[DEBUG] tryNormalMode: Error in Promise.race:", error);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        throw error;
      } finally {
        // Don't release reader - keep it for monitoring
      }

      console.warn("[DEBUG] tryNormalMode: Returning false - connection failed");
      return false;
    } catch (error) {
      console.error("[DEBUG] tryNormalMode: Exception caught:", error);
      cleanup();
      return false;
    }
  };

  // Try to connect in flash mode
  // Note: Flash mode uses its own baud rates (921600 for flash, 115200 for ROM)
  // The website baud rate setting is ignored - ESPLoader handles its own baud rates
  // After flashing, users reconnect anyway, so baud rate returns to website value
  const tryFlashMode = async (port: SerialPort): Promise<{ transport: Transport; loader: ESPLoader } | null> => {
    try {
      console.log("[DEBUG] tryFlashMode: Starting flash mode connection");
      // Close the port first if it's open (required before reopening for flash mode)
      try {
        console.log("[DEBUG] tryFlashMode: Closing port...");
        await port.close();
        console.log("[DEBUG] tryFlashMode: Port closed");
      } catch (e) {
        console.log("[DEBUG] tryFlashMode: Port might not be open, error:", e);
      }

      // Reopen for flash mode - Transport/ESPLoader will use its own baud rates
      // This ignores the website baud rate setting (115200 or 4M)
      console.log("[DEBUG] tryFlashMode: Creating Transport...");
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

      console.log("[DEBUG] tryFlashMode: Creating ESPLoader...");
      const loader = new ESPLoader(flashOptions);
      console.log("[DEBUG] tryFlashMode: Calling loader.main()...");
      await loader.main();
      console.log("[DEBUG] tryFlashMode: Flash mode connection successful!");
      
      return { transport, loader };
    } catch (error) {
      console.error("[DEBUG] tryFlashMode: Error:", error);
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
    // Very visible console message
    console.log("%c[DEBUG] ========== CONNECTION STARTING ==========", "color: blue; font-size: 14px; font-weight: bold");
    console.log("[DEBUG] connect: Starting connection process");
    if (isConnecting) {
      console.log("[DEBUG] connect: Already connecting, aborting");
      return;
    }
    if (state.status === "connected") {
      console.log("[DEBUG] connect: Already connected, aborting");
      return;
    }

    setIsConnecting(true);
    setState((prev) => ({ ...prev, status: "connecting" }));
    console.log("[DEBUG] connect: Status set to 'connecting'");

    try {
      const Navigator = navigator as Navigator & { serial?: Serial };
      if (!Navigator.serial) {
        throw new Error("WebSerial API not supported");
      }

      // Request port
      console.log("[DEBUG] connect: Requesting serial port...");
      const selectedPort = await Navigator.serial.requestPort();
      console.log("[DEBUG] connect: Port selected:", selectedPort);
      
      // Auto-detect baud rate: Try 115200 first, then 4M, then flash mode
      let detectedBaudRate: number | null = null;
      let normalModeSuccess = false;

      // Step 1: Try 115200 with 1000ms timeout (1 second)
      console.log("[DEBUG] connect: Step 1 - Trying 115200 baud with 1000ms timeout...");
      try {
        await selectedPort.open({
          baudRate: 115200,
          dataBits: 8,
          stopBits: 1,
          parity: "none",
          flowControl: "none",
        });
        console.log("[DEBUG] connect: Port opened at 115200 baud");
        normalModeSuccess = await tryNormalMode(selectedPort, 115200, 1000);
        if (normalModeSuccess) {
          detectedBaudRate = 115200;
          console.log("[DEBUG] connect: Success at 115200 baud!");
        } else {
          console.log("[DEBUG] connect: Failed at 115200 baud, closing port...");
          await selectedPort.close();
        }
      } catch (error) {
        console.error("[DEBUG] connect: Error at 115200 baud:", error);
        try {
          await selectedPort.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      // Step 2: If 115200 failed, try 4M (4000000) with 500ms timeout
      if (!normalModeSuccess) {
        console.log("[DEBUG] connect: Step 2 - Trying 4M baud with 500ms timeout...");
        try {
          await selectedPort.open({
            baudRate: 4000000,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            flowControl: "none",
          });
          console.log("[DEBUG] connect: Port opened at 4M baud");
          normalModeSuccess = await tryNormalMode(selectedPort, 4000000, 500);
          if (normalModeSuccess) {
            detectedBaudRate = 4000000;
            console.log("[DEBUG] connect: Success at 4M baud!");
          } else {
            console.log("[DEBUG] connect: Failed at 4M baud, closing port...");
            await selectedPort.close();
          }
        } catch (error) {
          console.error("[DEBUG] connect: Error at 4M baud:", error);
          try {
            await selectedPort.close();
          } catch (e) {
            // Ignore close errors
          }
        }
      }

      // Step 3: If normal mode succeeded, set state
      if (normalModeSuccess && detectedBaudRate) {
        console.log("[DEBUG] connect: Normal mode successful at", detectedBaudRate, "baud!");
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
      console.log("[DEBUG] connect: Step 3 - Both normal mode attempts failed, trying flash mode...");
      await cleanup();
      const flashResult = await tryFlashMode(selectedPort);
      console.log("[DEBUG] connect: Flash mode result:", flashResult ? "success" : "failed");

      if (flashResult) {
        // Flash mode connected successfully
        console.log("[DEBUG] connect: Flash mode successful!");
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
      console.error("[DEBUG] connect: Both normal and flash mode failed");
      try {
        await selectedPort.close();
      } catch (e) {
        console.warn("[DEBUG] connect: Error closing port:", e);
      }
      setState((prev) => ({ ...prev, status: "fault", mode: null, port: null, detectedBaudRate: null }));
      toast.error("Connection failed - device not responding");

    } catch (error) {
      console.error("[DEBUG] connect: Exception caught:", error);
      const message = error instanceof Error ? error.message : String(error);
      console.error("[DEBUG] connect: Error message:", message);
      if (!message.includes("Must be handling a user gesture")) {
        setState((prev) => ({ ...prev, status: "fault" }));
        toast.error(message);
      } else {
        console.log("[DEBUG] connect: User gesture error, setting to disconnected");
        setState((prev) => ({ ...prev, status: "disconnected" }));
      }
    } finally {
      console.log("[DEBUG] connect: Connection process finished, setting isConnecting to false");
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
        // - The settings page (via MakcuSettings component)
        // - The firmware page (via DeviceTool component)
        await performDisconnect();
      }
    };

    Navigator.serial.addEventListener("disconnect", handleDisconnect);

    return () => {
      Navigator.serial?.removeEventListener("disconnect", handleDisconnect);
    };
  }, [performDisconnect]);

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

  const value: MakcuConnectionContextType = {
    ...state,
    connect,
    disconnect,
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

