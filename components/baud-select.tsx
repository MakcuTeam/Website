"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gauge, Check } from "lucide-react";
import { useEffect, useState } from "react";

const BAUD_RATES = [
  { value: 115200, label: "115200" },
  { value: 4000000, label: "4M" },
];

const COOKIE_NAME = "makcu_baud_rate";
const COOKIE_EXPIRY_HOURS = 1;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, hours: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export default function BaudSelect() {
  const [currentBaud, setCurrentBaud] = useState<number>(115200);

  useEffect(() => {
    // Load from cookie on mount
    const savedBaud = getCookie(COOKIE_NAME);
    if (savedBaud) {
      const baudValue = parseInt(savedBaud, 10);
      if (BAUD_RATES.some((r) => r.value === baudValue)) {
        setCurrentBaud(baudValue);
      }
    }
  }, []);

  function handleChangeBaud(baudRate: number) {
    if (baudRate === currentBaud) return;
    setCurrentBaud(baudRate);
    setCookie(COOKIE_NAME, baudRate.toString(), COOKIE_EXPIRY_HOURS);
  }

  const currentBaudLabel = BAUD_RATES.find((r) => r.value === currentBaud)?.label || "115200";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          title={`Current baud rate: ${currentBaudLabel}`}
        >
          <Gauge className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {BAUD_RATES.map((rate) => {
          const isActive = rate.value === currentBaud;
          return (
            <DropdownMenuItem
              key={rate.value}
              onClick={() => handleChangeBaud(rate.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="font-medium">{rate.label}</span>
              {isActive && (
                <Check className="h-4 w-4 ml-2 flex-shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getBaudRate(): number {
  if (typeof document === "undefined") return 115200;
  const savedBaud = getCookie(COOKIE_NAME);
  if (savedBaud) {
    const baudValue = parseInt(savedBaud, 10);
    if (BAUD_RATES.some((r) => r.value === baudValue)) {
      return baudValue;
    }
  }
  return 115200;
}

