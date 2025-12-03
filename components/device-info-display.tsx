"use client";

import { useEffect, useState } from "react";
import { getDeviceInfo } from "./contexts/makcu-connection-provider";

export function DeviceInfoDisplay() {
  const [deviceInfo, setDeviceInfo] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    // Load device info from cookie
    const info = getDeviceInfo();
    setDeviceInfo(info);

    // Check for updates periodically (when connection happens)
    const interval = setInterval(() => {
      const updatedInfo = getDeviceInfo();
      setDeviceInfo(updatedInfo);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show if we have vendor and/or model
  if (!deviceInfo || (!deviceInfo.VENDOR && !deviceInfo.MODEL)) {
    return null;
  }

  const vendor = deviceInfo.VENDOR || "";
  const model = deviceInfo.MODEL || "";

  // Don't show if both are empty
  if (!vendor && !model) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      {vendor && <span className="font-medium">{vendor}</span>}
      {vendor && model && <span>/</span>}
      {model && <span>{model}</span>}
    </div>
  );
}

