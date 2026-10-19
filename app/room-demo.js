'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {buildRoom} from './room-scene';
import EcosystemVisual from './ecosystem-visual';
import LocationMap from './location-map';
// Every scene is presenter-driven; animation never advances the story.
export const demoSteps=[
 ['Ready to leave','A familiar morning. One essential is missing.',{setting:'home',shot:'wide',room:0,speaker:'Student',line:'I’m ready for class… where did I put my keys?'}],
 ['Open the finding app','Choose the keys in your compatible finding app.',{setting:'home',view:'phone',item:'Keys',speaker:'Student',line:'Let me select my keys in the app.'}],
 ['Ask the tracker to ring','The tag is connected nearby. Request a sound.',{setting:'home',shot:'person',room:1,sound:true,speaker:'Student',line:'Play Sound. Let’s listen carefully.'}],
 ['Listen to the source','A close-up reveals the tracker beside the keys.',{setting:'home',shot:'detail',room:1,sound:true,speaker:'Narrator',line:'The alert comes from the tracker—not the phone.'}],
 ['Follow the sound','Move towards the table and search nearby.',{setting:'home',shot:'follow',room:2,sound:true,speaker:'Student',line:'I can hear it over by the entryway table!'}],
 ['Keys found','The small sound saves a search around the room.',{setting:'home',shot:'found',room:3,speaker:'Student',line:'There they are. Now I can leave for class.'}],
 ['A bag left behind','A different problem: the bag is no longer nearby.',{setting:'cafe',shot:'wide',room:0,speaker:'Student',line:'My bag! Did I leave it at the café?'}],
 ['Check the map','Look at the bag’s sample last-reported location.',{setting:'cafe',view:'map',item:'Bag',speaker:'Student',line:'The last reported location is the café. I’ll check there.'}],
 ['Understand the update','A participating device may report the tag’s location.',{setting:'cafe',view:'map',item:'Bag',speaker:'Narrator',line:'This is a reported location, not continuous live GPS. Updates can be delayed.'}],
 ['Return to the café','Go to the reported place and look for the item.',{setting:'cafe',shot:'person',room:0,speaker:'Student',line:'I’m back at the café. Let me look near our table.'}],
 ['Find it nearby','Once connected nearby, request a sound again.',{setting:'cafe',shot:'detail',room:1,sound:true,speaker:'Student',line:'That sound is coming from my bag!'}],
 ['Bag recovered','Confirm that it is your bag and collect it.',{setting:'cafe',shot:'found',room:3,speaker:'Student',line:'Found it. The map got me here; the sound helped me finish.'}],
 ['At the terminal','A similar-looking suitcase can be easy to overlook.',{setting:'airport',shot:'wide',room:0,speaker:'Traveller',line:'There are so many cases. Which one is mine?'}],
 ['Check the suitcase location','A sample map provides a starting point for the search.',{setting:'airport',view:'map',item:'Luggage',speaker:'Traveller',line:'It was last reported at the terminal. I’ll check that area.'}],
 ['Listen nearby','When the tracker connects nearby, use its sound.',{setting:'airport',shot:'follow',room:2,sound:true,speaker:'Traveller',line:'I hear the alert at the baggage carousel.'}],
 ['Ready for the next journey','Attach. Pair. Check the map. Listen nearby.',{setting:'airport',shot:'found',room:3,speaker:'Traveller',line:'That’s my suitcase. Ready to go!'}]
];
export function useRoomDemo(active,onComplete,masterMuted=false){
 const [phase,setPhase]=useState(0),[playing,setPlaying]=useState(false),[fileName,setFileName]=useState(''),[error,setError]=useState(''),[muted,setMuted]=useState(false);
 const audio=useRef(null),url=useRef(null),run=useRef(0);
 const stop=()=>{run.current++;setPlaying(false);audio.current?.pause()};
 useEffect(()=>{if(!active){stop();setPhase(0)}},[active]);
 useEffect(()=>()=>{audio.current?.pause();if(url.current)URL.revokeObjectURL(url.current)},[]);
 useEffect(()=>{if(audio.current)audio.current.volume=masterMuted||muted||!demoSteps[phase][2].sound?0:.45},[muted,phase,masterMuted]);
 async function jump(i){stop();setPhase(i);setError('');const animate=true;setPlaying(animate);if(demoSteps[i][2].sound&&audio.current){const token=run.current;audio.current.volume=masterMuted||muted?0:.45;try{await audio.current.play()}catch{if(token===run.current)setError('Audio could not play. Try another recording.')}if(token!==run.current)audio.current.pause()}else if(audio.current){audio.current.currentTime=0}}
 const advance=()=>{if(phase===demoSteps.length-1){stop();onComplete?.()}else jump(phase+1)};
 function upload(e){const file=e.target.files?.[0];if(!file)return;stop();setError('');if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)){setError('Choose an audio recording, such as MP3 or WAV.');return}if(file.size>30*1024*1024){setError('Please choose a recording smaller than 30 MB.');return}if(url.current)URL.revokeObjectURL(url.current);url.current=URL.createObjectURL(file);audio.current=new Audio(url.current);audio.current.loop=true;audio.current.onerror=()=>setError('This recording could not be decoded. Try MP3 or WAV.');setFileName(file.name);setPhase(0)}
 return {phase,playing,fileName,error,muted,setMuted,stop,advance,jump,upload,last:phase===demoSteps.length-1};
}
export function DemoControls({demo}){return <div className="room-controls"><ol className="demo-steps">{demoSteps.map(([title,text],i)=><li key={title}><button aria-current={demo.phase===i?'step':undefined} onClick={()=>demo.jump(i)}><span>{i+1}</span><div><strong>{title}</strong><small>{text}</small></div></button></li>)}</ol><div className="demo-buttons"><button onClick={()=>demo.jump(0)}>Reset</button>{demo.fileName&&<button aria-pressed={demo.muted} onClick={()=>demo.setMuted(!demo.muted)}>{demo.muted?'Unmute':'Mute'}</button>}</div><label className="audio-upload">Add your tracker recording<input type="file" accept="audio/*,.m4a" onChange={demo.upload}/></label><p className="audio-status" role="status">{demo.error||demo.fileName||'Visual demo ready. Add your sound when you have it.'}</p></div>}
function RoomCanvas({phase,playing,shot,setting,orbit}){
 const host=useRef(null),current=useRef({phase,playing,shot,orbit}),[failed,setFailed]=useState(false);current.current={phase,playing,shot,orbit};
 useEffect(()=>{let renderer,frame,observer,controls,scene;try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;host.current.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D scenario with a person and their tracked belonging');
 scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x9e8a71,2.5));const sun=new THREE.DirectionalLight(0xffe6bb,4);sun.position.set(-2,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.normalBias=.03;scene.add(sun);
 const camera=new THREE.PerspectiveCamera(38,1,.1,70);camera.position.set(6.5,5.4,8.3);controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.8,0);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=.3;controls.maxDistance=30;controls.minAzimuthAngle=-Math.PI;controls.maxAzimuthAngle=Math.PI;controls.maxPolarAngle=Math.PI/2.1;controls.update();
 const model=buildRoom(scene,setting),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now();
 const shots={wide:[[6.5,5.4,8.3],[0,.8,0]],person:[[1.2,2.5,4.3],[-1.1,1,.7]],detail:setting==='home'?[[2.05,1.06,.62],[1.87,.80,.22]]:[[2.5,1.6,1.4],[1.85,1,.20]],follow:[[4.3,3.2,5.1],[.3,.85,.4]],found:[[4,2.7,4.4],[1.4,.8,.2]]};
 let remoteId=null,remoteTarget=null,remoteRadius=0;
 let framing=true,previousShot='',last=performance.now(),elapsed=0;controls.addEventListener('start',()=>{framing=false;remoteTarget=null});
 const resize=()=>{const {width,height}=host.current.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();framing=true;previousShot=''};observer=new ResizeObserver(resize);observer.observe(host.current);resize();
 const tick=()=>{frame=requestAnimationFrame(tick);const now=performance.now(),state=current.current,dt=Math.min((now-last)/1000,.05);elapsed+=dt;last=now;
 if(state.shot!==previousShot){framing=true;remoteTarget=null;previousShot=state.shot}
 if(state.orbit&&state.orbit.id!==remoteId){remoteId=state.orbit.id;framing=false;controls.maxPolarAngle=Math.PI-.01;controls.enableDamping=false;controls.update();controls.enableDamping=true;remoteRadius=camera.position.distanceTo(controls.target);remoteTarget=new THREE.Vector3().setFromSpherical(new THREE.Spherical(remoteRadius,THREE.MathUtils.degToRad(90-state.orbit.pitch),THREE.MathUtils.degToRad(state.orbit.yaw))).add(controls.target)}
 if(remoteTarget){camera.position.lerp(remoteTarget,reduced?1:1-Math.exp(-12*dt));camera.position.sub(controls.target).setLength(remoteRadius).add(controls.target)}
 if(framing){const [position,target]=shots[state.shot]||shots.wide,aim=new THREE.Vector3(...target),offset=new THREE.Vector3(...position).sub(aim);offset.multiplyScalar(Math.max(.8,1/camera.aspect));const dest=aim.clone().add(offset),speed=reduced?1:1-Math.exp(-3*dt);camera.position.lerp(dest,speed);controls.target.lerp(aim,speed);if(camera.position.distanceTo(dest)<.005)framing=false;}
 model.update(state.phase,elapsed,reduced);controls.update();renderer.render(scene,camera)};tick();

 }catch{setFailed(true)}return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();scene?.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose()});renderer?.dispose();renderer?.domElement.remove()};},[setting]);
 return <div className="room-canvas" ref={host}>{failed&&<p>3D rendering is unavailable. Use the story steps to walk through the demonstration.</p>}</div>
}
export default function RoomDemo({demo,orbit}){const [title,text,story]=demoSteps[demo.phase];return <div className={'room-demo cinematic-demo phase-'+demo.phase}>
 <div className="room-scene"><span className="scene-badge">{story.setting==='home'?'01 · MISSING KEYS':story.setting==='cafe'?'02 · THE FORGOTTEN BAG':'03 · AT THE TERMINAL'} · {story.view==='map'?'LOCATION MAP':story.view==='phone'?'FINDING APP':'3D STORY'}</span>
 {story.view==='map'?<LocationMap key={story.item} item={story.item}/>:story.view?<EcosystemVisual key={story.view+story.setting} map={story.view==='map'} item={story.item} paired={true}/>:<RoomCanvas orbit={orbit} phase={story.room} playing={demo.playing} shot={story.shot} setting={story.setting}/>}
 <div className="story-dialogue" aria-live="polite"><span>{story.speaker}</span><p>“{story.line}”</p></div></div>
 <div className="demo-caption" aria-live="polite"><span>{String(demo.phase+1).padStart(2,'0')} / {demoSteps.length}</span><strong>{title}</strong><p>{text}</p></div>
 <div className="story-navigation"><button disabled={demo.phase===0} onClick={()=>demo.jump(demo.phase-1)}>← Previous moment</button><div>{[0,6,12].map((n,i)=><button key={n} aria-pressed={story.setting===['home','cafe','airport'][i]} onClick={()=>demo.jump(n)}>{['Keys','Bag','Luggage'][i]}</button>)}</div><span>{demo.last?'Next continues to the next slide':'Use Next below to continue'}</span></div>
 <p className="demo-disclaimer">Illustrative dialogue and sample locations. Map updates depend on participating devices; sound requires a nearby connection. Waves do not represent measured range.</p></div>}
