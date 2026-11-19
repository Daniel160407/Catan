// Shared between client (app/) and server (server/) — Nuxt 4 auto-imports from shared/.

export type Resource = 'wood' | 'brick' | 'wool' | 'grain' | 'ore'
export type Terrain = Resource | 'desert'

/** Axial hex coordinates (q, r). */
export interface HexCoord { q: number, r: number }

export interface Tile extends HexCoord {
  terrain: Terrain
  /** Dice number token (2–12, no 7). Null for desert. */
  number: number | null
}

/**
 * A harbor on one coastal edge. Stored from the land side: the land hex plus
 * the edge index (0 = east, then clockwise: SE, SW, W, NW, NE). The harbor
 * serves the two corners of that edge. 'any' = generic 3:1, a resource = 2:1.
 */
export interface Port extends HexCoord {
  side: number
  kind: Resource | 'any'
}

export interface Player {
  id: string
  name: string
  color: string
  resources: Record<Resource, number>
  victoryPoints: number
}

export type Phase = 'lobby' | 'setup' | 'playing' | 'finished'

export interface GameState {
  id: string
  phase: Phase
  /** Player id of the lobby host (can start the game). */
  hostId: string
  tiles: Tile[]
  ports: Port[]
  players: Player[]
  currentPlayerIndex: number
  robber: HexCoord
  lastRoll: [number, number] | null
}
