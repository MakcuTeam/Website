"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { DeviceTestDisplay } from "./device-test-display";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/dictionaries";

type DeviceTestSectionProps = {
  lang: Locale;
  dict: Dictionary;
};

export function DeviceTestSection({ lang, dict }: DeviceTestSectionProps) {
  const { status, mode } = useMakcuConnection();

  // Only show in normal mode
  if (status !== "connected" || mode !== "normal") {
    return null;
  }

  return (
    <Section id="device-test" title={dict.device_control.sections.device_test}>
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-6">
          <DeviceTestDisplay lang={lang} />
        </CardContent>
      </Card>
    </Section>
  );
}

