/**
 * This browser's player identity (no accounts yet): a random id plus the
 * last name used, remembered in localStorage.
 */
export function usePlayer() {
  const id = useLocalStorage('hex-settlers:player-id', () => crypto.randomUUID())
  const name = useLocalStorage('hex-settlers:player-name', '')
  return { id, name }
}
