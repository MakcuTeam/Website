import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import PageSidebar from "@/components/page-sidebar";
import { getSectionsForPage } from "@/lib/sections-config";
import { Section, SubSection } from "@/components/section";

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
  const sections = getSectionsForPage("setup");

  const t = (en: string, cn: string) => (isCn ? cn : en);

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-muted-foreground dark:text-foreground">
          {dict.setup.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {dict.setup.description}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <PageSidebar
          sections={sections}
          currentPage="/setup"
          lang={lang}
          dict={dict}
        />

        <div className="space-y-20">
          {/* Requirements Section */}
          <Section
            id="requirements"
            title={dict.setup.sections.requirements.title}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="space-y-6">
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.setup.sections.requirements.ch343_driver}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.setup.sections.requirements.ch343_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.setup.sections.requirements.com_port}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.setup.sections.requirements.com_port_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {t("Baud Rate", "波特率")}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t("Baud rate is matched to the software you will use, please see the", "波特率与您将使用的软件匹配，请查看")}{" "}
                        <Link
                          href={`/${lang}/information#baud-rate`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t("baud rate section in the information page", "信息页面中的波特率部分")}
                        </Link>
                        .
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.setup.sections.requirements.both_sides}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.setup.sections.requirements.both_sides_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.setup.sections.requirements.supported_device}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.setup.sections.requirements.supported_device_desc}
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Section>

          {/* Install Driver Section */}
          <Section
            id="install-driver"
            title={dict.setup.sections.install_driver.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.setup.sections.install_driver.description}</p>}
          >
            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                {dict.setup.sections.install_driver.steps.map((step: string, index: number) => (
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
            </div>
          </Section>

          {/* Flash Mode vs Normal Mode */}
          <Section
            id="flash-vs-normal-mode"
            title={dict.troubleshooting.flash_vs_normal_mode.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.troubleshooting.flash_vs_normal_mode.description}
              </p>
            }
          >
            {/* MAKCU Structure */}
            <SubSection
              id="makcu-structure"
              title={dict.troubleshooting.flash_vs_normal_mode.makcu_structure.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {dict.troubleshooting.flash_vs_normal_mode.makcu_structure.content}
                  </p>
                </CardContent>
              </Card>
            </SubSection>

            {/* Flash Mode */}
            <SubSection
              id="flash-mode"
              title={dict.troubleshooting.flash_vs_normal_mode.flash_mode.title}
              description={dict.troubleshooting.flash_vs_normal_mode.flash_mode.description}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("How to Enter Flash Mode", "如何进入刷写模式")}:
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <li>{dict.troubleshooting.flash_vs_normal_mode.flash_mode.steps["1"]}</li>
                        <li>{dict.troubleshooting.flash_vs_normal_mode.flash_mode.steps["2"]}</li>
                        <li>{dict.troubleshooting.flash_vs_normal_mode.flash_mode.steps["3"]}</li>
                        <li>{dict.troubleshooting.flash_vs_normal_mode.flash_mode.steps["4"]}</li>
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <strong>{t("Important", "重要")}:</strong> {dict.troubleshooting.flash_vs_normal_mode.flash_mode.important}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>{t("Note", "注意")}:</strong> {dict.troubleshooting.flash_vs_normal_mode.flash_mode.cable_note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Normal Mode */}
            <SubSection
              id="normal-mode"
              title={dict.troubleshooting.flash_vs_normal_mode.normal_mode.title}
              description={dict.troubleshooting.flash_vs_normal_mode.normal_mode.description}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Normal Mode Connections", "正常模式连接")}:
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <li>{dict.troubleshooting.flash_vs_normal_mode.normal_mode.connections.usb1}</li>
                        <li>{dict.troubleshooting.flash_vs_normal_mode.normal_mode.connections.usb2}</li>
                        <li>{dict.troubleshooting.flash_vs_normal_mode.normal_mode.connections.usb3}</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>{t("Important", "重要")}:</strong> {dict.troubleshooting.flash_vs_normal_mode.normal_mode.important}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Power Requirements */}
            <SubSection
              id="power-requirements-mode"
              title={dict.troubleshooting.flash_vs_normal_mode.power_requirements.title}
              description={dict.troubleshooting.flash_vs_normal_mode.power_requirements.description}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Normal Mode", "正常模式")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.flash_vs_normal_mode.power_requirements.normal_mode}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Flash Mode", "刷写模式")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.flash_vs_normal_mode.power_requirements.flash_mode}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>{t("Warning", "警告")}:</strong> {dict.troubleshooting.flash_vs_normal_mode.power_requirements.warning}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Problem and Solution */}
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {t("Problem", "问题")}:
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.troubleshooting.flash_vs_normal_mode.problem}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {t("Solution", "解决方法")}:
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.troubleshooting.flash_vs_normal_mode.solution}
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

