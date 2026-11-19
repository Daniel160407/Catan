import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { GameState } from '#shared/game/types'
import type { Database } from '#shared/types/database.types'

export const useGameStore = defineStore('game', () => {
  const supabase = useSupabaseClient<Database>()
  const player = usePlayer()
  const state = ref<GameState | null>(null)
  let channel: RealtimeChannel | null = null

  const me = computed(() => state.value?.players.find(p => p.id === player.id.value) ?? null)
  const isHost = computed(() => !!state.value && state.value.hostId === player.id.value)

  /** Ask the server to create a game (with you as host); returns its id. */
  async function createGame(name: string) {
    const game = await $fetch<GameState>('/api/games', {
      method: 'POST', body: { playerId: player.id.value, name },
    })
    state.value = game
    return game.id
  }

  async function action(id: string, name: 'join' | 'leave' | 'start', body: Record<string, unknown> = {}) {
    state.value = await $fetch<GameState>(`/api/games/${id}/${name}`, {
      method: 'POST', body: { playerId: player.id.value, ...body },
    })
  }
  const join = (id: string, name: string) => action(id, 'join', { name })
  const leave = (id: string) => action(id, 'leave')
  const start = (id: string) => action(id, 'start')

  /** Load a game by id. Returns false if it doesn't exist. */
  async function load(id: string) {
    const { data, error } = await supabase.from('games').select('state').eq('id', id).maybeSingle()
    if (error) throw error
    state.value = (data?.state as unknown as GameState) ?? null
    return !!data
  }

  /** Keep `state` in sync with database changes (browser only). */
  function subscribe(id: string) {
    unsubscribe()
    channel = supabase
      .channel(`game:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` },
        (payload) => { state.value = payload.new.state as GameState })
      .subscribe()
  }

  function unsubscribe() {
    if (channel) supabase.removeChannel(channel)
    channel = null
  }

  return { state, me, isHost, createGame, join, leave, start, load, subscribe, unsubscribe }
})
