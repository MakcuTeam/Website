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

  // New format: 356 bytes (1 header + 6 MAC1 + 6 MAC2 + 4 TEMP + 4 RAM + 4 CPU + 4 UP + 2 VID + 2 PID + 1 MOUSE_BINT + 1 KBD_BINT + 32 FW + 32 MAKCU + 64 VENDOR + 64 MODEL + 64 ORIGINAL_SERIAL + 64 SPOOFED_SERIAL + 1 SPOOF_ACTIVE)
  const NEW_FORMAT_SIZE = 356;
  
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
      if (!port.writable || !port.readable) {
        return false;
      }

      // Get writer
      const writer = port.writable.getWriter();
      writerRef.current = writer;

      // Send website command (binary format)
      const websiteCommand = ".website()\n";
      await writer.write(new TextEncoder().encode(websiteCommand));

      // Get reader
      const reader = port.readable.getReader();
      readerRef.current = reader;

      // Read response with timeout (configurable)
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<Uint8Array>((_, reject) => {
        timeoutId = setTimeout(() => {
          reader.cancel().catch(() => {});
          reject(new Error("Timeout waiting for response"));
        }, timeout);
      });

      const readPromise = (async () => {
        const chunks: Uint8Array[] = [];
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              break;
            }
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
                // Binary data should be at least 356 bytes after header (new format with both serials)
                if (i + 356 <= combined.length) {
                  binaryStart = i;
                  break;
                }
              }
            }
            
            // If we found binary data and have enough bytes, return it
            if (binaryStart >= 0 && combined.length >= binaryStart + 356) {
              // Wait a bit more to ensure we have the complete response
              await new Promise(resolve => setTimeout(resolve, 200));
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
              // Return only the binary portion
              const binaryData = combined.slice(binaryStart);
              return binaryData;
            }
            
            // If we have data but no binary header yet, keep reading
            if (totalLength > 500) {
              // Too much data without finding binary - might be an error
              break;
            }
          }
        } catch (error) {
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
            if (i + 356 <= combined.length) {
              binaryStart = i;
              break;
            }
          }
        }
        
        if (binaryStart >= 0) {
          const binaryData = combined.slice(binaryStart);
          return binaryData;
        }
        
        return combined;
      })();

      try {
        const response = await Promise.race([readPromise, timeoutPromise]);
        
        // Parse and store device info from binary response
        if (response && response instanceof Uint8Array) {
          parseAndStoreDeviceInfoBinary(response);
        }
        
        // Check if we got a valid response (at least 1 byte)
        if (response && response instanceof Uint8Array && response.length >= 1) {
          // Keep reader active for monitoring
          if (writerRef.current) {
            writerRef.current.releaseLock();
            writerRef.current = null;
          }
          return true;
        }
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        throw error;
      } finally {
        // Don't release reader - keep it for monitoring
      }

      return false;
    } catch (error) {
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
      
      // Auto-detect baud rate: Try 115200 first, then 4M, then flash mode
      let detectedBaudRate: number | null = null;
      let normalModeSuccess = false;

      // Step 1: Try 115200 with 1000ms timeout (1 second)
      try {
        await selectedPort.open({
          baudRate: 115200,
          dataBits: 8,
          stopBits: 1,
          parity: "none",
          flowControl: "none",
        });
        normalModeSuccess = await tryNormalMode(selectedPort, 115200, 1000);
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

      // Step 2: If 115200 failed, try 4M (4000000) with 500ms timeout
      if (!normalModeSuccess) {
        try {
          await selectedPort.open({
            baudRate: 4000000,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            flowControl: "none",
          });
          normalModeSuccess = await tryNormalMode(selectedPort, 4000000, 500);
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

