'use client';
import {useEffect,useState} from 'react';
const format=ms=>{const seconds=Math.floor(Math.abs(ms)/1000);return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`};
export default function PresenterTimer({room}){
 const [clock,setClock]=useState({elapsed:0,started:null,target:570000}),[now,setNow]=useState(Date.now()),[loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem(`ETC_timer_${room}`));if(saved&&Number.isFinite(saved.elapsed)&&saved.elapsed>=0&&(saved.started===null||Number.isFinite(saved.started))&&Number.isFinite(saved.target)&&saved.target>=60000&&saved.target<=3600000)setClock(saved)}catch{}setLoaded(true)},[room]);
 useEffect(()=>{if(!loaded)return;try{sessionStorage.setItem(`ETC_timer_${room}`,JSON.stringify(clock))}catch{}},[clock,room,loaded]);
 useEffect(()=>{if(clock.started===null)return;const timer=setInterval(()=>setNow(Date.now()),250);const wake=()=>setNow(Date.now());document.addEventListener('visibilitychange',wake);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',wake)}},[clock.started]);
 const elapsed=clock.elapsed+(clock.started===null?0:Math.max(0,now-clock.started)),remaining=clock.target-elapsed;
 const toggle=()=>{const time=Date.now();setNow(time);setClock(old=>old.started===null?{...old,started:time}:{...old,elapsed:old.elapsed+time-old.started,started:null})};
 return <section className={`remote-card presenter-timer ${remaining<0?'timer-over':remaining<60000?'timer-soon':''}`} aria-label="Private presentation timer">
  <p className="remote-eyebrow">ONLY ON YOUR PHONE</p><div className="timer-heading"><h2>Presentation timer</h2><label>Target <select value={clock.target} onChange={e=>setClock(old=>({...old,target:Number(e.target.value)}))}><option value={480000}>8:00</option><option value={540000}>9:00</option><option value={570000}>9:30</option><option value={600000}>10:00</option></select></label></div>
  <div className="timer-digits">{format(elapsed)}<small>{remaining<0?`${format(remaining)} over`:`${format(remaining)} remaining`}</small></div>
  <div className="timer-actions"><button disabled={!loaded} className="primary" onClick={toggle}>{clock.started===null?(elapsed?'Resume':'Start timer'):'Pause'}</button><button disabled={!loaded} onClick={()=>{setClock(old=>({...old,elapsed:0,started:null}));setNow(Date.now())}}>Reset timer</button></div>
 </section>
}
