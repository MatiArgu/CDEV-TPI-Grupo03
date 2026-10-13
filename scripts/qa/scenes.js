import * as THREE from 'three';
import { loadModels } from '../../src/rendering/assets';
import { createMuseumScene } from '../../src/museum/museum';
import { createEgyptWorld } from '../../src/worlds/egypt';
import { createRomeWorld } from '../../src/worlds/rome';
import { createMedievalWorld } from '../../src/worlds/medieval';
import { createJapanWorld } from '../../src/worlds/japan';
import { createMoonWorld } from '../../src/worlds/moon';
import { artifactVisible } from '../../src/game/photo';
import { areaOrder } from '../../src/game/catalog';
import { loadProgress, saveProgress, saveKey } from '../../src/game/progress';
import { materials } from '../../src/rendering/visual';
const assert=(ok,label)=>{if(!ok)throw Error(label);};
const result={photos:[],boundaries:[],roofs:0,resources:[],order:false};
function contained(world,limits) {
  // Flood the reachable floor with a disc the size of the player. A leak reaches limits.
  const size=.25,visited=new Set(),queue=[[world.spawn.x,world.spawn.y]];
  const blocked=(x,z)=>world.colliders.some(c=>{
    const dx=Math.max(c.minX-x,0,x-c.maxX),dz=Math.max(c.minZ-z,0,z-c.maxZ);
    return dx*dx+dz*dz<.28*.28;
  });
  for(let i=0;i<queue.length;i++) {
    const [x,z]=queue[i];
    assert(x>limits[0]&&x<limits[1]&&z>limits[2]&&z<limits[3],`Boundary leak ${world.id||'museum'}: ${x},${z}`);
    for(const [dx,dz]of [[size,0],[-size,0],[0,size],[0,-size]]){
      const nx=x+dx,nz=z+dz,key=nx.toFixed(2)+','+nz.toFixed(2);
      if(visited.has(key)||blocked(nx,nz))continue;
      visited.add(key);queue.push([nx,nz]);
    }
  }
  return queue.length;
}
function roof(scene,x,z) {
  scene.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(x,1.8,z),new THREE.Vector3(0,1,0),0,15);
  const hit=ray.intersectObjects(scene.children,true).find(h=>h.object.isMesh&&h.distance>2);
  assert(hit,`Roof missing ${x},${z}`);result.roofs++;
}
try {
  await loadModels();const museum=createMuseumScene();museum.openEntrance();museum.doors.forEach(museum.openDoor);for(let i=0;i<45;i++)museum.update(.05);museum.scene.updateMatrixWorld(true);
  for(const room of museum.rooms){
    const exhibit=museum.exhibits.get(room.id),artifact=exhibit.artifact;
    const center=new THREE.Box3().setFromObject(artifact).getCenter(new THREE.Vector3());
    const sign=room.center.x>0?-1:1;
    const camera=new THREE.PerspectiveCamera(68,1.6,.1,100);camera.position.set(center.x,center.y,center.z+sign*4.5);camera.lookAt(center);camera.updateMatrixWorld();
    const frame={left:-.7,right:.7,top:.7,bottom:-.7};
    const visible=(solids=exhibit.photoSolids,f=frame)=>artifactVisible(camera,artifact,solids,f);
    assert(visible(),room.id+' centered');artifact.visible=false;assert(!visible(),room.id+' hidden artifact');artifact.visible=true;
    const bounds=new THREE.Box3().setFromObject(artifact),xs=[];
    for(const x of[bounds.min.x,bounds.max.x])for(const z of[bounds.min.z,bounds.max.z])xs.push(new THREE.Vector3(x,center.y,z).project(camera).x);
    assert(visible(exhibit.photoSolids,{...frame,left:Math.max(...xs)-(Math.max(...xs)-Math.min(...xs))*.25}),room.id+' edge');
    const cover=new THREE.Mesh(new THREE.BoxGeometry(4,4,.1),new THREE.MeshBasicMaterial());cover.position.copy(camera.position).lerp(center,.65);museum.scene.add(cover);cover.updateMatrixWorld();const solids=[...exhibit.photoSolids,cover];
    assert(!visible(solids),room.id+' occlusion');cover.visible=false;assert(visible(solids),room.id+' invisible occluder');cover.visible=true;cover.scale.x=.03;cover.updateMatrixWorld();assert(visible(solids),room.id+' partial');
    camera.lookAt(center.x+20,center.y,camera.position.z);assert(!visible(),room.id+' outside');cover.removeFromParent();cover.geometry.dispose();cover.material.dispose();result.photos.push(room.id);
    roof(museum.scene,room.center.x+1.8,room.center.y);
  }
  for(const z of[-9,-17])for(const x of[-7,0,7])roof(museum.scene,x,z);
  result.boundaries.push({id:'museum',reachable:contained(museum,[-18,18,-66,30])});
  let paletteDisposed=0;Object.values(materials).forEach(m=>m.addEventListener('dispose',()=>paletteDisposed++));
  for(const [factory,limits] of [[createEgyptWorld,[-12,12,-30,16]],[createRomeWorld,[-3,3,-22,11]],[createMedievalWorld,[-12,12,-26,14]],[createJapanWorld,[-17,17,-48,21]],[createMoonWorld,[-18,18,-39,23]]]){
    const world=factory();result.boundaries.push({id:world.id,reachable:contained(world,limits)});
    if(world.id==='egipto')for(const x of[-2,0,2])roof(world.scene,x,-18);
    if(world.id==='japon')for(const x of[-2,0,2])roof(world.scene,x,-40);
    world.update(19.99);assert(!world.helpActive(),world.id+' early help');world.update(.02);assert(world.helpActive(),world.id+' late help');
    let owned=0,shared=0;const resources=new Set();
    world.scene.traverse(o=>{if(!o.geometry)return;const ownedGeometry=!o.userData.sharedAsset;if(!resources.has(o.geometry)){resources.add(o.geometry);o.geometry.addEventListener('dispose',()=>ownedGeometry?owned++:shared++);}});
    world.dispose();factory().dispose();assert(owned>0&&shared===0,world.id+' disposal');result.resources.push({id:world.id,owned,shared});
  }
  assert(paletteDisposed===0,'museum palette disposed by a journey');
  const original=localStorage.getItem(saveKey),order=[...areaOrder];
  try{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=16;const photo=canvas.toDataURL('image/jpeg');saveProgress({version:1,hasPamphlet:true,photos:Object.fromEntries(order.map(id=>[id,photo]))});
    [areaOrder[0],areaOrder[4]]=[areaOrder[4],areaOrder[0]];const moved=createMuseumScene();assert(moved.rooms.find(r=>r.id==='egipto').number===5,'reordered Egypt');assert(moved.rooms.find(r=>r.id==='luna').number===1,'reordered Moon');
    const saved=await loadProgress();assert(order.every(id=>saved.photos[id]===photo),'stable saved IDs');result.order=true;
  }finally{areaOrder.splice(0,5,...order);if(original===null)localStorage.removeItem(saveKey);else localStorage.setItem(saveKey,original);}
  result.status='PASS';
}catch(error){result.status='FAIL';result.error=String(error);}
window.__checks=result;document.querySelector('#result').textContent=JSON.stringify(result,null,2);
