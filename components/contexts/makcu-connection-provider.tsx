"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { ESPLoader, LoaderOptions, Transport } from "esptool-js";
import { serial } from "web-serial-polyfill";
import { toast } from "sonner";

export type ConnectionMode = "normal" | "flash" | null;
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "fault";

interface MakcuConnectionState {
  status: ConnectionStatus;
  mode: ConnectionMode;
  port: SerialPort | null;
  transport: Transport | null;
  loader: ESPLoader | null;
  comPort: string | null;
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

  // Try to connect in normal mode
  const tryNormalMode = async (port: SerialPort): Promise<boolean> => {
    try {
      if (!port.writable || !port.readable) {
        return false;
      }

      // Get writer
      const writer = port.writable.getWriter();
      writerRef.current = writer;

      // Send version command
      const versionCommand = "km.version()\r";
      await writer.write(new TextEncoder().encode(versionCommand));

      // Get reader
      const reader = port.readable.getReader();
      readerRef.current = reader;

      // Read response with timeout
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<string>((_, reject) => {
        timeoutId = setTimeout(() => {
          reader.cancel().catch(() => {});
          reject(new Error("Timeout waiting for response"));
        }, 5000);
      });

      const readPromise = (async () => {
        let receivedData = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            receivedData += new TextDecoder().decode(value);
            
            // Check if we have the expected response
            if (receivedData.includes("km.MAKCU()\r\n>>> ")) {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
              return receivedData;
            }
          }
        } catch (error) {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          throw error;
        }
        return receivedData;
      })();

      try {
        const response = await Promise.race([readPromise, timeoutPromise]);
        
        if (response && response.includes("km.MAKCU()\r\n>>> ")) {
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
  const tryFlashMode = async (port: SerialPort): Promise<{ transport: Transport; loader: ESPLoader } | null> => {
    try {
      // Close the port first if it's open
      try {
        await port.close();
      } catch (e) {
        // Port might not be open
      }

      // Reopen for flash mode
      const transport = new Transport(port as any, false, false);
      const flashOptions: LoaderOptions = {
        transport,
        baudrate: 921600,
        romBaudrate: 115200,
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
    if (isConnecting) return;
    if (state.status === "connected") return;

    setIsConnecting(true);
    setState((prev) => ({ ...prev, status: "connecting" }));

    try {
      const Navigator = navigator as Navigator & { serial?: Serial };
      if (!Navigator.serial) {
        throw new Error("WebSerial API not supported");
      }

      // Request port
      const selectedPort = await Navigator.serial.requestPort();
      
      // Try normal mode first
      await selectedPort.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        flowControl: "none",
      });

      const normalModeSuccess = await tryNormalMode(selectedPort);

      if (normalModeSuccess) {
        // Normal mode connected
        const comPort = getComPort(selectedPort);
        setState({
          status: "connected",
          mode: "normal",
          port: selectedPort,
          transport: null,
          loader: null,
          comPort,
        });
        toast.success("Connected in Normal mode");
        return;
      }

      // Normal mode failed, try flash mode
      await cleanup();
      const flashResult = await tryFlashMode(selectedPort);

      if (flashResult) {
        // Flash mode connected
        const comPort = getComPort(selectedPort);
        setState({
          status: "connected",
          mode: "flash",
          port: selectedPort,
          transport: flashResult.transport,
          loader: flashResult.loader,
          comPort,
        });
        toast.success("Connected in Flash mode");
        return;
      }

      // Both modes failed
      try {
        await selectedPort.close();
      } catch (e) {
        // Ignore
      }
      setState((prev) => ({ ...prev, status: "fault", mode: null, port: null }));
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

    // Reset state
    setState({
      status: "disconnected",
      mode: null,
      port: null,
      transport: null,
      loader: null,
      comPort: null,
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

