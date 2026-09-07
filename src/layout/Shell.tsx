import { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { DOC_META } from "../data/design";
import { PAGES, NAV_GROUPS, SYS_LINKS, pageByPath } from "../pages/registry";
import { clearSession, getSession, type SessionUser } from "../lib/auth";
import { useTilt } from "../hooks";
import Backplates from "../components/Backplates";
import ParticleField from "../components/ParticleField";
import VideoBackdrop from "../components/VideoBackdrop";

/* ---------- document-wide state (the final seal + workspace session) ---------- */

const DocCtx = createContext<{
  sealed: boolean;
  seal: () => void;
  user: SessionUser | null;
  logout: () => void;
}>({
  sealed: false,
  seal: () => undefined,
  user: null,
  logout: () => undefined,
});

export const useDoc = () => useContext(DocCtx);

/* ---------- scroll restoration on route change ---------- */

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

/* ---------- shared bits ---------- */

function CrosshairMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3.5" y="3.5" width="17" height="17" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SealMeter({ sealed }: { sealed: boolean }) {
  const pct = sealed ? 100 : Math.round((17 / 18) * 100);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="mono-label text-[8px] text-faint">GATE PROGRESS</p>
        <p className={`mono-label text-[8px] ${sealed ? "text-green" : "text-amber"}`}>{sealed ? "18/18" : "17/18"}</p>
      </div>
      <div className="mt-1.5 h-[3px] w-full bg-line/50">
        <div
          className={`h-full transition-all duration-700 ${sealed ? "bg-green" : "bg-amber"}`}
          style={{ width: `${pct}%`, boxShadow: `0 0 8px ${sealed ? "rgba(124,231,165,0.6)" : "rgba(255,194,102,0.5)"}` }}
        />
      </div>
    </div>
  );
}

function UserChip({ user, onLogout, compact = false }: { user: SessionUser; onLogout: () => void; compact?: boolean }) {
  return (
    <div className="group flex items-center gap-2.5 border border-line/80 bg-base/50 p-2.5 transition-colors duration-200 hover:border-cyan/40">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[12px] font-bold ${
          user.kind === "supervisor" ? "bg-amber/20 text-amber" : "bg-cyan/20 text-cyan"
        }`}
      >
        {user.name.trim().charAt(0).toUpperCase()}
      </span>
      {!compact && (
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11.5px] text-ink">{user.name}</span>
          <span className="mono-label text-[7.5px] text-faint">
            {user.kind === "supervisor" ? "REVIEW CLEARANCE" : "LOCAL WORKSPACE"} · ON-DEVICE
          </span>
        </span>
      )}
      <button
        onClick={onLogout}
        title="Sign out of the local workspace"
        className="mono-label shrink-0 border border-line/70 px-2 py-1 text-[8px] text-faint transition-all duration-200 hover:border-rose/60 hover:bg-rose/10 hover:text-rose"
      >
        OUT
      </button>
    </div>
  );
}

/* ---------- the sheet index (used by sidebar + drawer) ---------- */

function SheetNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Document sheets" className="flex flex-col gap-4">
      {/* the product itself */}
      <div className="border border-cyan/30 bg-cyan/[0.05] p-2">
        <p className="mono-label mb-1.5 flex items-center gap-2 px-1 text-[7.5px] tracking-[0.28em] text-cyan">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
          </span>
          THE SYSTEM · LIVE
        </p>
        <div className="flex flex-col gap-0.5">
          {SYS_LINKS.map((l) => {
            const active = pathname === l.path;
            return (
              <Link
                key={l.path}
                to={l.path}
                onClick={onNavigate}
                className={`mono-label flex items-center gap-2 px-2 py-1.5 text-[9px] tracking-[0.12em] transition-all duration-200 ${
                  active ? "bg-cyan/15 text-cyan" : "text-dim hover:bg-cyan/[0.06] hover:text-ink"
                }`}
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 3.5 10.5 8 6 12.5" />
                </svg>
                {l.label.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mono-label px-2 pt-1 text-[7.5px] tracking-[0.28em] text-faint">DESIGN DOSSIER — THE EXPLANATION</p>
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mono-label mb-1.5 px-2 text-[7.5px] tracking-[0.28em] text-faint">{g.label}</p>
          <div className="flex flex-col gap-0.5">
            {g.paths.map((path) => {
              const p = PAGES.find((x) => x.path === path)!;
              return (
                <NavLink
                  key={p.path}
                  to={p.path}
                  end={p.path === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 px-2 py-2 transition-all duration-200 ${
                      isActive ? "bg-cyan/[0.07]" : "hover:bg-cyan/[0.04]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute inset-y-1 left-0 w-[2.5px] origin-top transition-transform duration-300 ${
                          isActive ? "scale-y-100 bg-cyan" : "scale-y-0 bg-line group-hover:scale-y-50"
                        }`}
                      />
                      <span
                        className={`mono-label w-6 shrink-0 text-center text-[9px] ${
                          isActive ? "text-amber" : "text-faint group-hover:text-dim"
                        }`}
                      >
                        {p.code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`mono-label block text-[10px] tracking-[0.12em] ${
                            isActive ? "text-cyan" : "text-dim group-hover:text-ink"
                          }`}
                        >
                          {p.label.toUpperCase()}
                        </span>
                        <span className="mono-label block truncate text-[7.5px] text-faint">{p.phases} · {p.revs}</span>
                      </span>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          p.status === "APPROVED" ? "bg-green/70" : "bg-amber/80"
                        }`}
                        title={p.status}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ---------- desktop sidebar ---------- */

function Sidebar({ prog }: { prog: number }) {
  const { sealed, user, logout } = useDoc();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-line bg-[#0a1424]/95 lg:flex">
      {/* masthead */}
      <Link to="/" className="group flex items-center gap-2.5 border-b border-line px-5 py-4">
        <CrosshairMark className="h-7 w-7 text-cyan transition-transform duration-500 group-hover:rotate-90" />
        <span>
          <span className="display-head block text-[15px] tracking-wide text-ink">
            {DOC_META.code}
            <span className="text-faint"> / SD</span>
          </span>
          <span className="mono-label block text-[7.5px] text-faint">
            {DOC_META.docNo} · {DOC_META.rev} · 11 SHEETS
          </span>
        </span>
        <span
          className={`mono-label ml-auto border px-1.5 py-1 text-[7.5px] ${
            sealed ? "border-green/60 bg-green/10 text-green" : "border-amber/50 text-amber"
          }`}
        >
          {sealed ? "SEALED" : "G-18"}
        </span>
      </Link>

      {/* sheet index */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-5">
        <SheetNav />
      </div>

      {/* depth + seal + user */}
      <div className="space-y-3.5 border-t border-line px-4 py-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="mono-label text-[8px] text-faint">SHEET DEPTH</p>
            <p className="mono-label text-[8px] text-cyan">{Math.round(prog * 100)}%</p>
          </div>
          <div className="mt-1.5 h-[3px] w-full bg-line/50">
            <div className="h-full bg-cyan transition-[width] duration-150" style={{ width: `${prog * 100}%` }} />
          </div>
        </div>
        <SealMeter sealed={sealed} />
        {user && <UserChip user={user} onLogout={logout} />}
      </div>
    </aside>
  );
}

/* ---------- mobile top bar + drawer ---------- */

function MobileBar({ onOpen }: { onOpen: () => void }) {
  const { sealed } = useDoc();
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-line bg-[rgba(7,13,24,0.94)] px-4 lg:hidden">
      <button
        onClick={onOpen}
        aria-label="Open sheet index"
        className="flex h-9 w-9 items-center justify-center border border-line text-dim transition-colors hover:border-cyan hover:text-cyan"
      >
        <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h8" />
        </svg>
      </button>
      <Link to="/" className="display-head text-[14px] text-ink">
        {DOC_META.code}
        <span className="text-faint"> / SD</span>
      </Link>
      <span className="mono-label ml-auto text-[8px] text-faint">{DOC_META.rev}</span>
      <span
        className={`mono-label border px-1.5 py-1 text-[7.5px] ${
          sealed ? "border-green/60 bg-green/10 text-green" : "border-amber/50 text-amber"
        }`}
      >
        {sealed ? "SEALED" : "G-18"}
      </span>
    </div>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sealed, user, logout } = useDoc();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={open ? "" : "pointer-events-none"} aria-hidden={!open}>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-[70] flex w-[290px] flex-col border-r border-line bg-[#0a1424] transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <CrosshairMark className="h-6 w-6 text-cyan" />
          <span className="display-head text-[14px] text-ink">
            {DOC_META.code}
            <span className="text-faint"> / SD</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close sheet index"
            className="ml-auto flex h-8 w-8 items-center justify-center border border-line text-faint transition-colors hover:border-rose hover:text-rose"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-5">
          <SheetNav onNavigate={onClose} />
        </div>
        <div className="space-y-3.5 border-t border-line px-4 py-4">
          <SealMeter sealed={sealed} />
          {user && <UserChip user={user} onLogout={() => { onClose(); logout(); }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- page hero ---------- */

export interface TocItem { id: string; n: string; label: string }

export function PageHero({
  kicker,
  title,
  intro,
  stamp,
  stampTone = "green",
  phaseWatermark,
  toc,
}: {
  kicker: string;
  title: string;
  intro: string;
  stamp: string;
  stampTone?: "green" | "amber";
  phaseWatermark: string;
  toc?: TocItem[];
}) {
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 pb-10 pt-28 sm:px-8 lg:pt-16">
      {/* giant phase watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-20 select-none font-mono text-[9rem] font-bold leading-none text-line/25 sm:text-[13rem] lg:top-6"
      >
        {phaseWatermark}
      </span>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className="blink inline-block h-3 w-2 bg-cyan" aria-hidden="true" />
          <p className="mono-label text-dim">
            {kicker} <span className="text-faint">·</span> <span className="text-cyan">{DOC_META.docNo}</span>
          </p>
          <span
            className={`mono-label ml-auto rotate-[-2deg] border-2 px-2.5 py-1 text-[9.5px] tracking-[0.22em] ${
              stampTone === "green" ? "border-green/70 text-green" : "border-amber/70 text-amber"
            }`}
          >
            {stamp}
          </span>
        </div>

        <h1 className="display-head mt-5 max-w-3xl text-4xl leading-[1.02] text-ink sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-dim">{intro}</p>

        {toc && toc.length > 0 && (
          <div className="mt-7 border-t border-line pt-4">
            <p className="mono-label mb-2.5 text-[8.5px] text-faint">On this sheet</p>
            <div className="flex flex-wrap gap-1.5">
              {toc.map((t) => (
                <button
                  key={t.id}
                  onClick={() => jump(t.id)}
                  className="mono-label border border-line px-2.5 py-1.5 text-[8.5px] text-dim transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/60 hover:text-cyan"
                >
                  <span className="text-faint">§{t.n}</span> {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- prev / next pager with 3D tilt ---------- */

function PagerCard({ to, code, title, meta, dir }: { to: string; code: string; title: string; meta: string; dir: "prev" | "next" }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLAnchorElement>(4);
  return (
    <Link
      ref={ref}
      to={to}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`tilt group border border-line bg-base/40 p-4 hover:border-cyan/50 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(107,225,255,0.08)] ${
        dir === "next" ? "text-right" : ""
      }`}
    >
      <p className={`mono-label text-[8.5px] text-faint transition-colors ${dir === "prev" ? "group-hover:text-cyan" : "group-hover:text-amber"}`}>
        {dir === "prev" ? "← Previous sheet" : "Next sheet →"}
      </p>
      <p className="display-head mt-1.5 text-lg text-ink">
        <span className="mr-2 font-mono text-[11px] text-amber">{code}</span>
        {title}
      </p>
      <p className="mono-label mt-1 text-[8.5px] text-faint">{meta}</p>
    </Link>
  );
}

function Pager({ path }: { path: string }) {
  const idx = PAGES.findIndex((p) => p.path === path);
  const prev = idx > 0 ? PAGES[idx - 1] : undefined;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : undefined;

  return (
    <div className="mx-auto mt-20 grid w-full max-w-6xl gap-3 px-5 sm:grid-cols-2 sm:px-8">
      {prev ? (
        <PagerCard to={prev.path} code={prev.code} title={prev.title} meta={`${prev.phases} · ${prev.revs}`} dir="prev" />
      ) : (
        <div className="hidden sm:block" />
      )}
      {next && (
        <PagerCard to={next.path} code={next.code} title={next.title} meta={`${next.phases} · ${next.revs}`} dir="next" />
      )}
    </div>
  );
}

/* ---------- footer ---------- */

function SiteFooter() {
  const { sealed } = useDoc();
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-3">
        <div>
          <p className="mono-label text-cyan">{DOC_META.docNo} · {DOC_META.rev}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-faint">
            AI Digital Twin &amp; Career Intelligence System — an eighteen-phase, decision-support
            design document. Nothing here was fabricated: every engine on this site is arithmetic you
            can replay by hand.
          </p>
        </div>
        <div>
          <p className="mono-label text-faint">Standing rules</p>
          <ul className="mt-2 space-y-1 font-mono text-[11.5px] text-faint">
            <li><span className="text-rose">01</span> never fabricate data or metrics</li>
            <li><span className="text-rose">02</span> never hide an error or a failed baseline</li>
            <li><span className="text-rose">03</span> smaller working feature &gt; fake advanced one</li>
            <li><span className="text-rose">04</span> say what cannot be done — and the valid alternative</li>
          </ul>
        </div>
        <div className="md:text-right">
          <p className="mono-label text-faint">Document status</p>
          <p className={`mt-2 font-mono text-[12.5px] ${sealed ? "text-green" : "text-amber"}`}>
            {sealed ? "SEALED · ARCHIVED · READY FOR DEFENSE" : "GATES G-1→G-17 PASSED · SEAL PENDING"}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mono-label mt-4 inline-block border border-line px-3 py-1.5 text-[9px] text-dim transition-colors hover:border-cyan hover:text-cyan"
          >
            ↑ Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ---------- shell ---------- */

export default function Shell() {
  const [sealed, setSealed] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(() => getSession());
  const [drawer, setDrawer] = useState(false);
  const [prog, setProg] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    setUser(null);
    navigate("/auth", { replace: true });
  };

  /* sheet-depth meter */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - window.innerHeight;
        setProg(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <DocCtx.Provider value={{ sealed, seal: () => setSealed(true), user, logout }}>
      <ScrollToTop />
      <div id="top" className="min-h-screen">
        {/* ambient layers — base grid, cinematic plates, 3D particles, effects */}
        <div className="bg-blueprint" aria-hidden="true" />
        <Backplates path={pathname} />
        <VideoBackdrop />
        <ParticleField />
        <div className="bg-scan" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />

        <Sidebar prog={prog} />
        <MobileBar onOpen={() => setDrawer(true)} />
        <Drawer open={drawer} onClose={() => setDrawer(false)} />

        {/* content column */}
        <div className="lg:pl-[268px]">
          {/* route transition keyed by path */}
          <main key={pathname} className="pagein">
            <Outlet />
          </main>
          {!pathname.startsWith("/system") && <Pager path={pageByPath(pathname) ? pathname : "/"} />}
          <SiteFooter />
        </div>
      </div>
    </DocCtx.Provider>
  );
}
