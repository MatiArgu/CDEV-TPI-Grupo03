import * as THREE from 'three';
import { batchStaticMeshes } from '../rendering/staticMeshes';
import { modelCollider, placeModel } from '../rendering/assets';
import type { AreaId } from '../game/catalog';
import { courtyardPaving, createCourtyardArrival } from './courtyard';
import { createGallery, type GalleryDoor, type GalleryRoom } from './gallery';
import { createGuard } from './guard';
import { createHall } from './hall';
import { galleryLayout, museumLayout } from './museumLayout';
import { installMoonExhibit } from '../worlds/moon';
import { installJapanExhibit } from '../worlds/japan';
import { installMedievalExhibit } from '../worlds/medieval';
import { installEgyptExhibit } from '../worlds/egypt';
import { addSky } from '../rendering/sky';
import { installRomeExhibit } from '../worlds/rome';
import type { Collider } from '../game/collision';
import { box, hippedRoof, materials as mat, mesh, outline, palette, silhouette, toon } from '../rendering/visual';

export type MuseumWorld = {
  scene: THREE.Scene;
  spawn: THREE.Vector2;
  colliders: Collider[];
  guard: THREE.Vector3;
  rooms: GalleryRoom[];
  doors: GalleryDoor[];
  exhibits: Map<AreaId, { artifact: THREE.Object3D; photoSolids: THREE.Object3D[] }>;
  roomAt: (position: THREE.Vector2) => GalleryRoom | null;
  openEntrance: () => void;
  openDoor: (door: GalleryDoor) => void;
  update: (delta: number, visitor?: THREE.Camera) => void;
};

function sign(parent: THREE.Object3D, label: string, position: [number, number, number], width: number, dark = false): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 164;
  const context = canvas.getContext('2d')!;
  context.fillStyle = dark ? '#252d29' : '#f0f2e5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#b59b70';
  context.lineWidth = 2;
  context.strokeRect(9, 9, 750, 146);
  context.strokeRect(15, 15, 738, 134);
  context.fillStyle = dark ? '#d9cba9' : '#354044';
  context.font = '42px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 384, 84);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const panel = mesh(new THREE.PlaneGeometry(width, width * 164 / 768), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }), position, parent);
  panel.castShadow = false;
  return panel;
}

function courtyardDetails(scene: THREE.Object3D, colliders: Collider[]): void {
  const grass = toon(0x9fbd91);
  const bronze = toon(0x567573);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffedbf });
  for (const side of [-1, 1]) {
    // Garden islands sit between the house entrances, leaving a broad perimeter walk.
    for (const [index, z] of [4.35, 20.75].entries()) {
      const x = side * 11.1;
      const planter = box(3.8, 0.24, 4.2, mat.sand, [x, 0.17, z], scene);
      planter.name = 'cantero-patio';
      colliders.push(modelCollider(planter));
      box(3.56, 0.025, 3.96, grass, [x, 0.3, z], scene).castShadow = false;
      placeModel(index ? 'tree' : 'oak', scene, [x, 0.32, z], { height: 5.3, rotation: side + index });
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const dx = Math.cos(angle) * 1.2;
        const dz = Math.sin(angle) * 1.5;
        placeModel('smallBush', scene, [x + dx, 0.32, z + dz], { height: 0.36, rotation: angle });
        placeModel(i % 2 ? 'flowers' : 'yellowFlowers', scene, [x + dx * 1.15, 0.32, z + dz * 1.08], { height: 0.3 });
      }
      const bench = placeModel('bench', scene, [side * 8.25, 0.1, z + 0.75], { height: 0.9, width: 2.45, rotation: -side * Math.PI / 2 });
      colliders.push(modelCollider(bench));
    }
    const lawn = box(3.8, 0.025, 7.2, grass, [side * 11.1, 0.08, 12.55], scene);
    lawn.name = 'cesped-patio';
    lawn.castShadow = false;
    for (const dx of [-1.94, 1.94]) box(0.08, 0.025, 7.35, mat.sand, [side * 11.1 + dx, 0.08, 12.55], scene).castShadow = false;
    for (const dz of [-3.64, 3.64]) box(3.96, 0.025, 0.08, mat.sand, [side * 11.1, 0.08, 12.55 + dz], scene).castShadow = false;
    // Low, walkable tufts add texture without blocking the house approaches.
    const blades = new THREE.BufferGeometry();
    blades.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.055, 0, 0, 0.025, 0.17, 0.035, 0.04, 0, 0,
      0, 0, -0.06, -0.025, 0.12, 0.015, 0, 0, 0.055,
    ], 3));
    blades.computeVertexNormals();
    const bladeMaterial = toon(0x83a97d);
    bladeMaterial.side = THREE.DoubleSide;
    const tufts = new THREE.InstancedMesh(blades, bladeMaterial, 90);
    const transform = new THREE.Object3D();
    for (let i = 0; i < 90; i++) {
      transform.position.set(side * 11.1 + ((i * 47 % 89) / 89 - 0.5) * 3.45, 0.1, 12.55 + ((i * 31 % 83) / 83 - 0.5) * 6.9);
      transform.rotation.y = i * 2.4;
      transform.scale.setScalar(0.55 + (i % 5) * 0.16);
      transform.updateMatrix();
      tufts.setMatrixAt(i, transform.matrix);
    }
    scene.add(tufts);
    for (const z of [0.5, 19.5]) {
      const x = side * 7.8;
      const foot = mesh(new THREE.CylinderGeometry(0.23, 0.32, 0.18, 8), bronze, [x, 0.17, z], scene);
      colliders.push(modelCollider(foot));
      mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.8, 8), bronze, [x, 1.6, z], scene);
      box(0.48, 0.1, 0.48, bronze, [x, 3.03, z], scene);
      const lantern = box(0.33, 0.55, 0.33, glow, [x, 3.35, z], scene);
      lantern.castShadow = false;
      outline(lantern, 0.6);
      mesh(new THREE.ConeGeometry(0.42, 0.3, 4), bronze, [x, 3.76, z], scene).rotation.y = Math.PI / 4;
    }
    const planter = placeModel('pot', scene, [side * 4.9, 0.1, -0.55], { height: 0.45, width: 1.25 });
    colliders.push(modelCollider(planter));
    placeModel('cypress', scene, [side * 4.9, 0.5, -0.55], { height: 2.15, width: 0.8 });
  }
}

function upperFacade(scene: THREE.Object3D): void {
  const roof = toon(0x607b80);
  for (const side of [-1, 1]) {
    box(9.5, 2.55, 4.4, mat.cream, [side * 7.75, 6.72, -5.6], scene);
    box(9.65, 0.15, 4.55, mat.stone, [side * 7.75, 7.94, -5.6], scene);
    box(9.85, 0.18, 4.75, mat.sand, [side * 7.75, 8.12, -5.6], scene);
    hippedRoof(10.1, 1.55, 5.05, roof, [side * 7.75, 8.21, -5.6], scene);
    for (const x of [side * 4.45, side * 7.7, side * 10.9]) {
      placeModel('archedWindow', scene, [x, 5.8, -3.28], { height: 1.8, width: 1.08 });
      box(1.37, 0.1, 0.32, mat.sand, [x, 5.75, -3.18], scene);
      box(0.16, 2.3, 0.16, mat.sand, [x - 0.85, 6.8, -3.29], scene);
    }
    // Dormers sit on the front roof slope, below its ridge.
    for (const x of [side * 5.1, side * 10.3]) {
      box(0.9, 0.92, 0.6, mat.stone, [x, 8.71, -3.65], scene);
      box(0.54, 0.62, 0.035, mat.door, [x, 8.72, -3.33], scene);
      box(0.055, 0.62, 0.04, mat.sand, [x, 8.72, -3.3], scene);
      hippedRoof(1.15, 0.32, 0.85, roof, [x, 9.17, -3.62], scene);
    }
    box(0.55, 1.15, 0.65, mat.sand, [side * 11.5, 9.6, -6.1], scene);
    box(0.73, 0.14, 0.84, mat.stone, [side * 11.5, 10.19, -6.1], scene);
  }
  box(6.15, 3.15, 4.5, mat.cream, [0, 7.04, -5.3], scene);
  for (const x of [-2.85, 2.85]) {
    box(0.27, 2.95, 0.28, mat.stone, [x, 7.05, -2.98], scene);
  }
  box(6.6, 0.21, 4.85, mat.sand, [0, 8.63, -5.3], scene);
  hippedRoof(6.95, 1.65, 5.15, roof, [0, 8.75, -5.3], scene);
  const pediment = new THREE.Shape();
  pediment.moveTo(-3.45, 8.62);
  pediment.lineTo(3.45, 8.62);
  pediment.lineTo(0, 9.91);
  pediment.closePath();
  outline(mesh(new THREE.ExtrudeGeometry(pediment, { depth: 0.32, bevelEnabled: false }), mat.stone, [0, 0, -3.13], scene), 0.45);
  box(7.05, 0.17, 0.5, mat.sand, [0, 8.57, -2.99], scene);
  mesh(new THREE.CircleGeometry(0.87, 48), mat.gold, [0, 7.04, -3.01], scene);
  mesh(new THREE.CircleGeometry(0.76, 48), mat.stone, [0, 7.04, -2.99], scene);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const mark = box(0.035, i % 3 ? 0.09 : 0.15, 0.025, mat.darkGold, [Math.sin(angle) * 0.65, 7.04 + Math.cos(angle) * 0.65, -2.96], scene);
    mark.rotation.z = -angle;
  }
  const minuteHand = box(0.035, 0.53, 0.03, mat.ink, [0.13, 7.27, -2.92], scene);
  minuteHand.rotation.z = -Math.PI / 6;
  const hourHand = box(0.055, 0.35, 0.035, mat.ink, [-0.16, 7.12, -2.9], scene);
  hourHand.rotation.z = Math.PI / 3;
}

function museumEnvelope(scene: THREE.Scene): void {
  const { halfWidth, frontZ, hallBackZ, backZ, wallHeight } = museumLayout;
  const length = frontZ - backZ;
  const centerZ = (frontZ + backZ) / 2;
  const outsideX = halfWidth + 0.21;
  const roof = toon(0x607b80);
  for (const side of [-1, 1]) {
    // Exterior masonry dresses the same walls that enclose the playable interior.
    box(0.1, wallHeight, length, mat.cream, [side * outsideX, wallHeight / 2, centerZ], scene);
    box(0.2, 0.45, length, mat.sand, [side * (outsideX + 0.03), 0.3, centerZ], scene);
    box(0.3, 0.18, length + 0.2, mat.stone, [side * (outsideX + 0.04), 5.36, centerZ], scene);
    for (let z = frontZ - 3.1; z > backZ; z -= galleryLayout.step / 2) {
      box(0.17, 4.7, 0.27, mat.stone, [side * (outsideX + 0.05), 2.85, z], scene);
    }
    const wingWidth = (galleryLayout.wingX - galleryLayout.innerX) * 2;
    hippedRoof(wingWidth + 0.6, 1.1, hallBackZ - backZ + 0.5, roof,
      [side * galleryLayout.wingX, 5.61, (hallBackZ + backZ) / 2], scene);
    box(0.15, 0.8, frontZ - hallBackZ, roof, [side * outsideX, 5.98, (frontZ + hallBackZ) / 2], scene);
  }
  box(halfWidth * 2 + 0.5, wallHeight, 0.1, mat.cream, [0, wallHeight / 2, backZ - 0.2], scene);
  box(halfWidth * 2 + 0.7, 0.18, 0.3, mat.stone, [0, 5.36, backZ - 0.24], scene);
  box(galleryLayout.innerX * 2, 0.12, galleryLayout.bridgeDepth, roof, [0, 5.66, backZ + galleryLayout.bridgeDepth / 2], scene);
  box(halfWidth * 2 + 0.5, 0.8, 0.15, roof, [0, 5.98, hallBackZ - 0.21], scene);
  hippedRoof(halfWidth * 2 + 0.8, 1.1, frontZ - hallBackZ + 0.5, roof,
    [0, 6.38, (frontZ + hallBackZ) / 2], scene);
}

function column(parent: THREE.Object3D, x: number, z: number, height: number): void {
  outline(box(0.86, 0.3, 0.86, mat.sand, [x, 0.15, z], parent), 0.5);
  const shaft = mesh(new THREE.CylinderGeometry(0.29, 0.35, height - 0.51, 9), mat.stone, [x, height / 2 + 0.025, z], parent);
  silhouette(shaft, 1.015);
  outline(shaft, 0.35);
  outline(box(0.82, 0.27, 0.82, mat.sand, [x, height - 0.135, z], parent), 0.5);
}

function pyramid(parent: THREE.Object3D, x: number, z: number): void {
  const half = 3.2;
  const apex = new THREE.Vector3(x, 4.25, z);
  const corners = [
    new THREE.Vector3(x - half, 0.18, z - half),
    new THREE.Vector3(x + half, 0.18, z - half),
    new THREE.Vector3(x + half, 0.18, z + half),
    new THREE.Vector3(x - half, 0.18, z + half),
  ];
  outline(box(6.8, 0.28, 6.8, mat.stone, [x, 0.13, z], parent), 0.6);
  corners.forEach((corner, index) => {
    const next = corners[(index + 1) % corners.length];
    const geometry = new THREE.BufferGeometry().setFromPoints([corner, next, apex]);
    geometry.setIndex([0, 1, 2]);
    geometry.computeVertexNormals();
    const glass = mesh(
      geometry,
      new THREE.MeshPhongMaterial({ color: index % 2 ? 0x82cfc5 : 0xb4e9de, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }),
      [0, 0, 0], parent,
    );
    glass.castShadow = false;
    glass.receiveShadow = false;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.72 }));
    parent.add(edge);
    const mid = corner.clone().add(next).multiplyScalar(0.5);
    const mullion = new THREE.Line(new THREE.BufferGeometry().setFromPoints([mid, apex]), new THREE.LineBasicMaterial({ color: 0x477f80, transparent: true, opacity: 0.55 }));
    parent.add(mullion);
    const lattice: THREE.Vector3[] = [];
    for (let row = 1; row < 7; row++) {
      const t = row / 7;
      lattice.push(corner.clone().lerp(apex, t), next.clone().lerp(apex, t));
      lattice.push(corner.clone().lerp(next, t), corner.clone().lerp(apex, t));
      lattice.push(next.clone().lerp(corner, t), next.clone().lerp(apex, t));
    }
    parent.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lattice), new THREE.LineBasicMaterial({ color: 0x658c87, transparent: true, opacity: 0.4 })));
  });
}

function turnstiles(parent: THREE.Object3D): { wings: THREE.Group[]; colliders: Collider[]; blocker: Collider } {
  const metal = toon(0x879d9a);
  const metalTop = toon(0x526b70);
  const glass = new THREE.MeshPhongMaterial({ color: 0xb6ddd5, transparent: true, opacity: 0.66, depthWrite: false, side: THREE.DoubleSide });
  const colliders: Collider[] = [];
  for (const x of [-2.4, -0.8, 0.8, 2.4]) {
    const body = box(0.42, 0.83, 1.08, metal, [x, 0.48, -3.02], parent);
    outline(body, 0.36);
    box(0.48, 0.11, 1.13, metalTop, [x, 0.95, -3.02], parent);
    box(0.33, 0.045, 0.3, mat.mint, [x, 1.03, -2.73], parent);
    colliders.push({ minX: x - 0.24, maxX: x + 0.24, minZ: -3.59, maxZ: -2.45 });
  }
  for (const x of [-1.6, 1.6]) {
    const fixedWing = box(1.1, 0.55, 0.045, glass, [x, 0.76, -3.02], parent);
    fixedWing.castShadow = false;
    outline(fixedWing, 0.55);
    colliders.push({ minX: x - 0.6, maxX: x + 0.6, minZ: -3.16, maxZ: -2.88 });
  }
  const wings: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(side * 0.8, 0, -3.02);
    parent.add(wing);
    const pane = box(0.72, 0.55, 0.045, glass, [-side * 0.39, 0.76, 0], wing);
    pane.castShadow = false;
    outline(pane, 0.6);
    wings.push(wing);
  }
  return { wings, colliders, blocker: { minX: -0.59, maxX: 0.59, minZ: -3.17, maxZ: -2.87 } };
}

export function createMuseumScene(): MuseumWorld {
  const scene = new THREE.Scene();
  const decorationColliders: Collider[] = [];
  addSky(scene);
  scene.fog = new THREE.Fog(0xd9e8dd, 60, 120);
  const daylight = new THREE.HemisphereLight(0xfff7df, 0x819e99, 1.65);
  scene.add(daylight);
  const sun = new THREE.DirectionalLight(0xffe7c8, 1.6);
  sun.position.set(-9, 16, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.autoUpdate = false;
  sun.shadow.needsUpdate = true;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  // The entrance is a gradual lighting transition into the curated interior.
  // Apply before rendering so photographs and paused frames use the same lighting.
  const eye = new THREE.Vector3();
  scene.onBeforeRender = (_renderer, _scene, camera) => {
    camera.getWorldPosition(eye);
    const indoors = THREE.MathUtils.smoothstep(-eye.z, 3.5, 8);
    daylight.intensity = THREE.MathUtils.lerp(1.5, 0.34, indoors);
    sun.intensity = THREE.MathUtils.lerp(1.4, 0.1, indoors);
  };

  const galleryBack = museumLayout.backZ;
  const groundSize = Math.max(110, 2 * (Math.abs(galleryBack) + 10));
  const ground = mesh(new THREE.PlaneGeometry(groundSize, groundSize), mat.sage, [0, -0.02, 0], scene);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  courtyardPaving(scene);
  pyramid(scene, -3, 8);
  const landscaping = new THREE.Group(); scene.add(landscaping);
  courtyardDetails(landscaping, decorationColliders);
  batchStaticMeshes(landscaping);
  const arrival = createCourtyardArrival(scene, decorationColliders);
  const facade = new THREE.Group(); scene.add(facade);
  upperFacade(facade);
  batchStaticMeshes(facade);

  // The open portal shows the hall from the courtyard; the central turnstile controls entry.
  for (const side of [-1, 1]) {
    const wall = box(9.7, 5.1, 0.75, mat.cream, [side * 7.65, 2.55, -3.9], scene);
    silhouette(wall, 1.006);
    outline(wall, 0.28);
    for (const x of [side * 6.5, side * 9.7]) {
      placeModel('archedWindow', scene, [x, 0.85, -3.45], { height: 2.8, width: 1.45 });
      box(1.7, 0.16, 0.4, mat.sand, [x, 0.79, -3.39], scene);
    }
    for (const x of [side * 3.3, side * 5.55]) column(scene, x, -3.1, 5.1);
  }
  outline(box(5.6, 0.88, 0.82, mat.cream, [0, 4.77, -3.9], scene), 0.4);
  box(5.5, 0.13, 0.9, mat.sand, [0, 4.26, -3.9], scene);
  outline(box(25, 0.34, 1.25, mat.stone, [0, 5.25, -3.9], scene), 0.55);
  outline(box(26, 0.17, 1.45, mat.sand, [0, 5.54, -3.9], scene), 0.55);
  sign(scene, 'MUSEO DEL TIEMPO', [0, 4.77, -3.44], 3.35);
  const entranceGate = turnstiles(scene);
  const attendant = createGuard(scene);

  createHall(scene, decorationColliders);
  sign(scene, 'GALERÍA DEL TIEMPO', [0, 4.7, -21.08], 4.4, true);
  const gallery = createGallery(scene);
  museumEnvelope(scene);
  const romeExhibit = installRomeExhibit(gallery.rooms.find((room) => room.id === 'roma')!);
  const egyptExhibit = installEgyptExhibit(gallery.rooms.find((room) => room.id === 'egipto')!);
  const medievalExhibit = installMedievalExhibit(gallery.rooms.find((room) => room.id === 'medieval')!);
  const japanExhibit = installJapanExhibit(gallery.rooms.find((room) => room.id === 'japon')!);
  const moonExhibit = installMoonExhibit(gallery.rooms.find((room) => room.id === 'luna')!);
  const exhibits = new Map<AreaId, { artifact: THREE.Object3D; photoSolids: THREE.Object3D[] }>([
    ['luna', { artifact: moonExhibit.artifact, photoSolids: [...gallery.photoSolids, ...moonExhibit.photoSolids] }],
    ['japon', { artifact: japanExhibit.artifact, photoSolids: [...gallery.photoSolids, ...japanExhibit.photoSolids] }],
    ['medieval', { artifact: medievalExhibit.artifact, photoSolids: [...gallery.photoSolids, ...medievalExhibit.photoSolids] }],
    ['egipto', { artifact: egyptExhibit.artifact, photoSolids: [...gallery.photoSolids, ...egyptExhibit.photoSolids] }],
    ['roma', { artifact: romeExhibit.artifact, photoSolids: [...gallery.photoSolids, ...romeExhibit.photoSolids] }],
  ]);
  sign(scene, 'FIN DEL RECORRIDO', [galleryLayout.wingX, 3.45, galleryLayout.frontZ + 0.19], 2.55, true);
  sign(scene, 'REGRESO AL HALL', [galleryLayout.wingX, 3.45, galleryLayout.frontZ - 0.22], 2.5, true).rotation.y = Math.PI;

  const doorBlock = entranceGate.blocker;
  const colliders: Collider[] = [
    ...decorationColliders,
    { minX: -12.5, maxX: -2.8, minZ: -4.4, maxZ: -3.48 },
    { minX: 2.8, maxX: 12.5, minZ: -4.4, maxZ: -3.48 },
    doorBlock,
    { minX: -6.4, maxX: 0.4, minZ: 4.6, maxZ: 11.4 },
    { minX: 3.3, maxX: 4.1, minZ: -1.1, maxZ: -0.25 },
  ];
  colliders.push(...entranceGate.colliders);
  colliders.push(...gallery.colliders);
  colliders.push(...romeExhibit.colliders, ...egyptExhibit.colliders, ...medievalExhibit.colliders, ...japanExhibit.colliders, ...moonExhibit.colliders);
  for (const side of [-1, 1]) {
    for (const x of [side * 3.3, side * 5.55]) {
      colliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: -3.56, maxZ: -2.67 });
    }
  }
  let entranceOpening = false;
  let entranceProgress = 0;
  return {
    scene,
    spawn: arrival.spawn,
    colliders,
    guard: attendant.interaction,
    rooms: gallery.rooms,
    doors: gallery.doors,
    exhibits,
    roomAt: (position) => gallery.rooms.find((room) => (
      Math.abs(position.y - room.center.y) < room.depth / 2 - 0.1
      && Math.abs(position.x - room.center.x) < room.width / 2 - 0.1
    )) ?? null,
    openEntrance: () => {
      entranceOpening = true;
      attendant.handover();
    },
    openDoor: (door) => {
      if (!door.opening && door.progress === 0) door.opening = true;
    },
    update: (delta, visitor) => {
      if (visitor && arrival.update(delta, visitor)) sun.shadow.needsUpdate = true;
      attendant.update(delta);
      if (entranceOpening && entranceProgress < 1) {
        sun.shadow.needsUpdate = true;
        entranceProgress = Math.min(1, entranceProgress + delta * 1.3);
        entranceGate.wings[0].rotation.y = entranceProgress * 1.35;
        entranceGate.wings[1].rotation.y = -entranceProgress * 1.35;
        if (entranceProgress === 1) colliders.splice(colliders.indexOf(doorBlock), 1);
      }
      gallery.update(delta);
      for (const door of gallery.doors) {
        if (door.progress === 1) {
          const index = colliders.indexOf(door.blocker);
          if (index !== -1) colliders.splice(index, 1);
        }
      }
    },
  };
}
