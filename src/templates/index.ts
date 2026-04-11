export interface ShapeSlot {
  svgPath: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface BgDecoration {
  shape: "heart" | "star" | "dot" | "flower";
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
}

// Heart shape path (normalized to 0-100 viewBox)
export const heartPath =
  "M50 88 C25 65, 0 45, 0 28 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 28 C100 45, 75 65, 50 88Z";

/** Seeded PRNG (LCG) */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Predefined layouts for 1-6 images ──────────────────────────────
// Each entry: { cx, cy, size } where cx/cy are center coords in 0-100 space
// and size is the heart width as a percentage of the frame

const PRESET_LAYOUTS: { cx: number; cy: number; size: number }[][] = [
  // 1 image
  [{ cx: 50, cy: 48, size: 70 }],
  // 2 images
  [
    { cx: 30, cy: 45, size: 52 },
    { cx: 70, cy: 50, size: 48 },
  ],
  // 3 images
  [
    { cx: 50, cy: 32, size: 50 },
    { cx: 28, cy: 68, size: 44 },
    { cx: 72, cy: 68, size: 44 },
  ],
  // 4 images
  [
    { cx: 28, cy: 28, size: 42 },
    { cx: 72, cy: 28, size: 38 },
    { cx: 28, cy: 72, size: 38 },
    { cx: 72, cy: 72, size: 42 },
  ],
  // 5 images
  [
    { cx: 50, cy: 42, size: 44 },
    { cx: 18, cy: 22, size: 34 },
    { cx: 82, cy: 22, size: 34 },
    { cx: 22, cy: 76, size: 36 },
    { cx: 78, cy: 76, size: 36 },
  ],
  // 6 images
  [
    { cx: 22, cy: 30, size: 36 },
    { cx: 50, cy: 25, size: 38 },
    { cx: 78, cy: 30, size: 36 },
    { cx: 22, cy: 72, size: 38 },
    { cx: 50, cy: 75, size: 36 },
    { cx: 78, cy: 72, size: 38 },
  ],
];

/**
 * Generate heart slots with good coverage and minimal overlap.
 *
 * For 1-6 images: use hand-tuned preset layouts with slight jitter.
 * For 7+: algorithmic grid with tight spacing and subtle randomness.
 */
export function generateHearts(count: number, seed: number): ShapeSlot[] {
  const rand = seededRandom(seed);

  if (count <= 6) {
    const preset = PRESET_LAYOUTS[count - 1];
    return preset.map((p) => {
      // ±30% size jitter — big variety
      const sizeJitter = 1 + (rand() - 0.5) * 0.6;
      const size = p.size * sizeJitter;
      const height = size * 1.08;

      // ±15 units position jitter — hearts wander freely
      const jx = (rand() - 0.5) * 30;
      const jy = (rand() - 0.5) * 30;
      const x = p.cx - size / 2 + jx;
      const y = p.cy - height / 2 + jy;

      const rotation = (rand() - 0.5) * 40;

      return { svgPath: heartPath, x, y, width: size, height, rotation };
    });
  }

  // 7+ images: grid with generous overlap and randomness
  const cols = Math.ceil(Math.sqrt(count * 1.1));
  const rows = Math.ceil(count / cols);
  const totalCells = cols * rows;

  const cellW = 100 / cols;
  const cellH = 100 / rows;

  // Hearts are 1.2x cell size — noticeable overlap
  const baseSize = Math.min(cellW, cellH) * 1.2;

  // ±30% size variance — visible variety
  const minSize = baseSize * 0.7;
  const maxSize = baseSize * 1.3;

  // Assign hearts to spread grid cells
  const cellIndices: number[] = [];
  if (count >= totalCells) {
    for (let i = 0; i < totalCells; i++) cellIndices.push(i);
    for (let i = totalCells; i < count; i++) cellIndices.push(i % totalCells);
  } else {
    const step = totalCells / count;
    for (let i = 0; i < count; i++) {
      cellIndices.push(Math.floor(i * step + rand() * step * 0.3) % totalCells);
    }
    const used = new Set<number>();
    for (let i = 0; i < cellIndices.length; i++) {
      let ci = cellIndices[i];
      while (used.has(ci)) ci = (ci + 1) % totalCells;
      cellIndices[i] = ci;
      used.add(ci);
    }
  }

  return Array.from({ length: count }, (_, i) => {
    const ci = cellIndices[i];
    const col = ci % cols;
    const row = Math.floor(ci / cols);

    const size = minSize + rand() * (maxSize - minSize);
    const height = size * 1.08;

    // ±30% cell jitter — loose, organic placement
    const cx = (col + 0.5) * cellW;
    const cy = (row + 0.5) * cellH;
    const jx = (rand() - 0.5) * cellW * 0.6;
    const jy = (rand() - 0.5) * cellH * 0.6;

    const x = cx - size / 2 + jx;
    const y = cy - height / 2 + jy;
    const rotation = (rand() - 0.5) * 36;

    return { svgPath: heartPath, x, y, width: size, height, rotation };
  });
}

// ─── Background decorations ─────────────────────────────────────────

const BG_COLORS = [
  "#ff8fbf", // lighter pink
  "#e75fa0", // darker pink
  "#d4a0d4", // soft purple
  "#ffe4a0", // warm yellow
  "#ffb6c1", // light pink
  "#c9a0dc", // lavender
];

const SHAPES: BgDecoration["shape"][] = ["heart", "star", "dot", "flower"];

export function generateBackgroundDecorations(seed: number): BgDecoration[] {
  const rand = seededRandom(seed + 9999);
  const count = 35;
  const decorations: BgDecoration[] = [];

  for (let i = 0; i < count; i++) {
    decorations.push({
      shape: SHAPES[Math.floor(rand() * SHAPES.length)],
      x: rand() * 100,
      y: rand() * 100,
      size: 2.5 + rand() * 3.5,
      rotation: rand() * 360,
      opacity: 0.12 + rand() * 0.13,
      color: BG_COLORS[Math.floor(rand() * BG_COLORS.length)],
    });
  }

  return decorations;
}
