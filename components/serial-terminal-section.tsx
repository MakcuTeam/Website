"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { SerialTerminal } from "@/components/serial-terminal";
import { FlashControls } from "@/components/flash-controls";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/dictionaries";

type SerialTerminalSectionProps = {
  lang: Locale;
  dict: Dictionary;
};

export function SerialTerminalSection({ lang, dict }: SerialTerminalSectionProps) {
  const { status, mode } = useMakcuConnection();
  
  // Only show Serial Terminal section when connected in normal or flash mode
  const shouldShow = status === "connected" && (mode === "normal" || mode === "flash");
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Section id="serial-terminal" title={dict.device_control.sections.serial_terminal}>
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Flash Controls - Above Serial Terminal */}
            <FlashControls lang={lang} dict={dict} />
            
            {/* Serial Terminal */}
            <SerialTerminal lang={lang} />
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

