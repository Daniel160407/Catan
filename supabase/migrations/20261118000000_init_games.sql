-- Games: one row per game. `state` holds the full GameState (shared/game/types.ts).
-- Writes happen only on the Nuxt server (secret key bypasses RLS), so the server
-- stays the authority on game rules. Browsers may read and subscribe to changes.

create table public.games (
  id          text primary key,
  phase       text not null default 'lobby'
              check (phase in ('lobby', 'setup', 'playing', 'finished')),
  state       jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

alter table public.games enable row level security;

create policy "Games are readable by everyone"
  on public.games for select
  to anon, authenticated
  using (true);

-- Broadcast row changes to subscribed clients (Supabase Realtime).
alter publication supabase_realtime add table public.games;
