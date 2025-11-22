import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";

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
    {
      id: "install-driver",
      label: "Install CH343 Driver",
    },
    {
      id: "flash-makcu",
      label: "Flash MAKCU Firmware",
      children: [
        { id: "flashing-process", label: "How Flashing Works" },
        { id: "baud-rate", label: "Baud Rate" },
      ],
    },
  ],
  cn: [
    {
      id: "install-driver",
      label: "安装 CH343 驱动程序",
    },
    {
      id: "flash-makcu",
      label: "刷写 MAKCU 固件",
      children: [
        { id: "flashing-process", label: "刷写过程" },
        { id: "baud-rate", label: "波特率" },
        { id: "power-requirements", label: "电源要求" },
      ],
    },
  ],
};

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MAKCU Setup Guide",
    description: "Step-by-step guide to set up your MAKCU device.",
  },
  cn: {
    title: "MAKCU 设置指南",
    description: "设置 MAKCU 设备的分步指南。",
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
  return {
    title: metadataCopy[lang].title,
    description: metadataCopy[lang].description,
  };
}

export default async function SetupPage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isCn = lang === "cn";
  const toc = tocByLang[lang];

  const t = (en: string, cn: string) => (isCn ? cn : en);

  return (
    <div className="flex flex-col pb-20">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_60%)]" />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            {isCn ? "指南" : "Guide"}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {dict.setup.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            {dict.setup.description}
          </p>
        </div>
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
                      href={`/${lang}/setup#${item.id}`}
                      className="font-medium text-foreground/80 transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="space-y-1 border-l border-border/60 pl-3 text-xs text-muted-foreground">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/${lang}/setup#${child.id}`}
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
          {/* Install Driver Section */}
          <Section
            id="install-driver"
            title={dict.setup.sections.install_driver.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.setup.sections.install_driver.description}</p>}
          >
            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                {dict.setup.sections.install_driver.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <div className="mt-4">
                <a
                  href="https://raw.githubusercontent.com/terrafirma2021/MAKCM_v2_files/main/CH343SER.EXE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                >
                  {dict.setup.sections.install_driver.driver_link}
                </a>
              </div>
            </div>
          </Section>

          {/* Flash MAKCU Section */}
          <Section
            id="flash-makcu"
            title={dict.setup.sections.flash_makcu.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.setup.sections.flash_makcu.description}</p>}
          >
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {dict.setup.sections.flash_makcu.dropdown_explanation}
              </p>

              <SubSection
                id="flashing-process"
                title={dict.setup.sections.flash_makcu.flashing_process.title}
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t("Flash Mode", "刷写模式")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.flashing_process.flash_mode}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("Connecting", "连接")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.flashing_process.connecting}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("Selecting Firmware", "选择固件")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.flashing_process.selecting_firmware}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("Flashing", "刷写")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.flashing_process.flashing}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("Completing", "完成")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.flashing_process.completing}
                    </p>
                  </div>
                </div>
              </SubSection>

              <SubSection
                id="baud-rate"
                title={dict.setup.sections.flash_makcu.baud_rate.title}
                description={dict.setup.sections.flash_makcu.baud_rate.description}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <Link href={`/${lang}/troubleshooting`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {t("Please refer to the troubleshooting page", "请参考故障排除页面")}
                  </Link>
                  {" "}
                  {t("for information on how to change the baud rate if needed.", "了解如何更改波特率（如需要）。")}
                </p>
              </SubSection>

              <SubSection
                id="power-requirements"
                title={dict.setup.sections.flash_makcu.power_requirements.title}
                description={dict.setup.sections.flash_makcu.power_requirements.description}
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t("Normal Mode", "正常模式")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.power_requirements.normal_mode}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t("Flash Mode", "刷写模式")}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.setup.sections.flash_makcu.power_requirements.flash_mode}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <strong>{t("Warning", "警告")}:</strong> {dict.setup.sections.flash_makcu.power_requirements.warning}
                    </p>
                  </div>
                </div>
              </SubSection>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

