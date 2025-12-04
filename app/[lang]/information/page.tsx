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
    title: "MAKCU Information — What is MAKCU?",
    description: "Learn about what MAKCU is, what it does, and how it works.",
  },
  cn: {
    title: "MAKCU 信息 — 什么是 MAKCU？",
    description: "了解 MAKCU 是什么、它的功能以及工作原理。",
  },
};

export async function generateMetadata({ params }: LangProps): Promise<Metadata> {
  const { lang } = await params;
  const meta = metadataCopy[lang];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}/information`,
    },
  };
}

export default async function InformationPage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const sections = getSectionsForPage("information");
  const isCn = lang === "cn";
  const t = <T,>(en: T, cn: T): T => (isCn ? cn : en);

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {dict.information.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {dict.information.description}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <PageSidebar
          sections={sections}
          currentPage="/information"
          lang={lang}
          dict={dict}
        />

        <div className="space-y-20">
          {/* What is MAKCU */}
          <Section
            id="what-is-makcu"
            badge={t("Overview", "概述")}
            title={dict.information.what_is_makcu.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.information.what_is_makcu.description}
              </p>
            }
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {dict.information.what_is_makcu.key_points.map((point: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-emerald-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <SubSection
              id="important-requirements"
              title={dict.information.what_is_makcu.important_notes.title}
            >
              <div className="space-y-4">
                <Card className="border-red-500/40 bg-red-500/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-600 dark:text-red-400">
                        {t("Standalone Mode", "独立模式")}
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {dict.information.what_is_makcu.important_notes.standalone}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/40 bg-red-500/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-600 dark:text-red-400">
                        {t("Attached Device Required", "需要连接设备")}
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {dict.information.what_is_makcu.important_notes.attached_device}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/40 bg-red-500/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-600 dark:text-red-400">
                        {t("Software Control Required", "需要软件控制")}
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {dict.information.what_is_makcu.important_notes.software_control}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SubSection>
          </Section>

          {/* What is it used for */}
          <Section
            id="what-is-it-used-for"
            badge={t("Usage", "用途")}
            title={dict.information.what_is_it_used_for.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.information.what_is_it_used_for.description}
              </p>
            }
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {dict.information.what_is_it_used_for.use_cases.map((useCase: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-emerald-500">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <SubSection
              id="device-communication"
              title={dict.information.what_is_it_used_for.device_communication.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.what_is_it_used_for.device_communication.description}
                    </p>
                    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {dict.information.what_is_it_used_for.device_communication.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-emerald-500">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>

          {/* Capabilities */}
          <Section
            id="capabilities"
            badge={t("Capabilities", "功能")}
            title={dict.information.capabilities.title}
          >
            <SubSection
              id="can-do"
              title={dict.information.capabilities.can_do.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {dict.information.capabilities.can_do.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-emerald-500">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection
              id="cannot-do"
              title={dict.information.capabilities.cannot_do.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {dict.information.capabilities.cannot_do.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-red-500">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection
              id="important-reminders"
              title={dict.information.capabilities.important_reminders.title}
            >
              <div className="space-y-4">
                <Card className="border-yellow-500/40 bg-yellow-500/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {t("No Cheat Capabilities", "无作弊功能")}
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        {dict.information.capabilities.important_reminders.no_cheats}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/40 bg-blue-500/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                        {t("Input Level Only", "仅输入级别")}
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {dict.information.capabilities.important_reminders.input_only}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SubSection>

            <SubSection
              id="console-support"
              title={dict.information.capabilities.console_support.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.capabilities.console_support.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          {dict.information.capabilities.console_support.direct_support.title}
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                          {dict.information.capabilities.console_support.direct_support.description}
                        </p>
                        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                          {dict.information.capabilities.console_support.direct_support.examples.map((example: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-emerald-500">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          {dict.information.capabilities.console_support.xim_required.title}
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                          {dict.information.capabilities.console_support.xim_required.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {dict.information.capabilities.console_support.xim_required.note}{" "}
                          <Link
                            href={`/${lang}/xim`}
                            className="underline hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            {dict.information.capabilities.console_support.xim_required.link_text}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>

          {/* Pre-flashed vs Unflashed */}
          <Section
            id="preflashed-vs-unflashed"
            badge={t("Setup", "设置")}
            title={dict.information.preflashed_vs_unflashed.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.information.preflashed_vs_unflashed.description}
              </p>
            }
          >
            <SubSection
              id="preflashed"
              title={dict.information.preflashed_vs_unflashed.preflashed.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.preflashed_vs_unflashed.preflashed.description}
                    </p>
                    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {dict.information.preflashed_vs_unflashed.preflashed.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-emerald-500">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        <strong>{t("Note", "注意")}:</strong> {dict.information.preflashed_vs_unflashed.preflashed.indicator}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection
              id="unflashed"
              title={dict.information.preflashed_vs_unflashed.unflashed.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.preflashed_vs_unflashed.unflashed.description}
                    </p>
                    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {dict.information.preflashed_vs_unflashed.unflashed.characteristics.map((characteristic: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-yellow-500">•</span>
                          <span>{characteristic}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <strong>{t("What to Do", "解决方法")}:</strong> {dict.information.preflashed_vs_unflashed.unflashed.what_to_do}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>

          {/* USB Ports */}
          <Section
            id="usb-ports"
            badge={t("Hardware", "硬件")}
            title={dict.information.usb_ports.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.information.usb_ports.description}
              </p>
            }
          >
            <SubSection
              id="usb1"
              title={dict.information.usb_ports.usb1.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.usb_ports.usb1.description}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Purpose", "用途")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb1.purpose}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Usage", "用法")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb1.usage}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Power", "电源")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb1.power}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Device Communication", "设备通信")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb1.device_communication}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection
              id="usb2"
              title={dict.information.usb_ports.usb2.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.usb_ports.usb2.description}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Purpose", "用途")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb2.purpose}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Usage", "用法")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb2.usage}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Power", "电源")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb2.power}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                          <strong>{t("Important", "重要")}:</strong> {dict.information.usb_ports.usb2.important}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {dict.information.usb_ports.usb2.software_requirement}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection
              id="usb3"
              title={dict.information.usb_ports.usb3.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.information.usb_ports.usb3.description}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Purpose", "用途")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb3.purpose}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Usage", "用法")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb3.usage}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {t("Power", "电源")}:
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.information.usb_ports.usb3.power}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <strong>{t("Required", "必需")}:</strong> {dict.information.usb_ports.usb3.required}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            <SubSection
              id="usb-summary"
              title={dict.information.usb_ports.summary.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Connections", "连接")}:
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">{t("Normal Mode", "正常模式")}:</strong> {dict.information.usb_ports.summary.connections.normal_mode}
                        </p>
                        <p>
                          <strong className="text-foreground">{t("Flash Mode", "刷写模式")}:</strong> {dict.information.usb_ports.summary.connections.flash_mode}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        <strong>{t("Power Requirement", "电源要求")}:</strong> {dict.information.usb_ports.summary.power_requirement}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>{t("Operation Requirement", "运行要求")}:</strong> {dict.information.usb_ports.summary.operation_requirement}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
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
                      <div className="ml-5 mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {dict.troubleshooting.connection_status.statuses.normal_mode.com_port_warning}
                        </p>
                      </div>
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

                  <div>
                    <h4 className="font-semibold mb-2">{t("Baud Rate Information", "波特率信息")}</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                          {isCn ? "MAKCU 支持两种波特率：" : "MAKCU supports two baud rates:"}
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          <li><strong>115k</strong> ({isCn ? "115200 bps" : "115200 bps"})</li>
                          <li><strong>{isCn ? "400 万" : "4 million"}</strong> ({isCn ? "4,000,000 bps" : "4,000,000 bps"})</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-sm mb-2">{t("Command Timing", "命令时序")}:</p>
                        <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                          {isCn ? (
                            <>
                              命令 <span className="font-mono">km.move(100,100)\r</span> 总共 17 字节。
                            </>
                          ) : (
                            <>
                              The command <span className="font-mono">km.move(100,100)\r</span> is 17 bytes total.
                            </>
                          )}
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                          <li>
                            {isCn ? (
                              <>在 115k 下，传输约需 <strong>1.48ms</strong></>
                            ) : (
                              <>At 115k, this takes approx <strong>1.48ms</strong> to transmit.</>
                            )}
                          </li>
                          <li>
                            {isCn ? (
                              <>在 400 万下，传输约需 <strong>42.5µs</strong></>
                            ) : (
                              <>At 4m, this takes approx <strong>42.5µs</strong> to transmit.</>
                            )}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-sm mb-2">{t("Important Notes", "重要说明")}:</p>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                          <li>
                            {isCn ? (
                              <>MAKCU 使用 <strong>1ms USB 轮询间隔</strong>（1kHz）。</>
                            ) : (
                              <>MAKCU uses a <strong>1ms USB polling interval</strong> (1kHz).</>
                            )}
                          </li>
                          <li>
                            {isCn ? (
                              <>在 115k 下，仅传输就超过 1ms — 因此每个命令至少需要一个完整的轮询周期才能完成，可能跨越多个轮询。</>
                            ) : (
                              <>At 115k, transmission alone exceeds 1ms — so each command takes at least one full poll cycle to complete and may span multiple polls.</>
                            )}
                          </li>
                          <li>
                            {isCn ? (
                              <>在 400 万下，整个命令可以在单个轮询窗口内传输，如果您的时序准确，允许 move + click + lock 一起处理。</>
                            ) : (
                              <>At 4m, the entire command can be transmitted within a single poll window, allowing move + click + lock to be processed together, if your timing is accurate.</>
                            )}
                          </li>
                          <li>
                            {isCn ? (
                              <>这使得 400 万波特率非常适合精确、高速的输入组合和更流畅的控制。</>
                            ) : (
                              <>This makes 4m ideal for precise, high-speed input combos and smoother control.</>
                            )}
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2">
                          {t("Ignore Windows Baud Rate Settings", "忽略 Windows 波特率设置")}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {isCn ? (
                            <>
                              请不要在 Windows 设备管理器中更改波特率 — 这对 MAKCU 的实际速度<strong>完全没有影响</strong>。设备自行设置速度，MAKCU 在内部管理实际波特率。Windows 设置会被完全忽略，所以不用担心它们。
                            </>
                          ) : (
                            <>
                              Please do not change the baud rate in Windows Device Manager — it has <strong>zero effect</strong> on MAKCU's actual speed. The chair sets its own speed, and MAKCU manages the real baud rate internally. Windows settings are completely ignored, so don't worry about them.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
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

