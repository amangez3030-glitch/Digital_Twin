import type { ReactNode } from "react";
import { useReveal } from "../hooks";

/* ---------- Reveal wrapper ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- Corner ticks ---------- */
export function Corners({ color }: { color?: string }) {
  const c = color ?? undefined;
  return (
    <>
      <span className="corner tl" style={c ? { borderColor: c } : undefined} />
      <span className="corner tr" style={c ? { borderColor: c } : undefined} />
      <span className="corner bl" style={c ? { borderColor: c } : undefined} />
      <span className="corner br" style={c ? { borderColor: c } : undefined} />
    </>
  );
}

/* ---------- Section shell ---------- */
export function Section({
  id,
  index,
  kicker,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-5 pt-24 sm:px-8 md:pt-32">
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span className="display-head text-5xl text-line2 sm:text-7xl" aria-hidden="true">
            {index}
          </span>
          <div className="min-w-0">
            <p className="mono-label text-cyan">{kicker}</p>
            <h2 className="display-head mt-2 text-3xl text-ink sm:text-4xl md:text-[2.6rem]">{title}</h2>
          </div>
        </div>
        {intro && (
          <p className="mt-5 max-w-3xl border-l-2 border-line2 pl-4 text-[15px] leading-relaxed text-dim">
            {intro}
          </p>
        )}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-line2 via-line to-transparent" />
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}

/* ---------- Chips & tags ---------- */
export function Tag({
  tone = "cyan",
  children,
}: {
  tone?: "cyan" | "amber" | "green" | "rose" | "dim";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    cyan: "border-cyan/40 text-cyan",
    amber: "border-amber/40 text-amber",
    green: "border-green/40 text-green",
    rose: "border-rose/40 text-rose",
    dim: "border-line2 text-dim",
  };
  return (
    <span
      className={`mono-label inline-block border px-2 py-[3px] text-[9.5px] leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PriorityTag({ p }: { p: "MUST" | "SHOULD" | "COULD" }) {
  const tone = p === "MUST" ? "amber" : p === "SHOULD" ? "cyan" : "dim";
  return <Tag tone={tone as "amber" | "cyan" | "dim"}>{p}</Tag>;
}

export function LayerTag({ l }: { l: string }) {
  return (
    <span className="mono-label inline-block bg-panel2 px-2 py-[3px] text-[9.5px] leading-none text-dim">
      {l}
    </span>
  );
}

/* ---------- difficulty blocks ---------- */
export function DiffBlocks({ n }: { n: number }) {
  return (
    <span className="inline-flex items-end gap-[3px]" title={`Difficulty ${n}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-[7px] ${i <= n ? "bg-amber" : "bg-line"}`}
          style={{ height: `${6 + i * 2}px` }}
        />
      ))}
    </span>
  );
}

/* ---------- custom inline SVG glyphs ---------- */
export function Glyph({ kind, className = "h-5 w-5" }: { kind: string; className?: string }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: "square" as const,
  };
  switch (kind) {
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M12 3 L20 6 V12 C20 17 16.5 20 12 21.5 C7.5 20 4 17 4 12 V6 Z" />
          <path d="M8.5 12 L11 14.5 L15.5 9.5" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M12 4 V20 M7 20 H17 M12 6 L5 8 M12 6 L19 8" />
          <path d="M5 8 L2.5 13 H7.5 Z M19 8 L16.5 13 H21.5 Z" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M2 12 C5 6.5 9 4.5 12 4.5 C15 4.5 19 6.5 22 12 C19 17.5 15 19.5 12 19.5 C9 19.5 5 17.5 2 12 Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "key":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <circle cx="8" cy="12" r="4.5" />
          <path d="M12.5 12 H21 M18 12 V15.5 M15 12 V14.5" />
        </svg>
      );
    case "split":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M4 12 H10 M10 12 C14 12 14 6 19 6 M10 12 C14 12 14 18 19 18" />
          <path d="M17 4 L19 6 L17 8 M17 16 L19 18 L17 20" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M6 3 H15 L19 7 V21 H6 Z M15 3 V7 H19" />
          <path d="M9 12 H16 M9 15.5 H16 M9 8.5 H12" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M2 15 C4 9 6 9 8 12 C10 15 12 18 14 14 C16 10 18 8 22 9" />
          <path d="M2 19 H22" opacity="0.4" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <rect x="3" y="5" width="18" height="14" />
          <path d="M3 9.5 H21 M6.5 14 H11" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <rect x="4" y="4" width="16" height="16" />
        </svg>
      );
  }
}
