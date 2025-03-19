"use client";
import { useImperativeHandle, useRef, useState } from "react";
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

export const HID = () => {
  const Navigator = navigator as any;
  const serialLib =
    !Navigator.serial && Navigator.usb ? serial : Navigator.serial;

  const [config, setConfig] = useState({
    mode: "online",
  });
  const debugRef = useRef<any>(null);

  const connectToDevice = async () => {
    try {
      // await (navigator as any).hid?.requestDevice({
      //     filters: [],
      //   });

      await serialLib.requestPort({});
    } catch (error) {
      console.log(error);
      handleAddInfo("" + error);
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
  return (
    <div>
      <h1 className="text-5xl text-center font-logo mb-12">Makcu Flash Tool</h1>
      <div className="border w-full h-full rounded flex flex-row items-center justify-between">
        <div className="flex items-left flex-col gap-5 flex-1 p-5">
          <div className="flex items-center gap-2">
            <Switch id="airplane-mode" disabled />
            <Label htmlFor="airplane-mode">Now Status</Label>
            <Button size="sm" onClick={connectToDevice}>
              Connect Device
            </Button>
          </div>
          Flash Mode {config.mode}
          <RadioGroup
            defaultValue={config.mode}
            onValueChange={(mode) =>
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
                Online Flash
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
                Offline Flash
              </Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-3">
            {config.mode === "offline" ? (
              <div className="flex items-center gap-3">
                <Label>Offline Firmware</Label>
                <Input type="file" placeholder="" className="w-52" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Label>Online Firmware</Label>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Fimware List" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">left v1.3</SelectItem>
                    <SelectItem value="dark">right v1.3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button size="sm">Flash</Button>
          </div>
        </div>

        <DebugWindow ref={debugRef} />
      </div>
    </div>
  );
};

import React, { forwardRef } from "react";

export const DebugWindow = forwardRef((props, ref) => {
  const [info, setInfo] = useState(["Welcome!"]);

  useImperativeHandle(ref, () => ({
    addInfo: (newInfo: string) => {
      setInfo((prev) => [...prev, newInfo]);
    },
    clearInfo: () => {
      setInfo([]);
    },
  }));

  return (
    <div className="flex-1 border-l">
      <div className="p-2 bg-black border-b">
        <Button size="xs" onClick={() => setInfo([])}>
          Clear Debug Info
        </Button>
      </div>
      <div className=" w-full h-56 bg-black text-white py-2 px-3 text-sm overflow-y-auto">
        {info.map((e, k) => (
          <span key={k} className="block">
            {e}
          </span>
        ))}
      </div>
    </div>
  );
});
