// Real-time multiplayer channel. Connect from the client with: new WebSocket(`ws://${location.host}/_ws`)
// TODO: rooms per game id, authoritative game state, action validation.
export default defineWebSocketHandler({
  open(peer) {
    peer.send(JSON.stringify({ type: 'hello', id: peer.id }))
  },
  message(peer, message) {
    // Echo for now — replace with game action handling.
    peer.send(message.text())
  },
})
