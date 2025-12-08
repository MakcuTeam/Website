"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
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
import { FlashOptions } from "esptool-js";
import { Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import { toast } from "sonner";
import { Buffer } from "buffer";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import { Progress } from "@/components/ui/progress";

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

type FlashControlsProps = {
  lang: Locale;
  dict: Dictionary;
  onFlashLog?: (message: string) => void;
};

export function FlashControls({ lang, dict, onFlashLog }: FlashControlsProps) {
  const { status, mode, transport, loader } = useMakcuConnection();
  const [onlineDataList, setOnlineDataList] = useState<DataListType[]>([]);
  const [leftFiles, setLeftFiles] = useState<DataListType[]>([]);
  const [rightFiles, setRightFiles] = useState<DataListType[]>([]);
  const [config, setConfig] = useState<{ mode: "online" | "offline" }>({
    mode: "online",
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [onlineSelect, setOnlineSelect] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const isCn = lang === "cn";

  const handleFlashLog = (message: string) => {
    if (onFlashLog) {
      onFlashLog(message);
    }
  };

  const fetchOnlineDataList = async () => {
    try {
      const res = await fetch("/api/makcu");
      if (!res.ok) {
        const errorText = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(`Network error: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }
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
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        handleFlashLog(`Failed to parse online data list: ${errorMessage}`);
        toast.error(`Failed to parse online data list: ${errorMessage}`);
        setLeftFiles([]);
        setRightFiles([]);
        setOnlineDataList([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      handleFlashLog(
        `Failed to fetch online data list: ${errorMessage}. Please check your connection and try again.`,
      );
      toast.error(`Failed to fetch online data list: ${errorMessage}`);
      setLeftFiles([]);
      setRightFiles([]);
      setOnlineDataList([]);
    }
  };

  useEffect(() => {
    fetchOnlineDataList();
  }, []);

  useEffect(() => {
    if (!transport || !loader) {
      setOnlineSelect(undefined);
    }
  }, [transport, loader]);

  const createFlashOptions = (buffer: ArrayBuffer, firmwareName: string): FlashOptions => {
    const data = Buffer.from(buffer).toString("binary");
    
    // Flash settings will be parsed from image header (required, no fallback)
    let flashMode: string | undefined;
    let flashFreq: string | undefined;
    let flashSize: string | undefined;
    
    // Check first few bytes to see if it looks like a valid firmware
    const firstBytes = new Uint8Array(buffer.slice(0, 16));
    
    // ESP32 firmware typically starts with E9 (magic byte) or has specific patterns
    const magicByte = firstBytes[0];
    
    // Validate firmware format
    // ESP32 bootloader expects specific magic bytes:
    // - 0xE9 for ESP32
    // - 0xEA for ESP32-S2
    // - 0x20 for ESP32-S3
    // - 0x18 for ESP32-C3
    const validMagicBytes = [0xE9, 0xEA, 0x20, 0x18];
    if (!validMagicBytes.includes(magicByte)) {
      handleFlashLog(`Warning: Firmware magic byte (0x${magicByte.toString(16).toUpperCase()}) may be invalid`);
    }
    
    // Check if image has proper ESP32 image header format for auto-detection
    // ESP32 image header structure (from esptool):
    // Byte 0: Magic byte (0xE9, 0xEA, 0x20, 0x18)
    // Byte 1: Number of segments
    // Byte 2-3: Flash mode and size flags (for auto-detection)
    // ESPLoader uses bytes 2-3 to auto-detect flash settings
    if (buffer.byteLength >= 4) {
      const flashModeSize = (firstBytes[2] << 8) | firstBytes[3];
      
      // Parse flash settings from image header
      // Format: flashModeSize is 16-bit where:
      // - Lower byte (bits 0-7): Flash size (bits 0-2) and frequency (bits 3-4)
      // - Upper byte (bits 8-15): Flash mode (bits 0-2)
      if (flashModeSize !== 0 && flashModeSize !== 0xFFFF && flashModeSize !== 0xFF) {
        // Extract flash mode from upper byte (bits 8-10)
        const flashModeByte = (flashModeSize >> 8) & 0x07;
        const flashModeMap: Record<number, string> = {
          0: 'qio',   // Quad I/O
          1: 'qout',  // Quad Output
          2: 'dio',   // Dual I/O
          3: 'dout',  // Dual Output
        };
        const detectedFlashMode = flashModeMap[flashModeByte];
        
        // Extract flash frequency from lower byte (bits 3-4)
        const flashFreqBits = (flashModeSize >> 3) & 0x03;
        const flashFreqMap: Record<number, string> = {
          0: '40m',   // 40MHz
          1: '26m',   // 26MHz
          2: '20m',   // 20MHz
          3: '80m',   // 80MHz
        };
        const detectedFlashFreq = flashFreqMap[flashFreqBits];
        
        // Extract flash size from lower byte (bits 0-2)
        const flashSizeBits = flashModeSize & 0x07;
        const flashSizeMap: Record<number, string> = {
          0: '256KB',
          1: '512KB',
          2: '1MB',
          3: '2MB',
          4: '4MB',
          5: '8MB',
          6: '16MB',
          7: '32MB',
        };
        const detectedFlashSize = flashSizeMap[flashSizeBits];
        
        if (detectedFlashMode && detectedFlashFreq) {
          flashMode = detectedFlashMode;
          flashFreq = detectedFlashFreq;
          // Note: We use 'keep' for flashSize to preserve existing flash size
        }
      }
    }
    
    // Use settings parsed from image header (required, no fallback)
    if (!flashMode || !flashFreq) {
      throw new Error(`Flash settings not parsed from image header: mode=${flashMode}, freq=${flashFreq}`);
    }
    
    const finalFlashMode = flashMode;
    const finalFlashFreq = flashFreq;
    const finalFlashSize = flashSize || "keep";
    
    return {
      fileArray: [
        {
          data,
          address: 0x0,
        },
      ],
      flashSize: finalFlashSize,
      eraseAll: false,
      compress: true,
      flashMode: finalFlashMode,
      flashFreq: finalFlashFreq,
      reportProgress(fileIndex, written, total) {
        const percent = (written / total) * 100;
        setProgress(percent);
        handleFlashLog(`Flashing progress: ${percent.toFixed(1)}%`);
      },
    };
  };

  const executeFlash = async (
    flashOptions: FlashOptions,
    firmwareName: string,
  ) => {
    if (!loader) {
      return;
    }
    
    // Check if device is in normal mode
    if (status === "connected" && mode === "normal") {
      toast.error(dict?.device_control.warnings.normal_mode_detected || "Cannot flash in normal mode. Please disconnect and reconnect in flash mode.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      handleFlashLog(`Starting flash: ${firmwareName}`);
      // Log flash plan for debugging (addresses/sizes/mode/freq/size)
      const filesSummary = flashOptions.fileArray
        .map((f, idx) => `[#${idx} addr=0x${f.address.toString(16)} len=${f.data.length}B]`)
        .join(", ");
      console.log(
        `[FLASH MODE] writeFlash plan -> files=${flashOptions.fileArray.length} ${filesSummary} ` +
        `flashMode=${flashOptions.flashMode ?? "default"} flashFreq=${flashOptions.flashFreq ?? "default"} ` +
        `flashSize=${flashOptions.flashSize ?? "default"} eraseAll=${!!flashOptions.eraseAll} compress=${!!flashOptions.compress}`
      );
      
      await loader.writeFlash(flashOptions);
      
      await loader.after();
      
      handleFlashLog("Flash complete");
      handleFlashLog(`Flashed ${firmwareName}`);
      toast.success(dict?.tools.flashSuccess || "Flash successful!");
    } catch (error) {
      const message = (error as any)?.message || String(error);
      const isBootloaderOffsetWarning = message.includes("BOOTLOADER_FLASH_OFFSET");
      // Let esptool-js handle its own retries/timeouts; we only surface non-offset errors
      if (!isBootloaderOffsetWarning) {
        const errorMsg = `Flash error: ${message}`;
        handleFlashLog(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const flashDevice = async (file: File) => {
    try {
      handleFlashLog(`Reading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      const buffer = await file.arrayBuffer();
      
      const flashOptions = createFlashOptions(buffer, file.name);
      await executeFlash(flashOptions, file.name);
    } catch (error) {
      const errorMsg = `Error reading file: ${error}`;
      handleFlashLog(errorMsg);
      toast.error(errorMsg);
    }
  };

  const flashOnline = async (firmwareName: string) => {
    if (!transport || !loader) {
      const msg = "No device connected in flash mode";
      handleFlashLog(msg);
      toast.error(msg);
      return;
    }
    const selected = onlineDataList.find((item) => item.name === firmwareName);
    if (!selected) {
      handleFlashLog("Selected firmware not found");
      return;
    }

    try {
      if (!/^https:\/\/raw\.githubusercontent\.com\//.test(selected.downloadUrl)) {
        const warnMsg =
          "Warning: selected firmware URL may not be a raw.githubusercontent.com resource";
        handleFlashLog(warnMsg);
      }
      
      handleFlashLog(`Downloading ${selected.name}...`);
      
      const response = await fetch(selected.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      
      // Check if downloaded size matches expected size
      if (selected.size > 0 && buffer.byteLength !== selected.size) {
        handleFlashLog(`Warning: File size mismatch (expected ${selected.size}, got ${buffer.byteLength})`);
      }

      handleFlashLog("Download complete, starting flash...");
      const flashOptions = createFlashOptions(buffer, selected.name);
      await executeFlash(flashOptions, selected.name);
    } catch (error) {
      const errorMsg = `Error downloading firmware: ${error}`;
      handleFlashLog(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const [firstFile] = files;
      setSelectedFile(firstFile);
      if (!transport || !loader) {
        const msg = "No device connected in flash mode";
        handleFlashLog(msg);
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

  // Only show when in flash mode
  if (status !== "connected" || mode !== "flash") {
    return null;
  }

  return (
    <div className="space-y-6">
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
                    disabled={loading}
                  >
                    <Input
                      type="file"
                      className="hidden"
                      accept=".bin"
                      ref={fileRef}
                      onChange={handleFileChange}
                      disabled={loading}
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
                  disabled={!transport || !loader || loading}
                  value={onlineSelect}
                  onValueChange={(value) => {
                    setOnlineSelect(value);
                    flashOnline(value);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[300px]"
                    disabled={!transport || !loader || loading}
                  >
                    <SelectValue
                      placeholder={
                        transport && loader ? dict.tools.list : dict.tools.connectToSelect
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

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isCn ? "刷写进度" : "Flash Progress"}
                  </span>
                  <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

