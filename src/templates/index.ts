export interface ShapeSlot {
  svgPath: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
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

/**
 * Generate heart slots that guarantee high frame coverage.
 *
 * Algorithm:
 * 1. Compute a grid (cols × rows) that fits `count` hearts
 * 2. Hearts are sized relative to cells so they overlap neighbors by ~25%
 * 3. Grid centers are within the frame; hearts can extend past the edges
 * 4. Small random jitter on position, size, and rotation for organic feel
 *
 * Size ratio: smallest heart is 1/3 the linear size of the largest.
 */
export function generateHearts(count: number, seed: number): ShapeSlot[] {
  const rand = seededRandom(seed);

  // Grid dimensions
  const cols = Math.ceil(Math.sqrt(count * 1.15));
  const rows = Math.ceil(count / cols);
  const totalCells = cols * rows;

  // Grid spans the full frame. Hearts will naturally overflow at edges.
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  // Base heart size: slightly larger than a cell for ~25% overlap
  const baseSize = Math.min(cellW, cellH) * 1.25;

  // Size range: 1:3 ratio centered on baseSize
  // min = baseSize * 0.6, max = baseSize * 1.8 → ratio is 1:3
  const minSize = baseSize * 0.6;
  const maxSize = baseSize * 1.8;

  // Assign hearts to well-spread grid cells
  const cellIndices: number[] = [];
  if (count >= totalCells) {
    for (let i = 0; i < totalCells; i++) cellIndices.push(i);
    // If count > totalCells, wrap around with offset
    for (let i = totalCells; i < count; i++) {
      cellIndices.push(i % totalCells);
    }
  } else {
    const step = totalCells / count;
    for (let i = 0; i < count; i++) {
      cellIndices.push(Math.floor(i * step + rand() * step * 0.4) % totalCells);
    }
    const used = new Set<number>();
    for (let i = 0; i < cellIndices.length; i++) {
      let ci = cellIndices[i];
      while (used.has(ci)) ci = (ci + 1) % totalCells;
      cellIndices[i] = ci;
      used.add(ci);
    }
  }

  const slots: ShapeSlot[] = [];

  for (let i = 0; i < count; i++) {
    const ci = cellIndices[i];
    const col = ci % cols;
    const row = Math.floor(ci / cols);

    // Size: random within 1:3 range
    const size = minSize + rand() * (maxSize - minSize);
    const height = size * 1.08;

    // Center of grid cell + jitter (±20% of cell)
    const cx = (col + 0.5) * cellW;
    const cy = (row + 0.5) * cellH;
    const jx = (rand() - 0.5) * cellW * 0.4;
    const jy = (rand() - 0.5) * cellH * 0.4;

    const x = cx - size / 2 + jx;
    const y = cy - height / 2 + jy;

    // Rotation: ±18°
    const rotation = (rand() - 0.5) * 36;

    slots.push({ svgPath: heartPath, x, y, width: size, height, rotation });
  }

  return slots;
}
