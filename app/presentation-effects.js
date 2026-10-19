'use client';
import {useEffect,useState} from 'react';
export default function PresentationEffects({effect}){
 const [burst,setBurst]=useState(false);
 useEffect(()=>{if(!effect.confetti){setBurst(false);return}setBurst(true);const t=setTimeout(()=>setBurst(false),3200);return()=>clearTimeout(t)},[effect.confetti]);
 return <div className="presentation-effects" aria-hidden="true">
  {burst&&<div className="confetti" key={effect.confetti}>{Array.from({length:70},(_,i)=><i key={i} style={{'--x':`${(i*37)%100}%`,'--delay':`${(i%11)*.045}s`,'--turn':`${i%2?540:-540}deg`,background:['#30db7d','#f9c846','#73a7ff','#ed71ba','#ffffff'][i%5]}}/>)}</div>}
  {effect.spotlight&&<div className="show-spotlight"/>}
  {effect.question&&<div className="show-question"><span>LET’S HEAR FROM YOU</span><strong>What would you<br/>attach yours to?</strong><p>Your keys, your bag, or your luggage?</p></div>}
  <div className={`show-curtain ${effect.curtain?'closed':''}`}><div/><div/></div>
  {effect.blank&&<div className="show-blank"/>}
 </div>
}
