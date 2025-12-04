import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { DeviceTool } from "@/components/deviceTool";
import { Section } from "@/components/section";
import PageSidebar from "@/components/page-sidebar";
import { getSectionsForPage } from "@/lib/sections-config";

type TocItem = {
  id: string;
  label: string;
  children?: TocItem[];
};

const tocByLang: Record<Locale, TocItem[]> = {
  en: [
    { id: "steps", label: "Flashing Steps" },
    { id: "flashing-tool", label: "Flashing Tool" },
    { id: "firmware-selection", label: "Firmware Selection" },
  ],
  cn: [
    { id: "steps", label: "刷写步骤" },
    { id: "flashing-tool", label: "刷写工具" },
    { id: "firmware-selection", label: "固件选择" },
  ],
};

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MAKCU Firmware Flashing — Flash Tool",
    description: "Flash firmware to your MAKCU device using the web-based flashing tool.",
  },
  cn: {
    title: "MAKCU 固件刷写 — 刷写工具",
    description: "使用基于网络的刷写工具将固件刷写到您的 MAKCU 设备。",
  },
};


export async function generateMetadata({ params }: LangProps): Promise<Metadata> {
  const { lang } = await params;
  const meta = metadataCopy[lang];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}/firmware`,
    },
  };
}

export default async function FirmwarePage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isCn = lang === "cn";
  const toc = tocByLang[lang];

  const t = (en: string, cn: string) => (isCn ? cn : en);

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          {dict.tools.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {dict.tools.description}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside>
          <Card className="border-border/60 bg-card/90 shadow-lg">
            <CardContent className="p-5">
              <nav className="space-y-3 text-sm">
                {toc.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <Link
                      href={`/${lang}/firmware#${item.id}`}
                      className="font-medium text-foreground/80 transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="space-y-1 border-l border-border/60 pl-3 text-xs text-muted-foreground">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/${lang}/firmware#${child.id}`}
                              className="transition hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-20">
          {/* Steps Section */}
          <Section
            id="steps"
            title={dict.tools.sections.steps.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.tools.sections.steps.description}</p>}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ol className="list-decimal list-inside space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <li>{dict.tools.sections.steps.step1}</li>
                  <li>{dict.tools.sections.steps.step2}</li>
                  <li>{dict.tools.sections.steps.step3}</li>
                  <li>{dict.tools.sections.steps.step4}</li>
                  <li>{dict.tools.sections.steps.step5}</li>
                  <li>{dict.tools.sections.steps.step6}</li>
                  <li>{dict.tools.sections.steps.step7}</li>
                  <li>{dict.tools.sections.steps.step8}</li>
                </ol>
              </CardContent>
            </Card>
          </Section>

          {/* Flashing Tool Section */}
          <Section
            id="flashing-tool"
            title={dict.tools.sections.flashing_tool.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.tools.sections.flashing_tool.description}</p>}
          >
            {/* COM Port Warning */}
            <Card className="border-yellow-500/40 bg-yellow-500/10 shadow-lg mb-6">
              <CardContent className="p-6">
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                  {dict.tools.sections.flashing_tool.com_port_warning_title}
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {dict.tools.sections.flashing_tool.com_port_warning_desc}
                </p>
              </CardContent>
            </Card>
            {/* Unflashed Device Warning */}
            <Card className="border-red-500/40 bg-red-500/10 shadow-lg mb-6">
              <CardContent className="p-6">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                  {dict.tools.sections.flashing_tool.unflashed_warning_title}
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {dict.tools.sections.flashing_tool.unflashed_warning_desc}
                </p>
              </CardContent>
            </Card>
            <DeviceTool lang={lang} dict={dict} />
          </Section>

          {/* Firmware Selection Section */}
          <Section
            id="firmware-selection"
            title={dict.tools.sections.firmware_selection.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.tools.sections.firmware_selection.description}</p>}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t("USB 1 - Left Side", "USB 1 - 左侧")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.tools.sections.firmware_selection.left_note}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("USB 3 - Right Side", "USB 3 - 右侧")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.tools.sections.firmware_selection.right_note}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>{t("Note", "注意")}:</strong> {dict.tools.sections.firmware_selection.matching_note}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}
