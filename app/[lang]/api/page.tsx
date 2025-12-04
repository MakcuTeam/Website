import { Card, CardContent } from "@/components/ui/card";
import Copy from "@/components/markdown/copy";
import type { LangProps } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locale";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { Section, SubSection } from "@/components/section";

type TocItem = {
  id: string;
  label: string;
  children?: TocItem[];
};

type SpecEntry = {
  label: string;
  content: React.ReactNode;
};

const tocByLang: Record<Locale, TocItem[]> = {
  en: [
    { id: "transport", label: "Transport & Framing" },
    {
      id: "mouse-buttons",
      label: "Mouse Buttons",
      children: [
        { id: "buttons-individual", label: "Individual Buttons (GET/SET)" },
        { id: "click", label: "Click Scheduling (SET)" },
        { id: "turbo", label: "turbo() (GET/SET)" },
      ],
    },
    {
      id: "mouse-movement",
      label: "Mouse Movement",
      children: [
        { id: "move", label: "move() (SET)" },
        { id: "moveto", label: "moveto() (SET)" },
        { id: "wheel", label: "wheel() (SET)" },
        { id: "pan", label: "pan() (GET/SET)" },
        { id: "tilt", label: "tilt() (GET/SET)" },
        { id: "getpos", label: "getpos() (GET)" },
        { id: "silent", label: "silent() (SET)" },
      ],
    },
    {
      id: "mouse-advanced",
      label: "Mouse Advanced",
      children: [
        { id: "mo", label: "mo() - Raw Mouse Frame (SET)" },
        { id: "lock", label: "lock_<target>() (GET/SET)" },
        { id: "catch", label: "catch_<target>() (GET/SET)" },
      ],
    },
    {
      id: "mouse-remap",
      label: "Mouse Remap (Physical)",
      children: [
        { id: "remap-button", label: "remap_button() (GET/SET)" },
        { id: "remap-axis", label: "remap_axis() (GET/SET)" },
        { id: "invert-x", label: "invert_x() (GET/SET)" },
        { id: "invert-y", label: "invert_y() (GET/SET)" },
        { id: "swap-xy", label: "swap_xy() (GET/SET)" },
      ],
    },
      {
        id: "keyboard",
        label: "Keyboard",
        children: [
          { id: "down", label: "down() (SET)" },
          { id: "up", label: "up() (SET)" },
          { id: "press", label: "press() (SET)" },
          { id: "string", label: "string() (SET)" },
          { id: "init", label: "init() (SET)" },
          { id: "isdown", label: "isdown() (GET)" },
          { id: "disable", label: "disable() (GET/SET)" },
          { id: "mask", label: "mask() (GET/SET)" },
          { id: "remap", label: "remap() (GET/SET)" },
          { id: "key-reference", label: "Complete Key Reference" },
        ],
      },
    {
      id: "streaming",
      label: "Streaming",
      children: [
        { id: "keys-stream", label: "keyboard() (GET/SET)" },
        { id: "buttons-stream", label: "buttons() (GET/SET)" },
        { id: "axis-stream", label: "axis() (GET/SET)" },
        { id: "mouse-stream", label: "mouse() (GET/SET)" },
      ],
    },
    {
      id: "screen",
      label: "Position & Screen",
      children: [{ id: "screen-cmd", label: "screen() (GET/SET)" }],
    },
    {
      id: "system",
      label: "System Commands",
      children: [
        { id: "help", label: "help() (GET)" },
        { id: "info", label: "info() (GET)" },
        { id: "version", label: "version() (GET)" },
        { id: "device", label: "device() (GET)" },
        { id: "fault", label: "fault() (GET)" },
        { id: "reboot", label: "reboot() (SET)" },
        { id: "serial", label: "serial() (GET/SET)" },
      ],
    },
      {
        id: "config",
        label: "Configuration",
        children: [
          { id: "log", label: "log() (GET/SET)" },
          { id: "echo", label: "echo() (GET/SET)" },
          { id: "baud", label: "baud() (GET/SET)" },
          { id: "bypass", label: "bypass() (GET/SET)" },
          { id: "hs", label: "hs() (GET/SET)" },
          { id: "led", label: "led() (GET/SET)" },
          { id: "release", label: "release() (GET/SET)" },
        ],
      },
    { id: "baud-binary", label: "Baud Rate (Binary)" },
    { id: "no-usb", label: "Functions Without USB Device" },
    { id: "limits", label: "Limits & Parsing" },
  ],
  cn: [
    { id: "transport", label: "传输与封装" },
    {
      id: "mouse-buttons",
      label: "鼠标按键",
      children: [
        { id: "buttons-individual", label: "单个按键 (GET/SET)" },
        { id: "click", label: "点击调度 (SET)" },
        { id: "turbo", label: "turbo() (GET/SET)" },
      ],
    },
    {
      id: "mouse-movement",
      label: "鼠标移动",
      children: [
        { id: "move", label: "move() (SET)" },
        { id: "moveto", label: "moveto() (SET)" },
        { id: "wheel", label: "wheel() (SET)" },
        { id: "pan", label: "pan() (GET/SET)" },
        { id: "tilt", label: "tilt() (GET/SET)" },
        { id: "getpos", label: "getpos() (GET)" },
        { id: "silent", label: "silent() (SET)" },
      ],
    },
    {
      id: "mouse-advanced",
      label: "鼠标高级",
      children: [
        { id: "mo", label: "mo() - 原始鼠标帧 (SET)" },
        { id: "lock", label: "lock_<target>() (GET/SET)" },
        { id: "catch", label: "catch_<target>() (GET/SET)" },
      ],
    },
    {
      id: "mouse-remap",
      label: "鼠标重映射（物理）",
      children: [
        { id: "remap-button", label: "remap_button() (GET/SET)" },
        { id: "remap-axis", label: "remap_axis() (GET/SET)" },
        { id: "invert-x", label: "invert_x() (GET/SET)" },
        { id: "invert-y", label: "invert_y() (GET/SET)" },
        { id: "swap-xy", label: "swap_xy() (GET/SET)" },
      ],
    },
      {
        id: "keyboard",
        label: "键盘",
        children: [
          { id: "down", label: "down() (SET)" },
          { id: "up", label: "up() (SET)" },
          { id: "press", label: "press() (SET)" },
          { id: "string", label: "string() (SET)" },
          { id: "init", label: "init() (SET)" },
          { id: "isdown", label: "isdown() (GET)" },
          { id: "disable", label: "disable() (GET/SET)" },
          { id: "mask", label: "mask() (GET/SET)" },
          { id: "remap", label: "remap() (GET/SET)" },
          { id: "key-reference", label: "完整按键参考" },
        ],
      },
    {
      id: "streaming",
      label: "流式",
      children: [
        { id: "keys-stream", label: "keyboard() (GET/SET)" },
        { id: "buttons-stream", label: "buttons() (GET/SET)" },
        { id: "axis-stream", label: "axis() (GET/SET)" },
        { id: "mouse-stream", label: "mouse() (GET/SET)" },
      ],
    },
    {
      id: "screen",
      label: "位置与屏幕",
      children: [{ id: "screen-cmd", label: "screen() (GET/SET)" }],
    },
    {
      id: "system",
      label: "系统命令",
      children: [
        { id: "help", label: "help() (GET)" },
        { id: "info", label: "info() (GET)" },
        { id: "version", label: "version() (GET)" },
        { id: "device", label: "device() (GET)" },
        { id: "fault", label: "fault() (GET)" },
        { id: "reboot", label: "reboot() (SET)" },
        { id: "serial", label: "serial() (GET/SET)" },
      ],
    },
      {
        id: "config",
        label: "配置",
        children: [
          { id: "log", label: "log() (GET/SET)" },
          { id: "echo", label: "echo() (GET/SET)" },
          { id: "baud", label: "baud() (GET/SET)" },
          { id: "bypass", label: "bypass() (GET/SET)" },
          { id: "hs", label: "hs() (GET/SET)" },
          { id: "led", label: "led() (GET/SET)" },
          { id: "release", label: "release() (GET/SET)" },
        ],
      },
    { id: "baud-binary", label: "波特率（二进制）" },
    { id: "no-usb", label: "无需 USB 设备的函数" },
    { id: "limits", label: "限制与解析" },
  ],
};

const metadataCopy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MAKCU API — KM Host Protocol",
    description:
      "Protocol reference for MAKCU KM Host API v3.9, covering transport, mouse, keyboard, streaming, and system commands.",
  },
  cn: {
    title: "MAKCU API — KM 主机协议",
    description:
      "MAKCU KM 主机 API v3.9 协议参考，涵盖传输、鼠标、键盘、流式以及系统指令。",
  },
};


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
        {/* fixed label rail so rows align across cards */}
        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[200px_minmax(0,1fr)]">
          {entries.map((entry, index) => (
            <Fragment key={`${entry.label}-${index}`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-500">
                {entry.label}
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
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
      {/* Aligned copy button */}
      <div className="absolute right-2 top-2">
        <Copy content={code} />
      </div>
      <pre className="overflow-x-auto whitespace-pre rounded-xl border border-border/60 bg-stone-950 px-4 py-8 font-mono text-xs text-stone-100 shadow-inner">
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
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-muted-foreground dark:text-foreground">MAKCU API</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {isCn
            ? "KM 主机协议 — v3.9 · MAKCU 生态的完整指令参考。"
            : "KM Host Protocol — v3.9 · Comprehensive command reference for the MAKCU ecosystem."}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside>
          <Card className="border-border/60 bg-card/90 shadow-lg">
            <CardContent className="p-5">
              <nav className="space-y-3 text-sm">
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
          {/* Transport */}
          <Section
            id="transport"
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
                            命令格式：以 <span className="font-mono">.</span> 开头，以 <span className="font-mono">)</span> 结尾。不再需要 <span className="font-mono">km.</span> 前缀。
                          </span>
                        ) : (
                          <span>
                            Command format: Start with <span className="font-mono">.</span> and end with <span className="font-mono">)</span>. The <span className="font-mono">km.</span> prefix is no longer required.
                          </span>
                        )}
                      </li>
                      <li>
                        {isCn ? (
                          <span>
                            其他值（如 <span className="font-mono">km</span>、<span className="font-mono">\r\n</span> 等）会被忽略。示例：<span className="font-mono">.move(1,1,)</span>
                          </span>
                        ) : (
                          <span>
                            Other values (such as <span className="font-mono">km</span>, <span className="font-mono">\r\n</span>, etc.) are ignored. Example: <span className="font-mono">.move(1,1,)</span>
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
                            （为兼容性保留 <span className="font-mono">km.</span> 前缀）
                          </span>
                        ) : (
                          <span>
                            Format: <span className="font-mono">km.</span>
                            <em>payload</em>
                            <span className="font-mono">\r\n&gt;&gt;&gt; </span>
                            (the <span className="font-mono">km.</span> prefix is retained for compatibility)
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
                      <li>
                        {isCn ? (
                          <span>
                            部分流式响应在 <span className="font-mono">km.</span> 前缀后携带<strong>二进制</strong>：
                            <span className="font-mono">km.mouse&lt;8字节&gt;</span>、
                            <span className="font-mono">km.buttons&lt;1字节掩码&gt;</span>。行尾仍为 <span className="font-mono">CRLF</span> 与提示符。
                          </span>
                        ) : (
                          <span>
                            Some streaming replies carry <strong>binary</strong> after the <span className="font-mono">km.</span> prefix:
                            <span className="font-mono">km.mouse&lt;8 bytes&gt;</span> and
                            <span className="font-mono">km.buttons&lt;1-byte mask&gt;</span>. Lines still terminate with <span className="font-mono">CRLF</span> and the prompt.
                          </span>
                        )}
                      </li>
                    </ul>
                  ),
                },
              ]}
            />
          </Section>

          {/* Mouse Buttons */}
          <Section id="mouse-buttons" title={t("Mouse Buttons", "鼠标按键")}>
            <SubSection
              id="buttons-individual"
              title={t("Individual Buttons (GET/SET)", "单个按键 (GET/SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">left([state]) | right([state]) | middle([state]) | side1([state]) | side2([state])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>
                        state: 0=释放（发送帧），1=按下，2=静默释放（设为0但不发送帧）
                      </span>
                    ) : (
                      <span>
                        state: 0=release (sends frame), 1=down, 2=silent_release (sets to 0 but doesn't send frame)
                      </span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.left()\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Returns lock state: 0=none, 1=raw, 2=injected, 3=both.",
                            "返回锁定状态：0=无，1=原始，2=注入，3=两者。",
                          )}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.left(1)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
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
              id="click"
              title={t("Click Scheduling (SET)", "点击调度 (SET)")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">click(button[,count[,delay_ms]])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>
                        button: 按键编号; count: 点击次数（可选）; delay_ms: 延迟（可选，默认随机 35-75ms，内部计时）
                      </span>
                    ) : (
                      <span>
                        button: button number; count: click count (optional); delay_ms: delay (optional, defaults to random 35-75ms, internal timing)
                      </span>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.click(1,3)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t("Echo ACK.", "回显 ACK。")}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="turbo"
              title={t("turbo([button[,delay_ms]]) — GET/SET", "turbo([button[,delay_ms]]) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">turbo([button[,delay_ms]])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        启用鼠标按键的连发模式。当按键被按住时，自动触发快速的按下/释放循环。多个按键可以同时启用连发，每个按键有独立的延迟设置。
                      </p>
                    ) : (
                      <p>
                        Enable rapid-fire mode for mouse buttons. When the button is held down, it automatically triggers rapid press/release cycles at the specified interval. Multiple buttons can have turbo enabled simultaneously, each with its own delay setting.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-2 pl-5">
                        <li>button: 1-5（鼠标按键：1=左键，2=右键，3=中键，4=侧键1，5=侧键2），0=禁用所有连发</li>
                        <li>delay_ms: 1-5000ms（0=禁用）。如果省略，使用随机 35-75ms。延迟是每次按下/释放切换之间的时间（例如，500ms = 按下 500ms，释放 500ms，重复）</li>
                        <li>延迟会自动舍入到鼠标端点的 <span className="font-mono">bInterval</span> 以进行 USB 同步</li>
                        <li><span className="font-mono">turbo()</span> - 仅返回活动的连发设置，如 <span className="font-mono">(m1=200, m2=400)</span>（仅显示已设置的，不显示零值）</li>
                        <li><span className="font-mono">turbo(button)</span> - 使用随机 35-75ms 延迟设置连发（自动舍入到 bInterval）</li>
                        <li><span className="font-mono">turbo(button, delay_ms)</span> - 使用指定延迟设置连发（自动舍入到 bInterval）</li>
                        <li><span className="font-mono">turbo(button, 0)</span> - 禁用该按键的连发</li>
                        <li><span className="font-mono">turbo(0)</span> - <strong>禁用所有连发</strong></li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-2 pl-5">
                        <li>button: 1-5 (mouse buttons: 1=left, 2=right, 3=middle, 4=side1, 5=side2), 0=disable all turbo</li>
                        <li>delay_ms: 1-5000ms (0=disable). If omitted, uses random 35-75ms. The delay is the time between each press/release toggle (e.g., 500ms = press for 500ms, release for 500ms, repeat)</li>
                        <li>Delay is automatically rounded to the mouse endpoint's <span className="font-mono">bInterval</span> for USB synchronization</li>
                        <li><span className="font-mono">turbo()</span> - Returns only active turbo settings as <span className="font-mono">(m1=200, m2=400)</span> (only shows what's set, not zeros)</li>
                        <li><span className="font-mono">turbo(button)</span> - Sets turbo with random 35-75ms delay (auto-rounded to bInterval)</li>
                        <li><span className="font-mono">turbo(button, delay_ms)</span> - Sets turbo with specified delay (auto-rounded to bInterval)</li>
                        <li><span className="font-mono">turbo(button, 0)</span> - Disables turbo for that specific button</li>
                        <li><span className="font-mono">turbo(0)</span> - <strong>Disables all turbo</strong></li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.turbo(1, 500)\r\n>>> `} />
                        <CodeBlock code={`km.turbo(2, 250)\r\n>>> `} />
                        <CodeBlock code={`km.turbo(1)\r\n>>> `} />
                        <CodeBlock code={`km.turbo()\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Mouse Movement */}
          <Section id="mouse-movement" title={t("Mouse Movement", "鼠标移动")}>
            <SubSection id="move" title="move(dx,dy[,segments[,cx1,cy1[,cx2,cy2]]]) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">move(dx,dy[,segments[,cx1,cy1[,cx2,cy2]]])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <p>
                        dx,dy: 相对移动距离; segments: 分段数（可选，默认1，最大512）; cx1,cy1,cx2,cy2: 三次贝塞尔控制点（可选）
                      </p>
                    ) : (
                      <p>
                        dx,dy: relative move distance; segments: segment count (optional, default 1, max 512); cx1,cy1,cx2,cy2: cubic Bézier control points (optional)
                      </p>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.move(10,-3)\r\n>>> `} />
                        <CodeBlock code={`km.move(100,50,8,40,25,80,10)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">{t("Echo ACK.", "回显 ACK。")}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="moveto" title="moveto(x,y[,segments[,cx1,cy1[,cx2,cy2]]]) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">moveto(x,y[,segments[,cx1,cy1[,cx2,cy2]]])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        将指针移动到绝对位置。内部计算到达请求屏幕位置所需的 x,y 移动量。参数与 <span className="font-mono">km.move()</span> 对齐。
                      </p>
                    ) : (
                      <p>
                        Move pointer to absolute position. Internally calculates the needed x,y movement to reach the requested position on the screen. Parameters align with <span className="font-mono">km.move()</span>.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <p>
                        x,y: 绝对坐标; segments: 分段数（可选，默认1，最大512）; cx1,cy1,cx2,cy2: 三次贝塞尔控制点（可选）
                      </p>
                    ) : (
                      <p>
                        x,y: absolute coordinates; segments: segment count (optional, default 1, max 512); cx1,cy1,cx2,cy2: cubic Bézier control points (optional)
                      </p>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.moveto(640,360)\r\n>>> `} />
                        <CodeBlock code={`km.moveto(100,50,8,40,25,80,10)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">{t("Echo ACK.", "回显 ACK。")}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="wheel" title="wheel(delta) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">wheel(delta)</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        Windows 不允许在单个命令中执行多个滚轮步数。delta 值会被限制为 ±1 步（正数向上滚动，负数向下滚动）。大于 1 的值视为 1，小于 -1 的值视为 -1。
                      </p>
                    ) : (
                      <p>
                        Windows does not allow multiple scroll steps in a single command. The delta value is clamped to ±1 step (positive for scroll up, negative for scroll down). Values greater than 1 are treated as 1, values less than -1 are treated as -1.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>delta: 滚轮步数（限制为 ±1）</span>
                    ) : (
                      <span>delta: scroll step (clamped to ±1)</span>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.wheel(-1)\r\n>>> `} />
                        <CodeBlock code={`km.wheel(1)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {isCn ? (
                            <span>
                              回显 ACK。注意：<span className="font-mono">km.wheel(-5)</span> 只会向下滚动 1 步，<span className="font-mono">km.wheel(5)</span> 只会向上滚动 1 步。
                            </span>
                          ) : (
                            <span>
                              Echo ACK. Note: <span className="font-mono">km.wheel(-5)</span> will only scroll down 1 step, <span className="font-mono">km.wheel(5)</span> will only scroll up 1 step.
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="pan" title="pan([steps]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">pan([steps])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>steps: 水平滚动步数（SET）; 无参数时查询待处理数量（GET）</span>
                    ) : (
                      <span>steps: horizontal scroll steps (SET); no params to query pending (GET)</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.pan(3)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="tilt" title="tilt([steps]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">tilt([steps])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>steps: 倾斜/z轴滚动步数（SET）; 无参数时查询待处理数量（GET）</span>
                    ) : (
                      <span>steps: tilt/z-axis scroll steps (SET); no params to query pending (GET)</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.tilt(2)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

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
                        <CodeBlock code={`km.getpos()\r\n>>> km.getpos(123,456)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Returns current pointer position as (x,y).",
                            "返回当前指针位置 (x,y)。",
                          )}
                        </p>
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
                      "Move then perform silent left click at (x,y)",
                      "移动并在 (x,y) 处执行静默左键点击",
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.silent(400,300)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">{t("Echo ACK.", "回显 ACK。")}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Mouse Advanced */}
          <Section id="mouse-advanced" title={t("Mouse Advanced", "鼠标高级")}>
            <SubSection id="mo" title="mo(buttons,x,y,wheel,pan,tilt) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">mo(buttons,x,y,wheel,pan,tilt)</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        发送完整的原始鼠标帧（仅SET，不支持GET）。(0) 清除所有状态。x,y,wheel,pan,tilt 为一次性值；按键掩码镜像按键状态。
                      </p>
                    ) : (
                      <p>
                        Send complete raw mouse frame (SET only, no GET). (0) clears all; x,y,wheel,pan,tilt are one-shots; button mask mirrors button states.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>buttons: 按键掩码; x,y: 移动增量; wheel,pan,tilt: 滚轮值</span>
                    ) : (
                      <span>buttons: button mask; x,y: movement deltas; wheel,pan,tilt: scroll values</span>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.mo(1,10,5,0,0,0)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="lock"
              title={t("lock_<target>(state) — GET/SET", "lock_<target>(state) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command Format", "命令格式"),
                    content: <span className="font-mono">lock_&lt;target&gt;([state])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        锁定按钮或轴。目标（target）是命令名的一部分，不是参数。state: 1=锁定，0=解锁。调用时使用 `()` 可读取锁定状态。
                      </p>
                    ) : (
                      <p>
                        Lock button or axis. The target is part of the command name, not a parameter. state: 1=lock, 0=unlock. Call with `()` to read lock state.
                      </p>
                    ),
                  },
                  {
                    label: t("Targets", "目标"),
                    content: isCn ? (
                      <div className="space-y-2">
                        <p><strong>按键:</strong> ml/mm/mr/ms1/ms2</p>
                        <ul className="list-disc space-y-1 pl-5 text-xs">
                          <li>ml - 左键</li>
                          <li>mm - 中键</li>
                          <li>mr - 右键</li>
                          <li>ms1 - 侧键1</li>
                          <li>ms2 - 侧键2</li>
                        </ul>
                        <p><strong>轴:</strong> mx/my/mw/mx+/mx-/my+/my-/mw+/mw-</p>
                        <ul className="list-disc space-y-1 pl-5 text-xs">
                          <li>mx/my/mw - 完全锁定（阻止该轴的所有移动）</li>
                          <li>mx+/my+/mw+ - 正向锁定（仅阻止正向移动）</li>
                          <li>mx-/my-/mw- - 负向锁定（仅阻止负向移动）</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p><strong>Buttons:</strong> ml/mm/mr/ms1/ms2</p>
                        <ul className="list-disc space-y-1 pl-5 text-xs">
                          <li>ml - Left mouse button</li>
                          <li>mm - Middle mouse button</li>
                          <li>mr - Right mouse button</li>
                          <li>ms1 - Side button 1</li>
                          <li>ms2 - Side button 2</li>
                        </ul>
                        <p><strong>Axes:</strong> mx/my/mw/mx+/mx-/my+/my-/mw+/mw-</p>
                        <ul className="list-disc space-y-1 pl-5 text-xs">
                          <li>mx/my/mw - Full lock (blocks all movement in that axis)</li>
                          <li>mx+/my+/mw+ - Positive direction lock (blocks positive movement only)</li>
                          <li>mx-/my-/mw- - Negative direction lock (blocks negative movement only)</li>
                        </ul>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.lock_mx()\r\n>>> km.lock_mx(1)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {isCn ? (
                            <span>
                              返回值：<strong>1</strong>=已锁定，<strong>0</strong>=未锁定
                            </span>
                          ) : (
                            <span>
                              Returns: <strong>1</strong>=locked, <strong>0</strong>=unlocked
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.lock_mx(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "锁定所有 X 轴移动" : "Lock all X-axis movement"}
                        </p>
                        <CodeBlock code={`km.lock_mx+(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "仅锁定正向 X 移动（向右）" : "Lock only positive X movement (right)"}
                        </p>
                        <CodeBlock code={`km.lock_mx-(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "仅锁定负向 X 移动（向左）" : "Lock only negative X movement (left)"}
                        </p>
                        <CodeBlock code={`km.lock_my(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "锁定所有 Y 轴移动" : "Lock all Y-axis movement"}
                        </p>
                        <CodeBlock code={`km.lock_mw(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "锁定所有滚轮移动" : "Lock all wheel movement"}
                        </p>
                        <CodeBlock code={`km.lock_mw+(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "仅锁定正向滚轮移动（向上滚动）" : "Lock only positive wheel movement (scroll up)"}
                        </p>
                        <CodeBlock code={`km.lock_mw-(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "仅锁定负向滚轮移动（向下滚动）" : "Lock only negative wheel movement (scroll down)"}
                        </p>
                        <CodeBlock code={`km.lock_ml(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "锁定左键" : "Lock left mouse button"}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="catch"
              title={t("catch_<target>(mode) — GET/SET", "catch_<target>(mode) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command Format", "命令格式"),
                    content: <span className="font-mono">catch_&lt;target&gt;([mode])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        在锁定的按钮上启用捕获。目标（target）是命令名的一部分，不是参数。<strong>注意：捕获仅适用于按钮，不适用于轴。</strong>需要先设置对应的 <span className="font-mono">km.lock_&lt;target&gt;</span>。
                      </p>
                    ) : (
                      <p>
                        Enable catch on a locked button. The target is part of the command name, not a parameter. <strong>Note: Catch only works for buttons, not axes.</strong> Requires corresponding <span className="font-mono">km.lock_&lt;target&gt;</span> to be set first.
                      </p>
                    ),
                  },
                  {
                    label: t("Targets", "目标"),
                    content: isCn ? (
                      <span>ml, mm, mr, ms1, ms2（仅按钮，不适用于轴）</span>
                    ) : (
                      <span>ml, mm, mr, ms1, ms2 (buttons only, not axes)</span>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>mode: 0=自动，1=手动; () 返回状态</span>
                    ) : (
                      <span>mode: 0=auto, 1=manual; () returns state</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.catch_ml()\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {isCn ? "使用 `()` 查询捕获状态" : "Use `()` to query catch state"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.catch_ml(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "为左键启用手动捕获" : "Enable manual catch for left mouse button"}
                        </p>
                        <CodeBlock code={`km.catch_ml(0)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "为左键启用自动捕获" : "Enable auto catch for left mouse button"}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Mouse Remap (Physical Only) */}
          <Section id="mouse-remap" title={t("Mouse Remap (Physical Only)", "鼠标重映射（仅物理）")}>
            <Tip>
              {isCn ? (
                <span>
                  以下命令仅影响物理输入，<strong>注入不受影响</strong>。这意味着您可以重映射物理鼠标按键和轴，而通过 API 注入的输入将保持不变。
                </span>
              ) : (
                <span>
                  The following commands only affect physical input, <strong>injection is NOT affected</strong>. This means you can remap physical mouse buttons and axes, while injected inputs via API will remain unchanged.
                </span>
              )}
            </Tip>

            <SubSection id="remap-button" title="remap_button([src,dst]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">remap_button([src,dst])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        重映射鼠标按键（仅物理）。自动清除冲突的映射；可以映射两个方向（交换）。
                      </p>
                    ) : (
                      <p>
                        Remap mouse buttons (physical only). Auto-clears conflicting mappings; both directions can be mapped (swap).
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - 仅显示活动的映射，如 <span className="font-mono">(left:right,right:left)</span></li>
                        <li><span className="font-mono">(0)</span> - 重置所有按键映射</li>
                        <li><span className="font-mono">(src,dst)</span> - 映射按键 src→dst（1=左键，2=右键，3=中键，4=侧键1，5=侧键2）</li>
                        <li><span className="font-mono">(src,0)</span> - 清除 src 按键的映射</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - Show only active mappings, e.g., <span className="font-mono">(left:right,right:left)</span></li>
                        <li><span className="font-mono">(0)</span> - Reset all button remaps</li>
                        <li><span className="font-mono">(src,dst)</span> - Map button src→dst (1=left, 2=right, 3=middle, 4=side1, 5=side2)</li>
                        <li><span className="font-mono">(src,0)</span> - Clear remap for button src</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.remap_button()\r\n>>> `} />
                        <CodeBlock code={`km.remap_button(1,2)\r\n>>> `} />
                        <CodeBlock code={`km.remap_button(0)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="remap-axis" title="remap_axis([inv_x,inv_y,swap]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">remap_axis([inv_x,inv_y,swap])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        重映射鼠标轴（仅物理）。一次设置所有三个标志。
                      </p>
                    ) : (
                      <p>
                        Remap mouse axes (physical only). Set all three flags at once.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - 显示当前设置，如 <span className="font-mono">(invert_x=0,invert_y=1,swap_xy=0)</span></li>
                        <li><span className="font-mono">(0)</span> - 重置所有轴映射</li>
                        <li><span className="font-mono">(inv_x,inv_y,swap)</span> - 设置所有三个标志（0 或 1）</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - Show current settings, e.g., <span className="font-mono">(invert_x=0,invert_y=1,swap_xy=0)</span></li>
                        <li><span className="font-mono">(0)</span> - Reset all axis remaps</li>
                        <li><span className="font-mono">(inv_x,inv_y,swap)</span> - Set all three flags (0 or 1)</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.remap_axis()\r\n>>> `} />
                        <CodeBlock code={`km.remap_axis(0,1,0)\r\n>>> `} />
                        <CodeBlock code={`km.remap_axis(0)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="invert-x" title="invert_x([state]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">invert_x([state])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Invert X axis (physical only)",
                      "反转 X 轴（仅物理）",
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 查询; (0) 禁用; (1) 启用</span>
                    ) : (
                      <span>() show; (0) disable; (1) enable</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.invert_x(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="invert-y" title="invert_y([state]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">invert_y([state])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Invert Y axis (physical only)",
                      "反转 Y 轴（仅物理）",
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 查询; (0) 禁用; (1) 启用</span>
                    ) : (
                      <span>() show; (0) disable; (1) enable</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.invert_y(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="swap-xy" title="swap_xy([state]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">swap_xy([state])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Swap X and Y axes (physical only)",
                      "交换 X 和 Y 轴（仅物理）",
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 查询; (0) 禁用; (1) 启用</span>
                    ) : (
                      <span>() show; (0) disable; (1) enable</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.swap_xy(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Keyboard */}
          <Section id="keyboard" title={t("Keyboard Commands", "键盘命令")}>
            <Tip>
              {isCn ? (
                <span>
                  键盘命令支持两种格式：<strong>数字 HID 码</strong>（如 4）或<strong>字符串名称</strong>（如 'a'、"enter"）。
                  支持的按键名称包括字母、数字、功能键、导航键和修饰键。详见规范。
                </span>
              ) : (
                <span>
                  Keyboard commands support two formats: <strong>numeric HID code</strong> (e.g., 4) or <strong>string key name</strong> (e.g., 'a', "enter").
                  Supported key names include letters, numbers, function keys, navigation keys, and modifiers. See specification for details.
                </span>
              )}
            </Tip>

            <SubSection id="down" title="down(key) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">down(key)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>key: HID码或字符串（'a'、"shift"）</span>
                    ) : (
                      <span>key: HID code or quoted string ('a', "shift")</span>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.down('shift')\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="up" title="up(key) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">up(key)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>key: HID码或字符串（'a'、"ctrl"）</span>
                    ) : (
                      <span>key: HID code or quoted string ('a', "ctrl")</span>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.up("ctrl")\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="press" title="press(key[,hold_ms[,rand_ms]]) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">press(key[,hold_ms[,rand_ms]])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li>key: HID码（0-255）或引用的按键名称</li>
                        <li>hold_ms: 按住时间（可选）。如果省略，使用随机 35-75ms（值会被记录日志）</li>
                        <li>rand_ms: 可选随机范围，添加到 <span className="font-mono">hold_ms</span>（0 = 无随机化）</li>
                        <li><strong>注意：</strong>持续时间会自动舍入到键盘的 <span className="font-mono">bInterval</span> 以进行 USB 同步</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li>key: HID code (0-255) or quoted key name</li>
                        <li>hold_ms: Optional hold duration in milliseconds. If omitted, uses random 35-75ms (value is logged)</li>
                        <li>rand_ms: Optional randomization range added to <span className="font-mono">hold_ms</span> (0 = no randomization)</li>
                        <li><strong>Note:</strong> Duration is automatically rounded to the keyboard's <span className="font-mono">bInterval</span> for USB synchronization</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('a')\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "使用随机 35-75ms 按住时间（已记录）" : "Press 'a' with random 35-75ms hold (logged)"}
                        </p>
                        <CodeBlock code={`km.press('d', 50)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "精确按住 50ms" : "Press 'd' with exactly 50ms hold"}
                        </p>
                        <CodeBlock code={`km.press('d', 50, 10)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          {isCn ? "50ms 基础 + 随机 0-10ms" : "Press 'd' with 50ms base + random 0-10ms"}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="string" title="string(text) — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">string(text)</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        使用自动计时的队列按键输入输入 ASCII 字符串。自动处理大写字母和符号的 Shift。使用定时队列系统（无定时器插槽限制）。
                      </p>
                    ) : (
                      <p>
                        Type an ASCII string using queued key presses with automatic timing. Automatically handles Shift for uppercase letters and symbols. Uses timed queue system (no timer slot limits).
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li>text: 要输入的 ASCII 字符串（最多 256 个字符）</li>
                        <li>每个字符使用随机 35-75ms 按住时间（内部计时，不记录日志）</li>
                        <li>字符间延迟：字符之间 10ms</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li>text: ASCII string to type (max 256 characters)</li>
                        <li>Each character uses random 35-75ms hold time (internal timing, not logged)</li>
                        <li>Inter-character delay: 10ms between characters</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.string("Hello")\r\n>>> `} />
                        <CodeBlock code={`km.string("Test123!")\r\n>>> `} />
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.string("hello")\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="init" title="init() — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">init()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Clear keyboard state and release pressed keys",
                      "清除键盘状态并释放按下的按键",
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.init()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="isdown" title="isdown(key) — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">isdown(key)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>key: HID码或字符串（'a'、"shift"）</span>
                    ) : (
                      <span>key: HID code or quoted string ('a', "shift")</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.isdown("ctrl")\r\n>>> km.isdown(1)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Returns 1 if key is down, 0 if released.",
                            "如果按键按下返回 1，释放返回 0。",
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="disable" title="disable([key1,key2,...] | [key,mode]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">disable([key1,key2,...] | [key,mode])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        禁用/启用键盘按键以阻止它们被发送到主机。
                      </p>
                    ) : (
                      <p>
                        Disable/enable keyboard keys to block them from being sent to the host.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - 列出所有当前禁用的按键，格式为 <span className="font-mono">(a,c,f,)</span>（显示按键名称（如果可用），否则显示 HID 码）</li>
                        <li><span className="font-mono">(key1,key2,...)</span> - 一次禁用多个按键。按键可以是 HID 码或引用的按键名称（例如，<span className="font-mono">'a'</span>、<span className="font-mono">'f1'</span>、<span className="font-mono">'ctrl'</span>）</li>
                        <li><span className="font-mono">(key,mode)</span> - 启用或禁用单个按键。<span className="font-mono">mode</span>：<span className="font-mono">1</span>=禁用，<span className="font-mono">0</span>=启用</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - List all currently disabled keys in format <span className="font-mono">(a,c,f,)</span> (shows key names when available, HID codes otherwise)</li>
                        <li><span className="font-mono">(key1,key2,...)</span> - Disable multiple keys at once. Keys can be HID codes or quoted key names (e.g., <span className="font-mono">'a'</span>, <span className="font-mono">'f1'</span>, <span className="font-mono">'ctrl'</span>)</li>
                        <li><span className="font-mono">(key,mode)</span> - Enable or disable a single key. <span className="font-mono">mode</span>: <span className="font-mono">1</span>=disable, <span className="font-mono">0</span>=enable</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.disable()\r\n>>> km.disable(a,c,f,)\r\n>>> `} />
                        <CodeBlock code={`km.disable('a','c','f')\r\n>>> `} />
                        <CodeBlock code={`km.disable('f1','alt','win')\r\n>>> `} />
                        <CodeBlock code={`km.disable('a', 0)\r\n>>> `} />
                        <CodeBlock code={`km.disable('a', 1)\r\n>>> `} />
                        <CodeBlock code={`km.disable(4,6,9)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="mask" title="mask(key[,mode]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">mask(key[,mode])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>key: HID码或字符串; mode: 0=关闭，1=开启</span>
                    ) : (
                      <span>key: HID code or quoted string; mode: 0=off, 1=on</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.mask('a',1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="remap" title="remap(source,target) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">remap(source,target)</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>source,target: 均可为HID码或字符串; target=0 清除映射（透传）</span>
                    ) : (
                      <span>source,target: both can be HID code or quoted string; target=0 clears remap (passthrough)</span>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.remap('a','b')\r\n>>> `} />
                        <CodeBlock code={`km.remap('a',0)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="key-reference" title={t("Complete Keyboard Key Reference", "完整键盘按键参考")}>
              <Tip>
                {isCn ? (
                  <span>
                    单字符字母<strong>区分大小写</strong>（<span className="font-mono">'a'</span> 输入小写，<span className="font-mono">'A'</span> 输入大写）。多字符特殊键<strong>不区分大小写</strong>（<span className="font-mono">'f1'</span>、<span className="font-mono">'F1'</span>、<span className="font-mono">'ctrl'</span>、<span className="font-mono">'CTRL'</span> 都相同）。
                  </span>
                ) : (
                  <span>
                    Single character letters are <strong>case-sensitive</strong> (<span className="font-mono">'a'</span> types lowercase, <span className="font-mono">'A'</span> types uppercase). Multi-character special keys are <strong>case-insensitive</strong> (<span className="font-mono">'f1'</span>, <span className="font-mono">'F1'</span>, <span className="font-mono">'ctrl'</span>, <span className="font-mono">'CTRL'</span> all work the same).
                  </span>
                )}
              </Tip>

              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">press(key)</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        键盘按键参考表。所有按键支持 HID 码或字符串名称。单字符字母区分大小写（小写输入小写，大写自动使用 Shift 输入大写）。多字符特殊键不区分大小写。
                      </p>
                    ) : (
                      <p>
                        Complete keyboard key reference table. All keys support HID codes or string names. Single character letters are case-sensitive (lowercase types lowercase, uppercase automatically uses Shift to type uppercase). Multi-character special keys are case-insensitive.
                      </p>
                    ),
                  },
                  {
                    label: t("Letters (HID 4-29)", "字母（HID 4-29）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'a'", "4", "a", "A"],
                              ["'b'", "5", "b", "B"],
                              ["'c'", "6", "c", "C"],
                              ["'d'", "7", "d", "D"],
                              ["'e'", "8", "e", "E"],
                              ["'f'", "9", "f", "F"],
                              ["'g'", "10", "g", "G"],
                              ["'h'", "11", "h", "H"],
                              ["'i'", "12", "i", "I"],
                              ["'j'", "13", "j", "J"],
                              ["'k'", "14", "k", "K"],
                              ["'l'", "15", "l", "L"],
                              ["'m'", "16", "m", "M"],
                              ["'n'", "17", "n", "N"],
                              ["'o'", "18", "o", "O"],
                              ["'p'", "19", "p", "P"],
                              ["'q'", "20", "q", "Q"],
                              ["'r'", "21", "r", "R"],
                              ["'s'", "22", "s", "S"],
                              ["'t'", "23", "t", "T"],
                              ["'u'", "24", "u", "U"],
                              ["'v'", "25", "v", "V"],
                              ["'w'", "26", "w", "W"],
                              ["'x'", "27", "x", "X"],
                              ["'y'", "28", "y", "Y"],
                              ["'z'", "29", "z", "Z"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('a')      # types "a" (HID 4)\nkm.press('A')      # types "A" (HID 4 + Shift)`} />
                      </div>
                    ),
                  },
                  {
                    label: t("Numbers & Shift Variants (HID 30-39)", "数字和 Shift 变体（HID 30-39）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'1'", "30", "1", "!"],
                              ["'2'", "31", "2", "@"],
                              ["'3'", "32", "3", "#"],
                              ["'4'", "33", "4", "$"],
                              ["'5'", "34", "5", "%"],
                              ["'6'", "35", "6", "^"],
                              ["'7'", "36", "7", "&"],
                              ["'8'", "37", "8", "*"],
                              ["'9'", "38", "9", "("],
                              ["'0'", "39", "0", ")"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('1')      # types "1" (HID 30)\nkm.down('shift')\nkm.press('1')      # types "!" (HID 30 + Shift)\nkm.up('shift')`} />
                      </div>
                    ),
                  },
                  {
                    label: t("Control Keys (HID 40-44)", "控制键（HID 40-44）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'enter', 'return'", "40", "Enter", "-"],
                              ["'escape', 'esc'", "41", "Escape", "-"],
                              ["'backspace', 'back'", "42", "Backspace", "-"],
                              ["'tab'", "43", "Tab", "-"],
                              ["'space', 'spacebar'", "44", " ", "-"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs whitespace-normal break-words">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('enter')  # Enter key (HID 40)`} />
                      </div>
                    ),
                  },
                  {
                    label: t("Symbols & Shift Variants (HID 45-57)", "符号和 Shift 变体（HID 45-57）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'minus', 'dash', 'hyphen'", "45", "-", "_"],
                              ["'equals', 'equal'", "46", "=", "+"],
                              ["'leftbracket', 'lbracket', 'openbracket'", "47", "[", "{"],
                              ["'rightbracket', 'rbracket', 'closebracket'", "48", "]", "}"],
                              ["'backslash', 'bslash'", "49", "\\", "|"],
                              ["'nonus_hash'", "50", "#", "-"],
                              ["'semicolon', 'semi'", "51", ";", ":"],
                              ["'quote', 'apostrophe', 'singlequote'", "52", "'", '"'],
                              ["'grave', 'backtick', 'tilde'", "53", "`", "~"],
                              ["'comma'", "54", ",", "<"],
                              ["'period', 'dot'", "55", ".", ">"],
                              ["'slash', 'forwardslash', 'fslash'", "56", "/", "?"],
                              ["'capslock', 'caps'", "57", "Caps Lock", "-"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs whitespace-normal break-words">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('minus')  # types "-" (HID 45)\nkm.down('shift')\nkm.press('minus')  # types "_" (HID 45 + Shift)\nkm.up('shift')`} />
                      </div>
                    ),
                  },
                  {
                    label: t("Function Keys (HID 58-69)", "功能键（HID 58-69）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'f1'", "58", "F1", "-"],
                              ["'f2'", "59", "F2", "-"],
                              ["'f3'", "60", "F3", "-"],
                              ["'f4'", "61", "F4", "-"],
                              ["'f5'", "62", "F5", "-"],
                              ["'f6'", "63", "F6", "-"],
                              ["'f7'", "64", "F7", "-"],
                              ["'f8'", "65", "F8", "-"],
                              ["'f9'", "66", "F9", "-"],
                              ["'f10'", "67", "F10", "-"],
                              ["'f11'", "68", "F11", "-"],
                              ["'f12'", "69", "F12", "-"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('f1')     # F1 key (HID 58)`} />
                      </div>
                    ),
                  },
                  {
                    label: t("System Keys (HID 70-83)", "系统键（HID 70-83）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'printscreen', 'prtsc', 'print'", "70", "Print Screen", "-"],
                              ["'scrolllock', 'scroll'", "71", "Scroll Lock", "-"],
                              ["'pause', 'break'", "72", "Pause/Break", "-"],
                              ["'insert', 'ins'", "73", "Insert", "-"],
                              ["'home'", "74", "Home", "-"],
                              ["'pageup', 'pgup'", "75", "Page Up", "-"],
                              ["'delete', 'del'", "76", "Delete", "-"],
                              ["'end'", "77", "End", "-"],
                              ["'pagedown', 'pgdown', 'pgdn'", "78", "Page Down", "-"],
                              ["'right', 'rightarrow'", "79", "Right Arrow", "-"],
                              ["'left', 'leftarrow'", "80", "Left Arrow", "-"],
                              ["'down', 'downarrow'", "81", "Down Arrow", "-"],
                              ["'up', 'uparrow'", "82", "Up Arrow", "-"],
                              ["'numlock', 'num'", "83", "Num Lock", "-"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs whitespace-normal break-words">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('home')   # Home key (HID 74)`} />
                      </div>
                    ),
                  },
                  {
                    label: t("Numpad Keys (HID 84-99)", "数字键盘（HID 84-99）"),
                    content: (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[15%]" />
                            <col className="w-[22.5%]" />
                            <col className="w-[22.5%]" />
                          </colgroup>
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names", "按键名称")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                              <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            {[
                              ["'kpdivide', 'npdivide'", "84", "/", "-"],
                              ["'kpmultiply', 'npmultiply'", "85", "*", "-"],
                              ["'kpminus', 'npminus'", "86", "-", "-"],
                              ["'kpplus', 'npplus'", "87", "+", "-"],
                              ["'kpenter', 'npenter'", "88", "Enter", "-"],
                              ["'kp1', 'np1'", "89", "1", "-"],
                              ["'kp2', 'np2'", "90", "2", "-"],
                              ["'kp3', 'np3'", "91", "3", "-"],
                              ["'kp4', 'np4'", "92", "4", "-"],
                              ["'kp5', 'np5'", "93", "5", "-"],
                              ["'kp6', 'np6'", "94", "6", "-"],
                              ["'kp7', 'np7'", "95", "7", "-"],
                              ["'kp8', 'np8'", "96", "8", "-"],
                              ["'kp9', 'np9'", "97", "9", "-"],
                              ["'kp0', 'np0'", "98", "0", "-"],
                              ["'kpperiod', 'kpdot', 'npperiod', 'npdot'", "99", ".", "-"],
                            ].map(([names, hid, normal, shift], idx) => (
                              <tr key={idx} className="border-b border-border/30">
                                <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                <td className="px-4 py-2">{hid}</td>
                                <td className="px-4 py-2 font-mono text-xs whitespace-normal break-words">{normal}</td>
                                <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.press('kp1')    # Numpad 1 (HID 89)`} />
                      </div>
                    ),
                  },
                  {
                    label: t("Modifier Keys (HID 224-231)", "修饰键（HID 224-231）"),
                    content: (
                      <div className="space-y-3">
                        <div className="overflow-x-auto">
                          <table className="w-full table-fixed border-collapse text-sm">
                            <colgroup>
                              <col className="w-[40%]" />
                              <col className="w-[15%]" />
                              <col className="w-[22.5%]" />
                              <col className="w-[22.5%]" />
                            </colgroup>
                            <thead>
                              <tr className="border-b border-border/60">
                                <th className="px-4 py-2.5 text-left font-semibold">{t("Key Names (aliases)", "按键名称（别名）")}</th>
                                <th className="px-4 py-2.5 text-left font-semibold">{t("HID", "HID")}</th>
                                <th className="px-4 py-2.5 text-left font-semibold">{t("Normal Output", "正常输出")}</th>
                                <th className="px-4 py-2.5 text-left font-semibold">{t("Shift Output", "Shift 输出")}</th>
                              </tr>
                            </thead>
                            <tbody className="text-muted-foreground">
                              {[
                                ["'leftctrl', 'lctrl', 'leftcontrol', 'lcontrol', 'ctrl', 'control'", "224", "Left Ctrl", "-"],
                                ["'leftshift', 'lshift', 'shift'", "225", "Left Shift", "-"],
                                ["'leftalt', 'lalt', 'alt'", "226", "Left Alt", "-"],
                                ["'leftgui', 'lgui', 'leftwin', 'lwin', 'gui', 'win', 'windows', 'super', 'meta', 'cmd', 'command'", "227", "Left GUI", "-"],
                                ["'rightctrl', 'rctrl', 'rightcontrol', 'rcontrol'", "228", "Right Ctrl", "-"],
                                ["'rightshift', 'rshift'", "229", "Right Shift", "-"],
                                ["'rightalt', 'ralt'", "230", "Right Alt", "-"],
                                ["'rightgui', 'rgui', 'rightwin', 'rwin', 'rightwindows'", "231", "Right GUI", "-"],
                              ].map(([names, hid, normal, shift], idx) => (
                                <tr key={idx} className="border-b border-border/30">
                                  <td className="px-4 py-2 font-mono text-xs break-words">{names}</td>
                                  <td className="px-4 py-2">{hid}</td>
                                  <td className="px-4 py-2 font-mono text-xs whitespace-normal break-words">{normal}</td>
                                  <td className="px-4 py-2 font-mono text-xs">{shift}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isCn ? (
                            <span>
                              <strong>注意：</strong>通用名称（<span className="font-mono">'ctrl'</span>、<span className="font-mono">'shift'</span>、<span className="font-mono">'alt'</span>、<span className="font-mono">'gui'</span>）默认为<strong>左侧</strong>变体
                            </span>
                          ) : (
                            <span>
                              <strong>Note:</strong> Generic names (<span className="font-mono">'ctrl'</span>, <span className="font-mono">'shift'</span>, <span className="font-mono">'alt'</span>, <span className="font-mono">'gui'</span>) default to the <strong>left</strong> variant
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.down('ctrl')    # Left Ctrl (HID 224)\nkm.up('ctrl')`} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

          </Section>

          {/* Streaming */}
          <Section id="streaming" title={t("Streaming", "流式")}>
            <SubSection
              id="keys-stream"
              title={t("keyboard([mode[,period]]) — GET/SET", "keyboard([mode[,period]]) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">keyboard([mode[,period]])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        流式传输键盘按键，使用人类可读的名称。模式 1=raw（物理输入），2=constructed frame（重映射/屏蔽后）；周期限制在 1-1000 帧。
                      </p>
                    ) : (
                      <p>
                        Stream keyboard keys with human-readable names. Mode 1=raw (physical input), 2=constructed frame (after remapping/masking); period clamped 1-1000 frames.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>mode: 1=raw（原始），2=constructed frame（构造帧）; period: 1-1000 帧; () 查询; (0) 禁用</span>
                    ) : (
                      <span>mode: 1=raw, 2=constructed frame; period: 1-1000 frames; () to query; (0) to disable</span>
                    ),
                  },
                  {
                    label: t("Output Format", "输出格式"),
                    content: isCn ? (
                      <p>
                        输出格式：<span className="font-mono">keyboard(raw,shift,'h')</span> 或 <span className="font-mono">keyboard(constructed,ctrl,shift,'a')</span> - 修饰键和按键显示为名称（如 'shift', 'ctrl', 'h', 'a'）而不是 HID 数字。
                      </p>
                    ) : (
                      <p>
                        Output format: <span className="font-mono">keyboard(raw,shift,'h')</span> or <span className="font-mono">keyboard(constructed,ctrl,shift,'a')</span> - modifiers and keys shown as names (e.g., 'shift', 'ctrl', 'h', 'a') instead of HID numbers.
                      </p>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.keyboard(2,50)\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.keyboard(1,100)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="buttons-stream"
              title={t("buttons([mode[,period_ms]]) — GET/SET", "buttons([mode[,period_ms]]) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">buttons([mode[,period_ms]])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>1=raw（原始），2=constructed frame（构造帧）; time_ms: 1-1000ms; (0) 或 (0,0) 重置</span>
                    ) : (
                      <span>1=raw, 2=constructed frame; time_ms: 1-1000ms; (0) or (0,0) to reset</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.buttons(2,25)\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.buttons(1,10)\r\n>>> `} />,
                  },
                ]}
                footer={
                  <div className="space-y-2">
                    <p className="text-sm">
                      {isCn
                        ? "启用后，设备会发送 1 字节掩码："
                        : "When enabled, device emits 1-byte mask:"}
                    </p>
                    <CodeBlock code={`km.buttons<mask_u8>\r\n>>> `} />
                  </div>
                }
              />
            </SubSection>

            <SubSection
              id="axis-stream"
              title={t("axis([mode[,period_ms]]) — GET/SET", "axis([mode[,period_ms]]) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">axis([mode[,period_ms]])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>1=raw（原始），2=constructed frame（构造帧）; period_ms: 1-1000ms; (0) 或 (0,0) 重置</span>
                    ) : (
                      <span>1=raw, 2=constructed frame; period_ms: 1-1000ms; (0) or (0,0) to reset</span>
                    ),
                  },
                  {
                    label: t("Output Format", "输出格式"),
                    content: isCn ? (
                      <p>
                        输出格式：<span className="font-mono">raw(x,y,w)</span> 或 <span className="font-mono">mut(x,y,w)</span>，其中 w 是滚轮增量。
                      </p>
                    ) : (
                      <p>
                        Output format: <span className="font-mono">raw(x,y,w)</span> or <span className="font-mono">mut(x,y,w)</span> where w is the wheel delta.
                      </p>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.axis(1,25)\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.axis(2,10)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection
              id="mouse-stream"
              title={t("mouse([mode[,period_ms]]) — GET/SET", "mouse([mode[,period_ms]]) — GET/SET")}
            >
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">mouse([mode[,period_ms]])</span>,
                  },
                  {
                    label: t("Modes", "模式"),
                    content: isCn ? (
                      <span>1=raw（原始），2=constructed frame（构造帧）; period_ms: 1-1000ms; () 查询; (0) 或 (0,0) 重置</span>
                    ) : (
                      <span>1=raw, 2=constructed frame; period_ms: 1-1000ms; () to query; (0) or (0,0) to reset</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.mouse(2,25)\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.mouse(1,10)\r\n>>> `} />,
                  },
                  {
                    label: t("Streaming format", "流格式"),
                    content: (
                      <div className="space-y-2">
                        <p className="text-sm">
                          {t("Device emits 8-byte binary frame (x,y as int16):", "设备发送 8 字节二进制帧（x,y 为 int16）：")}
                        </p>
                        <CodeBlock code={`km.mouse<8 bytes>\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Position & Screen */}
          <Section id="screen" title={t("Position & Screen", "位置与屏幕")}>
            <SubSection id="screen-cmd" title="screen([W,H]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">screen([width,height])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 查询; (width,height) 设置虚拟屏幕尺寸</span>
                    ) : (
                      <span>() to query; (width,height) to set virtual screen size</span>
                    ),
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

          {/* System Commands */}
          <Section id="system" title={t("System Commands", "系统命令")}>
            <SubSection id="help" title="help() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">help()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Show command list",
                      "显示命令列表",
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.help()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="info" title="info() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">info()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Report system info: MAC address, MCU temperature (when available), RAM stats, firmware info, CPU, and uptime",
                      "报告系统信息：MAC 地址、MCU 温度（可用时）、RAM 统计、固件信息、CPU 和运行时间",
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.info()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="version" title="version() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">version()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Report firmware version",
                      "报告固件版本",
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.version()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="device" title="device() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">device()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Report which device is used more: (keyboard), (mouse), or (none)",
                      "报告使用较多的设备：(keyboard)、(mouse) 或 (none)",
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.device()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="fault" title="fault() — GET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">fault()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        返回存储的解析故障信息，包括 ESP32 MAC 地址、失败的端点地址、接口编号、失败原因和原始 HID 描述符字节。用于调试解析失败的设备。
                      </p>
                    ) : (
                      <p>
                        Returns stored parse fault information including ESP32 MAC address, failed endpoint address, interface number, failure reason, and raw HID descriptor bytes. Useful for debugging devices that fail to parse.
                      </p>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.fault()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="reboot" title="reboot() — SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">reboot()</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: t(
                      "Reboot device (reboots after response)",
                      "重启设备（响应后重启）",
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: <CodeBlock code={`km.reboot()\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="serial" title="serial([text]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">serial([text])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        用于更改连接到 MAKCU 的鼠标或键盘的序列号。此更改是持久的，即使在未来的固件更新后也会保留。注意：MAKCU 不允许为不包含序列号的设备更改序列号。
                      </p>
                    ) : (
                      <p>
                        Used to change the serial number of an attached mouse or keyboard while connected to MAKCU. This change is persistent and remains even after future firmware changes. Note: MAKCU does not allow changing serial numbers for a device that does not contain one.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 查询; (0) 重置; (text) 设置清理后的序列号</span>
                    ) : (
                      <span>() to query; (0) to reset; (text) to set sanitized serial value</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.serial()\r\n>>> km.serial("MAKCU001")\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t("Returns current serial number.", "返回当前序列号。")}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.serial("MAKCU001")\r\n>>> `} />
                        <CodeBlock code={`km.serial(0)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t("Echo ACK. The change is persistent across firmware updates.", "回显 ACK。更改在固件更新后仍然保留。")}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Configuration */}
          <Section id="config" title={t("Configuration", "配置")}>
            <SubSection id="log" title="log([level]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">log([level])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>level: 0-5; 空参数时查询当前级别</span>
                    ) : (
                      <span>level: 0-5; empty to query current level</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.log(3)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="echo" title="echo([enable]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">echo([enable])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>enable: 1=开启，0=关闭; 空参数时查询</span>
                    ) : (
                      <span>enable: 1=on, 0=off; empty to query</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.echo(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="baud" title="baud([rate]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">baud([rate])</span>,
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>
                        rate: 115200 – 4000000; 0=重置为默认115200; 空参数时查询
                      </span>
                    ) : (
                      <span>
                        rate: 115200 – 4000000; 0=reset to default 115200; empty to query
                      </span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.baud(115200)\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.baud(921600)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Applies immediately; host must re-open serial at new speed.",
                            "立即生效；主机需以新波特率重新打开串口。",
                          )}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="bypass" title="bypass([mode]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">bypass([mode])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        禁用 USB 写入并将原始帧流式传输到 COM2。可在未连接 USB 设备的情况下工作。
                      </p>
                    ) : (
                      <p>
                        Disable USB write and stream raw frames to COM2. Works without USB device attached.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - 查询当前状态</li>
                        <li><span className="font-mono">(0)</span> - 关闭（恢复 USB 写入，禁用遥测）</li>
                        <li><span className="font-mono">(1)</span> - 鼠标绕过（启用 <span className="font-mono">km.mouse(1,1)</span> 并禁用 USB 写入）</li>
                        <li><span className="font-mono">(2)</span> - 键盘绕过（启用 <span className="font-mono">km.keyboard(1,1)</span> 并禁用 USB 写入）</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">()</span> - Query current state</li>
                        <li><span className="font-mono">(0)</span> - Off (restore USB write, disable telemetry)</li>
                        <li><span className="font-mono">(1)</span> - Mouse bypass (enables <span className="font-mono">km.mouse(1,1)</span> and disables USB write)</li>
                        <li><span className="font-mono">(2)</span> - Keyboard bypass (enables <span className="font-mono">km.keyboard(1,1)</span> and disables USB write)</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.bypass()\r\n>>> km.bypass(0)\r\n>>> `} />
                        <p className="text-sm text-muted-foreground">
                          {isCn ? (
                            <span>
                              如果未检测到设备，会警告 <span className="font-mono">(no mouse)</span> 或 <span className="font-mono">(no keyboard)</span>
                            </span>
                          ) : (
                            <span>
                              Warns <span className="font-mono">(no mouse)</span> or <span className="font-mono">(no keyboard)</span> if device not detected
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.bypass(1)\r\n>>> `} />
                        <CodeBlock code={`km.bypass(2)\r\n>>> `} />
                        <CodeBlock code={`km.bypass(0)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="hs" title="hs([enable]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">hs([enable])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <span>
                        USB 高速兼容性（用于可能不正确报告轮询率的设备）*持久化设置
                      </span>
                    ) : (
                      <span>
                        USB high-speed compatibility for devices that may not report poll rate correctly *persistent
                      </span>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 查询; (1/0) 启用/禁用</span>
                    ) : (
                      <span>() query; (1/0) enable/disable</span>
                    ),
                  },
                  {
                    label: t("Response", "响应"),
                    content: <CodeBlock code={`km.hs(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="led" title="led([target[,mode[,times,delay_ms]]]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">led([target[,mode[,times,delay_ms]]])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        控制设备和主机两侧的 LED 和 RGB 状态。支持查询、控制和闪烁功能。
                      </p>
                    ) : (
                      <p>
                        Control LED and RGB state for both device and host sides. Supports query, control, and flash functionality.
                      </p>
                    ),
                  },
                  {
                    label: t("Query", "查询"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">led()</span> - 查询设备 LED 状态（向后兼容）</li>
                        <li><span className="font-mono">led(1)</span> - 查询设备 LED 状态</li>
                        <li><span className="font-mono">led(2)</span> - 查询主机 LED 状态（通过 UART）</li>
                        <li>返回：<span className="font-mono">(device,off)</span>、<span className="font-mono">(device,on)</span>、<span className="font-mono">(device,slow_blink)</span>、<span className="font-mono">(device,fast_blink)</span>、<span className="font-mono">(host,off)</span>、<span className="font-mono">(host,on)</span> 等</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">led()</span> - Query device LED state (backward compatible)</li>
                        <li><span className="font-mono">led(1)</span> - Query device LED state</li>
                        <li><span className="font-mono">led(2)</span> - Query host LED state (via UART)</li>
                        <li>Returns: <span className="font-mono">(device,off)</span>, <span className="font-mono">(device,on)</span>, <span className="font-mono">(device,slow_blink)</span>, <span className="font-mono">(device,fast_blink)</span>, <span className="font-mono">(host,off)</span>, <span className="font-mono">(host,on)</span>, etc.</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Control", "控制"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">led(0)</span> - 关闭设备 LED（向后兼容）</li>
                        <li><span className="font-mono">led(1)</span> - 打开设备 LED（向后兼容，但与查询冲突 - 使用 <span className="font-mono">led(1,1)</span> 进行显式控制）</li>
                        <li><span className="font-mono">led(1, 0)</span> - 关闭设备 LED</li>
                        <li><span className="font-mono">led(1, 1)</span> - 打开设备 LED</li>
                        <li><span className="font-mono">led(2, 0)</span> - 关闭主机 LED（通过 UART）</li>
                        <li><span className="font-mono">led(2, 1)</span> - 打开主机 LED（通过 UART）</li>
                        <li><strong>Target:</strong> <span className="font-mono">1</span> = 设备 LED，<span className="font-mono">2</span> = 主机 LED（USB 主机侧，通过 UART 控制）</li>
                        <li><strong>Mode:</strong> <span className="font-mono">0</span> = 关闭，<span className="font-mono">1</span> = 打开</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">led(0)</span> - Turn device LED off (backward compatible)</li>
                        <li><span className="font-mono">led(1)</span> - Turn device LED on (backward compatible, but conflicts with query - use <span className="font-mono">led(1,1)</span> for explicit control)</li>
                        <li><span className="font-mono">led(1, 0)</span> - Turn device LED off</li>
                        <li><span className="font-mono">led(1, 1)</span> - Turn device LED on</li>
                        <li><span className="font-mono">led(2, 0)</span> - Turn host LED off (via UART)</li>
                        <li><span className="font-mono">led(2, 1)</span> - Turn host LED on (via UART)</li>
                        <li><strong>Target:</strong> <span className="font-mono">1</span> = device LED, <span className="font-mono">2</span> = host LED (USB host side, controlled via UART)</li>
                        <li><strong>Mode:</strong> <span className="font-mono">0</span> = off, <span className="font-mono">1</span> = on</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Flash", "闪烁"),
                    content: isCn ? (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">led(1, times, delay_ms)</span> - 闪烁设备 LED（例如，<span className="font-mono">led(1, 3, 200)</span> = 3 次闪烁，每次 200ms）</li>
                        <li><span className="font-mono">led(2, times, delay_ms)</span> - 闪烁主机 LED（例如，<span className="font-mono">led(2, 5, 100)</span> = 5 次闪烁，每次 100ms）</li>
                        <li><strong>Flash parameters:</strong> <span className="font-mono">times</span> = 闪烁次数（默认 1），<span className="font-mono">delay_ms</span> = 闪烁之间的延迟（毫秒）（默认 100ms，最大 5000ms）</li>
                      </ul>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><span className="font-mono">led(1, times, delay_ms)</span> - Flash device LED (e.g., <span className="font-mono">led(1, 3, 200)</span> = 3 flashes at 200ms)</li>
                        <li><span className="font-mono">led(2, times, delay_ms)</span> - Flash host LED (e.g., <span className="font-mono">led(2, 5, 100)</span> = 5 flashes at 100ms)</li>
                        <li><strong>Flash parameters:</strong> <span className="font-mono">times</span> = number of flashes (default 1), <span className="font-mono">delay_ms</span> = delay between flashes in milliseconds (default 100ms, max 5000ms)</li>
                      </ul>
                    ),
                  },
                  {
                    label: t("Examples", "示例"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.led()\r\n>>> km.led(device,on)\r\n>>> `} />
                        <CodeBlock code={`km.led(2)\r\n>>> km.led(host,off)\r\n>>> `} />
                        <CodeBlock code={`km.led(1, 0)\r\n>>> `} />
                        <CodeBlock code={`km.led(2, 1)\r\n>>> `} />
                        <CodeBlock code={`km.led(1, 3, 200)\r\n>>> `} />
                        <CodeBlock code={`km.led(2, 5, 100)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="release" title="release([timer_ms]) — GET/SET">
              <SpecCard
                entries={[
                  {
                    label: t("Command", "命令"),
                    content: <span className="font-mono">release([timer_ms])</span>,
                  },
                  {
                    label: t("Description", "描述"),
                    content: isCn ? (
                      <p>
                        自动释放监控系统。持续监控独立的锁定、按键和键状态。当计时器到期时，仅释放仍处于活动状态的相应值（不是全部）。该设置会持久保存到存储中，并在启动/引导时自动启用。`()` 获取状态（0=禁用，否则为时间 ms）；`(timer_ms)` 设置计时器 500-300000ms（5 分钟），(0) 禁用。
                      </p>
                    ) : (
                      <p>
                        Auto-release monitoring system. Continuously monitors independent lock, button, and key states. When the timer expires, it releases only the corresponding values that remain active (not all at once). This setting is persistently saved to storage and automatically enabled on startup/boot. `()` get status (0=disabled, else time ms); `(timer_ms)` set timer 500-300000ms (5 min), (0) disables.
                      </p>
                    ),
                  },
                  {
                    label: t("Params", "参数"),
                    content: isCn ? (
                      <span>() 获取状态; (timer_ms) 设置计时器 500-300000ms，(0) 禁用</span>
                    ) : (
                      <span>() get status; (timer_ms) set timer 500-300000ms, (0) disables</span>
                    ),
                  },
                  {
                    label: t("Response (GET)", "响应 (GET)"),
                    content: <CodeBlock code={`km.release()\r\n>>> `} />,
                  },
                  {
                    label: t("Response (SET)", "响应 (SET)"),
                    content: (
                      <div className="space-y-2">
                        <CodeBlock code={`km.release(5000)\r\n>>> `} />
                        <CodeBlock code={`km.release(0)\r\n>>> `} />
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          {/* Functions Without USB Device */}
          <Section
            id="no-usb"
            title={t("Functions That Work Without USB Device Attached", "无需 USB 设备即可工作的函数")}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {isCn ? (
                    <span>
                      以下命令在未连接 USB 设备到 USB 3 时也能工作：
                    </span>
                  ) : (
                    <span>
                      The following commands work without a USB device attached to USB 3:
                    </span>
                  )}
                </p>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li><span className="font-mono">km.baud()</span></li>
                  <li><span className="font-mono">km.bypass()</span></li>
                  <li><span className="font-mono">km.echo()</span></li>
                  <li><span className="font-mono">km.fault()</span></li>
                  <li><span className="font-mono">km.help()</span></li>
                  <li><span className="font-mono">km.info()</span></li>
                  <li><span className="font-mono">km.led()</span></li>
                  <li><span className="font-mono">km.log()</span></li>
                  <li><span className="font-mono">km.reboot()</span></li>
                  <li><span className="font-mono">km.screen()</span></li>
                  <li><span className="font-mono">km.serial()</span></li>
                  <li><span className="font-mono">km.version()</span></li>
                </ul>
              </CardContent>
            </Card>
          </Section>

          {/* Baud Binary */}
          <Section
            id="baud-binary"
            title={t("Baud Rate Change (Binary)", "波特率变更（二进制）")}
          >
            <SpecCard
              entries={[
                {
                  label: t("Purpose", "用途"),
                  content: isCn ? (
                    <span>通过二进制帧设置 UART 波特率（无 ASCII 指令）。</span>
                  ) : (
                    <span>Set UART baud rate using a binary frame (no ASCII command).</span>
                  ),
                },
                {
                  label: t("Frame", "帧格式"),
                  content: <span className="font-mono">DE AD &lt;lenLE:2&gt; &lt;cmd:0xA5&gt; &lt;baud_rate:LE32&gt;</span>,
                },
                {
                  label: t("Example (115200)", "示例 (115200)"),
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`DE AD 05 00 A5 00 C2 01 00`} />
                      <p className="text-sm text-muted-foreground">
                        {isCn ? (
                          <span>
                            解析：<span className="font-mono">DE AD</span> ｜ <span className="font-mono">05 00</span>
                            （长度=5）｜ <span className="font-mono">A5</span>（命令）｜
                            <span className="font-mono">00 C2 01 00</span>（115200 小端）
                          </span>
                        ) : (
                          <span>
                            Breakdown: <span className="font-mono">DE AD</span> | <span className="font-mono">05 00</span>
                            (len=5) | <span className="font-mono">A5</span> (cmd) |
                            <span className="font-mono">00 C2 01 00</span> (115200 LE)
                          </span>
                        )}
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          {/* Limits & Parsing */}
          <Section
            id="limits"
            title={t("Limits & Parsing", "限制与解析")}
          >
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>
                    {isCn ? (
                      <span>
                        贝塞尔分段：<strong>最大 512</strong>
                      </span>
                    ) : (
                      <span>
                        Bézier segments: <strong>max 512</strong>
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        移动：<strong>int16</strong>
                      </span>
                    ) : (
                      <span>
                        Movement: <strong>int16</strong>
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
                    {isCn ? (
                      <span>
                        键盘命令支持数字 HID 码或引号字符串（'a', "enter"）
                      </span>
                    ) : (
                      <span>
                        Keyboard commands support numeric HID codes or quoted strings ('a', "enter")
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        支持的按键名称：a-z, 0-9, enter, esc, tab, space, shift, ctrl, alt, gui, F1-F12, 方向键等
                      </span>
                    ) : (
                      <span>
                        Supported key names: a-z, 0-9, enter, esc, tab, space, shift, ctrl, alt, gui, F1-F12, arrow keys, etc.
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        <span className="font-mono">echo(0)</span> 会抑制大多数 setter 回显；GET 仍会返回
                      </span>
                    ) : (
                      <span>
                        <span className="font-mono">echo(0)</span> suppresses most setter echoes; GETs still reply
                      </span>
                    )}
                  </li>
                  <li>
                    {isCn ? (
                      <span>
                        波特率范围：<strong>115200–4000000</strong>; <span className="font-mono">baud(0)</span> 重置为 115200
                      </span>
                    ) : (
                      <span>
                        Baud range: <strong>115200–4000000</strong>; <span className="font-mono">baud(0)</span> resets to 115200
                      </span>
                    )}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Section>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-6 py-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>{t("API version 3.9", "API 版本 3.9")}</span>
            <span>makcu 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
