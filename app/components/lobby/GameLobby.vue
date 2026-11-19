<script setup lang="ts">
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS } from '#shared/game/lobby'

const props = defineProps<{ id: string }>()
const game = useGameStore()
const player = usePlayer()
const busy = ref(false)
const error = ref('')
const copied = ref(false)

const players = computed(() => game.state?.players ?? [])
const full = computed(() => players.value.length >= MAX_PLAYERS)
const canStart = computed(() => players.value.length >= MIN_PLAYERS)
const inviteLink = computed(() => import.meta.client ? `${location.origin}/game/${props.id}` : '')

async function run(fn: () => Promise<unknown>) {
  busy.value = true
  error.value = ''
  try { await fn() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Something went wrong' }
  finally { busy.value = false }
}

function join() {
  const name = player.name.value.trim()
  if (!name) { error.value = 'Enter your name'; return }
  run(() => game.join(props.id, name))
}
const leave = () => run(async () => { await game.leave(props.id); await navigateTo('/') })
const start = () => run(() => game.start(props.id))

async function copyLink() {
  await navigator.clipboard.writeText(inviteLink.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <section class="w-full max-w-md rounded-2xl bg-[#173b5c]/95 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur space-y-6">
    <div class="text-center space-y-1">
      <h2 class="text-3xl font-bold">Lobby</h2>
      <p class="opacity-80 text-sm">Share the link below — friends join from it.</p>
    </div>

    <div class="flex gap-2">
      <input :value="inviteLink" readonly aria-label="Invite link"
             class="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 font-mono text-sm outline-none"
             @focus="($event.target as HTMLInputElement).select()">
      <button class="rounded-lg border border-white/40 px-3 py-2 text-sm font-semibold hover:bg-white/10" @click="copyLink">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide opacity-70">
        Players {{ players.length }}/{{ MAX_PLAYERS }}
      </h3>
      <ul class="space-y-2">
        <li v-for="p in players" :key="p.id" class="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2">
          <span class="size-4 shrink-0 rounded-full ring-2 ring-black/30" :style="{ background: p.color }" />
          <span class="flex-1 truncate">{{ p.name }}</span>
          <span v-if="p.id === game.state?.hostId" class="text-xs rounded bg-grain px-2 py-0.5 font-semibold text-gray-900">Host</span>
          <span v-if="p.id === player.id.value" class="text-xs opacity-70">you</span>
        </li>
        <li v-for="n in MAX_PLAYERS - players.length" :key="`empty-${n}`"
            class="rounded-lg border border-dashed border-white/25 px-3 py-2 text-sm opacity-50">
          Waiting for player…
        </li>
      </ul>
    </div>

    <form v-if="!game.me" class="space-y-2" @submit.prevent="join">
      <template v-if="!full">
        <input v-model="player.name.value" :maxlength="MAX_NAME_LENGTH" placeholder="Your name" aria-label="Your name"
               class="w-full rounded-lg bg-white/10 px-4 py-3 placeholder-white/50 outline-none focus:ring-2 focus:ring-grain">
        <button type="submit" :disabled="busy"
                class="w-full rounded-lg bg-grain px-6 py-3 font-semibold text-gray-900 hover:brightness-110 disabled:opacity-60">
          {{ busy ? 'Joining…' : 'Join game' }}
        </button>
      </template>
      <p v-else class="text-center opacity-80">This lobby is full.</p>
    </form>

    <div v-else class="space-y-2">
      <button v-if="game.isHost" :disabled="busy || !canStart"
              class="w-full rounded-lg bg-grain px-6 py-3 font-semibold text-gray-900 hover:brightness-110 disabled:opacity-60"
              @click="start">
        {{ canStart ? 'Start game' : `Need ${MIN_PLAYERS - players.length} more player${MIN_PLAYERS - players.length > 1 ? 's' : ''}` }}
      </button>
      <p v-else class="text-center opacity-80">Waiting for the host to start…</p>
      <button :disabled="busy" class="w-full rounded-lg px-6 py-2 text-sm opacity-80 hover:opacity-100 hover:bg-white/10" @click="leave">
        Leave lobby
      </button>
    </div>

    <p v-if="error" class="text-center text-sm text-red-200">{{ error }}</p>
  </section>
</template>
