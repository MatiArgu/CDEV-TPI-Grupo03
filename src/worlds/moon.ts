import * as THREE from 'three';
import { modelCollider, placeModel } from '../rendering/assets';
import { box, mesh, toon } from '../rendering/visual';
import { lunarLander, lunarSky, lunarAstronaut } from '../rendering/lunar';
import { batchStaticMeshes } from '../rendering/staticMeshes';
import { exhibitLabel, exhibitSpot, plinth } from '../museum/exhibition';
import type { GalleryRoom } from '../museum/gallery';
import type { Collider } from '../game/collision';
import { createRouteHelp } from '../game/help';
import { disposeHistoricalScene, type HistoricalWorld } from './history';
import type { Arrival } from './ride';

export function installMoonExhibit(room:GalleryRoom) {
  const root=new THREE.Group();room.root.add(root);root.rotation.y=room.center.x>0?Math.PI:0;
  const colliders:Collider[]=[],photoSolids:THREE.Object3D[]=[];
  const solid=(o:THREE.Object3D)=>{colliders.push(modelCollider(o));photoSolids.push(o);return o;};
  solid(plinth(root,0,-.45,2.1,.95));
  const artifact=lunarLander(root).root;artifact.scale.setScalar(.22);artifact.position.set(0,1.1,-.45);
  exhibitLabel(root,'MÓDULO LUNAR','MAQUETA · DEL MUSEO A LA SUPERFICIE LUNAR',[0,.79,.62],1.88);
  const lights=[exhibitSpot(root,0,-.45,5.17,28,2.1,true,true)];
  for(const side of [-1,1]) {
    const x=side*4.0;
    solid(plinth(root,x,-2.8,1.6,.65));
    solid(side<0?lunarAstronaut(root,[x,.8,-2.8]):placeModel('lunarDish',root,[x,.8,-2.8],{height:1.4,rotation:.5}));
    exhibitLabel(root,side<0?'TRAJE EXTRAVEHICULAR':'COMUNICACIÓN CON LA TIERRA',side<0?'CASCO · MOCHILA · GUANTES':'ANTENA DIRECCIONAL',[x,.62,-1.98],1.45);
    solid(plinth(root,x,3.2,1.55,.65));
    solid(placeModel(side<0?'lunarBoulder':'rocketEngine',root,[x,.8,3.2],{width:1.15,height:side<0?.7:1.05,color:side<0?0x999b9d:undefined}));
    exhibitLabel(root,side<0?'ROCA LUNAR':'MOTOR DE ASCENSO',side<0?'LA HUELLA DE UN VIAJE':'EL CAMINO DE REGRESO',[x,.62,4],1.4);
    lights.push(exhibitSpot(root,x,-2.8,5.17,12,2),exhibitSpot(root,x,3.2,5.17,10,1.8));
  }
  const setLight=room.root.userData.setLight as (value:number)=>void;
  room.root.userData.setLight=(value:number)=>{setLight(value);lights.forEach(light=>light(value));};room.root.userData.setLight(0);
  return {artifact,photoSolids,colliders};
}

function flag(parent:THREE.Object3D) {
  const canvas=document.createElement('canvas');canvas.width=390;canvas.height=240;const c=canvas.getContext('2d')!;
  for(let i=0;i<13;i++){c.fillStyle=i%2?'#e6e2d1':'#b75555';c.fillRect(0,i*240/13,390,240/13+1);}
  c.fillStyle='#3b526f';c.fillRect(0,0,164,129);c.fillStyle='#eee8d6';
  for(let row=0;row<9;row++)for(let col=0;col<(row%2?5:6);col++){const x=14+col*27+(row%2?13:0),y=10+row*13.5;c.beginPath();for(let p=0;p<10;p++){const a=-Math.PI/2+p*Math.PI/5,r=p%2?1.6:4;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const pole=toon(0xc0c4c5);box(.05,2.8,.05,pole,[-4.2,1.4,-9],parent);box(1.7,.045,.045,pole,[-3.37,2.73,-9],parent);
  const cloth=mesh(new THREE.PlaneGeometry(1.65,1.02),new THREE.MeshToonMaterial({map:texture,side:THREE.DoubleSide}),[-3.37,2.21,-9],parent);cloth.receiveShadow=false;
}

export function createMoonWorld():HistoricalWorld {
  const scene=new THREE.Scene();lunarSky(scene);
  scene.add(new THREE.HemisphereLight(0x879bb7,0x4b4c56,.55));
  const sun=new THREE.DirectionalLight(0xfff0ce,2.5);sun.position.set(70,44,-95);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-35,right:35,top:45,bottom:-45,far:230});sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.05;sun.shadow.bias=-.0003;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;scene.add(sun);
  const ground=toon(0x8d919c),rim=toon(0x767c89),dark=toon(0x606772);
  const scenery=new THREE.Group();scene.add(scenery);const colliders:Collider[]=[];
  const floor=mesh(new THREE.PlaneGeometry(300,300,1,1),ground,[0,0,0],scenery);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  for(let i=0;i<28;i++) {
    const side=i%2?-1:1,x=side*(7+(i%5)*3),z=18-Math.floor(i/2)*4.3;
    const rock=placeModel(i%3?'lunarBoulder':'lunarRocks',scenery,[x,0,z],{width:1.1+(i%4)*.65,height:.55+(i%3)*.45,color:i%2?0x818692:0x999da4,rotation:i});
    colliders.push(modelCollider(rock));
  }
  for(const [x,z,r] of [[-10,5,3.7],[9,-5,3.4],[-10,-22,4.1],[9,-33,3.8],[0,-46,7]]) {
    const crater=mesh(new THREE.TorusGeometry(r,.27,5,24),rim,[x,.13,z],scenery);crater.receiveShadow=false;crater.rotation.x=Math.PI/2;crater.scale.z=.5;
    const hollow=mesh(new THREE.CircleGeometry(r,24),dark,[x,.012,z],scenery);hollow.rotation.x=-Math.PI/2;hollow.castShadow=false;
    colliders.push({minX:x-r,maxX:x+r,minZ:z-r,maxZ:z+r});
  }
  // Distant low ridges hide the finite walking boundary without adding a sky dome.
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const hill=mesh(new THREE.IcosahedronGeometry(1,0),rim,[Math.cos(a)*65,-1,Math.sin(a)*65-12],scenery);hill.scale.set(12,3+(i%4),10);hill.receiveShadow=false;}
  colliders.push({minX:-18,maxX:-16,minZ:-38,maxZ:22},{minX:16,maxX:18,minZ:-38,maxZ:22},{minX:-18,maxX:18,minZ:19,maxZ:22},{minX:-18,maxX:18,minZ:-38,maxZ:-36});
  const flagGroup=new THREE.Group();scenery.add(flagGroup);flag(flagGroup);
  const astronaut=lunarAstronaut(scenery,[-4.8,0,-8.75],false,Math.PI/2);
  const partner=lunarAstronaut(scenery,[-2.8,0,-9.5],true,-.8);
  // Freeze the hands on the pole and the supported flag, rather than leaving idle figures beside it.
  const suit=toon(0xd4d9d2),glove=toon(0xc1c8c5);
  const arm=(shoulder:number[],elbow:number[],hand:number[])=>{
    for(const [a,b] of [[shoulder,elbow],[elbow,hand]]) {
      const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);
      const segment=mesh(new THREE.CylinderGeometry(.11,.13,from.distanceTo(to),8),suit,from.clone().add(to).multiplyScalar(.5).toArray() as [number,number,number],scenery);
      segment.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());segment.receiveShadow=false;
    }
    mesh(new THREE.SphereGeometry(.13,8,6),glove,hand as [number,number,number],scenery).receiveShadow=false;
  };
  astronaut.getObjectByName('armLeft')!.visible=false;astronaut.getObjectByName('armRight')!.visible=false;
  partner.getObjectByName('armRight')!.visible=false;
  arm([-4.8,1.35,-8.48],[-4.5,1.16,-8.5],[-4.2,1.08,-9]);
  arm([-4.8,1.35,-9.02],[-4.53,1.48,-9.12],[-4.2,1.52,-9]);
  arm([-2.9,1.35,-9.3],[-2.7,1.48,-9.15],[-2.62,1.72,-9]);
  for(const figure of [astronaut,partner])colliders.push(modelCollider(figure));
  colliders.push({minX:-4.35,maxX:-4.05,minZ:-9.15,maxZ:-8.85});
  const dish=placeModel('lunarDish',scenery,[5.7,0,-15],{height:1.9,rotation:-.7});colliders.push(modelCollider(dish));
  const ship=lunarLander(scene);ship.root.position.z=-29;
  colliders.push({minX:-1.95,maxX:1.95,minZ:-30.8,maxZ:-27.45});
  for(const x of [-2.6,2.6])for(const z of [-30.8,-27.2])colliders.push({minX:x-.55,maxX:x+.55,minZ:z-.55,maxZ:z+.55});
  const tracks=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.009,.28),dark,100),dummy=new THREE.Object3D();
  for(let i=0;i<100;i++){dummy.position.set(i%2?.2:-.2,.01,15-i*.39);dummy.rotation.y=i%2?.12:-.12;dummy.updateMatrix();tracks.setMatrixAt(i,dummy.matrix);}scenery.add(tracks);
  batchStaticMeshes(scenery);
  const guide=createRouteHelp(scene,[12,7,2,-3,-8,-13,-18,-22,-24].map(z=>[0,.025,z]),new THREE.MeshBasicMaterial({color:0xc9d9e8}));
  let state:'outside'|'climbing'|'cabin'|'launching'|'finished'='outside',elapsed=0;
  const start=new THREE.Vector3(),seat=new THREE.Vector3(0,3.25,-29);
  const boarding={
    state:()=>state,seat,
    cabinColliders:[{minX:-2,maxX:-.5,minZ:-31,maxZ:-27},{minX:.5,maxX:2,minZ:-31,maxZ:-27},{minX:-2,maxX:2,minZ:-31,maxZ:-29.5},{minX:-2,maxX:2,minZ:-28.5,maxZ:-27}],
    start(camera:THREE.PerspectiveCamera){state='climbing';elapsed=0;start.copy(camera.position);ship.hatch.position.x=1.3;sun.shadow.needsUpdate=true;},
    launch(){state='launching';elapsed=0;},
    update(delta:number,camera:THREE.PerspectiveCamera):'cabin'|'return'|undefined {
      elapsed+=Math.min(delta,.05);
      if(state==='climbing') {
        const t=Math.min(elapsed/3.2,1),ease=t*t*(3-2*t);
        // First reach the top rung, then step through the open hatch into the cabin.
        const landing=new THREE.Vector3(0,3.65,-27.1);
        if(ease<.68)camera.position.lerpVectors(start,landing,ease/.68);else camera.position.lerpVectors(landing,seat,(ease-.68)/.32);
        camera.rotation.set(-.12*Math.sin(t*Math.PI),0,0);
        if(t===1){state='cabin';ship.hatch.position.x=0;sun.shadow.needsUpdate=true;return 'cabin';}
      } else if(state==='launching') {
        sun.shadow.needsUpdate=true;
        const t=Math.min(elapsed/2.6,1);ship.ascent.position.y=t*t*9;camera.position.copy(seat).add(new THREE.Vector3(0,ship.ascent.position.y,0));camera.rotation.set(.06*Math.sin(t*Math.PI),0,0);
        if(t===1){state='finished';return 'return';}
      } else if(state==='finished') camera.position.copy(seat).add(new THREE.Vector3(0,9,0));
    },
  };
  // Touchdown seen from the cabin, through the open hatch; then time freezes at the first step.
  let descent=0;
  const arrival:Arrival={facing:Math.PI,cut:true,update(delta,camera){
    descent+=delta;
    const t=Math.min(descent/6,1);
    ship.root.position.y=22*(1-t)**3;ship.hatch.position.x=t<1?1.3:0;
    if(delta>0)sun.shadow.needsUpdate=true;
    camera.position.copy(seat).add(new THREE.Vector3(0,ship.root.position.y+(t===1?Math.max(0,.6-(descent-6))*.04*Math.sin(descent*40):0),0));
    return descent>7;
  }};
  return {id:'luna',scene,colliders,spawn:new THREE.Vector2(0,14),arrival,artifact:new THREE.Vector3(0,1.5,-26.1),boarding,helpActive:guide.active,update:guide.update,dispose:()=>disposeHistoricalScene(scene)};
}
