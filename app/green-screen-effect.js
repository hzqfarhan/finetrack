 'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {removeGreen} from './video-effects.mjs';
export default function GreenScreenEffect({clip,muted,onDone,onError}){
 const video=useRef(null),canvas=useRef(null),callbacks=useRef({onDone,onError});callbacks.current={onDone,onError};
 const [fallback,setFallback]=useState(false),[soundBlocked,setSoundBlocked]=useState(false);
 useEffect(()=>{const v=video.current;v.muted=muted;if(v.getAttribute('src')&&v.paused&&!v.ended)v.play().catch(()=>{if(!muted)setSoundBlocked(true);callbacks.current.onError('Tap Enable sound on this screen to hear the video.')})},[muted]);
 useEffect(()=>{
  const v=video.current,c=canvas.current,ctx=c.getContext('2d',{willReadFrequently:true});let frame,cancelled=false;
  setFallback(false);setSoundBlocked(false);
  const draw=()=>{
   if(cancelled)return;
   if(v.readyState>=2&&v.videoWidth&&v.videoHeight){
    try{
     if(!ctx)throw new Error('Canvas unavailable');
     const scale=Math.min(1,720/v.videoWidth),w=Math.round(v.videoWidth*scale),h=Math.round(v.videoHeight*scale);
     if(c.width!==w||c.height!==h){c.width=w;c.height=h}
     ctx.drawImage(v,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h);removeGreen(pixels.data);ctx.putImageData(pixels,0,0);
    }catch{setFallback(true);callbacks.current.onError('Playing the original video because green-screen removal is unavailable.');return}
   }
   frame=requestAnimationFrame(draw);
  };
  const play=async()=>{try{await v.play()}catch{if(cancelled)return;if(!v.muted)setSoundBlocked(true);v.muted=true;try{await v.play();if(!cancelled)callbacks.current.onError('Video is playing silently. Tap Enable sound on this screen.')}catch{if(!cancelled)callbacks.current.onError('This browser cannot play this MOV video. Use an H.264 MP4 version.')}}};
  v.src=`/greenscreen/${clip}.MOV`;v.load();play();draw();
  return()=>{cancelled=true;cancelAnimationFrame(frame);v.pause();v.removeAttribute('src');v.load()};
 },[clip]);
 const enableSound=()=>{const v=video.current;v.muted=false;v.play().then(()=>{setSoundBlocked(false);callbacks.current.onError('')}).catch(()=>setSoundBlocked(true))};
 return <><div className={`green-screen-effect ${fallback?'original-video':''}`}><video ref={video} muted={muted} playsInline preload="auto" onEnded={()=>callbacks.current.onDone()} onError={()=>callbacks.current.onError('This video could not load. Check the deployed asset or try an H.264 MP4 version.')}/><canvas ref={canvas}/></div>{soundBlocked&&!muted&&createPortal(<button className="enable-video-sound" onClick={enableSound}>Enable sound · Tap here</button>,document.body)}</>
}
