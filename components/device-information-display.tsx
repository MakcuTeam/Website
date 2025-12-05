"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getCombinedDeviceInfo } from "./contexts/makcu-connection-provider";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";

type DeviceInformationDisplayProps = {
  lang: Locale;
  variant?: "card" | "inline";
};

/**
 * Device Information display component for Device Control page.
 * Shows all parsed cookie information combined with live STATUS data in a formatted card.
 */
export function DeviceInformationDisplay({ lang, variant = "card" }: DeviceInformationDisplayProps) {
  const { status, mcuStatus } = useMakcuConnection();
  const [deviceInfo, setDeviceInfo] = useState<Record<string, string | boolean> | null>(null);
  const isCn = lang === "cn";

  useEffect(() => {
    // Always get device info (returns all fields with defaults even if not connected)
    const info = getCombinedDeviceInfo(mcuStatus);
    setDeviceInfo(info);
    
    // Check for updates periodically (includes live RAM/uptime from STATUS poll)
    const interval = setInterval(() => {
      const updatedInfo = getCombinedDeviceInfo(mcuStatus);
      setDeviceInfo(updatedInfo);
    }, 500);

    return () => clearInterval(interval);
  }, [status, mcuStatus]);

  // Always show all fields (even if not connected or empty) - getCombinedDeviceInfo always returns all fields
  if (!deviceInfo) {
    // Shouldn't happen, but handle gracefully
    if (variant === "inline") {
      return null;
    }
    return (
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            {isCn ? "加载设备信息中..." : "Loading device information..."}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to format label
  const formatLabel = (key: string): string => {
    const labels: Record<string, { en: string; cn: string }> = {
      MAC1: { en: "Left Chip Serial", cn: "左芯片序列号" },
      MAC2: { en: "Right Chip Serial", cn: "右芯片序列号" },
      TEMP: { en: "Temperature", cn: "温度" },
      RAM: { en: "RAM", cn: "内存" },
      CPU: { en: "CPU Frequency", cn: "CPU 频率" },
      UP: { en: "Uptime", cn: "运行时间" },
      VID: { en: "Vendor ID", cn: "供应商 ID" },
      PID: { en: "Product ID", cn: "产品 ID" },
      MOUSE_BINT: { en: "Mouse Polling Rate", cn: "鼠标轮询率" },
      KBD_BINT: { en: "Keyboard Polling Rate", cn: "键盘轮询率" },
      FW: { en: "Firmware Version", cn: "固件版本" },
      MAKCU: { en: "MAKCU Board", cn: "MAKCU 主板" },
      VENDOR: { en: "Make", cn: "制造商" },
      MODEL: { en: "Model", cn: "型号" },
      ORIGINAL_SERIAL: { en: "Original Serial", cn: "原始序列号" },
      SPOOFED_SERIAL: { en: "Spoofed Serial", cn: "伪装序列号" },
      SPOOF_ACTIVE: { en: "Spoof Active", cn: "伪装激活" },
      SCREEN_SIZE: { en: "Screen Size", cn: "屏幕尺寸" },
    };
    
    const label = labels[key];
    return label ? (isCn ? label.cn : label.en) : key;
  };

  // Helper function to format value (especially for polling rates and boolean fields)
  const formatValue = (key: string, value: string | boolean | undefined): string => {
    // Handle SPOOF_ACTIVE boolean
    if (key === "SPOOF_ACTIVE") {
      if (typeof value === "boolean") {
        return value ? (isCn ? "是" : "Yes") : (isCn ? "否" : "No");
      }
      return "—";
    }
    
    // Handle empty values
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      return "—";
    }
    
    // Convert bInterval to polling rate in Hz
    if (key === "MOUSE_BINT" || key === "KBD_BINT") {
      const bInterval = parseInt(String(value), 10);
      if (!isNaN(bInterval) && bInterval > 0) {
        const pollingRate = Math.round(1000 / bInterval);
        return `${pollingRate}Hz`;
      }
      // If invalid or zero, return empty dash
      return "—";
    }
    
    // For all other values, ensure empty strings show as dash
    const strValue = String(value);
    if (strValue === "" || strValue === "undefined" || strValue === "null" || strValue === "NaN") {
      return "—";
    }
    
    return strValue;
  };

  // Define the expected fields in order (show all, even if empty)
  const expectedFields: string[] = [
    "VENDOR",
    "MODEL",
    "ORIGINAL_SERIAL",
    "SPOOFED_SERIAL",
    "SPOOF_ACTIVE",
    "FW",
    "MAKCU",
    "MAC1",
    "MAC2",
    "VID",
    "PID",
    "TEMP",
    "RAM",
    "CPU",
    "UP",
    "MOUSE_BINT",
    "KBD_BINT",
    "SCREEN_SIZE",
  ];

  // Build display items - include all expected fields, even if empty
  const displayItems = expectedFields.map((key) => {
    const value = deviceInfo[key] as string | boolean | undefined;
    return [key, formatValue(key, value)] as [string, string];
  });

  const isInline = variant === "inline";
  
  const content = (
    <div className={isInline ? "space-y-1.5" : "space-y-2"}>
      {displayItems.map(([key, value]) => (
        <div key={key} className={`flex items-start gap-3 ${isInline ? "py-1 text-xs" : "py-1.5"} border-b border-border/40 last:border-b-0`}>
          <div className={`${isInline ? "text-xs" : "text-sm"} font-medium text-black dark:text-white ${isInline ? "min-w-[148px]" : "min-w-[203px]"} shrink-0`}>
            {formatLabel(key)}
          </div>
          <div className={`${isInline ? "text-xs" : "text-sm"} text-muted-foreground ${isInline ? "" : "font-mono"} flex-1`}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="bg-transparent">
        {content}
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg">
      <CardContent className="p-4">
        {content}
      </CardContent>
    </Card>
  );
}

