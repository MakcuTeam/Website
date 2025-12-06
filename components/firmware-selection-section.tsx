"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useMakcuConnection } from "./contexts/makcu-connection-provider";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/dictionaries";

type FirmwareSelectionSectionProps = {
  lang: Locale;
  dict: Dictionary;
};

export function FirmwareSelectionSection({ lang, dict }: FirmwareSelectionSectionProps) {
  const { status, mode } = useMakcuConnection();
  const isCn = lang === "cn";

  // Only show in flash mode
  if (status !== "connected" || mode !== "flash") {
    return null;
  }

  const t = (en: string, cn: string) => (isCn ? cn : en);

  return (
    <Section
      id="firmware-selection"
      title={dict.tools.sections.firmware_selection.title}
      lead={<p className="text-base leading-relaxed text-muted-foreground">{dict.tools.sections.firmware_selection.description}</p>}
    >
      <Card className="border-border/60 bg-card/90 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("USB 1 - Left Side", "USB 1 - 左侧")}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {dict.tools.sections.firmware_selection.left_note}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("USB 3 - Right Side", "USB 3 - 右侧")}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {dict.tools.sections.firmware_selection.right_note}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>{t("Note", "注意")}:</strong> {dict.tools.sections.firmware_selection.matching_note}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

