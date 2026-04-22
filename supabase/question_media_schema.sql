begin;

alter table public.module_quiz_questions
  add column if not exists question_image_path text;

alter table public.practice_test_questions
  add column if not exists question_image_path text;

update public.module_quiz_questions
set options = coalesce(
  (
    select jsonb_agg(
      case
        when jsonb_typeof(option_entry) = 'string' then
          jsonb_build_object(
            'text', option_entry #>> '{}',
            'image_path', null
          )
        when jsonb_typeof(option_entry) = 'object' then
          jsonb_build_object(
            'text', coalesce(option_entry->>'text', ''),
            'image_path', nullif(option_entry->>'image_path', '')
          )
        else
          jsonb_build_object(
            'text', '',
            'image_path', null
          )
      end
    )
    from jsonb_array_elements(coalesce(options, '[]'::jsonb)) as option_rows(option_entry)
  ),
  '[]'::jsonb
)
where options is not null;

update public.practice_test_questions
set options = coalesce(
  (
    select jsonb_agg(
      case
        when jsonb_typeof(option_entry) = 'string' then
          jsonb_build_object(
            'text', option_entry #>> '{}',
            'image_path', null
          )
        when jsonb_typeof(option_entry) = 'object' then
          jsonb_build_object(
            'text', coalesce(option_entry->>'text', ''),
            'image_path', nullif(option_entry->>'image_path', '')
          )
        else
          jsonb_build_object(
            'text', '',
            'image_path', null
          )
      end
    )
    from jsonb_array_elements(coalesce(options, '[]'::jsonb)) as option_rows(option_entry)
  ),
  '[]'::jsonb
)
where options is not null;

insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', false)
on conflict (id) do nothing;

drop policy if exists "question_images_read_public" on storage.objects;
create policy "question_images_read_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'question-images');

drop policy if exists "question_images_admin_insert" on storage.objects;
create policy "question_images_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'question-images' and public.is_admin());

drop policy if exists "question_images_admin_update" on storage.objects;
create policy "question_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'question-images' and public.is_admin())
with check (bucket_id = 'question-images' and public.is_admin());

drop policy if exists "question_images_admin_delete" on storage.objects;
create policy "question_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'question-images' and public.is_admin());

commit;
