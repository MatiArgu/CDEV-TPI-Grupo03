import * as THREE from 'three';
import type { AreaId } from './catalog';
import { createGallery, galleryLayout, type GalleryDoor, type GalleryRoom } from './gallery';
import { createGuard } from './guard';
import { installRomeExhibit } from './rome';
import type { Collider } from './scene';
import { box, irregularCrown, materials as mat, mesh, outline, palette, shadowBlob, silhouette, toon } from './visual';

export type MuseumWorld = {
  scene: THREE.Scene;
  colliders: Collider[];
  guard: THREE.Vector3;
  rooms: GalleryRoom[];
  doors: GalleryDoor[];
  exhibits: Map<AreaId, { artifact: THREE.Object3D; photoSolids: THREE.Object3D[] }>;
  roomAt: (position: THREE.Vector2) => GalleryRoom | null;
  openEntrance: () => void;
  openDoor: (door: GalleryDoor) => void;
  update: (delta: number) => void;
};

function sign(parent: THREE.Object3D, label: string, position: [number, number, number], width: number): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 164;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#f0f2e5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#354044';
  context.lineWidth = 11;
  context.strokeRect(7, 7, 754, 150);
  context.fillStyle = '#354044';
  context.font = 'bold 47px sans-serif';
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
  mesh(new THREE.IcosahedronGeometry(0.18, 0), mat.coral, [x, 1.19, z], parent);
}

function tree(parent: THREE.Object3D, x: number, z: number, seed: number): void {
  shadowBlob(x + 0.3, z + 0.3, 1.7, 0.8, parent);
  const trunk = mesh(new THREE.CylinderGeometry(0.17, 0.3, 2.5, 7), mat.darkGold, [x, 1.3, z], parent);
  silhouette(trunk, 1.03);
  for (const [dx, y, dz, radius, material] of [
    [-0.36, 3.0, 0.02, 1.05, mat.green],
    [0.35, 3.36, -0.15, 1.1, mat.mint],
    [0, 3.75, 0.16, 0.9, mat.sage],
  ] as const) {
    const crown = irregularCrown(radius, material, seed + y);
    crown.position.set(x + dx, y, z + dz);
    crown.scale.y = 0.82;
    parent.add(crown);
  }
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
  scene.background = new THREE.Color(0x89d9cd);
  scene.fog = new THREE.Fog(0x89d9cd, 40, 78);
  scene.add(new THREE.AmbientLight(0xfff8ee, 0.88));
  const sun = new THREE.DirectionalLight(0xffe7c8, 1.6);
  sun.position.set(-9, 16, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
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

  // The open portal shows the hall from the courtyard; the central turnstile controls entry.
  for (const side of [-1, 1]) {
    const wall = box(9.7, 5.1, 0.75, mat.cream, [side * 7.65, 2.55, -3.9], scene);
    silhouette(wall, 1.006);
    outline(wall, 0.28);
    for (const x of [side * 6.5, side * 9.7]) {
      outline(box(1.2, 2.2, 0.07, mat.door, [x, 2.15, -3.48], scene), 0.65);
      box(0.08, 2.1, 0.09, mat.sand, [x, 2.15, -3.42], scene);
    }
    for (const x of [side * 3.3, side * 5.55]) column(scene, x, -3.1, 5.1);
  }
  outline(box(5.6, 0.88, 0.82, mat.cream, [0, 4.77, -3.9], scene), 0.4);
  box(5.5, 0.13, 0.9, mat.sand, [0, 4.26, -3.9], scene);
  outline(box(25, 0.34, 1.25, mat.stone, [0, 5.25, -3.9], scene), 0.55);
  outline(box(26, 0.17, 1.45, mat.sand, [0, 5.54, -3.9], scene), 0.55);
  const pediment = new THREE.Shape();
  pediment.moveTo(-10.7, 5.65);
  pediment.lineTo(10.7, 5.65);
  pediment.lineTo(0, 7.3);
  pediment.closePath();
  outline(mesh(new THREE.ExtrudeGeometry(pediment, { depth: 0.35, bevelEnabled: false }), mat.cream, [0, 0, -4.3], scene), 0.6);
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
        outline(box(1.35, 0.73, 1.2, mat.sand, [side * 5.3, 0.46, z - 0.5], scene), 0.5);
        mesh(new THREE.CylinderGeometry(0.2, 0.34, 0.38, 7), mat.stone, [side * 5.3, 1.02, z - 0.5], scene);
        const bust = mesh(new THREE.IcosahedronGeometry(0.32, 1), mat.stone, [side * 5.3, 1.49, z - 0.5], scene);
        silhouette(bust, 1.025);
      }
      outline(box(0.05, 2.2, 2.1, mat.door, [side * 8.19, 2.45, z], scene), 0.38);
    }
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
    const bulb = mesh(new THREE.IcosahedronGeometry(0.12, 0), mat.cream, [0, 5.03, z], scene);
    bulb.castShadow = false;
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
    update: (delta) => {
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
