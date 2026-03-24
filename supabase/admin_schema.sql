alter table public.profiles
add column if not exists status text not null default 'active';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_status_check
    check (status in ('active', 'invited', 'suspended'));
  end if;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
on public.profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "modules_insert_admin" on public.modules;
create policy "modules_insert_admin"
on public.modules for insert
to authenticated
with check (public.is_admin());

drop policy if exists "modules_update_admin" on public.modules;
create policy "modules_update_admin"
on public.modules for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "modules_delete_admin" on public.modules;
create policy "modules_delete_admin"
on public.modules for delete
to authenticated
using (public.is_admin());

drop policy if exists "lessons_insert_admin" on public.lessons;
create policy "lessons_insert_admin"
on public.lessons for insert
to authenticated
with check (public.is_admin());

drop policy if exists "lessons_update_admin" on public.lessons;
create policy "lessons_update_admin"
on public.lessons for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lessons_delete_admin" on public.lessons;
create policy "lessons_delete_admin"
on public.lessons for delete
to authenticated
using (public.is_admin());

drop policy if exists "module_quiz_questions_insert_admin" on public.module_quiz_questions;
create policy "module_quiz_questions_insert_admin"
on public.module_quiz_questions for insert
to authenticated
with check (public.is_admin());

drop policy if exists "module_quiz_questions_update_admin" on public.module_quiz_questions;
create policy "module_quiz_questions_update_admin"
on public.module_quiz_questions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "module_quiz_questions_delete_admin" on public.module_quiz_questions;
create policy "module_quiz_questions_delete_admin"
on public.module_quiz_questions for delete
to authenticated
using (public.is_admin());

drop policy if exists "practice_tests_insert_admin" on public.practice_tests;
create policy "practice_tests_insert_admin"
on public.practice_tests for insert
to authenticated
with check (public.is_admin());

drop policy if exists "practice_tests_update_admin" on public.practice_tests;
create policy "practice_tests_update_admin"
on public.practice_tests for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "practice_tests_delete_admin" on public.practice_tests;
create policy "practice_tests_delete_admin"
on public.practice_tests for delete
to authenticated
using (public.is_admin());

drop policy if exists "practice_test_questions_insert_admin" on public.practice_test_questions;
create policy "practice_test_questions_insert_admin"
on public.practice_test_questions for insert
to authenticated
with check (public.is_admin());

drop policy if exists "practice_test_questions_update_admin" on public.practice_test_questions;
create policy "practice_test_questions_update_admin"
on public.practice_test_questions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "practice_test_questions_delete_admin" on public.practice_test_questions;
create policy "practice_test_questions_delete_admin"
on public.practice_test_questions for delete
to authenticated
using (public.is_admin());

do $$
begin
  if to_regclass('public.user_module_progress') is not null then
    execute 'drop policy if exists "user_module_progress_select_admin" on public.user_module_progress';
    execute '
      create policy "user_module_progress_select_admin"
      on public.user_module_progress for select
      to authenticated
      using (public.is_admin())
    ';
  end if;
end $$;

drop policy if exists "practice_test_attempts_select_admin" on public.practice_test_attempts;
create policy "practice_test_attempts_select_admin"
on public.practice_test_attempts for select
to authenticated
using (public.is_admin());
