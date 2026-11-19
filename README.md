# Hex Settlers

An online, multiplayer hex-tile settlement & trading board game, built with Nuxt 4.

## Stack
- **Nuxt 4** (Vue 3, TypeScript) — `app/` client, `server/` Nitro backend, `shared/` code used by both
- **Pinia** for client state, **VueUse** utilities
- **Tailwind CSS v4** (theme colors in `app/assets/css/main.css`)
- **Nitro WebSockets** (`server/routes/_ws.ts`) for real-time play

## Layout
```
app/
  pages/            index (lobby) and game/[id]
  components/board/ SVG hex board
  stores/           Pinia stores
shared/game/        game types, board generation, hex math (no DOM / server deps)
server/routes/_ws.ts  WebSocket endpoint
```

## Develop
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck
pnpm build
```

## Database (Supabase)
- Schema lives in `supabase/migrations/`. The `games` table stores each game's full state as JSON.
- Browsers can **read** games and get live updates (Realtime). Only the Nuxt server **writes**, using the secret key (`server/api/`).

Setup:
1. Create a project at supabase.com and copy `.env.example` to `.env` with its URL, publishable key and secret key.
2. Apply the schema:
   ```bash
   pnpm exec supabase login
   pnpm exec supabase link --project-ref <project-ref>
   pnpm db:push
   ```
   (or paste the migration SQL into the dashboard's SQL Editor)
3. Optional: `pnpm db:types` regenerates `shared/types/database.types.ts` from the live schema.
