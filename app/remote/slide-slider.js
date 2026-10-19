 'use client';
import {useEffect,useState} from 'react';
export default function SlideSlider({slide=1,total=25,disabled,onJump}){
 const [selected,setSelected]=useState(slide),[editing,setEditing]=useState(false);
 useEffect(()=>{if(!editing)setSelected(slide)},[slide,editing]);
 const jump=number=>{setSelected(number);onJump(`slide-${number}`);setEditing(false)};
 return <section className="remote-card slide-picker"><h2>Jump to slide</h2><label htmlFor="slide-jump">Slide {selected} of {total}</label><input id="slide-jump" type="range" min="1" max={total} step="1" value={selected} disabled={disabled} onPointerDown={()=>setEditing(true)} onChange={e=>{setEditing(true);setSelected(Number(e.target.value))}} onPointerUp={e=>jump(Number(e.currentTarget.value))} onPointerCancel={()=>setEditing(false)} onKeyUp={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key))jump(Number(e.currentTarget.value))}}/><div className="slide-number-grid">{Array.from({length:total},(_,i)=><button key={i} disabled={disabled} aria-label={`Go to slide ${i+1}`} aria-current={slide===i+1?'step':undefined} onClick={()=>jump(i+1)}>{i+1}</button>)}</div></section>
}
