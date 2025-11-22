import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { MakcuSettings } from "@/components/makcu-settings";

type TocItem = {
  id: string;
  label: string;
  children?: TocItem[];
};

type SectionProps = {
  id: string;
  badge?: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
};

type SubSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

const tocByLang: Record<Locale, TocItem[]> = {
  en: [
    { id: "status", label: "Status" },
    { id: "prerequisites", label: "Prerequisites" },
    { id: "baud-rate", label: "Baud Rate" },
  ],
  cn: [
    { id: "status", label: "状态" },
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

function Section({ id, badge, title, lead, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="sticky top-24 z-10 mb-4">
        {badge ? (
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h2>
        {lead ? <div className="text-base leading-relaxed text-muted-foreground">{lead}</div> : null}
        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
}

function SubSection({ id, title, description, children }: SubSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <h3 className="text-xl font-semibold tracking-tight lg:text-2xl">{title}</h3>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </section>
  );
}

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{dict.settings.title}</h1>
        <p className="text-lg text-muted-foreground">{dict.settings.description}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside>
          <Card className="border-border/60 bg-card/90 shadow-lg">
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {isCn ? "目录" : "Contents"}
              </div>
              <nav className="mt-4 space-y-3 text-sm">
                {toc.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <Link
                      href={`/${lang}/settings#${item.id}`}
                      className="font-medium text-foreground/80 transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="space-y-1 border-l border-border/60 pl-3 text-xs text-muted-foreground">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/${lang}/settings#${child.id}`}
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
          {/* Status Section */}
          <Section id="status" title={t("MAKCU Status", "MAKCU 状态")}>
            <MakcuSettings lang={lang} dict={dict} />
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
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <strong>{t("Important Warning", "重要警告")}:</strong> {dict.settings.baud_rate.warning}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t("How to Change Baud Rate", "如何更改波特率")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                      {dict.settings.baud_rate.how_to_change}
                    </p>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <strong>{t("Note", "注意")}:</strong> {dict.settings.baud_rate.led_indicator}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t("Baud Rate Indicator", "波特率指示器")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.settings.baud_rate.startup_indicator}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t("Website and Tool Requirements", "网站和工具要求")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.settings.baud_rate.website_requirement}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t("Setting Baud Rate", "设置波特率")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.settings.baud_rate.setting_methods}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                      {t("For API usage, please refer to the", "对于 API 使用，请参考")}{" "}
                      <Link
                        href={`/${lang}/api#baud`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t("baud rate section in the API page", "API 页面中的波特率部分")}
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <strong>{t("Critical", "关键")}:</strong> {dict.settings.baud_rate.power_requirement}
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
