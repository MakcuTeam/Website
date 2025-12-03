"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getDeviceInfo } from "./contexts/makcu-connection-provider";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";

type DeviceInformationDisplayProps = {
  lang: Locale;
};

/**
 * Device Information display component for settings page.
 * Shows all parsed cookie information in a formatted card.
 */
export function DeviceInformationDisplay({ lang }: DeviceInformationDisplayProps) {
  const { status } = useMakcuConnection();
  const [deviceInfo, setDeviceInfo] = useState<Record<string, string> | null>(null);
  const isCn = lang === "cn";

  useEffect(() => {
    // Only check for device info if connected
    if (status === "connected") {
      const info = getDeviceInfo();
      setDeviceInfo(info);
      
      // Check for updates periodically
      const interval = setInterval(() => {
        const updatedInfo = getDeviceInfo();
        setDeviceInfo(updatedInfo);
      }, 500);

      return () => clearInterval(interval);
    } else {
      // Clear device info when disconnected
      setDeviceInfo(null);
    }
  }, [status]);

  // Only show if connected and we have valid device info
  if (status !== "connected" || !deviceInfo) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            {isCn ? "设备未连接。连接设备后，设备信息将显示在这里。" : "Device not connected. Device information will appear here once connected."}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to format label
  const formatLabel = (key: string): string => {
    const labels: Record<string, { en: string; cn: string }> = {
      MAC1: { en: "MAC Address 1", cn: "MAC 地址 1" },
      MAC2: { en: "MAC Address 2", cn: "MAC 地址 2" },
      TEMP: { en: "Temperature", cn: "温度" },
      RAM: { en: "RAM", cn: "内存" },
      CPU: { en: "CPU Frequency", cn: "CPU 频率" },
      UP: { en: "Uptime", cn: "运行时间" },
      VID: { en: "Vendor ID", cn: "供应商 ID" },
      PID: { en: "Product ID", cn: "产品 ID" },
      MOUSE_BINT: { en: "Mouse Polling Rate", cn: "鼠标轮询率" },
      KBD_BINT: { en: "Keyboard Polling Rate", cn: "键盘轮询率" },
      FW: { en: "Firmware Version", cn: "固件版本" },
      MAKCU: { en: "MAKCU Version", cn: "MAKCU 版本" },
      VENDOR: { en: "Vendor", cn: "供应商" },
      MODEL: { en: "Model", cn: "型号" },
      SERIAL: { en: "Serial Number", cn: "序列号" },
    };
    
    const label = labels[key];
    return label ? (isCn ? label.cn : label.en) : key;
  };

  // Helper function to format value (especially for polling rates)
  const formatValue = (key: string, value: string): string => {
    // Convert bInterval to polling rate in Hz
    if (key === "MOUSE_BINT" || key === "KBD_BINT") {
      const bInterval = parseInt(value, 10);
      if (!isNaN(bInterval) && bInterval > 0) {
        const pollingRate = Math.round(1000 / bInterval);
        return `${pollingRate}Hz`;
      }
    }
    return value;
  };

  // Filter out empty values and organize display
  const displayItems = Object.entries(deviceInfo)
    .filter(([_, value]) => value && value.trim() !== "")
    .map(([key, value]) => [key, formatValue(key, value)] as [string, string])
    .sort(([keyA], [keyB]) => {
      // Custom sort order for better readability
      const order: Record<string, number> = {
        VENDOR: 1,
        MODEL: 2,
        SERIAL: 3,
        FW: 4,
        MAKCU: 5,
        MAC1: 6,
        MAC2: 7,
        VID: 8,
        PID: 9,
        TEMP: 10,
        RAM: 11,
        CPU: 12,
        UP: 13,
        MOUSE_BINT: 14,
        KBD_BINT: 15,
      };
      return (order[keyA] || 999) - (order[keyB] || 999);
    });

  if (displayItems.length === 0) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            {isCn ? "设备信息不可用。" : "Device information not available."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-2">
          {displayItems.map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-b-0">
              <div className="text-sm font-medium text-foreground/80 min-w-[175px]">
                {formatLabel(key)}
              </div>
              <div className="text-sm text-muted-foreground font-mono break-all">
                {value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

