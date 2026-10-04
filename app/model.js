'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
export default function Model({slide,part,spin,reset}){
 const host=useRef(),api=useRef(),[failed,setFailed]=useState(false);
 useEffect(()=>{let renderer,frame,observer,environment,pmrem;const el=host.current;let controls;
 try{
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);el.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Rotatable illustrative FineTrack Duo model');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.1,8.7);
 pmrem=new THREE.PMREMGenerator(renderer);const studio=new RoomEnvironment();environment=pmrem.fromScene(studio,.04);studio.dispose();scene.environment=environment.texture;scene.environmentIntensity=.4;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;scene.add(new THREE.HemisphereLight(0xe7ecff,0x737780,.8));
 [[-4,5,5,0xffffff,26],[4,1,3,0xb9caff,14],[0,-3,-3,0xffffff,8]].forEach(([x,y,z,c,i])=>{const l=new THREE.PointLight(c,i);l.position.set(x,y,z);scene.add(l)});
 const pivot=new THREE.Group(),body=new THREE.Group();scene.add(pivot);pivot.add(body);
 const dark=new THREE.MeshStandardMaterial({color:0x25282c,roughness:.3,metalness:.15});
 const face=new THREE.MeshStandardMaterial({color:0x555b70,roughness:.42,metalness:.28});
 const silver=new THREE.MeshStandardMaterial({color:0xbdc4ce,roughness:.3,metalness:.65});
 const buttonFace=new THREE.MeshStandardMaterial({color:0x565e72,roughness:.46,metalness:.15});
 const highlight=new THREE.MeshStandardMaterial({color:0xc5f66b,roughness:.4});
 const seam=new THREE.MeshStandardMaterial({color:0x111417,roughness:.45,metalness:.1});
 const mesh=(shape,depth,mat,z,bevel=.04)=>{const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:48});const m=new THREE.Mesh(g,mat);m.position.z=z;body.add(m);return m;};
 // One continuous moulded frame, including the rounded attachment opening.
 const outline=new THREE.Shape();outline.moveTo(-.79,-1.34);outline.lineTo(.79,-1.34);outline.quadraticCurveTo(1.33,-1.34,1.33,-.80);outline.lineTo(1.33,.76);outline.quadraticCurveTo(1.33,1.17,.94,1.33);outline.lineTo(-.64,1.98);outline.bezierCurveTo(-1.01,2.13,-1.33,1.92,-1.33,1.52);outline.lineTo(-1.33,-.80);outline.quadraticCurveTo(-1.33,-1.34,-.79,-1.34);
 const opening=new THREE.Path();opening.moveTo(-1.17,1.13);opening.lineTo(-1.17,1.52);opening.bezierCurveTo(-1.17,1.85,-.96,1.96,-.70,1.85);opening.lineTo(.65,1.31);opening.quadraticCurveTo(.48,1.27,.31,1.27);opening.lineTo(-.72,1.27);opening.quadraticCurveTo(-.94,1.27,-1.17,1.13);outline.holes.push(opening);
 mesh(outline,.23,dark,-.13,.03);
 mesh(rounded(2.48,2.48,.51),.026,seam,.125,.032);
 mesh(rounded(2.35,2.35,.48),.055,face,.153,.055);
 mesh(rounded(2.42,2.43,.50),.035,dark,-.205,.04);
 // A bright annular bezel and recessed centre: no overlapping cap faces.
 const ringShape=new THREE.Shape();ringShape.absarc(0,0,.273,0,Math.PI*2,false);const ringHole=new THREE.Path();ringHole.absarc(0,0,.222,0,Math.PI*2,true);ringShape.holes.push(ringHole);
 const button=mesh(ringShape,.015,silver,.265,.006);button.position.x=-.69;button.position.y=-.68;
 const cap=new THREE.Mesh(new THREE.CircleGeometry(.217,64),buttonFace);cap.position.set(-.69,-.68,.278);body.add(cap);
 const port=mesh(rounded(.43,.12,.055),.014,seam,0,.008);port.rotation.x=Math.PI/2;port.position.set(.32,-1.391,-.01);
 const tongue=new THREE.Mesh(new THREE.BoxGeometry(.28,.012,.04),silver);tongue.position.set(.32,-1.409,-.01);body.add(tongue);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.fillStyle='#08090c';ctx.font='600 148px Arial';ctx.textAlign='center';ctx.fillText('UGREEN',512,178);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();const logo=new THREE.Mesh(new THREE.PlaneGeometry(.89,.2225),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));logo.position.set(.43,.79,.267);body.add(logo);
 controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=12;controls.autoRotateSpeed=.65;controls.target.set(0,.2,0);
 const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()};observer=new ResizeObserver(resize);observer.observe(el);resize();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 api.current={controls,pivot,body,face,button,cap,port,dark,buttonFace,highlight,reduced,target:[-.12,-.22,-.48],spin:true};
 const animate=()=>{frame=requestAnimationFrame(animate);const a=api.current;controls.autoRotate=a.spin&&!reduced;const speed=reduced?1:.045;pivot.rotation.x=THREE.MathUtils.lerp(pivot.rotation.x,a.target[0],speed);pivot.rotation.y=THREE.MathUtils.lerp(pivot.rotation.y,a.target[1],speed);pivot.rotation.z=THREE.MathUtils.lerp(pivot.rotation.z,a.target[2],speed);controls.update();renderer.render(scene,camera)};animate();
 }catch(e){setFailed(true)}
 return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(api.current){api.current.body.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose()}})}environment?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.domElement.remove();api.current=null;};
 },[]);
 useEffect(()=>{if(!api.current)return;const a=api.current;a.spin=spin;a.controls.reset();a.target=part==='port'?[.95,-.25,0]:part==='loop'?[0,-.12,-.42]:slide===3?[.1,.4,-.4]:[-.12,-.22,-.48];a.face.emissive.set(part==='body'?0x23330b:0x000000);a.cap.material=part==='button'?a.highlight:a.buttonFace;},[slide,part,spin,reset]);
 return <div className="model-host" ref={host}>{failed&&<div className="fallback"><img src="/product.png" alt="Official UGREEN FineTrack Duo product photo"/><p>3D unavailable on this device. Product photo shown.</p></div>}</div>;
}
