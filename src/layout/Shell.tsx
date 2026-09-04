import { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { DOC_META } from "../data/design";
import { PAGES, pageByPath } from "../pages/registry";
import { clearSession, getSession, type SessionUser } from "../lib/auth";

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

/* ---------- top navigation ---------- */

function CrosshairMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3.5" y="3.5" width="17" height="17" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TopNav() {
  const { sealed, user, logout } = useDoc();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "border-line bg-[rgba(7,13,24,0.94)] shadow-[0_10px_40px_rgba(0,0,0,0.45)]" : "border-line/70 bg-[rgba(7,13,24,0.82)]"
      }`}
    >
      {/* status row */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 pt-2.5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <CrosshairMark className="h-6 w-6 text-cyan transition-transform duration-500 group-hover:rotate-90" />
          <span className="display-head text-[15px] tracking-wide text-ink">
            {DOC_META.code}
            <span className="text-faint"> / SD</span>
          </span>
        </Link>
        <span className="mono-label hidden text-faint md:block">
          {DOC_META.docNo} · {DOC_META.rev}
        </span>
        <span className="mono-label hidden border border-line px-2 py-[3px] text-[9px] text-dim lg:block">
          18 PHASES · 89 SECTIONS
        </span>
        <span
          className={`mono-label ml-auto border px-2 py-[3px] text-[9px] transition-colors duration-300 ${
            sealed ? "border-green/60 bg-green/10 text-green" : "border-amber/50 text-amber"
          }`}
        >
          {sealed ? "ARCHIVED · 18/18 ✓" : "SEAL PENDING · G-18"}
        </span>
        {user && (
          <span className="group flex items-center gap-2 border border-line/80 bg-base/50 py-[3px] pl-2.5 pr-1 transition-colors duration-200 hover:border-cyan/50">
            <span
              className={`flex h-4 w-4 items-center justify-center font-mono text-[9px] font-bold ${
                user.kind === "supervisor" ? "bg-amber/20 text-amber" : "bg-cyan/20 text-cyan"
              }`}
            >
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="mono-label hidden text-[8.5px] text-dim sm:block">
              {user.name.split(" ")[0]}
              <span className="text-faint"> · {user.kind === "supervisor" ? "REVIEW" : "LOCAL"}</span>
            </span>
            <button
              onClick={logout}
              title="Sign out of the local workspace"
              className="mono-label border border-line/70 px-1.5 py-[2px] text-[8px] text-faint transition-all duration-200 hover:border-rose/60 hover:text-rose"
            >
              OUT
            </button>
          </span>
        )}
      </div>

      {/* page rail */}
      <nav className="no-scrollbar mx-auto mt-2 flex max-w-6xl items-center gap-1 overflow-x-auto px-5 pb-2 sm:px-8" aria-label="Pages">
        {PAGES.map((p) => (
          <NavLink
            key={p.path}
            to={p.path}
            end={p.path === "/"}
            className={({ isActive }) =>
              `group relative shrink-0 px-2.5 py-1.5 transition-colors duration-200 ${
                isActive ? "text-cyan" : "text-faint hover:text-dim"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="mono-label mr-1.5 text-[8.5px]" style={{ color: isActive ? "#ffc266" : undefined }}>
                  {p.code}
                </span>
                <span className="mono-label text-[9.5px] tracking-[0.14em]">{p.label.toUpperCase()}</span>
                <span
                  className={`absolute inset-x-2 -bottom-0.5 h-[2px] origin-left transition-transform duration-300 ${
                    isActive ? "scale-x-100 bg-cyan" : "scale-x-0 bg-line group-hover:scale-x-100"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
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
    <header className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 pb-10 pt-32 sm:px-8 md:pt-36">
      {/* giant phase watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-16 select-none font-mono text-[9rem] font-bold leading-none text-line/25 sm:text-[13rem] md:top-10"
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

/* ---------- prev / next pager ---------- */

export function Pager({ path }: { path: string }) {
  const idx = PAGES.findIndex((p) => p.path === path);
  const prev = idx > 0 ? PAGES[idx - 1] : undefined;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : undefined;

  return (
    <div className="mx-auto mt-20 grid w-full max-w-6xl gap-3 px-5 sm:grid-cols-2 sm:px-8">
      {prev ? (
        <Link
          to={prev.path}
          className="group border border-line bg-base/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/50 hover:shadow-[0_0_24px_rgba(107,225,255,0.08)]"
        >
          <p className="mono-label text-[8.5px] text-faint transition-colors group-hover:text-cyan">← Previous sheet</p>
          <p className="display-head mt-1.5 text-lg text-ink">
            <span className="mr-2 font-mono text-[11px] text-amber">{prev.code}</span>
            {prev.title}
          </p>
          <p className="mono-label mt-1 text-[8.5px] text-faint">{prev.phases} · {prev.revs}</p>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next && (
        <Link
          to={next.path}
          className="group border border-line bg-base/40 p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-amber/50 hover:shadow-[0_0_24px_rgba(255,194,102,0.08)] sm:col-start-2"
        >
          <p className="mono-label text-[8.5px] text-faint transition-colors group-hover:text-amber">Next sheet →</p>
          <p className="display-head mt-1.5 text-lg text-ink">
            <span className="mr-2 font-mono text-[11px] text-amber">{next.code}</span>
            {next.title}
          </p>
          <p className="mono-label mt-1 text-[8.5px] text-faint">{next.phases} · {next.revs}</p>
        </Link>
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
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    setUser(null);
    navigate("/auth", { replace: true });
  };

  return (
    <DocCtx.Provider value={{ sealed, seal: () => setSealed(true), user, logout }}>
      <ScrollToTop />
      <div id="top" className="min-h-screen">
        {/* ambient layers */}
        <div className="bg-blueprint" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <div className="bg-scan" aria-hidden="true" />

        <TopNav />
        {/* route transition keyed by path */}
        <main key={pathname} className="pagein">
          <Outlet />
        </main>
        <Pager path={pageByPath(pathname) ? pathname : "/"} />
        <SiteFooter />
      </div>
    </DocCtx.Provider>
  );
}
