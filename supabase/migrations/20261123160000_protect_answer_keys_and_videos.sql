-- Stops answer keys and premium lesson videos from being readable without paid access.
--
-- Before: practice_test_questions_read_public and module_quiz_questions_read_public let
-- anon and authenticated read every question with correct_index, correct_indexes and
-- explanation; lesson_videos_read_authenticated let any signed-in user sign any video URL.
--
-- After:
--   * Only admins can SELECT the question tables directly.
--   * Everyone else reads questions through public.get_course_questions(), which returns
--     answers and explanations only for questions the caller is entitled to.
--   * Lesson videos are readable by users with full access, or for the free preview lessons.
--
-- Free preview rules mirror src/lib/access.ts and must be kept in sync with it:
--   * module quiz: first published module (sort_order, id), first 2 questions
--     (FREE_PREVIEW_MODULE_QUIZ_QUESTION_COUNT);
--   * practice test: tests with is_preview = true (or the legacy slug 'numerical'),
--     first 3 questions (FREE_PREVIEW_TEST_QUESTION_COUNT);
--   * lessons: first published module, first 2 published lessons
--     (FREE_PREVIEW_MODULE_LESSON_COUNT).
--
-- Requires the client change that calls get_course_questions(); deploy that code first
-- or at the same time, otherwise questions stop loading for non-admin users.
--
-- Rollback (restores the previous behaviour):
--   create policy practice_test_questions_read_public on public.practice_test_questions
--     for select to anon, authenticated using (exists (select 1 from public.practice_tests
--     where practice_tests.id = practice_test_questions.practice_test_id and practice_tests.is_published = true));
--   create policy module_quiz_questions_read_public on public.module_quiz_questions
--     for select to anon, authenticated using (exists (select 1 from public.modules
--     where modules.id = module_quiz_questions.module_id and modules.is_published = true));
--   drop policy lesson_videos_read_entitled on storage.objects;
--   create policy lesson_videos_read_authenticated on storage.objects
--     for select to authenticated using (bucket_id = 'lesson-videos');

-- Full access = admin, or premium with access that has not expired.
create or replace function public.has_full_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.plan = 'premium' and (p.access_expires_at is null or p.access_expires_at > now()))
      )
  );
$$;

create or replace function public.get_course_questions()
returns table (
  kind text,
  id bigint,
  parent_id bigint,
  question text,
  question_image_path text,
  options jsonb,
  sort_order integer,
  correct_index integer,
  correct_indexes jsonb,
  explanation text,
  answer_unlocked boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with caller as (
    select public.has_full_access() as full_access, public.is_admin() as admin
  ),
  preview_module as (
    select m.id
    from public.modules m
    where m.is_published
    order by m.sort_order, m.id
    limit 1
  ),
  questions as (
    select
      'module_quiz'::text as kind,
      q.id,
      q.module_id as parent_id,
      q.question,
      q.question_image_path,
      q.options,
      q.sort_order,
      q.correct_index,
      q.correct_indexes,
      q.explanation,
      m.is_published as parent_published,
      (q.module_id = (select pm.id from preview_module pm)
        and row_number() over (partition by q.module_id order by q.sort_order, q.id) <= 2) as in_preview
    from public.module_quiz_questions q
    join public.modules m on m.id = q.module_id

    union all

    select
      'practice_test'::text,
      q.id,
      q.practice_test_id,
      q.question,
      q.question_image_path,
      q.options,
      q.sort_order,
      q.correct_index,
      q.correct_indexes,
      q.explanation,
      t.is_published,
      ((t.is_preview or t.slug = 'numerical')
        and row_number() over (partition by q.practice_test_id order by q.sort_order, q.id) <= 3)
    from public.practice_test_questions q
    join public.practice_tests t on t.id = q.practice_test_id
  ),
  entitled as (
    select questions.*, ((select full_access from caller) or questions.in_preview) as unlocked
    from questions
  )
  select
    e.kind,
    e.id,
    e.parent_id,
    e.question,
    e.question_image_path,
    e.options,
    e.sort_order,
    case when e.unlocked then e.correct_index end,
    case when e.unlocked then e.correct_indexes end,
    case when e.unlocked then e.explanation end,
    e.unlocked
  from entitled e
  where e.parent_published or (select admin from caller);
$$;

revoke all on function public.get_course_questions() from public;
grant execute on function public.get_course_questions() to anon, authenticated;
revoke all on function public.has_full_access() from public;
grant execute on function public.has_full_access() to anon, authenticated;

-- Question tables: admins only for direct reads.
drop policy if exists practice_test_questions_read_public on public.practice_test_questions;
drop policy if exists module_quiz_questions_read_public on public.module_quiz_questions;

drop policy if exists practice_test_questions_select_admin on public.practice_test_questions;
create policy practice_test_questions_select_admin on public.practice_test_questions
  for select to authenticated using (public.is_admin());

drop policy if exists module_quiz_questions_select_admin on public.module_quiz_questions;
create policy module_quiz_questions_select_admin on public.module_quiz_questions
  for select to authenticated using (public.is_admin());

-- Lesson videos: full access, or a free preview lesson.
create or replace function public.is_preview_lesson_video(p_path text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with preview_module as (
    select m.id
    from public.modules m
    where m.is_published
    order by m.sort_order, m.id
    limit 1
  ),
  preview_lessons as (
    select l.video_path
    from public.lessons l
    where l.module_id = (select pm.id from preview_module pm)
      and l.is_published
    order by l.sort_order, l.id
    limit 2
  )
  select exists (select 1 from preview_lessons where video_path = p_path);
$$;

revoke all on function public.is_preview_lesson_video(text) from public;
grant execute on function public.is_preview_lesson_video(text) to authenticated;

drop policy if exists lesson_videos_read_authenticated on storage.objects;
drop policy if exists lesson_videos_read_entitled on storage.objects;
create policy lesson_videos_read_entitled on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lesson-videos'
    and (public.has_full_access() or public.is_preview_lesson_video(name))
  );
