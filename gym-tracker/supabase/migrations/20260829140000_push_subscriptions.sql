-- Push subscriptions and reminder-send bookkeeping for iPhone PWAs.

alter table public.profiles
  add column if not exists time_zone text;

alter table public.profiles
  add column if not exists last_water_push_key text;

alter table public.profiles
  add column if not exists last_morning_push_date date;

alter table public.profiles
  add column if not exists last_streak_push_date date;

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  time_zone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_own" on public.push_subscriptions;
create policy "push_subscriptions_own"
  on public.push_subscriptions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.push_subscriptions to authenticated;

notify pgrst, 'reload schema';
