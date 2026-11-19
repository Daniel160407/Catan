import { generateBoard, generatePorts } from './board'
import type { GameState, Player } from './types'

export function createGameState(id: string, host: Player): GameState {
  const tiles = generateBoard()
  const desert = tiles.find(t => t.terrain === 'desert')!
  return {
    id,
    phase: 'lobby',
    hostId: host.id,
    tiles,
    ports: generatePorts(),
    players: [host],
    currentPlayerIndex: 0,
    robber: { q: desert.q, r: desert.r },
    lastRoll: null,
  }
}
