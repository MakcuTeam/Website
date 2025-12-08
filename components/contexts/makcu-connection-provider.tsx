"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { ESPLoader, LoaderOptions, Transport } from "esptool-js";
import { serial } from "web-serial-polyfill";
import { toast } from "sonner";

// Import all modular functions and types
import {
  // Types
  type MakcuConnectionState,
  type MakcuStatus,
  type SerialDataCallback,
  type BinaryFrameSubscriber,
  type TextLogSubscriber,
  type MakcuConnectionContextType,
  type ConnectionMode,
  type ConnectionStatus,
  type TestStatus,
  type MouseTestResults,
  type KeyboardTestResults,
  type DeviceTestResult,
  // Constants
  UART0_START_BYTE,
  UART0_CMD_STATUS,
  UART0_CMD_GET_MAC1,
  UART0_CMD_GET_MAC2,
  UART0_CMD_GET_TEMP,
  UART0_CMD_GET_RAM,
  UART0_CMD_GET_CPU,
  UART0_CMD_GET_UPTIME,
  UART0_CMD_GET_VID,
  UART0_CMD_GET_PID,
  UART0_CMD_GET_MOUSE_BINT,
  UART0_CMD_GET_KBD_BINT,
  UART0_CMD_GET_FW_VERSION,
  UART0_CMD_GET_MAKCU_VERSION,
  UART0_CMD_GET_VENDOR,
  UART0_CMD_GET_MODEL,
  UART0_CMD_GET_ORIG_SERIAL,
  UART0_CMD_GET_SPOOF_SERIAL,
  UART0_CMD_GET_SPOOF_ACTIVE,
  UART0_CMD_GET_SCREEN_W,
  UART0_CMD_GET_SCREEN_H,
  UART0_CMD_GET_FAULT,
  BAUD_RATES,
  SERIAL_PORT_CONFIG,
  CONNECTION_DELAYS,
  CONNECTION_TIMEOUTS,
  DEVICE_INFO_COOKIE,
  DEVICE_INFO_EXPIRY_HOURS,
  // Protocol
  buildBinaryFrame,
  parseBinaryFrame,
  // Parsers
  parseStatusResponse,
  parseDeviceTestResponse,
  routeApiCommand,
  registerApiCommandParser,
  // Utils
  calculateTimeout,
  openPortWithBaudRate,
  safeClosePort,
  getComPort,
  setCookie,
  getCookie,
  deleteCookie,
} from "./makcu";

// Protocol functions (binary framing/parsing) now in makcu/protocol.ts

// Parser functions, command registry, and cookie utilities are now in makcu/parsers.ts and makcu/utils.ts

/* ═══════════════════════════════════════════════════════════════════════════
 * Build Device Info from Individual Command Responses
 * Uses the command router to parse each response
 * ═══════════════════════════════════════════════════════════════════════════ */
function buildAndStoreDeviceInfo(commandResponses: Map<number, Uint8Array>): void {
  // Initialize all expected fields with empty/default values - always store all fields
  // NOTE: TEMP is not stored here - it comes from STATUS (0xD4) live poll
  const deviceInfo: Record<string, any> = {
    VENDOR: "",
    MODEL: "",
    ORIGINAL_SERIAL: "",
    SPOOFED_SERIAL: "",
    SPOOF_ACTIVE: false,
    FW: "",
    MAKCU: "",
    MAC1: "00:00:00:00:00:00",
    MAC2: "00:00:00:00:00:00",
    VID: 0,
    PID: 0,
    CPU: 0,
    MOUSE_BINT: 0,
    KBD_BINT: 0,
    SCREEN_SIZE: "",
  };

  // Process each command response using the router
  for (const [cmd, payload] of commandResponses.entries()) {
    const parsed = routeApiCommand(cmd, payload);
    if (parsed) {
      // Debug log for bInterval commands
      if (cmd === UART0_CMD_GET_MOUSE_BINT || cmd === UART0_CMD_GET_KBD_BINT) {
        console.log(`[BUILD DEVICE INFO] ✓ Parsed command 0x${cmd.toString(16).toUpperCase()}:`, parsed);
      }
      Object.assign(deviceInfo, parsed);
    }
  }

  // Handle screen dimensions combination
  if (deviceInfo.SCREEN_W !== undefined && deviceInfo.SCREEN_H !== undefined) {
    const w = typeof deviceInfo.SCREEN_W === 'number' ? deviceInfo.SCREEN_W : 0;
    const h = typeof deviceInfo.SCREEN_H === 'number' ? deviceInfo.SCREEN_H : 0;
    if (w > 0 && h > 0) {
      deviceInfo.SCREEN_SIZE = `${w}x${h}`;
    }
  }

  // Always store cookie with all fields (even if empty) - fields will always return
  const jsonStr = JSON.stringify(deviceInfo);
  setCookie(DEVICE_INFO_COOKIE, jsonStr, DEVICE_INFO_EXPIRY_HOURS);
  console.log(`[DEVICE INFO] Stored device info cookie with ${Object.keys(deviceInfo).length} fields (all fields, including empty):`, deviceInfo);
  console.log(`[DEVICE INFO] 🖱️ Mouse bInterval: ${deviceInfo.MOUSE_BINT} (${deviceInfo.MOUSE_BINT > 0 ? Math.round(1000 / deviceInfo.MOUSE_BINT) + 'Hz' : 'N/A'})`);
  console.log(`[DEVICE INFO] ⌨️ Keyboard bInterval: ${deviceInfo.KBD_BINT} (${deviceInfo.KBD_BINT > 0 ? Math.round(1000 / deviceInfo.KBD_BINT) + 'Hz' : 'N/A'})`);
}

// Get static device info from cookie (VID/PID/vendor/model/serials/etc.)
// Always returns all fields with defaults (even if cookie missing) - does NOT include live data (RAM, uptime)
export function getDeviceInfo(): Record<string, any> {
  // Initialize with all expected fields and defaults
  // NOTE: TEMP is not in static info - it comes from STATUS (0xD4) live poll
  const defaultInfo: Record<string, any> = {
    VENDOR: "",
    MODEL: "",
    ORIGINAL_SERIAL: "",
    SPOOFED_SERIAL: "",
    SPOOF_ACTIVE: false,
    FW: "",
    MAKCU: "",
    MAC1: "00:00:00:00:00:00",
    MAC2: "00:00:00:00:00:00",
    VID: 0,
    PID: 0,
    CPU: 0,
    MOUSE_BINT: 0,
    KBD_BINT: 0,
    SCREEN_SIZE: "",
  };
  
  if (typeof document === "undefined") return defaultInfo;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${DEVICE_INFO_COOKIE}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (cookieValue) {
      try {
        const cookieData = JSON.parse(cookieValue);
        // Merge cookie data with defaults (cookie data takes precedence)
        return { ...defaultInfo, ...cookieData };
      } catch (e) {
        // If cookie parse fails, return defaults
        return defaultInfo;
      }
    }
  }
  
  // Cookie not found - return defaults
  return defaultInfo;
}

// Helper to get combined device info (static + live)
// Always returns all fields (even if empty/default) - RAM, UPTIME, and TEMP always included from live data
export function getCombinedDeviceInfo(mcuStatus: MakcuStatus | null): Record<string, string> {
  // Initialize with all fields and defaults (always return all fields)
  const staticInfo = getDeviceInfo() || {};
  
  // Initialize defaults for any missing static fields
  const defaultStaticInfo: Record<string, any> = {
    VENDOR: "",
    MODEL: "",
    ORIGINAL_SERIAL: "",
    SPOOFED_SERIAL: "",
    SPOOF_ACTIVE: false,
    FW: "",
    MAKCU: "",
    MAC1: "00:00:00:00:00:00",
    MAC2: "00:00:00:00:00:00",
    VID: 0,
    PID: 0,
    CPU: 0,
    MOUSE_BINT: 0,
    KBD_BINT: 0,
    SCREEN_SIZE: "",
  };
  
  // Merge static info with defaults
  const mergedStatic = { ...defaultStaticInfo, ...staticInfo };
  
  // Always include live data (RAM, UPTIME, TEMP) - use defaults if no status
  let ram = "0kb";
  let uptime = "00:00:00";
  let temp = "na";
  
  if (mcuStatus) {
    ram = `${mcuStatus.freeRamKb}kb`;
    const uptimeSeconds = mcuStatus.uptime;
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    uptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    temp = mcuStatus.temp >= 0 ? `${mcuStatus.temp.toFixed(1)}c` : "na";
  }
  
  // Combine static and live data - always return all fields
  return {
    ...mergedStatic,
    RAM: ram,      // Live RAM from STATUS poll (always included)
    UP: uptime,    // Live uptime from STATUS poll (always included)
    TEMP: temp,    // Live temperature from STATUS poll (always included)
  };
}

// Device test types (TestStatus, MouseTestResults, KeyboardTestResults, DeviceTestResult) 
// are now imported from makcu/types.ts

// parseDeviceTestResponse is now imported from makcu/parsers.ts

// Types are now imported from makcu/types.ts

// MakcuConnectionContextType is now imported from makcu/types.ts

const MakcuConnectionContext = createContext<MakcuConnectionContextType | undefined>(undefined);

// Utility functions (calculateTimeout, openPortWithBaudRate, safeClosePort, getComPort) are now imported from makcu/utils.ts

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
  const [mcuStatus, setMcuStatus] = useState<MakcuStatus | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<MakcuConnectionState>(state);
  const serialDataSubscribersRef = useRef<Set<SerialDataCallback>>(new Set());  // Legacy - all data
  const binaryFrameSubscribersRef = useRef<Set<BinaryFrameSubscriber>>(new Set());  // Only 0x50 frames
  const textLogSubscribersRef = useRef<Set<TextLogSubscriber>>(new Set());  // Only non-0x50 data
  const sendBinaryCommandRef = useRef<((cmd: number, payload?: Uint8Array, timeoutMs?: number, maxRetries?: number) => Promise<Uint8Array | null>) | null>(null);
  const deviceInfoFetchedRef = useRef<boolean>(false);  // Track if we've fetched full device info
  const lastDeviceAttachedRef = useRef<boolean>(false); // Track device attached state for change detection
  const binaryFrameBufferRef = useRef<Uint8Array>(new Uint8Array(0)); // Buffer for reconstructing split binary frames

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
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
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
    binaryFrameBufferRef.current = new Uint8Array(0); // Clear frame buffer on cleanup
  }, []);

  // Try to connect in normal mode with specific baud rate and timeout
  // Uses lightweight STATUS command (17-byte payload) instead of full WEBSITE (360+ bytes)
  // This keeps connection fast while still confirming link health
  const tryNormalMode = async (port: SerialPort, baudRate: number, timeout?: number, _maxRetries?: number): Promise<boolean> => {
    const calculatedTimeout = timeout ?? calculateTimeout(baudRate, CONNECTION_TIMEOUTS.STATUS_FRAME_BYTES, CONNECTION_TIMEOUTS.SILENCE_SYMBOLS, false);
    
    console.log(`[TRY NORMAL MODE] Baud: ${baudRate}, Timeout: ${calculatedTimeout}ms, Retries: 1 (CRC removed)`);
    
    if (!port.writable || !port.readable) {
      console.log("[TRY NORMAL MODE] Port not readable/writable");
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, CONNECTION_DELAYS.PORT_STABILIZATION));

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
    try {
      writer = port.writable.getWriter();
      if (!writer) {
        console.log("[TRY NORMAL MODE] Failed to get writer");
        return false;
      }
      const binaryCommand = buildBinaryFrame(UART0_CMD_STATUS, null);
      console.log("[TRY NORMAL MODE] Single attempt using STATUS command (no CRC)");
      await writer.write(binaryCommand);
      writer.releaseLock();
      writer = null;

      reader = port.readable.getReader();
      const currentReader = reader;

      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<Uint8Array | null>((resolve) => {
        timeoutId = setTimeout(() => {
          currentReader.cancel().catch(() => {});
          resolve(null);
        }, calculatedTimeout);
      });

      const readPromise = (async (): Promise<Uint8Array | null> => {
        const chunks: Uint8Array[] = [];
        try {
          while (true) {
            const { value, done } = await currentReader.read();
            if (done) break;
            if (value) {
              chunks.push(value);

              const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }

              let frameStart = -1;
              for (let i = 0; i < combined.length; i++) {
                if (combined[i] === UART0_START_BYTE) {
                  frameStart = i;
                  break;
                }
              }

              if (frameStart >= 0 && combined.length >= frameStart + 4) {
                const payloadLen = combined[frameStart + 2] | (combined[frameStart + 3] << 8);
                const totalFrameLen = 4 + payloadLen;

                if (combined.length >= frameStart + totalFrameLen) {
                  const parsed = parseBinaryFrame(combined.slice(frameStart, frameStart + totalFrameLen));
                  if (parsed && parsed.cmd === UART0_CMD_STATUS) {
                    if (timeoutId) clearTimeout(timeoutId);
                    return parsed.payload;
                  }
                }
              }

              if (totalLength > 100) break;
            }
          }
        } catch (e) {
          // Read error
        }
        return null;
      })();

      const response = await Promise.race([readPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      
      if (reader) {
        try {
          await reader.cancel();
        } catch (e) {
          // Ignore cancel errors
        }
        try {
          reader.releaseLock();
        } catch (e) {
          // Ignore release errors
        }
        reader = null;
      }
      
      if (response && response.length >= 17 && response[0] === 0x01) {
        const status = parseStatusResponse(response);
        if (status) {
          console.log(`[CONNECTION CHECK] STATUS parsed: RAM=${status.freeRamKb}kb, UPTIME=${status.uptime}s, TEMP=${status.temp >= 0 ? status.temp.toFixed(1) + '°C' : 'N/A'}, Device=${status.deviceAttached ? 'attached' : 'detached'}`);
          setMcuStatus(status);
          lastDeviceAttachedRef.current = status.deviceAttached;
        }
        return true;
      }

      console.warn("[TRY NORMAL MODE] No valid STATUS response on single attempt");
      return false;
    } catch (error) {
      console.error("[TRY NORMAL MODE] Error:", error);
      return false;
    } finally {
      // Always release locks in finally block to ensure cleanup
      if (writer) {
        try {
          writer.releaseLock();
        } catch (e) {
          // Ignore
        }
      }
      if (reader) {
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
    }
  };

  // Try to connect in flash mode
      // Note: Flash mode uses its own baud rates (FLASH_MODE for flash, ROM_BOOTLOADER for ROM)
  // The website baud rate setting is ignored - ESPLoader handles its own baud rates
  // After flashing, users reconnect anyway, so baud rate returns to website value
  const tryFlashMode = async (port: SerialPort): Promise<{ transport: Transport; loader: ESPLoader } | null> => {
    try {
      // Ensure any background readers/writers are fully stopped before flash
      await cleanup();
      readerRef.current = null;
      writerRef.current = null;
      
      console.log("[FLASH MODE] Preparing port for flash mode connection");
      
      // Close the port first if it's open (required before reopening for flash mode)
      // This will release all reader/writer locks
      await safeClosePort(port);
      
      // Helper to build loader options
      const buildFlashOptions = (transport: Transport): LoaderOptions => ({
        transport,
        // Force high-speed connect/flash at 921600 (no 115200 step)
        baudrate: BAUD_RATES.FLASH_MODE,
        romBaudrate: BAUD_RATES.FLASH_MODE,
        enableTracing: false,                   // Disable byte-level TRACE logs (removes wait_response traces)
        debugLogging: false,                    // Keep esptool-js debug logs off
        terminal: {
          clean() {},
          writeLine(message: string) {
            const messageBytes = new TextEncoder().encode(message + "\n");
            textLogSubscribersRef.current.forEach((callback: TextLogSubscriber) => {
              try {
                callback(messageBytes);
              } catch (e) {
                console.error("[FLASH MODE] Text log subscriber error:", e);
              }
            });
          },
          write(message: string) {
            const messageBytes = new TextEncoder().encode(message);
            textLogSubscribersRef.current.forEach((callback: TextLogSubscriber) => {
              try {
                callback(messageBytes);
              } catch (e) {
                console.error("[FLASH MODE] Text log subscriber error:", e);
              }
            });
          },
        },
      });

      // Forcefully close and unlock the port to avoid double-open issues
      const hardClosePort = async () => {
        try {
          if (port.readable) {
            try {
              const reader = port.readable.getReader();
              await reader.cancel().catch(() => {});
              reader.releaseLock();
            } catch (e) {
              // ignore
            }
          }
          if (port.writable) {
            try {
              const writer = port.writable.getWriter();
              writer.releaseLock();
            } catch (e) {
              // ignore
            }
          }
          if (port.readable || port.writable) {
            try {
              await port.close();
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      };

      // Run ESPLoader with optional suppression and return loader
      const runLoader = async (transport: Transport) => {
        const loader = new ESPLoader(buildFlashOptions(transport));
          console.log(
          `[FLASH MODE] esptool connect -> romBaud=${BAUD_RATES.FLASH_MODE}, flashBaud=${BAUD_RATES.FLASH_MODE}, resetMode=default`
          );
        try {
          // First, try the default reset strategy (toggling DTR/RTS).
          await loader.main();
          return loader;
        } catch (err: any) {
          console.warn("[FLASH MODE] Default reset connect failed, retrying with no_reset (manual/held-boot mode)...", err);
          // If user is already holding BOOT or adapter disallows signal toggles, retry without toggling on the same open port.
          await loader.main("no_reset");
          return loader;
        }
      };

      const attemptWithTransport = async () => {
        // Ensure port is closed/unlocked before constructing transport
        await hardClosePort();
        // Double-check the port is closed (handles cases where browser keeps it open)
        if (port.readable || port.writable) {
          await safeClosePort(port);
        }
        // Close once more to guarantee Transport starts from a closed handle
        await safeClosePort(port);

        const transport = new Transport(port as any, false, false);
        const loader = await runLoader(transport);
        return { transport, loader };
      };

      // Single attempt only
      const result = await attemptWithTransport();
      return result;
    } catch (error) {
      // Connection failed - log the error
      console.warn("[FLASH MODE] Connection attempt failed:", error);
      return null;
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
   * Connection Strategy Functions - Modular helpers for connection flow
   * ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Try connecting with a specific baud rate
   * Returns success status and baud rate if successful
   */
  const tryBaudRate = async (
    port: SerialPort,
    baudRate: number
  ): Promise<{ success: boolean; baudRate?: number }> => {
      try {
      await openPortWithBaudRate(port, baudRate);
      const connectionTimeout = calculateTimeout(baudRate, CONNECTION_TIMEOUTS.MAX_FRAME_BYTES, CONNECTION_TIMEOUTS.SILENCE_SYMBOLS, false);
      const success = await tryNormalMode(port, baudRate, connectionTimeout, 1);
      
      if (success) {
        return { success: true, baudRate };
      }
      
      await safeClosePort(port);
      return { success: false };
      } catch (error) {
      await safeClosePort(port);
      return { success: false };
        }
  };

  /**
   * Attempt normal mode connection with multiple baud rates
   * Tries high-speed first, then standard
   */
  const attemptNormalModeConnection = async (
    port: SerialPort
  ): Promise<{ success: boolean; baudRate?: number }> => {
    // Try 4M first (fastest)
    const highSpeedResult = await tryBaudRate(port, BAUD_RATES.HIGH_SPEED);
    if (highSpeedResult.success) {
      return highSpeedResult;
    }

    // Try standard baud rate (more compatible)
    const standardResult = await tryBaudRate(port, BAUD_RATES.STANDARD);
    if (standardResult.success) {
      return standardResult;
          }

    return { success: false };
  };

  /**
   * Attempt flash mode connection
   */
  const attemptFlashModeConnection = async (
    port: SerialPort
  ): Promise<{ transport: Transport; loader: ESPLoader } | null> => {
      await cleanup();
    return await tryFlashMode(port);
  };

  /**
   * Set connected state after successful connection
   */
  const setConnectedState = (
    port: SerialPort,
    mode: "normal" | "flash",
    baudRate: number | null,
    flashResult?: { transport: Transport; loader: ESPLoader }
  ): void => {
    const comPort = getComPort(port);
        setState({
          status: "connected",
      mode,
      port,
      transport: flashResult?.transport || null,
      loader: flashResult?.loader || null,
          comPort,
      detectedBaudRate: baudRate,
        });
  };

  /**
   * Handle connection failure - clean up, fully disconnect, and show Connect button
   */
  const handleConnectionFailure = async (port: SerialPort): Promise<void> => {
    await cleanup();
    await safeClosePort(port);
    // Reset to a clean disconnected state so the Connect button is available
    setState({
      status: "disconnected",
      mode: null,
      port: null,
      transport: null,
      loader: null,
      comPort: null,
      detectedBaudRate: null,
    });
    toast.error("Connection failed - device not responding. Check USB and retry.");
  };

  /**
   * Handle connection errors with appropriate user feedback
   */
  const handleConnectionError = (error: unknown): void => {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Must be handling a user gesture")) {
        setState((prev) => ({ ...prev, status: "fault" }));
        toast.error(message);
      } else {
        setState((prev) => ({ ...prev, status: "disconnected" }));
      }
  };


  const connect = useCallback(async () => {
    // Early returns for invalid states
    if (isConnecting || state.status === "connected") {
      return;
    }

    setIsConnecting(true);
    setState((prev) => ({ ...prev, status: "connecting" }));

    try {
      // Check browser support
      const Navigator = navigator as Navigator & { serial?: Serial };
      if (!Navigator.serial) {
        throw new Error("WebSerial API not supported");
      }

      // Request port from user
      const selectedPort = await Navigator.serial.requestPort();
      // Always close once to guarantee a clean handle for flash connect
      await safeClosePort(selectedPort);
      
      // For testing: skip normal mode and go straight to flash mode
      const flashResult = await attemptFlashModeConnection(selectedPort);
      
      if (flashResult) {
        setConnectedState(selectedPort, "flash", null, flashResult);
        toast.success("Connected in Flash mode");
        return;
      }
      // If flash mode failed, mark fault
      await handleConnectionFailure(selectedPort);

    } catch (error) {
      handleConnectionError(error);
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
      await safeClosePort(currentState.port);
    }

    // Clear device info cookie when disconnecting
    setCookie(DEVICE_INFO_COOKIE, "", 0);
    
    // Reset tracking refs
    deviceInfoFetchedRef.current = false;
    lastDeviceAttachedRef.current = false;
    setMcuStatus(null);
    
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
    // Only start continuous reader in normal mode - flash mode uses ESPLoader which locks the stream
    if (state.status !== "connected" || !state.port || !state.port.readable || state.mode !== "normal") {
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
      
      // Check again after delay - mode might have changed
      if (shouldStop || stateRef.current.status !== "connected" || stateRef.current.mode !== "normal") {
        console.log("[CONTINUOUS READER] Aborted - not in normal mode or disconnected");
        return;
      }

      isReading = true;

      // Get the reader (reuse existing if available, otherwise create new)
      let reader = readerRef.current;
      if (!reader) {
        try {
          console.log("[CONTINUOUS READER] Creating new reader");
          // Double-check the stream is not locked (shouldn't be in normal mode)
          if (stateRef.current.port!.readable!.locked) {
            console.warn("[CONTINUOUS READER] Readable stream is locked, cannot create reader");
            isReading = false;
            return;
          }
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
        // Only read in normal mode - flash mode uses ESPLoader which locks the stream
        while (!shouldStop && stateRef.current.status === "connected" && stateRef.current.mode === "normal" && stateRef.current.port) {
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

              // Combine with buffer to handle split frames
              const currentBuffer = binaryFrameBufferRef.current;
              const combined = new Uint8Array(currentBuffer.length + value.length);
              combined.set(currentBuffer, 0);
              combined.set(value, currentBuffer.length);
              
              // Clear buffer at start - we'll re-add incomplete frames at the end
              binaryFrameBufferRef.current = new Uint8Array(0);
              
              let processedPos = 0;
              let hasIncompleteFrame = false;
              
              // Process data sequentially from start (don't search randomly for 0x50)
              while (processedPos < combined.length) {
                // Check if current position starts with 0x50 (binary frame start)
                if (combined[processedPos] === UART0_START_BYTE) {
                  // Might be a binary frame - need at least 4 bytes (START + CMD + LEN(2))
                  if (processedPos + 4 > combined.length) {
                    // Not enough data for header - buffer and wait
                    binaryFrameBufferRef.current = combined.slice(processedPos);
                    hasIncompleteFrame = true;
                    break;
                  }
                  
                  // Read frame length from header
                  const payloadLen = combined[processedPos + 2] | (combined[processedPos + 3] << 8);
                  const totalFrameLen = 4 + payloadLen;
                  
                  // Sanity check payload length (max 64KB)
                  if (payloadLen > 65535) {
                    // Invalid length - this isn't a binary frame, treat as text
                    // Find next 0x50 or end of buffer
                    let nextFramePos = processedPos + 1;
                    while (nextFramePos < combined.length && combined[nextFramePos] !== UART0_START_BYTE) {
                      nextFramePos++;
                    }
                    
                    // Send this chunk as text
                    const textData = combined.slice(processedPos, nextFramePos);
                    textLogSubscribersRef.current.forEach((callback: TextLogSubscriber) => {
                      try {
                        callback(textData);
                      } catch (e) {
                        console.error("[CONTINUOUS READER] Text log subscriber error:", e);
                      }
                    });
                    // Legacy
              serialDataSubscribersRef.current.forEach((callback: SerialDataCallback) => {
                try {
                        callback(textData, false);
                } catch (e) {
                        console.error("[CONTINUOUS READER] Legacy subscriber error:", e);
                      }
                    });
                    
                    processedPos = nextFramePos;
                    continue;
                  }
                  
                  // Check if we have complete frame
                  if (processedPos + totalFrameLen > combined.length) {
                    // Incomplete frame - buffer and wait for more data
                    binaryFrameBufferRef.current = combined.slice(processedPos);
                    hasIncompleteFrame = true;
                    break;
                  }
                  
                  // We have complete frame
                  const frame = combined.slice(processedPos, processedPos + totalFrameLen);
                  const parsed = parseBinaryFrame(frame);
                  
                  if (parsed) {
                    // Valid binary frame - send to binary subscribers
                    console.log(`[CONTINUOUS READER] ✓ Valid binary frame: cmd=0x${parsed.cmd.toString(16).toUpperCase()}, payload=${parsed.payload.length} bytes, dispatching to ${binaryFrameSubscribersRef.current.size} subscribers`);
                    binaryFrameSubscribersRef.current.forEach((callback: BinaryFrameSubscriber) => {
                      try {
                        callback(frame);
                      } catch (e) {
                        console.error("[CONTINUOUS READER] Binary frame subscriber error:", e);
                      }
                    });
                    // Legacy
                    serialDataSubscribersRef.current.forEach((callback: SerialDataCallback) => {
                      try {
                        callback(frame, true);
                      } catch (e) {
                        console.error("[CONTINUOUS READER] Legacy subscriber error:", e);
                      }
                    });
                    
                    processedPos += totalFrameLen;
                  } else {
                    // Invalid frame - skip it
                    console.warn(`[CONTINUOUS READER] Invalid binary frame (${totalFrameLen} bytes) at pos ${processedPos}, skipping`);
                    processedPos += totalFrameLen;
                  }
                } else {
                  // Not a binary frame start (not 0x50) - this is text/log data
                  // Find next 0x50 or end of buffer
                  let nextFramePos = processedPos + 1;
                  while (nextFramePos < combined.length && combined[nextFramePos] !== UART0_START_BYTE) {
                    nextFramePos++;
                  }
                  
                  // Send this chunk as text
                  const textData = combined.slice(processedPos, nextFramePos);
                  textLogSubscribersRef.current.forEach((callback: TextLogSubscriber) => {
                    try {
                      callback(textData);
                    } catch (e) {
                      console.error("[CONTINUOUS READER] Text log subscriber error:", e);
                    }
                  });
                  // Legacy
                  serialDataSubscribersRef.current.forEach((callback: SerialDataCallback) => {
                    try {
                      callback(textData, false);
                    } catch (e) {
                      console.error("[CONTINUOUS READER] Legacy subscriber error:", e);
                    }
                  });
                  
                  processedPos = nextFramePos;
                }
              }
              
              // Buffer is already set if we have incomplete frame, or cleared if we processed everything
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
  }, [state.status, state.mode, state.port]);

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

  // Fetch full device info - fetches each field individually using new API commands
  // Routes all commands through the extensible command router system
  const fetchFullDeviceInfo = useCallback(async (): Promise<boolean> => {
    const currentState = stateRef.current;
    if (currentState.status !== "connected" || currentState.mode !== "normal" || !currentState.port) {
      console.log("[FETCH DEVICE INFO] Not in normal mode or not connected");
      return false;
    }

    console.log("[FETCH DEVICE INFO] Fetching full device info using individual commands...");
    
    // List of all commands to fetch - easily extensible for future commands
    // NOTE: RAM, UPTIME, and TEMP are NOT fetched here - they come from STATUS (0xD4) live poll
    const commandsToFetch: number[] = [
      UART0_CMD_GET_MAC1,
      UART0_CMD_GET_MAC2,
      UART0_CMD_GET_CPU,
      UART0_CMD_GET_VID,
      UART0_CMD_GET_PID,
      UART0_CMD_GET_MOUSE_BINT,
      UART0_CMD_GET_KBD_BINT,
      UART0_CMD_GET_FW_VERSION,
      UART0_CMD_GET_MAKCU_VERSION,
      UART0_CMD_GET_VENDOR,
      UART0_CMD_GET_MODEL,
      UART0_CMD_GET_ORIG_SERIAL,
      UART0_CMD_GET_SPOOF_SERIAL,
      UART0_CMD_GET_SPOOF_ACTIVE,
      UART0_CMD_GET_SCREEN_W,
      UART0_CMD_GET_SCREEN_H,
      // UART0_CMD_GET_RAM - NOT needed (comes from STATUS 0xD4)
      // UART0_CMD_GET_UPTIME - NOT needed (comes from STATUS 0xD4)
      // UART0_CMD_GET_TEMP - NOT needed (comes from STATUS 0xD4)
      // UART0_CMD_GET_FAULT - optional, only fetch if needed
    ];

    const commandResponses = new Map<number, Uint8Array>();
    const baudRate = currentState.detectedBaudRate ?? BAUD_RATES.STANDARD;

    // Fetch each command sequentially (can be parallelized later if needed)
    for (const cmd of commandsToFetch) {
      try {
        // Calculate timeout based on expected payload size
        let expectedSize = 64; // Default for variable-length strings
        if (cmd === UART0_CMD_GET_MAC1 || cmd === UART0_CMD_GET_MAC2) expectedSize = 6;
        else if (cmd === UART0_CMD_GET_TEMP || cmd === UART0_CMD_GET_CPU) expectedSize = 4;
        else if (cmd === UART0_CMD_GET_VID || cmd === UART0_CMD_GET_PID || 
                 cmd === UART0_CMD_GET_SCREEN_W || cmd === UART0_CMD_GET_SCREEN_H) expectedSize = 2;
        else if (cmd === UART0_CMD_GET_MOUSE_BINT || cmd === UART0_CMD_GET_KBD_BINT ||
                 cmd === UART0_CMD_GET_SPOOF_ACTIVE) expectedSize = 1;
        
        const timeout = calculateTimeout(baudRate, expectedSize + 4, 10, false);
        const cmdName = cmd === UART0_CMD_GET_MOUSE_BINT ? "MOUSE_BINT" : cmd === UART0_CMD_GET_KBD_BINT ? "KBD_BINT" : "";
        console.log(`[FETCH DEVICE INFO] Sending command 0x${cmd.toString(16).toUpperCase()}${cmdName ? ` (${cmdName})` : ""} (expected ${expectedSize} bytes, timeout ${timeout}ms)`);
        const sendBinaryCmd = sendBinaryCommandRef.current;
        if (!sendBinaryCmd) {
          console.error("[FETCH DEVICE INFO] sendBinaryCommand not available");
          continue;
        }
        const response = await sendBinaryCmd(cmd, undefined, timeout);
        
        if (response) {
          commandResponses.set(cmd, response);
          const cmdName = cmd === UART0_CMD_GET_MOUSE_BINT ? "MOUSE_BINT" : cmd === UART0_CMD_GET_KBD_BINT ? "KBD_BINT" : "";
          const details = cmdName && response.length === 1 ? ` - value=${response[0]}` : "";
          console.log(`[FETCH DEVICE INFO] ✓ Command 0x${cmd.toString(16).toUpperCase()}${cmdName ? ` (${cmdName})` : ""} received (${response.length} bytes)${details}`);
        } else {
          const cmdName = cmd === UART0_CMD_GET_MOUSE_BINT ? "MOUSE_BINT" : cmd === UART0_CMD_GET_KBD_BINT ? "KBD_BINT" : "";
          console.warn(`[FETCH DEVICE INFO] ✗ Command 0x${cmd.toString(16).toUpperCase()}${cmdName ? ` (${cmdName})` : ""} failed or timed out`);
        }
      } catch (error) {
        console.error(`[FETCH DEVICE INFO] Error fetching command 0x${cmd.toString(16).toUpperCase()}:`, error);
      }
    }

    // Build device info from all collected responses using the router
    if (commandResponses.size > 0) {
      buildAndStoreDeviceInfo(commandResponses);
      deviceInfoFetchedRef.current = true;
      console.log(`[FETCH DEVICE INFO] Successfully fetched ${commandResponses.size}/${commandsToFetch.length} commands and stored device info`);
      return true;
    }

    console.warn("[FETCH DEVICE INFO] No valid responses received");
    return false;
    // sendBinaryCommand accessed via ref, no need in dependency array
  }, []);

  // Subscribe to binary frames only (0x50 frames)
  const subscribeToBinaryFrames = useCallback((callback: BinaryFrameSubscriber) => {
    binaryFrameSubscribersRef.current.add(callback);
    // Return unsubscribe function
    return () => {
      binaryFrameSubscribersRef.current.delete(callback);
    };
  }, []);

  // Subscribe to text/logs only (non-0x50 data)
  const subscribeToTextLogs = useCallback((callback: TextLogSubscriber) => {
    textLogSubscribersRef.current.add(callback);
    // Return unsubscribe function
    return () => {
      textLogSubscribersRef.current.delete(callback);
    };
  }, []);

  // Status polling - runs every 1 second in normal mode
  // Uses the continuous reader's data stream (same pipeline, no lock conflicts)
  // Detects: MCU disconnect, device attach/detach, provides live uptime
  useEffect(() => {
    // Only poll in normal mode
    if (state.status !== "connected" || state.mode !== "normal" || !state.port) {
      // Clear status and refs when not connected
      if (state.status !== "connected") {
        setMcuStatus(null);
        deviceInfoFetchedRef.current = false;
        lastDeviceAttachedRef.current = false;
      }
      return;
    }

    let consecutiveFailures = 0;
    const MAX_FAILURES = 3;  // Go to fault after 3 consecutive failures
    
    let pendingStatusRequest: { resolve: (data: Uint8Array | null) => void; timeout: NodeJS.Timeout } | null = null;

    // Subscribe to binary frames only (0x50 handler)
    // The continuous reader already sends complete, validated frames, so we can parse directly
    const statusDataCallback: BinaryFrameSubscriber = (frame: Uint8Array) => {
      // Parse the complete frame (already validated by continuous reader)
      const parsed = parseBinaryFrame(frame);
      
      console.log(`[STATUS POLL CB] Received frame: cmd=0x${parsed?.cmd?.toString(16).toUpperCase() ?? 'null'}, pending=${!!pendingStatusRequest}`);
      
      if (!pendingStatusRequest) {
        console.log(`[STATUS POLL CB] No pending request, ignoring frame`);
        return; // No pending request
      }
      
      if (parsed && parsed.cmd === UART0_CMD_STATUS) {
        // Found STATUS response!
        console.log(`[STATUS POLL CB] ✓ STATUS response received, resolving promise`);
        if (pendingStatusRequest.timeout) clearTimeout(pendingStatusRequest.timeout);
        const request = pendingStatusRequest;
        pendingStatusRequest = null;
        request.resolve(parsed.payload);
      } else {
        console.log(`[STATUS POLL CB] Frame is not STATUS (cmd=0x${parsed?.cmd?.toString(16).toUpperCase() ?? 'null'}), waiting...`);
      }
    };

    // Subscribe to binary frames only (0x50 handler)
    const unsubscribe = subscribeToBinaryFrames(statusDataCallback);

    const pollStatus = async () => {
      const currentState = stateRef.current;
      if (currentState.status !== "connected" || currentState.mode !== "normal" || !currentState.port) {
        return;
      }

      try {
        // Calculate timeout first
        const baudRate = currentState.detectedBaudRate ?? BAUD_RATES.STANDARD;
        const timeout = calculateTimeout(baudRate, CONNECTION_TIMEOUTS.STATUS_FRAME_BYTES, CONNECTION_TIMEOUTS.SILENCE_SYMBOLS, false);
        
        // Set up response listener BEFORE sending command (MCU responds fast!)
        const responsePromise = new Promise<Uint8Array | null>((resolve) => {
          const timeoutId = setTimeout(() => {
            if (pendingStatusRequest) {
              pendingStatusRequest = null;
            }
            resolve(null);
          }, timeout);
          
          pendingStatusRequest = { resolve, timeout: timeoutId };
        });

        // NOW send STATUS command
        const frame = buildBinaryFrame(UART0_CMD_STATUS, null);
        const writer = currentState.port.writable?.getWriter();
        if (!writer) {
          // Clear the pending request we just set up
          if (pendingStatusRequest?.timeout) clearTimeout(pendingStatusRequest.timeout);
          pendingStatusRequest = null;
          consecutiveFailures++;
          return;
        }
        await writer.write(frame);
        writer.releaseLock();

        // Wait for response from continuous reader (via subscription)
        const response = await responsePromise;

        if (response && response.length >= 17) {
          const status = parseStatusResponse(response);
          if (status) {
            console.log(`[STATUS POLL] Received STATUS: RAM=${status.freeRamKb}kb, UPTIME=${status.uptime}s, TEMP=${status.temp >= 0 ? status.temp.toFixed(1) + '°C' : 'N/A'}, Device=${status.deviceAttached ? 'attached' : 'detached'}, Fault=${status.hasFault}`);
            setMcuStatus(status);
            consecutiveFailures = 0;  // Reset on success

            // Check for device attach/detach
            const wasAttached = lastDeviceAttachedRef.current;
            const isAttached = status.deviceAttached;

            if (isAttached && !wasAttached) {
              // Device just attached - fetch full info
              console.log("[STATUS POLL] Device attached - fetching full device info");
              // Small delay to let device enumerate
              setTimeout(() => fetchFullDeviceInfo(), 500);
            } else if (!isAttached && wasAttached) {
              // Device just detached - clear cached info
              console.log("[STATUS POLL] Device detached - clearing device info");
              setCookie(DEVICE_INFO_COOKIE, "", 0);
              deviceInfoFetchedRef.current = false;
            } else if (isAttached && !deviceInfoFetchedRef.current) {
              // Device is attached but we don't have info yet (e.g., first poll after connect)
              console.log("[STATUS POLL] Device attached, fetching initial device info");
              fetchFullDeviceInfo();
            }

            lastDeviceAttachedRef.current = isAttached;
          } else {
            // Invalid response - count as failure
            consecutiveFailures++;
            console.warn(`[STATUS POLL] Invalid response (${consecutiveFailures}/${MAX_FAILURES}):`, response ? `length=${response.length}, firstByte=0x${response[0]?.toString(16)}` : 'null response');
          }
        } else {
          // No response - timeout
          consecutiveFailures++;
          console.warn(`[STATUS POLL] No response (${consecutiveFailures}/${MAX_FAILURES})`);
        }
      } catch (error) {
        consecutiveFailures++;
        console.error(`[STATUS POLL] Error (${consecutiveFailures}/${MAX_FAILURES}):`, error);
      }

      // Go to fault if too many consecutive failures
      if (consecutiveFailures >= MAX_FAILURES) {
        console.error(`[STATUS POLL] ${MAX_FAILURES} consecutive failures - connection fault`);
        await cleanup();
        setState((prev) => ({ 
          ...prev, 
          status: "fault",
          mode: null,
          detectedBaudRate: null
        }));
        toast.error("MCU not responding - connection fault");
      }
    };

    // Start polling every 1 second
    console.log("[STATUS POLL] Starting 1-second status polling (using continuous reader pipeline)");
    statusPollRef.current = setInterval(pollStatus, 1000);
    
    // Immediate first poll
    pollStatus();

    return () => {
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
        statusPollRef.current = null;
      }
      // Cleanup pending request
      if (pendingStatusRequest) {
        if (pendingStatusRequest.timeout) clearTimeout(pendingStatusRequest.timeout);
        pendingStatusRequest.resolve(null);
        pendingStatusRequest = null;
      }
      unsubscribe(); // Unsubscribe from continuous reader
      console.log("[STATUS POLL] Stopped status polling");
    };
  }, [state.status, state.mode, state.port, cleanup, fetchFullDeviceInfo, subscribeToBinaryFrames]);

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
      
      // If command failed (no response), log warning but don't trigger fault
      // Serial terminal commands have unknown frame sizes and no CRC - failures are expected
      // Fault is only triggered by:
      // 1. Binary commands (sendBinaryCommand) failing after the single attempt
      // 2. Connection attempts (high-speed/standard normal mode + flash mode) all failing
      // 3. Actual port/connection errors (not simple command timeouts)
      if (!result) {
        console.warn(`[SEND COMMAND] Command failed (timeout/no response): "${command.trim()}"`);
      }
      
      return result;
    } catch (error) {
      console.error(`[SEND COMMAND] Error:`, error);
      // Only trigger fault on actual connection problems, not command failures
      // Connection errors indicate port is broken/disconnected
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("port") || errorMsg.includes("disconnect") || errorMsg.includes("locked") || 
          errorMsg.includes("closed") || errorMsg.includes("not open")) {
        console.error(`[SEND COMMAND] Connection error detected - setting fault`);
        await cleanup();
        setState((prev) => ({ 
          ...prev, 
          status: "fault",
          mode: null,
          transport: null,
          loader: null,
          detectedBaudRate: null
        }));
        toast.error("Connection error - please reconnect.");
      }
      // Simple command errors (timeout, parse errors, etc.) don't trigger fault
      return null;
    }
  }, [cleanup]);

  // Send binary API command and wait for binary response
  // 
  // Protocol Coexistence:
  // - Text commands (terminal): Send text like ".website()\n" or "km.info()\n"
  //   → Firmware detects text (starts with '.' or 'k') → parses as text command
  //   → Returns text response → Terminal displays it
  // 
  // - Binary commands (API): Send binary frame [0x50] [CMD] [LEN] [PAYLOAD]
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
  //   const response = await sendBinaryCommand(UART0_CMD_GET_MAC1);
  //   if (response) { /* parse response using routeApiCommand() */ }
  const sendBinaryCommand = useCallback(async (
    cmd: number, 
    payload?: Uint8Array, 
    timeoutMs?: number,
    _maxRetries?: number
  ): Promise<Uint8Array | null> => {
    const currentState = stateRef.current;
    if (currentState.status !== "connected" || !currentState.port) {
      console.log(`[BINARY API] Not connected`);
      return null;
    }

    // Auto-calculate timeout based on detected baud rate
    const baudRate = currentState.detectedBaudRate ?? BAUD_RATES.STANDARD; // Default to 115200 if unknown
    const calculatedTimeout = timeoutMs ?? calculateTimeout(baudRate);
    const maxAttempts = 1; // CRC removed - single attempt

    let pendingRequest: { resolve: (data: Uint8Array | null) => void; timeout: NodeJS.Timeout } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;

    try {
      const responsePromise = new Promise<Uint8Array | null>((resolve) => {
        timeoutId = setTimeout(() => {
          if (pendingRequest) {
            pendingRequest = null;
          }
          resolve(null);
        }, calculatedTimeout);
        
        pendingRequest = { resolve, timeout: timeoutId };
      });

      const binaryFrameCallback: BinaryFrameSubscriber = (frame: Uint8Array) => {
        const parsed = parseBinaryFrame(frame);
        
        if (!pendingRequest) {
          return; // No pending request
        }
        
        if (parsed && parsed.cmd === cmd) {
          console.log(`[BINARY API CB] ✓ Command 0x${cmd.toString(16).toUpperCase()} response received (single attempt), payload size: ${parsed.payload.length}`);
          if (timeoutId) clearTimeout(timeoutId);
          const request = pendingRequest;
          pendingRequest = null;
          timeoutId = null;
          if (request) request.resolve(parsed.payload);
        }
      };

      unsubscribe = subscribeToBinaryFrames(binaryFrameCallback);

      const frame = buildBinaryFrame(cmd, payload || null);
      console.log(`[BINARY API] Sending command 0x${cmd.toString(16).toUpperCase()} (attempts=${maxAttempts})`);

      const writer = currentState.port.writable?.getWriter();
      if (!writer) {
        console.log(`[BINARY API] Port not writable`);
        if (timeoutId) clearTimeout(timeoutId);
        pendingRequest = null;
        if (unsubscribe) unsubscribe();
        return null;
      }

      await writer.write(frame);
      writer.releaseLock();

      const result = await responsePromise;
      
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      
      if (result && result instanceof Uint8Array) {
        return result;
      }
    } catch (error) {
      console.error(`[BINARY API] Error on single attempt:`, error);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (unsubscribe) unsubscribe();
    }
    
    console.warn(`[BINARY API] Command 0x${cmd.toString(16).toUpperCase()} failed (single attempt, CRC removed)`);
    return null;
  }, [cleanup, subscribeToBinaryFrames]);

  // Store sendBinaryCommand in ref so fetchFullDeviceInfo can access it
  useEffect(() => {
    sendBinaryCommandRef.current = sendBinaryCommand;
  }, [sendBinaryCommand]);

  // Subscribe to serial data (legacy - receives all data)
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
    subscribeToBinaryFrames,
    subscribeToTextLogs,
    fetchFullDeviceInfo,
    isConnecting,
    browserSupported,
    mcuStatus,
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

