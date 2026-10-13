import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Small shared first-person hand, with the thumb over the object being held. */
export function holdingHand(side: -1 | 1): THREE.Group {
  const hand = new THREE.Group();
  const skin = new THREE.MeshBasicMaterial({ color: 0xc99776 });
  const finger = new THREE.MeshBasicMaterial({ color: 0xd9ad8b });
  const sleeve = new THREE.MeshBasicMaterial({ color: 0x344e4b });
  function part(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.018), material);
    mesh.position.set(x, y, z);
    hand.add(mesh);
    return mesh;
  }
  part(0.13, 0.29, 0.12, sleeve, side * 0.035, -0.22, -0.025).rotation.z = side * 0.17;
  part(0.10, 0.16, 0.065, skin, 0, -0.02, 0);
  for (let i = 0; i < 4; i++) part(0.038, 0.075, 0.055, finger, -side * 0.03, 0.043 - i * 0.031, -0.025);
  part(0.055, 0.095, 0.045, finger, -side * 0.055, 0.015, 0.043).rotation.z = -side * 0.55;
  return hand;
}

// Draw held objects in a separate depth pass, after the environment and its glass.
export function foreground(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.layers.set(1);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => { material.depthTest = true; material.depthWrite = true; });
    object.castShadow = object.receiveShadow = false;
    object.frustumCulled = false;
  });
}
