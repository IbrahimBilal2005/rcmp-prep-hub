begin;

create extension if not exists pg_cron;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'expire-premium-access';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end
$$;

select cron.schedule(
  'expire-premium-access',
  '0 * * * *',
  $$select public.expire_premium_access();$$
);

commit;
