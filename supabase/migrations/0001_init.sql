-- =====================================================================
--  Online Examination Platform — initial schema
--  Postgres / Supabase
--  Run this in the Supabase SQL Editor (or via `supabase db push`),
--  then run supabase/seed.sql to load the questions.
-- =====================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------

-- Admins: a row here grants a Supabase Auth user admin privileges.
create table if not exists public.admin_users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.exams (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  description    text,
  question_count integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  exam_id         uuid not null references public.exams (id) on delete cascade,
  question_number integer not null,
  question_text   text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (exam_id, question_number)
);

create table if not exists public.question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  option_label text not null,                 -- A, B, C, ...
  option_text  text not null,
  is_correct   boolean not null default false,
  sort_order   integer not null default 0,
  unique (question_id, option_label)
);

create table if not exists public.exam_sessions (
  id                uuid primary key default gen_random_uuid(),
  exam_id           uuid not null references public.exams (id) on delete cascade,
  participant_name  text not null,
  participant_email text,
  status            text not null default 'in_progress'
                    check (status in ('in_progress', 'submitted')),
  total_questions   integer not null default 0,
  correct_count     integer not null default 0,
  wrong_count       integer not null default 0,
  percentage        numeric(5,2) not null default 0,
  score             integer not null default 0,
  started_at        timestamptz not null default now(),
  finished_at       timestamptz
);

create table if not exists public.user_answers (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.exam_sessions (id) on delete cascade,
  question_id        uuid not null references public.questions (id) on delete cascade,
  selected_option_id uuid references public.question_options (id) on delete set null,
  is_correct         boolean not null default false,
  answered_at        timestamptz not null default now(),
  unique (session_id, question_id)
);

-- ---------------------------------------------------------------------
--  Indexes
-- ---------------------------------------------------------------------
create index if not exists idx_questions_exam        on public.questions (exam_id, question_number);
create index if not exists idx_options_question      on public.question_options (question_id, sort_order);
create index if not exists idx_sessions_exam         on public.exam_sessions (exam_id);
create index if not exists idx_sessions_status       on public.exam_sessions (status);
create index if not exists idx_sessions_finished_at  on public.exam_sessions (finished_at desc);
create index if not exists idx_answers_session       on public.user_answers (session_id);
create index if not exists idx_answers_question      on public.user_answers (question_id);

-- ---------------------------------------------------------------------
--  updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_exams_updated on public.exams;
create trigger trg_exams_updated before update on public.exams
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_questions_updated on public.questions;
create trigger trg_questions_updated before update on public.questions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
--  Admin helper
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.admin_users a where a.id = auth.uid());
$$;

-- Promote a Supabase Auth user to admin by email (run manually).
create or replace function public.grant_admin(p_email text)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where email = p_email;
  if v_id is null then
    raise exception 'No auth user with email %', p_email;
  end if;
  insert into public.admin_users (id, email) values (v_id, p_email)
  on conflict (id) do nothing;
end $$;

-- ---------------------------------------------------------------------
--  Safe public view of options (excludes is_correct)
-- ---------------------------------------------------------------------
create or replace view public.question_options_public as
  select id, question_id, option_label, option_text, sort_order
  from public.question_options;

-- ---------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------
alter table public.admin_users      enable row level security;
alter table public.exams            enable row level security;
alter table public.questions        enable row level security;
alter table public.question_options enable row level security;
alter table public.exam_sessions    enable row level security;
alter table public.user_answers     enable row level security;

-- admin_users: a user may read their own row only.
drop policy if exists admin_self_select on public.admin_users;
create policy admin_self_select on public.admin_users
  for select using (id = auth.uid());

-- exams: world-readable; only admins write.
drop policy if exists exams_read on public.exams;
create policy exams_read on public.exams for select using (true);
drop policy if exists exams_admin_write on public.exams;
create policy exams_admin_write on public.exams for all
  using (public.is_admin()) with check (public.is_admin());

-- questions: world-readable (contain no answer data); only admins write.
drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions for select using (true);
drop policy if exists questions_admin_write on public.questions;
create policy questions_admin_write on public.questions for all
  using (public.is_admin()) with check (public.is_admin());

-- question_options: only admins can touch the base table directly
-- (anon reads the question_options_public view instead, which hides is_correct).
drop policy if exists options_admin_all on public.question_options;
create policy options_admin_all on public.question_options for all
  using (public.is_admin()) with check (public.is_admin());

-- exam_sessions / user_answers: admins read everything.
-- Participants never select these directly — they go through the
-- SECURITY DEFINER RPCs below, keyed by the secret session UUID.
drop policy if exists sessions_admin_read on public.exam_sessions;
create policy sessions_admin_read on public.exam_sessions for select using (public.is_admin());
drop policy if exists answers_admin_read on public.user_answers;
create policy answers_admin_read on public.user_answers for select using (public.is_admin());

-- ---------------------------------------------------------------------
--  Grants (RLS still applies on top of these)
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.exams to anon, authenticated;
grant select on public.questions to anon, authenticated;
grant select on public.question_options_public to anon, authenticated;
grant select, insert, update, delete on public.question_options to authenticated;
grant select, insert, update, delete on public.exams, public.questions to authenticated;
grant select on public.exam_sessions, public.user_answers to authenticated;

-- =====================================================================
--  Participant RPCs (SECURITY DEFINER — correct answers never leave DB)
-- =====================================================================

-- Start a new attempt; returns the session id.
create or replace function public.start_exam_session(
  p_exam_id uuid, p_name text, p_email text default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_total integer;
begin
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Participant name is required';
  end if;
  select count(*) into v_total from public.questions where exam_id = p_exam_id;
  if v_total = 0 then
    raise exception 'Exam not found or has no questions';
  end if;
  insert into public.exam_sessions (exam_id, participant_name, participant_email, total_questions)
  values (p_exam_id, trim(p_name), nullif(trim(p_email), ''), v_total)
  returning id into v_id;
  return v_id;
end $$;

-- Autosave a single answer.
create or replace function public.save_answer(
  p_session_id uuid, p_question_id uuid, p_option_id uuid)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_status text; v_correct boolean;
begin
  select status into v_status from public.exam_sessions where id = p_session_id;
  if v_status is null then raise exception 'Session not found'; end if;
  if v_status <> 'in_progress' then raise exception 'Session already submitted'; end if;

  if p_option_id is null then
    v_correct := false;
  else
    select is_correct into v_correct from public.question_options
      where id = p_option_id and question_id = p_question_id;
    if v_correct is null then raise exception 'Invalid option for question'; end if;
  end if;

  insert into public.user_answers (session_id, question_id, selected_option_id, is_correct)
  values (p_session_id, p_question_id, p_option_id, coalesce(v_correct, false))
  on conflict (session_id, question_id)
  do update set selected_option_id = excluded.selected_option_id,
                is_correct = excluded.is_correct,
                answered_at = now();
end $$;

-- Restore saved state after a refresh.
create or replace function public.get_session_state(p_session_id uuid)
returns jsonb
language sql security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'session', (select to_jsonb(s) - 'participant_email'
                from (select id, exam_id, participant_name, status, total_questions,
                             correct_count, wrong_count, percentage, score,
                             started_at, finished_at
                      from public.exam_sessions where id = p_session_id) s),
    'answers', coalesce((select jsonb_agg(jsonb_build_object(
                  'question_id', question_id, 'selected_option_id', selected_option_id))
                from public.user_answers where session_id = p_session_id), '[]'::jsonb)
  );
$$;

-- Submit the exam: persist all answers, grade server-side, return summary.
create or replace function public.submit_exam(p_session_id uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_status text; v_total integer; v_correct integer; v_wrong integer; v_pct numeric;
  rec record;
begin
  select status, total_questions into v_status, v_total
    from public.exam_sessions where id = p_session_id;
  if v_status is null then raise exception 'Session not found'; end if;

  if v_status = 'in_progress' then
    -- upsert every supplied answer
    for rec in select * from jsonb_to_recordset(coalesce(p_answers, '[]'::jsonb))
                 as x(question_id uuid, option_id uuid)
    loop
      perform public.save_answer(p_session_id, rec.question_id, rec.option_id);
    end loop;

    select count(*) filter (where is_correct) into v_correct
      from public.user_answers where session_id = p_session_id;
    v_correct := coalesce(v_correct, 0);
    v_wrong := v_total - v_correct;
    v_pct := case when v_total > 0 then round(v_correct::numeric * 100 / v_total, 2) else 0 end;

    update public.exam_sessions
      set status = 'submitted', correct_count = v_correct, wrong_count = v_wrong,
          percentage = v_pct, score = v_correct, finished_at = now()
      where id = p_session_id;
  end if;

  select jsonb_build_object(
    'session_id', id, 'total_questions', total_questions,
    'correct_count', correct_count, 'wrong_count', wrong_count,
    'percentage', percentage, 'score', score, 'status', status)
  into rec from public.exam_sessions where id = p_session_id;
  return to_jsonb(rec);
end $$;

-- Full per-question review (used by the results page and by admins).
create or replace function public.get_session_results(p_session_id uuid)
returns jsonb
language sql security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'session', (select to_jsonb(s) from (
        select id, exam_id, participant_name, participant_email, status,
               total_questions, correct_count, wrong_count, percentage, score,
               started_at, finished_at,
               case when finished_at is not null
                    then extract(epoch from (finished_at - started_at))::int end as duration_seconds
        from public.exam_sessions where id = p_session_id) s),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'question_id', q.id,
        'question_number', q.question_number,
        'question_text', q.question_text,
        'selected_option_id', ua.selected_option_id,
        'is_correct', coalesce(ua.is_correct, false),
        'options', (select jsonb_agg(jsonb_build_object(
              'id', o.id, 'label', o.option_label, 'text', o.option_text,
              'is_correct', o.is_correct) order by o.sort_order)
            from public.question_options o where o.question_id = q.id)
      ) order by q.question_number)
      from public.questions q
      join public.exam_sessions es on es.id = p_session_id and es.exam_id = q.exam_id
      left join public.user_answers ua
             on ua.session_id = p_session_id and ua.question_id = q.id
    ), '[]'::jsonb)
  );
$$;

-- Aggregate dashboard statistics (admin only).
create or replace function public.admin_dashboard_stats()
returns jsonb
language sql security definer set search_path = public, pg_temp as $$
  select case when public.is_admin() then (
    select jsonb_build_object(
      'total_attempts', count(*),
      'avg_score', coalesce(round(avg(percentage) filter (where status = 'submitted'), 2), 0),
      'highest_score', coalesce(max(percentage) filter (where status = 'submitted'), 0),
      'lowest_score', coalesce(min(percentage) filter (where status = 'submitted'), 0),
      'unique_participants', count(distinct lower(coalesce(participant_email, participant_name)))
    ) from public.exam_sessions)
  else jsonb_build_object('error','forbidden') end;
$$;

-- Results review is intentionally callable by anyone holding the secret
-- session UUID (so participants can see their own results without auth).
grant execute on function public.start_exam_session(uuid, text, text) to anon, authenticated;
grant execute on function public.save_answer(uuid, uuid, uuid)        to anon, authenticated;
grant execute on function public.get_session_state(uuid)              to anon, authenticated;
grant execute on function public.submit_exam(uuid, jsonb)             to anon, authenticated;
grant execute on function public.get_session_results(uuid)            to anon, authenticated;
grant execute on function public.admin_dashboard_stats()              to authenticated;
grant execute on function public.is_admin()                           to anon, authenticated;
