"use client";
import { RefObject, useImperativeHandle, useRef, useState } from "react";
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
import { serial, SerialPort } from "web-serial-polyfill";
import {
  getDictionary,
  LangProps,
  dictionaries,
  Dictionary,
} from "@/lib/dictionaries";
import { DebugWindow } from "./DebugWindow";
import { Locale } from "@/lib/locale";
import Loading from "./Loading";
export const DeviceTool: React.FC<{ lang: Locale }> = ({ lang }) => {
  const [dict, setDict] = useState<Dictionary>();
  getDictionary(lang).then((dict) => {
    setDict(dict);
  });
  const Navigator = navigator as any;
  const serialLib =
    !Navigator.serial && Navigator.usb ? serial : Navigator.serial;
  const [config, setConfig] = useState<{ mode: "online" | "offline" }>({
    mode: "offline",
  });
  const [loading, setLoading] = useState(false);
  const debugRef = useRef<any>(null);
  const [device, setDevice] = useState<Transport | null>();
  const [esploader, setEsploader] = useState<ESPLoader | null>();

  const connectToDevice = async () => {
    try {
      const result = await serialLib?.requestPort({});
      const transport = new Transport(result, false);
      const flashOptions = {
        transport,
        baudrate: 115200,
        terminal: {
          clean() {
            handleClearInfo;
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
      const esploader = new ESPLoader(flashOptions);
      await esploader.main();
      setDevice(transport);
      setEsploader(esploader);
    } catch (error) {
      handleAddInfo("Error: " + error);
      console.error("Failed to connect to device:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = () => {
    if (device) {
      device.disconnect();
      setDevice(null);
    }
  };

  const handleAddInfo = (info: string) => {
    if (debugRef.current) {
      debugRef.current.addInfo(info);
    }
  };

  const handleClearInfo = () => {
    if (debugRef.current) {
      debugRef.current.clearInfo();
    }
  };

  const flashDevice = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const offset = parseInt("0x00000000", 16);
    const stringBuffer = new TextDecoder().decode(buffer);

    const flashOptions: FlashOptions = {
      fileArray: [
        {
          data: stringBuffer,
          address: offset,
        },
      ],
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      flashMode: "dio",
      flashFreq: "40m",
      reportProgress: (fileIndex, written, total) => {
        handleAddInfo(
          `Progress: ${Math.round(
            (written / total) * 100
          )}% (${written}/${total})`
        );
      },
    };

    await esploader?.writeFlash(flashOptions);
    await esploader?.after();

    handleAddInfo("Flash complete");
  };

  const onlineDataList = [
    {
      name: "MAKCU_LEFT.bin",
      url: "https://github.com/terrafirma2021/MAKCU_FILES/raw/refs/heads/main/MAKCU_LEFT.bin",
    },
    {
      name: "MAKCU_RIGHT.bin",
      url: "https://github.com/terrafirma2021/MAKCU_FILES/raw/refs/heads/main/MAKCU_RIGHT.bin",
    },
    {
      name: "V3_LEFT.bin",
      url: "https://github.com/terrafirma2021/MAKCU_FILES/raw/refs/heads/main/V3_LEFT.bin",
    },
    {
      name: "V3_RIGHT.bin",
      url: "https://github.com/terrafirma2021/MAKCU_FILES/raw/refs/heads/main/V3_RIGHT.bin",
    },
  ];

  const fileRef = useRef<HTMLInputElement>(null);
  const flashOnline = async (version: string) => {};

  const disabledBtnState = () => {
    // 如果设备未连接直接返回true
    if (device == null) {
      return true;
    }

    // if (config.mode === "offline" && tempFile == null) {
    //   return true;
    // }
    // 如果是在线模式，文件为空直接返回true
    if (config.mode === "online") {
      return false;
    }

    return false;
  };

  return (
    dict && (
      <div>
        <h1 className="text-5xl text-center font-logo mb-12">
          Makcu Flash Tool
        </h1>

        <Loading
          loading={loading}
          className="border w-full h-full rounded flex flex-row items-center justify-between relative"
        >
          <div className="flex items-left flex-col gap-5 flex-1 p-5">
            <div className="flex items-center gap-2">
              <Switch
                id="airplane-mode"
                disabled
                checked={device == null ? false : true}
              />
              <Label htmlFor="airplane-mode">{dict.tools.title}</Label>
              <Button
                size="sm"
                onClick={device == null ? connectToDevice : disconnectDevice}
              >
                {device == null
                  ? `${dict.tools.connectBtn}`
                  : `${dict.tools.disconnectBtn}`}
              </Button>
            </div>
            {dict.tools.flashMode}: {config.mode}
            <RadioGroup
              defaultValue={config.mode}
              onValueChange={(mode: "online" | "offline") =>
                setConfig(() => {
                  return { mode };
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="online"
                  id="online"
                  checked={config.mode === "online"}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => {
                    setConfig(() => {
                      return {
                        mode: "online",
                      };
                    });
                  }}
                >
                  {dict.tools.online}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="offline"
                  id="offline"
                  checked={config.mode === "offline"}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => {
                    setConfig(() => {
                      return {
                        mode: "offline",
                      };
                    });
                  }}
                >
                  {dict.tools.offline}
                </Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-3">
              {config.mode === "offline" ? (
                <div className="flex items-center gap-3">
                  <Label>{dict.tools.offlineFlash}</Label>
                  <Input
                    type="file"
                    placeholder=""
                    className="w-52"
                    accept=".bin"
                    ref={fileRef}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Label>{dict.tools.onlineFlash}</Label>
                  <Select defaultValue={onlineDataList[0].name}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={dict.tools.list} />
                    </SelectTrigger>
                    <SelectContent>
                      {onlineDataList.map((item, index) => (
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
                onClick={() => {
                  // if (config.mode === "offline" && tempFile!=null) {
                  //   flashDevice(tempFile);
                  // }
                  // if (config.mode === "online") {
                  //   flashOnline("V3_LEFT.bin");
                  // }

                  console.log(fileRef.current?.files);
                }}
                // disabled={disabledBtnState()}
              >
                {dict.tools.flash}
              </Button>
            </div>
          </div>
          <DebugWindow ref={debugRef} dict={dict} />
        </Loading>
      </div>
    )
  );
};
