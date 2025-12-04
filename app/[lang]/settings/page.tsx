import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { Section, SubSection } from "@/components/section";
import PageSidebar from "@/components/page-sidebar";
import { getSectionsForPage } from "@/lib/sections-config";
import { DeviceInformationDisplay } from "@/components/device-information-display";

type TocItem = {
  id: string;
  label: string;
  children?: TocItem[];
};

const tocByLang: Record<Locale, TocItem[]> = {
  en: [
    { id: "device-information", label: "Device Information" },
    { id: "prerequisites", label: "Prerequisites" },
    { id: "baud-rate", label: "Baud Rate" },
  ],
  cn: [
    { id: "device-information", label: "设备信息" },
    { id: "prerequisites", label: "前提条件" },
    { id: "baud-rate", label: "波特率" },
  ],
};

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MAKCU Settings — Device Configuration",
    description: "Configure and interact with your MAKCU device via WebSerial connection.",
  },
  cn: {
    title: "MAKCU 设置 — 设备配置",
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
      canonical: `/${lang}/settings`,
    },
  };
}

export default async function SettingsPage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isCn = lang === "cn";
  const toc = tocByLang[lang];

  const t = (en: string, cn: string) => (isCn ? cn : en);

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {dict.settings.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {dict.settings.description}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <PageSidebar
          sections={getSectionsForPage("settings")}
          currentPage="/settings"
          lang={lang}
          dict={dict}
        />

        <div className="space-y-20">
          {/* Device Information Section */}
          <Section id="device-information" title={dict.settings.sections.device_information}>
            <DeviceInformationDisplay lang={lang} />
          </Section>

          {/* Prerequisites Section */}
          <Section
            id="prerequisites"
            title={dict.settings.prerequisites.title}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.settings.prerequisites.firmware}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.settings.prerequisites.firmware_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.settings.prerequisites.usb1}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.settings.prerequisites.usb1_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.settings.prerequisites.usb2}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.settings.prerequisites.usb2_desc}
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {dict.settings.prerequisites.note}{" "}
                    <Link
                      href={`/${lang}/troubleshooting`}
                      className="underline hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {isCn ? "故障排除页面" : "troubleshooting page"}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Baud Rate Section */}
          <Section
            id="baud-rate"
            title={dict.settings.baud_rate.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.settings.baud_rate.description}</p>}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <Link href={`https://www.makcu.com/${lang}/setup#baud-rate`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {t("Please refer to the setup page", "请参考设置页面")}
                  </Link>
                  {" "}
                  {t("for detailed information on baud rate configuration.", "了解波特率配置的详细信息。")}
                </p>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}
