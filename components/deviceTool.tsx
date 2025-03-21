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
import { DebugWindow } from "./debugWindow";
import { Locale } from "@/lib/locale";
import Loading from "./Loading";

const ONLINE_DATA_LIST = [
  {
    name: "MAKCU_LEFT.bin",
    url: "/api/download/MAKCU_LEFT.bin",
  },
  {
    name: "MAKCU_RIGHT.bin",
    url: "/api/download/MAKCU_RIGHT.bin",
  },
  {
    name: "V3_LEFT.bin",
    url: "/api/download/V3_LEFT.bin",
  },
  {
    name: "V3_RIGHT.bin",
    url: "/api/download/V3_RIGHT.bin",
  },
];

export const DeviceTool: React.FC<{ lang: Locale }> = ({ lang }) => {
  const [dict, setDict] = useState<Dictionary>();
  const debugRef = useRef<any>(null);

  const [config, setConfig] = useState<{ mode: "online" | "offline" }>({
    mode: "offline",
  });
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<Transport | null>(null);
  const [esploader, setEsploader] = useState<ESPLoader | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [firstItem] = ONLINE_DATA_LIST;
  const [onlineSelect, setOnlineSelect] = useState<string>(firstItem.name);

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
    try {
      const result = await serialLib?.requestPort({});
      const transport = new Transport(result, false);
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

      setLoading(true);
      const loader = new ESPLoader(flashOptions);
      await loader.main();
      setDevice(transport);
      setEsploader(loader);
    } catch (error) {
      handleAddInfo("Error: " + error);
      console.error("Failed to connect to device:", error);
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

  const createFlashOptions = (data: string): FlashOptions => {
    return {
      fileArray: [
        {
          data,
          address: parseInt(Buffer.byteLength(data).toString(), 10),
        },
      ],
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      flashMode: "dio",
      flashFreq: "40m",
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
      const stringBuffer = new TextDecoder().decode(buffer);
      const flashOptions = createFlashOptions(stringBuffer);
      await executeFlash(flashOptions);
    } catch (error) {
      handleAddInfo("Error reading file: " + error);
    }
  };

  const flashOnline = async () => {
    const selected = ONLINE_DATA_LIST.find(
      (item) => item.name === onlineSelect
    );
    if (!selected) {
      handleAddInfo("Selected firmware not found");
      return;
    }

    try {
      handleAddInfo(`Downloading ${selected.name}...`);
      const response = await fetch(selected.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const stringBuffer = new TextDecoder().decode(buffer);

      handleAddInfo("Download complete, starting flash...");
      const flashOptions = createFlashOptions(stringBuffer);
      await executeFlash(flashOptions);
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

      <Loading
        loading={loading}
        className="border w-full h-full rounded flex flex-row items-center justify-between relative"
      >
        <div className="flex items-left flex-col gap-12 flex-1 p-5">
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
            <Label>
              {dict.tools.flashMode} :
            </Label>
            <RadioGroup
              value={config.mode}
              onValueChange={handleModeChange}
              className="flex items-center gap-2"
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
                <Input
                  type="file"
                  className="w-52"
                  accept=".bin"
                  ref={fileRef}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Label>{dict.tools.onlineFlash}</Label>
                <Select value={onlineSelect} onValueChange={setOnlineSelect}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={dict.tools.list} />
                  </SelectTrigger>
                  <SelectContent>
                    {ONLINE_DATA_LIST.map((item) => (
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
              disabled={!device || (config.mode === "offline" && !selectedFile)}
            >
              {dict.tools.flash}
            </Button>
          </div>
        </div>
        <DebugWindow ref={debugRef} dict={dict} />
      </Loading>
    </div>
  );
};
