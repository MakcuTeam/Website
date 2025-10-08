import { Card, CardContent } from "@/components/ui/card";
import Copy from "@/components/markdown/copy";
import type { LangProps } from "@/lib/dictionaries";
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

const toc: TocItem[] = [
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
];

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
  return {
    title: "MAKCU API — KM Host Protocol",
    description:
      "Protocol reference for MAKCU KM Host API, covering transport details, button controls, motion, streaming, and maintenance commands.",
    alternates: {
      canonical: `/${lang}/api`,
    },
  };
}

export default async function ApiPage({ params }: LangProps) {
  const { lang } = await params;

  return (
    <div className="flex flex-col pb-20">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_60%)]" />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            Reference
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">MAKCU API</h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            KM Host Protocol — v3.8 · Comprehensive command reference for the MAKCU ecosystem.
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24">
          <Card className="border-border/60 bg-card/90 shadow-lg">
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Contents
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
            badge="Protocol"
            title="Transport & Framing"
            lead={
              <span>
                All replies start with <code className="rounded-md bg-muted px-1 py-0.5 text-xs">km.</code> and end with
                <strong className="px-1">CRLF</strong> followed by the prompt
                <code className="rounded-md bg-muted px-1 py-0.5 text-xs">&gt;&gt;&gt; </code>.
              </span>
            }
          >
            <Tip>
              TX samples below show the final prompt as <code className="font-mono">\r\n&gt;&gt;&gt; </code>.
            </Tip>
            <SpecCard
              entries={[
                {
                  label: "RX (Host → Device)",
                  content: (
                    <ul className="list-disc space-y-2 pl-5">
                      <li>
                        ASCII commands, e.g. <span className="font-mono">move(10,-3)</span>, terminated by
                        <span className="font-mono"> \r</span>/<span className="font-mono">\n</span>/<span className="font-mono">;</span>
                      </li>
                      <li>
                        Optional binary frame: <span className="font-mono">DE AD &lt;lenLE:2&gt; &lt;ASCII or binary payload&gt;</span>
                      </li>
                    </ul>
                  ),
                },
                {
                  label: "TX (Device → Host)",
                  content: (
                    <ul className="list-disc space-y-2 pl-5">
                      <li>
                        Format: <span className="font-mono">km.</span>
                        <em>payload</em>
                        <span className="font-mono">\r\n&gt;&gt;&gt; </span>
                      </li>
                      <li>
                        Setters echo the input as ACK unless suppressed by <span className="font-mono">echo(0)</span>.
                      </li>
                    </ul>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="buttons" badge="Mouse" title="Buttons">
            <SubSection id="buttons-status" title="Button status (GET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">left() | right() | middle() | side1() | side2()</span>,
                  },
                  {
                    label: "Response (GET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.left(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          State bit view: 0=none, 1=physical, 2=software, 3=both.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="buttons-actuation" title="Button actuation (SET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">left(n) / right(n) / middle(n) / side1(n) / side2(n)</span>,
                  },
                  {
                    label: "Params",
                    content: (
                      <span className="font-mono">
                        First digit char parsed as int (digits map to their numeric value, e.g. 0→0, 1→1).
                      </span>
                    ),
                  },
                  {
                    label: "Response (SET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.left(1)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          Echo ACK (subject to <span className="font-mono">echo(0|1)</span>).
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="buttons-lock" title="Button lock (GET/SET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">lock_ml(), lock_mr(), lock_mm(), lock_ms1(), lock_ms2()</span>,
                  },
                  {
                    label: "Response (GET)",
                    content: <CodeBlock code={`km.lock_ml()\n0\r\n>>> `} />,
                  },
                  {
                    label: "Response (SET)",
                    content: <CodeBlock code={`km.lock_ml(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="buttons-catch" title="Button catch (GET/SET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">catch_ml(), catch_mr(), catch_mm(), catch_ms1(), catch_ms2()</span>,
                  },
                  {
                    label: "Params",
                    content: (
                      <span className="font-mono">SET: 0=auto, 1=manual (button must be locked)</span>
                    ),
                  },
                  {
                    label: "Response (GET)",
                    content: <CodeBlock code={`km.catch_ml()\n0\r\n>>> `} />,
                  },
                  {
                    label: "Response (SET)",
                    content: (
                      <p className="text-sm">
                        No immediate ACK (async). Poll with GET to confirm state.
                      </p>
                    ),
                  },
                ]}
              />
            </SubSection>

            <SubSection id="buttons-global" title="Buttons — global enable (GET/SET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">buttons() / buttons(0|1)</span>,
                  },
                  {
                    label: "Response (GET)",
                    content: <CodeBlock code={`km.buttons()\n1\r\n>>> `} />,
                  },
                  {
                    label: "Response (SET)",
                    content: <CodeBlock code={`km.buttons(0)\r\n>>> `} />,
                  },
                ]}
                footer={
                  <div className="space-y-2">
                    <p>
                      when enabled, users mouse buttons will submit a button mask change of
                      buttons, this will run decoupled from the main command (like km.catch):
                    </p>
                    <CodeBlock code={`km.<mask>\r\n>>> `} />
                  </div>
                }
              />
            </SubSection>
          </Section>

          <Section id="locks" badge="Mouse" title="Locks">
            <SubSection id="locks-whole" title="Whole-axis locks (GET/SET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: (
                      <span className="font-mono">
                        lock_mx(), lock_my() / lock_mx(0|1), lock_my(0|1)
                      </span>
                    ),
                  },
                  {
                    label: "Response (GET)",
                    content: <CodeBlock code={`km.lock_mx()\n0\r\n>>> `} />,
                  },
                  {
                    label: "Response (SET)",
                    content: <CodeBlock code={`km.lock_mx(1)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="locks-directional" title="Directional locks (GET/SET)">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: (
                      <span className="font-mono">lock_mx+(), lock_mx-(), lock_my+(), lock_my-()</span>
                    ),
                  },
                  {
                    label: "Response (GET)",
                    content: <CodeBlock code={`km.lock_my+()\n1\r\n>>> `} />,
                  },
                  {
                    label: "Response (SET)",
                    content: <CodeBlock code={`km.lock_my-(0)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section id="motion" badge="Motion" title="Motion">
            <SubSection id="move" title="move(x,y[,seg][,cx1,cy1[,cx2,cy2]]) — SET">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">move(x,y[,seg][,cx1,cy1[,cx2,cy2]])</span>,
                  },
                  {
                    label: "Params",
                    content: (
                      <p>
                        x,y: int16; seg ≥ 1 (default 1, max 512); optional cubic Bézier controls. If only segments are
                        provided (no control points), a random 2-point control curve is generated. If only (cx1,cy1) is
                        provided it is duplicated.
                      </p>
                    ),
                  },
                  {
                    label: "Response (SET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.move(10,-3)\r\n>>> `} />
                        <CodeBlock code={`km.move(100,50,8,40,25,80,10)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">Both return the input echo (ACK).</p>
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
                    label: "Command",
                    content: <span className="font-mono">moveto(X,Y[,seg][,cx1,cy1[,cx2,cy2]])</span>,
                  },
                  {
                    label: "Notes",
                    content: (
                      <p>
                        Clamped to screen; queued as absolute (internally relative). Special:
                        <span className="font-mono"> moveto(0,0)</span> with seg=1 and no controls triggers calibration.
                      </p>
                    ),
                  },
                  {
                    label: "Response (SET)",
                    content: <CodeBlock code={`km.moveto(640,360)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>

            <SubSection id="wheel" title="wheel(w) — SET">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">wheel(w)</span>,
                  },
                  {
                    label: "Params",
                    content: <span className="font-mono">w: int8</span>,
                  },
                  {
                    label: "Response (SET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.wheel(-5)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">Echo ACK.</p>
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
                    label: "Command",
                    content: <span className="font-mono">silent(x,y)</span>,
                  },
                  {
                    label: "Params",
                    content: <span className="font-mono">Two-frame silent click at (x,y)</span>,
                  },
                  {
                    label: "Response (SET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.silent(400,300)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">Echo ACK.</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section id="posscreen" badge="Screen" title="Position & Screen">
            <SubSection id="getpos" title="getpos() — GET">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">getpos()</span>,
                  },
                  {
                    label: "Response (GET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.(123,456)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          Absolute position (clamped to <span className="font-mono">screen(W,H)</span>).
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
                    label: "Command",
                    content: <span className="font-mono">screen() / screen(W,H)</span>,
                  },
                  {
                    label: "Response (GET)",
                    content: <CodeBlock code={`km.screen(1920,1080)\r\n>>> `} />,
                  },
                  {
                    label: "Response (SET)",
                    content: <CodeBlock code={`km.screen(2560,1440)\r\n>>> `} />,
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section id="axisstream" badge="Streaming" title="Axis streaming (GET/SET)">
            <SpecCard
              entries={[
                {
                  label: "Command",
                  content: <span className="font-mono">axis() / axis(mode[,period_ms])</span>,
                },
                {
                  label: "Params (SET)",
                  content: (
                    <span className="font-mono">
                      mode: 0=off, 1=abs, 2=rel, 3=act; period: 1..1000 (kept if omitted)
                    </span>
                  ),
                },
                {
                  label: "Response (GET)",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.rel\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">
                        Mode name only: <span className="font-mono">km.off</span> | <span className="font-mono">km.abs</span> |
                        <span className="font-mono"> km.rel</span> | <span className="font-mono">km.act</span>.
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Response (SET)",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.abs\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">Mode name only (not an echo).</p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="click-helper" badge="Helpers" title="Click helper — SET">
            <SpecCard
              entries={[
                {
                  label: "Command",
                  content: <span className="font-mono">click(button_index, count[, delay_ms])</span>,
                },
                {
                  label: "Params",
                  content: (
                    <span className="font-mono">
                      button_index: 1=left, 2=right, 3=middle, 4=side1, 5=side2; count ≥ 1; delay_ms ≥ 1 (default 1)
                    </span>
                  ),
                },
                {
                  label: "Response (SET)",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.click(1,2,25)\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">Echo ACK.</p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="version-serial" badge="Identity" title="Version & Serial">
            <SubSection id="version" title="version() — GET">
              <SpecCard
                entries={[
                  {
                    label: "Command",
                    content: <span className="font-mono">version()</span>,
                  },
                  {
                    label: "Response (GET)",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.MAKCU\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">Concise firmware identifier.</p>
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
                    label: "Command",
                    content: <span className="font-mono">serial() / serial(0) / serial(&lt;str&gt;)</span>,
                  },
                  {
                    label: "Response (GET) — one of",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.Original Serial: ABC12345\r\n>>> `} />
                        <CodeBlock code={`km.Spoofed Serial: XYZ00001\r\n>>> `} />
                        <CodeBlock code={`km.Mouse does not have a serial number\r\n>>> `} />
                      </div>
                    ),
                  },
                  {
                    label: "Response (SET) — clear",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.serial(0)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          Echo ACK on success; otherwise “no serial” line.
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: "Response (SET) — set spoof",
                    content: (
                      <div className="space-y-3">
                        <CodeBlock code={`km.serial(MY-SN-01)\r\n>>> `} />
                        <p className="text-xs text-muted-foreground">
                          Max 20 chars. Stored in NVS and persists across firmware changes. Up to 12 devices can be saved.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </SubSection>
          </Section>

          <Section id="echo" badge="I/O" title="Echo control (GET/SET)">
            <SpecCard
              entries={[
                {
                  label: "Command",
                  content: <span className="font-mono">echo() / echo(0|1)</span>,
                },
                {
                  label: "Response (GET)",
                  content: <CodeBlock code={`km.echo(1)\r\n>>> `} />,
                },
                {
                  label: "Response (SET)",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`km.echo(0)\r\n>>> `} />
                      <p className="text-xs text-muted-foreground">
                        Applies immediately; with <span className="font-mono">echo(0)</span>, setter echoes are suppressed (GETs
                        unaffected).
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="keyboard" badge="Keyboard" title="Keyboard">
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Coming soon.
              </CardContent>
            </Card>
          </Section>

          <Section id="limits" badge="Spec" title="Limits & Parsing">
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Bézier segments: default 1, <strong>max 512</strong></li>
                  <li>Movement integers: <strong>int16</strong> with saturation</li>
                  <li>Wheel: <strong>int8</strong></li>
                  <li>
                    Legacy ASCII terminators: <span className="font-mono">\r</span>, <span className="font-mono">\n</span>,
                    <span className="font-mono"> ;</span>
                  </li>
                  <li>
                    Binary RX supported: <span className="font-mono">DE AD &lt;lenLE&gt; &lt;payload&gt;</span>
                  </li>
                  <li>
                    <span className="font-mono">echo(0)</span> suppresses most setter echoes; GETs still reply
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Section>

          <Section id="baud-binary" badge="Serial" title="Baud Rate (Binary RX)">
            <SpecCard
              entries={[
                {
                  label: "Purpose",
                  content: (
                    <span className="font-mono">
                      Set UART baud rate using a binary frame (no ASCII command).
                    </span>
                  ),
                },
                {
                  label: "Frame",
                  content: <span className="font-mono">DE AD &lt;lenLE:2&gt; &lt;cmd:0xA5&gt; &lt;baud_rate:LE32&gt;</span>,
                },
                {
                  label: "Header",
                  content: <span className="font-mono">DE AD</span>,
                },
                {
                  label: "Length",
                  content: (
                    <span className="font-mono">
                      u16 little-endian (payload bytes only). For this command: <strong>5</strong> (1 cmd + 4 baud)
                    </span>
                  ),
                },
                {
                  label: "Command",
                  content: <span className="font-mono">0xA5 (baud rate set)</span>,
                },
                {
                  label: "Payload",
                  content: (
                    <span className="font-mono">
                      uint32_t <strong>baud_rate</strong> (little-endian). Example: 115200 → 00 C2 01 00
                    </span>
                  ),
                },
                {
                  label: "Example (115200)",
                  content: (
                    <div className="space-y-3">
                      <CodeBlock code={`DE AD 05 00 A5 00 C2 01 00`} />
                      <p className="text-xs text-muted-foreground">
                        Breakdown: <span className="font-mono">DE AD</span> | <span className="font-mono">05 00</span> (len=5) |
                        <span className="font-mono"> A5</span> (cmd) | <span className="font-mono">00 C2 01 00</span> (115200 LE)
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Effect",
                  content: (
                    <span className="font-mono">
                      Applies immediately; host must re-sync serial port at the new speed.
                    </span>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="tips" badge="Notes" title="Tips">
            <Card className="border-border/60 bg-card/90 shadow-lg">
              <CardContent className="p-6 text-sm text-muted-foreground">
                The <span className="font-mono">km.axis</span> function can fully decouple mouse movement. Combined with X/Y axis
                locks, this isolates user inputs from the host for seamless programmatic control.
              </CardContent>
            </Card>
          </Section>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-6 py-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>API version 3.8</span>
            <span>makcu 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
