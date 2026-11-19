import type { HexCoord, Port, Resource, Terrain, Tile } from './types'

const TERRAIN_POOL: Terrain[] = [
  ...Array(4).fill('wood'), ...Array(4).fill('wool'), ...Array(4).fill('grain'),
  ...Array(3).fill('brick'), ...Array(3).fill('ore'), 'desert',
]
const NUMBER_POOL = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]

/** All axial coords within `radius` of the center (radius 2 → 19 hexes). */
export function hexesInRadius(radius: number): HexCoord[] {
  const out: HexCoord[] = []
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++)
      out.push({ q, r })
  }
  return out
}

function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Random standard-size board. TODO: prevent adjacent 6/8 tokens. */
export function generateBoard(rand = Math.random): Tile[] {
  const terrains = shuffle(TERRAIN_POOL, rand)
  const numbers = shuffle(NUMBER_POOL, rand)
  return hexesInRadius(2).map((c, i) => {
    const terrain = terrains[i]!
    return { ...c, terrain, number: terrain === 'desert' ? null : numbers.pop()! }
  })
}

/** Axial neighbour offsets, indexed by edge: 0 = E, 1 = SE, 2 = SW, 3 = W, 4 = NW, 5 = NE. */
export const DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
]

export const neighbor = (h: HexCoord, side: number): HexCoord =>
  ({ q: h.q + DIRECTIONS[side]!.q, r: h.r + DIRECTIONS[side]!.r })

const distance = (h: HexCoord) => Math.max(Math.abs(h.q), Math.abs(h.r), Math.abs(h.q + h.r))

/** Base game: 4 generic 3:1 harbors and one 2:1 harbor per resource. */
const PORT_POOL: Port['kind'][] = ['any', 'any', 'any', 'any', 'wood', 'brick', 'wool', 'grain', 'ore']

/**
 * Positions of the 9 harbors among the 30 coastal edges (counted around the
 * island starting at an edge facing a corner sea hex). Gaps of 2–3 edges keep
 * harbors evenly spread and never sharing an intersection.
 */
const PORT_EDGE_SLOTS = [0, 3, 7, 10, 13, 17, 20, 23, 27]

/** Random harbor types on the fixed, evenly spread coastal positions. */
export function generatePorts(rand = Math.random, radius = 2): Port[] {
  // Every land-hex edge that faces the sea, sorted by angle around the island.
  const coast: { hex: HexCoord, side: number, angle: number, corner: boolean }[] = []
  for (const hex of hexesInRadius(radius)) {
    for (let side = 0; side < 6; side++) {
      const sea = neighbor(hex, side)
      if (distance(sea) <= radius) continue
      const landAround = DIRECTIONS.filter((_, d) => distance(neighbor(sea, d)) <= radius).length
      const mid = hexToPixel(hex, 1), off = hexToPixel(DIRECTIONS[side]!, 0.5)
      coast.push({ hex, side, angle: Math.atan2(mid.y + off.y, mid.x + off.x), corner: landAround === 1 })
    }
  }
  coast.sort((a, b) => a.angle - b.angle)
  // Rotate so slot 0 is an edge facing a corner sea hex (touches only one land hex).
  const start = coast.findIndex(e => e.corner)
  const ordered = [...coast.slice(start), ...coast.slice(0, start)]

  const kinds = shuffle(PORT_POOL, rand)
  return PORT_EDGE_SLOTS.map((slot, i) => {
    const { hex, side } = ordered[slot]!
    return { q: hex.q, r: hex.r, side, kind: kinds[i]! }
  })
}

/** Axial → pixel center for pointy-top hexes of the given size. */
export function hexToPixel({ q, r }: HexCoord, size: number) {
  return { x: size * Math.sqrt(3) * (q + r / 2), y: size * 1.5 * r }
}
