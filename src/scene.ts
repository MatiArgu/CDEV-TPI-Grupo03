import * as THREE from 'three';
import { box, inkStroke, irregularCrown, materials as mat, mesh, outline, shadowBlob, silhouette } from './visual';

export type Collider = { minX: number; maxX: number; minZ: number; maxZ: number };

export type StudyWorld = {
  scene: THREE.Scene;
  colliders: Collider[];
  exhibit: THREE.Vector3;
};

function archShape(radius: number, baseY: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-radius, 0);
  shape.lineTo(radius, 0);
  shape.lineTo(radius, baseY);
  shape.absarc(0, baseY, radius, 0, Math.PI, false);
  shape.lineTo(-radius, 0);
  return shape;
}

function paintedPatch(parent: THREE.Object3D, points: Array<[number, number]>, material: THREE.Material, height = 0.014): void {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], -points[0][1]);
  for (const [x, z] of points.slice(1)) shape.lineTo(x, -z);
  shape.closePath();
  const patch = mesh(new THREE.ShapeGeometry(shape), material, [0, height, 0], parent);
  patch.rotation.x = -Math.PI / 2;
  patch.castShadow = false;
  outline(patch, 0.32);
}

function makeColumn(parent: THREE.Object3D, x: number, z: number): void {
  shadowBlob(x + 0.15, z + 0.15, 0.66, 0.36, parent);
  outline(box(0.84, 0.23, 0.8, mat.sand, [x, 0.32, z], parent), 0.48);
  const shaft = mesh(new THREE.CylinderGeometry(0.29, 0.34, 2.56, 9), mat.stone, [x, 1.7, z], parent);
  silhouette(shaft, 1.02);
  outline(shaft, 0.46);
  outline(box(0.7, 0.18, 0.7, mat.cream, [x, 3.05, z], parent), 0.54);
  outline(box(0.91, 0.19, 0.83, mat.sand, [x, 3.22, z], parent), 0.6);
}

function makeTree(parent: THREE.Object3D, x: number, z: number, seed: number): void {
  shadowBlob(x + 0.34, z + 0.3, 1.8, 0.8, parent);
  const trunk = mesh(new THREE.CylinderGeometry(0.16, 0.29, 2.6, 7), mat.darkGold, [x, 1.35, z], parent);
  trunk.rotation.z = 0.065 * seed;
  silhouette(trunk, 1.035);
  const branches: Array<[number, number, number, number, THREE.Material]> = [
    [-0.52, 3.22, 0.03, 1.22, mat.green],
    [0.47, 3.38, -0.06, 1.12, mat.sage],
    [0.02, 3.85, -0.1, 1.37, mat.mint],
    [-0.13, 4.22, 0.25, 0.88, mat.green],
  ];
  for (const [dx, y, dz, radius, material] of branches) {
    const crown = irregularCrown(radius, material, seed + y);
    crown.position.set(x + dx, y, z + dz);
    crown.scale.set(1.05, 0.8, 0.87);
    parent.add(crown);
  }
}

function makePlanter(parent: THREE.Object3D, x: number, z: number): void {
  const bowl = mesh(new THREE.CylinderGeometry(0.68, 0.46, 0.58, 9), mat.stone, [x, 0.38, z], parent);
  silhouette(bowl, 1.025);
  outline(bowl, 0.65);
  mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.045, 9), mat.darkGold, [x, 0.7, z], parent);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const leaf = irregularCrown(0.38 + (i % 2) * 0.07, i % 2 ? mat.sage : mat.green, i + x);
    leaf.position.set(x + Math.sin(angle) * 0.33, 0.84 + (i % 3) * 0.1, z + Math.cos(angle) * 0.28);
    leaf.scale.y = 0.75;
    parent.add(leaf);
  }
  for (let i = 0; i < 3; i++) {
    const flower = mesh(new THREE.IcosahedronGeometry(0.07, 0), mat.coral, [x - 0.23 + i * 0.21, 1.14 + (i % 2) * 0.09, z + 0.23], parent);
    flower.castShadow = false;
  }
}

function makeHelmet(parent: THREE.Object3D): void {
  const artifact = new THREE.Group();
  artifact.position.set(0, 1.44, 1.4);
  parent.add(artifact);

  const dome = mesh(new THREE.SphereGeometry(0.56, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat.gold, [0, 0.28, 0], artifact);
  dome.scale.z = 0.86;
  silhouette(dome, 1.036);
  outline(dome, 0.85);
  const brim = mesh(new THREE.TorusGeometry(0.55, 0.07, 5, 16), mat.darkGold, [0, 0.28, 0], artifact);
  brim.rotation.x = Math.PI / 2;
  outline(brim, 0.8);
  const faceOpening = box(0.68, 0.38, 0.035, mat.ink, [0, -0.07, 0.46], artifact);
  faceOpening.castShadow = false;
  const brow = box(0.88, 0.11, 0.12, mat.gold, [0, 0.22, 0.48], artifact);
  outline(brow, 0.8);
  const frontGuard = box(0.13, 0.55, 0.1, mat.gold, [0, -0.14, 0.52], artifact);
  frontGuard.rotation.x = -0.1;
  outline(frontGuard, 0.85);
  for (const side of [-1, 1]) {
    const cheek = box(0.26, 0.5, 0.13, mat.gold, [side * 0.42, -0.18, 0.44], artifact);
    cheek.rotation.z = side * 0.22;
    outline(cheek, 0.85);
    mesh(new THREE.SphereGeometry(0.06, 8, 5), mat.coral, [side * 0.48, 0.13, 0.32], artifact);
  }
  const crestBase = box(0.11, 0.13, 0.86, mat.darkGold, [0, 0.81, -0.04], artifact);
  outline(crestBase, 0.78);
  for (let i = 0; i < 7; i++) {
    const feather = mesh(new THREE.ConeGeometry(0.13, 0.54 - Math.abs(i - 3) * 0.045, 4), mat.coral, [0, 1.11, -0.38 + i * 0.12], artifact);
    feather.rotation.z = 0.1;
    silhouette(feather, 1.04);
  }
}

function makeArchitecture(parent: THREE.Object3D): void {
  const facade = new THREE.Group();
  facade.position.z = -3.6;
  parent.add(facade);

  for (const side of [-1, 1]) {
    const wall = box(2.95, 2.75, 0.68, mat.cream, [side * 3.35, 1.83, -0.34], facade);
    silhouette(wall, 1.008);
    outline(wall, 0.55);
    box(2.73, 0.1, 0.74, mat.sage, [side * 3.35, 0.56, -0.31], facade);
    box(2.8, 0.12, 0.76, mat.sand, [side * 3.35, 3.12, -0.31], facade);

    const niche = mesh(new THREE.ShapeGeometry(archShape(0.55, 1.1)), mat.door, [side * 3.3, 1.02, 0.022], facade);
    niche.castShadow = false;
    outline(niche, 0.9);
    mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.8, 8), mat.sand, [side * 3.3, 1.18, 0.08], facade);
    mesh(new THREE.SphereGeometry(0.24, 8, 5), mat.stone, [side * 3.3, 1.71, 0.08], facade);
    makeColumn(facade, side * 2.02, 0.43);
    makeColumn(facade, side * 5.03, 0.43);
  }

  const portal = mesh(new THREE.ShapeGeometry(archShape(1.1, 1.64)), mat.door, [0, 0.54, -0.24], facade);
  portal.castShadow = false;
  outline(portal, 0.9);
  const archPoints: THREE.Vector3[] = [new THREE.Vector3(-1.1, 0.54, 0.02), new THREE.Vector3(-1.1, 2.18, 0.02)];
  for (let i = 1; i <= 14; i++) {
    const angle = Math.PI - i * Math.PI / 14;
    archPoints.push(new THREE.Vector3(Math.cos(angle) * 1.1, 2.18 + Math.sin(angle) * 1.1, 0.02));
  }
  archPoints.push(new THREE.Vector3(1.1, 0.54, 0.02));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(archPoints), 35, 0.065, 5, false), mat.sand, [0, 0, 0], facade);
  inkStroke(archPoints.map((point) => [point.x, point.y, point.z + 0.07]), facade, 0.82);
  box(0.055, 1.54, 0.08, mat.darkGold, [0, 1.32, 0.035], facade);
  for (const x of [-0.42, 0.42]) {
    mesh(new THREE.SphereGeometry(0.048, 7, 5), mat.gold, [x, 1.55, 0.08], facade);
  }

  outline(box(10.9, 0.37, 1.3, mat.stone, [0, 3.48, 0.07], facade), 0.65);
  outline(box(11.35, 0.12, 1.45, mat.sand, [0, 3.72, 0.07], facade), 0.65);
  const triangle = new THREE.Shape();
  triangle.moveTo(-5.05, 3.79);
  triangle.lineTo(5.05, 3.79);
  triangle.lineTo(0, 4.75);
  triangle.closePath();
  const pediment = mesh(new THREE.ExtrudeGeometry(triangle, { depth: 0.28, bevelEnabled: false }), mat.cream, [0, 0, -0.18], facade);
  outline(pediment, 0.85);
  mesh(new THREE.TorusGeometry(0.22, 0.04, 5, 12), mat.coral, [0, 4.12, 0.16], facade);

  for (let step = 0; step < 3; step++) {
    outline(box(3.8 + step * 0.5, 0.14, 0.46, step % 2 ? mat.cream : mat.sand, [0, 0.33 - step * 0.11, 0.7 + step * 0.39], facade), 0.5);
  }

  // Broken, slightly wandering strokes keep the stone from reading as a clean CAD model.
  for (const side of [-1, 1]) {
    const x = side * 3.35;
    inkStroke([[x - 0.94, 2.62, 0.025], [x - 0.52, 2.6, 0.035], [x - 0.2, 2.63, 0.025]], facade, 0.47);
    inkStroke([[x + 0.55, 1.15, 0.025], [x + 0.8, 1.17, 0.035], [x + 0.94, 1.1, 0.025]], facade, 0.44);
    inkStroke([[x - 0.86, 2.12, 0.026], [x - 0.83, 1.97, 0.035], [x - 0.73, 1.92, 0.026]], facade, 0.36);
  }
}

export function createStudyScene(): StudyWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x89d9cd);
  scene.fog = new THREE.Fog(0x89d9cd, 23, 49);

  const ambient = new THREE.AmbientLight(0xffffff, 1.05);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1.65);
  sun.position.set(-5, 10, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -11;
  sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 11;
  sun.shadow.camera.bottom = -11;
  sun.shadow.normalBias = 0.035;
  sun.shadow.radius = 3;
  scene.add(sun);

  const ground = mesh(new THREE.PlaneGeometry(100, 100), mat.sage, [0, 0, 0], scene);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;

  const path = box(6.1, 0.025, 17, mat.cream, [0, 0.022, 4.2], scene);
  path.castShadow = false;
  paintedPatch(scene, [[3.2, -1.3], [4.5, -1.55], [5.35, -0.8], [6.55, -0.65], [7.2, 0.15], [8, 0.1], [8.65, 1.25], [7.4, 1.9], [5.8, 1.5], [4.7, 1.9], [3.22, 0.85]], mat.green);
  paintedPatch(scene, [[-3.28, 1.3], [-4.1, 1.55], [-5.3, 1.25], [-6.1, 2.15], [-7.8, 2.4], [-7.45, 4.1], [-6.1, 4.5], [-4.55, 3.72], [-3.25, 3.84]], mat.turquoise);
  for (const side of [-1, 1]) {
    inkStroke([[side * 3.06, 0.05, -4.2], [side * 3.03, 0.05, -1.7], [side * 3.09, 0.05, 1.2], [side * 3.04, 0.05, 4.1], [side * 3.1, 0.05, 8.2]], scene, 0.45);
  }
  for (const z of [3.1, 6.2, 9.1]) {
    inkStroke([[-2.85, 0.052, z], [-0.9, 0.052, z + 0.06], [0.85, 0.052, z - 0.04], [2.86, 0.052, z + 0.02]], scene, 0.32);
  }
  shadowBlob(0.63, 1.8, 1.85, 0.8, scene);
  makeArchitecture(scene);
  makeTree(scene, -6.25, -0.3, 1);
  makeTree(scene, 6.2, -0.8, -1);
  makePlanter(scene, -3.22, 1.03);
  makePlanter(scene, 3.22, 1.03);

  for (const side of [-1, 1]) {
    const slab = box(0.72, 0.12, 0.78, mat.sand, [side * 5.22, 0.2, 2.46], scene);
    outline(slab, 0.18);
    mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.8, 7), mat.darkGold, [side * 5.22, 0.66, 2.46], scene);
    mesh(new THREE.SphereGeometry(0.2, 8, 6), mat.coral, [side * 5.22, 1.14, 2.46], scene);
  }

  const pedestalBase = box(1.65, 0.24, 1.36, mat.sand, [0, 0.25, 1.4], scene);
  outline(pedestalBase, 0.35);
  const pedestal = box(1.32, 0.73, 1.04, mat.stone, [0, 0.72, 1.4], scene);
  outline(pedestal, 0.26);
  const pedestalTop = box(1.48, 0.13, 1.18, mat.sand, [0, 1.15, 1.4], scene);
  outline(pedestalTop, 0.4);
  const plaque = box(0.6, 0.22, 0.025, mat.darkGold, [0, 0.78, 1.935], scene);
  plaque.castShadow = false;
  makeHelmet(scene);

  // These bounds match the solid parts of this temporary courtyard scene.
  const colliders: Collider[] = [
    { minX: -5.7, maxX: 5.7, minZ: -4.4, maxZ: -2.7 }, // facade and closed entrance
    { minX: -0.83, maxX: 0.83, minZ: 0.72, maxZ: 2.08 }, // exhibit pedestal
    { minX: -3.9, maxX: -2.54, minZ: 0.35, maxZ: 1.71 },
    { minX: 2.54, maxX: 3.9, minZ: 0.35, maxZ: 1.71 },
    { minX: -6.54, maxX: -5.96, minZ: -0.59, maxZ: -0.01 },
    { minX: 5.91, maxX: 6.49, minZ: -1.09, maxZ: -0.51 },
    { minX: -5.58, maxX: -4.86, minZ: 2.07, maxZ: 2.85 },
    { minX: 4.86, maxX: 5.58, minZ: 2.07, maxZ: 2.85 },
  ];

  return { scene, colliders, exhibit: new THREE.Vector3(0, 1.83, 1.4) };
}
