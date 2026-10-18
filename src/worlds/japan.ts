import * as THREE from 'three';
import { modelCollider, placeModel } from '../rendering/assets';
import { box, mesh, toon } from '../rendering/visual';
import { japaneseMaterials, oniMask, katana, torii, japaneseRoof, stoneLantern, cherryTree } from '../rendering/japanese';
import { batchStaticMeshes } from '../rendering/staticMeshes';
import { addSky } from '../rendering/sky';
import { exhibitLabel, exhibitSpot, plinth } from '../museum/exhibition';
import type { GalleryRoom } from '../museum/gallery';
import type { Collider } from '../game/collision';
import { createRouteHelp } from '../game/help';
import { disposeHistoricalScene, type HistoricalWorld } from './history';
import { rowboat } from '../rendering/mounts';
import { createRide } from './ride';

export function installJapanExhibit(room: GalleryRoom) {
  const root=new THREE.Group();room.root.add(root);
  // The right wing is entered from the north. The display faces that approach.
  root.rotation.y=room.center.x>0?Math.PI:0;
  const m=japaneseMaterials(),colliders:Collider[]=[],photoSolids:THREE.Object3D[]=[];
  const solid=(o:THREE.Object3D)=>{photoSolids.push(o);colliders.push(modelCollider(o));return o;};
  solid(plinth(root,0,-.45,1.6,1.15));
  const artifact=oniMask(root,[0,1.98,-.45],m);
  photoSolids.push(box(.06,.6,.06,m.gold,[0,1.5,-.58],root));
  exhibitLabel(root,'MÁSCARA ONI ROJA','LACA Y COLMILLOS · EL GUARDIÁN DEL JARDÍN',[0,.94,.37],1.43);
  const lights=[exhibitSpot(root,0,-.45,5.17,26,2.2,true,true)];
  // Two blades sit on an open wooden rack, well away from the circulation axis.
  solid(plinth(root,-3.75,-1.8,2.25,.7));
  for(const x of [-4.4,-3.1]) {box(.12,1.4,.17,m.wood,[x,1.45,-1.8],root);box(.45,.09,.5,m.wood,[x,.91,-1.8],root);}
  for(const [y,size] of [[1.25,1.85],[1.85,2.15]]) {const blade=katana(root,m,size);blade.position.set(-3.75,y,-1.75);photoSolids.push(blade);}
  exhibitLabel(root,'KATANA Y WAKIZASHI','ACERO · EMPUÑADURAS TRENZADAS',[-3.75,.68,-.62],1.9);
  solid(plinth(root,3.8,-1.8,1.6,.7));
  const lantern=stoneLantern(root,m,3.8,-1.8);lantern.position.y=.87;lantern.scale.setScalar(.8);solid(lantern);
  exhibitLabel(root,'LINTERNA DE PIEDRA','LA LUZ DEL CAMINO',[3.8,.67,-.96],1.35);
  // A miniature torii and a tea service anchor the two entry bays.
  solid(plinth(root,-3.8,3.3,1.8,.65));const gate=torii(root,m);gate.scale.setScalar(.26);gate.position.set(-3.8,.8,3.3);solid(gate);
  exhibitLabel(root,'TORII','UMBRAL DEL JARDÍN',[-3.8,.63,4.22],1.55);
  solid(plinth(root,3.8,3.3,1.8,.65));
  const pot=mesh(new THREE.SphereGeometry(.27,10,7),m.green,[3.8,1.03,3.3],root);pot.scale.y=.7;photoSolids.push(pot);
  mesh(new THREE.CylinderGeometry(.17,.2,.07,10),m.wood,[3.8,1.23,3.3],root);
  mesh(new THREE.SphereGeometry(.045,6,4),m.gold,[3.8,1.3,3.3],root);
  const spout=mesh(new THREE.ConeGeometry(.085,.3,7),m.green,[4.09,1.08,3.3],root);spout.rotation.z=-1;
  const handle=mesh(new THREE.TorusGeometry(.17,.035,5,12),m.wood,[3.5,1.07,3.3],root);handle.rotation.y=Math.PI/2;
  for(const x of [3.35,4.25])mesh(new THREE.CylinderGeometry(.11,.08,.13,10),m.ivory,[x,.89,3.7],root);
  exhibitLabel(root,'CEREMONIA DEL TÉ','CERÁMICA Y MADERA',[3.8,.63,4.22],1.55);
  for(const side of [-1,1]) {
    lights.push(exhibitSpot(root,side*3.8,-1.8,5.17,13,2),exhibitSpot(root,side*3.8,3.3,5.17,10,1.8));
    // Lightweight shoji panels add warm wood and paper without narrowing the room.
    for(const z of [-4.8,.4,5.3]) {
      box(.12,2.6,1.9,m.paper,[side*(room.width/2-.28),2.55,z],root);
      for(const dz of [-.95,0,.95])box(.16,2.7,.055,m.wood,[side*(room.width/2-.36),2.55,z+dz],root);
      for(const y of [1.2,1.9,2.6,3.3,3.9])box(.16,.055,2,m.wood,[side*(room.width/2-.36),y,z],root);
    }
  }
  const setLight=room.root.userData.setLight as (strength:number)=>void;
  room.root.userData.setLight=(strength:number)=>{setLight(strength);lights.forEach(light=>light(strength));};room.root.userData.setLight(0);
  return {artifact,photoSolids,colliders};
}

export function createJapanWorld():HistoricalWorld {
  const scene=new THREE.Scene();addSky(scene);scene.fog=new THREE.Fog(0xdce6d8,55,115);
  scene.add(new THREE.HemisphereLight(0xffefd9,0x688465,1.5));
  const sun=new THREE.DirectionalLight(0xffe6c4,1.65);sun.position.set(-18,28,15);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-26,right:26,top:50,bottom:-50});sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.045;sun.shadow.bias=-.0003;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;scene.add(sun);
  const m=japaneseMaterials(),colliders:Collider[]=[];
  const scenery=new THREE.Group();scene.add(scenery);
  const solid=(o:THREE.Object3D)=>{colliders.push(modelCollider(o));return o;};
  // Same flat walking height as the other worlds; the footbridge crosses a recessed stream.
  const grass=toon(0x86a773),path=toon(0xadb1a1),water=new THREE.MeshToonMaterial({color:0x76b8b2});
  for(const [z,depth] of [[11,14],[-23,42]])box(48,.3,depth,grass,[0,-.04,z],scenery).receiveShadow=true;
  mesh(new THREE.PlaneGeometry(160,180),grass,[0,-.55,-15],scenery).rotation.x=-Math.PI/2;
  const stream=mesh(new THREE.PlaneGeometry(47,6),water,[0,-.16,1],scenery);stream.rotation.x=-Math.PI/2;stream.castShadow=false;
  for(const side of [-1,1]) {
    // Pond banks prevent bypassing the bridge; bamboo and rocks conceal the garden boundary.
    colliders.push({minX:side<0?-24:1.5,maxX:side<0?-1.5:24,minZ:-2.3,maxZ:4.3});
    colliders.push({minX:side<0?-24:16,maxX:side<0?-16:24,minZ:-47,maxZ:20});
    for(let i=0;i<11;i++) {
      const z=16-i*5.6,x=side*(8.3+(i%3)*2.1);
      cherryTree(scenery,m,x,z,.95+(i%3)*.18);
      if(i%2===0)placeModel('cypress',scenery,[side*15,.12,z-2],{height:5.8+(i%3),width:3.5});
      colliders.push({minX:x-.45,maxX:x+.45,minZ:z-.45,maxZ:z+.45});
      placeModel('bamboo',scenery,[side*(14+(i%2)),.12,z-1],{height:3.3+(i%3)*.45,rotation:i});
      placeModel('bush',scenery,[side*(5.7+(i%3)*1.3),.12,z+1],{height:1+(i%2)*.25,color:0x638867});
      placeModel('rock',scenery,[side*(3.6+(i%4)),.12,z-1.6],{width:.8+(i%3)*.25,rotation:i*.7,color:0x899184});
    }
    for(const z of [13,-9,-23,-34])solid(stoneLantern(scenery,m,side*3.4,z));
    for(const z of [4.2,-2.2])for(let x=2.5;x<19;x+=2)placeModel('rock',scenery,[side*x,-.04,z],{width:1.7,height:.45,rotation:x,color:0x899184});
  }
  colliders.push({minX:-24,maxX:24,minZ:18.5,maxZ:22},{minX:-24,maxX:24,minZ:-47,maxZ:-44.8});
  // Irregular flat stones make a continuous, legible route through the center of every torii.
  for(let z=17;z>-39;z-=1.32) {
    if(z<4.2&&z>-2.2)continue;
    const slab=mesh(new THREE.CylinderGeometry(1,1,.1,6),path,[Math.sin(z)*.09,.13,z],scenery);slab.scale.set(1.55,1,.83);slab.rotation.y=(Math.floor(z)%3)*.09;
  }
  for(const z of [11,-6.5,-15.5,-24.5,-33]) {
    const gate=torii(scenery,m);gate.position.z=z;
    for(const x of [-2.1,2.1])colliders.push({minX:x-.25,maxX:x+.25,minZ:z-.25,maxZ:z+.25});
  }
  // Red rails arch over the water; the plank deck remains level for first-person movement.
  for(let z=-2.25;z<=4.25;z+=.3)box(2.85,.16,.275,m.wood,[0,.08,z],scenery);
  for(const side of [-1,1]) {
    colliders.push({minX:side<0?-1.7:1.38,maxX:side<0?-1.38:1.7,minZ:-2.45,maxZ:4.45});
    for(let i=0;i<=10;i++){
      const z=-2.4+i*.68,y=.82+Math.sin(i/10*Math.PI)*.4;
      if(i%2===0)box(.14,y,.14,m.red,[side*1.5,y/2,z],scenery);
      if(i<10){const next=.82+Math.sin((i+1)/10*Math.PI)*.4;const rail=box(.15,.12,.72,m.red,[side*1.5,(y+next)/2,z+.34],scenery);rail.rotation.x=-Math.atan2(next-y,.68);}
    }
  }
  // Open veranda and central altar, framed by shoji screens and two closed curved roofs.
  const temple=new THREE.Group();temple.position.z=-41;scenery.add(temple);
  box(12,.2,8,m.stone,[0,.02,0],temple);box(11.4,.05,7.4,m.wood,[0,.145,0],temple);
  for(const x of [-5,-2.8,2.8,5])for(const z of [-3.3,2.7])solid(box(.24,3.75,.24,m.red,[x,2,z],temple));
  solid(box(10.4,3.5,.18,m.paper,[0,1.95,-3.45],temple));
  for(const side of [-1,1]){
    solid(box(.2,3.5,6.8,m.paper,[side*5.1,1.95,0],temple));
    for(let z=-3;z<=3;z+=.75)box(.24,3.5,.06,m.wood,[side*4.97,1.95,z],temple);
    for(const y of [.35,1.4,2.45,3.5])box(.24,.055,6.9,m.wood,[side*4.97,y,0],temple);
  }
  for(let x=-4.5;x<=4.5;x+=.75)box(.065,3.5,.2,m.wood,[x,1.95,-3.3],temple);
  box(10.6,.22,.28,m.red,[0,3.65,2.7],temple);
  japaneseRoof(temple,m,13.6,9.3,2.4,3.95);
  box(6.7,.65,3.4,m.paper,[0,5.8,0],temple);japaneseRoof(temple,m,8.8,5.7,1.45,6.1);
  const altar=box(1.85,.9,1.3,m.wood,[0,.6,-1],temple);solid(altar);box(2.05,.12,1.5,m.gold,[0,1.11,-1],temple);
  const artifact=oniMask(scene,[0,1.95,-42],m);box(.06,.65,.06,m.gold,[0,1.48,-42.13],scene);
  const halo=new THREE.PointLight(0xffd7ad,4,5,2);halo.position.set(0,3,-40);scene.add(halo);
  // A few still petals and ripples reinforce the frozen moment without animation or audio loops.
  const petals=new THREE.InstancedMesh(new THREE.CircleGeometry(.07,5),m.blush,160);const dummy=new THREE.Object3D();
  for(let i=0;i<160;i++){dummy.position.set(Math.sin(i*13.7)*11,.19,16-(i*3.17)%56);dummy.rotation.set(-Math.PI/2,0,i);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}scenery.add(petals);
  for(const side of [-1,1])for(const z of [0,1.4]){const ripple=mesh(new THREE.TorusGeometry(.7,.014,3,20),m.paper,[side*5.5,-.145,z],scenery);ripple.rotation.x=-Math.PI/2;ripple.castShadow=false;}
  batchStaticMeshes(scenery);
  const guide=createRouteHelp(scene,[0,-4,-9,-14,-19,-24,-29,-34,-38].map(z=>[0,.2,z]),new THREE.MeshBasicMaterial({color:0xf4dfb8}));
  // A lantern boat drifts down the stream and stops beside the bridge.
  const spawn=new THREE.Vector2(0,1);
  const boat=rowboat(scene,0x9b6a45);box(.05,.9,.05,m.wood,[.5,.95,1.3],boat.root);mesh(new THREE.IcosahedronGeometry(.17,1),new THREE.MeshBasicMaterial({color:0xffd9a0}),[.5,1.45,1.3],boat.root);
  const arrival=createRide({vehicle:boat.root,path:[[-21,-.2,1.2],[-12,-.2,.6],[-3.4,-.2,1]],seat:boat.seat,duration:6.5,spawn,gait:boat.gait,bob:.03,onMove:()=>{sun.shadow.needsUpdate=true;}});
  return {id:'japon',scene,colliders,spawn,arrival,artifact:artifact.position.clone(),helpActive:guide.active,update:guide.update,dispose:()=>disposeHistoricalScene(scene)};
}
