"use client";

import { useEffect, useState } from "react";
import { getDeviceInfo } from "./contexts/makcu-connection-provider";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";

/**
 * Device info display component for the sidebar.
 * Shows device VENDOR and MODEL when connected.
 * Only displays if there's an active connection and valid device info.
 */
export function DeviceInfoSidebar() {
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

  // Only show if connected and we have valid device info
  if (status !== "connected" || !deviceInfo || (!deviceInfo.VENDOR && !deviceInfo.MODEL)) {
    return null;
  }

  const vendor = deviceInfo.VENDOR || "";
  const model = deviceInfo.MODEL || "";

  // Don't show if both are empty
  if (!vendor && !model) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border/60">
      <div className="pl-4 border-l border-border/60">
        <div className="text-xs text-foreground/80 font-medium">
          {vendor}
        </div>
        {model && (
          <div className="text-xs text-muted-foreground mt-1">
            {model}
          </div>
        )}
      </div>
    </div>
  );
}

