import { useEffect, useMemo, useState } from "react";
import { NAV_GROUPS } from "../pages/registry";

/* ============================================================
   Cinematic backplates — one 4K plate per document group,
   crossfaded on navigation and kept alive by a slow Ken Burns
   drift. If a plate ever fails to load, the navy base beneath
   simply shows through — the document never breaks.
   ============================================================ */

const PLATES: Record<string, string> = {
  system:
    "https://image.qwenlm.ai/generated-images/f85004dc-19d6-4904-8f54-426913efbdd3/_result.png",
  foundations:
    "https://image.qwenlm.ai/generated-images/031a0c9d-cce7-4b7c-b989-ac6f714b99c6/_result.png",
  models:
    "https://image.qwenlm.ai/generated-images/f8cd6dc5-6b4b-4389-bace-21f8f584b24a/_result.png",
  intelligence:
    "https://image.qwenlm.ai/generated-images/c06e1ca6-0f66-423f-a477-db113ceee26e/_result.png",
  application:
    "https://image.qwenlm.ai/generated-images/c80a925a-5049-4c01-b3d4-f1bbc96d77c3/_result.png",
  defense:
    "https://image.qwenlm.ai/generated-images/b0b72737-4f19-431e-ab9d-4cae417e8d0d/_result.png",
};

function groupFor(path: string): string {
  if (path.startsWith("/system") || path === "/auth") return "system";
  const g = NAV_GROUPS.find((gr) => gr.paths.includes(path));
  return g?.key ?? "foundations";
}

export default function Backplates({ path }: { path: string }) {
  const group = groupFor(path);
  const [slots, setSlots] = useState<{ url: string; on: boolean }[]>([
    { url: PLATES[group], on: true },
  ]);

  useEffect(() => {
    const url = PLATES[group];
    setSlots((prev) => {
      if (prev.some((s) => s.url === url && s.on)) return prev;
      // mount the new plate dark, then fade it in; fade the old one out
      return [...prev.map((s) => ({ ...s, on: false })), { url, on: true }];
    });
    const t = window.setTimeout(() => {
      setSlots((prev) => prev.filter((s) => s.on));
    }, 1700);
    return () => window.clearTimeout(t);
  }, [group]);

  const veil = useMemo(() => <div className="backplate-veil" aria-hidden="true" />, []);

  return (
    <div className="backplate-layer" aria-hidden="true">
      {slots.map((s) => (
        <img
          key={s.url}
          src={s.url}
          alt=""
          draggable={false}
          className={`backplate-img kenburns ${s.on ? "on" : ""}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ))}
      {veil}
    </div>
  );
}
