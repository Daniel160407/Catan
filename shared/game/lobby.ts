import type { GameState, Player } from './types'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4
export const PLAYER_COLORS = ['#d64545', '#3b6fd6', '#f0f0f0', '#e8892b'] as const
export const MAX_NAME_LENGTH = 20

export function cleanName(name: unknown): string {
  return typeof name === 'string' ? name.trim().slice(0, MAX_NAME_LENGTH) : ''
}

export function newPlayer(id: string, name: string, color: string): Player {
  return {
    id, name, color,
    resources: { wood: 0, brick: 0, wool: 0, grain: 0, ore: 0 },
    victoryPoints: 0,
  }
}

/** First color no current player is using. */
export function freeColor(state: Pick<GameState, 'players'>): string {
  return PLAYER_COLORS.find(c => !state.players.some(p => p.color === c)) ?? PLAYER_COLORS[0]
}
