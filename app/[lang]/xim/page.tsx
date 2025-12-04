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
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-black dark:text-white">
          {dict.xim.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {dict.xim.description}
        </p>
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
            title={dict.xim.sections.setup.title}
            lead={
              <div className="space-y-2">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {dict.xim.sections.setup.prerequisites.important_note}
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
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.prerequisites.baud_rate_warning}
                      </h4>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {dict.xim.sections.setup.prerequisites.baud_rate_warning_desc}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.prerequisites.mouse_conversion_important}
                      </h4>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {dict.xim.sections.setup.prerequisites.mouse_conversion_important_desc}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.prerequisites.mouse_removal_warning}
                      </h4>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {dict.xim.sections.setup.prerequisites.mouse_removal_warning_desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Step 1: Prepare XIM */}
            <SubSection
              id="step1-prepare-xim"
              title={dict.xim.sections.setup.step1_prepare_xim.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.xim.sections.setup.step1_prepare_xim.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.step1_prepare_xim.xim_must_work}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.step1_prepare_xim.xim_must_work_desc}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.step1_prepare_xim.xim_testing}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.step1_prepare_xim.xim_testing_desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Step 2: Prepare MAKCU */}
            <SubSection
              id="step2-prepare-makcu"
              title={dict.xim.sections.setup.step2_prepare_makcu.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.xim.sections.setup.step2_prepare_makcu.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.step2_prepare_makcu.makcu_functional}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.step2_prepare_makcu.makcu_functional_desc}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.step2_prepare_makcu.mouse_requirement}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.step2_prepare_makcu.mouse_requirement_desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubSection>

            {/* Step 3: Connect */}
            <SubSection
              id="step3-connect"
              title={dict.xim.sections.setup.step3_connect.title}
            >
              <Card className="border-border/60 bg-card/90 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {dict.xim.sections.setup.step3_connect.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white mb-2">
                        {dict.xim.sections.setup.step3_connect.final_steps}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {dict.xim.sections.setup.step3_connect.final_steps_desc}
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

