import { useEffect, useRef } from "react";

/* ============================================================
   Generative background video — a continuous cinematic layer:
   breathing light washes, depth-sorted data streams, and the
   occasional comet. Renders over the 4K backplates with a
   screen blend, so the plates read as footage with light
   moving across them. One canvas, no assets, never breaks.
   ============================================================ */

interface Streak {
  x: number;
  y: number;
  len: number;
  sp: number;
  d: number; // depth 0.25–1
  warm: boolean;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

export default function VideoBackdrop() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let W = 0;
    let H = 0;
    let t = Math.random() * 100;
    let streaks: Streak[] = [];
    let comets: Comet[] = [];
    let nextComet = 4;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.75);

    const seed = () => {
      const n = Math.max(16, Math.min(38, Math.round((W * H) / 30000)));
      streaks = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        len: 90 + Math.random() * 260,
        sp: 0.35 + Math.random() * 1.1,
        d: 0.25 + Math.random() * 0.75,
        warm: Math.random() < 0.12,
      }));
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    };

    const wash = (cx: number, cy: number, r: number, rgb: string, a: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const draw = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, W, H);

      /* breathing nebula washes */
      const R = Math.max(W, H) * 0.62;
      wash(
        W * (0.26 + 0.09 * Math.sin(t * 0.05)),
        H * (0.3 + 0.11 * Math.cos(t * 0.041)),
        R,
        "107,225,255",
        0.05
      );
      wash(
        W * (0.74 + 0.1 * Math.cos(t * 0.046)),
        H * (0.68 + 0.1 * Math.sin(t * 0.052)),
        R * 0.85,
        "255,194,102",
        0.042
      );
      wash(
        W * (0.55 + 0.14 * Math.sin(t * 0.033)),
        H * (0.12 + 0.06 * Math.cos(t * 0.06)),
        R * 0.7,
        "157,184,255",
        0.03
      );

      /* data streams */
      for (const s of streaks) {
        s.x -= s.sp * s.d * dt * 60;
        if (s.x < -s.len) {
          s.x = W + Math.random() * 120;
          s.y = Math.random() * H;
        }
        const alpha = 0.16 * s.d;
        const g = ctx.createLinearGradient(s.x, s.y, s.x + s.len * s.d, s.y);
        const rgb = s.warm ? "255,194,102" : "107,225,255";
        g.addColorStop(0, `rgba(${rgb},0)`);
        g.addColorStop(0.7, `rgba(${rgb},${(alpha * 0.65).toFixed(3)})`);
        g.addColorStop(1, `rgba(${rgb},${alpha.toFixed(3)})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.warm ? 1.6 : 1.1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len * s.d, s.y);
        ctx.stroke();
      }

      /* comets */
      nextComet -= dt;
      if (nextComet <= 0 && comets.length < 2) {
        const fromLeft = Math.random() < 0.5;
        comets.push({
          x: fromLeft ? -40 : W + 40,
          y: H * (0.1 + Math.random() * 0.5),
          vx: (fromLeft ? 1 : -1) * (260 + Math.random() * 240),
          vy: 60 + Math.random() * 90,
          life: 0,
          max: 2.6 + Math.random(),
        });
        nextComet = 5 + Math.random() * 6;
      }
      comets = comets.filter((c) => c.life < c.max && c.x > -200 && c.x < W + 200 && c.y < H + 200);
      for (const c of comets) {
        c.life += dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        const fade = Math.sin(Math.min(1, c.life / c.max) * Math.PI);
        const tx = c.x - c.vx * 0.22;
        const ty = c.y - c.vy * 0.22;
        const g = ctx.createLinearGradient(tx, ty, c.x, c.y);
        g.addColorStop(0, "rgba(107,225,255,0)");
        g.addColorStop(1, `rgba(214,245,255,${(0.5 * fade).toFixed(3)})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 14);
        hg.addColorStop(0, `rgba(214,245,255,${(0.55 * fade).toFixed(3)})`);
        hg.addColorStop(1, "rgba(107,225,255,0)");
        ctx.fillStyle = hg;
        ctx.fillRect(c.x - 14, c.y - 14, 28, 28);
      }

      raf = requestAnimationFrame((ts) => draw(Math.min(0.05, (ts - last) / 1000) || 0.016));
      last = performance.now();
    };

    let last = performance.now();

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame((ts) => draw(Math.min(0.05, (ts - last) / 1000) || 0.016));
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      // one composed frame, no motion
      t = 40;
      ctx.clearRect(0, 0, W, H);
      wash(W * 0.3, H * 0.3, Math.max(W, H) * 0.6, "107,225,255", 0.05);
      wash(W * 0.72, H * 0.7, Math.max(W, H) * 0.5, "255,194,102", 0.04);
      for (const s of streaks) {
        ctx.strokeStyle = `rgba(107,225,255,${(0.1 * s.d).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len * s.d * 0.6, s.y);
        ctx.stroke();
      }
    } else {
      raf = requestAnimationFrame((ts) => draw(Math.min(0.05, (ts - last) / 1000) || 0.016));
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -4, mixBlendMode: "screen", opacity: 0.9 }}
    />
  );
}
