<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string
const game = useGameStore()

const { data: found } = await useAsyncData(`game-${id}`, () => game.load(id))
if (!found.value) throw createError({ statusCode: 404, statusMessage: 'Game not found', fatal: true })

onMounted(() => game.subscribe(id))
onBeforeUnmount(() => game.unsubscribe())
</script>

<template>
  <main class="min-h-dvh bg-sea bg-[url(/tiles/sea.jpg)] bg-size-[384px] text-white flex flex-col items-center gap-6 p-6">
    <header class="w-full max-w-2xl flex justify-between items-center">
      <NuxtLink to="/" class="opacity-80 hover:opacity-100">← Home</NuxtLink>
      <span class="font-mono text-sm opacity-80">Game {{ id }}</span>
    </header>
    <!-- Lobby uses this browser's player id (localStorage), so render it client-side only. -->
    <ClientOnly v-if="game.state?.phase === 'lobby'">
      <LobbyGameLobby :id="id" />
    </ClientOnly>
    <BoardHexBoard v-else-if="game.state" :tiles="game.state.tiles" :ports="game.state.ports" />
  </main>
</template>
