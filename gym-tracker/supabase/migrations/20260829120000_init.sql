-- GymTracker v1 schema. Idempotent so it can be re-run safely.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  current_phase smallint not null default 1
    constraint profiles_current_phase_range check (current_phase between 1 and 4),
  water_goal_ml integer not null default 3000
    constraint profiles_water_goal_positive check (water_goal_ml > 0),
  water_reminders boolean not null default true,
  morning_reminder boolean not null default true,
  streak_reminder boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  exercise_id text not null,
  completed boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint exercise_logs_user_date_exercise_key unique (user_id, log_date, exercise_id)
);

drop trigger if exists exercise_logs_set_updated_at on public.exercise_logs;
create trigger exercise_logs_set_updated_at
  before update on public.exercise_logs
  for each row execute function public.set_updated_at();

create index if not exists exercise_logs_user_date_idx
  on public.exercise_logs (user_id, log_date);

create table if not exists public.water_sips (
  id uuid primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  ml integer not null constraint water_sips_ml_positive check (ml > 0),
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists water_sips_user_date_idx
  on public.water_sips (user_id, log_date);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.water_sips enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "exercise_logs_own" on public.exercise_logs;
create policy "exercise_logs_own"
  on public.exercise_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "water_sips_own" on public.water_sips;
create policy "water_sips_own"
  on public.water_sips
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.exercise_logs to authenticated;
grant select, insert, update, delete on public.water_sips to authenticated;

notify pgrst, 'reload schema';
