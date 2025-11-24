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
            badge={t("Setup", "设置")}
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
                        {t("Baud rate is matched to the cheat you will use, please see the", "波特率与您将使用的作弊软件匹配，请查看")}{" "}
                        <Link
                          href={`/${lang}/setup#baud-rate`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t("baud rate section below", "下面的波特率部分")}
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
            </div>
          </Section>

          {/* Flash Mode vs Normal Mode */}
          <Section
            id="flash-vs-normal-mode"
            badge={t("Mode", "模式")}
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

          {/* Connection Status */}
          <Section
            id="connection-status"
            badge={t("Connection", "连接")}
            title={dict.troubleshooting.connection_status.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.troubleshooting.connection_status.description}
              </p>
            }
          >
            <SubSection
              id="connection-status-overview"
              title={t("Connection Status Overview", "连接状态概述")}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Not Supported */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                        <h4 className="font-semibold text-foreground">
                          {dict.troubleshooting.connection_status.statuses.not_supported.label}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-5">
                        {dict.troubleshooting.connection_status.statuses.not_supported.description}
                      </p>
                    </div>

                    {/* Disconnected */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                        <h4 className="font-semibold text-foreground">
                          {dict.troubleshooting.connection_status.statuses.disconnected.label}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-5">
                        {dict.troubleshooting.connection_status.statuses.disconnected.description}
                      </p>
                    </div>

                    {/* Connecting */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <h4 className="font-semibold text-foreground">
                          {dict.troubleshooting.connection_status.statuses.connecting.label}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-5">
                        {dict.troubleshooting.connection_status.statuses.connecting.description}
                      </p>
                    </div>

                    {/* Normal Mode */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <h4 className="font-semibold text-foreground">
                          {dict.troubleshooting.connection_status.statuses.normal_mode.label}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-5">
                        {dict.troubleshooting.connection_status.statuses.normal_mode.description}
                      </p>
                    </div>

                    {/* Flash Mode */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h4 className="font-semibold text-foreground">
                          {dict.troubleshooting.connection_status.statuses.flash_mode.label}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-5">
                        {dict.troubleshooting.connection_status.statuses.flash_mode.description}
                      </p>
                    </div>

                    {/* Fault */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <h4 className="font-semibold text-foreground">
                          {dict.troubleshooting.connection_status.statuses.fault.label}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground pl-5">
                        {dict.troubleshooting.connection_status.statuses.fault.description}
                      </p>
                    </div>

                    {/* COM Port Note */}
                    <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {dict.troubleshooting.connection_status.com_port_note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>

          {/* Baud Rate Section */}
          <Section
            id="baud-rate"
            badge={t("Important", "重要")}
            title={dict.setup.sections.flash_makcu.baud_rate.title}
            lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.setup.sections.flash_makcu.baud_rate.description}</p>}
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

