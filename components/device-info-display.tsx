"use client";

import { useEffect, useState } from "react";
import { getDeviceInfo, useMakcuConnection } from "./contexts/makcu-connection-provider";

export function DeviceInfoDisplay() {
  const { status } = useMakcuConnection();
  const [deviceInfo, setDeviceInfo] = useState<Record<string, string> | null>(null);

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

  // Only show if connected and we have vendor and/or model
  if (status !== "connected" || !deviceInfo || (!deviceInfo.VENDOR && !deviceInfo.MODEL)) {
    return null;
  }

  const vendor = deviceInfo.VENDOR || "";
  const model = deviceInfo.MODEL || "";

  // Don't show if both are empty
  if (!vendor && !model) {
    return null;
  }

  // Build device name - if vendor is empty, start from model
  const deviceName = vendor 
    ? `${vendor} ${model}`.trim()
    : model;

  return (
    <div className="text-sm text-muted-foreground flex items-center gap-1">
      <span>Device:</span>
      <span className="font-medium">{deviceName}</span>
    </div>
  );
}

