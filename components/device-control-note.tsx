"use client";

import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";

type DeviceControlNoteProps = {
  lang: Locale;
};

export function DeviceControlNote({ lang }: DeviceControlNoteProps) {
  const { status } = useMakcuConnection();
  const isCn = lang === "cn";
  
  // Only show note when disconnected or in fault state
  // Hide when connected (regardless of mode)
  const shouldShow = status === "disconnected" || status === "fault";
  
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <p className="text-sm text-blue-600 dark:text-blue-400">
        {isCn ? (
          <span>
            <strong>注意：</strong>一旦设备在正常模式或刷写模式下连接，页面内容将会显示。请确保您的设备已正确连接并处于正常模式或刷写模式。
          </span>
        ) : (
          <span>
            <strong>Note:</strong> Once a device is connected in either flash mode or normal mode, the page content will appear. Please ensure your device is properly connected and in either normal mode or flash mode.
          </span>
        )}
      </p>
    </div>
  );
}

