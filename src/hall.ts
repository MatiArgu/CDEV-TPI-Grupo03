import * as THREE from 'three';
import { modelCollider, placeModel, type ModelId } from './assets';
import type { Collider } from './scene';
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
  const wallColor = toon(exhibition.wall);
  const panelColor = toon(exhibition.panel);
  const darkStone = toon(exhibition.panel);
  const bronze = toon(exhibition.bronze);
  const stone = toon(exhibition.stone);
  const ceiling = toon(exhibition.ceiling);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffe7b5 });
  const floor = (w: number, d: number, material: THREE.Material, x: number, z: number, y = 0.105) => {
    const tile = box(w, 0.012, d, material, [x, y, z], scene);
    tile.castShadow = false;
    return tile;
  };
  box(17, 0.14, 18, darkStone, [0, 0.02, -12.4], scene).castShadow = false;
  stoneFloor(scene, 16.7, 17.8, 0, -12.4, 0.105);
  for (const side of [-1, 1]) {
    floor(0.22, 16.8, darkStone, side * 2.84, -12.15);
    floor(0.035, 16.8, bronze, side * 2.99, -12.15);
    floor(2.5, 0.25, darkStone, side * 4.12, -19.6);
    for (const z of [-6.9, -9.4, -11.9, -14.4, -16.9, -19.4]) {
      floor(4.7, 0.025, bronze, side * 5.7, z);
      const diamond = floor(0.24, 0.24, darkStone, side * 2.84, z, 0.12);
      diamond.rotation.y = Math.PI / 4;
    }
    const wall = box(0.56, 5.5, 18, wallColor, [side * 8.55, 2.75, -12.4], scene);
    colliders.push(modelCollider(wall));
    box(0.08, 1.0, 17.8, panelColor, [side * 8.23, 0.67, -12.4], scene);
    for (const y of [0.18, 1.2, 4.92, 5.14]) box(0.17, 0.09, 17.8, y < 2 ? bronze : stone, [side * 8.17, y, -12.4], scene);
    for (let z = -5; z > -21; z -= 1.5) box(0.12, 0.8, 0.06, stone, [side * 8.17, 0.67, z], scene);
    for (const z of [-7.2, -12.4, -17.6]) {
      box(0.04, 1.28, 0.9, mat.door, [side * 8.22, 4.17, z], scene);
      placeModel('tallWindow', scene, [side * 8.16, 3.51, z], { height: 1.34, width: 1.03, rotation: -side * Math.PI / 2 });
    }
    for (const [index, z] of [-10.8, -16.65].entries()) {
      const art = new THREE.Group();
      art.position.set(side * 8.16, 0, z);
      art.rotation.y = -side * Math.PI / 2;
      scene.add(art);
      const variant = index + (side > 0 ? 2 : 0);
      artwork(art, variant, ['LA MEMORIA', 'EL VIAJE', 'EL INSTANTE', 'EL HORIZONTE'][variant]);
      const bench = placeModel('museumBench', scene, [side * 7.35, 0.1, z], { height: 0.8, width: 2.1, rotation: -side * Math.PI / 2 });
      colliders.push(modelCollider(bench));
    }
    for (const z of [-8.1, -13.95]) {
      box(1.0, 0.72, 1.0, panelColor, [side * 7.25, 0.47, z], scene);
      const cap = box(1.14, 0.1, 1.14, stone, [side * 7.25, 0.87, z], scene);
      colliders.push(modelCollider(cap));
      placeModel('statue', scene, [side * 7.25, 0.93, z], { height: 1.82, width: 0.9, color: 0xc3b99f, rotation: -side * Math.PI / 2 });
    }
    for (const z of [-7.6, -13.1, -18.6]) {
      const column = placeModel('column', scene, [side * 5.9, 0.1, z], { height: 4.04, width: 0.83, depth: 0.83, color: 0xa9a48f });
      colliders.push(modelCollider(column));
      // Warm wall sconces add points of light without extra shadow maps.
      box(0.16, 0.45, 0.3, bronze, [side * 8.1, 2.85, z], scene);
      const lamp = box(0.26, 0.35, 0.32, glow, [side * 7.92, 3.03, z], scene);
      lamp.castShadow = false;
      box(0.32, 0.05, 0.42, bronze, [side * 7.92, 3.23, z], scene);
    }
    const plant = placeModel('plant', scene, [side * 7.25, 0.1, -5.1], { height: 1.7 });
    colliders.push(modelCollider(plant, 0.1));
    box(4, 0.25, 18, ceiling, [side * 6.5, 5.5, -12.4], scene);
    for (const z of [-7, -10, -13, -16, -19]) {
      box(3.6, 0.1, 2.6, panelColor, [side * 6.5, 5.33, z], scene);
      box(3.35, 0.035, 2.35, wallColor, [side * 6.5, 5.26, z], scene);
    }
  }
  // A flush clock-rose inlay makes the central promenade legible without an obstacle.
  for (const [radius, material, y] of [[1.72, bronze, 0.123], [1.64, darkStone, 0.126], [1.43, stone, 0.129]] as const) {
    const disc = mesh(new THREE.CircleGeometry(radius, 64), material, [0, y, -12.2], scene);
    disc.rotation.x = -Math.PI / 2;
    disc.castShadow = false;
  }
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const mark = floor(0.055, 0.2, bronze, Math.sin(angle) * 1.51, -12.2 + Math.cos(angle) * 1.51, 0.14);
    mark.rotation.y = angle;
  }
  const needle = floor(0.16, 2.5, darkStone, 0, -12.2, 0.14);
  needle.rotation.y = -Math.PI / 5;
  for (const z of [-7.6, -13.1, -18.6]) {
    const points = Array.from({ length: 21 }, (_, i) => {
      const x = -5.9 + i * 11.8 / 20;
      return new THREE.Vector3(x, 4.1 + 1.2 * (1 - (x / 5.9) ** 2), z);
    });
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.16, 6, false), stone, [0, 0, 0], scene);
  }
  for (const [x, z, id] of [[-3.95, -9.9, 'statue'], [3.95, -9.9, 'rowboat'], [-3.95, -15.3, 'pot'], [3.95, -15.3, 'column']] as const) {
    displayCase(scene, colliders, x, z, id);
    exhibitSpot(scene, x, z, 5.08, 12, 2.15, true);
  }
  box(17, 1.6, 0.52, wallColor, [0, 4.7, -21.45], scene);
  for (const y of [4.04, 5.34]) box(16.9, 0.1, 0.22, bronze, [0, y, -21.1], scene);
  mesh(new THREE.CircleGeometry(1.03, 48), bronze, [0, 2.42, -21.25], scene);
  mesh(new THREE.CircleGeometry(0.92, 48), stone, [0, 2.42, -21.22], scene);
  mesh(new THREE.TorusGeometry(0.72, 0.025, 4, 48), darkStone, [0, 2.42, -21.19], scene);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const tick = box(0.04, 0.13, 0.02, bronze, [Math.sin(a) * 0.82, 2.42 + Math.cos(a) * 0.82, -21.17], scene);
    tick.rotation.z = -a;
  }
  const hand = box(0.055, 1.1, 0.035, darkStone, [0, 2.42, -21.14], scene);
  hand.rotation.z = -0.55;
  // The entry pavilion overlaps this bay: a solid ceiling hides its structural volumes.
  box(9.1, 0.18, 4.6, ceiling, [0, 5.42, -5.7], scene);
  vaultedCeiling(scene);
  for (const z of [-7.2, -12.5, -17.8]) {
    mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 6), bronze, [0, 5.7, z], scene);
    const lightGlass = mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.42, 10), glow, [0, 5.05, z], scene);
    lightGlass.castShadow = false;
    for (const y of [4.82, 5.28]) mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 10), bronze, [0, y, z], scene);
    const light = new THREE.PointLight(0xffe6bb, 6, 8, 1.5);
    light.position.set(0, 4.6, z);
    scene.add(light);
  }
}
function vaultedCeiling(parent: THREE.Object3D): void {
  const roofMaterial = toon(exhibition.ceiling);
  roofMaterial.side = THREE.DoubleSide;
  const roofY = (x: number): number => 5.46 + 0.78 * (1 - (x / 4.5) ** 2);
  for (let segment = 0; segment < 8; segment++) {
    const x0 = -4.5 + segment * 1.125;
    const x1 = x0 + 1.125;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      x0, roofY(x0), -8, x1, roofY(x1), -8,
      x0, roofY(x0), -21.3, x1, roofY(x1), -21.3,
    ], 3));
    geometry.setIndex([0, 2, 1, 1, 2, 3]);
    geometry.computeVertexNormals();
    const pane = mesh(geometry, roofMaterial, [0, 0, 0], parent);
    pane.castShadow = true;
    pane.receiveShadow = false;
  }
  for (let segment = 0; segment <= 8; segment++) {
    const x = -4.5 + segment * 1.125;
    const rib = box(0.065, 0.095, 13.3, mat.darkGold, [x, roofY(x) + 0.01, -14.65], parent);
    rib.castShadow = segment % 2 === 0;
  }
  for (const z of [-8, -10.2, -12.4, -14.6, -16.8, -19, -21.2]) {
    const points = Array.from({ length: 17 }, (_, index) => {
      const x = -4.5 + index * 0.5625;
      return new THREE.Vector3(x, roofY(x) - 0.025, z);
    });
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.055, 5, false), mat.darkGold, [0, 0, 0], parent);
  }
  const end = new THREE.Shape();
  end.moveTo(-4.5, 5.42);
  end.lineTo(4.5, 5.42);
  for (let i = 8; i >= 0; i--) {
    const x = -4.5 + i * 1.125;
    end.lineTo(x, roofY(x));
  }
  end.closePath();
  const capMaterial = roofMaterial.clone();
  capMaterial.side = THREE.DoubleSide;
  for (const z of [-8, -21.3]) mesh(new THREE.ShapeGeometry(end), capMaterial, [0, 0, z], parent);
}

