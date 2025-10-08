import { Card, CardContent } from "@/components/ui/card";
import Copy from "@/components/markdown/copy";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

type TocItem = {
  id: string;
  label: string;
  children?: TocItem[];
};

type SpecEntry = {
  label: string;
  content: React.ReactNode;
};

type SectionProps = {
  id: string;
  badge?: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
};

type SubSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

const tocByLang: Record<Locale, TocItem[]> = {
  en: [
    { id: "transport", label: "Transport & Framing" },
    {
      id: "buttons",
      label: "Buttons",
      children: [
        { id: "buttons-status", label: "Button status (GET)" },
        { id: "buttons-actuation", label: "Button actuation (SET)" },
        { id: "buttons-lock", label: "Button lock (GET/SET)" },
        { id: "buttons-catch", label: "Button catch (GET/SET)" },
        { id: "buttons-global", label: "Global enable (GET/SET)" },
      ],
    },
    {
      id: "locks",
      label: "Locks",
      children: [
        { id: "locks-whole", label: "Whole-axis (GET/SET)" },
        { id: "locks-directional", label: "Directional (GET/SET)" },
      ],
    },
    {
      id: "motion",
      label: "Motion",
      children: [
        { id: "move", label: "move() (SET)" },
        { id: "moveto", label: "moveto() (SET)" },
        { id: "wheel", label: "wheel() (SET)" },
        { id: "silent", label: "silent() (SET)" },
      ],
    },
    {
      id: "posscreen",
      label: "Position & Screen",
      children: [
        { id: "getpos", label: "getpos() (GET)" },
        { id: "screen", label: "screen() / screen(W,H)" },
      ],
    },
    { id: "axisstream", label: "Axis streaming (GET/SET)" },
    { id: "click-helper", label: "Click helper (SET)" },
    {
      id: "version-serial",
      label: "Version & Serial",
      children: [
        { id: "version", label: "version() (GET)" },
        { id: "serial", label: "serial() / serial(0) / serial(<str>)" },
      ],
    },
    { id: "echo", label: "Echo control (GET/SET)" },
    { id: "keyboard", label: "Keyboard" },
    { id: "limits", label: "Limits & Parsing" },
    { id: "baud-binary", label: "Baud Rate (Binary RX)" },
    { id: "tips", label: "Tips" },
  ],
  cn: [
    { id: "transport", label: "传输与封装" },
    {
      id: "buttons",
      label: "按键",
      children: [
        { id: "buttons-status", label: "按键状态 (GET)" },
        { id: "buttons-actuation", label: "按键触发 (SET)" },
        { id: "buttons-lock", label: "按键锁定 (GET/SET)" },
        { id: "buttons-catch", label: "按键捕获 (GET/SET)" },
        { id: "buttons-global", label: "全局启用 (GET/SET)" },
      ],
    },
    {
      id: "locks",
      label: "锁定",
      children: [
        { id: "locks-whole", label: "全轴锁定 (GET/SET)" },
        { id: "locks-directional", label: "方向锁定 (GET/SET)" },
      ],
    },
    {
      id: "motion",
      label: "移动",
      children: [
        { id: "move", label: "move() (SET)" },
        { id: "moveto", label: "moveto() (SET)" },
        { id: "wheel", label: "wheel() (SET)" },
        { id: "silent", label: "silent() (SET)" },
      ],
    },
    {
      id: "posscreen",
      label: "位置与屏幕",
      children: [
        { id: "getpos", label: "getpos() (GET)" },
        { id: "screen", label: "screen() / screen(W,H)" },
      ],
    },
    { id: "axisstream", label: "轴数据流 (GET/SET)" },
    { id: "click-helper", label: "点击辅助 (SET)" },
    {
      id: "version-serial",
      label: "版本与序列号",
      children: [
        { id: "version", label: "version() (GET)" },
        { id: "serial", label: "serial() / serial(0) / serial(<str>)" },
      ],
    },
    { id: "echo", label: "回显控制 (GET/SET)" },
    { id: "keyboard", label: "键盘" },
    { id: "limits", label: "限制与解析" },
    { id: "baud-binary", label: "波特率（Binary RX）" },
    { id: "tips", label: "提示" },
  ],
};

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MAKCU API — KM Host Protocol",
    description:
      "Protocol reference for MAKCU KM Host API, covering transport details, button controls, motion, streaming, and maintenance commands.",
  },
  cn: {
    title: "MAKCU API — KM 主机协议",
    description:
      "MAKCU KM 主机 API 协议参考，涵盖传输细节、按键控制、移动、数据流以及维护指令。",
  },
};

function Section({ id, badge, title, lead, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="sticky top-24 z-10 mb-6">
        {badge ? (
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h2>
        {lead ? <div className="text-base leading-relaxed text-muted-foreground">{lead}</div> : null}
        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
}

function SubSection({ id, title, description, children }: SubSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <h3 className="text-xl font-semibold tracking-tight lg:text-2xl">{title}</h3>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </section>
  );
}

function SpecCard({
  entries,
  footer,
}: {
  entries: SpecEntry[];
  footer?: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-card/90 shadow-lg">
      <CardContent className="p-6">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(180px,220px)_1fr]">
          {entries.map((entry, index) => (
            <Fragment key={`${entry.label}-${index}`}>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">
                {entry.label}
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                {entry.content}
              </div>
            </Fragment>
          ))}
        </div>
        {footer ? (
          <div className="mt-6 border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <div className="absolute right-3 top-3 hidden sm:block">
        <Copy content={code} />
      </div>
      <pre className="whitespace-pre-wrap rounded-xl border border-border/60 bg-stone-950 px-4 py-3 font-mono text-xs text-stone-100 shadow-inner">
        {code}
      </pre>
    </div>
  );
}

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
      canonical: `/${lang}/api`,
    },
  };
}

export default async function ApiPage({ params }: LangProps) {
  const { lang } = await params;
  const toc = tocByLang[lang];
  const isCn = lang === "cn";
  const t = <T,>(en: T, cn: T): T => (isCn ? cn : en);

  return (
    <div className="flex flex-col pb-20">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_60%)]" />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            {isCn ? "参考" : "Reference"}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">MAKCU API</h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            {isCn
              ? "KM 主机协议 — v3.8 · MAKCU 生态的完整指令参考。"
              : "KM Host Protocol — v3.8 · Comprehensive command reference for the MAKCU ecosystem."}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24">
          <Card className="border-border/60 bg-card/90 shadow-lg">
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {isCn ? "目录" : "Contents"}
              </div>
              <nav className="mt-4 space-y-3 text-sm">
                {toc.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <Link
                      href={`/${lang}/api#${item.id}`}
                      className="font-medium text-foreground/80 transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="space-y-1 border-l border-border/60 pl-3 text-xs text-muted-foreground">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/${lang}/api#${child.id}`}
                              className="transition hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-20">
          <Section
            id="transport"
            badge={t("Protocol", "协议")}
            title={t("Transport & Framing", "传输与封装")}
            lead={
              isCn ? (
                <span>
                  所有响应都会以
                  <code className="rounded-md bg-muted px-1 py-0.5 text-xs">km.</code>
                  开头，并以<strong className="px-1">CRLF</strong> 结尾，随后是提示符
                  <code className="rounded-md bg-muted px-1 py-0.5 text-xs">&gt;&gt;&gt; </code>。
                </span>
              ) : (
                <span>
                  All replies start with <code className="rounded-md bg-muted px-1 py-0.5 text-xs">km.</code> and end with
                  <strong className="px-1">CRLF</strong> followed by the prompt
                  <code className="rounded-md bg-muted px-1 py-0.5 text-xs">&gt;&gt;&gt; </code>.
                </span>
              )
            }
          >
            <Tip>
              {isCn ? (
                <span>
                  下方 TX 示例中的最后提示符均表示为
                  <code className="font-mono">\r\n&gt;&gt;&gt; </code>。
                </span>
              ) : (
                <span>
                  TX samples below show the final prompt as
                  <code className="font-mono">\r\n&gt;&gt;&gt; </code>.
                </span>
              )}
            </Tip>
            <SpecCard
              entries={[
                {
                  label: t("RX (Host → Device)", "RX（主机 → 设备）"),
                  content: (
                    <ul className="list-disc space-y-2 pl-5">
                      <li>
                        {isCn ? (
                          <span>
                            ASCII 指令，例如 <span className="font-mono">move(10,-3)</span>，以
                            <span className="font-mono"> \r</span>/<span className="font-mono">\n</span>/
                            <span className="font-mono">;</span> 结尾。
                          </span>
                        ) : (
                          <span>
                            ASCII commands, e.g. <span className="font-mono">move(10,-3)</span>, terminated by
                            <span className="font-mono"> \r</span>/<span className="font-mono">\n</span>/
                            <span className="font-mono">;</span>
                          </span>
                        )}
                      </li>
                      <li>
                        {isCn ? (
                          <span>
                            可选二进制帧：<span className="font-mono">DE AD &lt;lenLE:2&gt; &lt;ASCII 或二进制负载&gt;</span>
                          </span>
                        ) : (
                          <span>
                            Optional binary frame: <span className="font-mono">DE AD &lt;lenLE:2&gt; &lt;ASCII or binary payload&gt;</span>
                          </span>
                        )}
                      </li>
                    </ul>
                  ),
                },
                {
                  label: t("TX (Device → Host)", "TX（设备 → 主机）"),
                  content: (
                    <ul className="list-disc space-y-2 pl-5">
                      <li>
                        {isCn ? (
                          <span>
                            格式：<span className="font-mono">km.</span>
                            <em>payload</em>
                            <span className="font-mono">\r\n&gt;&gt;&gt; </span>
                          </span>
                        ) : (
                          <span>
                            Format: <span className="font-mono">km.</span>
                            <em>payload</em>
                            <span className="font-mono">\r\n&gt;&gt;&gt; </span>
                          </span>
                        )}
                      </li>
                      <li>
                        {isCn ? (
                          <span>
                            Setter 指令会回显输入作为 ACK，除非通过
                            <span className="font-mono">echo(0)</span> 关闭。
                          </span>
                        ) : (
                          <span>
                            Setters echo the input as ACK unless suppressed by
                            <span className="font-mono">echo(0)</span>.
                          </span>
                        )}
                      </li>
                    </ul>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="buttons" badge={t("Mouse", "鼠标")} title={t("Buttons", "按键")}>
            <SubSection
              id="buttons-status"
              title={t("Button status (GET)", "按键状态 (GET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">left() | right() | middle() | side1() | side2()</span>,
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.left(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "State bit view: 0=none, 1=physical, 2=software, 3=both.",
                            "状态位含义：0=无，1=物理，2=软件，3=两者。",
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="buttons-actuation"
              title={t("Button actuation (SET)", "按键触发 (SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">left(n) / right(n) / middle(n) / side1(n) / side2(n)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span className="font-mono">
                        首位数字字符会被解析为整数（数字字符映射为对应数值，例如 0→0，1→1）。
                      </span>
                    ) : (
                      <span className="font-mono">
                        First digit char parsed as int (digits map to their numeric value, e.g. 0→0, 1→1).
                      </span>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.left(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? (
                            <span>
                              回显 ACK（受 <span className="font-mono">echo(0|1)</span> 控制）。
                            </span>
                          ) : (
                            <span>
                              Echo ACK (subject to <span className="font-mono">echo(0|1)</span>).
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="buttons-lock"
              title={t("Button lock (GET/SET)", "按键锁定 (GET/SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">lock_ml(), lock_mr(), lock_mm(), lock_ms1(), lock_ms2()</span>,
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.lock_ml()\n0\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.lock_ml(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="buttons-catch"
              title={t("Button catch (GET/SET)", "按键捕获 (GET/SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">catch_ml(), catch_mr(), catch_mm(), catch_ms1(), catch_ms2()</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span className="font-mono">SET：0=自动，1=手动（需先锁定按键）</span>
                    ) : (
                      <span className="font-mono">SET: 0=auto, 1=manual (button must be locked)</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.catch_ml()\n0\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <p className="text-sm">
                        {t(
                          "No immediate ACK (async). Poll with GET to confirm state.",
                          "无即时 ACK（异步）。请通过 GET 轮询确认状态。",
                        )}
                      </p>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="buttons-global"
              title={t("Buttons — global enable (GET/SET)", "按键 — 全局启用 (GET/SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">buttons() / buttons(0|1)</span>,
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.buttons()\n1\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.buttons(0)\r\n>>> `} />,
                  },
                ]}
                footer={
                  <div className="space-y-2">
                    <p>
                      {isCn
                        ? "启用后，用户按键会提交按钮掩码的变化，该流程与主指令解耦（类似 km.catch）："
                        : "when enabled, users mouse buttons will submit a button mask change of buttons, this will run decoupled from the main command (like km.catch):"}
                    </p>
                    <CodeBlock code={`km.<mask>\r\n>>> `} />
                  </div>
                }
              />
            </SubSection>
          </Section>

          <Section id="locks" badge={t("Mouse", "鼠标")} title={t("Locks", "锁定")}>
            <SubSection
              id="locks-whole"
              title={t("Whole-axis locks (GET/SET)", "全轴锁定 (GET/SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: (
                      <span className="font-mono">
                        lock_mx(), lock_my() / lock_mx(0|1), lock_my(0|1)
                      </span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.lock_mx()\n0\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.lock_mx(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="locks-directional"
              title={t("Directional locks (GET/SET)", "方向锁定 (GET/SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: (
                      <span className="font-mono">lock_mx+(), lock_mx-(), lock_my+(), lock_my-()</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.lock_my+()\n1\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.lock_my-(0)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section id="motion" badge={t("Motion", "移动")} title={t("Motion", "移动")}>
            <SubSection id="move" title="move(x,y[,seg][,cx1,cy1[,cx2,cy2]]) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">move(x,y[,seg][,cx1,cy1[,cx2,cy2]])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <p>
                        x,y：int16；seg ≥ 1（默认 1，最大 512）；可选三次贝塞尔控制点。如果仅提供段数（无控制点），将随机生成 2 点控制曲线。若只提供 (cx1,cy1)，会自动复制作为第二控制点。
                      </p>
                    ) : (
                      <p>
                        x,y: int16; seg ≥ 1 (default 1, max 512); optional cubic Bézier controls. If only segments are
                        provided (no control points), a random 2-point control curve is generated. If only (cx1,cy1) is
                        provided it is duplicated.
                      </p>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.move(10,-3)\r\n>>> `} />
                        <CodeBlock code={`km.move(100,50,8,40,25,80,10)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">{t("Both return the input echo (ACK).", "均回显输入作为 ACK。")}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="moveto" title="moveto(X,Y[,seg][,cx1,cy1[,cx2,cy2]]) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">moveto(X,Y[,seg][,cx1,cy1[,cx2,cy2]])</span>,
                  },
                  {
                    label: t("Notes", "说明"),
                    content: isCn ? (
                      <p>
                        限制在屏幕范围内；以绝对值入队（内部转换为相对）。特殊情况：
                        <span className="font-mono"> moveto(0,0)</span> 且 seg=1 且无控制点时会触发校准。
                      </p>
                    ) : (
                      <p>
                        Clamped to screen; queued as absolute (internally relative). Special:
                        <span className="font-mono"> moveto(0,0)</span> with seg=1 and no controls triggers calibration.
                      </p>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.moveto(640,360)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="wheel" title="wheel(w) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">wheel(w)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: <span className="font-mono">w: int8</span>,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.wheel(-5)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">{t("Echo ACK.", "回显 ACK。")}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="silent" title="silent(x,y) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">silent(x,y)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: t(
                      "Two-frame silent click at (x,y)",
                      "在 (x,y) 处执行两帧静默点击",
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.silent(400,300)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">{t("Echo ACK.", "回显 ACK。")}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section id="posscreen" badge={t("Screen", "屏幕")} title={t("Position & Screen", "位置与屏幕")}>
            <SubSection id="getpos" title="getpos() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">getpos()</span>,
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.(123,456)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? (
                            <span>
                              绝对坐标（受 <span className="font-mono">screen(W,H)</span> 限制）。
                            </span>
                          ) : (
                            <span>
                              Absolute position (clamped to <span className="font-mono">screen(W,H)</span>).
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="screen" title="screen() / screen(W,H) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">screen() / screen(W,H)</span>,
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.screen(1920,1080)\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.screen(2560,1440)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section
            id="axisstream"
            badge={t("Streaming", "流式")}
            title={t("Axis streaming (GET/SET)", "轴数据流 (GET/SET)")}
          >
            <SpecCard
              entries={[
                {
                  label: t("Command", "命令"),
                  content: <span className="font-mono">axis() / axis(mode[,period_ms])</span>,
                },
                {
                  label: t("Params (SET)", "参数 (SET)"),
                  content: isCn ? (
                    <span className="font-mono">
                      mode：0=关闭，1=绝对，2=相对，3=活动；period：1..1000（省略则保持不变）
                    </span>
                  ) : (
                    <span className="font-mono">
                      mode: 0=off, 1=abs, 2=rel, 3=act; period: 1..1000 (kept if omitted)
                    </span>
                  ),
                },
                {
                  label: t("Response (GET)", "响应 (GET)"),
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.rel\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">
                        {isCn ? (
                          <span>
                            仅返回模式名称：<span className="font-mono">km.off</span> ｜
                            <span className="font-mono">km.abs</span> ｜ <span className="font-mono">km.rel</span> ｜
                            <span className="font-mono">km.act</span>。
                          </span>
                        ) : (
                          <span>
                            Mode name only: <span className="font-mono">km.off</span> |
                            <span className="font-mono">km.abs</span> | <span className="font-mono"> km.rel</span> |
                            <span className="font-mono">km.act</span>.
                          </span>
                        )}
                      </p>
                    </div>
                  ),
                },
                {
                  label: t("Response (SET)", "响应 (SET)"),
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.abs\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">
                        {t("Mode name only (not an echo).", "仅返回模式名称（非指令回显）。")}
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section
            id="click-helper"
            badge={t("Helpers", "辅助")}
            title={t("Click helper — SET", "点击辅助 — SET")}
          >
            <SpecCard
              entries={[
                {
                  label: t("Command", "命令"),
                  content: <span className="font-mono">click(button_index, count[, delay_ms])</span>,
                },
                {
                  label: t("Params", "参数"),
                  content: isCn ? (
                    <span className="font-mono">
                      button_index：1=左键，2=右键，3=中键，4=侧键1，5=侧键2；count ≥ 1；delay_ms ≥ 1（默认 1）
                    </span>
                  ) : (
                    <span className="font-mono">
                      button_index: 1=left, 2=right, 3=middle, 4=side1, 5=side2; count ≥ 1; delay_ms ≥ 1 (default 1)
                    </span>
                  ),
                },
                {
                  label: t("Response (SET)", "响应 (SET)"),
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.click(1,2,25)\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">{t("Echo ACK.", "回显 ACK。")}</p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section
            id="version-serial"
            badge={t("Identity", "身份")}
            title={t("Version & Serial", "版本与序列号")}
          >
            <SubSection id="version" title="version() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">version()</span>,
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.MAKCU\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {t("Concise firmware identifier.", "简洁的固件标识符。")}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="serial"
              title="serial() / serial(0) / serial(<str>) — GET/SET"
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">serial() / serial(0) / serial(&lt;str&gt;)</span>,
                  },
                  {
                    label: t("Response (GET) — one of", "响应 (GET) — 以下之一"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.Original Serial: ABC12345\r\n>>> `} />
                        <CodeBlock code={`km.Spoofed Serial: XYZ00001\r\n>>> `} />
                        <CodeBlock code={`km.Mouse does not have a serial number\r\n>>> `} />
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET) — clear", "响应 (SET) — 清除"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.serial(0)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Echo ACK on success; otherwise “no serial” line.",
                            "成功则回显 ACK；否则返回“无序列号”提示。",
                          )}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET) — set spoof", "响应 (SET) — 设置伪装"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.serial(MY-SN-01)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Max 20 chars. Stored in NVS and persists across firmware changes. Up to 12 devices can be saved.",
                            "最多 20 个字符。存储于 NVS，可在固件更新后保留。最多可保存 12 台设备。",
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section
            id="echo"
            badge={t("I/O", "I/O")}
            title={t("Echo control (GET/SET)", "回显控制 (GET/SET)")}
          >
            <SpecCard
              entries={[
                {
                  label: t("Command", "命令"),
                  content: <span className="font-mono">echo() / echo(0|1)</span>,
                },
                {
                  label: t("Response (GET)", "响应 (GET)"),
                  content: <CodeBlock code={`km.echo(1)\r\n>>> `} />,
                },
                {
                  label: t("Response (SET)", "响应 (SET)"),
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.echo(0)\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">
                        {isCn ? (
                          <span>
                            立即生效；使用 <span className="font-mono">echo(0)</span> 会抑制 setter 回显（GET 不受影响）。
                          </span>
                        ) : (
                          <span>
                            Applies immediately; with <span className="font-mono">echo(0)</span>, setter echoes are suppressed
                            (GETs unaffected).
                          </span>
                        )}
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="keyboard" badge={t("Keyboard", "键盘")} title={t("Keyboard", "键盘")}>
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6 text-sm text-muted-foreground">
                {t("Coming soon.", "即将推出。")}
              </CardContent>
            </Card>
          </Section>

          <Section
            id="limits"
            badge={t("Spec", "规格")}
            title={t("Limits & Parsing", "限制与解析")}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>
                    {isCn ? (
                      <span>
                        贝塞尔分段：默认 1，<strong>最大 512</strong>
                      </span>
                    ) : (
                      <span>
                        Bézier segments: default 1, <strong>max 512</strong>
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        移动数值：<strong>int16</strong>（饱和）
                      </span>
                    ) : (
                      <span>
                        Movement integers: <strong>int16</strong> with saturation
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        滚轮：<strong>int8</strong>
                      </span>
                    ) : (
                      <span>
                        Wheel: <strong>int8</strong>
                      </span>
                    )}
                  </li>
                  <li>
                    {t(
                      "Legacy ASCII terminators: ",
                      "传统 ASCII 终止符：",
                    )}
                    <span className="font-mono">\r</span>, <span className="font-mono">\n</span>,
                    <span className="font-mono"> ;</span>
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        支持二进制接收：<span className="font-mono">DE AD &lt;lenLE&gt; &lt;payload&gt;</span>
                      </span>
                    ) : (
                      <span>
                        Binary RX supported: <span className="font-mono">DE AD &lt;lenLE&gt; &lt;payload&gt;</span>
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        <span className="font-mono">echo(0)</span> 会抑制大多数 setter 回显；GET 仍会返回。
                      </span>
                    ) : (
                      <span>
                        <span className="font-mono">echo(0)</span> suppresses most setter echoes; GETs still reply
                      </span>
                    )}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Section>

          <Section
            id="baud-binary"
            badge={t("Serial", "串口")}
            title={t("Baud Rate (Binary RX)", "波特率（Binary RX）")}
          >
            <SpecCard
              entries={[
                {
                  label: t("Purpose", "用途"),
                  content: isCn ? (
                    <span className="font-mono">通过二进制帧设置 UART 波特率（无 ASCII 指令）。</span>
                  ) : (
                    <span className="font-mono">
                      Set UART baud rate using a binary frame (no ASCII command).
                    </span>
                  ),
                },
                {
                  label: t("Frame", "帧格式"),
                  content: <span className="font-mono">DE AD &lt;lenLE:2&gt; &lt;cmd:0xA5&gt; &lt;baud_rate:LE32&gt;</span>,
                },
                {
                  label: t("Header", "头部"),
                  content: <span className="font-mono">DE AD</span>,
                },
                {
                  label: t("Length", "长度"),
                  content: isCn ? (
                    <span className="font-mono">
                      小端 u16（仅负载字节）。此命令固定为 <strong>5</strong>（1 字节指令 + 4 字节波特率）。
                    </span>
                  ) : (
                    <span className="font-mono">
                      u16 little-endian (payload bytes only). For this command: <strong>5</strong> (1 cmd + 4 baud)
                    </span>
                  ),
                },
                {
                  label: t("Command", "命令"),
                  content: <span className="font-mono">0xA5 (baud rate set)</span>,
                },
                {
                  label: t("Payload", "负载"),
                  content: isCn ? (
                    <span className="font-mono">
                      uint32_t <strong>baud_rate</strong>（小端）。示例：115200 → 00 C2 01 00
                    </span>
                  ) : (
                    <span className="font-mono">
                      uint32_t <strong>baud_rate</strong> (little-endian). Example: 115200 → 00 C2 01 00
                    </span>
                  ),
                },
                {
                  label: t("Example (115200)", "示例 (115200)"),
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`DE AD 05 00 A5 00 C2 01 00`} />
                      <p className="text-xs text-muted-foreground">
                        {isCn ? (
                          <span>
                            解析：<span className="font-mono">DE AD</span> ｜ <span className="font-mono">05 00</span>
                            （长度=5）｜ <span className="font-mono">A5</span>（命令）｜
                            <span className="font-mono">00 C2 01 00</span>（115200 小端）
                          </span>
                        ) : (
                          <span>
                            Breakdown: <span className="font-mono">DE AD</span> | <span className="font-mono">05 00</span>
                            (len=5) | <span className="font-mono"> A5</span> (cmd) |
                            <span className="font-mono">00 C2 01 00</span> (115200 LE)
                          </span>
                        )}
                      </p>
                    </div>
                  ),
                },
                {
                  label: t("Effect", "生效"),
                  content: isCn ? (
                    <span className="font-mono">立即生效；主机需以新波特率重新同步串口。</span>
                  ) : (
                    <span className="font-mono">
                      Applies immediately; host must re-sync serial port at the new speed.
                    </span>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="tips" badge={t("Notes", "备注")} title={t("Tips", "提示")}>
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6 text-sm text-muted-foreground">
                {isCn ? (
                  <span>
                    <span className="font-mono">km.axis</span> 函数可完全解耦鼠标移动。配合 X/Y 轴锁定，可将用户输入与主机隔离，实现平滑的程序化控制。
                  </span>
                ) : (
                  <span>
                    The <span className="font-mono">km.axis</span> function can fully decouple mouse movement. Combined with
                    X/Y axis locks, this isolates user inputs from the host for seamless programmatic control.
                  </span>
                )}
              </CardContent>
            </Card>
          </Section>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-6 py-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>{t("API version 3.8", "API 版本 3.8")}</span>
            <span>makcu 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
