"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
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
import { getDictionary, Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import Loading from "./Loading";
import { toast } from "sonner";
import { DebugWindow, DebugWindowRef } from "@/components/DebugWindow";
import { Buffer } from "buffer";

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

export const DeviceTool: React.FC<{ lang: Locale }> = ({ lang }) => {
  const [dict, setDict] = useState<Dictionary>();
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
  const [browserSupported, setBrowserSupported] = useState(true);
  const [showBrowserWarning, setShowBrowserWarning] = useState(true);

  const fileRef = useRef<HTMLInputElement>(null);
  const hasAutoConnected = useRef(false);
  const isConnecting = useRef(false);

  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    };
    loadDictionary();
  }, [lang]);

  const Navigator = navigator as Navigator & { serial?: Serial; usb?: unknown };
  const serialLib =
    !Navigator.serial && Navigator.usb ? serial : Navigator.serial;

  useEffect(() => {
    setBrowserSupported(!!(Navigator.serial || Navigator.usb));
  }, []);

  useEffect(() => {
    if (hasAutoConnected.current || !browserSupported) return;
    hasAutoConnected.current = true;

    const handleConnect = (event: Event) => {
      const port =
        (event as unknown as { target?: SerialPortLike; port?: SerialPortLike })
          .target ||
        (event as unknown as { port?: SerialPortLike }).port;
      if (port) {
        connectToDevice(port);
      }
    };

    Navigator.serial?.addEventListener("connect", handleConnect);

    (async () => {
      const ports = await serialLib.getPorts();
      if (ports.length > 0) {
        connectToDevice(ports[0] as unknown as SerialPortLike);
      } else {
        connectToDevice();
      }
    })();

    return () => {
      Navigator.serial?.removeEventListener("connect", handleConnect);
    };
  }, [browserSupported]);

  const connectToDevice = async (port?: SerialPortLike) => {
    if (isConnecting.current) return;
    isConnecting.current = true;
    setLoading(true);
    try {
      const result = (port || (await serialLib.requestPort())) as unknown as SerialPortLike;
      const transport = new Transport(result, false, false);
      const flashOptions = {
        transport,
        baudrate: 921600,
        terminal: {
          clean() {
            handleClearInfo();
          },
          writeLine(data) {
            handleAddInfo(data);
          },
          write(data) {
            handleAddInfo(data);
          },
        },
        debugLogging: false,
      } as LoaderOptions;

      const loader = new ESPLoader(flashOptions);
      await loader.main();
      toast.success(dict?.tools.connectSuccess);
      setDevice(transport);
      setEsploader(loader);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      handleAddInfo(message);
      toast.error(message);
    } finally {
      setLoading(false);
      isConnecting.current = false;
    }
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

  useEffect(() => {
    if (dict && !browserSupported) {
      toast.warning(dict.tools.browserNotSupported);
    }
  }, [dict, browserSupported]);

  if (!dict) {
    return <Loading loading={true} className="w-full h-64" />;
  }

  if (!browserSupported) {
    return (
      <div>
        {showBrowserWarning && (
          <div className="mb-4 flex items-center justify-between rounded border border-yellow-200 bg-yellow-100 p-4 text-yellow-800">
            <span>{dict.tools.browserNotSupported}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBrowserWarning(false)}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-5xl text-center font-logo mb-12">Makcu Flash Tool</h1>
      <div className="flex flex-row gap-5">
        <Loading
          loading={loading}
          className="border w-full h-full rounded flex flex-row items-center justify-between relative backdrop-blur-sm "
        >
          <div className="flex items-left flex-col gap-8 flex-1 p-5 ">
            <div className="flex items-center gap-2">
              <Label>{dict.tools.flashMode} :</Label>
              <RadioGroup
                value={config.mode}
                onValueChange={handleModeChange}
                className="flex items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label className="cursor-pointer" htmlFor="online">
                    {dict.tools.online}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offline" id="offline" />
                  <Label className="cursor-pointer" htmlFor="offline">
                    {dict.tools.offline}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center gap-3">
              {config.mode === "offline" ? (
                <div className="flex items-center gap-3">
                  <Label>{dict.tools.offlineFlash}</Label>
                  <Button
                    variant={"outline"}
                    onClick={() => fileRef.current?.click()}
                    className="w-[12.7em]"
                  >
                    <Input
                      type="file"
                      className="hidden"
                      accept=".bin"
                      ref={fileRef}
                      onChange={handleFileChange}
                    />
                    {selectedFile ? (
                      selectedFile.name
                    ) : (
                      <span className=" opacity-50">
                        {dict.tools.uploadFirmware}
                      </span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Label>{dict.tools.onlineFlash}</Label>
                  <Select
                    value={onlineSelect}
                    onValueChange={(value) => {
                      setOnlineSelect(value);
                      flashOnline(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={dict.tools.list} />
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
                </div>
              )}
            </div>
          </div>
        </Loading>
        <DebugWindow ref={debugRef} dict={dict} progress={progress} />
      </div>
    </div>
  );
};
