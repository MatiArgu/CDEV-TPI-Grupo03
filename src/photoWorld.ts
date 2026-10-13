import * as THREE from 'three';
import type { Collider } from './scene';
import { box, mesh, outline, palette, toon } from './visual';

export type PhotoWorld = {
  scene: THREE.Scene;
  colliders: Collider[];
  artifact: THREE.Group | null;
  solids: THREE.Object3D[];
  dispose: () => void;
};

// Temporary room for the stage 4 camera test. It is not a museum area.
export function createPhotoWorld(echo = false): PhotoWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(echo ? 0x688f9f : 0xa3d8cc);
  scene.fog = new THREE.Fog(echo ? 0x688f9f : 0xa3d8cc, 14, 30);
  scene.add(new THREE.AmbientLight(0xffffff, echo ? 1.25 : 1.4));
  const sun = new THREE.DirectionalLight(echo ? 0xb6e8ff : 0xfff2d8, 2.1);
  sun.position.set(-5, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  scene.add(sun);

  const floorMat = toon(echo ? 0x95b9b7 : palette.stone);
  const wallMat = toon(echo ? 0x6a9a9b : palette.cream);
  const trimMat = toon(echo ? 0xd2e8d7 : palette.sand);
  const darkMat = toon(echo ? 0x365f69 : palette.ink);
  const coralMat = toon(echo ? 0xffc39b : palette.coral);
  const goldMat = toon(0xd1a86c);
  const solids: THREE.Object3D[] = [];

  box(13, 0.2, 14, floorMat, [0, -0.12, 0], scene).castShadow = false;
  for (const [x, z, width, depth] of [
    [0, -6.8, 13, 0.35], [0, 6.8, 13, 0.35], [-6.5, 0, 0.35, 14], [6.5, 0, 0.35, 14],
  ] as const) {
    box(width, 3.8, depth, wallMat, [x, 1.9, z], scene);
  }
  box(13, 0.16, 0.18, trimMat, [0, 3.65, -6.55], scene);
  for (const x of [-5.7, -3.4, 3.4, 5.7]) {
    outline(box(0.38, 3.15, 0.38, trimMat, [x, 1.58, -6.35], scene), 0.42);
  }
  for (const z of [4.7, 2.6, 0.5, -1.6, -3.7]) {
    box(0.035, 0.012, 1.0, trimMat, [0, 0.006, z], scene).castShadow = false;
  }
  for (const side of [-1, 1]) {
    outline(box(1.6, 1.15, 0.16, darkMat, [side * 4.4, 1.85, -6.56], scene), 0.45);
    box(1.36, 0.87, 0.05, coralMat, [side * 4.4, 1.85, -6.45], scene).castShadow = false;
  }

  let artifact: THREE.Group | null = null;
  if (!echo) {
    const pedestal = box(1.5, 1.08, 1.18, trimMat, [0, 0.54, -3.8], scene);
    outline(pedestal, 0.58);
    artifact = new THREE.Group();
    artifact.position.set(0, 1.72, -3.8);
    scene.add(artifact);
    const core = mesh(new THREE.DodecahedronGeometry(0.49, 0), coralMat, [0, 0, 0], artifact);
    outline(core, 0.72);
    const ring = mesh(new THREE.TorusGeometry(0.63, 0.055, 6, 24), goldMat, [0, 0, 0], artifact);
    ring.rotation.y = Math.PI / 7;
    outline(ring, 0.55);
    const crown = mesh(new THREE.ConeGeometry(0.16, 0.28, 6), goldMat, [0, 0.63, 0], artifact);
    outline(crown, 0.55);
    // The screen on the right hides the entire artifact from one angle.
    const screen = box(1.62, 2.5, 0.24, darkMat, [1.35, 1.25, 0.3], scene);
    outline(screen, 0.72);
    box(1.72, 0.13, 0.34, goldMat, [1.35, 2.54, 0.3], scene);
  } else {
    const returnBase = box(1.9, 0.52, 1.1, trimMat, [0, 0.26, -3.8], scene);
    outline(returnBase, 0.58);
    const arch = new THREE.Group();
    arch.position.set(0, 0, -3.8);
    scene.add(arch);
    for (const side of [-1, 1]) {
      outline(box(0.2, 2.3, 0.25, goldMat, [side * 0.76, 1.67, 0], arch), 0.6);
    }
    const top = mesh(new THREE.TorusGeometry(0.76, 0.11, 6, 16, Math.PI), goldMat, [0, 2.82, 0], arch);
    outline(top, 0.6);
    const glow = mesh(new THREE.PlaneGeometry(1.3, 2.1), new THREE.MeshBasicMaterial({ color: 0xb9f4df, transparent: true, opacity: 0.68, side: THREE.DoubleSide }), [0, 1.67, 0], arch);
    glow.castShadow = false;
  }

  const colliders: Collider[] = [
    { minX: -6.5, maxX: -6.15, minZ: -7, maxZ: 7 },
    { minX: 6.15, maxX: 6.5, minZ: -7, maxZ: 7 },
    { minX: -6.5, maxX: 6.5, minZ: -7, maxZ: -6.45 },
    { minX: -6.5, maxX: 6.5, minZ: 6.45, maxZ: 7 },
    { minX: -0.84, maxX: 0.84, minZ: -4.48, maxZ: -3.12 },
  ];
  if (!echo) colliders.push({ minX: 0.45, maxX: 2.25, minZ: 0.05, maxZ: 0.55 });

  scene.traverse((part) => {
    if (!(part instanceof THREE.Mesh)) return;
    for (let parent = part.parent; parent; parent = parent.parent) {
      if (parent === artifact) return;
    }
    solids.push(part);
  });

  return {
    scene, colliders, artifact, solids,
    dispose: () => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      sun.shadow.dispose();
      scene.clear();
    },
  };
}
