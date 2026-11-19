import { MIN_PLAYERS } from '#shared/game/lobby'

/** Host starts the game: lobby → setup. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const playerId = requirePlayerId((await readBody(event))?.playerId)

  return updateGame(event, id, (state) => {
    requireLobby(state)
    if (state.hostId !== playerId)
      throw createError({ statusCode: 403, statusMessage: 'Only the host can start the game' })
    if (state.players.length < MIN_PLAYERS)
      throw createError({ statusCode: 409, statusMessage: `Need at least ${MIN_PLAYERS} players` })
    state.phase = 'setup'
    state.currentPlayerIndex = 0
  })
})
