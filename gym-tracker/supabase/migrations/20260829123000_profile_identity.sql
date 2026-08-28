-- Profile identity fields for the account popup.

alter table public.profiles
  add column if not exists age_years smallint;

alter table public.profiles
  drop constraint if exists profiles_age_years_range;

alter table public.profiles
  add constraint profiles_age_years_range
  check (age_years is null or age_years between 1 and 120);

alter table public.profiles
  add column if not exists gender text;

alter table public.profiles
  drop constraint if exists profiles_gender_check;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender is null or gender in ('male', 'female', 'other'));

notify pgrst, 'reload schema';
