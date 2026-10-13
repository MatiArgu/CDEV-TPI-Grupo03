import * as THREE from 'three';
import { areaCatalog, areaOrder, type AreaId } from './catalog';
import type { Collider } from './scene';
import { box, mesh, outline, palette, toon } from './visual';

export type GalleryRoom = {
  id: AreaId;
  number: number;
  root: THREE.Group;
  center: THREE.Vector2;
  side: -1 | 1;
};

const firstRowZ = -23.9;
const rowStep = 4.3;
const innerWallX = 2.25;
const outerWallX = 8.55;

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
  const words = area.name.toUpperCase().split(' ');
  const lines = [''];
  for (const word of words) {
    const line = lines[lines.length - 1];
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > 745) lines.push(word);
    else lines[lines.length - 1] = next;
  }
  lines.slice(0, 2).forEach((line, index) => context.fillText(line, 232, lines.length === 1 ? 142 : 103 + index * 70));
  context.font = 'bold 29px sans-serif';
  context.fillStyle = '#6d8077';
  context.fillText('EN PREPARACIÓN · WIP', 235, 255);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGallery(scene: THREE.Scene): { rooms: GalleryRoom[]; colliders: Collider[] } {
  const rooms: GalleryRoom[] = [];
  const colliders: Collider[] = [];
  const wallMaterial = toon(palette.cream);
  const floorMaterial = toon(palette.stone);
  const trimMaterial = toon(palette.sand);

  function wall(width: number, height: number, depth: number, x: number, y: number, z: number): void {
    box(width, height, depth, wallMaterial, [x, y, z], scene);
    colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
  }

  box(17.3, 0.14, 22.5, floorMaterial, [0, 0.02, -32.45], scene).castShadow = false;
  box(4.35, 0.018, 22.2, toon(palette.sage), [0, 0.1, -32.45], scene).castShadow = false;
  box(17.3, 0.2, 22.5, trimMaterial, [0, 4.02, -32.45], scene).castShadow = false;
  for (const side of [-1, 1] as const) {
    wall(0.32, 3.9, 22.1, side * outerWallX, 1.95, -32.5);
    for (let boundary = 0; boundary <= 5; boundary++) {
      const z = firstRowZ + rowStep / 2 - boundary * rowStep;
      wall(6.3, 3.9, 0.22, side * 5.4, 1.95, z);
    }
  }
  wall(4.35, 3.9, 0.28, 0, 1.95, firstRowZ - 4 * rowStep - rowStep / 2);

  for (let row = 0; row < 5; row++) {
    const z = firstRowZ - row * rowStep;
    const lamp = mesh(new THREE.IcosahedronGeometry(0.16, 0), toon(palette.cream), [0, 3.69, z], scene);
    lamp.castShadow = false;
    const light = new THREE.PointLight(0xffead0, 0.85, 8);
    light.position.set(0, 3.47, z);
    scene.add(light);
    box(4.1, 0.012, 0.055, trimMaterial, [0, 0.12, z + rowStep / 2], scene).castShadow = false;
  }

  areaOrder.forEach((id, index) => {
    const side: -1 | 1 = index % 2 === 0 ? -1 : 1;
    const z = firstRowZ - Math.floor(index / 2) * rowStep;
    const number = index + 1;
    const root = new THREE.Group();
    root.position.set(side * 5.4, 0, z);
    root.userData.areaId = id;
    root.userData.roomNumber = number;
    scene.add(root);
    const accent = toon(areaCatalog[id].accent);

    box(5.85, 0.014, 3.94, accent, [0, 0.12, 0], root).castShadow = false;
    box(0.065, 2.48, 3.78, accent, [side * 2.93, 1.61, 0], root);
    const backStripe = box(0.08, 0.1, 3.9, trimMaterial, [side * 2.87, 2.94, 0], root);
    outline(backStripe, 0.35);
    for (const offset of [-1.525, 1.525]) {
      wall(0.29, 3.9, 1.25, side * innerWallX, 1.95, z + offset);
    }
    box(0.34, 0.9, 1.8, trimMaterial, [-side * 3.15, 3.45, 0], root);
    for (const offset of [-0.94, 0.94]) {
      outline(box(0.32, 2.9, 0.14, trimMaterial, [-side * 3.15, 1.45, offset], root), 0.5);
    }

    const texture = roomSign(id, number);
    const signMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const signRotation = -side * Math.PI / 2;
    const corridorSign = mesh(new THREE.PlaneGeometry(2.55, 0.8), signMaterial, [-side * 3.33, 3.31, 0], root);
    corridorSign.rotation.y = signRotation;
    corridorSign.castShadow = false;
    const insideSign = mesh(new THREE.PlaneGeometry(3.4, 1.0625), signMaterial, [side * 2.82, 1.95, 0], root);
    insideSign.rotation.y = signRotation;
    insideSign.castShadow = false;

    const center = new THREE.Vector2(root.position.x, z);
    rooms.push({ id, number, root, center, side });
  });

  return { rooms, colliders };
}
