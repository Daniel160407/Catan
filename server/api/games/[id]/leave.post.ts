/** Leave a game's lobby. If the host leaves, the next player becomes host. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const playerId = requirePlayerId((await readBody(event))?.playerId)

  return updateGame(event, id, (state) => {
    requireLobby(state)
    state.players = state.players.filter(p => p.id !== playerId)
    if (state.hostId === playerId && state.players.length)
      state.hostId = state.players[0]!.id
  })
})
