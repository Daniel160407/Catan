<script setup lang="ts">
import { MAX_NAME_LENGTH } from '#shared/game/lobby'

const game = useGameStore()
const player = usePlayer()
const busy = ref(false)
const error = ref('')
const code = ref('')

async function create() {
  if (!player.name.value.trim()) { error.value = 'Enter your name first'; return }
  busy.value = true
  error.value = ''
  try {
    const id = await game.createGame(player.name.value.trim())
    await navigateTo(`/game/${id}`)
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Could not create game'
  }
  finally {
    busy.value = false
  }
}

function joinByCode() {
  // Accept a bare code or a pasted invite link.
  const id = code.value.trim().split('/').filter(Boolean).pop()
  if (id) navigateTo(`/game/${id}`)
}
</script>

<template>
  <main class="min-h-dvh bg-sea text-white grid place-items-center p-6">
    <div class="w-full max-w-sm text-center space-y-6">
      <h1 class="text-5xl font-bold tracking-tight">Hex Settlers</h1>
      <p class="opacity-80">Build, trade and settle an island with friends.</p>

      <ClientOnly>
        <form class="space-y-3" @submit.prevent="create">
          <input v-model="player.name.value" :maxlength="MAX_NAME_LENGTH" placeholder="Your name" aria-label="Your name"
                 class="w-full rounded-lg bg-white/10 px-4 py-3 placeholder-white/50 outline-none focus:ring-2 focus:ring-grain">
          <button type="submit" class="w-full rounded-lg bg-grain px-6 py-3 font-semibold text-gray-900 hover:brightness-110 disabled:opacity-60"
                  :disabled="busy">
            {{ busy ? 'Creating…' : 'New game' }}
          </button>
        </form>
      </ClientOnly>

      <form class="flex gap-2" @submit.prevent="joinByCode">
        <input v-model="code" placeholder="Game code or link" aria-label="Game code or link"
               class="min-w-0 flex-1 rounded-lg bg-white/10 px-4 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-grain">
        <button type="submit" class="rounded-lg border border-white/40 px-4 py-2 font-semibold hover:bg-white/10" :disabled="!code.trim()">
          Join
        </button>
      </form>

      <p v-if="error" class="text-red-200 text-sm">{{ error }}</p>
    </div>
  </main>
</template>
