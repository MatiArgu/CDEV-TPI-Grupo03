import * as THREE from 'three';
import { createGallery, type GalleryRoom } from './gallery';
import type { Collider } from './scene';
import { box, irregularCrown, materials as mat, mesh, outline, palette, shadowBlob, silhouette } from './visual';

export type MuseumWorld = {
  scene: THREE.Scene;
  colliders: Collider[];
  guard: THREE.Vector3;
  rooms: GalleryRoom[];
  roomAt: (position: THREE.Vector2) => GalleryRoom | null;
  openEntrance: () => void;
  revealRome: () => void;
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
  const panel = mesh(new THREE.PlaneGeometry(width, width * 164 / 768), new THREE.MeshBasicMaterial({ map: texture }), position, parent);
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

function column(parent: THREE.Object3D, x: number, z: number, height = 4.1): void {
  outline(box(0.86, 0.26, 0.86, mat.sand, [x, 0.42, z], parent), 0.5);
  const shaft = mesh(new THREE.CylinderGeometry(0.29, 0.35, height - 0.7, 9), mat.stone, [x, height / 2 + 0.09, z], parent);
  silhouette(shaft, 1.015);
  outline(shaft, 0.35);
  outline(box(0.82, 0.25, 0.82, mat.sand, [x, height - 0.06, z], parent), 0.5);
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

function guard(parent: THREE.Object3D): { arm: THREE.Group; paper: THREE.Mesh } {
  const figure = new THREE.Group();
  figure.position.set(2.5, 0, -0.8);
  parent.add(figure);
  shadowBlob(2.65, -0.65, 0.55, 0.3, parent);
  for (const side of [-1, 1]) {
    box(0.22, 0.7, 0.24, mat.ink, [side * 0.17, 0.39, 0], figure);
    box(0.28, 0.13, 0.36, mat.darkGold, [side * 0.17, 0.07, 0.07], figure);
  }
  const coat = box(0.74, 0.86, 0.34, mat.door, [0, 1.16, 0], figure);
  silhouette(coat, 1.025);
  box(0.12, 0.82, 0.36, mat.sand, [0, 1.17, 0.02], figure);
  box(0.22, 0.11, 0.04, mat.coral, [0.22, 1.38, 0.2], figure);
  const head = mesh(new THREE.IcosahedronGeometry(0.28, 1), mat.sand, [0, 1.82, 0.03], figure);
  silhouette(head, 1.035);
  box(0.62, 0.19, 0.56, mat.ink, [0, 2.12, 0.02], figure);
  box(0.75, 0.045, 0.4, mat.ink, [0, 2.02, 0.2], figure);
  let givingArm: THREE.Group | null = null;
  let paper: THREE.Mesh | null = null;
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.49, 1.48, 0);
    figure.add(arm);
    box(0.2, 0.7, 0.23, mat.door, [0, -0.36, 0], arm);
    mesh(new THREE.IcosahedronGeometry(0.11, 0), mat.sand, [0, -0.74, 0], arm);
    if (side === -1) {
      paper = box(0.34, 0.42, 0.026, mat.cream, [0, -0.81, 0.16], arm);
      paper.visible = false;
      givingArm = arm;
    }
  }
  return { arm: givingArm!, paper: paper! };
}

export function createMuseumScene(): MuseumWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x89d9cd);
  scene.fog = new THREE.Fog(0x89d9cd, 40, 78);
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const sun = new THREE.DirectionalLight(0xffffff, 1.55);
  sun.position.set(-9, 16, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);

  const ground = mesh(new THREE.PlaneGeometry(110, 110), mat.sage, [0, -0.02, 0], scene);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  box(34, 0.08, 34, mat.cream, [0, 0.02, 12], scene).castShadow = false;
  for (const z of [2, 7, 12, 17, 22, 27]) {
    box(32, 0.015, 0.055, mat.sand, [0, 0.07, z], scene).castShadow = false;
  }
  box(5.3, 0.018, 24, mat.stone, [2.2, 0.07, 9], scene).castShadow = false;
  pyramid(scene, -3, 8);
  for (const [x, z, seed] of [[-13, 2, 1], [13, 2, 2], [-13, 16, 3], [13, 16, 4]] as const) {
    tree(scene, x, z, seed);
  }

  // The facade has a real opening; its panels slide away after the guard's handoff.
  for (const side of [-1, 1]) {
    const wall = box(11, 4.7, 0.75, mat.cream, [side * 7, 2.75, -3.9], scene);
    silhouette(wall, 1.006);
    outline(wall, 0.4);
    for (const x of [side * 6.5, side * 9.7]) {
      outline(box(1.2, 2.2, 0.07, mat.door, [x, 2.15, -3.48], scene), 0.65);
      box(0.08, 2.1, 0.09, mat.sand, [x, 2.15, -3.42], scene);
    }
    for (const x of [side * 2.25, side * 5.1]) column(scene, x, -3.1);
  }
  outline(box(4, 1.06, 0.82, mat.cream, [0, 4.56, -3.9], scene), 0.55);
  outline(box(25, 0.34, 1.25, mat.stone, [0, 5.25, -3.9], scene), 0.55);
  outline(box(26, 0.17, 1.45, mat.sand, [0, 5.54, -3.9], scene), 0.55);
  const pediment = new THREE.Shape();
  pediment.moveTo(-10.7, 5.65);
  pediment.lineTo(10.7, 5.65);
  pediment.lineTo(0, 7.3);
  pediment.closePath();
  outline(mesh(new THREE.ExtrudeGeometry(pediment, { depth: 0.35, bevelEnabled: false }), mat.cream, [0, 0, -4.3], scene), 0.6);
  sign(scene, 'MUSEO DEL TIEMPO', [0, 4.48, -3.45], 3.45);
  const leftDoor = box(1.45, 3.36, 0.16, mat.door, [-0.73, 2.15, -3.5], scene);
  const rightDoor = box(1.45, 3.36, 0.16, mat.door, [0.73, 2.15, -3.5], scene);
  outline(leftDoor, 0.7);
  outline(rightDoor, 0.7);
  for (const side of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.07, 8, 6), mat.gold, [-side * 0.51, -0.15, 0.14], side === -1 ? leftDoor : rightDoor);
  }

  const attendant = guard(scene);

  // The hall leads into a two-sided gallery of ten visitable rooms.
  box(17, 0.14, 18, mat.stone, [0, 0.02, -12.4], scene).castShadow = false;
  box(2.7, 0.018, 16, mat.sage, [0, 0.11, -12.2], scene).castShadow = false;
  for (const side of [-1, 1]) {
    outline(box(0.56, 5.5, 18, mat.cream, [side * 8.55, 2.75, -12.4], scene), 0.38);
    box(0.06, 1.1, 17.8, mat.sage, [side * 8.24, 0.67, -12.4], scene);
    for (const z of [-8, -13.2, -18.4]) {
      column(scene, side * 6.4, z, 4.65);
      outline(box(1.35, 0.73, 1.2, mat.sand, [side * 5.3, 0.46, z - 0.5], scene), 0.5);
      mesh(new THREE.CylinderGeometry(0.2, 0.34, 0.38, 7), mat.stone, [side * 5.3, 1.02, z - 0.5], scene);
      const bust = mesh(new THREE.IcosahedronGeometry(0.32, 1), mat.stone, [side * 5.3, 1.49, z - 0.5], scene);
      silhouette(bust, 1.025);
      outline(box(0.05, 2.2, 2.1, mat.door, [side * 8.19, 2.45, z], scene), 0.38);
    }
  }
  displayCase(scene, -3.9, -10.4);
  displayCase(scene, 3.9, -15.6);
  for (const side of [-1, 1]) {
    outline(box(6.35, 5.5, 0.65, mat.cream, [side * 5.325, 2.75, -21.45], scene), 0.4);
    outline(box(0.27, 3.75, 0.8, mat.sand, [side * 2.15, 1.88, -21.36], scene), 0.5);
  }
  outline(box(4.3, 1.75, 0.65, mat.cream, [0, 4.63, -21.45], scene), 0.4);
  sign(scene, 'GALERÍAS 01—10', [0, 4.58, -21.08], 3.15);
  box(17, 0.3, 18, mat.sand, [0, 5.5, -12.4], scene).receiveShadow = false;
  for (const z of [-7, -12, -17]) {
    box(8.7, 0.12, 0.55, mat.stone, [0, 5.25, z], scene);
    const bulb = mesh(new THREE.IcosahedronGeometry(0.13, 0), mat.cream, [0, 4.97, z], scene);
    bulb.castShadow = false;
    const light = new THREE.PointLight(0xffecd1, 0.72, 10);
    light.position.set(0, 4.7, z);
    scene.add(light);
  }
  const gallery = createGallery(scene);
  const romeRoom = gallery.rooms.find((room) => room.id === 'roma')!;
  const romeLight = new THREE.PointLight(0xffad69, 0, 11);
  romeLight.position.set(romeRoom.center.x, 3.3, romeRoom.center.y);
  scene.add(romeLight);
  const romeGlow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshBasicMaterial({ color: 0xffc28b, transparent: true, opacity: 0, depthWrite: false }));
  romeGlow.rotation.x = -Math.PI / 2;
  romeGlow.scale.set(1.25, 1.1, 1);
  romeGlow.position.set(romeRoom.side * 2.9, 0.14, romeRoom.center.y);
  scene.add(romeGlow);

  const doorBlock: Collider = { minX: -1.48, maxX: 1.48, minZ: -4.25, maxZ: -3.3 };
  const colliders: Collider[] = [
    { minX: -12.5, maxX: -1.48, minZ: -4.4, maxZ: -3.48 },
    { minX: 1.48, maxX: 12.5, minZ: -4.4, maxZ: -3.48 },
    doorBlock,
    { minX: -6.4, maxX: 0.4, minZ: 4.6, maxZ: 11.4 },
    { minX: 2.07, maxX: 2.93, minZ: -1.15, maxZ: -0.45 },
    { minX: -8.9, maxX: -8.2, minZ: -21.5, maxZ: -3.5 },
    { minX: 8.2, maxX: 8.9, minZ: -21.5, maxZ: -3.5 },
    { minX: -8.5, maxX: -2.02, minZ: -21.9, maxZ: -21.1 },
    { minX: 2.02, maxX: 8.5, minZ: -21.9, maxZ: -21.1 },
    { minX: -4.55, maxX: -3.25, minZ: -10.93, maxZ: -9.87 },
    { minX: 3.25, maxX: 4.55, minZ: -16.13, maxZ: -15.07 },
  ];
  colliders.push(...gallery.colliders);
  for (const [x, z] of [[-13, 2], [13, 2], [-13, 16], [13, 16]]) {
    colliders.push({ minX: x - 0.32, maxX: x + 0.32, minZ: z - 0.32, maxZ: z + 0.32 });
  }
  for (const side of [-1, 1]) {
    for (const x of [side * 2.25, side * 5.1]) {
      colliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: -3.56, maxZ: -2.67 });
    }
    for (const z of [-8, -13.2, -18.4]) {
      colliders.push({ minX: side * 6.4 - 0.45, maxX: side * 6.4 + 0.45, minZ: z - 0.45, maxZ: z + 0.45 });
      colliders.push({ minX: side * 5.3 - 0.68, maxX: side * 5.3 + 0.68, minZ: z - 1.1, maxZ: z + 0.1 });
    }
  }
  let entranceOpening = false;
  let entranceProgress = 0;
  let handoffTime = 0;
  let romeVisible = false;
  let romeProgress = 0;

  return {
    scene,
    colliders,
    guard: new THREE.Vector3(2.5, 1.45, -0.8),
    rooms: gallery.rooms,
    roomAt: (position) => gallery.rooms.find((room) => (
      Math.abs(position.y - room.center.y) < 2.02
      && (room.side < 0 ? position.x < -2.42 && position.x > -8.34 : position.x > 2.42 && position.x < 8.34)
    )) ?? null,
    openEntrance: () => {
      entranceOpening = true;
      handoffTime = 0.001;
      attendant.paper.visible = true;
    },
    revealRome: () => {
      romeVisible = true;
    },
    update: (delta) => {
      if (entranceOpening && entranceProgress < 1) {
        entranceProgress = Math.min(1, entranceProgress + delta * 1.3);
        leftDoor.position.x = -0.73 - entranceProgress * 1.45;
        rightDoor.position.x = 0.73 + entranceProgress * 1.45;
        if (entranceProgress === 1) colliders.splice(colliders.indexOf(doorBlock), 1);
      }
      if (handoffTime > 0) {
        handoffTime += delta;
        const raised = Math.min(handoffTime / 0.4, 1);
        const lowered = Math.max(0, 1 - (handoffTime - 1.1) / 0.7);
        attendant.arm.rotation.x = -1.05 * Math.min(raised, lowered);
        if (handoffTime > 1.1) {
          attendant.paper.visible = false;
        }
        if (handoffTime > 1.8) {
          attendant.arm.rotation.x = 0;
          handoffTime = 0;
        }
      }
      if (romeVisible && romeProgress < 1) {
        romeProgress = Math.min(1, romeProgress + delta * 0.8);
        romeLight.intensity = romeProgress * 4.2;
        (romeGlow.material as THREE.MeshBasicMaterial).opacity = romeProgress * 0.27;
      }
    },
  };
}
