import * as THREE from 'three';
import { mesh, outline } from './visual';

type HelmetMaterials = { gold: THREE.Material; dark: THREE.Material; coral: THREE.Material; ink: THREE.Material };

// The photographed artifact and its historical counterpart keep the same silhouette.
export function createRomanHelmet(parent: THREE.Object3D, position: [number, number, number], colors: HelmetMaterials): THREE.Group {
  const root = new THREE.Group(); root.position.set(...position); parent.add(root);
  const dome = mesh(new THREE.SphereGeometry(0.52, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), colors.gold, [0, 0.12, 0], root);
  dome.scale.z = 0.9;
  outline(dome, 0.35);
  const brim = mesh(new THREE.TorusGeometry(0.5, 0.045, 6, 24), colors.dark, [0, 0.12, 0], root);
  brim.rotation.x = Math.PI / 2; brim.scale.y = 0.9;
  const opening = new THREE.Shape();
  opening.moveTo(-0.36, 0.06); opening.quadraticCurveTo(0, 0.16, 0.36, 0.06);
  opening.lineTo(0.27, -0.39); opening.quadraticCurveTo(0, -0.45, -0.27, -0.39); opening.closePath();
  mesh(new THREE.ShapeGeometry(opening), colors.ink, [0, 0, 0.28], root);
  for (const side of [-1, 1]) {
    const cheek = new THREE.Shape();
    cheek.moveTo(0.28, 0.07); cheek.quadraticCurveTo(0.54, 0.15, 0.51, -0.12);
    cheek.lineTo(0.45, -0.44); cheek.quadraticCurveTo(0.35, -0.52, 0.23, -0.39);
    cheek.lineTo(0.31, -0.24); cheek.closePath();
    const guard = mesh(new THREE.ExtrudeGeometry(cheek, { depth: 0.065, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.012, bevelSegments: 1, steps: 1, curveSegments: 5 }), colors.gold, [0, 0, 0.32], root);
    guard.scale.x = side;
    outline(guard, 0.45);
    mesh(new THREE.SphereGeometry(0.032, 8, 5), colors.dark, [side * 0.4, 0.055, 0.409], root);
    for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.014, 6, 4), colors.dark, [side * (0.35 + i % 2 * 0.07), -0.29 - Math.floor(i / 2) * 0.055, 0.405], root);
  }
  const nose = new THREE.Shape();
  nose.moveTo(-0.06, 0.11); nose.lineTo(0.06, 0.11); nose.lineTo(0.047, -0.3); nose.lineTo(0, -0.36); nose.lineTo(-0.047, -0.3); nose.closePath();
  outline(mesh(new THREE.ExtrudeGeometry(nose, { depth: 0.06, bevelEnabled: false }), colors.gold, [0, 0, 0.44], root), 0.5);
  const rear = mesh(new THREE.SphereGeometry(0.57, 12, 4, Math.PI, Math.PI, Math.PI / 2, 0.32), colors.gold, [0, 0.12, 0], root);
  rear.scale.z = 0.9;
  const ridge = new THREE.Shape();
  ridge.moveTo(-0.46, 0.46); ridge.quadraticCurveTo(0, 0.88, 0.46, 0.46);
  ridge.lineTo(0.53, 0.81); ridge.quadraticCurveTo(0, 1.25, -0.53, 0.81); ridge.closePath();
  const crest = mesh(new THREE.ExtrudeGeometry(ridge, { depth: 0.12, bevelEnabled: false, curveSegments: 8 }), colors.coral, [-0.06, 0, 0], root);
  crest.rotation.y = Math.PI / 2;
  outline(crest, 0.45);
  for (let i = 0; i < 9; i++) {
    const z = -0.44 + i * 0.11;
    const y = 0.72 - Math.abs(z) * 0.4;
    const rib = mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.33, 4), colors.dark, [0.067, y + 0.19, z], root);
    rib.rotation.x = -z * 0.6;
  }
  return root;
}
