import { serverSupabaseServiceRole } from '#supabase/server'
import { createGameState } from '#shared/game/create'
import { cleanName, newPlayer, PLAYER_COLORS } from '#shared/game/lobby'
import type { Database, Json } from '#shared/types/database.types'

/** Create a new game (in its lobby) with the caller as host. */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const playerId = requirePlayerId(body?.playerId)
  const name = cleanName(body?.name)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Enter your name' })

  const db = serverSupabaseServiceRole<Database>(event)
  const id = crypto.randomUUID().slice(0, 8)
  const state = createGameState(id, newPlayer(playerId, name, PLAYER_COLORS[0]))

  const { error } = await db.from('games').insert({ id, phase: state.phase, state: state as unknown as Json })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return state
})
