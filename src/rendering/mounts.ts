import * as THREE from 'three';
import { placeModel } from './assets';
import { box, mesh, silhouette, toon } from './visual';

// Arrival vehicles. Each faces +Z and exposes a gait for the ride to animate.
export type Mount = { root: THREE.Group; seat: THREE.Vector3; gait: (time: number, pace: number) => void };

function blob(parent: THREE.Object3D, material: THREE.Material, position: [number, number, number], scale: [number, number, number]): THREE.Mesh {
  const part = mesh(new THREE.IcosahedronGeometry(1, 1), material, position, parent);
  part.scale.set(...scale);
  silhouette(part, 1.04);
  return part;
}

function limb(parent: THREE.Object3D, material: THREE.Material, from: THREE.Vector3, to: THREE.Vector3, radius: number): THREE.Mesh {
  const part = mesh(new THREE.CylinderGeometry(radius * 0.8, radius, from.distanceTo(to), 7), material, from.clone().add(to).multiplyScalar(0.5).toArray() as [number, number, number], parent);
  part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return part;
}

function legs(root: THREE.Group, material: THREE.Material, hoof: THREE.Material, hips: Array<[number, number]>, height: number, radius: number) {
  return hips.map(([x, z]) => {
    const hip = new THREE.Group(); hip.position.set(x, height, z); root.add(hip);
    limb(hip, material, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -height + 0.12, 0), radius);
    box(radius * 2.3, 0.12, radius * 2.8, hoof, [0, -height + 0.06, 0.03], hip);
    return hip;
  });
}

// Diagonal pairs move together, like a walking quadruped.
function walk(hips: THREE.Group[], time: number, pace: number, rate: number, swing: number): void {
  hips.forEach((hip, i) => { hip.rotation.x = Math.sin(time * rate + (i === 0 || i === 3 ? 0 : Math.PI)) * swing * Math.min(1, pace); });
}

export function camel(parent: THREE.Object3D): Mount {
  const root = new THREE.Group(); parent.add(root);
  const hide = toon(0xc9a26b); const dark = toon(0x8d6c45); const blanket = toon(0xe58362); const trim = toon(0x4f8c84);
  blob(root, hide, [0, 1.55, 0], [0.55, 0.5, 1.05]);
  blob(root, hide, [0, 2.0, -0.1], [0.45, 0.45, 0.55]);
  limb(root, hide, new THREE.Vector3(0, 1.6, 0.85), new THREE.Vector3(0, 2.3, 1.35), 0.17);
  blob(root, hide, [0, 2.35, 1.55], [0.17, 0.17, 0.33]);
  for (const side of [-1, 1]) box(0.05, 0.12, 0.05, dark, [side * 0.11, 2.53, 1.42], root);
  limb(root, dark, new THREE.Vector3(0, 1.6, -1.0), new THREE.Vector3(0, 1.05, -1.15), 0.04);
  box(1.0, 0.1, 1.0, blanket, [0, 2.38, -0.12], root);
  box(1.04, 0.05, 0.12, trim, [0, 2.33, 0.36], root); box(1.04, 0.05, 0.12, trim, [0, 2.33, -0.6], root);
  for (const side of [-1, 1]) box(0.06, 0.4, 0.9, blanket, [side * 0.5, 2.15, -0.12], root);
  const hips = legs(root, hide, dark, [[-0.28, 0.7], [0.28, 0.7], [-0.28, -0.7], [0.28, -0.7]], 1.3, 0.1);
  return { root, seat: new THREE.Vector3(0, 3.25, -0.25), gait: (time, pace) => walk(hips, time, pace, 5.5, 0.4) };
}

export function horse(parent: THREE.Object3D): Mount {
  const root = new THREE.Group(); parent.add(root);
  const coat = toon(0x8a5a3c); const mane = toon(0x3c2a20); const leather = toon(0x5e3f2a); const cloth = toon(0xb5504a);
  blob(root, coat, [0, 1.35, 0], [0.42, 0.45, 0.95]);
  limb(root, coat, new THREE.Vector3(0, 1.5, 0.7), new THREE.Vector3(0, 2.15, 1.05), 0.2);
  const head = blob(root, coat, [0, 2.1, 1.3], [0.16, 0.18, 0.38]); head.rotation.x = 0.55;
  box(0.06, 0.18, 0.75, mane, [0, 2.0, 0.9], root).rotation.x = -0.9;
  for (const side of [-1, 1]) box(0.05, 0.13, 0.05, mane, [side * 0.08, 2.35, 1.12], root);
  limb(root, mane, new THREE.Vector3(0, 1.5, -0.9), new THREE.Vector3(0, 0.85, -1.1), 0.07);
  box(0.95, 0.07, 0.95, cloth, [0, 1.79, -0.05], root);
  box(0.55, 0.16, 0.6, leather, [0, 1.88, -0.05], root);
  const hips = legs(root, coat, mane, [[-0.22, 0.62], [0.22, 0.62], [-0.22, -0.62], [0.22, -0.62]], 1.05, 0.085);
  return { root, seat: new THREE.Vector3(0, 2.75, -0.1), gait: (time, pace) => walk(hips, time, pace, 7, 0.5) };
}

export function rowboat(parent: THREE.Object3D, color?: number): Mount {
  const root = new THREE.Group(); parent.add(root);
  placeModel('rowboat', root, [0, 0, 0], { height: 0.75, width: 1.5, depth: 3.4, color });
  const oars = [-1, 1].map((side) => {
    const oar = placeModel('paddle', root, [side * 0.7, 0.45, 0.1], { height: 1.9, width: 0.16 });
    oar.rotation.z = side * 1.2;
    return { oar, side };
  });
  return {
    root,
    seat: new THREE.Vector3(0, 1.2, -0.75),
    gait: (time, pace) => oars.forEach(({ oar, side }) => { oar.rotation.y = side * Math.sin(time * 3) * 0.5 * Math.min(1, pace); }),
  };
}
