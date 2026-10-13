import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStudyScene } from './scene';
import './style.css';

const container = document.querySelector<HTMLDivElement>('#scene')!;
const error = document.querySelector<HTMLDivElement>('#error')!;
const app = document.querySelector<HTMLElement>('#app')!;

const views = {
  far: { position: new THREE.Vector3(8.5, 3.7, 12.8), target: new THREE.Vector3(0, 1.8, -1.1) },
  mid: { position: new THREE.Vector3(5.2, 2.75, 8.2), target: new THREE.Vector3(0, 1.8, -0.75) },
  near: { position: new THREE.Vector3(2.2, 2.15, 4.3), target: new THREE.Vector3(0, 1.72, 0.8) },
} as const;
type View = keyof typeof views;
const requestedView = new URLSearchParams(location.search).get('view');
const initialView: View = requestedView && requestedView in views ? requestedView as View : 'far';
app.dataset.view = initialView;

try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.copy(views[initialView].position);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(views[initialView].target);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.7;
  controls.maxDistance = 21;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.update();

  const scene = createStudyScene();
  let destination: View | null = null;
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('button[data-view]')];
  buttons.forEach((button) => {
    const view = button.dataset.view as View;
    button.setAttribute('aria-pressed', String(view === initialView));
    button.addEventListener('click', () => {
      destination = view;
      app.dataset.view = view;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  controls.addEventListener('start', () => { destination = null; });

  function resize(): void {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  renderer.setAnimationLoop(() => {
    if (destination) {
      const next = views[destination];
      camera.position.lerp(next.position, 0.075);
      controls.target.lerp(next.target, 0.075);
      if (camera.position.distanceTo(next.position) < 0.02 && controls.target.distanceTo(next.target) < 0.02) {
        camera.position.copy(next.position);
        controls.target.copy(next.target);
        destination = null;
      }
    }
    controls.update();
    renderer.render(scene, camera);
  });
} catch (cause) {
  error.hidden = false;
  error.textContent = `No se pudo iniciar la escena 3D: ${cause instanceof Error ? cause.message : String(cause)}`;
}
