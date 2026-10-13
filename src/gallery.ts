import * as THREE from 'three';
import { areaCatalog, areaOrder, availabilityCopy, type AreaId } from './catalog';
import type { Collider } from './scene';
import { box, inkStroke, mesh, outline, palette, toon } from './visual';

export type GalleryRoom = {
  id: AreaId;
  number: number;
  root: THREE.Group;
  center: THREE.Vector2;
};

export type GalleryDoor = {
  target: AreaId | null;
  required: AreaId | null;
  position: THREE.Vector2;
  panels: [THREE.Mesh, THREE.Mesh];
  blocker: Collider;
  axis: 'x' | 'z';
  progress: number;
  elapsed: number;
  opening: boolean;
  room: GalleryRoom | null;
};

export const galleryLayout = {
  frontZ: -21.45,
  step: 12.4,
  wingX: 5.1,
  innerX: 1.65,
} as const;
const { frontZ, step, wingX, innerX } = galleryLayout;
const firstZ = frontZ - step / 2;
const backZ = frontZ - step * 5;
const wingWidth = (wingX - innerX) * 2;

function roomSign(id: AreaId, number: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const context = canvas.getContext('2d')!;
  const area = areaCatalog[id];
  context.fillStyle = '#f7f2e5';
  context.fillRect(0, 0, 1024, 320);
  context.fillStyle = area.accent;
  context.fillRect(0, 0, 206, 320);
  context.strokeStyle = '#354044';
  context.lineWidth = 12;
  context.strokeRect(6, 6, 1012, 308);
  context.fillStyle = '#354044';
  context.font = 'bold 132px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(number).padStart(2, '0'), 103, 157);
  context.textAlign = 'left';
  context.font = 'bold 54px sans-serif';
  const lines = [''];
  for (const word of area.name.toUpperCase().split(' ')) {
    const line = lines[lines.length - 1];
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > 745) lines.push(word);
    else lines[lines.length - 1] = next;
  }
  lines.slice(0, 2).forEach((line, index) => context.fillText(line, 232, lines.length === 1 ? 142 : 103 + index * 70));
  context.font = 'bold 29px sans-serif';
  context.fillStyle = '#6d8077';
  context.fillText(availabilityCopy(area.availability).sign, 235, 255);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGallery(scene: THREE.Scene): {
  rooms: GalleryRoom[];
  doors: GalleryDoor[];
  colliders: Collider[];
  photoSolids: THREE.Object3D[];
  update: (delta: number) => void;
} {
  const rooms: GalleryRoom[] = [];
  const doors: GalleryDoor[] = [];
  const colliders: Collider[] = [];
  const photoSolids: THREE.Object3D[] = [];
  const stone = toon(palette.stone);
  const cream = toon(palette.cream);
  const trim = toon(palette.sand);
  const doorMaterial = toon(palette.ink);
  const dark = new THREE.Color(0x26363c);

  function wall(width: number, depth: number, x: number, z: number): void {
    const surface = box(width, 3.9, depth, cream, [x, 1.95, z], scene);
    surface.castShadow = surface.receiveShadow = false;
    photoSolids.push(surface);
    colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
  }

  function portal(axis: 'x' | 'z', x: number, z: number, target: AreaId | null, required: AreaId | null, closed = true): void {
    const span = axis === 'z' ? wingWidth : step;
    const opening = 2.3;
    const piece = (span - opening) / 2;
    for (const side of [-1, 1]) {
      const offset = side * (opening + piece) / 2;
      if (axis === 'z') wall(piece, 0.28, x + offset, z);
      else wall(0.28, piece, x, z + offset);
      const post = axis === 'z'
        ? box(0.17, 3, 0.36, trim, [x + side * 1.22, 1.5, z], scene)
        : box(0.36, 3, 0.17, trim, [x, 1.5, z + side * 1.22], scene);
      post.castShadow = post.receiveShadow = false;
      outline(post, 0.35);
    }
    const lintel = axis === 'z'
      ? box(opening, 0.9, 0.34, trim, [x, 3.45, z], scene)
      : box(0.34, 0.9, opening, trim, [x, 3.45, z], scene);
    lintel.castShadow = lintel.receiveShadow = false;
    outline(lintel, 0.3);
    if (!closed) return;

    const panels = [-1, 1].map((side) => {
      const panel = axis === 'z'
        ? box(1.145, 2.96, 0.15, doorMaterial, [x + side * 0.575, 1.49, z], scene)
        : box(0.15, 2.96, 1.145, doorMaterial, [x, 1.49, z + side * 0.575], scene);
      panel.castShadow = false;
      outline(panel, 0.45);
      photoSolids.push(panel);
      return panel;
    }) as [THREE.Mesh, THREE.Mesh];
    const blocker: Collider = axis === 'z'
      ? { minX: x - opening / 2, maxX: x + opening / 2, minZ: z - 0.13, maxZ: z + 0.13 }
      : { minX: x - 0.13, maxX: x + 0.13, minZ: z - opening / 2, maxZ: z + opening / 2 };
    colliders.push(blocker);
    doors.push({ target, required, position: new THREE.Vector2(x, z), panels, blocker, axis, progress: 0, elapsed: 0, opening: false, room: null });

    if (target) {
      const sign = mesh(new THREE.PlaneGeometry(2.55, 0.8),
        new THREE.MeshBasicMaterial({ map: roomSign(target, areaOrder.indexOf(target) + 1), side: THREE.DoubleSide }),
        axis === 'z' ? [x, 3.45, z + (x < 0 ? 0.19 : -0.19)] : [x - 0.19, 3.45, z], scene);
      if (axis === 'x') sign.rotation.y = Math.PI / 2;
      sign.castShadow = false;
    }
  }

  // Five rooms descend the left wing; five return along the right wing.
  for (const side of [-1, 1] as const) {
    const x = side * wingX;
    box(wingWidth + 0.2, 0.14, step * 5 + 0.2, stone, [x, 0.02, (frontZ + backZ) / 2], scene).castShadow = false;
    box(wingWidth + 0.2, 0.2, step * 5 + 0.2, trim, [x, 4.02, (frontZ + backZ) / 2], scene).castShadow = false;
    wall(0.32, step * 5 + 0.2, side * 8.55, (frontZ + backZ) / 2);
    wall(0.28, step * 4, side * innerX, frontZ - step * 2);
    for (let boundary = 1; boundary < 5; boundary++) {
      const targetIndex = side < 0 ? boundary : 10 - boundary;
      portal('z', x, frontZ - boundary * step, areaOrder[targetIndex], areaOrder[targetIndex - 1]);
    }
  }
  wall(innerX * 2, 0.28, 0, frontZ);
  wall(17.1, 0.28, 0, backZ);
  box(innerX * 2, 0.14, step, stone, [0, 0.02, firstZ - step * 4], scene).castShadow = false;
  box(innerX * 2, 0.2, step, trim, [0, 4.02, firstZ - step * 4], scene).castShadow = false;

  areaOrder.forEach((id, index) => {
    const left = index < 5;
    const row = left ? index : 9 - index;
    const x = left ? -wingX : wingX;
    const z = firstZ - row * step;
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    root.userData.areaId = id;
    root.userData.roomNumber = index + 1;
    scene.add(root);
    const accent = new THREE.Color(areaCatalog[id].accent);
    const litSurface = new THREE.Color(0xede4d1).lerp(accent, 0.14);
    const surface = new THREE.MeshBasicMaterial({ color: dark.clone() });
    const floor = box(wingWidth - 0.16, 0.014, step - 0.24, surface, [0, 0.12, 0], root);
    floor.castShadow = floor.receiveShadow = false;
    for (const seamZ of [-2, -1, 0, 1, 2].map((part) => part * step / 5)) {
      box(wingWidth - 0.38, 0.008, 0.045, trim, [0, 0.135, seamZ], root).castShadow = false;
    }
    const back = box(0.055, 2.6, step - 0.35, surface, [left ? -wingWidth / 2 + 0.05 : wingWidth / 2 - 0.05, 1.58, 0], root);
    back.castShadow = back.receiveShadow = false;
    const stripe = box(0.07, 0.11, step - 0.4, trim, [left ? -wingWidth / 2 + 0.09 : wingWidth / 2 - 0.09, 2.96, 0], root);
    stripe.castShadow = stripe.receiveShadow = false;
    outline(stripe, 0.35);
    const wallX = left ? -wingWidth / 2 + 0.1 : wingWidth / 2 - 0.1;
    inkStroke([[wallX, 0.51, -step / 2 + 0.45], [wallX, 0.55, -0.6], [wallX, 0.52, step / 2 - 0.45]], root, 0.35);
    const lamp = mesh(new THREE.IcosahedronGeometry(0.23, 0), new THREE.MeshBasicMaterial({ color: dark.clone() }), [0, 3.58, 0], root);
    lamp.castShadow = false;
    const light = new THREE.PointLight(0xffedce, 0, 9);
    light.position.set(0, 3.35, 0);
    root.add(light);
    const insideSign = mesh(new THREE.PlaneGeometry(3.3, 1.03),
      new THREE.MeshBasicMaterial({ map: roomSign(id, index + 1), side: THREE.DoubleSide }),
      [left ? -wingWidth / 2 + 0.09 : wingWidth / 2 - 0.09, 1.9, 0], root);
    insideSign.rotation.y = Math.PI / 2;
    insideSign.visible = false;
    rooms.push({ id, number: index + 1, root, center: new THREE.Vector2(x, z) });
    root.userData.setLight = (strength: number) => {
      surface.color.copy(dark).lerp(litSurface, strength);
      (lamp.material as THREE.MeshBasicMaterial).color.copy(dark).lerp(new THREE.Color(0xfff0c8), strength);
      light.intensity = strength * 3;
      insideSign.visible = strength > 0.08;
    };
  });

  portal('z', -wingX, frontZ, areaOrder[0], null);
  portal('z', wingX, frontZ, null, areaOrder[9]);
  portal('x', -innerX, firstZ - step * 4, areaOrder[5], areaOrder[4]);
  portal('x', innerX, firstZ - step * 4, null, null, false);
  for (const door of doors) {
    if (door.target) door.room = rooms.find((room) => room.id === door.target)!;
  }

  return {
    rooms, doors, colliders, photoSolids,
    update: (delta) => {
      const stepDelta = Math.min(delta, 0.12);
      for (const door of doors) {
        if (!door.opening) continue;
        door.elapsed += stepDelta;
        door.progress = Math.min(1, door.progress + stepDelta * 1.25);
        door.panels.forEach((panel, index) => {
          const offset = (index === 0 ? -1 : 1) * (0.575 + door.progress * 1.17);
          if (door.axis === 'z') panel.position.x = door.position.x + offset;
          else panel.position.z = door.position.y + offset;
        });
        if (door.progress === 1) {
          const index = colliders.indexOf(door.blocker);
          if (index !== -1) colliders.splice(index, 1);
        }
        const time = door.elapsed * 1.25;
        const strength = time < 0.48 ? 0 : time < 0.61 ? 0.9 : time < 0.73 ? 0.06
          : time < 0.88 ? 0.55 : time < 1.01 ? 0.04 : time < 1.2 ? 1 : time < 1.32 ? 0.1 : 1;
        if (door.room) (door.room.root.userData.setLight as (strength: number) => void)(strength);
        if (time > 1.55) door.opening = false;
      }
    },
  };
}
