import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function createAccessories(){
 const metal=new THREE.MeshStandardMaterial({color:0xc9ced3,metalness:.85,roughness:.23});
 const fabric=new THREE.MeshStandardMaterial({color:0x395b49,roughness:.95});
 const trim=new THREE.MeshStandardMaterial({color:0x192b24,roughness:.8});
 const shell=new THREE.MeshStandardMaterial({color:0xb9b2a4,metalness:.25,roughness:.45});
 const roots={};
 const box=(g,w,h,d,x,y,z,m,r=.15)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),m);o.position.set(x,y,z);g.add(o);return o};
 const ring=(g,r,t,x,y,z,m=metal)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,12,64),m);o.position.set(x,y,z);g.add(o);return o};
 const tube=(g,points,m,r=.06)=>{const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(new THREE.TubeGeometry(path,40,r,8,false),m);g.add(o);return o};
 for(const kind of ['keys','bag','luggage']){const g=new THREE.Group();g.visible=false;g.scale.setScalar(.001);roots[kind]=g;
 // Ring passes through the tracker's inset attachment opening.
 const link=ring(g,.45,.045,-1.05,1.32,.06);link.rotation.y=.65;
 if(kind==='keys'){
  for(let i=0;i<3;i++){const key=new THREE.Group();key.position.set(-1.46+i*.14,1.39,-.08-i*.09);key.rotation.z=-.45-i*.39;key.scale.setScalar(1.9);g.add(key);
   ring(key,.28,.095,0,-.30,0);box(key,.18,1.25,.09,0,-1.15,0,metal,.025);
   for(let j=0;j<3;j++)box(key,.17,.12,.09,.13,-1.38+j*.23,0,metal,.015);
  }
 }else if(kind==='bag'){
  box(g,3.9,4.2,1.3,-2.05,2.45,-1.0,fabric,.5);
  box(g,2.9,1.4,.32,-2.05,1.3,-.21,trim,.22);
  tube(g,[[-2.75,4.35,-1],[-2.7,5.0,-1],[-1.45,5.0,-1],[-1.4,4.35,-1]],trim,.13);
  tube(g,[[-3.65,3.3,-.32],[-3.25,4.1,-.28],[-.9,4.1,-.28],[-.45,3.3,-.32]],metal,.024);
  tube(g,[[-1.08,1.6,-.3],[-1.02,1.95,-.25],[-.82,1.65,-.25]],trim,.07);
  for(const x of [-3.25,-.85])tube(g,[[x,4.0,-1.65],[x,2.5,-2.0],[x,.8,-1.55]],trim,.18);
 }else{
  box(g,3.8,4.7,1.25,-2.0,2.6,-1.0,shell,.4);
  for(let i=0;i<6;i++)box(g,.07,3.8,.08,-3.45+i*.57,2.65,-.32,metal,.025);
  for(const x of [-2.75,-1.25])box(g,.1,1.2,.14,x,5.2,-1,metal,.035);
  box(g,1.7,.18,.28,-2,5.75,-1,trim,.07);
  tube(g,[[-1.15,1.6,-.28],[-1.08,2.0,-.25],[-.9,1.75,-.25]],trim,.08);
  for(const x of [-3.3,-.7]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.26,24),trim);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.12,-1);g.add(wheel)}
 }
 if(kind!=='keys'){
  const anchor=new THREE.Vector3(-1.05,1.65,-.25),factor=kind==='bag'?6:7;
  for(const o of g.children){if(o===link)continue;o.position.sub(anchor).multiplyScalar(factor).add(anchor);o.scale.multiplyScalar(factor);if(kind==='bag')o.position.z-=1.8;}
  if(kind==='bag')tube(g,[[-1.05,1.8,-1.7],[-1.05,1.8,-.7],[-1.05,1.5,.05]],trim,.07);
 }
 g.scale.setScalar(1);g.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(g);bounds.expandByPoint(new THREE.Vector3(1.4,-1.5,.4));bounds.expandByPoint(new THREE.Vector3(-1.4,1.5,-.4));g.userData.bounds={center:bounds.getCenter(new THREE.Vector3()),size:bounds.getSize(new THREE.Vector3())};g.scale.setScalar(.001);
 }
 return roots;
}
