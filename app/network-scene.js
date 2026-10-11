'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export default function NetworkScene({platform='ios',map=false,item='Keys',paired=false}){
 const host=useRef(null),state=useRef({item,paired}),[failed,setFailed]=useState(false);state.current={item,paired};
 useEffect(()=>{
 let renderer,controls,observer,frame,scene;const textures=[];
 try{
 renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;host.current.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label',map?'Interactive 3D sample map with an item marker and phone':'3D tracker connecting wirelessly to a '+(platform==='ios'?'iPhone':'Android phone'));
 scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0x647a70,3));const light=new T.DirectionalLight(0xffffff,4);light.position.set(-3,5,7);scene.add(light);
 const root=new T.Group();scene.add(root);
 const camera=new T.PerspectiveCamera(35,1,.1,100);controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=32;controls.maxPolarAngle=Math.PI*.8;
 const mat=(color,metalness=0)=>new T.MeshStandardMaterial({color,metalness,roughness:.35});
 function box(parent,w,h,d,color,x=0,y=0,z=0,r=.08){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,r),mat(color));o.position.set(x,y,z);parent.add(o);return o}
 const phone=new T.Group();root.add(phone);phone.position.set(map?2.5:1.65,0,.3);phone.rotation.y=-.12;
 box(phone,2.05,4.1,.22,0x24292c);box(phone,2.1,.45,.07,0x657170,0,.8,0);
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=1120;const ctx=canvas.getContext('2d');const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);
 const screen=new T.Mesh(new T.PlaneGeometry(1.88,3.84),new T.MeshBasicMaterial({map:texture}));screen.position.z=.122;phone.add(screen);box(phone,.56,.10,.04,0x131717,0,1.84,.15,.04);
 const icon=new Image();let disposed=false;icon.src=platform==='ios'?'/find-my.png':'/find-hub.png';icon.onload=()=>{if(!disposed)draw()};
 function draw(){const {item,paired}=state.current;ctx.fillStyle='#f5faf7';ctx.fillRect(0,0,600,1120);ctx.fillStyle='#20382c';ctx.font='bold 36px Arial';ctx.fillText(platform==='ios'?'Find My':'Find Hub',35,110);if(icon.complete&&icon.naturalWidth)ctx.drawImage(icon,465,50,80,80);ctx.font='23px Arial';ctx.fillText(map?'Illustrative location view':'Pairing demonstration',35,165);
 ctx.fillStyle='#d8e7df';ctx.fillRect(20,210,560,510);ctx.strokeStyle='#ffffff';ctx.lineWidth=26;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(20,250+i*105);ctx.lineTo(580,300+i*105);ctx.stroke();ctx.beginPath();ctx.moveTo(80+i*115,210);ctx.lineTo(30+i*115,720);ctx.stroke()}
 const px=item==='Keys'?210:405,py=item==='Keys'?405:550;ctx.fillStyle='#008a49';ctx.beginPath();ctx.arc(px,py,30,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#162d22';ctx.font='bold 37px Arial';ctx.fillText('FineTrack · '+item,35,795);ctx.font='24px Arial';ctx.fillStyle='#53675c';ctx.fillText(map?(item==='Keys'?'Library · sample location':item==='Luggage'?'Terminal A · sample location':'Café · sample location'):paired?'Connected · demo':'Ready to connect',35,843);ctx.fillText(map?'Last reported location':'One finding network at a time',35,885);ctx.fillStyle='#008a49';ctx.beginPath();ctx.roundRect(30,942,540,78,20);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 26px Arial';ctx.fillText(map?'Locate your belongings':paired?'Tracker added':'Add item',300,991);ctx.textAlign='left';ctx.fillStyle='#728278';ctx.font='19px Arial';ctx.fillText('DEMO UI · NOT A LIVE TRACKER',35,1070);texture.needsUpdate=true;}
 draw();
 const waves=[];let marker,city;
 if(map){city=new T.Group();root.add(city);city.position.set(-1.2,-.25,0);city.rotation.x=-.8;box(city,4.8,4.1,.15,0xc7dccf);
 for(let i=-2;i<=2;i++){box(city,.12,4.05,.02,0xffffff,i*.85,0,.09,.01);box(city,4.75,.12,.02,0xffffff,0,i*.75,.10,.01)}
 for(let x=-2;x<2;x++)for(let y=-2;y<2;y++){const h=.12+((x+y+5)%3)*.16;box(city,.55,.45,h,((x+y)%2)?0x88a99c:0xe3e9e5,x*.9+.35,y*.78+.3,.12+h/2,.03)}
 marker=new T.Group();city.add(marker);const pin=new T.Mesh(new T.SphereGeometry(.18,24,16),mat(0x00a957));pin.position.z=.9;marker.add(pin);const stem=new T.Mesh(new T.CylinderGeometry(.025,.065,.65,12),mat(0x008848));stem.rotation.x=Math.PI/2;stem.position.z=.5;marker.add(stem);
 }else{const tracker=new T.Group();root.add(tracker);tracker.position.set(-1.6,-.08,.3);tracker.rotation.z=-.18;
 const shape=new T.Shape();shape.moveTo(-.78,-.76);shape.lineTo(.48,-.76);shape.quadraticCurveTo(.8,-.76,.8,-.44);shape.lineTo(.8,.55);shape.quadraticCurveTo(.8,.82,.5,.82);shape.lineTo(-.58,1.2);shape.quadraticCurveTo(-.84,1.28,-.85,.93);shape.lineTo(-.96,-.47);shape.quadraticCurveTo(-.98,-.76,-.78,-.76);
 const hole=new T.Path();hole.moveTo(-.65,.65);hole.lineTo(-.65,.98);hole.quadraticCurveTo(-.65,1.04,-.58,.99);hole.lineTo(.07,.79);hole.lineTo(-.65,.65);shape.holes.push(hole);
 tracker.add(new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelThickness:.03,bevelSize:.025,bevelSegments:3,steps:1}),mat(0x292e32)));
 const face=new T.Shape();face.moveTo(-.53,-.72);face.lineTo(.49,-.72);face.quadraticCurveTo(.74,-.72,.74,-.47);face.lineTo(.74,.45);face.quadraticCurveTo(.74,.70,.49,.70);face.lineTo(-.53,.70);face.quadraticCurveTo(-.78,.70,-.78,.45);face.lineTo(-.78,-.47);face.quadraticCurveTo(-.78,-.72,-.53,-.72);const front=new T.Mesh(new T.ExtrudeGeometry(face,{depth:.045,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:3,steps:1}),mat(0x5f677d));front.position.z=.17;tracker.add(front);const ring=new T.Mesh(new T.TorusGeometry(.14,.025,12,40),mat(0xc9d7df,.6));ring.position.set(-.48,-.38,.23);tracker.add(ring);
 const label=document.createElement('canvas');label.width=512;label.height=128;const lc=label.getContext('2d');lc.fillStyle='#17231e';lc.font='bold 65px Arial';lc.fillText('UGREEN',20,85);const lt=new T.CanvasTexture(label);textures.push(lt);const lm=new T.Mesh(new T.PlaneGeometry(.6,.15),new T.MeshBasicMaterial({map:lt,transparent:true}));lm.position.set(.21,.37,.22);tracker.add(lm);
 for(let i=0;i<4;i++){const o=new T.Mesh(new T.SphereGeometry(.045,16,12),new T.MeshBasicMaterial({color:0x00ad61,transparent:true}));root.add(o);waves.push(o)} }
 const resize=()=>{const {width,height}=host.current.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.position.set(0,.1,Math.max(7.6,(map?12.4:10.2)/camera.aspect));controls.target.set(0,0,0);camera.updateProjectionMatrix();controls.update()};observer=new ResizeObserver(resize);observer.observe(host.current);resize();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let last='';function tick(t){frame=requestAnimationFrame(tick);const key=state.current.item+state.current.paired;if(last!==key){draw();last=key}if(marker){marker.position.set(state.current.item==='Keys'?-.6:1.2,state.current.item==='Keys'?.5:-.7,0);marker.scale.setScalar(reduced?1:1+Math.sin(t*.003)*.05)}waves.forEach((o,i)=>{const p=reduced?(i+1)/5:((t*.0003+i*.25)%1);o.position.set(-.65+p*1.2,.05+Math.sin(p*Math.PI)*.3,.4);o.visible=state.current.paired;o.material.opacity=.3+Math.sin(p*Math.PI)*.7});controls.update();renderer.render(scene,camera)}frame=requestAnimationFrame(tick);
 return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose()});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()};
 }catch{setFailed(true);return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();renderer?.dispose()}}
 },[platform,map]);
 return <div className="network-canvas" ref={host}>{failed&&<p>3D is unavailable in this browser. The controls and explanation remain available.</p>}</div>
}

