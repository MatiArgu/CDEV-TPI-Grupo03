import * as THREE from 'three';
import { modelCollider, placeModel, type ModelId } from './assets';
import type { Collider } from './scene';
import { galleryLayout, museumLayout } from './museumLayout';
import { exhibition, exhibitSpot, stoneFloor } from './exhibition';
import { box, materials as mat, mesh, outline, toon } from './visual';

function artTexture(variant: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 480;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = ['#e5d8b8', '#d4ded3', '#e4cbbb', '#d7ded7'][variant];
  ctx.fillRect(0, 0, 768, 480);
  ctx.fillStyle = '#f9efd3';
  ctx.beginPath(); ctx.arc(555, 123, 61, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9faf9d';
  ctx.beginPath(); ctx.moveTo(0, 268); ctx.bezierCurveTo(210, 185, 480, 338, 768, 236); ctx.lineTo(768, 480); ctx.lineTo(0, 480); ctx.fill();
  ctx.fillStyle = '#789a96';
  ctx.fillRect(0, 326, 768, 154);
  ctx.strokeStyle = '#c5d5bf'; ctx.lineWidth = 3;
  for (let i = 0; i < 15; i++) {
    const x = i * 157 % 710;
    ctx.beginPath(); ctx.moveTo(x, 344 + i * 8); ctx.lineTo(x + 38 + i % 3 * 20, 344 + i * 8); ctx.stroke();
  }
  if (variant % 2 === 0) {
    // An imagined classical arcade: original flat illustration, not a historical exhibit.
    ctx.fillStyle = '#f0dfbc';
    ctx.fillRect(105, 170, 364, 150);
    ctx.fillStyle = '#b99e81'; ctx.fillRect(94, 157, 385, 18);
    ctx.fillRect(94, 313, 385, 15);
    ctx.fillStyle = '#76928c';
    for (let i = 0; i < 4; i++) {
      const x = 150 + i * 88;
      ctx.beginPath(); ctx.arc(x, 227, 29, Math.PI, 0); ctx.lineTo(x + 29, 314); ctx.lineTo(x - 29, 314); ctx.fill();
    }
    ctx.fillStyle = '#658375';
    for (const x of [54, 525, 595]) { ctx.beginPath(); ctx.ellipse(x, 250, 22, 65, 0, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.fillStyle = '#826f60';
    ctx.beginPath(); ctx.moveTo(208, 338); ctx.lineTo(490, 338); ctx.lineTo(440, 372); ctx.lineTo(260, 372); ctx.closePath(); ctx.fill();
    ctx.fillRect(345, 120, 7, 220);
    ctx.fillStyle = '#f6e8c9';
    ctx.beginPath(); ctx.moveTo(340, 139); ctx.lineTo(240, 320); ctx.lineTo(340, 309); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9957b';
    ctx.beginPath(); ctx.moveTo(359, 154); ctx.lineTo(453, 313); ctx.lineTo(359, 306); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#e9dfc5'; ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 736, 448);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function artwork(parent: THREE.Group, variant: number, title: string): void {
  const walnut = toon(exhibition.plinth);
  box(3.02, 1.96, 0.1, walnut, [0, 2.47, 0.06], parent);
  box(2.88, 1.82, 0.1, mat.gold, [0, 2.47, 0.12], parent);
  box(2.72, 1.67, 0.08, mat.stone, [0, 2.47, 0.18], parent);
  const picture = mesh(new THREE.PlaneGeometry(2.52, 1.57), new THREE.MeshLambertMaterial({ map: artTexture(variant) }), [0, 2.47, 0.225], parent);
  picture.castShadow = false;
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 80;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#252d29'; ctx.fillRect(0, 0, 512, 80);
  ctx.fillStyle = '#d9cba9'; ctx.font = '25px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(title, 256, 49);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(1.5, 0.235), new THREE.MeshBasicMaterial({ map: texture }), [0, 1.28, 0.14], parent).castShadow = false;
}

function displayCase(scene: THREE.Scene, colliders: Collider[], x: number, z: number, id: ModelId): void {
  const base = box(1.3, 0.85, 1.05, toon(exhibition.plinth), [x, 0.56, z], scene);
  base.name = 'vitrina-hall';
  const foot = box(1.43, 0.1, 1.18, mat.sand, [x, 0.17, z], scene);
  colliders.push(modelCollider(foot));
  box(1.42, 0.09, 1.17, mat.gold, [x, 1.015, z], scene);
  box(1.3, 0.045, 1.05, mat.stone, [x, 1.08, z], scene);
  const glass = mesh(new THREE.BoxGeometry(1.28, 0.85, 1.03), new THREE.MeshPhongMaterial({ color: 0xc7e3d7, transparent: true, opacity: 0.14, depthWrite: false }), [x, 1.53, z], scene);
  glass.castShadow = false;
  outline(glass, 0.25);
  for (const dx of [-0.64, 0.64]) for (const dz of [-0.515, 0.515]) box(0.025, 0.86, 0.025, mat.gold, [x + dx, 1.54, z + dz], scene);
  placeModel(id, scene, [x, 1.11, z], id === 'rowboat'
    ? { width: 0.88, rotation: 0.35 }
    : id === 'pot' ? { width: 0.78, color: 0xd4c5a6 }
      : { height: 0.67, color: 0xd4c5a6, rotation: 0.25 });
}

export function createHall(scene: THREE.Scene, colliders: Collider[]): void {
  const { halfWidth, frontZ, hallBackZ, wallHeight, wallThickness, floorY } = museumLayout;
  const depth = frontZ - hallBackZ;
  const centerZ = (frontZ + hallBackZ) / 2;
  const naveX = 5.4;
  const bays = [-6.8, -10.8, -14.8];
  const wallColor = toon(exhibition.wall);
  const panelColor = toon(exhibition.panel);
  const bronze = toon(exhibition.bronze);
  const stone = toon(exhibition.stone);
  const ceiling = toon(exhibition.ceiling);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffe7b5 });
  const floor = (w: number, d: number, material: THREE.Material, x: number, z: number, y = 0.18) => {
    const tile = box(w, 0.012, d, material, [x, y, z], scene);
    tile.castShadow = false;
    return tile;
  };
  box(halfWidth * 2, 0.14, depth, panelColor, [0, 0.02, centerZ], scene).castShadow = false;
  stoneFloor(scene, halfWidth * 2 - wallThickness, depth, 0, centerZ, floorY);
  // The entrance facade has an interior finish, with the same clear portal as outside.
  for (const side of [-1, 1]) {
    const span = halfWidth - 2.8;
    const x = side * (2.8 + span / 2);
    box(span, wallHeight, 0.07, wallColor, [x, wallHeight / 2, frontZ - 0.06], scene);
    for (const y of [0.24, 1.2, 5.08]) box(span, 0.09, 0.1, bronze, [x, y, frontZ - 0.12], scene);
    const plant = placeModel('plant', scene, [side * 3.65, 0.15, -5.25], { height: 1.7 });
    colliders.push(modelCollider(plant, 0.1));
  }
  box(5.6, 1.07, 0.07, wallColor, [0, 4.865, frontZ - 0.06], scene);
  // A clear nave leads to an open distribution bay aligned with both gallery doors.
  for (const side of [-1, 1]) {
    floor(0.045, 13.55, bronze, side * 2.8, -11.025);
    floor(0.045, 2.9, bronze, side * galleryLayout.wingX, -20);
    floor(2.3, 0.65, stone, side * galleryLayout.wingX, hallBackZ, floorY + 0.0175);
  }
  for (const z of [-17.9, -19.25]) floor(galleryLayout.wingX * 2 + 0.05, 0.045, bronze, 0, z);

  const wallFace = halfWidth - wallThickness / 2;
  for (const side of [-1, 1]) {
    const wall = box(wallThickness, wallHeight, depth, wallColor, [side * halfWidth, wallHeight / 2, centerZ], scene);
    colliders.push(modelCollider(wall));
    box(0.08, 1.0, depth, panelColor, [side * (wallFace - 0.04), 0.67, centerZ], scene);
    for (const y of [0.24, 1.2, 5.08]) box(0.12, 0.09, depth, bronze, [side * (wallFace - 0.1), y, centerZ], scene);
    for (const z of bays) {
      box(0.12, 0.8, 0.07, stone, [side * (wallFace - 0.1), 0.67, z], scene);
      box(0.04, 1.28, 0.9, mat.door, [side * (wallFace - 0.04), 4.17, z], scene);
      placeModel('tallWindow', scene, [side * (wallFace - 0.1), 3.51, z], { height: 1.34, width: 1.03, rotation: -side * Math.PI / 2 });
      box(0.16, 0.45, 0.3, bronze, [side * (wallFace - 0.15), 2.85, z], scene);
      box(0.26, 0.35, 0.32, glow, [side * (wallFace - 0.34), 3.03, z], scene).castShadow = false;
      box(0.32, 0.05, 0.42, bronze, [side * (wallFace - 0.34), 3.23, z], scene);
    }
    for (const [index, z] of [-8.8, -12.8].entries()) {
      const art = new THREE.Group();
      art.position.set(side * (wallFace - 0.12), 0, z);
      art.rotation.y = -side * Math.PI / 2;
      scene.add(art);
      const variant = index + (side > 0 ? 2 : 0);
      artwork(art, variant, ['LA MEMORIA', 'EL VIAJE', 'EL INSTANTE', 'EL HORIZONTE'][variant]);
      const bench = placeModel('museumBench', scene, [side * (wallFace - 0.95), 0.15, z], { height: 0.8, width: 2.1, rotation: -side * Math.PI / 2 });
      colliders.push(modelCollider(bench));
      const id: ModelId = side < 0 ? (index === 0 ? 'statue' : 'pot') : (index === 0 ? 'rowboat' : 'column');
      displayCase(scene, colliders, side * 9.45, z, id);
      exhibitSpot(scene, side * 9.45, z, 5.08, 12, 2.15, true);
    }
    for (const z of bays.slice(0, 2)) {
      const x = side * (wallFace - 1.15);
      box(1, 0.72, 1, panelColor, [x, 0.51, z], scene);
      const cap = box(1.14, 0.1, 1.14, stone, [x, 0.91, z], scene);
      colliders.push(modelCollider(cap));
      placeModel('statue', scene, [x, 0.97, z], { height: 1.82, width: 0.9, color: 0xc3b99f, rotation: -side * Math.PI / 2 });
    }
    for (const z of bays) {
      const column = placeModel('column', scene, [side * naveX, 0.15, z], { height: 5.03, width: 0.9, depth: 0.9, color: 0xa9a48f });
      colliders.push(modelCollider(column));
    }
    const aisleWidth = halfWidth - naveX + wallThickness / 2;
    const aisleX = naveX + aisleWidth / 2;
    box(aisleWidth, 0.2, depth, ceiling, [side * aisleX, wallHeight + 0.1, centerZ], scene);
    box(0.28, 0.25, depth, stone, [side * naveX, 5.28, centerZ], scene);
    for (const z of [-6.8, -10.8, -14.8, -18.8]) {
      const cofferDepth = z === -18.8 ? 4.4 : 3.55;
      box(aisleWidth - 0.45, 0.08, cofferDepth, panelColor, [side * aisleX, 5.35, z], scene);
      box(aisleWidth - 0.65, 0.03, cofferDepth - 0.2, wallColor, [side * aisleX, 5.295, z], scene);
    }
  }
  for (const [radius, material, y] of [[1.72, bronze, 0.18], [1.64, panelColor, 0.183], [1.43, stone, 0.186]] as const) {
    const disc = mesh(new THREE.CircleGeometry(radius, 64), material, [0, y, -11.6], scene);
    disc.rotation.x = -Math.PI / 2;
    disc.castShadow = false;
  }
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const mark = floor(0.055, 0.2, bronze, Math.sin(angle) * 1.51, -11.6 + Math.cos(angle) * 1.51, 0.2);
    mark.rotation.y = angle;
  }
  floor(0.16, 2.5, panelColor, 0, -11.6, 0.2).rotation.y = -Math.PI / 5;
  for (const z of bays) {
    const points = Array.from({ length: 21 }, (_, i) => {
      const x = -naveX + i * naveX * 2 / 20;
      return new THREE.Vector3(x, 5.18 + 0.87 * (1 - (x / naveX) ** 2), z);
    });
    // The first bay sits below the taller entrance pavilion's solid ceiling.
    if (z < -8) mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.14, 6, false), stone, [0, 0, 0], scene);
    else box(naveX * 2, 0.25, 0.28, stone, [0, 5.28, z], scene);
  }
  // Gallery owns the continuous rear wall; the hall adds only its cornice and clock.
  box(halfWidth * 2, 0.1, 0.14, bronze, [0, 5.08, hallBackZ + 0.21], scene);
  for (const x of [-1.3, 1.3]) box(0.12, 3.5, 0.08, bronze, [x, 2.05, hallBackZ + 0.19], scene);
  mesh(new THREE.CircleGeometry(1.03, 48), bronze, [0, 2.42, hallBackZ + 0.2], scene);
  mesh(new THREE.CircleGeometry(0.92, 48), stone, [0, 2.42, hallBackZ + 0.23], scene);
  mesh(new THREE.TorusGeometry(0.72, 0.025, 4, 48), panelColor, [0, 2.42, hallBackZ + 0.26], scene);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const tick = box(0.04, 0.13, 0.02, bronze, [Math.sin(a) * 0.82, 2.42 + Math.cos(a) * 0.82, hallBackZ + 0.28], scene);
    tick.rotation.z = -a;
  }
  box(0.055, 1.1, 0.035, panelColor, [0, 2.42, hallBackZ + 0.31], scene).rotation.z = -0.55;
  box(naveX * 2, 0.2, frontZ + 8, ceiling, [0, wallHeight + 0.1, (frontZ - 8) / 2], scene);
  vaultedCeiling(scene, naveX, hallBackZ);
  for (const z of bays) {
    const rodLength = z > -8 ? 0.25 : 1.1;
    mesh(new THREE.CylinderGeometry(0.022, 0.022, rodLength, 6), bronze, [0, 5.25 + rodLength / 2, z], scene);
    mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.42, 10), glow, [0, 5.05, z], scene).castShadow = false;
    for (const y of [4.82, 5.28]) mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 10), bronze, [0, y, z], scene);
    const light = new THREE.PointLight(0xffe6bb, 6, 8, 1.5);
    light.position.set(0, 4.6, z);
    scene.add(light);
  }
}
function vaultedCeiling(parent: THREE.Object3D, halfWidth: number, backZ: number): void {
  const roofMaterial = toon(exhibition.ceiling);
  roofMaterial.side = THREE.DoubleSide;
  const roofY = (x: number): number => 5.46 + 0.78 * (1 - (x / halfWidth) ** 2);
  for (let segment = 0; segment < 8; segment++) {
    const x0 = -halfWidth + segment * halfWidth / 4;
    const x1 = x0 + halfWidth / 4;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      x0, roofY(x0), -8, x1, roofY(x1), -8,
      x0, roofY(x0), backZ, x1, roofY(x1), backZ,
    ], 3));
    geometry.setIndex([0, 2, 1, 1, 2, 3]);
    geometry.computeVertexNormals();
    const pane = mesh(geometry, roofMaterial, [0, 0, 0], parent);
    pane.castShadow = true;
    pane.receiveShadow = false;
  }
  for (let segment = 0; segment <= 8; segment++) {
    const x = -halfWidth + segment * halfWidth / 4;
    const rib = box(0.065, 0.095, -8 - backZ, mat.darkGold, [x, roofY(x) + 0.01, (-8 + backZ) / 2], parent);
    rib.castShadow = segment % 2 === 0;
  }
  for (const z of [-8, -10.8, -14.8, backZ]) {
    const points = Array.from({ length: 17 }, (_, index) => {
      const x = -halfWidth + index * halfWidth / 8;
      return new THREE.Vector3(x, roofY(x) - 0.025, z);
    });
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.055, 5, false), mat.darkGold, [0, 0, 0], parent);
  }
  const end = new THREE.Shape();
  end.moveTo(-halfWidth, museumLayout.wallHeight);
  end.lineTo(halfWidth, museumLayout.wallHeight);
  for (let i = 8; i >= 0; i--) {
    const x = -halfWidth + i * halfWidth / 4;
    end.lineTo(x, roofY(x));
  }
  end.closePath();
  const capMaterial = roofMaterial.clone();
  capMaterial.side = THREE.DoubleSide;
  for (const z of [-8, backZ]) mesh(new THREE.ShapeGeometry(end), capMaterial, [0, 0, z], parent);
}

