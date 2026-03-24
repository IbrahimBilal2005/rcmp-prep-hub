begin;

create table if not exists public.user_module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id bigint not null references public.modules(id) on delete cascade,
  started boolean not null default false,
  last_lesson_index integer,
  quiz_started boolean not null default false,
  quiz_completed boolean not null default false,
  quiz_score integer,
  quiz_total integer,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, module_id)
);

alter table public.user_module_progress enable row level security;

drop policy if exists "user_module_progress_own_all" on public.user_module_progress;
create policy "user_module_progress_own_all"
on public.user_module_progress for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists set_user_module_progress_updated_at on public.user_module_progress;
create trigger set_user_module_progress_updated_at
before update on public.user_module_progress
for each row execute procedure public.set_updated_at();

alter table public.practice_test_attempts
add column if not exists started_at timestamptz,
add column if not exists timed_out boolean not null default false;

commit;
