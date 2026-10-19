 'use client';
import {useEffect,useRef,useState} from 'react';
export default function ModelTrackpad({disabled,slide,onRotate}){
 const [angles,setAngles]=useState({yaw:0,pitch:0}),[dragging,setDragging]=useState(false),[error,setError]=useState('');
 const value=useRef({yaw:0,pitch:0}),pointer=useRef(null),queued=useRef(null),busy=useRef(false),latest=useRef({onRotate,disabled});latest.current={onRotate,disabled};
 useEffect(()=>{
  let active=true;
  const timer=setInterval(async()=>{if(!active||busy.current||latest.current.disabled||!queued.current)return;const update=queued.current;queued.current=null;busy.current=true;try{await latest.current.onRotate({...update,slide});if(active)setError('')}catch(e){if(active)setError(e.message.includes('Invalid pairing')?'Update the ETC database SQL to enable the trackpad.':e.message)}finally{busy.current=false}},120);
  return()=>{active=false;queued.current=null;clearInterval(timer)};
 },[slide]);
 useEffect(()=>{if(disabled){pointer.current=null;queued.current=null;setDragging(false)}},[disabled]);
 const adjust=(yaw,pitch)=>{if(disabled)return;const next={yaw:((yaw+180)%360+360)%360-180,pitch:Math.max(-80,Math.min(80,pitch))};value.current=next;setAngles(next);queued.current=next};
 const end=e=>{if(pointer.current?.id!==e.pointerId)return;pointer.current=null;setDragging(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)};
 return <section className="remote-card"><p className="remote-eyebrow">3D MODEL</p><h2>Globe trackpad</h2><p>{disabled?'Available when an interactive product model is on screen.':'Drag to turn the model. Move up or down to tilt.'}</p><div className={`model-trackpad ${dragging?'dragging':''}`} role="group" aria-label="3D model angle trackpad. Use arrow keys to rotate." aria-disabled={disabled} tabIndex={disabled?-1:0}
 onPointerDown={e=>{if(disabled||pointer.current)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};setDragging(true)}}
 onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId||disabled)return;const bounds=e.currentTarget.getBoundingClientRect();adjust(value.current.yaw+(e.clientX-p.x)/bounds.width*240,value.current.pitch+(e.clientY-p.y)/bounds.height*150);pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY}}}
 onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{pointer.current=null;setDragging(false)}}
 onKeyDown={e=>{const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(delta&&!disabled){e.preventDefault();adjust(value.current.yaw+delta[0],value.current.pitch+delta[1])}}}>
 <svg viewBox="0 0 160 160" aria-hidden="true" style={{transform:`rotate(${angles.yaw/10}deg)`}}><circle cx="80" cy="80" r="65"/><ellipse cx="80" cy="80" rx="30" ry="65"/><ellipse cx="80" cy="80" rx="65" ry="25"/><path d="M15 80h130M80 15v130"/></svg><span>{dragging?'Rotating…':'Drag to rotate'}</span></div><p role="status">{error}</p><div className="trackpad-actions"><small>Turn {Math.round(angles.yaw)}° · Tilt {Math.round(angles.pitch)}°</small><button disabled={disabled} onClick={()=>adjust(0,0)}>Reset angle</button></div></section>
}
