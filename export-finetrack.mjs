import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {writeFile} from 'node:fs/promises';
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}};
const scene=new THREE.Scene();
function rounded(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
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

body.name='FineTrack Duo';coverGroup.name='Front casing';rearGroup.name='Rear casing';
body.remove(boardGroup,batteryGroup);
const logo=new THREE.Mesh(new THREE.PlaneGeometry(.89,.2225),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.02,depthWrite:false}));
logo.material.name='UGREEN logo';logo.name='UGREEN logo';logo.position.set(.43,.79,.267);coverGroup.add(logo);
scene.updateMatrixWorld(true);
const data=await new GLTFExporter().parseAsync(body,{binary:true});
await writeFile('output/models/FineTrack-Duo.glb',Buffer.from(data));
console.log('Exported FineTrack Duo exterior geometry');
