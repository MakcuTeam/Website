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
    title: "MAKCU Troubleshooting — LED Status Guide",
    description: "LED status guide and troubleshooting steps for MAKCU device issues.",
  },
  cn: {
    title: "MAKCU 故障排除 — LED 状态指南",
    description: "LED 状态指南和 MAKCU 设备问题的故障排除步骤。",
  },
};


function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export async function generateMetadata({ params }: LangProps): Promise<Metadata> {
  const { lang } = await params;
  const meta = metadataCopy[lang];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}/troubleshooting`,
    },
  };
}

export default async function TroubleshootingPage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const sections = getSectionsForPage("troubleshooting");
  const isCn = lang === "cn";
  const t = <T,>(en: T, cn: T): T => (isCn ? cn : en);

  return (
    <div className="flex flex-col pb-20">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_60%)]" />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            {isCn ? "指南" : "Guide"}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {dict.troubleshooting.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            {dict.troubleshooting.description}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <PageSidebar
          sections={sections}
          currentPage="/troubleshooting"
          lang={lang}
          dict={dict}
        />

        <div className="space-y-20">
          {/* LED Status Guide */}
          <Section
            id="led-guide"
            badge={t("LED", "LED")}
            title={dict.troubleshooting.led_guide.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.troubleshooting.led_guide.description}
              </p>
            }
          >
            {/* Left Side */}
            <SubSection
              id="left-side"
              title={dict.troubleshooting.led_guide.left_side.title}
              description={dict.troubleshooting.led_guide.left_side.description}
            >
              <div className="space-y-6">
                {/* Solid ON */}
                <Card className="border-border/60 bg-card/90 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {dict.troubleshooting.led_guide.left_side.solid_on.title}
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">
                            {t("Meaning", "含义")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.solid_on.meaning}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("Action", "操作")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.solid_on.action}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Solid OFF */}
                <Card className="border-border/60 bg-card/90 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {dict.troubleshooting.led_guide.left_side.solid_off.title}
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">
                            {t("Meaning", "含义")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.solid_off.meaning}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("Action", "操作")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.solid_off.action}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Slow Blink */}
                <Card className="border-border/60 bg-card/90 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {dict.troubleshooting.led_guide.left_side.slow_blink.title}
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">
                            {t("Meaning", "含义")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.slow_blink.meaning}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("When it occurs", "发生时间")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.slow_blink.when}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("Action", "操作")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.left_side.slow_blink.action}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SubSection>

            {/* Right Side */}
            <SubSection
              id="right-side"
              title={dict.troubleshooting.led_guide.right_side.title}
              description={dict.troubleshooting.led_guide.right_side.description}
            >
              <div className="space-y-6">
                {/* Solid ON */}
                <Card className="border-border/60 bg-card/90 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {dict.troubleshooting.led_guide.right_side.solid_on.title}
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">
                            {t("Meaning", "含义")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.solid_on.meaning}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("Action", "操作")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.solid_on.action}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Solid OFF */}
                <Card className="border-border/60 bg-card/90 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {dict.troubleshooting.led_guide.right_side.solid_off.title}
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">
                            {t("Meaning", "含义")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.solid_off.meaning}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("Action", "操作")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.solid_off.action}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Slow Blink */}
                <Card className="border-border/60 bg-card/90 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {dict.troubleshooting.led_guide.right_side.slow_blink.title}
                      </h4>
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <strong className="text-foreground">
                            {t("Meaning", "含义")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.slow_blink.meaning}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("When it occurs", "发生时间")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.slow_blink.when}
                        </p>
                        <p>
                          <strong className="text-foreground">
                            {t("Action", "操作")}:{" "}
                          </strong>
                          {dict.troubleshooting.led_guide.right_side.slow_blink.action}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SubSection>
          </Section>

          {/* Troubleshooting Steps */}
          <Section
            id="troubleshooting-steps"
            badge={t("Steps", "步骤")}
            title={dict.troubleshooting.troubleshooting_steps.title}
          >
            {/* Slow Persists */}
            <SubSection
              id="slow-persists"
              title={dict.troubleshooting.troubleshooting_steps.slow_persists.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Problem", "问题")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.slow_persists.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Possible Causes", "可能原因")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.slow_persists.causes}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("What to Do", "解决方法")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.slow_persists.steps}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* LED Not Responding */}
            <SubSection
              id="led-not-responding"
              title={dict.troubleshooting.troubleshooting_steps.led_not_responding.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Problem", "问题")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.led_not_responding.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Possible Causes", "可能原因")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.led_not_responding.causes}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("What to Do", "解决方法")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.led_not_responding.steps}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Device Not Working */}
            <SubSection
              id="device-not-working"
              title={dict.troubleshooting.troubleshooting_steps.device_not_working.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Problem", "问题")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.device_not_working.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Possible Causes", "可能原因")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.device_not_working.causes}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("What to Do", "解决方法")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.device_not_working.steps}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Baud Rate Mismatch */}
            <SubSection
              id="baud-rate-mismatch"
              title={dict.troubleshooting.troubleshooting_steps.baud_rate_mismatch.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Problem", "问题")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.baud_rate_mismatch.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Symptoms", "症状")}:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.baud_rate_mismatch.symptoms.map((symptom: string, index: number) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Solution", "解决方案")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                        {dict.troubleshooting.troubleshooting_steps.baud_rate_mismatch.solution}
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.baud_rate_mismatch.steps.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>{t("Important", "重要")}:</strong> {dict.troubleshooting.troubleshooting_steps.baud_rate_mismatch.important}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Cannot Flash from Website */}
            <SubSection
              id="cannot-flash-website"
              title={dict.troubleshooting.troubleshooting_steps.cannot_flash_website.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Problem", "问题")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.cannot_flash_website.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Possible Causes", "可能原因")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.cannot_flash_website.causes}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("What to Do", "解决方法")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.cannot_flash_website.steps}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Button Held But Still Looping */}
            <SubSection
              id="button-held-still-looping"
              title={dict.troubleshooting.troubleshooting_steps.button_held_still_looping.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Problem", "问题")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.button_held_still_looping.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("Possible Causes", "可能原因")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.button_held_still_looping.causes}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {t("What to Do", "解决方法")}:
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.troubleshooting_steps.button_held_still_looping.steps}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>


          {/* Quick Reference */}
          <Section id="quick-reference" badge={t("Reference", "参考")} title={dict.troubleshooting.quick_reference.title}>
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">
                          {dict.troubleshooting.quick_reference.led_state}
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">
                          {dict.troubleshooting.quick_reference.left_meaning}
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">
                          {dict.troubleshooting.quick_reference.right_meaning}
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">
                          {dict.troubleshooting.quick_reference.action}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-muted-foreground">
                      <tr className="border-b border-border/60">
                        <td className="py-3 px-4 font-medium text-foreground">
                          {dict.troubleshooting.quick_reference.solid_on}
                        </td>
                        <td className="py-3 px-4">{t("Device connected", "设备已连接")}</td>
                        <td className="py-3 px-4">{t("Host connected", "主机已连接")}</td>
                        <td className="py-3 px-4">{dict.troubleshooting.quick_reference.working}</td>
                      </tr>
                      <tr className="border-b border-border/60">
                        <td className="py-3 px-4 font-medium text-foreground">
                          {dict.troubleshooting.quick_reference.solid_off}
                        </td>
                        <td className="py-3 px-4">{t("No device", "无设备")}</td>
                        <td className="py-3 px-4">{t("No device", "无设备")}</td>
                        <td className="py-3 px-4">{dict.troubleshooting.quick_reference.connect_device}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {dict.troubleshooting.quick_reference.slow_blink}
                        </td>
                        <td className="py-3 px-4">{t("Warning/Adjusting", "警告/调整中")}</td>
                        <td className="py-3 px-4">{t("Warning/Temporary", "警告/临时")}</td>
                        <td className="py-3 px-4">{dict.troubleshooting.quick_reference.wait_resolves}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Still Having Issues */}
          <Section
            id="still-issues"
            badge={t("Help", "帮助")}
            title={dict.troubleshooting.still_issues.title}
            lead={
              <p className="text-base leading-relaxed text-muted-foreground">
                {dict.troubleshooting.still_issues.description}
              </p>
            }
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="space-y-6">
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.troubleshooting.still_issues.verify_setup}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.still_issues.verify_setup_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.troubleshooting.still_issues.check_connections}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.still_issues.check_connections_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.troubleshooting.still_issues.driver_check}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.still_issues.driver_check_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.troubleshooting.still_issues.supported_device}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.still_issues.supported_device_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.troubleshooting.still_issues.reflash}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.still_issues.reflash_desc}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {dict.troubleshooting.still_issues.hardware_check}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.troubleshooting.still_issues.hardware_check_desc}
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Tip>
                    {dict.troubleshooting.still_issues.remember}
                  </Tip>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

