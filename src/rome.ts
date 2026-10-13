import * as THREE from 'three';
import { modelCollider, placeModel } from './assets';
import type { AreaId } from './catalog';
import type { GalleryRoom } from './gallery';
import { galleryLayout } from './museumLayout';
import { exhibition, exhibitSpot, plinth } from './exhibition';
import { createRouteHelp } from './help';
import { createRomanHelmet as helmet } from './helmet';
import type { Collider } from './scene';
import { box, inkStroke, materials as mat, mesh, outline, palette, toon } from './visual';

export function installRomeExhibit(room: GalleryRoom): { artifact: THREE.Object3D; photoSolids: THREE.Object3D[]; colliders: Collider[] } {
  const root = room.root;
  const halfWidth = galleryLayout.wingX - galleryLayout.innerX;
  const depth = galleryLayout.step;
  const statueZ = -depth * 0.23;
  const relicZ = depth * 0.16;
  const columnZ = depth / 2 - 1.7;
  const photoSolids: THREE.Object3D[] = [];
  const colliders: Collider[] = [];
  const dark = toon(exhibition.plinth);
  const bronze = toon(exhibition.bronze);
  const stone = toon(exhibition.stone);
  const base = box(1.05, 0.78, 0.92, dark, [0, 0.56, -0.45], root);
  const foot = box(1.25, 0.14, 1.12, dark, [0, 0.24, -0.45], root);
  const top = box(1.2, 0.12, 1.08, bronze, [0, 1.01, -0.45], root);
  outline(base, 0.35);
  box(1.1, 0.035, 0.98, dark, [0, 1.09, -0.45], root);
  mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.38, 10), dark, [0, 1.3, -0.45], root);
  const artifact = helmet(root, [0, 1.44, -0.45], { gold: toon(0x9e8c68), dark: bronze, coral: toon(0x935b46), ink: mat.ink });
  artifact.scale.setScalar(0.55);
  // Warm focal light and quieter lateral lighting share the door's flicker/completion lifecycle.
  const lights = [exhibitSpot(root, 0, -0.45, 5.17, 23, 2.25, true, true)];
  for (const side of [-1, 1]) {
    const x = side * (halfWidth - 1.05);
    for (const z of [-columnZ, columnZ]) {
      const column = placeModel('column', root, [x, 0.17, z], { height: 4.95, width: 0.78, depth: 0.78, color: 0xaaa28b });
      photoSolids.push(column);
      colliders.push(modelCollider(column));
    }
    const statueBase = plinth(root, x, statueZ, 1.08, 0.7);
    const bust = placeModel('statue', root, [x, 0.85, statueZ], { height: 1.85, width: 0.85, color: 0xc4bba4, rotation: -side * 0.32 });
    const relicBase = plinth(root, x, relicZ, 1.12, 0.55);
    const relic = side < 0
      ? amphora(root, [x, 0.7, relicZ])
      : placeModel('brokenColumn', root, [x, 0.7, relicZ], { height: 1.35, width: 0.87, color: 0xc4bba4 });
    for (const object of [statueBase, bust, relicBase, relic]) {
      photoSolids.push(object);
      colliders.push(modelCollider(object));
    }
    lights.push(exhibitSpot(root, x, statueZ, 5.17, 10, 1.9));
    lights.push(exhibitSpot(root, x, relicZ, 5.17, 8, 1.8));
    // Recessed exhibit bays keep the collections against the perimeter.
    for (const z of [statueZ, relicZ]) {
      box(0.065, 2.85, 2.9, dark, [side * (halfWidth - 0.19), 1.65, z], root);
      for (const edge of [-1.45, 1.45]) box(0.1, 2.85, 0.035, bronze, [side * (halfWidth - 0.25), 1.65, z + edge], root);
    }
    box(0.08, 0.13, depth - 0.5, stone, [side * (halfWidth - 0.21), 4.87, 0], root);
    exhibitLabel(root, side < 0 ? 'ÁNFORA' : 'PIEDRA Y MEMORIA', 'COLECCIÓN ROMANA', [x, 0.51, relicZ + 0.57], 0.85);
    exhibitLabel(root, 'FIGURA ROMANA', 'ESCULTURA · ESTUDIO', [x, 0.61, statueZ + 0.55], 0.85);
  }
  for (const z of [-columnZ, -0.45, columnZ]) {
    box(halfWidth * 2 - 0.4, 0.12, 0.18, dark, [0, 5.26, z], root);
    for (const x of [-1.55, 1.55]) box(0.08, 0.05, depth - 0.6, dark, [x, 5.33, 0], root);
  }
  const mural = romanMural(root, [halfWidth - 0.31, 3.82, -0.7]);
  mural.rotation.y = -Math.PI / 2;
  photoSolids.push(mural);
  exhibitLabel(root, 'EL ECO DE LA ARENA', 'CASCO DE GLADIADOR · BRONCE', [0, 0.68, 0.02], 0.9);
  const setRoomLight = root.userData.setLight as (strength: number) => void;
  root.userData.setLight = (strength: number) => {
    setRoomLight(strength);
    lights.forEach((setLight) => setLight(strength));
  };
  root.userData.setLight(0);
  const collider = {
    minX: room.center.x - 0.625, maxX: room.center.x + 0.625,
    minZ: room.center.y - 1.01, maxZ: room.center.y + 0.11,
  };
  return { artifact, photoSolids: [base, top, foot, ...photoSolids], colliders: [collider, ...colliders] };
}

function exhibitLabel(parent: THREE.Object3D, title: string, subtitle: string, position: [number, number, number], width: number): void {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#252d29'; ctx.fillRect(0, 0, 768, 192);
  ctx.strokeStyle = '#b2986f'; ctx.strokeRect(8, 8, 752, 176);
  ctx.textAlign = 'center'; ctx.fillStyle = '#e4d7b7';
  ctx.font = '38px Georgia'; ctx.fillText(title, 384, 85);
  ctx.font = '20px sans-serif'; ctx.fillText(subtitle, 384, 135);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const label = mesh(new THREE.PlaneGeometry(width, width / 4), new THREE.MeshBasicMaterial({ map: texture }), position, parent);
  label.castShadow = false;
}

function amphora(parent: THREE.Object3D, position: [number, number, number]): THREE.Group {
  const root = new THREE.Group(); root.position.set(...position); parent.add(root);
  box(0.9, 0.26, 0.9, mat.sand, [0, 0.13, 0], root);
  const points = [[0.11, 0], [0.21, 0.09], [0.36, 0.36], [0.37, 0.65], [0.22, 0.82], [0.13, 0.92], [0.13, 1.1], [0.2, 1.13]];
  const vase = mesh(new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), 12), mat.coral, [0, 0.27, 0], root);
  outline(vase, 0.3);
  for (const side of [-1, 1]) {
    const handle = mesh(new THREE.TorusGeometry(0.22, 0.045, 5, 10), mat.coral, [side * 0.29, 1.07, 0], root);
    handle.scale.set(0.68, 1, 1);
  }
  for (const y of [0.64, 0.7, 0.95]) {
    const ring = mesh(new THREE.TorusGeometry(y === 0.95 ? 0.32 : 0.365, 0.012, 4, 12), mat.sand, [0, y, 0], root);
    ring.rotation.x = Math.PI / 2;
  }
  return root;
}

function romanMural(parent: THREE.Object3D, position: [number, number, number]): THREE.Mesh {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#d9b895'; ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#e9d5ae'; ctx.beginPath(); ctx.arc(750, 140, 87, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = '#b78263'; ctx.fillRect(i * 110 - 28, 150, 70, 220);
    ctx.beginPath(); ctx.arc(i * 110 + 62, 188, 42, Math.PI, 0); ctx.lineTo(i * 110 + 104, 300); ctx.lineTo(i * 110 + 20, 300); ctx.fill();
  }
  ctx.fillStyle = '#719e97'; ctx.fillRect(0, 342, 1024, 170);
  ctx.strokeStyle = '#b9d3bd'; ctx.lineWidth = 3;
  for (let i = 0; i < 28; i++) { const x = i * 137 % 1024; const y = 361 + i * 37 % 140; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 45, y + 2); ctx.stroke(); }
  ctx.fillStyle = '#735e53'; ctx.beginPath(); ctx.moveTo(370, 376); ctx.lineTo(645, 376); ctx.lineTo(609, 420); ctx.lineTo(410, 420); ctx.fill();
  ctx.fillRect(512, 195, 8, 195); ctx.fillStyle = '#f2e4be'; ctx.fillRect(414, 216, 204, 122);
  ctx.fillStyle = '#bc795d'; ctx.fillRect(509, 216, 13, 122);
  ctx.strokeStyle = '#f3dfb7'; ctx.lineWidth = 14; ctx.strokeRect(15, 15, 994, 482);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const mural = mesh(new THREE.PlaneGeometry(3.05, 1.52), new THREE.MeshLambertMaterial({ map: texture }), position, parent);
  mural.castShadow = false; return mural;
}

function ship(parent: THREE.Object3D, x: number, z: number, side: number, wood: THREE.Material, sail: THREE.Material): void {
  const vessel = new THREE.Group();
  vessel.position.set(x, -0.12, z);
  vessel.rotation.y = side * 0.24;
  parent.add(vessel);
  const hull = placeModel('rowboat', vessel, [0, 0, 0], { height: 1.3, width: 5.5, depth: 9.2 });
  const paddles = hull.getObjectByName('paddles');
  if (paddles) paddles.visible = false;
  placeModel('planks', vessel, [0, 0.83, 0], { height: 0.18, width: 1.85, depth: 6.4 });
  mesh(new THREE.CylinderGeometry(0.075, 0.12, 6, 8), wood, [0, 3.8, -0.6], vessel);
  const yard = mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6), wood, [0, 6.2, -0.6], vessel);
  yard.rotation.z = Math.PI / 2;
  const cloth = new THREE.PlaneGeometry(3.8, 2.9, 8, 4);
  const positions = cloth.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    positions.setZ(i, Math.sin((positions.getX(i) / 3.8 + 0.5) * Math.PI) * 0.42);
  }
  cloth.computeVertexNormals();
  sail.side = THREE.DoubleSide;
  const canvas = mesh(cloth, sail, [0, 4.67, -0.6], vessel);
  outline(canvas, 0.4);
  for (const dx of [-1.9, 1.9]) inkStroke([[dx, 6.2, -0.6], [dx * 0.65, 1, 2.9]], vessel, 0.6);
  const emblem = toon(0xb66e54);
  emblem.side = THREE.DoubleSide;
  mesh(new THREE.CircleGeometry(0.51, 16), emblem, [0, 4.67, -0.16], vessel);
  for (const railSide of [-1, 1]) {
    for (const offset of [-2.7, -1.2, 0.4, 2]) {
      const oar = placeModel('paddle', vessel, [railSide * 1.25, 0.92, offset], { height: 3.1, width: 0.3, rotation: -railSide * 0.18 });
      oar.children[0].position.y -= 3.1;
      oar.rotation.z = railSide * 1.36;
    }
    const ram = box(0.16, 0.25, 1.3, wood, [railSide * 0.3, 0.55, -4.8], vessel);
    outline(ram, 0.4);
  }
  const figure = placeModel('soldier', vessel, [0.45, 1.04, 2.1], { height: 1.72, width: 1.14, rotation: side * 0.55 });
  const left = figure.getObjectByName('arm-left');
  const right = figure.getObjectByName('arm-right');
  if (left) left.rotation.z = -0.65;
  if (right) right.rotation.z = 0.65;
  placeModel('spear', vessel, [1.02, 1.1, 2.15], { height: 2.25 });
  placeModel('barrel', vessel, [-0.5, 1.02, 0.9], { height: 0.55 });
  placeModel('crate', vessel, [0.25, 1.02, -2.8], { height: 0.48 });
}

function arena(scene: THREE.Scene, stone: THREE.Material, trim: THREE.Material): void {
  // Repeated arches use two instanced draws. The steps are continuous elliptical rings.
  const arch = new THREE.Shape();
  arch.moveTo(-2.12, 0); arch.lineTo(-2.12, 3.8); arch.lineTo(2.12, 3.8); arch.lineTo(2.12, 0);
  arch.lineTo(1.28, 0); arch.lineTo(1.28, 1.85);
  arch.absarc(0, 1.85, 1.28, 0, Math.PI, false); arch.lineTo(-1.28, 0); arch.closePath();
  const geometry = new THREE.ExtrudeGeometry(arch, { depth: 0.75, bevelEnabled: false, curveSegments: 8 });
  const dummy = new THREE.Object3D();
  for (const level of [0, 1]) {
    const arches = new THREE.InstancedMesh(geometry, stone, 40);
    for (let i = 0; i < 40; i++) {
      const angle = i / 40 * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * 28, 1.3 + level * 4, -6 + Math.sin(angle) * 23.8);
      dummy.rotation.y = Math.atan2(-23.8 * Math.cos(angle), -28 * Math.sin(angle));
      dummy.updateMatrix(); arches.setMatrixAt(i, dummy.matrix);
    }
    arches.receiveShadow = true; scene.add(arches);
  }
  function ring(rx: number, rz: number, y: number, width: number, material: THREE.Material): void {
    const shape = new THREE.Shape(); shape.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path(); hole.absellipse(0, 0, rx - width, rz - width, 0, Math.PI * 2, true, 0); shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: false, curveSegments: 48 });
    const tier = mesh(geometry, material, [0, y, -6], scene); tier.rotation.x = -Math.PI / 2; tier.castShadow = false;
  }
  for (let step = 0; step < 7; step++) ring(23.4 + step * 0.65, 19.2 + step * 0.65, 0.55 + step * 0.24, 0.82, step % 2 ? stone : trim);
  for (const y of [1.25, 5.18, 9.15]) ring(28.65, 24.45, y, 1.35, trim);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const banner = placeModel('banner', scene, [Math.cos(angle) * 27, 5.4, -6 + Math.sin(angle) * 22.8], { height: 2.55, width: 1.2 });
    banner.rotation.y = -angle - Math.PI / 2;
  }
}

export type RomeWorld = {
  id: AreaId;
  scene: THREE.Scene;
  colliders: Collider[];
  spawn: THREE.Vector2;
  artifact: THREE.Vector3;
  helpActive: () => boolean;
  update: (delta: number) => void;
  dispose: () => void;
};

export function createRomeWorld(): RomeWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd9dfcd);
  scene.fog = new THREE.Fog(0xd9dfcd, 42, 95);
  scene.add(new THREE.HemisphereLight(0xfff2d4, 0x779e98, 1.85));
  const sun = new THREE.DirectionalLight(0xffebc8, 1.6);
  sun.position.set(-8, 13, 9);
  scene.add(sun);

  const stone = toon(0xf2dfbf);
  const trim = toon(0xc8a88b);
  const wood = toon(0x876b61);
  const water = toon(0x79b9b0);
  const foam = toon(0xc8e8d5);
  const sail = toon(0xf6ebd2);
  const coral = toon(palette.coral);
  const ink = toon(palette.ink);
  const gold = toon(0xd7ae6d);

  const ground = mesh(new THREE.PlaneGeometry(100, 100), trim, [0, -0.2, -6], scene);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  const flood = mesh(new THREE.CircleGeometry(1, 80), water, [0, 0.015, -6], scene);
  flood.rotation.x = -Math.PI / 2;
  flood.scale.set(24, 19.8, 1);
  flood.castShadow = false;
  const ripples: THREE.Vector3[] = [];
  for (let i = 0; i < 200; i++) {
    const x = Math.sin(i * 7.13) * 23;
    const z = Math.cos(i * 3.37) * 18;
    if ((x / 23) ** 2 + (z / 18) ** 2 > 1 || Math.abs(x) < 2.2) continue;
    ripples.push(new THREE.Vector3(x, 0.028, z - 6), new THREE.Vector3(x + 0.35 + i % 5 * 0.19, 0.028, z - 5.96));
  }
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ripples), new THREE.LineBasicMaterial({ color: 0xc0dfcb, transparent: true, opacity: 0.55 })));
  arena(scene, stone, trim);

  box(3.8, 0.3, 31.2, stone, [0, 0.19, -5.5], scene).castShadow = false;
  for (const x of [-1.94, 1.94]) {
    box(0.23, 0.47, 31.2, trim, [x, 0.48, -5.5], scene);
    for (const z of [7, 2, -3, -8, -13, -18]) {
      outline(box(0.31, 0.72, 0.34, stone, [x, 0.58, z], scene), 0.45);
    }
  }
  for (const z of [5, 1, -3, -7, -11, -15]) {
    box(3.1, 0.012, 0.045, trim, [0, 0.35, z], scene).castShadow = false;
  }
  ship(scene, -9.5, -4.5, -1, wood, sail);
  ship(scene, 9.8, -11.5, 1, wood, sail);
  for (const [x, z] of [[-7, -1], [-12, -8], [7.8, -8], [12, -14]] as const) {
    for (let i = 0; i < 5; i++) {
      const drop = mesh(new THREE.IcosahedronGeometry(0.12 + i * 0.025, 0), foam, [x + Math.sin(i * 2.2) * 0.65, 0.4 + i * 0.35, z + Math.cos(i * 1.9) * 0.5], scene);
      drop.castShadow = false;
    }
  }
  const dais = box(2.25, 0.82, 2, trim, [0, 0.59, -19], scene);
  outline(dais, 0.65);
  const daisTop = box(2.55, 0.16, 2.27, stone, [0, 1.08, -19], scene);
  outline(daisTop, 0.6);
  const artifact = helmet(scene, [0, 1.59, -19], { gold, dark: wood, coral, ink });
  box(3.7, 3.4, 0.24, coral, [0, 2.2, -21.55], scene);
  for (const x of [-2.2, 2.2]) {
    outline(box(0.47, 4.1, 0.47, stone, [x, 2.2, -21.55], scene), 0.5);
    mesh(new THREE.IcosahedronGeometry(0.23, 0), gold, [x, 4.4, -21.55], scene);
  }
  for (const side of [-1, 1]) {
    box(2.2, 0.75, 2.2, stone, [side * 3.6, 0.3, -18.9], scene);
    const figure = placeModel('soldier', scene, [side * 3.6, 0.68, -18.9], { height: 1.8, width: 1.05, rotation: -side * 0.35 });
    const arm = figure.getObjectByName(side < 0 ? 'arm-left' : 'arm-right');
    if (arm) arm.rotation.z = side * 0.65;
    placeModel('spear', scene, [side * 4.2, 0.68, -18.9], { height: 2.35 });
  }

  const guide = createRouteHelp(scene, [5, 1, -3, -7, -11, -15].map((z) => [0, 0.36, z]), foam);
  const colliders: Collider[] = [
    { minX: -2.22, maxX: -1.69, minZ: -21.1, maxZ: 10.1 },
    { minX: 1.69, maxX: 2.22, minZ: -21.1, maxZ: 10.1 },
    { minX: -1.9, maxX: 1.9, minZ: 9.7, maxZ: 10.1 },
    { minX: -1.9, maxX: 1.9, minZ: -21.3, maxZ: -21.05 },
    { minX: -1.15, maxX: 1.15, minZ: -20.03, maxZ: -17.97 },
  ];
  return {
    id: 'roma', scene, colliders, spawn: new THREE.Vector2(0, 7.5), artifact: artifact.position.clone(),
    helpActive: guide.active,
    update: guide.update,
    dispose: () => {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
        if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
        if (!object.userData.sharedAsset) geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : [object.material];
        if (!object.userData.sharedAsset || object.userData.ownedMaterial) list.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      scene.clear();
    },
  };
}
