 'use client';
import {useEffect,useRef,useState} from 'react';
import {remoteRequest} from './remote-connection';
export default function useLiveAudience({room,onState}){
 const [following,setFollowing]=useState(true),[broadcast,setBroadcast]=useState(null),[ready,setReady]=useState(false);
 const latest=useRef({room,onState});latest.current={room,onState};
 useEffect(()=>{setReady(true)},[]);
 useEffect(()=>{
  if(!ready||!following)return;
  let cancelled=false,timer,lastState='';
  const poll=async()=>{try{const result=await remoteRequest({},'ETC_audience');if(cancelled)return;setBroadcast(result);if(result.online&&result.room!==latest.current.room&&latest.current.room){const signature=JSON.stringify([result.room,result.state]);if(signature!==lastState){lastState=signature;latest.current.onState(result.state)}}}catch{if(!cancelled)setBroadcast(null)}if(!cancelled)timer=setTimeout(poll,500)};
  poll();return()=>{cancelled=true;clearTimeout(timer)};
 },[ready,following]);
 const toggle=()=>setFollowing(old=>!old);
 return {following,toggle,isSource:!!room&&broadcast?.room===room,online:!!broadcast?.online};
}
