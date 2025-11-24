import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import PageSidebar from "@/components/page-sidebar";
import { getSectionsForPage } from "@/lib/sections-config";
import { Section, SubSection } from "@/components/section";

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "XIM Setup Guide — MAKCU Controller Support",
    description: "Learn how to set up XIM with MAKCU for controller support.",
  },
  cn: {
    title: "XIM 设置指南 — MAKCU 控制器支持",
    description: "了解如何为控制器支持设置 XIM 与 MAKCU。",
  },
};

export async function generateMetadata({ params }: LangProps): Promise<Metadata> {
  const { lang } = await params;
  const meta = metadataCopy[lang];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}/xim`,
    },
  };
}

export default async function XimPage({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isCn = lang === "cn";
  const sections = getSectionsForPage("xim");

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
            {dict.xim.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            {dict.xim.description}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <PageSidebar
          sections={sections}
          currentPage="/xim"
          lang={lang}
          dict={dict}
        />

        <div className="space-y-20">
          {/* Main Setup Section */}
          <Section
            id="xim-setup"
            badge={t("Controller", "控制器")}
            title={dict.xim.sections.setup.title}
            lead={
              <div className="space-y-2">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {dict.xim.sections.setup.xim_configuration.important_note}
                </p>
              </div>
            }
          >
            {/* Prerequisites SubSection */}
            <SubSection
              id="prerequisites"
              title={dict.xim.sections.setup.prerequisites.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <ul className="space-y-6">
                    <li>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">
                          {dict.xim.sections.setup.prerequisites.mouse_requirement}
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.xim.sections.setup.prerequisites.mouse_requirement_desc}
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">
                          {dict.xim.sections.setup.prerequisites.makcu_functional}
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.xim.sections.setup.prerequisites.makcu_functional_desc}
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">
                          {dict.xim.sections.setup.prerequisites.baud_rate_warning}
                        </h4>
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            {dict.xim.sections.setup.prerequisites.baud_rate_warning_desc}
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">
                          {dict.xim.sections.setup.prerequisites.xim_guide_note}
                        </h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dict.xim.sections.setup.prerequisites.xim_guide_note_desc}
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </SubSection>

            {/* XIM Configuration SubSection */}
            <SubSection
              id="xim-configuration"
              title={dict.xim.sections.setup.xim_configuration.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {dict.xim.sections.setup.xim_configuration.xim_must_work}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.xim_configuration.xim_must_work_desc}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {dict.xim.sections.setup.xim_configuration.xim_testing}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.xim_configuration.xim_testing_desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* MAKCU Setup SubSection */}
            <SubSection
              id="makcu-setup"
              title={dict.xim.sections.setup.makcu_setup.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {dict.xim.sections.setup.makcu_setup.mouse_connection}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.makcu_setup.mouse_connection_desc}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        {dict.xim.sections.setup.makcu_setup.mouse_conversion_warning}
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {dict.xim.sections.setup.makcu_setup.mouse_conversion_warning_desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Connection SubSection with Video */}
            <SubSection
              id="connection"
              title={dict.xim.sections.setup.connection.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {dict.xim.sections.setup.connection.final_steps}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.connection.final_steps_desc}
                      </p>
                    </div>
                    
                    {/* YouTube Video Embed */}
                    <div className="mt-8">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src="https://www.youtube.com/embed/O3uK77Lhr74"
                          title="XIM and MAKCU Connection Guide"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>
        </div>
      </div>
    </div>
  );
}

