import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

type FrameBounds = { left: number; right: number; top: number; bottom: number };

export function getFrameBounds(canvas: HTMLCanvasElement, frame: HTMLElement): FrameBounds {
  const screen = canvas.getBoundingClientRect();
  const opening = frame.getBoundingClientRect();
  return {
    left: (opening.left - screen.left) / screen.width * 2 - 1,
    right: (opening.right - screen.left) / screen.width * 2 - 1,
    top: 1 - (opening.top - screen.top) / screen.height * 2,
    bottom: 1 - (opening.bottom - screen.top) / screen.height * 2,
  };
}

export function captureFrame(renderer: THREE.WebGLRenderer, frame: HTMLElement): string {
  const source = renderer.domElement;
  const screen = source.getBoundingClientRect();
  const opening = frame.getBoundingClientRect();
  const scaleX = source.width / screen.width;
  const scaleY = source.height / screen.height;
  const print = document.createElement('canvas');
  print.width = 800;
  print.height = 600;
  const context = print.getContext('2d')!;
  context.drawImage(
    source,
    (opening.left - screen.left) * scaleX,
    (opening.top - screen.top) * scaleY,
    opening.width * scaleX,
    opening.height * scaleY,
    0, 0, print.width, print.height,
  );
  return print.toDataURL('image/png');
}

export function artifactVisible(
  camera: THREE.PerspectiveCamera,
  artifact: THREE.Object3D,
  solids: THREE.Object3D[],
  frame: FrameBounds,
): boolean {
  camera.updateMatrixWorld();
  artifact.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(artifact);
  const projection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  if (!new THREE.Frustum().setFromProjectionMatrix(projection).intersectsBox(box)) return false;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const point = new THREE.Vector3(x, y, z).project(camera);
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    }
  }
  const left = Math.max(minX, frame.left);
  const right = Math.min(maxX, frame.right);
  const bottom = Math.max(minY, frame.bottom);
  const top = Math.min(maxY, frame.top);
  if (left >= right || bottom >= top) return false;

  const raycaster = new THREE.Raycaster();
  const sample = new THREE.Vector2();
  const surfaces: THREE.Mesh[] = [];
  for (const object of [...solids, artifact]) {
    object.traverse((part) => { if (part instanceof THREE.Mesh) surfaces.push(part); });
  }
  for (let y = 0; y < 29; y++) {
    sample.y = bottom + (y + 0.5) / 29 * (top - bottom);
    for (let x = 0; x < 29; x++) {
      sample.x = left + (x + 0.5) / 29 * (right - left);
      raycaster.setFromCamera(sample, camera);
      const first = raycaster.intersectObjects(surfaces, false)[0]?.object;
      for (let parent: THREE.Object3D | null | undefined = first; parent; parent = parent.parent) {
        if (parent === artifact) return true;
      }
    }
  }
  return false;
}

export function createCameraModel(camera: THREE.PerspectiveCamera): THREE.Group {
  const rig = new THREE.Group();
  rig.position.set(1.1, -0.93, -1.5);
  rig.scale.setScalar(0.72);
  rig.rotation.set(-0.12, -0.12, -0.08);
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.61, 0.43, 0.25, 2, 0.035), new THREE.MeshBasicMaterial({ color: 0xf0f2e5 }));
  rig.add(body);
  const finder = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.105, 0.02, 2, 0.015), new THREE.MeshBasicMaterial({ color: 0x354044 }));
  finder.position.set(-0.16, 0.12, 0.132);
  rig.add(finder);
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.2, 0.33, 2, 0.025), new THREE.MeshBasicMaterial({ color: 0x354044 }));
  base.position.set(0, -0.26, 0.02);
  rig.add(base);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.13, 12), new THREE.MeshBasicMaterial({ color: 0x354044 }));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(-0.1, 0.02, -0.18);
  rig.add(lens);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.07, 0.15), new THREE.MeshBasicMaterial({ color: 0xe98569 }));
  top.position.set(0.08, 0.25, 0.01);
  rig.add(top);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.067), new THREE.MeshBasicMaterial({ color: 0x79b5a9 }));
  glass.position.set(-0.16, 0.12, 0.145);
  rig.add(glass);
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512; labelCanvas.height = 192;
  const context = labelCanvas.getContext('2d')!;
  context.fillStyle = '#f0f2e5'; context.fillRect(0, 0, 512, 192);
  context.fillStyle = '#354044'; context.font = 'bold 62px Georgia'; context.fillText('CHRONOS', 25, 85);
  context.fillStyle = '#648f83'; context.font = '25px sans-serif'; context.fillText('INSTANT   /   01', 29, 136);
  const texture = new THREE.CanvasTexture(labelCanvas); texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.128), new THREE.MeshBasicMaterial({ map: texture }));
  label.position.set(0.01, -0.064, 0.13); rig.add(label);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 0.015), new THREE.MeshBasicMaterial({ color: 0x102f31 }));
  slot.position.set(0, -0.23, 0.19); rig.add(slot);
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.2), new THREE.MeshBasicMaterial({ color: [0xe98569, 0xd9b976, 0x8db59e, 0x629995][i] }));
    stripe.position.set(0.17 + i * 0.025, -0.09, 0.131); rig.add(stripe);
  }
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.013, 5, 16), new THREE.MeshBasicMaterial({ color: 0x5c746e }));
  strap.position.set(0.36, -0.2, 0.03); strap.scale.y = 1.65; rig.add(strap);
  rig.visible = false;
  camera.add(rig);
  return rig;
}

let audioContext: AudioContext | null = null;
export function playShutter(): void {
  audioContext ??= new AudioContext();
  const now = audioContext.currentTime;
  for (const [delay, frequency] of [[0, 220], [0.07, 125]] as const) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, now + delay);
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.08, now + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.055);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.06);
  }
}
