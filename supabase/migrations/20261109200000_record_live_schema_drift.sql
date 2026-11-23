-- Records schema that exists in production (checked 2026-11-09) but was missing from the repo.
-- Safe to run on production: every statement is a no-op there.
-- The full, exact baseline should still be captured with `supabase db dump --schema public` and committed.

alter table public.module_quiz_questions
  add column if not exists correct_indexes jsonb;

alter table public.practice_test_questions
  add column if not exists correct_indexes jsonb;

-- Also live but not reproduced here: public.rls_auto_enable() (event trigger that enables RLS on new public tables).
