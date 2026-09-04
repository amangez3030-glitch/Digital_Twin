import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DOC_META } from "../data/design";
import { Corners } from "../components/ui";
import {
  EMAIL_RE,
  createSession,
  findUser,
  hashPass,
  passStrength,
  saveUser,
  type StoredUser,
} from "../lib/auth";

type Mode = "login" | "signin";

const STRENGTH_META = [
  { label: "TOO WEAK", color: "#ff8b8b" },
  { label: "WEAK", color: "#ff8b8b" },
  { label: "FAIR", color: "#ffc266" },
  { label: "GOOD", color: "#ffc266" },
  { label: "STRONG", color: "#7ce7a5" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => passStrength(pass), [pass]);

  const fail = (msg: string) => {
    setError(msg);
    setAttempt((a) => a + 1);
  };

  const enter = (user: StoredUser, verb: string) => {
    setBusy(true);
    createSession(user);
    window.setTimeout(() => navigate("/", { replace: true }), 420);
    void verb;
  };

  const submit = () => {
    setError(null);
    if (mode === "signin" && name.trim().length < 2) return fail("ENTER A NAME — the workspace is addressed to someone.");
    if (!EMAIL_RE.test(email.trim())) return fail("THAT EMAIL DOES NOT PARSE — check the format.");
    if (pass.length < 6) return fail("PASSWORD NEEDS 6+ CHARACTERS — this vault is demo-grade, not careless.");
    if (mode === "signin" && pass !== confirm) return fail("CONFIRMATION DOES NOT MATCH the password.");

    if (mode === "signin") {
      if (findUser(email)) return fail("A WORKSPACE ALREADY EXISTS for this email — switch to LOGIN.");
      const user: StoredUser = {
        name: name.trim(),
        email: email.trim(),
        hash: hashPass(email, pass),
        createdAt: new Date().toISOString(),
        kind: "student",
      };
      saveUser(user);
      enter(user, "created");
    } else {
      const user = findUser(email);
      if (!user || user.hash !== hashPass(email, pass)) {
        return fail("ACCESS DENIED — email or passphrase not recognized.");
      }
      enter(user, "opened");
    }
  };

  const supervisorAccess = () => {
    setError(null);
    let user = findUser("supervisor@dtcis.local");
    if (!user) {
      user = {
        name: "Academic Supervisor",
        email: "supervisor@dtcis.local",
        hash: hashPass("supervisor@dtcis.local", "review-gate"),
        createdAt: new Date().toISOString(),
        kind: "supervisor",
      };
      saveUser(user);
    }
    enter(user, "review");
  };

  const inputCls =
    "w-full border border-line bg-base/60 px-3.5 py-3 font-mono text-[13px] text-ink outline-none transition-all duration-200 placeholder:text-faint/60 focus:border-cyan focus:shadow-[0_0_0_1px_rgba(107,225,255,0.35),0_0_24px_rgba(107,225,255,0.08)]";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="bg-blueprint" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <div className="bg-scan" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-16">
        {/* ---------- clearance briefing ---------- */}
        <div className="pagein">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3.5" y="3.5" width="17" height="17" />
              <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" strokeWidth="1.1" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
            </svg>
            <p className="mono-label text-dim">
              {DOC_META.code} <span className="text-faint">/ ACCESS CONTROL</span>
            </p>
            <span className="mono-label ml-auto border border-line px-2 py-[3px] text-[9px] text-faint">
              {DOC_META.docNo} · {DOC_META.rev}
            </span>
          </div>

          <h1 className="display-head mt-7 text-4xl leading-[0.99] text-ink sm:text-5xl lg:text-6xl">
            WORKSPACE<br />
            <span className="text-cyan">CLEARANCE</span>
            <span className="blink ml-2 inline-block h-[0.85em] w-[0.45em] translate-y-[0.1em] bg-cyan" aria-hidden="true" />
          </h1>
          <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-dim">
            The design document for the <span className="text-ink">AI Digital Twin &amp; Career
            Intelligence System</span> — eighteen phases, eighty-nine sections, and a dozen live
            engines — is held behind a local workspace gate. Identify yourself to open the dossier.
          </p>

          {/* ledger strip */}
          <div className="mt-7 grid grid-cols-2 gap-px border border-line/80 bg-line/40 sm:grid-cols-4">
            {[
              ["18", "PHASES"],
              ["89", "SECTIONS"],
              ["12", "LIVE ENGINES"],
              ["0", "FABRICATED FIGURES"],
            ].map(([v, l]) => (
              <div key={l} className="bg-[#0b1626] px-3.5 py-3 transition-colors duration-200 hover:bg-[#0e1b30]">
                <p className="display-head text-2xl text-cyan">{v}</p>
                <p className="mono-label mt-0.5 text-[8px] text-faint">{l}</p>
              </div>
            ))}
          </div>

          {/* the privacy contract */}
          <div className="mt-6 border-l-2 border-green/60 pl-4">
            <p className="mono-label text-[9px] text-green">The privacy contract — §70 · T-3</p>
            <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-faint">
              Credentials are hashed <span className="text-dim">on this device only</span> (demo-grade
              FNV-1a) and never transmitted anywhere; the workspace lives in your browser's local
              storage. This demonstrates the twin's own rule — <span className="text-dim">data stays
              with its owner</span> — and is not a production auth system.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="mono-label text-[9px] text-faint">STANDING RULES</p>
            {["never fabricate", "never hide errors", "working > fancy", "say what can't be done"].map((r, i) => (
              <span key={r} className="mono-label border border-line/70 px-2 py-1 text-[8px] text-dim">
                <span className="mr-1 text-rose">{String(i + 1).padStart(2, "0")}</span>{r}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- the gate ---------- */}
        <div className="pagein" style={{ animationDelay: "0.08s" }}>
          <div key={attempt} className={`panel relative overflow-hidden p-6 sm:p-8 ${attempt > 0 && error ? "shake" : ""}`}>
            <Corners color={error ? "#ff8b8b" : "#6be1ff"} />

            <div className="flex items-center justify-between gap-3">
              <p className="mono-label text-faint">GATE / ENTRY</p>
              <span className="mono-label border border-line px-2 py-[3px] text-[8.5px] text-dim">
                ON-DEVICE · NOTHING LEAVES THIS BROWSER
              </span>
            </div>

            {/* mode tabs */}
            <div className="mt-5 grid grid-cols-2 border border-line">
              {(
                [
                  ["login", "LOGIN", "returning to a workspace"],
                  ["signin", "CREATE WORKSPACE", "first clearance"],
                ] as [Mode, string, string][]
              ).map(([m, label, sub]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  className={`px-3 py-3 text-left transition-all duration-200 ${
                    mode === m ? "bg-cyan/10" : "hover:bg-base/60"
                  }`}
                >
                  <span className={`mono-label block text-[10px] ${mode === m ? "text-cyan" : "text-dim"}`}>{label}</span>
                  <span className="mt-0.5 block font-mono text-[9px] text-faint">{sub}</span>
                </button>
              ))}
            </div>

            {/* form */}
            <div className="mt-5 space-y-4">
              {mode === "signin" && (
                <div>
                  <label htmlFor="ac-name" className="mono-label mb-1.5 block text-[8.5px] text-dim">NAME ON THE WORKSPACE</label>
                  <input
                    id="ac-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amira Benali"
                    className={inputCls}
                    autoComplete="name"
                  />
                </div>
              )}
              <div>
                <label htmlFor="ac-email" className="mono-label mb-1.5 block text-[8.5px] text-dim">EMAIL</label>
                <input
                  id="ac-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className={inputCls}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="ac-pass" className="mono-label mb-1.5 block text-[8.5px] text-dim">PASSPHRASE</label>
                <div className="relative">
                  <input
                    id="ac-pass"
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder={mode === "signin" ? "choose 6+ characters" : "your passphrase"}
                    className={`${inputCls} pr-14`}
                    autoComplete={mode === "signin" ? "new-password" : "current-password"}
                  />
                  <button
                    onClick={() => setShowPass((s) => !s)}
                    className="mono-label absolute right-2 top-1/2 -translate-y-1/2 border border-line px-2 py-1 text-[8px] text-faint transition-colors hover:border-cyan hover:text-cyan"
                  >
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {mode === "signin" && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-1 flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="flex-1 transition-all duration-300"
                          style={{
                            background: i < strength ? STRENGTH_META[strength].color : "rgba(61,83,115,0.35)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="mono-label w-16 text-right text-[8px]" style={{ color: pass ? STRENGTH_META[strength].color : undefined }}>
                      {pass ? STRENGTH_META[strength].label : "—"}
                    </span>
                  </div>
                )}
              </div>
              {mode === "signin" && (
                <div>
                  <label htmlFor="ac-confirm" className="mono-label mb-1.5 block text-[8.5px] text-dim">CONFIRM PASSPHRASE</label>
                  <input
                    id="ac-confirm"
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="repeat it exactly"
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <p className="border border-rose/50 bg-rose/10 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-rose">
                  ⨯ {error}
                </p>
              )}

              <button
                onClick={submit}
                disabled={busy}
                className="group flex w-full items-center justify-center gap-3 border border-cyan bg-cyan/10 px-5 py-3.5 transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_30px_rgba(107,225,255,0.2)] active:translate-y-[1px] disabled:opacity-60"
              >
                {busy ? (
                  <span className="mono-label text-[10.5px] text-cyan">GRANTING CLEARANCE…</span>
                ) : (
                  <>
                    <span className="mono-label text-[10.5px] text-cyan">
                      {mode === "login" ? "OPEN THE DOSSIER" : "CREATE WORKSPACE & ENTER"}
                    </span>
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-cyan transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
                    </svg>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="mono-label text-[8px] text-faint">OR</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <button
                onClick={supervisorAccess}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 border border-amber/60 bg-amber/5 px-5 py-3 transition-all duration-200 hover:bg-amber/15 hover:shadow-[0_0_26px_rgba(255,194,102,0.15)] active:translate-y-[1px] disabled:opacity-60"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-amber" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M8 1.5 10 5.8 14.5 6.4 11.2 9.6 12 14.2 8 12 4 14.2 4.8 9.6 1.5 6.4 6 5.8Z" />
                </svg>
                <span className="mono-label text-[10px] text-amber">SUPERVISOR QUICK ACCESS — REVIEW MODE</span>
              </button>
            </div>

            <p className="mt-5 border-t border-line pt-4 text-center font-mono text-[9.5px] leading-relaxed text-faint">
              Access is a local demonstration. No account data is transmitted, sold, or shared —
              clearing site data erases the workspace entirely (§70 · right to be forgotten).
            </p>
          </div>

          <p className="mt-4 text-center font-mono text-[9.5px] text-faint">
            clearance gate for {DOC_META.docNo} · issued {DOC_META.date}
            <span className="mx-2 text-line">|</span>
            clearance unlocks the full dossier
          </p>
        </div>
      </div>
    </div>
  );
}
