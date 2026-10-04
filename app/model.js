'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
export default function Model({slide,part,spin,reset}){
 const host=useRef(),api=useRef(),[failed,setFailed]=useState(false);
 useEffect(()=>{let renderer,frame,observer;const el=host.current;let controls;
 try{
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);el.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Rotatable illustrative FineTrack Duo model');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.1,8.5);
 scene.add(new THREE.HemisphereLight(0xdce8ff,0x404335,3));
 [[-4,5,5,0xffffff,70],[4,1,3,0xb9caff,45],[0,-3,-3,0xcaff70,25]].forEach(([x,y,z,c,i])=>{const l=new THREE.PointLight(c,i);l.position.set(x,y,z);scene.add(l)});
 const pivot=new THREE.Group(),body=new THREE.Group();scene.add(pivot);pivot.add(body);
 const dark=new THREE.MeshStandardMaterial({color:0x282c30,roughness:.42,metalness:.45});
 const face=new THREE.MeshStandardMaterial({color:0x777e94,roughness:.33,metalness:.6});
 const silver=new THREE.MeshStandardMaterial({color:0xa4acba,roughness:.28,metalness:.8});
 const mesh=(shape,depth,mat,z)=>{const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.045,bevelThickness:.04,curveSegments:24});const m=new THREE.Mesh(g,mat);m.position.z=z;body.add(m);return m;};
 mesh(rounded(2.55,2.6,.48),.3,dark,-.16);
 mesh(rounded(2.34,2.38,.43),.065,face,.16);
 mesh(rounded(2.32,2.36,.44),.04,dark,-.22);
 // Attachment opening follows the raised loop visible in the official photographs.
 const loop=new THREE.Shape();loop.moveTo(-1.15,.88);loop.lineTo(-1.15,1.47);loop.quadraticCurveTo(-1.15,1.98,-.72,1.91);loop.lineTo(.35,1.29);loop.lineTo(-.05,1.22);loop.lineTo(-.73,1.62);loop.quadraticCurveTo(-.91,1.73,-.91,1.45);loop.lineTo(-.91,.9);loop.closePath();mesh(loop,.23,dark,-.12);
 const button=new THREE.Mesh(new THREE.CylinderGeometry(.255,.255,.04,48),silver);button.rotation.x=Math.PI/2;button.position.set(-.66,-.67,.30);body.add(button);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.045,48),face);cap.rotation.x=Math.PI/2;cap.position.set(-.66,-.67,.327);body.add(cap);
 const port=mesh(rounded(.49,.14,.065),.018,new THREE.MeshStandardMaterial({color:0x111316}),0);port.rotation.x=Math.PI/2;port.position.set(.32,-1.354,0);
 const tongue=new THREE.Mesh(new THREE.BoxGeometry(.3,.014,.055),silver);tongue.position.set(.32,-1.374,0);body.add(tongue);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);ctx.fillStyle='#171d25';ctx.font='bold 72px Arial';ctx.textAlign='center';ctx.fillText('UGREEN',256,90);const texture=new THREE.CanvasTexture(canvas);const logo=new THREE.Mesh(new THREE.PlaneGeometry(.91,.2275),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));logo.position.set(.4,.77,.273);body.add(logo);
 controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=12;controls.autoRotateSpeed=.65;controls.target.set(0,.2,0);
 const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()};observer=new ResizeObserver(resize);observer.observe(el);resize();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 api.current={controls,pivot,body,face,button,cap,port,dark,reduced,target:[-.16,-.35,-.12],spin:true};
 const animate=()=>{frame=requestAnimationFrame(animate);const a=api.current;controls.autoRotate=a.spin&&!reduced;const speed=reduced?1:.045;pivot.rotation.x=THREE.MathUtils.lerp(pivot.rotation.x,a.target[0],speed);pivot.rotation.y=THREE.MathUtils.lerp(pivot.rotation.y,a.target[1],speed);pivot.rotation.z=THREE.MathUtils.lerp(pivot.rotation.z,a.target[2],speed);controls.update();renderer.render(scene,camera)};animate();
 }catch(e){setFailed(true)}
 return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(api.current){api.current.body.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose()}})}renderer?.dispose();renderer?.domElement.remove();api.current=null;};
 },[]);
 useEffect(()=>{if(!api.current)return;const a=api.current;a.spin=spin;a.controls.reset();a.target=part==='port'?[.95,-.25,0]:part==='loop'?[0,-.2,-.1]:slide===3?[.1,.6,.12]:[-.12,-.32,-.12];a.face.emissive.set(part==='body'?0x23330b:0x000000);a.cap.material=part==='button'?new THREE.MeshStandardMaterial({color:0xc5f66b,metalness:.3,roughness:.3}):a.face;},[slide,part,spin,reset]);
 return <div className="model-host" ref={host}>{failed&&<div className="fallback"><img src="/product.png" alt="Official UGREEN FineTrack Duo product photo"/><p>3D unavailable on this device. Product photo shown.</p></div>}</div>;
}
