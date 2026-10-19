import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';

test('ETC pairing, permissions, command acknowledgement, expiry and session isolation',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon; create role authenticated;');
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
  for(const command of ['question','highlight-port','highlight-button','highlight-loop','highlight-body']){
   const featureId=randomUUID();await rpc('command',b.room,b.key,{},command,featureId);
   const update=await rpc('host',b.room,b.hostKey);assert.equal(update.commands[0].command,command);
   await rpc('host',b.room,b.hostKey,{slide:9,previews:{current:{label:'Explore parts'},next:{label:'Casing'}}},null,null,[featureId]);
  }
  const old=randomUUID();await rpc('command',a.room,a.key,{},'confetti',old);
  await db.query('update public."ETC_commands" set created_at=now()-interval \'5 seconds\' where id=$1',[old]);
  assert.equal((await rpc('host',a.room,a.hostKey)).commands.length,0);
  await db.query('update public."ETC_sessions" set host_seen=now()-interval \'10 seconds\' where id=$1',[a.room]);
  assert.equal((await rpc('read',a.room,a.key)).online,false);
  await assert.rejects(rpc('command',a.room,a.key,{},'next',randomUUID()),/Presentation offline/);
  await rpc('end',a.room,a.hostKey);assert.equal((await rpc('read',a.room,a.key)).ended,true);
  assert.equal((await db.query('select count(*)::int as n from public."ETC_commands" where session_id=$1',[a.room])).rows[0].n,0);
  await db.query('update public."ETC_sessions" set expires_at=now()-interval \'1 second\' where id=$1',[b.room]);
  assert.equal((await rpc('read',b.room,b.key)).ended,true);
 }finally{await db.close()}
});
