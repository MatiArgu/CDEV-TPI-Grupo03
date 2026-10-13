import * as THREE from 'three';
import { modelCollider, placeModel } from '../rendering/assets';
import { exhibitLabel, exhibitSpot, plinth, stoneFloor } from '../museum/exhibition';
import type { GalleryRoom } from '../museum/gallery';
import { createRouteHelp } from '../game/help';
import { disposeHistoricalScene, type HistoricalWorld } from './history';
import type { Collider } from '../game/collision';
import { addSky } from '../rendering/sky';
import { box, mesh, outline, toon } from '../rendering/visual';

export function createScarab(parent: THREE.Object3D, position: [number, number, number], scale = 1): THREE.Group {
  const root = new THREE.Group(); root.name = 'escarabajo-egipcio'; root.position.set(...position); root.scale.setScalar(scale); parent.add(root);
  const turquoise = toon(0x3c9b98); const gold = toon(0xc4a05e); const dark = toon(0x235b62);
  const body = mesh(new THREE.IcosahedronGeometry(0.25, 2), turquoise, [0, 0, 0.035], root); body.scale.set(0.82, 1.16, 0.55);
  mesh(new THREE.IcosahedronGeometry(0.11, 1), gold, [0, 0.3, 0.02], root).scale.z = 0.5;
  box(0.018, 0.4, 0.025, gold, [0, -0.02, 0.173], root);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const feather = new THREE.Shape();
      feather.moveTo(side * 0.16, 0.05); feather.lineTo(side * (0.62 - i * 0.055), 0.21 - i * 0.14); feather.lineTo(side * (0.57 - i * 0.055), 0.1 - i * 0.14); feather.closePath();
      const wing = mesh(new THREE.ExtrudeGeometry(feather, { depth: 0.035, bevelEnabled: false }), i % 2 ? turquoise : gold, [0, 0, 0], root); outline(wing, 0.18);
    }
    for (let i = 0; i < 3; i++) {
      const leg = box(0.2, 0.025, 0.03, dark, [side * 0.23, 0.08 - i * 0.14, 0], root); leg.rotation.z = side * (0.6 - i * 0.55);
    }
  }
  mesh(new THREE.TorusGeometry(0.105, 0.016, 5, 14), gold, [0, 0.48, 0], root);
  return root;
}

// Original geometric motifs inspired by painted temple reliefs, without literal inscriptions.
function reliefTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#cbb68b'; c.fillRect(0, 0, 768, 1024);
  c.strokeStyle = '#8a7756'; c.lineWidth = 3; c.strokeRect(18, 18, 732, 988);
  for (let row = 0; row < 6; row++) for (let col = 0; col < 5; col++) {
    const x = 90 + col * 146; const y = 100 + row * 166;
    c.save(); c.translate(x, y); c.strokeStyle = (row + col) % 3 ? '#677f75' : '#a3704c'; c.lineWidth = 8;
    switch ((row * 3 + col) % 4) {
      case 0: c.beginPath(); c.ellipse(0, -14, 19, 26, 0, 0, Math.PI * 2); c.moveTo(0, 12); c.lineTo(0, 55); c.moveTo(-27, 22); c.lineTo(27, 22); c.stroke(); break;
      case 1: c.beginPath(); c.moveTo(-42, 0); c.quadraticCurveTo(0, -45, 42, 0); c.quadraticCurveTo(0, 30, -42, 0); c.moveTo(15, 20); c.lineTo(2, 55); c.stroke(); c.beginPath(); c.arc(0, -2, 9, 0, Math.PI * 2); c.fillStyle = '#566b64'; c.fill(); break;
      case 2: for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-43, i * 21 - 22); for (let j = 0; j < 5; j++) c.lineTo(-23 + j * 18, i * 21 - 22 + (j % 2 ? 0 : 12)); c.stroke(); } break;
      default: c.beginPath(); c.moveTo(0, 46); c.lineTo(0, -20); c.moveTo(-35, -34); c.quadraticCurveTo(-22, 32, 0, -5); c.quadraticCurveTo(22, 32, 35, -34); c.stroke();
    }
    c.restore();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function egyptianColumn(parent: THREE.Object3D, x: number, z: number, height: number): THREE.Group {
  const group = new THREE.Group(); group.position.set(x, 0.16, z); parent.add(group);
  const stone = toon(0xcbb789); const paint = toon(0x5d9790); const gold = toon(0xaa8658);
  mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.2, 12), stone, [0, 0.1, 0], group);
  mesh(new THREE.CylinderGeometry(0.29, 0.4, height - 0.7, 12), stone, [0, height / 2 - 0.12, 0], group);
  mesh(new THREE.CylinderGeometry(0.64, 0.3, 0.47, 12), paint, [0, height - 0.42, 0], group);
  box(1.26, 0.18, 1.26, stone, [0, height - 0.09, 0], group);
  for (const y of [0.5, 0.66, height - 0.75]) mesh(new THREE.CylinderGeometry(0.405, 0.405, 0.065, 12), gold, [0, y, 0], group);
  return group;
}

function pharaoh(parent: THREE.Object3D, x: number, z: number, height: number): THREE.Group {
  const group = new THREE.Group(); group.position.set(x, 0.15, z); group.scale.setScalar(height / 2.7); parent.add(group);
  const stone = toon(0xc4ad80); const dark = toon(0x85775e);
  box(1.2, 0.2, 1.35, stone, [0, 0.1, 0], group);
  box(0.95, 1.2, 0.95, dark, [0, 0.78, -0.16], group);
  box(0.8, 0.85, 0.5, stone, [0, 1.55, 0], group);
  for (const side of [-1, 1]) {
    box(0.3, 0.85, 0.42, stone, [side * 0.23, 0.62, 0.42], group);
    mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.75, 6), stone, [side * 0.51, 1.45, 0.17], group);
  }
  mesh(new THREE.ConeGeometry(0.6, 0.84, 4), dark, [0, 2.18, -0.05], group).rotation.y = Math.PI / 4;
  const face = mesh(new THREE.IcosahedronGeometry(0.31, 1), stone, [0, 2.2, 0.16], group); face.scale.set(0.88, 1.2, 0.68);
  box(0.08, 0.25, 0.08, dark, [0, 1.93, 0.36], group);
  for (const side of [-1, 1]) box(0.085, 0.022, 0.025, dark, [side * 0.11, 2.22, 0.368], group);
  return group;
}

function sarcophagus(parent: THREE.Object3D, x: number, z: number): THREE.Group {
  const group = new THREE.Group(); group.position.set(x, 0.82, z); parent.add(group);
  const gold = toon(0xb39a64); const blue = toon(0x456e76);
  const shape = new THREE.Shape(); shape.moveTo(-0.3, 0); shape.lineTo(-0.53, 1.57); shape.lineTo(-0.35, 2.15); shape.quadraticCurveTo(0, 2.55, 0.35, 2.15); shape.lineTo(0.53, 1.57); shape.lineTo(0.3, 0); shape.closePath();
  outline(mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.055, bevelThickness: 0.04, bevelSegments: 1, steps: 1 }), gold, [0, 0, 0], group), 0.3);
  for (let i = 0; i < 8; i++) box(0.075, 0.68, 0.03, blue, [-0.31 + i * 0.088, 1.88, 0.32], group);
  const face = mesh(new THREE.IcosahedronGeometry(0.25, 2), gold, [0, 1.92, 0.41], group); face.scale.set(0.9, 1.15, 0.5);
  for (const side of [-1, 1]) {
    const arm = box(0.47, 0.11, 0.1, gold, [side * 0.13, 1.25, 0.4], group); arm.rotation.z = side * 0.5;
    box(0.075, 0.025, 0.025, blue, [side * 0.09, 1.95, 0.54], group);
  }
  for (let i = 0; i < 6; i++) box(0.6 + i * 0.032, 0.035, 0.03, blue, [0, 0.15 + i * 0.13, 0.3], group);
  return group;
}

export function installEgyptExhibit(room: GalleryRoom) {
  const root = room.root; const colliders: Collider[] = []; const photoSolids: THREE.Object3D[] = [];
  const addSolid = (object: THREE.Object3D) => { photoSolids.push(object); colliders.push(modelCollider(object)); };
  const center = plinth(root, 0, -0.4, 1.3, 1.02); addSolid(center);
  const artifact = createScarab(root, [0, 1.63, -0.4], 0.8);
  const mount = box(0.04, 0.55, 0.04, toon(0x9f8659), [0, 1.37, -0.46], root); photoSolids.push(mount);
  exhibitLabel(root, 'EL ESCARABAJO DEL SOL', 'TURQUESA Y ORO · AMULETO CEREMONIAL', [0, 0.8, 0.255], 1.1);
  const relief = new THREE.MeshLambertMaterial({ map: reliefTexture() });
  const lights = [exhibitSpot(root, 0, -0.4, 5.17, 24, 2.35, true, true)];
  for (const side of [-1, 1]) {
    const x = side * (room.width / 2 - 1.08);
    for (const z of [-6.25, 6.25]) addSolid(egyptianColumn(root, x, z, 4.96));
    const pedestal = plinth(root, x, -3.45, 1.28, 0.67); addSolid(pedestal);
    const object = side < 0 ? sarcophagus(root, x, -3.45) : pharaoh(root, x, -3.45, 2.1);
    if (side > 0) object.position.y = 0.82;
    addSolid(object);
    addSolid(plinth(root, x, 3.15, 1.3, 0.64));
    const relic = placeModel(side < 0 ? 'obelisk' : 'urn', root, [x, 0.8, 3.15], { height: side < 0 ? 1.7 : 0.92, width: side < 0 ? 0.66 : 0.82, color: side < 0 ? 0xc6b285 : 0x639b97 }); addSolid(relic);
    exhibitLabel(root, side < 0 ? 'OBELISCO VOTIVO' : 'VASO CEREMONIAL', 'PIEDRA Y CERÁMICA', [x, 0.64, 3.82], 1.05);
    const panel = mesh(new THREE.PlaneGeometry(2.4, 3.2), relief, [side * (room.width / 2 - 0.29), 2.78, 0], root);
    panel.rotation.y = -side * Math.PI / 2; panel.castShadow = false; photoSolids.push(panel);
    lights.push(exhibitSpot(root, x, -3.45, 5.17, 13, 2.0), exhibitSpot(root, x, 3.15, 5.17, 9, 2.0));
    exhibitLabel(root, side < 0 ? 'SARCÓFAGO PINTADO' : 'FIGURA DEL FARAÓN', 'COLECCIÓN EGIPCIA', [x, 0.63, -2.78], 1.05);
  }
  const setLight = root.userData.setLight as (strength: number) => void;
  root.userData.setLight = (strength: number) => { setLight(strength); lights.forEach((light) => light(strength)); };
  root.userData.setLight(0);
  return { artifact, photoSolids, colliders };
}

export function createEgyptWorld(): HistoricalWorld {
  const scene = new THREE.Scene(); addSky(scene, true);
  scene.fog = new THREE.Fog(0xe7d3ae, 42, 95);
  const hemi = new THREE.HemisphereLight(0xffecd1, 0xb4926c, 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe0ae, 1.35); sun.position.set(-14, 25, 12); sun.castShadow = true;
  sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -28; sun.shadow.camera.right = 28; sun.shadow.camera.top = 34; sun.shadow.camera.bottom = -34; sun.shadow.normalBias = 0.06; sun.shadow.bias = -0.0005; scene.add(sun);
  const eye = new THREE.Vector3();
  scene.onBeforeRender = (_renderer, _scene, camera) => { camera.getWorldPosition(eye); hemi.intensity = THREE.MathUtils.lerp(1.25, 0.48, THREE.MathUtils.smoothstep(-eye.z, 5, 11)); };
  const sand = toon(0xdcc59c); const stone = toon(0xcdb88b); const dark = toon(0xa58a65); const teal = toon(0x5b8d85);
  const colliders: Collider[] = [];
  const solid = (w: number, h: number, d: number, x: number, z: number, y = h / 2 + 0.15) => {
    const object = box(w, h, d, stone, [x, y, z], scene); colliders.push(modelCollider(object)); return object;
  };
  const ground = mesh(new THREE.PlaneGeometry(160, 160), sand, [0, -0.02, -15], scene); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  stoneFloor(scene, 22, 44, 0, -7, 0.14);
  for (const side of [-1, 1]) {
    solid(0.65, 3.3, 44, side * 11.5, -7);
    solid(7.8, 8.1, 3, side * 5.45, -7);
    box(8.1, 0.42, 3.3, dark, [side * 5.45, 8.25, -7], scene);
    box(7.85, 0.16, 3.08, teal, [side * 5.45, 7.68, -7], scene);
    const obelisk = placeModel('obelisk', scene, [side * 8.7, 0.17, 7.5], { height: 7.1, width: 1.4, color: 0xc9b88f }); colliders.push(modelCollider(obelisk));
    for (const z of [10, -4]) placeModel(side < 0 ? 'palm' : 'bentPalm', scene, [side * 14.2, 0, z], { height: 7.7, rotation: side * 0.7 + z });
    for (const z of [-13, -22]) { const vessel = placeModel('urn', scene, [side * 7.3, 0.17, z], { height: 1.15, width: 0.92, color: 0xae895c }); colliders.push(modelCollider(vessel)); }
    const statue = pharaoh(scene, side * 6.5, 1.5, 4.7); colliders.push(modelCollider(statue));
    for (const z of [8, -1, -12, -18, -24]) {
      const column = egyptianColumn(scene, side * 4.8, z, z < -8 ? 6.85 : 4.8); colliders.push(modelCollider(column));
    }
    // Monumental silhouettes outside the bounded, walkable court.
    const pyramid = mesh(new THREE.ConeGeometry(15, 17, 4), dark, [side * 32, 8.3, -36 - side * 5], scene); pyramid.rotation.y = Math.PI / 4;
    for (let i = 0; i < 4; i++) placeModel('rock', scene, [side * (14 + i * 3), 0, 3 - i * 10], { height: 1.1 + i * 0.3, width: 2.3 });
  }
  solid(23, 2.4, 0.6, 0, 15);
  solid(23, 7.2, 0.6, 0, -29);
  solid(0.6, 7.2, 21, -9.55, -18.5); solid(0.6, 7.2, 21, 9.55, -18.5);
  box(19.7, 0.35, 21.6, dark, [0, 7.35, -18.4], scene).receiveShadow = false;
  box(3.1, 1.25, 3, stone, [0, 7.65, -7], scene);
  const relief = new THREE.MeshLambertMaterial({ map: reliefTexture() });
  for (const side of [-1, 1]) for (const z of [-12.5, -20.5]) {
    const panel = mesh(new THREE.PlaneGeometry(4.6, 5.9), relief, [side * 9.22, 3.6, z], scene); panel.rotation.y = -side * Math.PI / 2;
  }
  for (const side of [-1, 1]) {
    const panel = mesh(new THREE.PlaneGeometry(2.8, 4.4), relief, [side * 5.45, 3.9, -5.48], scene); panel.castShadow = false;
    // Linen canopy and visitors caught in a quiet ceremonial moment.
    const cloth = mesh(new THREE.PlaneGeometry(3, 2.2), new THREE.MeshLambertMaterial({ color: 0xe5d9b8, side: THREE.DoubleSide }), [side * 7.2, 3.3, 10.5], scene); cloth.rotation.x = -1.22;
    for (const dx of [-1.5, 1.5]) mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.5, 6), dark, [side * 7.2 + dx, 1.75, 10.5], scene);
    const figure = new THREE.Group(); figure.position.set(side * 7.2, 0.16, 9.7); scene.add(figure);
    mesh(new THREE.CylinderGeometry(0.2, 0.34, 1.1, 7), toon(0xece0be), [0, 0.65, 0], figure);
    mesh(new THREE.IcosahedronGeometry(0.18, 1), toon(0xa37855), [0, 1.46, 0], figure);
    for (const arm of [-1, 1]) mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.58, 6), toon(0xa37855), [arm * 0.26, 1.0, 0], figure).rotation.z = arm * 0.2;
    colliders.push(modelCollider(figure));
    for (const z of [-11, -19, -25]) {
      box(0.45, 0.16, 0.45, dark, [side * 7.5, 1.7, z], scene);
      const flame = mesh(new THREE.IcosahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: 0xffcb83 }), [side * 7.5, 2.02, z], scene); flame.scale.y = 1.7;
      const light = new THREE.PointLight(0xffcb8d, 9, 11, 1.3); light.position.copy(flame.position); scene.add(light);
    }
  }
  solid(1.65, 1.03, 1.4, 0, -25, 0.675);
  box(1.95, 0.13, 1.7, teal, [0, 1.23, -25], scene);
  const artifact = createScarab(scene, [0, 1.69, -25], 0.95);
  const relicLight = new THREE.PointLight(0xc7eee0, 5, 6, 1); relicLight.position.set(0, 3.3, -24); scene.add(relicLight);
  const dustPositions: number[] = [];
  for (let i = 0; i < 70; i++) dustPositions.push(Math.sin(i * 6.7) * 7.5, 0.6 + i % 13 * 0.38, -10 - (i * 17 % 180) / 10);
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3)), new THREE.PointsMaterial({ color: 0xf4d9a1, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(dust);
  const guide = createRouteHelp(scene, [10, 6, 2, -2, -6, -10, -14, -18, -22].map((z) => [0, 0.17, z]), new THREE.MeshBasicMaterial({ color: 0xb8cfc0 }));
  return { id: 'egipto', scene, colliders, spawn: new THREE.Vector2(0, 12), artifact: artifact.position.clone(), helpActive: guide.active, update: guide.update, dispose: () => disposeHistoricalScene(scene) };
}
