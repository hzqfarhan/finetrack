import {test} from 'node:test';
import assert from 'node:assert/strict';
import {login} from '../app/api/remote-login/login.mjs';
import {removeGreen} from '../app/video-effects.mjs';
const env={ETC_REMOTE_MASTER_PASSWORD:'test-password',NEXT_PUBLIC_ETC_SUPABASE_URL:'https://example.com',ETC_SUPABASE_SERVICE_ROLE_KEY:'server-secret'};
const request=password=>new Request('https://example.com/api/remote-login/',{method:'POST',body:JSON.stringify({password})});
test('password sign-in rejects missing and incorrect credentials before database access',async()=>{
 assert.equal((await login(request('test-password'),{})).status,503);
 assert.equal((await login(request('wrong'),env,()=>{throw new Error('must not fetch')})).status,401);
});
test('password sign-in selects a single live presentation and returns only controller credentials',async()=>{
 const result=await login(request('test-password'),env,async(url,options)=>{
 assert.equal(options.headers.apikey,'server-secret');assert.ok(url.searchParams.get('host_seen').startsWith('gt.'));
 return Response.json([{id:'room',control_key:'controller'}]);
 });
 assert.deepEqual(await result.json(),{room:'room',key:'controller'});assert.equal(result.headers.get('Cache-Control'),'no-store');
 for(const rows of [[],[{id:'a'},{id:'b'}]])assert.equal((await login(request('test-password'),env,async()=>Response.json(rows))).status,409);
 assert.equal((await login(request('test-password'),env,async()=>{throw new Error('secret')})).status,502);
});
test('green key removes green and preserves red and dark pixels',()=>{
 const pixels=new Uint8ClampedArray([0,255,0,255,255,0,0,255,20,20,20,255]);removeGreen(pixels);
 assert.equal(pixels[3],0);assert.equal(pixels[7],255);assert.equal(pixels[11],255);
});
