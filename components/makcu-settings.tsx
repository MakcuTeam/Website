"use client";

import { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import Link from "next/link";

interface MakcuSettingsProps {
  lang: Locale;
  dict: Dictionary;
}

export const MakcuSettings: React.FC<MakcuSettingsProps> = ({ lang, dict }) => {
  const { status, mode, comPort } = useMakcuConnection();
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
        return `${dict.settings.status.connected_normal}${comPort ? ` (${comPort})` : ""}`;
      }
      if (mode === "flash") {
        return dict.settings.status.connected_flash;
      }
    }
    return dict.settings.status.disconnected;
  };

  const isSettingsDisabled = status === "connected" && mode === "flash";

  return (
    <div className="flex flex-col pb-20">
      {/* Status Display at the very top */}
      <div className="mb-6">
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
          {isSettingsDisabled ? (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {isCn
                  ? "设备处于刷写模式。请断开连接并重新连接以进入正常模式。"
                  : "Device is in flash mode. Please disconnect and reconnect to enter normal mode."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isCn
                ? "设置配置控件将在此处显示。"
                : "Settings configuration controls will appear here."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
