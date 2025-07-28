"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESPLoader, FlashOptions, LoaderOptions, Transport } from "esptool-js";
import { serial } from "web-serial-polyfill";
import { getDictionary, Dictionary } from "@/lib/dictionaries";
import { Locale } from "@/lib/locale";
import Loading from "./Loading";
import { toast } from "sonner";
import { DebugWindow } from "@/components/DebugWindow";

interface DataListType {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
}

export const DeviceTool: React.FC<{ lang: Locale }> = ({ lang }) => {
  const [dict, setDict] = useState<Dictionary>();
  const debugRef = useRef<any>(null);

  const [onlineDataList, setOnlineDataList] = useState<DataListType[]>([]);

  const fetchOnlineDataList = async () => {
    try {
      const res = await fetch("/api/makcu");
      if (!res.ok) throw new Error("network");
      const data: DataListType[] = await res.json();
      setOnlineDataList(data);
    } catch {
      console.error("Failed to fetch online data list");
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

  const [progress, setProgress] = useState(-1);
  const [onlineSelect, setOnlineSelect] = useState<string>();

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    };
    loadDictionary();
  }, [lang]);

  const Navigator = navigator as any;
  const serialLib =
    !Navigator.serial && Navigator.usb ? serial : Navigator.serial;

  const handleAddInfo = (info: string) => {
    debugRef.current?.addInfo(info);
  };

  const handleClearInfo = () => {
    debugRef.current?.clearInfo();
  };

  const connectToDevice = async () => {
    setLoading(true);
    try {
      const result = await serialLib.requestPort();
      const transport = new Transport(result, false, false);
      const flashOptions = {
        transport,
        baudrate: 115200,
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
      await loader.main().then(() => {
        toast.success(dict?.tools.connectSuccess);
      });
      setDevice(transport);
      setEsploader(loader);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = () => {
    if (device) {
      device.disconnect();
      setDevice(null);
      setEsploader(null);
      handleAddInfo("Device disconnected");
    }
  };

  const createFlashOptions = (buffer: ArrayBuffer): FlashOptions => {
    const dataStr = Array.from(new Uint8Array(buffer))
      .map((b) => String.fromCharCode(b))
      .join("");

    return {
      fileArray: [
        {
          data: dataStr,
          address: 0x0,
        },
      ],
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      flashMode: "dio",
      flashFreq: "40m",
      reportProgress(fileIndex, written, total) {
        setProgress((written / total) * 100);
      },
    };
  };

  const executeFlash = async (flashOptions: FlashOptions) => {
    if (!esploader) return;

    try {
      setLoading(true);
      await esploader.writeFlash(flashOptions);
      await esploader.after();
      handleAddInfo("Flash complete");
    } catch (error) {
      handleAddInfo("Flash error: " + error);
      console.error("Flash error:", error);
    } finally {
      setLoading(false);
    }
  };

  const flashDevice = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const flashOptions = createFlashOptions(buffer);
      await executeFlash(flashOptions);
    } catch (error) {
      handleAddInfo("Error reading file: " + error);
    }
  };

  const flashOnline = async () => {
    const selected = onlineDataList.find((item) => item.name === onlineSelect);
    if (!selected) {
      handleAddInfo("Selected firmware not found");
      return;
    }

    try {
      handleAddInfo(`Downloading ${selected.name}...`);
      const response = await fetch(selected.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      handleAddInfo("Download complete, starting flash...");
      const flashOptions = createFlashOptions(buffer);
      await executeFlash(flashOptions).then((e) => {
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
    } else {
      setSelectedFile(null);
    }
  };

  const handleFlashClick = () => {
    if (config.mode === "offline" && selectedFile) {
      flashDevice(selectedFile);
    } else if (config.mode === "online") {
      flashOnline();
    }
  };

  const handleModeChange = (mode: "online" | "offline") => {
    setConfig({ mode });
  };

  if (!dict) {
    return <Loading loading={true} className="w-full h-64" />;
  }

  return (
    <div>
      <h1 className="text-5xl text-center font-logo mb-12">Makcu Flash Tool</h1>
      <div className="flex flex-row gap-5">
        <Loading
          loading={loading}
          className="border w-full h-full rounded flex flex-row items-center justify-between relative backdrop-blur-sm "
        >
          <div className="flex items-left flex-col gap-12 flex-1 p-5 ">
            <div className="flex items-center gap-2">
              <Switch id="device-connected" disabled checked={!!device} />
              <Label htmlFor="device-connected">{dict.tools.title}</Label>
              <Button
                size="sm"
                onClick={device ? disconnectDevice : connectToDevice}
              >
                {device ? dict.tools.disconnectBtn : dict.tools.connectBtn}
              </Button>
            </div>
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
                  <Select value={onlineSelect} onValueChange={setOnlineSelect}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={dict.tools.list} />
                    </SelectTrigger>
                    <SelectContent>
                      {onlineDataList.map((item) => (
                        <SelectItem key={item.name} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                size="sm"
                onClick={handleFlashClick}
                disabled={
                  !device || (config.mode === "offline" && !selectedFile)
                }
              >
                {dict.tools.flash}
              </Button>
            </div>
          </div>
        </Loading>
        <DebugWindow ref={debugRef} dict={dict} progress={progress} />
      </div>
    </div>
  );
};
