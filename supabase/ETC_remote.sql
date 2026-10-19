-- Run in the Supabase SQL Editor. All app objects use the ETC_ prefix.
-- Direct browser access is disabled. The RPC validates separate random
-- host/control tokens on every request. Private links expire in 8 hours.
create table if not exists public."ETC_sessions" (
 id uuid primary key default gen_random_uuid(),
 host_key uuid not null default gen_random_uuid(),
 control_key uuid not null default gen_random_uuid(),
 state jsonb not null default '{}'::jsonb,
 host_seen timestamptz not null default now(),
 remote_seen timestamptz,
 expires_at timestamptz not null default now() + interval '8 hours'
);
alter table public."ETC_sessions" add column if not exists orbit jsonb;
create table if not exists public."ETC_commands" (
 id uuid primary key,
 session_id uuid not null references public."ETC_sessions"(id) on delete cascade,
 command text not null check (command in ('next','previous','confetti','curtain-close','curtain-open','spotlight','blank','clear','question','highlight-port','highlight-button','highlight-loop','highlight-body','audio-mute','audio-unmute','theme-light','theme-dark','video-boxing','video-catduo','video-cattrio','video-hamster','video-kopi','video-princess','video-speed','video-stop','slide-1','slide-2','slide-3','slide-4','slide-5','slide-6','slide-7','slide-8','slide-9','slide-10','slide-11','slide-12','slide-13','slide-14','slide-15','slide-16','slide-17','slide-18','slide-19','slide-20','slide-21','slide-22','slide-23','slide-24','slide-25')),
 created_at timestamptz not null default clock_timestamp(),
 acknowledged boolean not null default false
);
-- Upgrade the command allowlist when this setup is run on an existing project.
alter table public."ETC_commands" drop constraint if exists "ETC_commands_command_check";
alter table public."ETC_commands" add constraint "ETC_commands_command_check"
 check (command in ('next','previous','confetti','curtain-close','curtain-open','spotlight','blank','clear','question','highlight-port','highlight-button','highlight-loop','highlight-body','audio-mute','audio-unmute','theme-light','theme-dark','video-boxing','video-catduo','video-cattrio','video-hamster','video-kopi','video-princess','video-speed','video-stop','slide-1','slide-2','slide-3','slide-4','slide-5','slide-6','slide-7','slide-8','slide-9','slide-10','slide-11','slide-12','slide-13','slide-14','slide-15','slide-16','slide-17','slide-18','slide-19','slide-20','slide-21','slide-22','slide-23','slide-24','slide-25'));
create index if not exists "ETC_commands_session_time" on public."ETC_commands"(session_id,created_at);
alter table public."ETC_sessions" enable row level security;
alter table public."ETC_commands" enable row level security;
revoke all on public."ETC_sessions",public."ETC_commands" from anon,authenticated;

create or replace function public."ETC_remote"(
 p_action text,
 p_room uuid default null,
 p_key uuid default null,
 p_state jsonb default '{}'::jsonb,
 p_command text default null,
 p_id uuid default null,
 p_ack uuid[] default '{}'::uuid[]
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 s public."ETC_sessions";
 result jsonb;
begin
 if p_action='create' then
  if p_state is null or jsonb_typeof(p_state)<>'object' or octet_length(p_state::text)>12000 then raise exception 'Invalid presentation state'; end if;
  delete from public."ETC_sessions" where expires_at<now();
  if (select count(*) from public."ETC_sessions")>=100 then raise exception 'Session limit reached'; end if;
  insert into public."ETC_sessions"(state) values(p_state) returning * into s;
  return jsonb_build_object('room',s.id,'hostKey',s.host_key,'key',s.control_key);
 end if;
 select * into s from public."ETC_sessions" where id=p_room for update;
 if not found or s.expires_at<now() then return jsonb_build_object('ended',true); end if;
 if p_key is null or (p_action in ('host','end') and p_key<>s.host_key)
  or (p_action in ('read','command','orbit') and p_key<>s.control_key)
  or p_action is null or p_action not in ('host','end','read','command','orbit') then raise exception 'Invalid pairing credentials'; end if;
 if p_action='orbit' then
  if s.host_seen<now()-interval '8 seconds' then raise exception 'Presentation offline'; end if;
  if p_state is null or jsonb_typeof(p_state)<>'object' or octet_length(p_state::text)>500
   or jsonb_typeof(p_state->'yaw') is distinct from 'number' or jsonb_typeof(p_state->'pitch') is distinct from 'number'
   or jsonb_typeof(p_state->'slide') is distinct from 'number'
   or abs((p_state->>'yaw')::numeric)>360 or abs((p_state->>'pitch')::numeric)>80
   or p_id is null then raise exception 'Invalid orbit'; end if;
  if p_state->'slide' is distinct from s.state->'slide' then return jsonb_build_object('ignored',true); end if;
  update public."ETC_sessions" set orbit=p_state||jsonb_build_object('id',p_id),remote_seen=now() where id=p_room;
  return jsonb_build_object('queued',true);
 elsif p_action='end' then
  delete from public."ETC_sessions" where id=p_room;
  return jsonb_build_object('ended',true);
 elsif p_action='host' then
  if p_state is null or jsonb_typeof(p_state)<>'object' or octet_length(p_state::text)>12000 then raise exception 'Invalid presentation state'; end if;
  update public."ETC_sessions" set state=p_state,host_seen=now() where id=p_room;
  update public."ETC_commands" set acknowledged=true where session_id=p_room and id=any(p_ack);
  delete from public."ETC_commands" where session_id=p_room and created_at<now()-interval '30 seconds';
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'command',command) order by created_at),'[]'::jsonb) into result
   from public."ETC_commands" where session_id=p_room and not acknowledged and created_at>now()-interval '4 seconds';
  return jsonb_build_object('orbit',case when s.orbit->'slide'=p_state->'slide' then s.orbit else null end,'commands',result,'remoteOnline',coalesce(s.remote_seen>now()-interval '8 seconds',false));
 elsif p_action='read' then
  update public."ETC_sessions" set remote_seen=now() where id=p_room;
  return jsonb_build_object('state',s.state,'online',s.host_seen>now()-interval '8 seconds',
   'acknowledged',exists(select 1 from public."ETC_commands" where session_id=p_room and id=p_id and acknowledged));
 elsif p_action='command' then
  if s.host_seen<now()-interval '8 seconds' then raise exception 'Presentation offline'; end if;
  if p_id is null or p_command is null or p_command not in ('next','previous','confetti','curtain-close','curtain-open','spotlight','blank','clear','question','highlight-port','highlight-button','highlight-loop','highlight-body','audio-mute','audio-unmute','theme-light','theme-dark','video-boxing','video-catduo','video-cattrio','video-hamster','video-kopi','video-princess','video-speed','video-stop','slide-1','slide-2','slide-3','slide-4','slide-5','slide-6','slide-7','slide-8','slide-9','slide-10','slide-11','slide-12','slide-13','slide-14','slide-15','slide-16','slide-17','slide-18','slide-19','slide-20','slide-21','slide-22','slide-23','slide-24','slide-25') then raise exception 'Invalid command'; end if;
  if (select count(*) from public."ETC_commands" where session_id=p_room and created_at>now()-interval '1 second')>=30 then raise exception 'Please slow down'; end if;
  if p_command<>'confetti' and exists(select 1 from public."ETC_commands" where session_id=p_room and command<>'confetti' and not acknowledged and created_at>now()-interval '4 seconds' and id<>p_id) then raise exception 'Wait for the current command to finish'; end if;
  insert into public."ETC_commands"(id,session_id,command) values(p_id,p_room,p_command) on conflict(id) do nothing;
  return jsonb_build_object('queued',true);
 end if;
end $$;
revoke all on function public."ETC_remote"(text,uuid,uuid,jsonb,text,uuid,uuid[]) from public;
grant execute on function public."ETC_remote"(text,uuid,uuid,jsonb,text,uuid,uuid[]) to anon,authenticated;


-- One live broadcast selected only after server-side password verification.
create table if not exists public."ETC_broadcast" (
 id integer primary key check(id=1),
 session_id uuid references public."ETC_sessions"(id) on delete set null
);
alter table public."ETC_broadcast" enable row level security;
revoke all on public."ETC_broadcast" from anon,authenticated;
insert into public."ETC_broadcast"(id) values(1) on conflict do nothing;
create or replace function public."ETC_start_live"() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public."ETC_sessions"; chosen uuid;
begin
 select session_id into chosen from public."ETC_broadcast" where id=1 for update;
 select * into s from public."ETC_sessions" where id=chosen and host_seen>now()-interval '8 seconds' and expires_at>now();
 if not found then
  select * into s from public."ETC_sessions" where host_seen>now()-interval '8 seconds' and expires_at>now() order by expires_at,id limit 1;
 end if;
 if s.id is null then return jsonb_build_object('waiting',true); end if;
 update public."ETC_broadcast" set session_id=s.id where id=1;
 return jsonb_build_object('room',s.id,'key',s.control_key);
end $$;
revoke all on function public."ETC_start_live"() from public;
grant execute on function public."ETC_start_live"() to service_role;
create or replace function public."ETC_audience"() returns jsonb
language sql security definer set search_path='' as $$
 select coalesce((select jsonb_build_object('room',s.id,'state',s.state - 'notes' - 'previews','online',s.host_seen>now()-interval '8 seconds')
 from public."ETC_broadcast" b join public."ETC_sessions" s on s.id=b.session_id
 where b.id=1 and s.expires_at>now()),'{"online":false}'::jsonb);
$$;
revoke all on function public."ETC_audience"() from public;
grant execute on function public."ETC_audience"() to anon,authenticated;
