"use client";

import { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";

interface MakcuSettingsProps {
  lang: Locale;
  dict: Dictionary;
}

export const MakcuSettings: React.FC<MakcuSettingsProps> = ({ lang, dict }) => {
  const { status, mode, browserSupported } = useMakcuConnection();
  const isCn = lang === "cn";

  // Check if device is in flash mode on load
  useEffect(() => {
    if (status === "connected" && mode === "flash") {
      // Device is in flash mode - settings cannot be used
    }
  }, [status, mode]);

  // Get status text based on current language and mode
  const getStatusText = () => {
    if (!browserSupported) {
      return dict.troubleshooting.connection_status.statuses.not_supported.label;
    }
    if (status === "disconnected") {
      return dict.device_control.status.disconnected;
    }
    if (status === "connecting") {
      return dict.device_control.status.connecting;
    }
    if (status === "fault") {
      return dict.device_control.status.fault;
    }
    if (status === "connected") {
      if (mode === "normal") {
        return dict.device_control.status.connected_normal;
      }
      if (mode === "flash") {
        return dict.device_control.status.connected_flash;
      }
    }
    return dict.device_control.status.disconnected;
  };

  // Get status color dot - matching Connection Status Overview colors
  const getStatusColor = () => {
    if (!browserSupported) {
      return "bg-muted-foreground"; // Gray for not supported
    }
    if (status === "connected") {
      if (mode === "normal") {
        return "bg-emerald-500"; // Green for normal mode
      }
      if (mode === "flash") {
        return "bg-blue-500"; // Blue for flash mode
      }
      return "bg-emerald-500";
    }
    if (status === "fault") {
      return "bg-red-500"; // Red for fault
    }
    if (status === "connecting") {
      return "bg-yellow-500"; // Yellow for connecting
    }
    return "bg-muted-foreground"; // Gray for disconnected/not supported
  };

  const isSettingsDisabled = status === "connected" && mode === "flash";

  return (
    <Card className="border-border/60 bg-card/90 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {isCn ? "MAKCU 状态" : "MAKCU Status"}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <p className="text-lg text-muted-foreground">
                {isCn ? "MAKCU 状态" : "MAKCU status"} : {getStatusText()}
              </p>
            </div>
          </div>
          {!browserSupported && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {dict.troubleshooting.connection_status.statuses.not_supported.description}
              </p>
            </div>
          )}
          {browserSupported && isSettingsDisabled && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {dict.device_control.warnings.flash_mode_detected}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
