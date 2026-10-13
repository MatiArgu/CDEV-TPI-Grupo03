import * as THREE from 'three';

export const palette = {
  mint: 0x8ee0cf,
  turquoise: 0x60c6bb,
  green: 0x4eaa76,
  cream: 0xf0f2e5,
  sage: 0xc5d9c8,
  sand: 0xe6d7ad,
  coral: 0xe98569,
  ink: 0x354044,
  stone: 0xf4edda,
  shadow: 0x92afa3,
} as const;

const gradient = new THREE.DataTexture(
  new Uint8Array([115, 194, 255]),
  3,
  1,
  THREE.RedFormat,
);
gradient.magFilter = THREE.NearestFilter;
gradient.minFilter = THREE.NearestFilter;
gradient.needsUpdate = true;

export function toon(color: THREE.ColorRepresentation): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color, gradientMap: gradient });
}

export const materials = {
  cream: toon(palette.cream),
  stone: toon(palette.stone),
  sand: toon(palette.sand),
  sage: toon(palette.sage),
  mint: toon(palette.mint),
  turquoise: toon(palette.turquoise),
  green: toon(palette.green),
  coral: toon(palette.coral),
  ink: toon(palette.ink),
  gold: toon(0xc9a568),
  darkGold: toon(0x786d58),
  door: toon(0x477f80),
};

// These palette materials survive historical scenes and remain in the museum.
Object.values(materials).forEach(material => { material.userData.sharedMaterial = true; });

const silhouetteMaterial = new THREE.MeshBasicMaterial({ color: palette.ink, side: THREE.BackSide });
silhouetteMaterial.userData.sharedMaterial = true;

export function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  parent: THREE.Object3D,
): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

export function box(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
  position: [number, number, number],
  parent: THREE.Object3D,
): THREE.Mesh {
  return mesh(new THREE.BoxGeometry(width, height, depth), material, position, parent);
}

// Closed rectangular roof with four pitched faces, a level ridge and a soffit.
export function hippedRoof(
  width: number, height: number, depth: number, material: THREE.Material,
  position: [number, number, number], parent: THREE.Object3D,
): THREE.Mesh {
  const w = width / 2;
  const d = depth / 2;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -w, 0, d, w, 0, d, w, 0, -d, -w, 0, -d,
    -w * 0.82, height, d * 0.38, w * 0.82, height, d * 0.38,
    w * 0.82, height, -d * 0.38, -w * 0.82, height, -d * 0.38,
  ], 3));
  geometry.setIndex([0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7, 4, 5, 6, 4, 6, 7,
    0, 3, 2, 0, 2, 1]);
  const flat = geometry.toNonIndexed();
  flat.computeVertexNormals();
  geometry.dispose();
  const roof = mesh(flat, material, position, parent);
  outline(roof, 0.23);
  return roof;
}

// A back-facing shell gives a drawn outer contour without a screen-space effect.
export function silhouette(object: THREE.Mesh, scale = 1.026): void {
  const shell = new THREE.Mesh(object.geometry, silhouetteMaterial);
  shell.scale.setScalar(scale);
  shell.castShadow = false;
  shell.receiveShadow = false;
  object.add(shell);
}

export function outline(object: THREE.Mesh, opacity = 0.7): void {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(object.geometry, 36),
    new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity }),
  );
  object.add(edges);
}

export function inkStroke(points: Array<[number, number, number]>, parent: THREE.Object3D, opacity = 0.65): void {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity, depthWrite: false }),
  );
  parent.add(line);
}

export function shadowBlob(
  x: number,
  z: number,
  width: number,
  depth: number,
  parent: THREE.Object3D,
): void {
  const blob = mesh(
    new THREE.CircleGeometry(1, 20),
    new THREE.MeshBasicMaterial({ color: palette.shadow, transparent: true, opacity: 0.26, depthWrite: false }),
    [x, 0.065, z],
    parent,
  );
  blob.rotation.x = -Math.PI / 2;
  blob.scale.set(width, depth, 1);
  blob.castShadow = false;
  blob.receiveShadow = false;
}
