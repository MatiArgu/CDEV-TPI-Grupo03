import * as THREE from 'three';
import { modelCollider, placeModel } from './assets';
import type { AreaId } from './catalog';
import { createCourtyardArrival } from './courtyard';
import { createGallery, galleryLayout, type GalleryDoor, type GalleryRoom } from './gallery';
import { createGuard } from './guard';
import { installRomeExhibit } from './rome';
import type { Collider } from './scene';
import { box, hippedRoof, materials as mat, mesh, outline, palette, shadowBlob, silhouette, toon } from './visual';

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

function sign(parent: THREE.Object3D, label: string, position: [number, number, number], width: number): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 164;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#f0f2e5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#b59b70';
  context.lineWidth = 2;
  context.strokeRect(9, 9, 750, 146);
  context.strokeRect(15, 15, 738, 134);
  context.fillStyle = '#354044';
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

function displayCase(parent: THREE.Object3D, x: number, z: number): void {
  outline(box(1.3, 0.78, 1.05, mat.sand, [x, 0.47, z], parent), 0.5);
  const glass = mesh(new THREE.BoxGeometry(1.13, 0.88, 0.88), new THREE.MeshPhongMaterial({ color: 0xb4e9de, transparent: true, opacity: 0.24, depthWrite: false }), [x, 1.29, z], parent);
  glass.castShadow = false;
  outline(glass, 0.6);
  placeModel(x < 0 ? 'statue' : 'rowboat', parent, [x, 0.87, z], x < 0
    ? { height: 0.62, color: 0xb4a17b }
    : { width: 0.76, rotation: 0.3 });
}

function tree(parent: THREE.Object3D, x: number, z: number, seed: number): void {
  shadowBlob(x + 0.3, z + 0.3, 1.7, 0.8, parent);
  placeModel(seed % 2 ? 'oak' : 'tree', parent, [x, 0.1, z], { height: 5.2 + seed * 0.12, rotation: seed * 1.3 });
}

function courtyardDetails(scene: THREE.Scene, colliders: Collider[]): void {
  const soil = toon(0xb4bda0);
  const bronze = toon(0x567573);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffedbf });
  for (const side of [-1, 1]) {
    for (const z of [2, 16]) {
      const x = side * 13;
      const planter = box(4.2, 0.25, 5.3, mat.sand, [x, 0.16, z], scene);
      colliders.push(modelCollider(planter));
      box(3.95, 0.04, 5.05, soil, [x, 0.3, z], scene);
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;
        const dx = Math.cos(angle) * 1.4;
        const dz = Math.sin(angle) * 1.85;
        placeModel(i % 2 ? 'bush' : 'smallBush', scene, [x + dx, 0.31, z + dz], { height: 0.5 + i % 3 * 0.08, rotation: angle });
        placeModel(i % 2 ? 'flowers' : 'yellowFlowers', scene, [x + dx * 1.15, 0.31, z + dz * 1.12], { height: 0.35 });
      }
      const bench = placeModel('bench', scene, [side * 9.35, 0.1, z + 1], { height: 0.9, width: 2.45, rotation: -side * Math.PI / 2 });
      colliders.push(modelCollider(bench));
    }
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

function upperFacade(scene: THREE.Scene): void {
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

function marbleMaterial(): THREE.MeshToonMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#f5eedf';
  context.fillRect(0, 0, 512, 512);
  for (let vein = 0; vein < 19; vein++) {
    const start = (vein * 137) % 640 - 64;
    const slope = 0.25 + (vein % 5) * 0.12;
    context.beginPath();
    for (let step = 0; step <= 12; step++) {
      const y = step * 48 - 32;
      const x = start + y * slope + Math.sin(step * 1.8 + vein * 2.7) * (6 + vein % 4);
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = vein % 4 === 0 ? '#c5bdad' : '#d8d0c0';
    context.lineWidth = vein % 4 === 0 ? 2.3 : 1.1;
    context.globalAlpha = vein % 4 === 0 ? 0.5 : 0.38;
    context.stroke();
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 3);
  const material = toon(0xffffff);
  material.map = texture;
  material.needsUpdate = true;
  return material;
}

function skylight(parent: THREE.Object3D): void {
  const glassMaterial = new THREE.MeshPhongMaterial({
    color: 0xd8e9e4, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false,
  });
  const roofY = (x: number): number => 5.46 + 0.78 * (1 - (x / 4.5) ** 2);
  for (let segment = 0; segment < 8; segment++) {
    const x0 = -4.5 + segment * 1.125;
    const x1 = x0 + 1.125;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      x0, roofY(x0), -5.0, x1, roofY(x1), -5.0,
      x0, roofY(x0), -21.3, x1, roofY(x1), -21.3,
    ], 3));
    geometry.setIndex([0, 2, 1, 1, 2, 3]);
    geometry.computeVertexNormals();
    const pane = mesh(geometry, glassMaterial, [0, 0, 0], parent);
    pane.castShadow = false;
    pane.receiveShadow = false;
  }
  for (let segment = 0; segment <= 8; segment++) {
    const x = -4.5 + segment * 1.125;
    const rib = box(0.065, 0.095, 16.3, mat.darkGold, [x, roofY(x) + 0.01, -13.15], parent);
    rib.castShadow = segment % 2 === 0;
  }
  for (const z of [-5.1, -7.4, -9.7, -12, -14.3, -16.6, -18.9, -21.1]) {
    const points = Array.from({ length: 17 }, (_, index) => {
      const x = -4.5 + index * 0.5625;
      return new THREE.Vector3(x, roofY(x) - 0.025, z);
    });
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.055, 5, false), mat.darkGold, [0, 0, 0], parent);
  }
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
  scene.background = new THREE.Color(0xc5e1dc);
  scene.fog = new THREE.Fog(0xc5e1dc, 48, 105);
  scene.add(new THREE.HemisphereLight(0xfff7df, 0x819e99, 1.65));
  const sun = new THREE.DirectionalLight(0xffe7c8, 1.6);
  sun.position.set(-9, 16, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);

  const galleryBack = galleryLayout.frontZ - galleryLayout.step * 5;
  const groundSize = Math.max(110, 2 * (Math.abs(galleryBack) + 10));
  const ground = mesh(new THREE.PlaneGeometry(groundSize, groundSize), mat.sage, [0, -0.02, 0], scene);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  box(34, 0.08, 34, mat.cream, [0, 0.02, 12], scene).castShadow = false;
  for (const z of [2, 7, 12, 17, 22, 27]) {
    box(32, 0.015, 0.055, mat.sand, [0, 0.07, z], scene).castShadow = false;
  }
  box(5.3, 0.018, 24, mat.stone, [2.2, 0.07, 9], scene).castShadow = false;
  const marble = marbleMaterial();
  box(8.2, 0.02, 8.3, marble, [0, 0.085, 0.45], scene).castShadow = false;
  pyramid(scene, -3, 8);
  for (const [x, z, seed] of [[-13, 2, 1], [13, 2, 2], [-13, 16, 3], [13, 16, 4]] as const) {
    tree(scene, x, z, seed);
  }
  courtyardDetails(scene, decorationColliders);
  const arrival = createCourtyardArrival(scene, decorationColliders);
  upperFacade(scene);

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

  // The original hall leads to the first room and later receives the returning route.
  box(17, 0.14, 18, marble, [0, 0.02, -12.4], scene).castShadow = false;
  box(2.7, 0.012, 16, mat.sage, [0, 0.1, -12.2], scene).castShadow = false;
  for (const side of [-1, 1]) {
    outline(box(0.56, 5.5, 18, mat.cream, [side * 8.55, 2.75, -12.4], scene), 0.38);
    box(0.06, 1.1, 17.8, mat.sage, [side * 8.24, 0.67, -12.4], scene);
    for (const z of [-8, -13.2, -18.4]) {
      column(scene, side * (z === -18.4 ? 7 : 6.4), z, 5.42);
      if (z !== -18.4) {
        outline(box(1.35, 0.22, 1.2, mat.sand, [side * 5.3, 0.22, z - 0.5], scene), 0.4);
        placeModel('statue', scene, [side * 5.3, 0.34, z - 0.5], { height: 2.05, width: 1.05, color: 0xe7ddc4, rotation: -side * 0.3 });
        sign(scene, z === -8 ? 'MEMORIA' : 'EL INSTANTE', [side * 5.3, 0.44, z + 0.13], 0.8);
      }
      outline(box(0.05, 2.2, 2.1, mat.door, [side * 8.19, 2.45, z], scene), 0.38);
      placeModel('tallWindow', scene, [side * 8.12, 1.32, z], { height: 2.25, width: 1.6, rotation: -side * Math.PI / 2 });
    }
    for (const z of [-10.7, -15.8]) {
      const bench = placeModel('museumBench', scene, [side * 7.35, 0.1, z], { height: 0.9, width: 2.1, rotation: -side * Math.PI / 2 });
      decorationColliders.push(modelCollider(bench));
    }
    const plant = placeModel('plant', scene, [side * 7.4, 0.1, -5.6], { height: 1.7 });
    decorationColliders.push(modelCollider(plant, 0.13));
    placeModel('smallPlant', scene, [side * 7.25, 0.1, -19.5], { height: 0.7 });
  }
  for (const z of [-8, -13.2, -18.4]) {
    const points = Array.from({ length: 15 }, (_, index) => {
      const x = -6.4 + index * 12.8 / 14;
      return new THREE.Vector3(x, 3.72 + 1.55 * (1 - (x / 6.4) ** 2), z);
    });
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, 0.11, 6, false), mat.sand, [0, 0, 0], scene);
  }
  displayCase(scene, -3.9, -10.4);
  displayCase(scene, 3.9, -15.6);
  outline(box(17, 1.6, 0.52, mat.cream, [0, 4.7, -21.45], scene), 0.4);
  sign(scene, 'RECORRIDO EN U · 01—10', [0, 4.6, -21.08], 3.65);
  for (const side of [-1, 1]) box(4, 0.25, 18, mat.sand, [side * 6.5, 5.5, -12.4], scene).receiveShadow = false;
  box(9, 0.23, 1.55, mat.sand, [0, 5.55, -4.25], scene);
  skylight(scene);
  for (const z of [-7, -12, -17]) {
    mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 5), mat.darkGold, [0, 5.6, z], scene);
    const bulb = mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.32, 8), new THREE.MeshBasicMaterial({ color: 0xffebc7 }), [0, 5.03, z], scene);
    bulb.castShadow = false;
    outline(bulb, 0.35);
    const light = new THREE.PointLight(0xffecd1, 0.38, 9);
    light.position.set(0, 4.9, z);
    scene.add(light);
  }
  const gallery = createGallery(scene);
  const romeExhibit = installRomeExhibit(gallery.rooms.find((room) => room.id === 'roma')!);
  const exhibits = new Map<AreaId, { artifact: THREE.Object3D; photoSolids: THREE.Object3D[] }>([
    ['roma', { artifact: romeExhibit.artifact, photoSolids: [...gallery.photoSolids, ...romeExhibit.photoSolids] }],
  ]);
  sign(scene, 'REGRESO AL HALL', [galleryLayout.wingX, 3.45, -21.67], 2.5);

  const doorBlock = entranceGate.blocker;
  const colliders: Collider[] = [
    ...decorationColliders,
    { minX: -12.5, maxX: -2.8, minZ: -4.4, maxZ: -3.48 },
    { minX: 2.8, maxX: 12.5, minZ: -4.4, maxZ: -3.48 },
    doorBlock,
    { minX: -6.4, maxX: 0.4, minZ: 4.6, maxZ: 11.4 },
    { minX: 3.3, maxX: 4.1, minZ: -1.1, maxZ: -0.25 },
    { minX: -8.9, maxX: -8.2, minZ: -21.5, maxZ: -3.5 },
    { minX: 8.2, maxX: 8.9, minZ: -21.5, maxZ: -3.5 },
    { minX: -4.55, maxX: -3.25, minZ: -10.93, maxZ: -9.87 },
    { minX: 3.25, maxX: 4.55, minZ: -16.13, maxZ: -15.07 },
  ];
  colliders.push(...entranceGate.colliders);
  colliders.push(...gallery.colliders);
  colliders.push(...romeExhibit.colliders);
  for (const [x, z] of [[-13, 2], [13, 2], [-13, 16], [13, 16]]) {
    colliders.push({ minX: x - 0.32, maxX: x + 0.32, minZ: z - 0.32, maxZ: z + 0.32 });
  }
  for (const side of [-1, 1]) {
    for (const x of [side * 3.3, side * 5.55]) {
      colliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: -3.56, maxZ: -2.67 });
    }
    for (const z of [-8, -13.2, -18.4]) {
      const columnX = side * (z === -18.4 ? 7 : 6.4);
      colliders.push({ minX: columnX - 0.45, maxX: columnX + 0.45, minZ: z - 0.45, maxZ: z + 0.45 });
      if (z !== -18.4) colliders.push({ minX: side * 5.3 - 0.68, maxX: side * 5.3 + 0.68, minZ: z - 1.1, maxZ: z + 0.1 });
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
      Math.abs(position.y - room.center.y) < galleryLayout.step / 2 - 0.1
      && Math.abs(position.x - room.center.x) < galleryLayout.wingX - galleryLayout.innerX - 0.1
    )) ?? null,
    openEntrance: () => {
      entranceOpening = true;
      attendant.handover();
    },
    openDoor: (door) => {
      if (!door.opening && door.progress === 0) door.opening = true;
    },
    update: (delta, visitor) => {
      if (visitor) arrival.update(delta, visitor);
      attendant.update(delta);
      if (entranceOpening && entranceProgress < 1) {
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
