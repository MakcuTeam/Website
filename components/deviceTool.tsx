"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESPLoader, FlashOptions, LoaderOptions, Transport } from "esptool-js";
import { serial } from "web-serial-polyfill";
import { Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import Loading from "./Loading";
import { toast } from "sonner";
import { DebugWindow, DebugWindowRef } from "@/components/DebugWindow";
import { Buffer } from "buffer";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";

// Treat both native and polyfilled serial ports as the Web Serial API's
// SerialPort to satisfy esptool-js' Transport constructor at runtime.
type SerialPortLike = SerialPort;

interface DataListType {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
}

export const sideFilters: Record<"left" | "right", RegExp> = {
  left: /LEFT/i,
  right: /RIGHT/i,
};

export const getFilesBySide = (
  files: DataListType[],
  side: keyof typeof sideFilters,
): DataListType[] =>
  files
    .filter((item) => sideFilters[side].test(item.name))
    .sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true }),
    );

export const DeviceTool: React.FC<{ lang: Locale; dict: Dictionary }> = ({ lang, dict }) => {
  const debugRef = useRef<DebugWindowRef | null>(null);
  const handleAddInfo = (info: string) => {
    const suppressedDiagnostics = [
      "Image file at 0x0 doesn't look like an image file, so not changing any flash settings.",
      "Running stub...",
      "Stub running...",
    ];
    if (suppressedDiagnostics.some((msg) => info.includes(msg))) {
      return;
    }
    debugRef.current?.addInfo(info);
  };

  const handleClearInfo = () => {
    debugRef.current?.clearInfo();
  };

  const [onlineDataList, setOnlineDataList] = useState<DataListType[]>([]);
  const [leftFiles, setLeftFiles] = useState<DataListType[]>([]);
  const [rightFiles, setRightFiles] = useState<DataListType[]>([]);

  const fetchOnlineDataList = async () => {
    try {
      const res = await fetch("/api/makcu");
      if (!res.ok) throw new Error("network");
      try {
        const raw: unknown = await res.json();
        if (!Array.isArray(raw)) {
          throw new Error("Invalid data format received from server.");
        }
        const dataList = (raw as DataListType[]).filter(
          (item) => !!item.downloadUrl,
        );
        dataList.sort((a, b) =>
          b.name.localeCompare(a.name, undefined, { numeric: true }),
        );
        const filesBySide = {} as Record<
          keyof typeof sideFilters,
          DataListType[]
        >;
        (Object.keys(sideFilters) as (keyof typeof sideFilters)[]).forEach(
          (side) => {
            filesBySide[side] = getFilesBySide(dataList, side);
          },
        );
        setLeftFiles(filesBySide.left);
        setRightFiles(filesBySide.right);
        setOnlineDataList(dataList);
      } catch (err) {
        console.error("Failed to parse online data list", err);
        handleAddInfo("Failed to parse online data list");
        toast.error("Failed to parse online data list");
        setLeftFiles([]);
        setRightFiles([]);
        setOnlineDataList([]);
      }
    } catch (error) {
      console.error("Failed to fetch online data list", error);
      handleAddInfo(
        "Failed to fetch online data list. Please check your connection and try again.",
      );
      toast.error("Failed to fetch online data list");
      setLeftFiles([]);
      setRightFiles([]);
      setOnlineDataList([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchOnlineDataList();
    };

    fetchData();
  }, []);

  const [config, setConfig] = useState<{ mode: "online" | "offline" }>({
    mode: "online",
  });
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<Transport | null>(null);
  const [esploader, setEsploader] = useState<ESPLoader | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [progress, setProgress] = useState(0);
  const [onlineSelect, setOnlineSelect] = useState<string>();
  
  // Use global connection context
  const { status, mode, transport, loader, connect, disconnect, browserSupported: contextBrowserSupported } = useMakcuConnection();
  const isCn = lang === "cn";
  
  // Sync global connection state with local state
  useEffect(() => {
    if (status === "connected" && mode === "flash") {
      setDevice(transport);
      setEsploader(loader);
    } else {
      setDevice(null);
      setEsploader(null);
    }
  }, [status, mode, transport, loader]);
  
  // Check if device is in normal mode on load
  useEffect(() => {
    if (status === "connected" && mode === "normal" && dict) {
      toast.warning(dict.device_control.warnings.normal_mode_detected);
    }
  }, [status, mode, dict]);

  const fileRef = useRef<HTMLInputElement>(null);
  const isConnecting = useRef(false);

  const flushWebCaches = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ("serviceWorker" in navigator && navigator.serviceWorker?.getRegistrations) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update()));
      }
      handleAddInfo("Cleared cached assets before establishing serial connection.");
    } catch (error) {
      console.warn("Failed to flush caches", error);
      handleAddInfo("Warning: unable to fully clear cached assets before connecting.");
    }
  };


  const Navigator = navigator as Navigator & { serial?: Serial; usb?: unknown };
  const serialLib =
    !Navigator.serial && Navigator.usb ? serial : Navigator.serial;

  // No need for local disconnect handlers - the global connection provider handles everything
  // The device and esploader will automatically update when the global state changes

  useEffect(() => {
    if (!device) {
      setOnlineSelect(undefined);
    }
  }, [device]);

  const connectToDevice = async () => {
    // Use global connection - it will try normal mode first, then flash mode
    await connect();
  };

  const createFlashOptions = (buffer: ArrayBuffer): FlashOptions => {
    const data = Buffer.from(buffer).toString("binary");
    const chip = esploader?.chip as {
      flashMode?: string;
      flashFreq?: string;
      flashSize?: string;
    } | undefined;
    const flashMode = chip?.flashMode ?? "dio";
    const flashFreq = chip?.flashFreq ?? "40m";
    const flashSize = chip?.flashSize ?? "keep";
    return {
      fileArray: [
        {
          data,
          address: 0x0,
        },
      ],
      flashSize,
      eraseAll: false,
      compress: true,
      flashMode,
      flashFreq,
      reportProgress(fileIndex, written, total) {
        setProgress((written / total) * 100);
      },
    };
  };

  const executeFlash = async (
    flashOptions: FlashOptions,
    firmwareName: string,
  ) => {
    if (!esploader) return;
    
    // Check if device is in normal mode
    if (status === "connected" && mode === "normal") {
      toast.error(dict?.device_control.warnings.normal_mode_detected || "Cannot flash in normal mode. Please disconnect and reconnect in flash mode.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      await esploader.writeFlash(flashOptions);
      await esploader.after();
      handleAddInfo("Flash complete");
      handleAddInfo(`Flashed ${firmwareName}`);
    } catch (error) {
      handleAddInfo("Flash error: " + error);
      console.error("Flash error:", error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const flashDevice = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const flashOptions = createFlashOptions(buffer);
      await executeFlash(flashOptions, file.name);
    } catch (error) {
      handleAddInfo("Error reading file: " + error);
    }
  };

  const flashOnline = async (firmwareName: string) => {
    if (!device) {
      const msg = "No device connected";
      handleAddInfo(msg);
      toast.error(msg);
      return;
    }
    const selected = onlineDataList.find((item) => item.name === firmwareName);
    if (!selected) {
      handleAddInfo("Selected firmware not found");
      return;
    }

    try {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`Selected firmware URL: ${selected.downloadUrl}`);
      }
      if (!/^https:\/\/raw\.githubusercontent\.com\//.test(selected.downloadUrl)) {
        const warnMsg =
          "Warning: selected firmware URL may not be a raw.githubusercontent.com resource";
        handleAddInfo(warnMsg);
        if (process.env.NODE_ENV !== "production") {
          console.warn(warnMsg);
        }
      }
      handleAddInfo(`Downloading ${selected.name}...`);
      const response = await fetch(selected.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      handleAddInfo("Download complete, starting flash...");
      const flashOptions = createFlashOptions(buffer);
      await executeFlash(flashOptions, selected.name).then(() => {
        toast.success(dict?.tools.flashSuccess);
      });
    } catch (error) {
      handleAddInfo("Error downloading firmware: " + error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const [firstFile] = files;
      setSelectedFile(firstFile);
      if (!device) {
        const msg = "No device connected";
        handleAddInfo(msg);
        toast.error(msg);
        return;
      }
      flashDevice(firstFile);
    } else {
      setSelectedFile(null);
    }
  };

  const handleModeChange = (mode: "online" | "offline") => {
    setConfig({ mode });
  };

  // Get status text based on current language and mode
  const getStatusText = () => {
    if (!contextBrowserSupported) {
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
    if (!contextBrowserSupported) {
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

  return (
    <div className="space-y-6">
      {/* Status Display - matching settings page style */}
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
            {!contextBrowserSupported && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {dict.troubleshooting.connection_status.statuses.not_supported.description}
                </p>
              </div>
            )}
            {contextBrowserSupported && status === "connected" && mode === "normal" && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {dict.device_control.warnings.normal_mode_detected}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {device && (
        <Card className="border-border/60 bg-card/90 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">{dict.tools.flashMode}</Label>
                <RadioGroup
                  value={config.mode}
                  onValueChange={handleModeChange}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label className="cursor-pointer text-sm" htmlFor="online">
                      {dict.tools.online}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offline" id="offline" />
                    <Label className="cursor-pointer text-sm" htmlFor="offline">
                      {dict.tools.offline}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {config.mode === "offline" ? dict.tools.offlineFlash : dict.tools.onlineFlash}
                </Label>
                {config.mode === "offline" ? (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      className="w-full sm:w-auto"
                    >
                      <Input
                        type="file"
                        className="hidden"
                        accept=".bin"
                        ref={fileRef}
                        onChange={handleFileChange}
                      />
                      {selectedFile ? (
                        <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                      ) : (
                        <span className="opacity-50">
                          {dict.tools.uploadFirmware}
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Select
                    disabled={!device}
                    value={onlineSelect}
                    onValueChange={(value) => {
                      setOnlineSelect(value);
                      flashOnline(value);
                    }}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[300px]"
                      disabled={!device}
                    >
                      <SelectValue
                        placeholder={
                          device ? dict.tools.list : dict.tools.connectToSelect
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{dict.tools.usb1Left}</SelectLabel>
                        {leftFiles.length > 0 ? (
                          leftFiles.map((item) => (
                            <SelectItem key={item.name} value={item.name}>
                              {item.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-left">
                            {dict.tools.noLeftFirmware}
                          </SelectItem>
                        )}
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>{dict.tools.usb3Right}</SelectLabel>
                        {rightFiles.length > 0 ? (
                          rightFiles.map((item) => (
                            <SelectItem key={item.name} value={item.name}>
                              {item.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-right">
                            {dict.tools.noRightFirmware}
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{lang === "cn" ? "刷写日志" : "Flash Log"}</Label>
            </div>
            <Loading loading={loading} className="w-full">
              <DebugWindow ref={debugRef} dict={dict} progress={progress} />
            </Loading>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
