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
  const { status, mode } = useMakcuConnection();
  const isCn = lang === "cn";

  // Check if device is in flash mode on load
  useEffect(() => {
    if (status === "connected" && mode === "flash") {
      // Device is in flash mode - settings cannot be used
    }
  }, [status, mode]);

  // Get status text based on current language and mode
  const getStatusText = () => {
    if (status === "disconnected") {
      return dict.settings.status.disconnected;
    }
    if (status === "connecting") {
      return dict.settings.status.connecting;
    }
    if (status === "fault") {
      return dict.settings.status.fault;
    }
    if (status === "connected") {
      if (mode === "normal") {
        return dict.settings.status.connected_normal;
      }
      if (mode === "flash") {
        return dict.settings.status.connected_flash;
      }
    }
    return dict.settings.status.disconnected;
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
            <p className="text-lg mt-2 text-muted-foreground">
              {isCn ? "MAKCU 状态" : "MAKCU status"} : {getStatusText()}
            </p>
          </div>
          {isSettingsDisabled && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {dict.settings.warnings.flash_mode_detected}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
