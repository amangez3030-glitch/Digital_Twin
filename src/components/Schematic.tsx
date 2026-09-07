import { useMemo, useState } from "react";
import { TWIN_NODES, type TwinNode } from "../data/design";

const IN_X = 8;
const IN_W = 148;
const OUT_X = 604;
const OUT_W = 148;
const CORE = { x: 376, y: 224 };

function nodeYs(count: number, top: number, gap: number) {
  return Array.from({ length: count }, (_, i) => top + i * gap);
}

export default function Schematic() {
  const [selected, setSelected] = useState<string>("core");

  const inputs = useMemo(() => TWIN_NODES.filter((n) => n.side === "in"), []);
  const outputs = useMemo(() => TWIN_NODES.filter((n) => n.side === "out"), []);
  const core = TWIN_NODES.find((n) => n.side === "core") as TwinNode;

  const inYs = nodeYs(inputs.length, 26, 82);
  const outYs = nodeYs(outputs.length, 18, 69);

  const sel = TWIN_NODES.find((n) => n.id === selected) ?? core;

  const sideColor = (n: TwinNode, isSel: boolean) => {
    if (n.side === "core") return isSel ? "#ffc266" : "#8a6a3a";
    if (n.side === "in") return isSel ? "#6be1ff" : "#2b6b85";
    return isSel ? "#7ce7a5" : "#33604a";
  };

  const edgeActive = (a: string, b: string) => selected === a || selected === b;

  return (
    <div className="panel relative h-full p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="mono-label text-faint">FIG. 1 — TWIN TOPOLOGY</p>
        <p className="mono-label hidden text-faint sm:block">HOVER NODES TO INSPECT</p>
      </div>

      <svg viewBox="0 0 760 448" className="w-full" role="img" aria-label="Digital twin system schematic">
        {/* in -> core edges */}
        {inputs.map((n, i) => {
          const y = inYs[i] + 21;
          const active = edgeActive(n.id, "core");
          return (
            <path
              key={`e-in-${n.id}`}
              d={`M ${IN_X + IN_W} ${y} C ${IN_X + IN_W + 90} ${y}, ${CORE.x - 150} ${CORE.y}, ${CORE.x - 62} ${CORE.y}`}
              fill="none"
              stroke={active ? "#6be1ff" : "#1d3a5c"}
              strokeWidth={active ? 1.6 : 1}
              className="flow-edge"
              style={{ opacity: selected === "core" || active ? 1 : 0.45 }}
            />
          );
        })}
        {/* core -> out edges */}
        {outputs.map((n, i) => {
          const y = outYs[i] + 20;
          const active = edgeActive("core", n.id);
          return (
            <path
              key={`e-out-${n.id}`}
              d={`M ${CORE.x + 62} ${CORE.y} C ${CORE.x + 150} ${CORE.y}, ${OUT_X - 90} ${y}, ${OUT_X} ${y}`}
              fill="none"
              stroke={active ? "#7ce7a5" : "#1d3a5c"}
              strokeWidth={active ? 1.6 : 1}
              className="flow-edge"
              style={{ opacity: selected === "core" || active ? 1 : 0.45 }}
            />
          );
        })}

        {/* core pulse + hexagon */}
        <g
          onMouseEnter={() => setSelected("core")}
          onClick={() => setSelected("core")}
          className="cursor-pointer"
        >
          <circle cx={CORE.x} cy={CORE.y} r={66} fill="none" stroke="#ffc266" strokeWidth={1} className="pulse-core" />
          <polygon
            points={`${CORE.x - 62},${CORE.y} ${CORE.x - 31},${CORE.y - 54} ${CORE.x + 31},${CORE.y - 54} ${CORE.x + 62},${CORE.y} ${CORE.x + 31},${CORE.y + 54} ${CORE.x - 31},${CORE.y + 54}`}
            fill={selected === "core" ? "rgba(255,194,102,0.10)" : "rgba(14,32,57,0.9)"}
            stroke={sideColor(core, selected === "core")}
            strokeWidth={selected === "core" ? 1.8 : 1.2}
          />
          <text x={CORE.x} y={CORE.y - 6} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fill="#ffc266" letterSpacing="2">
            DIGITAL
          </text>
          <text x={CORE.x} y={CORE.y + 12} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fill="#ffc266" letterSpacing="2">
            TWIN
          </text>
          <text x={CORE.x} y={CORE.y + 32} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#5e7396" letterSpacing="1.5">
            vN · JOURNALED
          </text>
        </g>

        {/* input nodes */}
        {inputs.map((n, i) => {
          const y = inYs[i];
          const isSel = selected === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setSelected(n.id)}
              onClick={() => setSelected(n.id)}
              className="cursor-pointer"
            >
              <rect x={IN_X} y={y} width={IN_W} height={42} fill={isSel ? "rgba(43,107,133,0.35)" : "rgba(12,27,49,0.9)"} stroke={sideColor(n, isSel)} strokeWidth={isSel ? 1.6 : 1} />
              <text x={IN_X + 12} y={y + 25} fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fill={isSel ? "#6be1ff" : "#93a7c4"} letterSpacing="1.5">
                {n.label}
              </text>
              <text x={IN_X + IN_W - 10} y={y + 25} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5e7396">
                IN-{i + 1}
              </text>
            </g>
          );
        })}

        {/* output nodes */}
        {outputs.map((n, i) => {
          const y = outYs[i];
          const isSel = selected === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setSelected(n.id)}
              onClick={() => setSelected(n.id)}
              className="cursor-pointer"
            >
              <rect x={OUT_X} y={y} width={OUT_W} height={40} fill={isSel ? "rgba(51,96,74,0.4)" : "rgba(12,27,49,0.9)"} stroke={sideColor(n, isSel)} strokeWidth={isSel ? 1.6 : 1} />
              <text x={OUT_X + 12} y={y + 24} fontFamily="IBM Plex Mono, monospace" fontSize="10" fill={isSel ? "#7ce7a5" : "#93a7c4"} letterSpacing="1.2">
                {n.label}
              </text>
              <text x={OUT_X + OUT_W - 10} y={y + 24} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5e7396">
                E-{i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* inspector */}
      <div className="mt-3 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2"
            style={{ background: sideColor(sel, true) }}
          />
          <p className="mono-label text-ink">{sel.label}</p>
          <p className="mono-label ml-auto text-faint">
            {sel.side === "in" ? "INPUT SIGNAL" : sel.side === "core" ? "STATE CORE" : "ENGINE"}
          </p>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{sel.desc}</p>
      </div>
    </div>
  );
}
