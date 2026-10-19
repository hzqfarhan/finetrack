import {createHash,timingSafeEqual} from 'node:crypto';

const digest=value=>createHash('sha256').update(value).digest();
export async function login(request,env=process.env,fetcher=fetch){
 const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 const password=env.ETC_REMOTE_MASTER_PASSWORD;
 const url=env.NEXT_PUBLIC_ETC_SUPABASE_URL;
 const key=env.ETC_SUPABASE_SERVICE_ROLE_KEY;
 if(!password||!url||!key)return reply({error:'Remote password sign-in needs its server environment settings.'},503);
 let input;
 try{input=await request.json()}catch{return reply({error:'Enter your remote password.'},400)}
 if(typeof input?.password!=='string'||input.password.length>256||!timingSafeEqual(digest(input.password),digest(password)))return reply({error:'Incorrect remote password.'},401);
 try{
  const endpoint=new URL('/rest/v1/ETC_sessions',url);
  endpoint.search=new URLSearchParams({select:'id,control_key',host_seen:`gt.${new Date(Date.now()-8000).toISOString()}`,expires_at:`gt.${new Date().toISOString()}`,limit:'2'}).toString();
  const response=await fetcher(endpoint,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error();
  const sessions=await response.json();
  if(!sessions.length)return reply({error:'Open the presentation on your main screen, then try again.'},409);
  if(sessions.length>1)return reply({error:'More than one presentation is active. Close the extra presentation tab, then try again.'},409);
  return reply({room:sessions[0].id,key:sessions[0].control_key});
 }catch{return reply({error:'Cannot connect to the presentation. Check the server Supabase settings.'},502)}
}
