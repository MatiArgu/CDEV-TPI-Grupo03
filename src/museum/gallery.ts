import * as THREE from 'three';
import { areaCatalog, areaOrder, availabilityCopy, type AreaId } from '../game/catalog';
import type { Collider } from '../game/collision';
import { exhibition, stoneFloor, museumWallMaterial, wallPanels } from './exhibition';
import { galleryLayout, museumLayout, roomSlots } from './museumLayout';
import { box, inkStroke, mesh, outline, toon } from '../rendering/visual';

export type GalleryRoom = {
  id: AreaId;
  number: number;
  root: THREE.Group;
  center: THREE.Vector2;
  width: number;
  depth: number;
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

const { frontZ, step, wingX, innerX } = galleryLayout;
const backZ = museumLayout.backZ;
const wingWidth = (wingX - innerX) * 2;
const outerX = museumLayout.halfWidth;

function roomSign(id: AreaId, number: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const context = canvas.getContext('2d')!;
  const area = areaCatalog[id];
  context.fillStyle = '#252d29';
  context.fillRect(0, 0, 1024, 320);
  context.fillStyle = area.accent;
  context.fillRect(30, 275, 154, 4);
  context.strokeStyle = '#d9cba9';
  context.lineWidth = 2;
  context.strokeRect(6, 6, 1012, 308);
  context.fillStyle = '#d9cba9';
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
  context.fillStyle = '#aea48c';
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
  const stone = toon(exhibition.panel);
  const cream = museumWallMaterial();
  const trim = toon(exhibition.bronze);
  const doorMaterial = toon(exhibition.plinth);
  const dark = new THREE.Color(0x171d1a);

  function wall(width: number, depth: number, x: number, z: number): void {
    const surface = box(width, museumLayout.wallHeight, depth, cream, [x, museumLayout.wallHeight / 2, z], scene);
    surface.castShadow = surface.receiveShadow = true;
    photoSolids.push(surface);
    colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
  }

  function portal(axis: 'x' | 'z', x: number, z: number, target: AreaId | null, required: AreaId | null, closed = true): void {
    const span = axis === 'z' ? wingWidth : step;
    const opening = 2.3;
    const threshold = axis === 'z'
      ? box(opening + 0.1, 0.08, 0.6, stone, [x, 0.125, z], scene)
      : box(0.6, 0.08, opening + 0.1, stone, [x, 0.125, z], scene);
    threshold.castShadow = false;
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
    const upper = axis === 'z'
      ? box(opening, 1.5, 0.28, cream, [x, 4.65, z], scene)
      : box(0.28, 1.5, opening, cream, [x, 4.65, z], scene);
    photoSolids.push(upper);
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
      sign.rotation.y = axis === 'x' ? -Math.PI / 2 : x > 0 ? Math.PI : 0;
      sign.castShadow = false;
    }
  }

  // Two longitudinal rooms on each wing, joined by one transverse gallery.
  const bridgeFront = frontZ - step * 2;
  for (const side of [-1, 1] as const) {
    const x = side * wingX;
    box(wingWidth + 0.2, 0.14, step * 2, stone, [x, 0.02, frontZ - step], scene).castShadow = false;
    box(wingWidth + 0.2, 0.2, step * 2, cream, [x, 5.5, frontZ - step], scene);
    wall(museumLayout.wallThickness, frontZ - backZ + 0.2, side * outerX, (frontZ + backZ) / 2);
    wall(0.28, step * 2, side * innerX, frontZ - step);
    const targetIndex = side < 0 ? 1 : 4;
    portal('z', x, frontZ - step, areaOrder[targetIndex], null);
    portal('z', x, bridgeFront, areaOrder[side < 0 ? 2 : 3], null);
  }
  wall(innerX * 2, 0.28, 0, frontZ);
  wall(innerX * 2, 0.28, 0, bridgeFront);
  wall(outerX * 2, 0.28, 0, backZ);
  box(outerX * 2, 0.14, galleryLayout.bridgeDepth, stone, [0, 0.02, (bridgeFront + backZ) / 2], scene).castShadow = false;
  box(outerX * 2, 0.2, galleryLayout.bridgeDepth, cream, [0, 5.5, (bridgeFront + backZ) / 2], scene);

  areaOrder.forEach((id, index) => {
    const { x, z, width, depth } = roomSlots[index];
    const left = x <= 0;
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    root.userData.areaId = id;
    root.userData.roomNumber = index + 1;
    scene.add(root);
    wallPanels(root, width, depth);
    const accent = new THREE.Color(areaCatalog[id].accent);
    const litSurface = new THREE.Color(exhibition.wall).lerp(accent, 0.035);
    const surface = new THREE.MeshBasicMaterial({ color: dark.clone() });
    const floor = box(width - 0.16, 0.014, depth - 0.24, surface, [0, 0.12, 0], root);
    floor.castShadow = floor.receiveShadow = false;
    stoneFloor(root, width - 0.2, depth - 0.28, 0, 0, museumLayout.floorY);
    for (const side of [-1, 1]) {
      box(0.045, 0.014, depth - 0.35, trim, [side * (width / 2 - 0.31), 0.17, 0], root).castShadow = false;
      box(0.07, 0.2, depth - 0.35, doorMaterial, [side * (width / 2 - 0.18), 0.26, 0], root);
      box(0.09, 0.13, depth - 0.35, trim, [side * (width / 2 - 0.18), 5.08, 0], root);
    }
    const stripe = box(0.07, 0.11, depth - 0.4, trim, [left ? -width / 2 + 0.09 : width / 2 - 0.09, 2.96, 0], root);
    stripe.castShadow = stripe.receiveShadow = false;
    outline(stripe, 0.35);
    const wallX = left ? -width / 2 + 0.1 : width / 2 - 0.1;
    inkStroke([[wallX, 0.51, -depth / 2 + 0.45], [wallX, 0.55, -0.6], [wallX, 0.52, depth / 2 - 0.45]], root, 0.35);
    const lamp = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), new THREE.MeshBasicMaterial({ color: dark.clone() }), [0, 5.31, 3.5], root);
    lamp.castShadow = false;
    const light = new THREE.PointLight(0xffedce, 0, 9);
    // Keep the light list stable: opening doors changes intensity, not shader variants.
    light.position.set(0, 4.5, 3.5);
    root.add(light);
    const bridgeLights: THREE.PointLight[] = [];
    if (index === 2) for (const side of [-1, 1]) {
      const extra = new THREE.PointLight(0xffedce, 0, 12);
      extra.position.set(side * 7.5, 4.5, 0);
      root.add(extra);
      bridgeLights.push(extra);
      mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), new THREE.MeshBasicMaterial({ color: 0xe0c99c }), [side * 7.5, 5.31, 0], root);
    }
    const insideSign = mesh(new THREE.PlaneGeometry(3.3, 1.03),
      new THREE.MeshBasicMaterial({ map: roomSign(id, index + 1), side: THREE.DoubleSide }),
      [left ? -width / 2 + 0.3 : width / 2 - 0.3, 3.82, 0], root);
    insideSign.rotation.y = left ? Math.PI / 2 : -Math.PI / 2;
    insideSign.visible = false;
    rooms.push({ id, number: index + 1, root, center: new THREE.Vector2(x, z), width, depth });
    root.userData.setLight = (strength: number) => {
      surface.color.copy(dark).lerp(litSurface, strength);
      (lamp.material as THREE.MeshBasicMaterial).color.copy(dark).lerp(new THREE.Color(0xfff0c8), strength);
      light.intensity = strength * 5;
      bridgeLights.forEach((item) => { item.intensity = strength * 9; });
      insideSign.visible = strength > 0.08;
    };
  });

  portal('z', -wingX, frontZ, areaOrder[0], null);
  portal('z', wingX, frontZ, null, null);
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
