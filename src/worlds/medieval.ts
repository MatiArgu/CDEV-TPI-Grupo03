import * as THREE from 'three';
import { modelCollider, placeModel } from '../rendering/assets';
import { box, mesh, outline, toon } from '../rendering/visual';
import { addSky } from '../rendering/sky';
import { batchStaticMeshes } from '../rendering/staticMeshes';
import { exhibitLabel, exhibitSpot, plinth, stoneFloor } from '../museum/exhibition';
import type { GalleryRoom } from '../museum/gallery';
import type { Collider } from '../game/collision';
import { createRouteHelp } from '../game/help';
import { disposeHistoricalScene, type HistoricalWorld } from './history';
import { horse } from '../rendering/mounts';
import { createRide, type Arrival } from './ride';

function ancientKey(parent: THREE.Object3D, position: [number, number, number]): THREE.Group {
  const artifact = new THREE.Group(); artifact.position.set(...position); parent.add(artifact);
  const key = placeModel('key', artifact, [0, 0, 0], { width: 0.85, color: 0xc6a56a });
  key.rotation.z = -0.3;
  return artifact;
}

function castleModel(parent: THREE.Object3D): THREE.Group {
  const castle = new THREE.Group(); parent.add(castle);
  for (const side of [-1, 1]) {
    placeModel('castleTower', castle, [side * 1.15, 0, -0.25], { width: 0.85, height: 1.6, color: 0xbfc1ad });
    placeModel('castleRoof', castle, [side * 1.15, 1.6, -0.25], { width: 1.03, height: 0.72, color: 0x667f83 });
    placeModel('castleWall', castle, [side * 0.78, 0, 0.7], { width: 0.7, height: 0.85, color: 0xbfc1ad });
  }
  placeModel('castleGate', castle, [0, 0, 0.7], { width: 0.2, depth: 0.95, height: 1.25, rotation: Math.PI / 2 });
  placeModel('castleWall', castle, [0, 0, -0.52], { width: 1.65, height: 1.15, color: 0xbfc1ad });
  return castle;
}

export function installMedievalExhibit(room: GalleryRoom) {
  const root = room.root;
  const colliders: Collider[] = []; const photoSolids: THREE.Object3D[] = [];
  const solid = (object: THREE.Object3D) => { photoSolids.push(object); colliders.push(modelCollider(object)); return object; };
  const wood = toon(0x66513f); const gold = toon(0xab9063); const cloth = toon(0x687d72);
  solid(plinth(root, 0, -0.45, 1.4, 1.05));
  const artifact = ancientKey(root, [0, 1.73, -0.45]);
  const stand = box(0.045, 0.55, 0.045, gold, [0, 1.4, -0.57], root); photoSolids.push(stand);
  exhibitLabel(root, 'LA LLAVE DE LA FORTALEZA', 'HIERRO Y LATÓN · MEMORIA DE UN CASTILLO', [0, 0.83, 0.265], 1.22);
  const lights = [exhibitSpot(root, 0, -0.45, 5.17, 24, 2.3, true, true)];
  // The transverse gallery keeps a broad east–west passage in front of the exhibits.
  const maquetteBase = solid(plinth(root, 6.6, -1.45, 3.35, 0.68));
  const castle = castleModel(root); castle.position.set(6.6, 0.84, -1.45); solid(castle);
  exhibitLabel(root, 'LA FORTALEZA', 'MAQUETA · TORRES, PUERTA Y MURALLA', [6.6, 0.65, 0.25], 2.5);
  maquetteBase.name = 'maqueta-medieval';
  solid(plinth(root, -6.6, -1.45, 2.3, 0.7));
  solid(placeModel('chest', root, [-6.6, 0.87, -1.45], { width: 1.65 }));
  exhibitLabel(root, 'EL COFRE DEL CASTILLO', 'MADERA Y HERRAJES', [-6.6, 0.65, -0.25], 1.9);
  for (const side of [-1, 1]) {
    const x = side * 10.2;
    solid(plinth(root, x, -1.5, 1.25, 0.6));
    solid(placeModel('knight', root, [x, 0.77, -1.5], { height: 1.65, color: 0xb8b5a5 }));
    const rack = box(2.1, 2.75, 0.14, wood, [side * 3.25, 2.2, -4.67], root); photoSolids.push(rack);
    const shield = placeModel('shield', root, [side * 3.25, 1.8, -4.48], { width: 0.88, height: 1.15 }); photoSolids.push(shield);
    const sword = placeModel('medievalSword', root, [side * 4.0, 1.3, -4.35], { height: 1.5 }); photoSolids.push(sword);
    placeModel('castleBanner', root, [side * 9.9, 2.6, -4.65], { height: 2.25, depth: 0.85, rotation: Math.PI / 2, color: 0x788d7c });
    lights.push(exhibitSpot(root, side * 6.6, -1.45, 5.17, 15, 2.6), exhibitSpot(root, x, -1.5, 5.17, 9, 1.8));
  }
  const runner = box(13, 0.012, 1.65, cloth, [0, 0.175, 2.6], root); runner.castShadow = false;
  for (const z of [1.8, 3.4]) box(13, 0.015, 0.035, gold, [0, 0.185, z], root).castShadow = false;
  const setLight = root.userData.setLight as (strength: number) => void;
  root.userData.setLight = (strength: number) => { setLight(strength); lights.forEach((light) => light(strength)); };
  root.userData.setLight(0);
  return { artifact, photoSolids, colliders };
}

export function createMedievalWorld(): HistoricalWorld {
  const scene = new THREE.Scene(); addSky(scene);
  scene.fog = new THREE.Fog(0xd9e8dd, 48, 100);
  scene.add(new THREE.HemisphereLight(0xffefd7, 0x768c83, 1.25));
  const sun = new THREE.DirectionalLight(0xffdfb3, 1.5); sun.position.set(-15, 25, 14); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -25; sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 32; sun.shadow.camera.bottom = -32; sun.shadow.normalBias = 0.08; sun.shadow.bias = -0.0005;
  sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true; scene.add(sun);
  const colliders: Collider[] = [];
  const stone = toon(0xb6af93); const trim = toon(0x777d70); const wood = toon(0x846851);
  const ground = mesh(new THREE.PlaneGeometry(180, 180), toon(0xaabb91), [0, -0.03, -10], scene); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  stoneFloor(scene, 21.8, 38, 0, -6, 0.14);
  // Flat walkable court; high walls and a closed arrival gate contain the frozen moment.
  colliders.push({ minX: -11.6, maxX: -10.7, minZ: -25, maxZ: 13.6 }, { minX: 10.7, maxX: 11.6, minZ: -25, maxZ: 13.6 },
    { minX: -11.6, maxX: 11.6, minZ: -25.6, maxZ: -24.7 }, { minX: -11.6, maxX: 11.6, minZ: 12.7, maxZ: 13.6 });
  const architecture = new THREE.Group(); scene.add(architecture);
  for (const side of [-1, 1]) {
    for (const z of [9, 3, -3, -9, -15, -21]) placeModel('castleWall', architecture, [side * 11.2, 0.13, z], { width: 6, height: 5.5, depth: 1.15, rotation: side * Math.PI / 2, color: 0xb8bca5 });
    for (const z of [11, -21]) {
      const tower = placeModel('castleTower', architecture, [side * 9.6, 0.13, z], { width: 3.1, height: 8, depth: 3.1, color: 0xc7c8b4 });
      colliders.push(modelCollider(tower));
      placeModel('castleRoof', architecture, [side * 9.6, 8.13, z], { width: 3.65, height: 2.6, color: 0x667f83 });
    }
    for (const z of [13.1, -25.1]) placeModel('castleWall', architecture, [side * 7.2, 0.13, z], { width: 8.4, height: 5.5, depth: 1, color: 0xb8bca5 });
    placeModel('castleBanner', architecture, [side * 4.1, 3, -24.5], { height: 2.8, depth: 1.2, rotation: Math.PI / 2, color: 0x708779 });
    for (const z of [7, -9]) {
      const planter = box(2.1, 0.35, 2.1, trim, [side * 8.1, 0.29, z], scene); colliders.push(modelCollider(planter));
      placeModel('cypress', architecture, [side * 8.1, 0.47, z], { height: 3.6 });
    }
  }
  for (const z of [13.2, -25.2]) {
    if (z > 0) continue;
    placeModel('castleGate', architecture, [0, 0.13, z], { width: 1.25, height: 6.8, depth: 6, rotation: Math.PI / 2 });
    box(3.8, 4.2, 0.15, wood, [0, 2.15, z + 0.1], architecture);
  }
  // Arrival gatehouse: an open arch whose portcullis rises into the masonry for the rider.
  const gatehouse = toon(0xb8bca5);
  for (const side of [-1, 1]) box(1.1, 8, 1.4, gatehouse, [side * 2.45, 4.13, 13.2], architecture);
  box(6, 3.6, 1.4, gatehouse, [0, 6.33, 13.2], architecture);
  const arrivalDoor = box(3.8, 4.4, 0.15, wood, [0, 2.33, 13.2], scene); arrivalDoor.receiveShadow = false;
  for (let x = -1.5; x <= 1.5; x += 0.75) box(0.08, 4.4, 0.2, trim, [x, 0, 0], arrivalDoor);
  box(3.6, 0.04, 36, toon(0x9c8a6a), [0, 0, 31.6], scene).castShadow = false;
  // Keep wall shading clean on the large, stretched low-poly faces. They still cast onto the court.
  architecture.traverse((object) => { if (object instanceof THREE.Mesh) object.receiveShadow = false; });
  batchStaticMeshes(architecture);
  const prop = (object: THREE.Object3D) => { colliders.push(modelCollider(object)); return object; };
  prop(placeModel('catapult', scene, [-6.1, 0.17, -3], { width: 3.8, rotation: 0.3 }));
  prop(placeModel('chest', scene, [6.5, 0.17, -11], { width: 1.7, rotation: -0.3 }));
  prop(placeModel('medievalTable', scene, [6.1, 0.17, -1], { width: 2.8, height: 1 }));
  placeModel('shield', scene, [6.1, 1.2, -1], { width: 0.8, rotation: 0.3 }).rotation.x = -Math.PI / 2;
  for (const [x,z] of [[-4.2,-6],[4.8,-5],[-3.3,-21],[3.3,-21]]) prop(placeModel('knight', scene, [x, 0.17, z], { height: 1.85, rotation: x < 0 ? 0.4 : -0.4 }));
  for (const [x,z] of [[-7.7,-13],[7.8,4]]) {
    prop(placeModel('barrel', scene, [x, 0.17, z], { height: 0.95 }));
    prop(placeModel('crate', scene, [x + 0.9, 0.17, z - 1.1], { width: 0.85 }));
  }
  const table = box(2.1, 1.02, 1.6, stone, [0, 0.68, -20], scene); prop(table); outline(table, 0.3);
  box(2.3, 0.13, 1.8, trim, [0, 1.24, -20], scene);
  const artifact = ancientKey(scene, [0, 1.8, -20]);
  box(0.045, 0.5, 0.045, trim, [0, 1.55, -20.12], scene);
  const guide = createRouteHelp(scene, [9, 5, 1, -3, -7, -11, -15, -17.5].map((z) => [0, 0.17, z]), new THREE.MeshBasicMaterial({ color: 0xf4dbaa }));
  const spawn = new THREE.Vector2(0, 10.5);
  const mount = horse(scene);
  colliders.push({ minX: -2.1, maxX: -1.1, minZ: 10.4, maxZ: 12.8 });
  const ride = createRide({ vehicle: mount.root, path: [[0, 0, 40], [0, 0, 24], [0, 0.05, 14.5], [-1.6, 0.14, 11.6]], seat: mount.seat, duration: 7, spawn, gait: mount.gait, onMove: () => { sun.shadow.needsUpdate = true; } });
  let elapsed = 0;
  const arrival: Arrival = {
    facing: ride.facing,
    update(delta, camera) {
      elapsed += delta;
      // The gate rises as the rider approaches and drops again once inside.
      arrivalDoor.position.y = 2.33 + 3.4 * THREE.MathUtils.smoothstep(elapsed, 2.5, 4) * (1 - THREE.MathUtils.smoothstep(elapsed, 7.2, 8.2));
      return ride.update(delta, camera) && elapsed > 8.2;
    },
  };
  return { id: 'medieval', scene, colliders, spawn, arrival, artifact: artifact.position.clone(), helpActive: guide.active, update: guide.update, dispose: () => disposeHistoricalScene(scene) };
}
