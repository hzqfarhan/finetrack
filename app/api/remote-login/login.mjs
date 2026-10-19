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
  const endpoint=new URL('/rest/v1/rpc/ETC_start_live',url);
  const response=await fetcher(endpoint,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error();
  const session=await response.json();
  if(session.waiting)return reply({error:'Open your main presentation screen first, then connect.'},409);
  if(!session.room||!session.key)throw new Error();
  return reply({room:session.room,key:session.key});
 }catch{return reply({error:'Cannot connect to the presentation. Check the server Supabase settings.'},502)}
}
