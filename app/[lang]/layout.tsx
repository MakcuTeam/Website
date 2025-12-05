import type { Metadata } from "next";
import { Space_Mono, Space_Grotesk, Noto_Serif_SC } from "next/font/google";
import { getDictionary, LangProps } from "@/lib/dictionaries";
import { getLocales } from "@/lib/locale-server";
import "@/styles/globals.css";
import localFont from "next/font/local";

import RootLayoutProvider from "./provider";
import { BackgroundVideo } from "@/components/background-video";
const roadRage = localFont({
  src: "../../fonts/Road-Rage.otf",
  display: "swap",
  variable: "--font-logo",
  weight: "400",
});
const sansFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  weight: "400",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: "400",
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
  display: "swap",
  weight: "400",
});

export async function generateMetadata(params: LangProps): Promise<Metadata> {
  const { lang } = await params.params;
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    metadataBase: new URL("https://www.makcu.com"),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
} & LangProps>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <html lang={lang} suppressHydrationWarning style={{ overflowX: "hidden" }}>
      <body
        className={`${sansFont.variable} ${notoSerif.variable} ${monoFont.variable} ${roadRage.variable} font-basic antialiased tracking-wide relative`}
        suppressHydrationWarning
        style={{ position: "relative", overflowX: "hidden" }}
      >
        {/* Background video - fixed to viewport, does NOT scroll, behind all content (z-index: -1) */}
        <BackgroundVideo />
        {/* All scrollable content - scrolls normally while video stays fixed */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <RootLayoutProvider dict={dict}>{children}</RootLayoutProvider>
        </div>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  const locales = getLocales();
  return locales.map((locale) => ({ lang: locale }));
}
