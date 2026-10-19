'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import GreenScreenEffect from './green-screen-effect';
export default function PresentationEffects({effect,muted,onVideoDone,onVideoError}){
 const [bursts,setBursts]=useState([]),[target,setTarget]=useState(null);
 const previous=useRef(0);
 useEffect(()=>{setTarget(document.body);const timer=setInterval(()=>setBursts(old=>old.filter(b=>Date.now()-b.created<3400)),250);return()=>clearInterval(timer)},[]);
 useEffect(()=>{
  const count=effect.confetti||0,delta=count-previous.current;previous.current=count;
  if(!count){setBursts([]);return}
  if(delta>0)setBursts(old=>[...old,...Array.from({length:Math.min(delta,30)},(_,i)=>({id:crypto.randomUUID(),created:Date.now(),offset:i*31+count*13}))].slice(-60));
 },[effect.confetti]);
 if(!target)return null;
 return createPortal(<div className="presentation-effects" aria-hidden="true">
  {bursts.map(burst=><div className="confetti" key={burst.id}>{Array.from({length:70},(_,i)=><i key={i} style={{'--x':`${(i*37+burst.offset)%100}%`,'--delay':`${(i%11)*.045}s`,'--turn':`${i%2?540:-540}deg`,background:['#30db7d','#f9c846','#73a7ff','#ed71ba','#ffffff'][i%5]}}/>)}</div>)}
  {effect.video&&<GreenScreenEffect key={effect.video.id} clip={effect.video.clip} muted={muted} onDone={onVideoDone} onError={onVideoError}/>}
  {effect.spotlight&&<div className="show-spotlight"/>}
  {effect.question&&<div className="show-question"><span>LET’S HEAR FROM YOU</span><strong>What would you<br/>attach yours to?</strong><p>Your keys, your bag, or your luggage?</p></div>}
  <div className={`show-curtain ${effect.curtain?'closed':''}`}><div/><div/></div>
  {effect.blank&&<div className="show-blank"/>}
 </div>,target)
}
