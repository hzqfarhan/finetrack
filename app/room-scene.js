import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function buildRoom(scene,setting='home'){
 const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const ivory=mat('#eee8dc'),wood=mat('#bc8f5c'),green=mat('#416c53'),dark=mat('#243c31'),skin=mat('#bc8664'),shirt=mat('#e8ddd0'),pants=mat('#253440'),hair=mat('#29231f'),metal=mat('#b6bfc3',.25,.8);
 const box=(g,w,h,d,x,y,z,m,r=.04)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
 const ball=(g,r,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
 const cyl=(g,top,bottom,h,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,h,32),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
 const room=new THREE.Group();scene.add(room);
 box(room,6.2,.15,4.8,0,-.10,0,wood);for(let i=0;i<15;i++)box(room,6.1,.003,.012,0,-.017,-2.25+i*.32,mat('#9c744f'),.001);
 box(room,6.2,2.8,.12,0,1.35,-2.4,ivory);box(room,.12,2.8,4.8,-3.1,1.35,0,ivory);
 box(room,2.2,1.7,.05,-1.45,1.65,-2.31,mat('#a3d5df',.2));
 for(const x of [-2.58,-1.45,-.32])box(room,.06,1.8,.09,x,1.65,-2.25,shirt);
 for(const y of [.78,1.65,2.52])box(room,2.3,.055,.09,-1.45,y,-2.25,shirt);
 box(room,2.9,.08,1.2,1.15,.18,-1.3,dark);box(room,2.9,.65,.26,1.15,.65,-1.82,green);
 for(const x of [-.05,.8,1.65,2.35])box(room,.7,.22,.96,x,.43,-1.25,green,.10);
 for(const x of [-.35,2.65])box(room,.24,.55,1.18,x,.55,-1.3,green,.08);
 box(room,.5,.45,.18,.20,.82,-1.61,mat('#c9b78d'),.10).rotation.z=.14;
 box(room,.5,.45,.18,1.98,.82,-1.61,mat('#8eaa8a'),.10).rotation.z=-.12;
 box(room,3.7,.018,2.0,.3,.012,.55,mat('#d7c7ad'),.03);
 // Side table and tiny tracker use metre-like scene units.
 const source=new THREE.Vector3(1.85,.79,.20);
 cyl(room,.55,.55,.09,1.85,.71,.20,wood);
 for(const x of [1.5,2.2])for(const z of [-.05,.45])box(room,.065,.67,.065,x,.34,z,dark,.01);
 const keys=new THREE.Group();keys.position.copy(source);room.add(keys);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.014,.0017,8,32),metal);ring.rotation.x=Math.PI/2;keys.add(ring);
 for(let i=0;i<2;i++){const k=box(keys,.009,.003,.042,-.01+i*.012,0,.029,metal,.002);k.rotation.y=i*.6;}
 const tracker=box(keys,.036,.009,.036,.034,.002,.002,mat('#555b70',.4,.2),.007);
 const indicator=new THREE.Mesh(new THREE.RingGeometry(.002,.003,24),new THREE.MeshBasicMaterial({color:'#fff'}));indicator.rotation.x=-Math.PI/2;indicator.position.set(.024,.007,.01);keys.add(indicator);
 // Plant, lamp, framed picture and cabinet make the room recognisable.
 cyl(room,.17,.12,.28,2.65,.14,-2.01,mat('#c3b095'));for(let i=0;i<7;i++){const leaf=ball(room,.15,2.65+Math.sin(i*2.3)*.19,.43+i*.085,-2.01+Math.cos(i*2.3)*.13,green);leaf.scale.set(.6,1.7,.35);leaf.rotation.z=Math.sin(i)*.7}
 cyl(room,.17,.17,.05,-.56,.04,-1.6,metal);cyl(room,.018,.018,1.65,-.56,.84,-1.6,metal);cyl(room,.18,.29,.34,-.56,1.72,-1.6,mat('#edce91'));
 box(room,.9,.7,.035,1.5,1.98,-2.30,wood);box(room,.78,.58,.015,1.5,1.98,-2.27,mat('#aec1ae'));
 box(room,.45,.65,1.35,-2.8,.34,.45,wood);box(room,.03,.7,1.2,-2.55,1.05,.45,mat('#242f34'));
 const person=new THREE.Group();room.add(person);person.position.set(-1.45,0,.82);
 const torso=box(person,.42,.52,.24,0,1.12,0,shirt,.10);
 cyl(person,.067,.07,.12,0,1.44,0,skin);const head=ball(person,.14,0,1.61,0,skin);head.scale.set(.88,1.12,.92);
 const cap=ball(person,.145,0,1.69,-.022,hair);cap.scale.set(.9,.62,.94);
 for(const x of [-.045,.045])ball(person,.012,x,1.62,.12,hair);ball(person,.021,0,1.58,.133,skin);
 const legs=[];for(const x of [-.11,.11]){const leg=new THREE.Group();leg.position.set(x,.90,0);person.add(leg);box(leg,.16,.73,.18,0,-.37,0,pants,.05);box(leg,.18,.11,.30,0,-.84,.06,shirt,.035);legs.push(leg)}
 const arms=[];for(const x of [-.26,.26]){const arm=new THREE.Group();arm.position.set(x,1.31,0);person.add(arm);box(arm,.13,.26,.15,0,-.12,0,shirt,.04);box(arm,.105,.25,.105,0,-.36,0,skin,.04);ball(arm,.065,0,-.50,0,skin);arms.push(arm)}
 arms[1].rotation.x=-.9;const phone=box(arms[1],.085,.16,.015,0,-.52,.02,mat('#1a252b'),.008);box(phone,.07,.13,.003,0,0,.009,mat('#70b390'),.003);
 const waves=[];for(let i=0;i<3;i++){const material=new THREE.MeshBasicMaterial({color:'#00964b',transparent:true,opacity:0,depthWrite:false});const mesh=new THREE.Mesh(new THREE.TorusGeometry(1,.018,8,96),material);mesh.rotation.x=Math.PI/2;mesh.position.copy(source);room.add(mesh);waves.push(mesh)}
 const marker=new THREE.Mesh(new THREE.TorusGeometry(.052,.003,8,48),new THREE.MeshBasicMaterial({color:'#24d978'}));marker.rotation.x=Math.PI/2;marker.position.copy(source);marker.position.y+=.004;room.add(marker);
 // Distinct café and terminal sets retain the same human and finding action.
 if(setting!=='home'){
  keys.visible=false;
  const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const c=signCanvas.getContext('2d');c.fillStyle=setting==='cafe'?'#244e3b':'#1c3349';c.fillRect(0,0,1024,256);c.fillStyle='#fff';c.textAlign='center';c.font='bold 70px Arial';c.fillText(setting==='cafe'?'CAMPUS CAFÉ':'DEPARTURES  →',512,115);c.font='30px Arial';c.fillText(setting==='cafe'?'COFFEE  ·  STUDY  ·  CONNECT':'TERMINAL A  ·  GATES 01–08',512,188);const signMap=new THREE.CanvasTexture(signCanvas);signMap.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.55),new THREE.MeshBasicMaterial({map:signMap}));sign.position.set(.2,2.1,-2.29);room.add(sign);
  if(setting==='cafe'){
   green.color.set('#765344');wood.color.set('#ab8059');ivory.color.set('#e6d4b9');
   for(const x of [-1.4,-.4]){cyl(room,.34,.34,.07,x,.77,-.65,wood);cyl(room,.04,.04,.72,x,.38,-.65,metal);cyl(room,.18,.18,.05,x,.03,-.65,metal);cyl(room,.05,.04,.09,x,.85,-.65,ivory);}
   const bag=new THREE.Group();bag.position.copy(source);room.add(bag);box(bag,.36,.42,.23,0,.20,0,mat('#b67d4c'),.05);box(bag,.25,.17,.03,0,.12,.13,mat('#895c3b'),.03);const handle=new THREE.Mesh(new THREE.TorusGeometry(.08,.018,8,32,Math.PI),dark);handle.position.set(0,.42,0);bag.add(handle);box(bag,.036,.036,.009,.15,.31,.135,mat('#555b70'),.006);
  }else{
   wood.color.set('#adb8bf');green.color.set('#344f67');ivory.color.set('#dce4ea');
   box(room,2.2,.42,.9,-1,.24,-1.25,dark,.12);for(let i=0;i<15;i++)box(room,.10,.025,.85,-1.98+i*.14,.46,-1.25,metal,.01);
   const suitcase=new THREE.Group();suitcase.position.copy(source);room.add(suitcase);box(suitcase,.38,.52,.27,0,.25,0,mat('#396e76'),.045);for(let i=0;i<5;i++)box(suitcase,.018,.41,.025,-.13+i*.065,.25,.145,mat('#254e56'),.008);for(const x of [-.13,.13]){ball(suitcase,.035,x,-.025,.08,dark);box(suitcase,.018,.2,.018,x,.59,0,metal,.005);}box(suitcase,.28,.035,.04,0,.7,0,dark,.01);box(suitcase,.036,.036,.009,.12,.51,.15,mat('#555b70'),.006);
  }
 }
 const start=new THREE.Vector3(-1.45,0,.82),end=new THREE.Vector3(.92,0,.82);let previous=-1,phaseStart=0;
 return {room,source,person,update(phase,time,reduced){if(phase!==previous){phaseStart=time;previous=phase}const elapsed=time-phaseStart;const walk=phase>=2?(phase===3||reduced?1:Math.min(1,elapsed/2.7)):0;const eased=walk*walk*(3-2*walk);person.position.lerpVectors(start,end,eased);person.rotation.y=phase>=2?Math.PI/2:0;
 const moving=phase===2&&walk<1&&!reduced;legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(time*9+i*Math.PI)*.32:0);arms[0].rotation.x=moving?-Math.sin(time*9)*.25:0;torso.rotation.z=phase===3?-.08:0;
 waves.forEach((wave,i)=>{const f=((time-phaseStart)*.55+i/3)%1;wave.visible=phase===1||phase===2;wave.scale.setScalar(reduced?.7+i*.75:.08+f*3.3);wave.material.opacity=reduced?.30:(1-f)*.65});marker.material.color.set(phase===3?'#ffd577':'#24d978');marker.scale.setScalar(phase===3?1.5:1);indicator.visible=reduced||Math.sin(time*5)>0;
 }};
}
