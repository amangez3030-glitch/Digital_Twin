import { useEffect, useRef } from "react";

/* ============================================================
   Real-time 3D constellation — a rotating point cloud rendered
   on canvas: perspective projection, depth-sorted links, and
   pointer parallax. It is the document's living layer.
   ============================================================ */

interface P3 {
  x: number;
  y: number;
  z: number;
  warm: boolean;
}

export default function ParticleField() {
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
    let pts: P3[] = [];
    let t = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const R = 340; // cloud radius
    const LINK = 128; // max 3D link distance
    const F = 560; // focal length

    const seed = () => {
      const area = W * H;
      const count = Math.max(60, Math.min(150, Math.round(area / 15000)));
      pts = Array.from({ length: count }, () => {
        // uniform points in a sphere
        const u = Math.random() * 2 - 1;
        const th = Math.random() * Math.PI * 2;
        const r = R * Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        return {
          x: r * s * Math.cos(th),
          y: r * s * Math.sin(th) * 0.72,
          z: r * u,
          warm: Math.random() < 0.14,
        };
      });
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

    const project = (p: P3, cx: number, cy: number) => {
      const d = F + p.z;
      const k = F / Math.max(d, 60);
      return { x: cx + p.x * k, y: cy + p.y * k, k, depth: (p.z + R) / (2 * R) };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.0022;
      // eased pointer parallax
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;

      const cy0 = H * 0.46;
      const cx0 = W * 0.62 + mouse.x * 46;
      const cy = cy0 + mouse.y * 30;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      const wob = Math.sin(t * 0.6) * 0.16;
      const cosW = Math.cos(wob);
      const sinW = Math.sin(wob);

      // rotate cloud (Y then gentle X), project
      const proj: { x: number; y: number; k: number; depth: number; warm: boolean }[] = [];
      for (const p of pts) {
        const x1 = p.x * cosT - p.z * sinT;
        const z1 = p.x * sinT + p.z * cosT;
        const y1 = p.y * cosW - z1 * sinW;
        const z2 = p.y * sinW + z1 * cosW;
        proj.push({ ...project({ x: x1, y: y1, z: z2, warm: p.warm }, cx0, cy), warm: p.warm });
      }

      // links (drawn first, under the points)
      ctx.lineWidth = 1;
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const a = proj[i];
          const b = proj[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const lim = LINK * ((a.k + b.k) / 2);
          if (d2 < lim * lim) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / lim) * 0.16 * ((a.depth + b.depth) / 2);
            ctx.strokeStyle = `rgba(107,225,255,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // points, far → near
      proj.sort((a, b) => a.k - b.k);
      for (const p of proj) {
        const r = Math.max(0.7, 2.1 * p.k);
        const alpha = 0.25 + 0.55 * p.depth;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? `rgba(255,194,102,${alpha.toFixed(3)})`
          : `rgba(107,225,255,${alpha.toFixed(3)})`;
        ctx.fill();
        if (p.warm && p.depth > 0.7) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,194,102,0.06)";
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / W) * 2 - 1;
      mouse.ty = (e.clientY / H) * 2 - 1;
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      // one static frame, no loop
      draw();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    />
  );
}
