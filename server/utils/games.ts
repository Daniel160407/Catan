import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { GameState } from '#shared/game/types'
import type { Database, Json } from '#shared/types/database.types'

/** Read a request body field that identifies the acting player. */
export function requirePlayerId(value: unknown): string {
  if (typeof value !== 'string' || !/^[\w-]{8,64}$/.test(value))
    throw createError({ statusCode: 400, statusMessage: 'Missing player id' })
  return value
}

/**
 * Read-modify-write a game's state. Uses `updated_at` as a version so two
 * players joining at the same moment can't overwrite each other — on a
 * conflict the change is re-applied to the fresh state.
 */
export async function updateGame(event: H3Event, id: string, change: (state: GameState) => void): Promise<GameState> {
  const db = serverSupabaseServiceRole<Database>(event)
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db.from('games').select('state, updated_at').eq('id', id).maybeSingle()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Game not found' })

    const state = data.state as unknown as GameState
    change(state)

    const { data: saved, error: saveError } = await db.from('games')
      .update({ phase: state.phase, state: state as unknown as Json })
      .eq('id', id).eq('updated_at', data.updated_at)
      .select('id')
    if (saveError) throw createError({ statusCode: 500, statusMessage: saveError.message })
    if (saved.length) return state
  }
  throw createError({ statusCode: 409, statusMessage: 'Game is busy, try again' })
}

export function requireLobby(state: GameState) {
  if (state.phase !== 'lobby')
    throw createError({ statusCode: 409, statusMessage: 'Game has already started' })
}
