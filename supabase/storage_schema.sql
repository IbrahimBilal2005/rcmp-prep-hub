insert into storage.buckets (id, name, public)
values
  ('lesson-videos', 'lesson-videos', false),
  ('lesson-posters', 'lesson-posters', false)
on conflict (id) do nothing;

drop policy if exists "lesson_videos_read_authenticated" on storage.objects;
create policy "lesson_videos_read_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'lesson-videos');

drop policy if exists "lesson_posters_read_authenticated" on storage.objects;
create policy "lesson_posters_read_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'lesson-posters');

drop policy if exists "lesson_videos_admin_insert" on storage.objects;
create policy "lesson_videos_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'lesson-videos' and public.is_admin());

drop policy if exists "lesson_videos_admin_update" on storage.objects;
create policy "lesson_videos_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'lesson-videos' and public.is_admin())
with check (bucket_id = 'lesson-videos' and public.is_admin());

drop policy if exists "lesson_videos_admin_delete" on storage.objects;
create policy "lesson_videos_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'lesson-videos' and public.is_admin());

drop policy if exists "lesson_posters_admin_insert" on storage.objects;
create policy "lesson_posters_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'lesson-posters' and public.is_admin());

drop policy if exists "lesson_posters_admin_update" on storage.objects;
create policy "lesson_posters_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'lesson-posters' and public.is_admin())
with check (bucket_id = 'lesson-posters' and public.is_admin());

drop policy if exists "lesson_posters_admin_delete" on storage.objects;
create policy "lesson_posters_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'lesson-posters' and public.is_admin());
