import { cleanName, freeColor, MAX_PLAYERS, newPlayer } from '#shared/game/lobby'

/** Join a game's lobby. Joining again just updates your name. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const playerId = requirePlayerId(body?.playerId)
  const name = cleanName(body?.name)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Enter your name' })

  return updateGame(event, id, (state) => {
    const me = state.players.find(p => p.id === playerId)
    if (me) { me.name = name; return }
    requireLobby(state)
    if (state.players.length >= MAX_PLAYERS)
      throw createError({ statusCode: 409, statusMessage: 'Lobby is full' })
    state.players.push(newPlayer(playerId, name, freeColor(state)))
  })
})
