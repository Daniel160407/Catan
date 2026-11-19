import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/supabase'],
  supabase: {
    types: '~~/shared/types/database.types.ts',
    // No login yet — don't force-redirect visitors to /login.
    redirect: false,
  },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  // Nitro WebSockets power real-time multiplayer (server/routes/_ws.ts)
  nitro: { experimental: { websocket: true } },
  app: { head: { title: 'Hex Settlers' } },
})
