"use client";

import { Button } from "./ui/button";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import { Dictionary } from "@/lib/dictionaries";
import useLocale from "./hooks/useLocale";
import { Plug, PlugZap, AlertCircle } from "lucide-react";

export function MakcuConnectionButton({ dict }: { dict: Dictionary }) {
  const { status, mode, connect, disconnect, isConnecting, browserSupported, detectedBaudRate } = useMakcuConnection();
  const locale = useLocale();
  const isCn = locale === "cn";

  const getStatusText = () => {
    if (status === "disconnected") {
      return dict.navbar.makcu_status.disconnected;
    }
    if (status === "connecting") {
      return dict.navbar.makcu_status.connecting;
    }
    if (status === "fault") {
      return dict.navbar.makcu_status.fault;
    }
    if (status === "connected") {
      if (mode === "normal") {
        return dict.navbar.makcu_status.connected_normal;
      }
      if (mode === "flash") {
        return dict.navbar.makcu_status.connected_flash;
      }
    }
    return dict.navbar.makcu_status.disconnected;
  };

  const getStatusColor = () => {
    if (status === "connected") {
      if (mode === "normal") {
        return "text-emerald-500 dark:text-emerald-400";
      }
      if (mode === "flash") {
        return "text-blue-600 dark:text-blue-400";
      }
      return "text-emerald-500 dark:text-emerald-400";
    }
    if (status === "fault") {
      return "text-red-500 dark:text-red-400";
    }
    if (status === "connecting") {
      return "text-yellow-500 dark:text-yellow-400";
    }
    return "text-muted-foreground";
  };

  const getStatusIcon = () => {
    if (status === "connected") {
      return <PlugZap className="h-3 w-3" />;
    }
    if (status === "fault") {
      return <AlertCircle className="h-3 w-3" />;
    }
    return <Plug className="h-3 w-3" />;
  };

  const handleClick = () => {
    if (status === "connected") {
      // Temporarily disable disconnect action; keep button non-clickable
      return;
    }
    connect();
  };

  if (!browserSupported) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 px-2 text-xs"
        >
          <Plug className="h-3 w-3" />
          <span className="ml-1 hidden sm:inline">
            Disabled
          </span>
        </Button>
        <div className="text-xs text-muted-foreground hidden md:inline">
          Not Supported
        </div>
      </div>
    );
  }

  const getBaudRateDisplay = () => {
    if (status === "connected" && detectedBaudRate) {
      return detectedBaudRate === 115200 ? "115200" : "4M";
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isConnecting || status === "connected"}
        className="h-8 px-2 text-xs"
      >
        {getStatusIcon()}
        <span className="ml-1 hidden sm:inline">
          {status === "connected" ? "Connected" : dict.device_control.connection.connect}
        </span>
      </Button>
      {status === "connected" && detectedBaudRate && (
        <div className="text-xs text-muted-foreground hidden md:inline">
          {getBaudRateDisplay()}
        </div>
      )}
      <div className={`text-xs ${getStatusColor()} hidden md:inline`}>
        {getStatusText()}
      </div>
    </div>
  );
}

