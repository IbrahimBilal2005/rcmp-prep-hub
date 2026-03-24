drop policy if exists "modules_read_authenticated" on public.modules;
drop policy if exists "lessons_read_authenticated" on public.lessons;
drop policy if exists "practice_tests_read_authenticated" on public.practice_tests;

create policy "modules_read_public"
on public.modules for select
to anon, authenticated
using (is_published = true);

create policy "lessons_read_public"
on public.lessons for select
to anon, authenticated
using (is_published = true);

create policy "module_quiz_questions_read_public"
on public.module_quiz_questions for select
to anon, authenticated
using (
  exists (
    select 1
    from public.modules
    where public.modules.id = module_quiz_questions.module_id
      and public.modules.is_published = true
  )
);

create policy "practice_tests_read_public"
on public.practice_tests for select
to anon, authenticated
using (is_published = true);

create policy "practice_test_questions_read_public"
on public.practice_test_questions for select
to anon, authenticated
using (
  exists (
    select 1
    from public.practice_tests
    where public.practice_tests.id = practice_test_questions.practice_test_id
      and public.practice_tests.is_published = true
  )
);
