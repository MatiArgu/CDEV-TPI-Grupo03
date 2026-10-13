import * as THREE from 'three';
import type { AreaId } from './catalog';
import type { GalleryRoom } from './gallery';
import { createRouteHelp } from './help';
import type { Collider } from './scene';
import { box, inkStroke, materials as mat, mesh, outline, palette, toon } from './visual';

type HelmetMaterials = { gold: THREE.Material; dark: THREE.Material; coral: THREE.Material; ink: THREE.Material };

function helmet(parent: THREE.Object3D, position: [number, number, number], colors: HelmetMaterials): THREE.Group {
  const root = new THREE.Group();
  root.position.set(...position);
  parent.add(root);
  const dome = mesh(new THREE.SphereGeometry(0.53, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), colors.gold, [0, 0.12, 0], root);
  dome.scale.z = 0.88;
  outline(dome, 0.75);
  outline(box(1.12, 0.12, 0.91, colors.dark, [0, 0.12, 0.02], root), 0.6);
  box(0.74, 0.37, 0.06, colors.ink, [0, -0.16, 0.42], root);
  for (const side of [-1, 1]) {
    outline(box(0.22, 0.49, 0.17, colors.gold, [side * 0.43, -0.22, 0.4], root), 0.7);
    mesh(new THREE.SphereGeometry(0.055, 7, 5), colors.coral, [side * 0.44, 0.02, 0.52], root);
  }
  outline(box(0.13, 0.57, 0.13, colors.gold, [0, -0.22, 0.5], root), 0.65);
  box(0.13, 0.16, 0.86, colors.dark, [0, 0.65, -0.06], root);
  for (let i = 0; i < 7; i++) {
    const crest = mesh(new THREE.ConeGeometry(0.15, 0.48 - Math.abs(i - 3) * 0.035, 4), colors.coral, [0, 0.92, -0.4 + i * 0.13], root);
    crest.rotation.z = 0.12;
  }
  return root;
}

export function installRomeExhibit(room: GalleryRoom): { artifact: THREE.Object3D; photoSolids: THREE.Object3D[]; colliders: Collider[] } {
  const root = room.root;
  const base = box(1.7, 0.78, 1.5, mat.sand, [0, 0.52, -0.45], root);
  outline(base, 0.65);
  const top = box(1.9, 0.14, 1.67, mat.stone, [0, 0.98, -0.45], root);
  outline(top, 0.7);
  const artifact = helmet(root, [0, 1.48, -0.45], { gold: mat.gold, dark: mat.darkGold, coral: mat.coral, ink: mat.ink });
  box(2.6, 0.025, 7.2, mat.coral, [0, 0.15, 1.95], root).castShadow = false;
  for (const side of [-1, 1]) {
    const x = side * 2.55;
    outline(box(0.48, 2.7, 0.48, mat.stone, [x, 1.48, -3.25], root), 0.3);
    outline(box(0.72, 0.2, 0.72, mat.sand, [x, 2.9, -3.25], root), 0.5);
    const shield = mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.09, 10), mat.coral, [x, 1.5, 2.15], root);
    shield.rotation.x = Math.PI / 2;
    outline(shield, 0.8);
    mesh(new THREE.SphereGeometry(0.12, 8, 6), mat.gold, [x, 1.5, 2.23], root);
  }
  const collider = {
    minX: room.center.x - 0.95, maxX: room.center.x + 0.95,
    minZ: room.center.y - 1.3, maxZ: room.center.y + 0.4,
  };
  return { artifact, photoSolids: [base, top], colliders: [collider] };
}

function ship(parent: THREE.Object3D, x: number, z: number, side: number, wood: THREE.Material, sail: THREE.Material): void {
  const vessel = new THREE.Group();
  vessel.position.set(x, 0, z);
  vessel.rotation.y = side * 0.28;
  parent.add(vessel);
  const hull = mesh(new THREE.SphereGeometry(1, 9, 5), wood, [0, 0.28, 0], vessel);
  hull.scale.set(1.6, 0.48, 4.3);
  outline(hull, 0.55);
  box(2.4, 0.12, 5.8, wood, [0, 0.56, 0], vessel);
  mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.4, 7), wood, [0, 2.7, 0], vessel);
  const cloth = new THREE.Shape();
  cloth.moveTo(-1.25, 0);
  cloth.lineTo(1.25, 0);
  cloth.lineTo(0.18, 2.6);
  cloth.closePath();
  sail.side = THREE.DoubleSide;
  const canvas = mesh(new THREE.ShapeGeometry(cloth), sail, [0, 1.9, 0], vessel);
  outline(canvas, 0.45);
  inkStroke([[-1.25, 1.9, 0.03], [0.18, 4.5, 0.03], [1.25, 1.9, 0.03]], vessel, 0.65);
  box(0.48, 0.58, 0.42, sail, [0.75, 0.92, 1.6], vessel);
  mesh(new THREE.IcosahedronGeometry(0.22, 0), sail, [0.75, 1.3, 1.6], vessel);
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
  scene.background = new THREE.Color(0xc9d8c8);
  scene.fog = new THREE.Fog(0xc9d8c8, 36, 73);
  scene.add(new THREE.AmbientLight(0xffffff, 1.35));
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
  const flood = mesh(new THREE.PlaneGeometry(44, 36), water, [0, 0.015, -6], scene);
  flood.rotation.x = -Math.PI / 2;
  flood.castShadow = false;
  for (const radius of [22, 24.5, 27]) {
    const tier = mesh(new THREE.TorusGeometry(radius, 0.35, 4, 44), radius === 24.5 ? stone : trim, [0, radius === 22 ? 0.9 : radius === 24.5 ? 3.1 : 5.9, -6], scene);
    tier.rotation.x = Math.PI / 2;
    tier.scale.y = 0.78;
    tier.castShadow = false;
  }
  for (let i = 0; i < 32; i++) {
    const angle = i / 32 * Math.PI * 2;
    const x = Math.cos(angle) * 24.5;
    const z = -6 + Math.sin(angle) * 19.1;
    const pillar = box(1.2, 5.8, 1.25, stone, [x, 3.1, z], scene);
    pillar.rotation.y = -angle;
    if (i % 4 === 0) outline(pillar, 0.3);
    box(1.5, 0.25, 1.5, trim, [x, 6.05, z], scene);
  }

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
  for (const z of [-1, -11]) {
    const figureX = z === -1 ? -8 : 9;
    box(0.65, 1.02, 0.43, coral, [figureX, 1.23, z], scene);
    mesh(new THREE.IcosahedronGeometry(0.29, 1), stone, [figureX, 1.95, z], scene);
    const shield = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 9), coral, [figureX + 0.48, 1.34, z + 0.07], scene);
    shield.rotation.z = Math.PI / 2;
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
        geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      scene.clear();
    },
  };
}
