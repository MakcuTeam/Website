"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import { toast } from "sonner";
import Link from "next/link";

type ConnectionStatus = "Not connected" | "Connecting" | "Connected" | "Fault";

interface MakcuSettingsProps {
  lang: Locale;
  dict: Dictionary;
}

export const MakcuSettings: React.FC<MakcuSettingsProps> = ({ lang, dict }) => {
  const [status, setStatus] = useState<ConnectionStatus>("Not connected");
  const [port, setPort] = useState<SerialPort | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);

  const isCn = lang === "cn";

  // Check browser support
  useEffect(() => {
    const Navigator = navigator as Navigator & { serial?: Serial };
    setBrowserSupported(!!Navigator.serial);
  }, []);

  // Listen for disconnect events
  useEffect(() => {
    if (!port) return;

    const handleDisconnect = () => {
      setStatus("Not connected");
      setPort(null);
      cleanup();
    };

    // Note: WebSerial API doesn't have a disconnect event, so we monitor connection health
    return () => {
      handleDisconnect();
    };
  }, [port]);

  // Cleanup function
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
      healthCheckRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current.releaseLock();
      readerRef.current = null;
    }
    if (writerRef.current) {
      writerRef.current.releaseLock();
      writerRef.current = null;
    }
  };

  // Health check for connection
  const startHealthCheck = () => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }
    
    // Monitor port health
    healthCheckRef.current = setInterval(() => {
      if (port && port.readable && port.writable) {
        // Connection is still alive
      } else {
        setStatus("Fault");
        cleanup();
      }
    }, 1000);
  };

  const connectToDevice = async () => {
    if (isConnecting) return;
    if (!browserSupported) {
      toast.error(dict.settings.connection.browser_not_supported);
      return;
    }

    setIsConnecting(true);
    setStatus("Connecting");

    try {
      const Navigator = navigator as Navigator & { serial?: Serial };
      if (!Navigator.serial) {
        throw new Error(dict.settings.connection.browser_not_supported);
      }

      // Request port
      const selectedPort = await Navigator.serial.requestPort();
      
      // Open port with specified settings
      await selectedPort.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        flowControl: "none",
      });

      setPort(selectedPort);

      // Check if port is writable and readable
      if (!selectedPort.writable || !selectedPort.readable) {
        throw new Error(isCn ? "端口不可用" : "Port is not available");
      }

      // Get writer
      const writer = selectedPort.writable.getWriter();
      writerRef.current = writer;

      // Send version command
      const versionCommand = "km.version()\r";
      await writer.write(new TextEncoder().encode(versionCommand));

      // Get reader
      const reader = selectedPort.readable.getReader();
      readerRef.current = reader;

      // Read response with timeout
      let timeoutId: NodeJS.Timeout;
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
              clearTimeout(timeoutId);
              return receivedData;
            }
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
        return receivedData;
      })();

      try {
        // Race between reading and timeout
        const response = await Promise.race([readPromise, timeoutPromise]);
        
        // Validate response
        if (response && response.includes("km.MAKCU()\r\n>>> ")) {
          setStatus("Connected");
          toast.success(isCn ? "连接成功" : "Connected successfully");
          // Keep reader active for monitoring, but release writer
          if (writerRef.current) {
            writerRef.current.releaseLock();
            writerRef.current = null;
          }
          // Start monitoring for disconnections
          startHealthCheck();
          // Continue reading in background to detect disconnections
          if (readerRef.current) {
            (async () => {
              try {
                while (port && port.readable && readerRef.current) {
                  const { done } = await readerRef.current.read();
                  if (done) {
                    // Stream ended, connection lost
                    setStatus("Not connected");
                    cleanup();
                    break;
                  }
                }
              } catch (error) {
                // Connection error
                setStatus("Fault");
                cleanup();
              }
            })();
          }
        } else {
          setStatus("Fault");
          toast.error(isCn ? "设备响应无效" : "Invalid device response");
          if (readerRef.current) {
            readerRef.current.releaseLock();
            readerRef.current = null;
          }
          if (writerRef.current) {
            writerRef.current.releaseLock();
            writerRef.current = null;
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        setStatus("Fault");
        toast.error(isCn ? "连接超时或失败" : "Connection timeout or failed");
        if (readerRef.current) {
          readerRef.current.releaseLock();
          readerRef.current = null;
        }
        if (writerRef.current) {
          writerRef.current.releaseLock();
          writerRef.current = null;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("Must be handling a user gesture")) {
        setStatus("Fault");
        toast.error(message);
      } else {
        setStatus("Not connected");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromDevice = async () => {
    cleanup();
    if (port) {
      try {
        // Cancel reader if active
        if (readerRef.current) {
          await readerRef.current.cancel();
          readerRef.current.releaseLock();
          readerRef.current = null;
        }
        // Close writer if active
        if (writerRef.current) {
          writerRef.current.releaseLock();
          writerRef.current = null;
        }
        await port.close();
      } catch (error) {
        console.error("Error closing port:", error);
      }
      setPort(null);
    }
    setStatus("Not connected");
    toast.info(isCn ? "已断开连接" : "Disconnected");
  };

  // Get status text based on current language
  const getStatusText = () => {
    const statusMap = {
      "Not connected": dict.settings.status.not_connected,
      "Connecting": dict.settings.status.connecting,
      "Connected": dict.settings.status.connected,
      "Fault": dict.settings.status.fault,
    };
    return statusMap[status];
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Status Display at the very top */}
      <div className="mb-6">
        <Card className="border-border/60 bg-card/90 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {isCn ? "MAKCU 状态" : "MAKCU Status"}
                </h2>
                <p className="text-lg mt-2 text-muted-foreground">
                  {isCn ? "MAKCU 状态" : "MAKCU status"} : {getStatusText()}
                </p>
              </div>
              <div className="flex gap-2">
                {status === "Not connected" || status === "Fault" ? (
                  <Button
                    onClick={connectToDevice}
                    disabled={!browserSupported || isConnecting}
                  >
                    {dict.settings.connection.connect}
                  </Button>
                ) : (
                  <Button onClick={disconnectFromDevice} variant="destructive">
                    {dict.settings.connection.disconnect}
                  </Button>
                )}
              </div>
            </div>
            {!browserSupported && (
              <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {dict.settings.connection.browser_not_supported}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prerequisites Section */}
      <Card className="border-border/60 bg-card/90 shadow-lg mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            {dict.settings.prerequisites.title}
          </h2>
          <ul className="space-y-4">
            <li>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  {dict.settings.prerequisites.firmware}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dict.settings.prerequisites.firmware_desc}
                </p>
              </div>
            </li>
            <li>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  {dict.settings.prerequisites.usb1}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dict.settings.prerequisites.usb1_desc}
                </p>
              </div>
            </li>
            <li>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  {dict.settings.prerequisites.usb2}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dict.settings.prerequisites.usb2_desc}
                </p>
              </div>
            </li>
          </ul>
          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {dict.settings.prerequisites.note}{" "}
              <Link
                href={`/${lang}/troubleshooting`}
                className="underline hover:text-blue-700 dark:hover:text-blue-300"
              >
                {isCn ? "故障排除页面" : "troubleshooting page"}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Content Area - Placeholder for future settings */}
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            {isCn ? "设置" : "Settings"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isCn
              ? "设置配置控件将在此处显示。"
              : "Settings configuration controls will appear here."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

