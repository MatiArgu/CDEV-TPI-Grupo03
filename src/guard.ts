import * as THREE from 'three';
import { mesh, shadowBlob } from './visual';

type Ring = readonly [height: number, halfWidth: number, halfDepth: number, offsetZ?: number];

export type GuardModel = {
  interaction: THREE.Vector3;
  handover: () => void;
  update: (delta: number) => void;
};

function matte(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, flatShading: true });
}

// Eight-sided rings keep the silhouette shaped while using only a few triangles per part.
function loft(rings: readonly Ring[]): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (const [y, width, depth, offsetZ = 0] of rings) {
    for (let corner = 0; corner < 8; corner++) {
      const angle = corner * Math.PI / 4;
      vertices.push(Math.sin(angle) * width, y, Math.cos(angle) * depth + offsetZ);
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let corner = 0; corner < 8; corner++) {
      const next = (corner + 1) % 8;
      const lower = ring * 8;
      const upper = (ring + 1) * 8;
      indices.push(lower + corner, lower + next, upper + corner);
      indices.push(lower + next, upper + next, upper + corner);
    }
  }
  const lowerCenter = vertices.length / 3;
  vertices.push(0, rings[0][0], rings[0][3] ?? 0);
  const upperCenter = vertices.length / 3;
  vertices.push(0, rings.at(-1)![0], rings.at(-1)![3] ?? 0);
  for (let corner = 0; corner < 8; corner++) {
    const next = (corner + 1) % 8;
    indices.push(lowerCenter, next, corner);
    const last = (rings.length - 1) * 8;
    indices.push(upperCenter, last + corner, last + next);
  }
  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  indexed.setIndex(indices);
  const faceted = indexed.toNonIndexed();
  faceted.computeVertexNormals();
  indexed.dispose();
  return faceted;
}

function flatPiece(parent: THREE.Object3D, points: Array<[number, number, number]>, material: THREE.Material): void {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  const piece = mesh(geometry, material, [0, 0, 0], parent);
  piece.castShadow = false;
}

function shield(parent: THREE.Object3D, x: number, y: number, z: number, width: number, height: number, border: THREE.Material, center: THREE.Material): void {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, 0.5);
  shape.lineTo(0.5, 0.5);
  shape.lineTo(0.45, -0.18);
  shape.lineTo(0, -0.55);
  shape.lineTo(-0.45, -0.18);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  const outer = mesh(geometry, border, [x, y, z], parent);
  outer.scale.set(width, height, 1);
  outer.castShadow = false;
  const inner = mesh(geometry, center, [x, y, z + 0.003], parent);
  inner.scale.set(width * 0.69, height * 0.69, 1);
  inner.castShadow = false;
}

export function createGuard(parent: THREE.Object3D): GuardModel {
  const shirt = matte(0x287eae);
  const shirtShade = matte(0x1d648e);
  const trousers = matte(0x284c71);
  const navy = matte(0x1b3b58);
  const shoes = matte(0x222a30);
  const skin = matte(0xe0b08a);
  const skinShade = matte(0xc99370);
  const gold = matte(0xe4aa35);
  const amber = matte(0xffd15b);
  const brown = matte(0x715039);
  const brownLight = matte(0x916842);
  const silver = matte(0xc7d0cc);
  const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf4eedf, roughness: 1, side: THREE.DoubleSide });
  const flatShirt = new THREE.MeshStandardMaterial({ color: 0x4099c5, roughness: 1, side: THREE.DoubleSide });
  const flatNavy = new THREE.MeshStandardMaterial({ color: 0x1b3b58, roughness: 1, side: THREE.DoubleSide });
  const roundedJoint = new THREE.SphereGeometry(1, 8, 6);

  const root = new THREE.Group();
  root.position.set(3.7, 0, -0.65);
  root.rotation.y = -0.09;
  parent.add(root);
  shadowBlob(3.83, -0.48, 0.45, 0.28, parent);

  mesh(loft([[0.96, 0.195, 0.13], [1.09, 0.22, 0.145], [1.16, 0.205, 0.14]]), trousers, [0, 0, 0], root);
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.x = side * 0.117;
    leg.rotation.z = side * 0.015;
    root.add(leg);
    mesh(loft([[0.15, 0.088, 0.1], [0.48, 0.096, 0.105], [0.79, 0.105, 0.115], [1.07, 0.113, 0.125]]), trousers, [0, 0, 0], leg);
    mesh(loft([[0.02, 0.105, 0.18, 0.05], [0.1, 0.108, 0.175, 0.045], [0.17, 0.09, 0.11, -0.005]]), shoes, [0, 0, 0], leg);
  }

  const upperBody = new THREE.Group();
  upperBody.position.y = 1.05;
  root.add(upperBody);
  mesh(loft([
    [-0.015, 0.205, 0.13], [0.15, 0.215, 0.135],
    [0.42, 0.245, 0.145], [0.61, 0.275, 0.15], [0.71, 0.12, 0.1],
  ]), shirt, [0, 0, 0], upperBody);
  mesh(loft([[0.015, 0.23, 0.148], [0.095, 0.23, 0.15]]), brown, [0, 0, 0], upperBody);
  mesh(new THREE.BoxGeometry(0.09, 0.065, 0.018), silver, [0, 0.055, 0.165], upperBody);
  for (const side of [-1, 1]) {
    mesh(new THREE.BoxGeometry(0.075, 0.14, 0.12), brownLight, [side * 0.245, 0.04, 0.015], upperBody);
    mesh(new THREE.BoxGeometry(0.083, 0.025, 0.13), brown, [side * 0.245, 0.115, 0.015], upperBody);
  }
  mesh(new THREE.BoxGeometry(0.045, 0.31, 0.065), brown, [0.27, -0.11, 0], upperBody);
  flatPiece(upperBody, [[-0.012, 0.63, 0.159], [0.012, 0.63, 0.159], [0.012, 0.11, 0.153], [-0.012, 0.11, 0.153]], flatNavy);
  flatPiece(upperBody, [[-0.11, 0.73, 0.095], [-0.008, 0.63, 0.159], [-0.005, 0.69, 0.16], [-0.067, 0.755, 0.085]], flatShirt);
  flatPiece(upperBody, [[0.11, 0.73, 0.095], [0.067, 0.755, 0.085], [0.005, 0.69, 0.16], [0.008, 0.63, 0.159]], flatShirt);
  shield(upperBody, 0.145, 0.52, 0.16, 0.072, 0.095, gold, amber);

  const headRig = new THREE.Group();
  headRig.position.y = 0.755;
  upperBody.add(headRig);
  mesh(loft([[0, 0.06, 0.065], [0.12, 0.07, 0.075]]), skinShade, [0, -0.055, 0], headRig);
  mesh(loft([[0.005, 0.07, 0.075, 0.022], [0.05, 0.115, 0.11, 0.018], [0.15, 0.145, 0.12], [0.25, 0.15, 0.125, -0.01], [0.315, 0.135, 0.115, -0.015]]), skin, [0, 0, 0], headRig);
  for (const side of [-1, 1]) {
    const ear = mesh(roundedJoint, skinShade, [side * 0.15, 0.16, -0.005], headRig);
    ear.scale.set(0.024, 0.047, 0.024);
    mesh(new THREE.BoxGeometry(0.022, 0.012, 0.007), navy, [side * 0.055, 0.202, 0.127], headRig);
    flatPiece(headRig, [[side * 0.09, 0.246, 0.122], [side * 0.025, 0.242, 0.132], [side * 0.025, 0.251, 0.133], [side * 0.09, 0.255, 0.123]], flatNavy);
  }
  mesh(loft([[0.11, 0.022, 0.018, 0.137], [0.19, 0.015, 0.015, 0.135]]), skinShade, [0, 0, 0], headRig);
  flatPiece(headRig, [[-0.035, 0.078, 0.111], [0.035, 0.078, 0.111], [0.03, 0.081, 0.112], [-0.03, 0.081, 0.112]], flatNavy);
  mesh(loft([[0.285, 0.165, 0.125], [0.355, 0.19, 0.14], [0.425, 0.16, 0.12], [0.445, 0.105, 0.09]]), navy, [0, 0, 0], headRig);
  mesh(loft([[0.282, 0.205, 0.165, 0.045], [0.312, 0.205, 0.165, 0.045]]), shirtShade, [0, 0, 0], headRig);
  shield(headRig, 0, 0.372, 0.147, 0.073, 0.097, gold, amber);

  const arms: Array<{ shoulder: THREE.Group; elbow: THREE.Group }> = [];
  let givingShoulder: THREE.Group | null = null;
  let givingElbow: THREE.Group | null = null;
  let pamphlet: THREE.Mesh | null = null;
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.272, 0.58, 0);
    upperBody.add(shoulder);
    const shoulderCap = mesh(roundedJoint, shirt, [side * 0.015, -0.055, 0], shoulder);
    shoulderCap.scale.set(0.092, 0.12, 0.105);
    mesh(loft([[-0.42, 0.068, 0.075], [-0.22, 0.078, 0.083], [-0.06, 0.092, 0.1]]), shirt, [side * 0.012, 0, 0], shoulder);
    const elbow = new THREE.Group();
    elbow.position.set(side * 0.015, -0.405, 0);
    shoulder.add(elbow);
    const joint = mesh(roundedJoint, shirt, [0, 0, 0], elbow);
    joint.scale.set(0.07, 0.075, 0.075);
    mesh(loft([[-0.39, 0.058, 0.064], [-0.19, 0.067, 0.071], [0.015, 0.072, 0.076]]), shirt, [0, 0, 0], elbow);
    mesh(loft([[-0.43, 0.068, 0.072], [-0.38, 0.071, 0.075]]), shirtShade, [0, 0, 0], elbow);
    mesh(loft([[-0.59, 0.039, 0.04], [-0.52, 0.057, 0.05], [-0.425, 0.052, 0.05]]), skin, [0, 0.008, 0], elbow);
    const thumb = mesh(roundedJoint, skinShade, [-side * 0.049, -0.49, 0.035], elbow);
    thumb.scale.set(0.022, 0.052, 0.027);
    if (side === -1) {
      pamphlet = mesh(new THREE.PlaneGeometry(0.24, 0.17), paperMaterial, [0.038, -0.51, 0.072], elbow);
      pamphlet.rotation.x = 0.35;
      pamphlet.rotation.z = -0.14;
      pamphlet.castShadow = false;
      givingShoulder = shoulder;
      givingElbow = elbow;
    }
    arms.push({ shoulder, elbow });
  }

  // The contact shadow is the soft blob; tiny idle gestures need no dynamic sun map.
  root.traverse((object) => { object.castShadow = false; });
  let elapsed = 0;
  let handoff = -1;
  let delivered = false;
  return {
    interaction: new THREE.Vector3(3.7, 1.45, -0.65),
    handover: () => { if (!delivered) handoff = 0.001; },
    update: (delta) => {
      elapsed += delta;
      upperBody.scale.y = 1 + Math.sin(elapsed * 1.55) * 0.006;
      headRig.rotation.y = Math.sin(elapsed * 0.68) * 0.055;
      arms[1].shoulder.rotation.x = -0.06 + Math.sin(elapsed * 1.2) * 0.018;
      arms[1].elbow.rotation.x = -0.12;
      let reach = 0;
      if (handoff >= 0) {
        handoff += delta;
        const extend = THREE.MathUtils.smoothstep(handoff, 0, 0.48);
        const retract = 1 - THREE.MathUtils.smoothstep(handoff, 1.25, 1.85);
        reach = Math.min(extend, retract);
        if (handoff >= 1.24) pamphlet!.visible = false;
        if (handoff >= 1.85) {
          handoff = -1;
          delivered = true;
        }
      }
      givingShoulder!.rotation.x = -0.15 - reach * 0.55;
      givingShoulder!.rotation.z = -0.065;
      givingElbow!.rotation.x = -0.2 - reach * 0.2;
      arms[1].shoulder.rotation.z = 0.065;
      headRig.rotation.y -= reach * 0.075;
    },
  };
}
