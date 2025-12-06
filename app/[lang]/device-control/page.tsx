import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { ConditionalSidebar } from "@/components/conditional-sidebar";
import { getSectionsForPage } from "@/lib/sections-config";
import { SerialTerminalSection } from "@/components/serial-terminal-section";
import { FirmwareSelectionSection } from "@/components/firmware-selection-section";
import { DeviceTestSection } from "@/components/device-test-section";
import { DeviceControlNote } from "@/components/device-control-note";

type TocItem = {
  id: string;
  label: string;
  children?: TocItem[];
};

const tocByLang: Record<Locale, TocItem[]> = {
  en: [
    { id: "device-test", label: "Device Test" },
    { id: "firmware-selection", label: "Firmware Selection" },
    { id: "serial-terminal", label: "Serial Terminal" },
  ],
  cn: [
    { id: "device-test", label: "设备测试" },
    { id: "firmware-selection", label: "固件选择" },
    { id: "serial-terminal", label: "串口终端" },
  ],
};

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MAKCU Device Control — Device Configuration",
    description: "Configure and interact with your MAKCU device via WebSerial connection.",
  },
  cn: {
    title: "MAKCU 设备控制 — 设备配置",
    description: "通过 WebSerial 连接配置和交互您的 MAKCU 设备。",
  },
};


export async function generateMetadata({ params }: LangProps): Promise<Metadata> {
  const { lang } = await params;
  const meta = metadataCopy[lang];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}/device-control`,
    },
  };
}

export default async function DeviceControlPage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isCn = lang === "cn";
  const toc = tocByLang[lang];

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-black dark:text-white">
          {dict.device_control.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {dict.device_control.description}
        </p>
        <DeviceControlNote lang={lang} />
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <ConditionalSidebar
          sections={getSectionsForPage("device-control")}
          currentPage="/device-control"
          lang={lang}
          dict={dict}
        />

        <div className="space-y-20">
          {/* Device Test Section - Only visible in normal mode */}
          <DeviceTestSection lang={lang} dict={dict} />

          {/* Firmware Selection Section - Only visible in flash mode */}
          <FirmwareSelectionSection lang={lang} dict={dict} />

          {/* Serial Terminal Section with Flash Controls - Only visible in normal or flash mode */}
          <SerialTerminalSection lang={lang} dict={dict} />
        </div>
      </div>
    </div>
  );
}

