import { Card, CardContent } from "@/components/ui/card";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { MakcuSettings } from "@/components/makcu-settings";

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

  return (
    <div className="flex flex-col pb-20">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_60%)]" />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            {isCn ? "设置" : "Settings"}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {dict.settings.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            {dict.settings.description}
          </p>
        </div>
      </header>

      <div className="mt-10">
        <MakcuSettings lang={lang} dict={dict} />
      </div>
    </div>
  );
}

