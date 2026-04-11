import { useRef, useState, useMemo, useCallback } from "react";
import { generateHearts, generateBackgroundDecorations, heartPath } from "../templates";
import type { ShapeSlot, BgDecoration } from "../templates";
import { shuffle } from "../utils/shuffle";
import { exportCollageAsPng } from "../utils/exportPng";

/**
 * Cuteness levels:
 * 0 = Plain: flat pink bg, thin dark strokes, simple rect frame, no effects
 * 1 = A little cute: gradient bg, rose gold strokes
 * 2 = Pretty cute: + drop shadows, scalloped frame
 * 3 = Very cute: + sparkles, corner flourishes
 * 4 = Maximum cuteness: + confetti on shuffle, pop-in animation
 */

// Sparkle positions
const SPARKLES = [
  { x: 8, y: 12, size: 2.5, delay: 0 },
  { x: 85, y: 8, size: 2, delay: 0.3 },
  { x: 92, y: 55, size: 2.8, delay: 0.7 },
  { x: 12, y: 88, size: 2.2, delay: 1.0 },
  { x: 50, y: 5, size: 1.8, delay: 0.5 },
  { x: 5, y: 50, size: 2.4, delay: 1.2 },
  { x: 88, y: 90, size: 2, delay: 0.2 },
  { x: 45, y: 92, size: 2.6, delay: 0.8 },
];

const starPath = (cx: number, cy: number, r: number) =>
  `M${cx},${cy - r} L${cx + r * 0.3},${cy - r * 0.3} L${cx + r},${cy} L${cx + r * 0.3},${cy + r * 0.3} L${cx},${cy + r} L${cx - r * 0.3},${cy + r * 0.3} L${cx - r},${cy} L${cx - r * 0.3},${cy - r * 0.3}Z`;

const CONFETTI_COLORS = [
  "#f06292",
  "#ec407a",
  "#f48fb1",
  "#ce93d8",
  "#ba68c8",
  "#ffab91",
  "#ff8a65",
  "#ffd54f",
  "#aed581",
  "#80deea",
];

interface Props {
  images: string[];
  onBack: () => void;
  cuteness: number;
}

export function CollageView({ images, onBack, cuteness }: Props) {
  const collageRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [confettiPieces, setConfettiPieces] = useState<React.CSSProperties[]>([]);

  // Derived style settings from cuteness level
  const useGradient = cuteness >= 1;
  const useRoseGold = cuteness >= 1;
  const useShadows = cuteness >= 2;
  const useScalloped = cuteness >= 2;
  const useSparkles = cuteness >= 3;
  const useFlourishes = cuteness >= 3;
  const useConfetti = cuteness >= 4;
  const usePopIn = cuteness >= 4;

  const bgColor = useGradient ? undefined : "#ff69b4";
  const strokeColor = useRoseGold ? "#cc0000" : "#888";
  const strokeWidth = useRoseGold ? 1.8 : 1;
  const exportBg = "#ff69b4";

  const useDecorations = cuteness >= 1;

  const slots: ShapeSlot[] = useMemo(
    () => generateHearts(images.length, seed),
    [images.length, seed],
  );

  const bgDecorations: BgDecoration[] = useMemo(
    () => (useDecorations ? generateBackgroundDecorations(seed) : []),
    [seed, useDecorations],
  );

  const [assignment, setAssignment] = useState<number[]>(() => shuffle(images.map((_, i) => i)));

  const handleArmanio = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
    setAssignment((prev) => {
      let next = shuffle(prev);
      while (next.every((v, i) => v === prev[i]) && prev.length > 1) {
        next = shuffle(prev);
      }
      return next;
    });
    if (useConfetti) {
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        animationDelay: `${Math.random() * 0.8}s`,
        animationDuration: `${1.5 + Math.random() * 1}s`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        transform: `rotate(${Math.random() * 360}deg)`,
      }));
      setConfettiPieces(pieces);
      setTimeout(() => setConfettiPieces([]), 2200);
    }
  }, [useConfetti]);

  async function handleDownload() {
    if (!collageRef.current) return;
    setExporting(true);
    try {
      await exportCollageAsPng(collageRef.current, exportBg);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Try again.");
    }
    setExporting(false);
  }

  // Scalloped border
  const scallops = useMemo(() => {
    const r = 2.5;
    const n = 16;
    let d = `M ${r} 0`;
    for (let i = 0; i < n; i++) {
      const x1 = (i + 0.5) * (100 / n);
      const x2 = (i + 1) * (100 / n);
      d += ` Q ${x1} ${r * 1.5}, ${x2} 0`;
    }
    for (let i = 0; i < n; i++) {
      const y1 = (i + 0.5) * (100 / n);
      const y2 = (i + 1) * (100 / n);
      d += ` Q ${100 - r * 1.5} ${y1}, 100 ${y2}`;
    }
    for (let i = n - 1; i >= 0; i--) {
      const x1 = (i + 0.5) * (100 / n);
      const x2 = i * (100 / n);
      d += ` Q ${x1} ${100 - r * 1.5}, ${x2} 100`;
    }
    for (let i = n - 1; i >= 0; i--) {
      const y1 = (i + 0.5) * (100 / n);
      const y2 = i * (100 / n);
      d += ` Q ${r * 1.5} ${y1}, 0 ${y2}`;
    }
    d += "Z";
    return d;
  }, []);

  const flourishSize = 8;

  return (
    <div className="screen">
      <button className="back-btn" onClick={onBack}>
        &larr; Back
      </button>

      <div className="collage-wrapper" ref={collageRef}>
        <svg viewBox="0 0 100 100" className="collage-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {useGradient && (
              <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff69b4" />
                <stop offset="50%" stopColor="#ff85c8" />
                <stop offset="100%" stopColor="#e991c9" />
              </linearGradient>
            )}
            {useShadows && (
              <filter id="heart-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0.3"
                  dy="0.5"
                  stdDeviation="0.8"
                  floodColor="#8b3a62"
                  floodOpacity="0.3"
                />
              </filter>
            )}
            {slots.map((slot, i) => (
              <clipPath
                key={`clip-${seed}-${i}`}
                id={`clip-${i}`}
                clipPathUnits="objectBoundingBox"
              >
                <path d={slot.svgPath} transform="scale(0.01, 0.01)" />
              </clipPath>
            ))}
          </defs>

          {/* Background */}
          <rect width="100" height="100" fill={useGradient ? "url(#bg-gradient)" : bgColor!} />

          {/* Background decorations */}
          {bgDecorations.map((d, i) => (
            <g
              key={`bg-${i}`}
              transform={`translate(${d.x}, ${d.y}) rotate(${d.rotation})`}
              opacity={d.opacity}
            >
              {d.shape === "heart" && (
                <path d={heartPath} fill={d.color} transform={`scale(${d.size / 100})`} />
              )}
              {d.shape === "star" && <path d={starPath(0, 0, d.size)} fill={d.color} />}
              {d.shape === "dot" && <circle r={d.size * 0.5} fill={d.color} />}
              {d.shape === "flower" && (
                <g fill={d.color}>
                  {[0, 72, 144, 216, 288].map((angle) => (
                    <circle
                      key={angle}
                      cx={Math.cos((angle * Math.PI) / 180) * d.size * 0.4}
                      cy={Math.sin((angle * Math.PI) / 180) * d.size * 0.4}
                      r={d.size * 0.35}
                    />
                  ))}
                  <circle r={d.size * 0.25} fill="#ffe4a0" opacity={0.6} />
                </g>
              )}
            </g>
          ))}

          {/* Hearts */}
          {slots.map((slot, i) => {
            const imgIndex = assignment[i];
            return (
              <g
                key={`${seed}-${i}`}
                className={usePopIn ? "heart-group" : undefined}
                style={usePopIn ? { animationDelay: `${i * 0.04}s` } : undefined}
                transform={`translate(${slot.x}, ${slot.y})${slot.rotation ? ` rotate(${slot.rotation}, ${slot.width / 2}, ${slot.height / 2})` : ""}`}
                filter={useShadows ? "url(#heart-shadow)" : undefined}
              >
                <foreignObject
                  x={0}
                  y={0}
                  width={slot.width}
                  height={slot.height}
                  clipPath={`url(#clip-${i})`}
                >
                  <img
                    src={images[imgIndex]}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </foreignObject>
                <path
                  d={slot.svgPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform={`scale(${slot.width / 100}, ${slot.height / 100})`}
                />
              </g>
            );
          })}

          {/* Sparkles */}
          {useSparkles &&
            SPARKLES.map((s, i) => (
              <path
                key={`sparkle-${i}`}
                className="sparkle"
                d={starPath(s.x, s.y, s.size)}
                fill="#ffe4a0"
                opacity={0.8}
                style={{ animationDelay: `${s.delay}s` }}
              />
            ))}

          {/* Corner flourishes */}
          {useFlourishes && (
            <g opacity="0.5" stroke="#fff" strokeWidth="0.5" fill="none" strokeLinecap="round">
              <path d={`M 2 ${flourishSize} Q 2 2, ${flourishSize} 2`} />
              <path d={`M 4 ${flourishSize - 1} Q 4 4, ${flourishSize - 1} 4`} />
              <path d={`M ${100 - flourishSize} 2 Q 98 2, 98 ${flourishSize}`} />
              <path d={`M ${100 - flourishSize + 1} 4 Q 96 4, 96 ${flourishSize - 1}`} />
              <path d={`M 98 ${100 - flourishSize} Q 98 98, ${100 - flourishSize} 98`} />
              <path d={`M 96 ${100 - flourishSize + 1} Q 96 96, ${100 - flourishSize + 1} 96`} />
              <path d={`M ${flourishSize} 98 Q 2 98, 2 ${100 - flourishSize}`} />
              <path d={`M ${flourishSize - 1} 96 Q 4 96, 4 ${100 - flourishSize + 1}`} />
            </g>
          )}

          {/* Frame */}
          {useScalloped ? (
            <path d={scallops} fill="none" stroke={strokeColor} strokeWidth="1.2" />
          ) : (
            <rect
              x={0.5}
              y={0.5}
              width={99}
              height={99}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1}
            />
          )}
        </svg>
      </div>

      <div className="actions">
        <button className="btn btn-shuffle" onClick={handleArmanio}>
          &hearts; Armanio! &hearts;
        </button>
        <button className="btn btn-primary" onClick={handleDownload} disabled={exporting}>
          {exporting ? "Exporting..." : "\u{1F4BE} Download"}
        </button>
      </div>

      {/* Confetti */}
      {confettiPieces.length > 0 && (
        <div className="confetti-container">
          {confettiPieces.map((style, i) => (
            <div key={i} className="confetti-piece" style={style} />
          ))}
        </div>
      )}
    </div>
  );
}
