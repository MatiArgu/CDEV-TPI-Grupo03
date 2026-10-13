import * as THREE from 'three';
import { modelCollider, placeModel } from './assets';
import type { Collider } from './scene';
import { box, hippedRoof, materials as mat, mesh, outline, toon } from './visual';

function plaque(parent: THREE.Object3D, text: string, x: number, y: number, z: number, width: number): void {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#466966';
  ctx.fillRect(0, 0, 768, 128);
  ctx.strokeStyle = '#d9c5a0';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 748, 108);
  ctx.fillStyle = '#fff0cf';
  ctx.font = '36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 384, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const panel = mesh(new THREE.PlaneGeometry(width, width / 6), new THREE.MeshBasicMaterial({ map: texture }), [x, y, z], parent);
  panel.castShadow = false;
}

function townhouses(scene: THREE.Scene, colliders: Collider[]): void {
  const facades = [toon(0xe3c6ad), toon(0xd5ddd0), toon(0xe8d9bb), toon(0xd0dce0)];
  const roofs = [toon(0x73868a), toon(0x8d7871)];
  const shutters = toon(0x6f9288);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const house = new THREE.Group();
      house.name = `casa:${side}:${i}`;
      house.position.set(side * 19.5, 0, 0.25 + i * 8.2);
      house.rotation.y = -side * Math.PI / 2;
      scene.add(house);
      const height = i === 2 ? 3.5 : 6.1;
      const wall = box(8.2, height, 5.4, facades[(i + (side > 0 ? 1 : 0)) % 4], [0, height / 2, 0], house);
      colliders.push(modelCollider(wall));
      box(8.2, 0.38, 0.18, mat.sand, [0, 0.25, 2.76], house);
      box(8.45, 0.2, 5.65, mat.stone, [0, height, 0], house);
      hippedRoof(8.65, 1.3, 5.9, roofs[i % 2], [0, height + 0.1, 0], house);
      box(0.5, 1.1, 0.65, mat.sand, [-2.7, height + 1.05, -0.5], house);
      box(0.66, 0.12, 0.8, mat.stone, [-2.7, height + 1.64, -0.5], house);
      for (const x of [-3.85, 3.85]) box(0.23, height, 0.22, mat.stone, [x, height / 2, 2.78], house);
      for (const y of (height > 4 ? [1.02, 3.95] : [1.02])) {
        for (const x of [-2.6, 2.6]) {
          box(1.02, 1.52, 0.04, mat.door, [x, y + 0.76, 2.72], house);
          placeModel('tallWindow', house, [x, y, 2.76], { height: 1.62, width: 1.14 });
          for (const dx of [-0.82, 0.82]) {
            outline(box(0.38, 1.52, 0.1, shutters, [x + dx, y + 0.76, 2.76], house), 0.18);
            for (let slat = 0; slat < 4; slat++) box(0.32, 0.03, 0.03, mat.sage, [x + dx, y + 0.25 + slat * 0.33, 2.82], house);
          }
          box(1.52, 0.12, 0.4, mat.stone, [x, y - 0.04, 2.82], house);
          if (y > 3) {
            box(1.3, 0.22, 0.35, mat.sand, [x, y + 0.08, 3.0], house);
            placeModel('smallBush', house, [x, y + 0.19, 3.0], { height: 0.3, width: 1.2 });
            placeModel('flowers', house, [x, y + 0.2, 3.02], { height: 0.4 });
          }
        }
      }
      // Closed doors and shutters keep these buildings as the courtyard boundary.
      outline(box(1.35, 2.28, 0.12, shutters, [0, 1.2, 2.77], house), 0.35);
      box(0.07, 2.2, 0.04, mat.sand, [0, 1.2, 2.85], house);
      for (const x of [-0.17, 0.17]) box(0.035, 0.17, 0.04, mat.gold, [x, 1.08, 2.9], house);
      if (height > 4) {
        box(8.2, 0.15, 0.22, mat.stone, [0, 3.42, 2.77], house);
        placeModel('archedWindow', house, [0, 3.95, 2.76], { height: 1.62, width: 1.14 });
      }
    }
    // Join the townhouses to the museum so the front corners cannot be bypassed.
    const wall = box(4.5, 3.2, 0.65, mat.cream, [side * 14.7, 1.6, -3.9], scene);
    colliders.push(modelCollider(wall));
    box(4.7, 0.2, 0.86, mat.sand, [side * 14.7, 3.22, -3.9], scene);
    for (const x of [side * 12.65, side * 16.7]) {
      box(0.42, 3.45, 0.85, mat.stone, [x, 1.73, -3.9], scene);
      placeModel('pot', scene, [x, 3.46, -3.9], { height: 0.4, width: 0.55 });
    }
    // The sidewalk stays at the player's floor level (there is no stair climbing).
    box(1.35, 0.1, 32.8, mat.stone, [side * 16.12, 0.04, 12.55], scene).castShadow = false;
  }
}

export function createCourtyardArrival(scene: THREE.Scene, colliders: Collider[]) {
  townhouses(scene, colliders);
  const iron = toon(0x526e6c);
  const gravel = toon(0xb7b8ad);
  box(35, 0.12, 5, mat.stone, [0, 0.02, 26.5], scene).castShadow = false;
  box(35, 0.025, 0.18, mat.gold, [0, 0.095, 28.12], scene).castShadow = false;
  box(340, 0.12, 5.5, gravel, [0, -0.04, 32.2], scene).castShadow = false;
  for (let x = -159.8; x <= 159.8; x += 9.4) {
    placeModel('railroad', scene, [x, 0.02, 32.2], { width: 2.35, rotation: Math.PI / 2 });
  }
  // A hinged exit occupies the gap beneath the station sign, aligned with the spawn.
  const gateCenter = 1;
  const gateHalfWidth = 2.3;
  const gateLeft = gateCenter - gateHalfWidth;
  const gateRight = gateCenter + gateHalfWidth;
  const railZ = 28.65;
  for (const [left, right] of [[-17.6, gateLeft], [gateRight, 17.6]]) {
    const barrier = box(right - left, 0.32, 0.38, mat.sand, [(left + right) / 2, 0.17, railZ], scene);
    colliders.push(modelCollider(barrier));
    for (const y of [0.45, 1.22]) box(right - left, 0.065, 0.075, iron, [(left + right) / 2, y, railZ], scene);
    const count = Math.floor((right - left) / 0.3);
    const pickets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 0.89, 0.045), iron, count);
    const transform = new THREE.Matrix4();
    for (let i = 0; i < count; i++) pickets.setMatrixAt(i, transform.makeTranslation(left + (i + 0.5) * (right - left) / count, 0.79, railZ));
    pickets.castShadow = true;
    scene.add(pickets);
    for (let x = left + 0.1; x < right; x += 3.5) {
      box(0.13, 1.32, 0.13, iron, [x, 0.68, railZ], scene);
      mesh(new THREE.SphereGeometry(0.1, 6, 4), mat.gold, [x, 1.4, railZ], scene);
    }
  }
  const gateLeaves: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const hingeX = gateCenter + side * gateHalfWidth;
    const leaf = new THREE.Group();
    leaf.name = `porton-anden:${side}`;
    leaf.position.set(hingeX, 0, railZ);
    scene.add(leaf);
    gateLeaves.push(leaf);
    for (const x of [0, -side * (gateHalfWidth - 0.06)]) box(0.09, 1.35, 0.09, iron, [x, 0.78, 0], leaf);
    for (const y of [0.15, 0.73, 1.43]) box(gateHalfWidth, 0.09, 0.09, iron, [-side * gateHalfWidth / 2, y, 0], leaf);
    for (let i = 1; i <= 7; i++) box(0.045, 1.2, 0.045, iron, [-side * i * 0.285, 0.79, 0], leaf);
    // Visible hinge barrels, pull handle and latch distinguish the leaves from the fixed fence.
    for (const y of [0.34, 1.25]) mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.18, 8), mat.gold, [0, y, 0], leaf);
    box(0.08, 0.3, 0.1, mat.gold, [-side * 2.05, 0.92, -0.1], leaf);
    box(0.25, 0.055, 0.12, mat.gold, [-side * 2.19, 0.74, -0.08], leaf);
    leaf.rotation.y = side * 0.42;
  }
  // The residual opening is narrower than the player's diameter throughout the closing motion.
  // Reserve the handles' closed position so the moving leaves cannot pin a visitor.
  const gateColliders = gateLeaves.map((leaf) => ({ ...modelCollider(leaf), minZ: railZ - 0.2 }));
  colliders.push(...gateColliders);
  const stationSign = new THREE.Group();
  stationSign.position.set(gateCenter, 0, railZ);
  stationSign.rotation.y = Math.PI;
  scene.add(stationSign);
  for (const x of [-gateHalfWidth, gateHalfWidth]) {
    const post = box(0.18, 3.25, 0.18, iron, [x, 1.65, 0], stationSign);
    colliders.push(modelCollider(post));
  }
  plaque(stationSign, 'ESTACIÓN · MUSEO DEL TIEMPO', 0, 2.95, 0.05, 5.2);
  // A planted embankment closes the horizon behind the railway.
  box(180, 0.55, 4, mat.sage, [0, 0.15, 37], scene);
  for (let i = 0; i < 19; i++) {
    const x = -54 + i * 6;
    placeModel(i % 3 ? 'tree' : 'oak', scene, [x, 0.38, 39 + i % 3], { height: 5 + i % 4, rotation: i * 1.7 });
    placeModel('bush', scene, [x, 0.4, 36.5], { height: 1.5, width: 6.4 });
  }

  const train = new THREE.Group();
  train.name = 'tren-de-llegada';
  train.position.z = 32.2;
  scene.add(train);
  placeModel('locomotive', train, [10, 0.255, 0], { height: 3.9, rotation: Math.PI / 2 });
  for (const x of [3.82, -2.36, -8.54]) {
    placeModel('passengerCar', train, [x, 0.255, 0], { height: 3.875, rotation: Math.PI / 2 });
  }
  const drivingWheels: THREE.Object3D[] = [];
  train.traverse((part) => { if (/^wheel(?:_|$)/.test(part.name)) drivingWheels.push(part); });
  const gaze = new THREE.Vector3();
  let departed = false;
  let speed = 0;
  let gateProgress = 0;
  return {
    spawn: new THREE.Vector2(1, 26.3),
    update: (delta: number, camera: THREE.Camera) => {
      if (!train.visible) return;
      camera.getWorldDirection(gaze);
      // Looking back from the plaza starts one departure. Looking away never resets it.
      if (!departed && camera.position.z > -3 && gaze.z > 0.55) departed = true;
      if (!departed) return;
      const step = Math.min(delta, 0.05);
      if (gateProgress < 1) {
        gateProgress = Math.min(1, gateProgress + step / 1.2);
        const eased = gateProgress * gateProgress * (3 - 2 * gateProgress);
        gateLeaves[0].rotation.y = -0.42 * (1 - eased);
        gateLeaves[1].rotation.y = 0.42 * (1 - eased);
        gateLeaves.forEach((leaf, index) => Object.assign(gateColliders[index], modelCollider(leaf), { minZ: railZ - 0.2 }));
        if (gateProgress < 1) return;
      }
      speed = Math.min(6.5, speed + step * 0.85);
      const distance = speed * step;
      train.position.x += distance;
      for (const wheel of drivingWheels) wheel.rotation.x += distance / 0.667;
      if (train.position.x > 145) train.visible = false;
    },
  };
}
