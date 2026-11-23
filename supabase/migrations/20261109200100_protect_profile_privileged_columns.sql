-- Stops signed-in non-admin users from changing their own plan, role, status, access expiry, email, id or created_at.
-- Before this, profiles_update_own allowed a user to set role = 'admin' or plan = 'premium' on their own row.
-- Allowed to change these columns:
--   * admins (public.is_admin()), so the admin console keeps working;
--   * requests with no end-user JWT (auth.uid() is null): service role (Stripe webhook), pg_cron expiry job, SQL editor.
-- Users can still update full_name.
-- Rollback: drop trigger protect_profile_privileged_columns on public.profiles;
--           drop function public.protect_profile_privileged_columns();

create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.plan is distinct from old.plan
      or new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.access_expires_at is distinct from old.access_expires_at
      or new.email is distinct from old.email
      or new.id is distinct from old.id
      or new.created_at is distinct from old.created_at then
      raise exception 'Only an administrator can change plan, role, status, access expiry or email on a profile.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_columns on public.profiles;
create trigger protect_profile_privileged_columns
before update on public.profiles
for each row execute function public.protect_profile_privileged_columns();
