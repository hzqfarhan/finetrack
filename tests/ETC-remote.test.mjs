import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {videoEffects} from '../app/video-effects.mjs';
import {PGlite} from '@electric-sql/pglite';

test('ETC pairing, permissions, command acknowledgement, expiry and session isolation',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon; create role authenticated; create role service_role;');
  const sql=await readFile(new URL('../supabase/ETC_remote.sql',import.meta.url),'utf8');
  await db.exec(sql);await db.exec(sql); // Setup is safe to run again.
  const rpc=async(action,room=null,key=null,state={},command=null,id=null,ack=[])=>{
   const result=await db.query('select public."ETC_remote"($1,$2,$3,$4,$5,$6,$7) as result',[action,room,key,JSON.stringify(state),command,id,ack]);return result.rows[0].result;
  };
  const a=await rpc('create',null,null,{slide:1}),b=await rpc('create');
  await assert.rejects(rpc('read',a.room,b.key),/Invalid pairing/);
  await assert.rejects(rpc('host',a.room,a.key),/Invalid pairing/);
  await assert.rejects(rpc('end',a.room,a.key),/Invalid pairing/);
  await assert.rejects(rpc('read',a.room,null),/Invalid pairing/);
  await assert.rejects(rpc(null,a.room,a.key),/Invalid pairing/);
  await assert.rejects(rpc('command',a.room,a.key,{},'arbitrary-script',randomUUID()),/Invalid command/);
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public."ETC_sessions"'),/permission denied/);
  await assert.rejects(db.query('select * from public."ETC_commands"'),/permission denied/);
  assert.equal((await rpc('read',a.room,a.key)).state.slide,1);
  await db.exec('reset role');
  const id=randomUUID();await rpc('command',a.room,a.key,{},'next',id);await rpc('command',a.room,a.key,{},'next',id);
  await assert.rejects(rpc('command',a.room,a.key,{},'previous',randomUUID()),/Wait for the current command/);
  let result=await rpc('host',a.room,a.hostKey,{slide:1});assert.equal(result.commands.length,1);assert.equal(result.remoteOnline,true);
  assert.equal((await rpc('host',b.room,b.hostKey)).commands.length,0);
  assert.equal((await rpc('read',a.room,a.key,{},null,id)).acknowledged,false);
  await rpc('host',a.room,a.hostKey,{slide:2},null,null,[id]);
  result=await rpc('read',a.room,a.key,{},null,id);assert.equal(result.acknowledged,true);assert.equal(result.state.slide,2);
  assert.equal((await rpc('host',a.room,a.hostKey)).commands.length,0);
  for(const command of ['question','highlight-port','highlight-button','highlight-loop','highlight-body','audio-mute','audio-unmute','theme-light','theme-dark','video-stop',...Array.from({length:25},(_,i)=>`slide-${i+1}`),...videoEffects.map(clip=>`video-${clip}`)]){
   await db.query('update public."ETC_commands" set created_at=now()-interval \'2 seconds\' where session_id=$1',[b.room]);
   const featureId=randomUUID();await rpc('command',b.room,b.key,{},command,featureId);
   const update=await rpc('host',b.room,b.hostKey);assert.equal(update.commands[0].command,command);
   await rpc('host',b.room,b.hostKey,{slide:9,previews:{current:{label:'Explore parts'},next:{label:'Casing'}}},null,null,[featureId]);
  }
  for(const invalid of ['slide-0','slide-26','slide-1.5'])await assert.rejects(rpc('command',b.room,b.key,{},invalid,randomUUID()),/Invalid command/);
  const burstIds=[];
  for(let i=0;i<12;i++){const burstId=randomUUID();burstIds.push(burstId);await rpc('command',b.room,b.key,{},'confetti',burstId)}
  const navId=randomUUID();await rpc('command',b.room,b.key,{},'next',navId);
  const extraBurst=randomUUID();await rpc('command',b.room,b.key,{},'confetti',extraBurst);
  const batch=await rpc('host',b.room,b.hostKey);assert.equal(batch.commands.filter(c=>c.command==='confetti').length,13);
  assert.equal(batch.commands.filter(c=>c.command==='next').length,1);
  await assert.rejects(rpc('command',b.room,b.key,{},'previous',randomUUID()),/Wait for the current command/);
  await rpc('host',b.room,b.hostKey,{},null,null,[...burstIds,navId,extraBurst]);
  assert.equal((await rpc('host',b.room,b.hostKey)).commands.length,0);
  await rpc('host',b.room,b.hostKey,{slide:9});
  await assert.rejects(rpc('orbit',b.room,a.key,{slide:9,yaw:10,pitch:20},null,randomUUID()),/Invalid pairing/);
  for(const invalid of [{slide:9,yaw:361,pitch:0},{slide:9,yaw:0,pitch:81},{slide:9,yaw:'10',pitch:0},{}]){
   await assert.rejects(rpc('orbit',b.room,b.key,invalid,null,randomUUID()),/Invalid orbit/);
  }
  for(let yaw=0;yaw<20;yaw++)await rpc('orbit',b.room,b.key,{slide:9,yaw,pitch:20},null,randomUUID());
  assert.equal((await rpc('host',b.room,b.hostKey,{slide:9})).orbit.yaw,19);
  assert.equal((await rpc('host',a.room,a.hostKey,{slide:9})).orbit,null);
  assert.equal((await rpc('orbit',b.room,b.key,{slide:8,yaw:0,pitch:0},null,randomUUID())).ignored,true);
  assert.equal((await rpc('host',b.room,b.hostKey,{slide:10})).orbit,null);
  const old=randomUUID();await rpc('command',a.room,a.key,{},'confetti',old);
  await db.query('update public."ETC_commands" set created_at=now()-interval \'5 seconds\' where id=$1',[old]);
  assert.equal((await rpc('host',a.room,a.hostKey)).commands.length,0);
  await db.query('update public."ETC_sessions" set host_seen=now()-interval \'10 seconds\' where id=$1',[a.room]);
  assert.equal((await rpc('read',a.room,a.key)).online,false);
  await assert.rejects(rpc('command',a.room,a.key,{},'next',randomUUID()),/Presentation offline/);
  await rpc('host',a.room,a.hostKey,{slide:4,notes:'private cue',previews:{secret:true},effect:{confetti:1}});
  await db.query('update public."ETC_sessions" set expires_at=now()+interval \'2 hours\' where id=$1',[a.room]);
  const start=async()=> (await db.query('select public."ETC_start_live"() as value')).rows[0].value;
  const audience=async()=> (await db.query('select public."ETC_audience"() as value')).rows[0].value;
  assert.equal((await start()).room,a.room);
  assert.equal((await start()).room,a.room);
  await db.exec('set role anon');
  await assert.rejects(start(),/permission denied/);
  const publicState=await audience();assert.equal(publicState.state.slide,4);
  assert.equal(publicState.state.notes,undefined);assert.equal(publicState.state.previews,undefined);
  assert.equal(publicState.key,undefined);assert.equal(publicState.hostKey,undefined);
  await assert.rejects(db.query('select * from public."ETC_broadcast"'),/permission denied/);
  await db.exec('reset role');
  await rpc('host',a.room,a.hostKey,{slide:5});assert.equal((await audience()).state.slide,5);
  await rpc('end',a.room,a.hostKey);assert.equal((await rpc('read',a.room,a.key)).ended,true);
  assert.equal((await db.query('select count(*)::int as n from public."ETC_commands" where session_id=$1',[a.room])).rows[0].n,0);
  await db.query('update public."ETC_sessions" set expires_at=now()-interval \'1 second\' where id=$1',[b.room]);
  assert.equal((await rpc('read',b.room,b.key)).ended,true);
 }finally{await db.close()}
});
