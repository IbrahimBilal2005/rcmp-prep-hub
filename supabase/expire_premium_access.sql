begin;

create or replace function public.expire_premium_access()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer := 0;
begin
  with expired_profiles as (
    update public.profiles
    set
      plan = 'free',
      access_expires_at = null
    where plan = 'premium'
      and access_expires_at is not null
      and access_expires_at <= timezone('utc', now())
    returning id
  )
  select count(*) into expired_count
  from expired_profiles;

  update public.billing_accounts
  set billing_status = 'expired'
  where user_id in (
    select id
    from public.profiles
    where plan = 'free'
  )
    and current_period_end is not null
    and current_period_end <= timezone('utc', now());

  return expired_count;
end;
$$;

comment on function public.expire_premium_access()
is 'Downgrades expired premium accounts back to free and marks related billing rows as expired.';

commit;
