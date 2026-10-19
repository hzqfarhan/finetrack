 'use client';
import {useEffect,useRef} from 'react';
import {removeGreen} from './video-effects.mjs';
export default function GreenScreenEffect({clip,muted,onDone,onError}){
 const video=useRef(null),canvas=useRef(null),callbacks=useRef({onDone,onError});callbacks.current={onDone,onError};
 useEffect(()=>{const v=video.current;v.muted=muted},[muted]);
 useEffect(()=>{
  const v=video.current,c=canvas.current;v.src=`/greenscreen/${clip}.MOV`;const ctx=c.getContext('2d',{willReadFrequently:true});let frame,cancelled=false;
  const draw=()=>{if(cancelled)return;if(v.readyState>=2){const scale=Math.min(1,720/v.videoWidth);const w=Math.round(v.videoWidth*scale),h=Math.round(v.videoHeight*scale);if(c.width!==w||c.height!==h){c.width=w;c.height=h}ctx.drawImage(v,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h);removeGreen(pixels.data);ctx.putImageData(pixels,0,0)}frame=requestAnimationFrame(draw)};
  v.play().catch(async()=>{if(cancelled)return;v.muted=true;try{await v.play();if(!cancelled)callbacks.current.onError('Video is playing silently. Allow sound on the presentation browser, then unmute.')}catch{if(!cancelled)callbacks.current.onError('This video could not play. Try an MP4 (H.264) version.')}});draw();
  return()=>{cancelled=true;cancelAnimationFrame(frame);v.pause();v.removeAttribute('src');v.load()};
 },[clip]);
 return <div className="green-screen-effect"><video ref={video} src={`/greenscreen/${clip}.MOV`} muted={muted} playsInline preload="auto" onEnded={()=>callbacks.current.onDone()} onError={()=>callbacks.current.onError('This video could not load. Check its format and deployed file.')}/><canvas ref={canvas}/></div>
}
