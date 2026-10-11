'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createAccessories} from './accessories';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
// Each chapter frames the same model differently; transitions preserve the canvas.
const poses=[
 {rotation:[-.12,-.28,-.32],position:[-.20,.06,0],scale:1.43},
 {rotation:[.12,.46,.16],position:[.25,.03,0],scale:1.42},
 {rotation:[0,-.1,-.05],position:[-.12,.09,0],scale:1.50},
 {rotation:[-.18,-.52,-.24],position:[.24,-.02,0],scale:1.45},
 {rotation:[.24,.38,.24],position:[-.24,.02,0],scale:1.40},
 {rotation:[-.08,-.18,-.38],position:[.10,.10,0],scale:1.47}
];
export default function Model({sceneType='single',slide,part,spin,reset,colour,front,inside=false,separation=1,selected,onSelect}){
 const host=useRef(),api=useRef(),selectCallback=useRef(onSelect),[failed,setFailed]=useState(false);
 selectCallback.current=onSelect;
 useEffect(()=>{let renderer,frame,observer,environment,pmrem;const el=host.current;let controls;
 try{
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);el.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Rotatable illustrative FineTrack Duo model');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.1,8.7);
 const detailCamera=new THREE.OrthographicCamera(-3,3,2.3,-2.3,.1,100);detailCamera.position.set(0,0,12);detailCamera.lookAt(0,0,0);
 pmrem=new THREE.PMREMGenerator(renderer);const studio=new RoomEnvironment();environment=pmrem.fromScene(studio,.04);studio.dispose();scene.environment=environment.texture;scene.environmentIntensity=.4;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;scene.add(new THREE.HemisphereLight(0xe7ecff,0x737780,.8));
 [[-4,5,5,0xffffff,26],[4,1,3,0xb9caff,14],[0,-3,-3,0xffffff,8]].forEach(([x,y,z,c,i])=>{const l=new THREE.PointLight(c,i);l.position.set(x,y,z);scene.add(l)});
 const pivot=new THREE.Group(),body=new THREE.Group();scene.add(pivot);pivot.add(body);const coverGroup=new THREE.Group(),rearGroup=new THREE.Group(),boardGroup=new THREE.Group(),batteryGroup=new THREE.Group();body.add(coverGroup,rearGroup,boardGroup,batteryGroup);
 const dark=new THREE.MeshStandardMaterial({color:0x25282c,roughness:.3,metalness:.15});
 const face=new THREE.MeshStandardMaterial({color:0x555b70,roughness:.42,metalness:.28});
 const silver=new THREE.MeshStandardMaterial({color:0xbdc4ce,roughness:.3,metalness:.65});
 const buttonFace=new THREE.MeshStandardMaterial({color:0x565e72,roughness:.46,metalness:.15});
 const highlight=new THREE.MeshStandardMaterial({color:0xc5f66b,roughness:.4});
 const seam=new THREE.MeshStandardMaterial({color:0x111417,roughness:.45,metalness:.1});
 const mesh=(shape,depth,mat,z,bevel=.04)=>{const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:48});const m=new THREE.Mesh(g,mat);m.position.z=z;body.add(m);return m;};
 // Reference front view: the opening is contained within the square perimeter.
 const outline=rounded(2.66,2.66,.54);
 const opening=new THREE.Path();opening.moveTo(-1.21,.37);opening.lineTo(-1.21,.79);opening.quadraticCurveTo(-1.21,1.21,-.79,1.21);opening.lineTo(-.37,1.21);opening.quadraticCurveTo(-.34,1.21,-.37,1.18);opening.lineTo(-1.18,.37);opening.quadraticCurveTo(-1.21,.34,-1.21,.37);outline.holes.push(opening);
 const casingFrame=mesh(outline,.29,dark,-.17,.014);rearGroup.add(casingFrame);
 const panel=()=>{const p=new THREE.Shape();p.moveTo(-.72,-1.16);p.lineTo(.72,-1.16);p.quadraticCurveTo(1.16,-1.16,1.16,-.72);p.lineTo(1.16,.72);p.quadraticCurveTo(1.16,1.16,.72,1.16);p.lineTo(-.25,1.16);p.quadraticCurveTo(-.40,1.16,-.51,1.05);p.lineTo(-1.05,.51);p.quadraticCurveTo(-1.16,.40,-1.16,.25);p.lineTo(-1.16,-.72);p.quadraticCurveTo(-1.16,-1.16,-.72,-1.16);return p;};
 const gasket=mesh(panel(),.025,seam,.125,.042);gasket.scale.set(1.025,1.025,1);coverGroup.add(gasket);
 coverGroup.add(mesh(panel(),.055,face,.153,.025));
 rearGroup.add(mesh(panel(),.025,dark,-.22,.025));
 // A bright annular bezel and recessed centre: no overlapping cap faces.
 const ringShape=new THREE.Shape();ringShape.absarc(0,0,.248,0,Math.PI*2,false);const ringHole=new THREE.Path();ringHole.absarc(0,0,.210,0,Math.PI*2,true);ringShape.holes.push(ringHole);
 const led=new THREE.MeshStandardMaterial({color:0x667080,emissive:0xf0faff,emissiveIntensity:0,roughness:.32,metalness:.12});
 const button=mesh(ringShape,.015,led,.265,.006);button.position.x=-.72;button.position.y=-.72;
 const cap=new THREE.Mesh(new THREE.CircleGeometry(.205,64),buttonFace);cap.position.set(-.72,-.72,.278);coverGroup.add(button,cap);
 const portMaterial=seam.clone();const port=mesh(rounded(.43,.12,.055),.014,portMaterial,0,.008);port.rotation.x=Math.PI/2;port.position.set(.32,-1.338,-.01);
 const tongue=new THREE.Mesh(new THREE.BoxGeometry(.28,.012,.04),silver);tongue.position.set(.32,-1.361,-.01);rearGroup.add(port,tongue);
 // A shallow push-in dust plug: thin outer lip and an inset rubber stem.
 const portPlug=new THREE.Group();portPlug.position.set(.32,-1.350,-.01);rearGroup.add(portPlug);
 const plugMaterial=new THREE.MeshStandardMaterial({color:0x24282b,roughness:.86,metalness:0});
 const plugLip=mesh(rounded(.49,.155,.062),.012,plugMaterial,0,.003);plugLip.rotation.x=Math.PI/2;plugLip.position.set(0,0,0);portPlug.add(plugLip);
 const plugStem=mesh(rounded(.365,.085,.033),.085,plugMaterial,0,.002);plugStem.rotation.x=Math.PI/2;plugStem.position.set(0,.085,0);portPlug.add(plugStem);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.fillStyle='#08090c';ctx.font='600 148px Arial';ctx.textAlign='center';ctx.fillText('UGREEN',512,178);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();const logo=new THREE.Mesh(new THREE.PlaneGeometry(.89,.2225),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.02,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));logo.renderOrder=5;logo.position.set(.43,.79,.267);coverGroup.add(logo);
 // USB-C cable aligned to the bottom port; the rubber plug moves aside first.
 const cable=new THREE.Group();body.add(cable);cable.visible=false;
 const cableRubber=new THREE.MeshStandardMaterial({color:0x20262a,roughness:.72});
 const cableMetal=new THREE.MeshStandardMaterial({color:0xc3c9ce,metalness:.85,roughness:.24});
 const tipShape=rounded(.365,.088,.035);const tipHole=new THREE.Path();const inner=rounded(.30,.045,.018);tipHole.curves=inner.curves;tipShape.holes.push(tipHole);
 const connector=mesh(tipShape,.24,cableMetal,0,.004);connector.rotation.x=-Math.PI/2;connector.position.set(0,-.24,0);cable.add(connector);
 const housing=mesh(rounded(.49,.22,.08),.46,cableRubber,0,.016);housing.rotation.x=Math.PI/2;housing.position.set(0,-.24,0);cable.add(housing);
 const relief=new THREE.Mesh(new THREE.CylinderGeometry(.085,.07,.23,24),cableRubber);relief.position.y=-.79;cable.add(relief);
 const cordCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.86,0),new THREE.Vector3(0,-1.18,0),new THREE.Vector3(.15,-1.55,0),new THREE.Vector3(.65,-1.85,-.06),new THREE.Vector3(.95,-2.15,-.08)]);
 cable.add(new THREE.Mesh(new THREE.TubeGeometry(cordCurve,64,.065,12,false),cableRubber));
 // Simplified educational assembly, not a measured PCB reconstruction.
 const boardMaterial=new THREE.MeshStandardMaterial({color:0x145298,roughness:.6,metalness:.12});
 const chipMaterial=new THREE.MeshStandardMaterial({color:0x20252c,roughness:.7});
 const gold=new THREE.MeshStandardMaterial({color:0xc5aa54,roughness:.4,metalness:.65});
 const batteryMaterial=new THREE.MeshStandardMaterial({color:0xbec5cd,roughness:.48,metalness:.6});
 const pcb=mesh(panel(),.045,boardMaterial,-.03,.012);pcb.scale.set(.86,.86,1);boardGroup.add(pcb);
 const block=(group,w,h,d,x,y,z,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);group.add(m);return m;};
 block(boardGroup,.43,.43,.075,.25,.25,.07,chipMaterial);
 block(boardGroup,.24,.19,.05,-.51,-.2,.05,chipMaterial);
 block(boardGroup,.21,.31,.045,.48,-.46,.05,chipMaterial);
 block(boardGroup,.41,.18,.11,.12,-.93,.03,silver);
 for(let i=0;i<7;i++){block(boardGroup,.035,.07,.025,.07+i*.061,-.035,.07,silver);block(boardGroup,.035,.07,.025,.07+i*.061,.535,.07,silver);}
 for(let i=0;i<8;i++){block(boardGroup,.065,.1,.028,-.55+(i%4)*.2,-.57-Math.floor(i/4)*.18,.05,i%2?gold:chipMaterial);}
 const line=(group,points,material,r=.012)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,r,6,false),material);group.add(mesh);return mesh;};
 for(let i=0;i<4;i++)line(boardGroup,[[.04+i*.065,-.1,.04],[-.1+i*.065,-.3,.04],[-.5+i*.12,-.3,.04]],gold,.006);
 const antennaGroup=new THREE.Group();boardGroup.add(antennaGroup);line(antennaGroup,[[.70,.02,.06],[.78,.02,.06],[.78,.65,.06],[.62,.8,.06],[.17,.8,.06]],gold,.025);
 // Coin cell and stamped holder follow the user-supplied teardown photographs.
 const cell=new THREE.Mesh(new THREE.CylinderGeometry(.71,.71,.17,96),batteryMaterial);
 cell.rotation.x=Math.PI/2;cell.position.set(-.08,.12,.16);batteryGroup.add(cell);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.683,.019,10,96),silver);rim.position.set(-.08,.12,.251);batteryGroup.add(rim);
 const holder=new THREE.Mesh(new THREE.CylinderGeometry(.77,.77,.045,96),silver);holder.rotation.x=Math.PI/2;holder.position.set(-.08,.12,.05);boardGroup.add(holder);
 const contact=new THREE.Mesh(new THREE.CircleGeometry(.34,64),dark);contact.position.set(-.08,.12,.076);boardGroup.add(contact);
 block(boardGroup,.12,.44,.032,-.08,.14,.095,silver);
 for(const x of [-.80,.64])block(boardGroup,.12,.38,.16,x,.19,.11,silver);
 block(boardGroup,.25,.20,.035,.28,.72,.095,silver);
 const foam=new THREE.MeshStandardMaterial({color:0x17191b,roughness:1});
 block(boardGroup,1.36,.36,.11,-.05,-.63,.09,foam);
 const indicator=new THREE.MeshStandardMaterial({color:0xf1edc3,roughness:.5});
 block(boardGroup,.17,.17,.06,.73,-.64,.075,silver);
 block(boardGroup,.10,.10,.025,.73,-.64,.12,indicator);
 const disc=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.035,64),gold);disc.rotation.x=Math.PI/2;disc.position.set(.1,.06,.18);rearGroup.add(disc);
 const centre=new THREE.Mesh(new THREE.CircleGeometry(.33,64),new THREE.MeshStandardMaterial({color:0xd6d6d1,roughness:.6}));centre.position.set(.1,.06,.202);rearGroup.add(centre);
 const label=(group,text,x,y,z,w)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const cx=c.getContext('2d');cx.fillStyle='#172029';cx.font='bold 38px Arial';cx.textAlign='center';cx.fillText(text,256,78);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.position.set(x,y,z);group.add(m);};
 label(batteryGroup,'CR2032  3V',-.08,.12,.252,1.08);
 label(batteryGroup,'+',-.08,.45,.253,.3);
 for(const [g,id] of [[coverGroup,'cover'],[rearGroup,'speaker'],[boardGroup,'board'],[batteryGroup,'battery']])g.traverse(o=>o.userData.component=id);
 antennaGroup.traverse(o=>o.userData.component='antenna');
 const accessories=createAccessories();Object.values(accessories).forEach(g=>body.add(g));
 const copies=[];
 const finishes=[['#d9dce1','#a1a7af','#a5abb6'],['#4074a4','#23384e','#2d527b'],['#57866b','#283d31','#3b604b']];
 for(const colours of finishes){const g=new THREE.Group();const c=coverGroup.clone(true),r=rearGroup.clone(true);g.add(c,r);r.children.forEach(o=>{if(o.geometry===disc.geometry||o.geometry===centre.geometry)o.visible=false});
 g.traverse(o=>{if(o.material){const original=o.material;o.material=original.clone();if(original===face)o.material.color.set(colours[0]);if(original===dark)o.material.color.set(colours[1]);if(original===buttonFace)o.material.color.set(colours[2]);if(original===led)o.userData.led=true;}});g.visible=false;g.scale.setScalar(.001);body.add(g);copies.push(g);}
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
 renderer.domElement.addEventListener('pointerup',e=>{if(!api.current?.inside||api.current.amount<.03||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(body.children,true).find(h=>h.object.visible&&h.object.userData.component);if(hit)selectCallback.current?.(hit.object.userData.component);down=null;});
 controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=12;controls.autoRotateSpeed=.65;controls.target.set(0,0,0);
 const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();detailCamera.left=-2.3*camera.aspect;detailCamera.right=2.3*camera.aspect;detailCamera.updateProjectionMatrix()};observer=new ResizeObserver(resize);observer.observe(el);resize();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 api.current={sceneType,accessories,copies,portPlug,controls,pivot,body,face,button,cap,port,dark,buttonFace,highlight,coverGroup,rearGroup,boardGroup,batteryGroup,boardMaterial,batteryMaterial,gold,disc,centre,camera,tongue,inside:false,amount:0,reduced,led,target:poses[0].rotation,position:poses[0].position,scale:poses[0].scale,spin:false};
 let last=performance.now();const started=last;
 const animate=()=>{
  frame=requestAnimationFrame(animate);const now=performance.now(),dt=Math.min((now-last)/1000,.05),t=(now-started)/1000;last=now;
  const a=api.current,focus=a.sceneType==='parts'&&a.part,detail=!a.inside&&a.sceneType==='covered';controls.enabled=!detail;controls.autoRotate=a.spin&&!reduced&&!detail;
  for(const material of [dark,face,seam,buttonFace,silver,led,logo.material,portMaterial,plugMaterial]){
   let opacity=detail?.20:1;
   if(focus){const active=focus==='body'?[dark,face,seam,logo.material]:focus==='loop'?[dark]:focus==='button'?[led,buttonFace]:[portMaterial,silver,plugMaterial];opacity=active.includes(material)?1:.18;}
   if(detail&&material===plugMaterial)opacity=1;
   material.transparent=true;material.opacity=THREE.MathUtils.lerp(material.opacity,opacity,reduced?1:1-Math.exp(-5*dt));material.depthWrite=material!==logo.material&&opacity===1;
  }
  plugMaterial.color.set(detail?0x163d2b:0x24282b);const speed=reduced?1:1-Math.exp(-4*dt);
  pivot.rotation.x=THREE.MathUtils.lerp(pivot.rotation.x,a.target[0],speed);
  pivot.rotation.y=THREE.MathUtils.lerp(pivot.rotation.y,a.target[1],speed);
  pivot.rotation.z=THREE.MathUtils.lerp(pivot.rotation.z,a.target[2],speed);
  const drift=reduced||a.inside||detail||focus||a.sceneType==='colours'?0:Math.sin(t*.85)*.035;
  pivot.position.x=THREE.MathUtils.lerp(pivot.position.x,a.position[0],speed);
  pivot.position.y=THREE.MathUtils.lerp(pivot.position.y,a.position[1]+drift,speed);
  // Slow demonstration blink (one cycle every 2.2 seconds); steady with reduced motion.
  const blink=reduced?.6:Math.pow(Math.max(0,Math.sin(t*Math.PI*2/2.2)),2);
  led.emissiveIntensity=.025+blink*3.2;
  const spread=a.inside?a.amount:0;
  const lineup=!a.inside&&a.sceneType==='colours',narrow=camera.aspect<1.45;
  const slots=narrow?[[-1.55,1.5],[1.55,1.5],[-1.55,-1.5],[1.55,-1.5]]:[[-4.45,0],[-1.48,0],[1.48,0],[4.45,0]];
  const origin=lineup?slots[0]:[0,0];
  for(const g of [coverGroup,rearGroup]){g.position.x=THREE.MathUtils.lerp(g.position.x,origin[0],speed);g.position.y=THREE.MathUtils.lerp(g.position.y,origin[1],speed);}
  copies.forEach((g,i)=>{const target=lineup?slots[i+1]:[0,0];g.position.x=THREE.MathUtils.lerp(g.position.x,target[0],speed);g.position.y=THREE.MathUtils.lerp(g.position.y,target[1],speed);const k=THREE.MathUtils.lerp(g.scale.x,lineup?1:.001,speed);g.scale.setScalar(k);g.visible=k>.01;g.traverse(o=>{if(o.userData.led)o.material.emissiveIntensity=led.emissiveIntensity})});
  for(const [kind,g] of Object.entries(accessories)){const active=!a.inside&&kind===a.sceneType;const k=THREE.MathUtils.lerp(g.scale.x,active?1:.001,speed);g.scale.setScalar(k);g.visible=k>.01;}
  const charging=a.sceneType==='charging';
  portPlug.visible=!a.inside;portPlug.position.y=THREE.MathUtils.lerp(portPlug.position.y,charging||a.part==='port'?-1.64:-1.350,speed);
  portPlug.position.x=THREE.MathUtils.lerp(portPlug.position.x,charging||a.part==='port'?-.40:.32,speed);
  cable.visible=charging;const connected=reduced||now-(a.chargeStart||now)>1000;cable.position.set(.32,THREE.MathUtils.lerp(cable.position.y||-2.5,charging&&connected?-1.11:-2.5,speed),-.01);
  port.visible=tongue.visible=!a.inside;
  coverGroup.position.z=THREE.MathUtils.lerp(coverGroup.position.z,spread*2.2,speed);
  batteryGroup.position.z=THREE.MathUtils.lerp(batteryGroup.position.z,spread*.74,speed);
  boardGroup.position.z=THREE.MathUtils.lerp(boardGroup.position.z,-spread*.52,speed);
  rearGroup.position.z=THREE.MathUtils.lerp(rearGroup.position.z,-spread*2.2,speed);
  boardGroup.visible=batteryGroup.visible=disc.visible=centre.visible=a.inside&&spread>.025;
  // Fit the product to narrow mobile canvases as well as wide desktop stages.
  batteryGroup.position.y=THREE.MathUtils.lerp(batteryGroup.position.y,spread*.55,speed);
  const attached=['keys','bag','luggage'].includes(a.sceneType)&&!a.inside;
  const fit=Math.min(1,camera.aspect/(a.inside?1.35:lineup&&!narrow?2.8:1));let scale=(a.inside?1.12:lineup?(narrow?.76:1.05):attached?(a.sceneType==='keys'?1.05:.60):a.scale)*fit;
  let center=new THREE.Vector3();
  if(attached){const bounds=accessories[a.sceneType].userData.bounds;scale=Math.min(4.1/bounds.size.y,4.1*camera.aspect/bounds.size.x);center=bounds.center;}
  if(focus){const targets={body:[0,0,0,1.75],loop:[-.87,.89,0,3.4],button:[-.72,-.72,.27,3.5],port:[.15,-1.34,0,3.5]};const [x,y,z,k]=targets[focus];center.set(x,y,z);scale=k*Math.min(1,camera.aspect);}
  if(a.sceneType==='charging'){center.set(.1,-.9,0);scale=1.04*Math.min(1,camera.aspect/1.05);}
  if(detail){scale=Math.min(3.5,3.5*camera.aspect);center.set(.32,-1.20,0);}
  body.scale.setScalar(THREE.MathUtils.lerp(body.scale.x,scale,speed));
  body.position.lerp(center.clone().multiplyScalar(-scale),speed);
  controls.update(dt);renderer.render(scene,detail?detailCamera:camera);
 };animate();
 }catch(e){setFailed(true)}
 return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(api.current){api.current.body.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose()}})}environment?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.domElement.remove();api.current=null;};
 },[]);
 useEffect(()=>{if(!api.current)return;const a=api.current,p=poses[slide%poses.length];a.sceneType=sceneType;a.part=part;a.chargeStart=performance.now();a.controls.reset();
 a.target=inside?[.3,-.92,-.14]:front?[0,0,0]:part==='port'?[-.9,-.12,0]:part==='loop'?[0,-.12,0]:part==='button'?[0,.05,0]:p.rotation;
 a.position=inside||front||part?[0,0,0]:p.position;a.scale=1.55;
 if(!inside){
 if(sceneType==='colours'){a.target=[0,-.10,-.04];a.position=[0,0,0]}
 if(sceneType==='keys'){a.target=[.10,-.15,-.15];a.position=[0,0,0]}
 if(sceneType==='bag'||sceneType==='luggage'){a.target=[.06,-.22,0];a.position=[0,0,0]}
 if(sceneType==='charging'){a.target=[-.28,-.15,0];a.position=[0,0,0]}
 if(sceneType==='covered'){a.target=[0,0,0];a.position=[0,0,0]}
 }
 a.face.emissive.set(part==='body'?0x23330b:0x000000);
 },[sceneType,slide,part,reset,front,inside]);
 useEffect(()=>{if(api.current)api.current.spin=spin;},[spin]);
 useEffect(()=>{if(!api.current)return;const a=api.current;const palettes={Graphite:['#555b70','#25282c','#474d5f'],Pearl:['#d9dce1','#a1a7af','#a5abb6'],Blue:['#4074a4','#23384e','#2d527b'],Green:['#57866b','#283d31','#3b604b']};const [face,frame,button]=palettes[colour]||palettes.Graphite;a.face.color.set(face);a.dark.color.set(frame);a.buttonFace.color.set(button);},[colour]);
 useEffect(()=>{if(!api.current)return;const a=api.current;a.inside=inside;a.amount=separation;for(const m of [a.face,a.boardMaterial,a.batteryMaterial,a.gold,a.dark])m.emissive.set(0x000000);if(inside){const m={cover:a.face,board:a.boardMaterial,battery:a.batteryMaterial,antenna:a.gold,speaker:a.dark}[selected];m?.emissive.set(0x123921);}},[inside,separation,selected]);
 return <div className="model-host" ref={host}>{failed&&<div className="fallback"><img src="/product.png" alt="Official UGREEN FineTrack Duo product photo"/><p>3D unavailable on this device. Product photo shown.</p></div>}</div>;
}
