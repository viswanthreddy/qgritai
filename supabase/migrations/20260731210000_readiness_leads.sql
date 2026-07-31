alter table public.leads
  add column readiness_score smallint check (readiness_score between 0 and 100),
  add column readiness_label text check (readiness_label is null or char_length(readiness_label) <= 80);

create or replace function public.submit_readiness_lead(
  full_name text,
  work_email text,
  company text,
  job_title text,
  message text,
  readiness_score integer,
  readiness_label text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if char_length(trim(full_name)) not between 2 and 120 then raise exception 'Invalid name'; end if;
  if char_length(trim(work_email)) not between 5 and 320 or position('@' in work_email) < 2 then raise exception 'Invalid email'; end if;
  if char_length(trim(company)) not between 2 and 160 then raise exception 'Invalid company'; end if;
  if char_length(trim(message)) not between 20 and 3000 then raise exception 'Invalid message'; end if;
  if readiness_score not between 0 and 100 then raise exception 'Invalid readiness score'; end if;
  if char_length(trim(readiness_label)) not between 2 and 80 then raise exception 'Invalid readiness label'; end if;
  insert into public.leads (full_name, work_email, company, job_title, message, source, readiness_score, readiness_label)
  values (trim(full_name), lower(trim(work_email)), trim(company), nullif(trim(job_title), ''), trim(message), 'readiness', readiness_score, trim(readiness_label))
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.submit_readiness_lead(text, text, text, text, text, integer, text) from public;
grant execute on function public.submit_readiness_lead(text, text, text, text, text, integer, text) to anon, authenticated;
