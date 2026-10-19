'use client';
import {useEffect,useRef,useState} from 'react';

const url=process.env.NEXT_PUBLIC_ETC_SUPABASE_URL;
const apiKey=process.env.NEXT_PUBLIC_ETC_SUPABASE_PUBLISHABLE_KEY;
export async function remoteRequest(parameters){
 if(!url||!apiKey)throw new Error('Add the ETC Supabase URL and publishable key to your environment, then restart or rebuild.');
 const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/ETC_remote`,{method:'POST',headers:{apikey:apiKey,'Content-Type':'application/json'},body:JSON.stringify(parameters),signal:AbortSignal.timeout(5000),cache:'no-store'});
 if(!response.ok){let data;try{data=await response.json()}catch{}throw new Error(data?.message||'Cannot reach Supabase. Check your connection and ETC database setup.')}
 return response.json();
}
export function useRemoteConnection({enabled,role,credentials,onCommand,state}){
 const [status,setStatus]=useState('off'),[pair,setPair]=useState(null),[view,setView]=useState(null),[online,setOnline]=useState(false),[count,setCount]=useState(0),[error,setError]=useState(''),[pending,setPending]=useState(false);
 const latest=useRef({onCommand,state}),pendingCommand=useRef(null),active=useRef(false);
 latest.current={onCommand,state};
 useEffect(()=>{
  if(!enabled){setStatus('off');setPair(null);setOnline(false);setCount(0);return}
  let cancelled=false,timer,auth=credentials,acks=[];const applied=new Set();active.current=true;pendingCommand.current=null;setPending(false);setError('');setStatus('connecting');setView(null);
  const stopHost=keys=>remoteRequest({p_action:'end',p_room:keys.room,p_key:keys.hostKey}).catch(()=>{});
  const poll=async()=>{
   try{
    if(role==='host'&&!auth){auth=await remoteRequest({p_action:'create',p_state:latest.current.state});if(cancelled){stopHost(auth);return}setPair(auth)}
    const sentAcks=acks;
    const result=await remoteRequest({p_action:role==='host'?'host':'read',p_room:auth.room,p_key:role==='host'?auth.hostKey:auth.key,...(role==='host'?{p_state:latest.current.state,p_ack:sentAcks}:{p_id:pendingCommand.current?.id||null})});
    if(cancelled)return;
    if(result.ended){setStatus('ended');setOnline(false);setError('This session has ended or expired. Pair again from the presentation.');return}
    setStatus('connected');setError('');
    if(role==='host'){
     acks=acks.filter(id=>!sentAcks.includes(id));setCount(result.remoteOnline?1:0);
     for(const command of result.commands||[]){if(!applied.has(command.id)){latest.current.onCommand?.(command.command);applied.add(command.id)}acks.push(command.id)}
    }else{
     setView(result.state);setOnline(result.online);
     const waiting=pendingCommand.current;
     if(waiting&&(result.acknowledged||Date.now()-waiting.sent>6500)){pendingCommand.current=null;setPending(false);if(!result.acknowledged)setError('No confirmation received. Check the screen before trying again.')}
    }
   }catch(e){if(cancelled)return;setOnline(false);setCount(0);setStatus('connecting');setError(e.message);if(pendingCommand.current&&Date.now()-pendingCommand.current.sent>6500){pendingCommand.current=null;setPending(false)}if(!url||!apiKey){setStatus('error');return}}
   if(!cancelled)timer=setTimeout(poll,500);
  };poll();
  return()=>{cancelled=true;active.current=false;clearTimeout(timer);pendingCommand.current=null;setPending(false);if(role==='host'&&auth)stopHost(auth)};
 },[enabled,role,credentials]);
 const send=async command=>{
  if(pendingCommand.current||!online||status!=='connected')return;
  const id=crypto.randomUUID();pendingCommand.current={id,sent:Date.now()};setPending(true);setError('');
  try{await remoteRequest({p_action:'command',p_room:credentials.room,p_key:credentials.key,p_command:command,p_id:id})}
  catch(e){if(!active.current||pendingCommand.current?.id!==id)return;pendingCommand.current=null;setPending(false);setError(`${e.message} Check the screen before retrying.`)}
 };
 return {status,pair,view,online,count,error,pending,send};
}
