import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMuseumScene } from './museum';
import { createPamphlet } from './pamphlet';
import { createPlayerControls } from './player';
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
const studyMode = requestedView !== null && requestedView in views;
app.dataset.mode = studyMode ? 'study' : 'player';

try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(studyMode ? 45 : 68, 1, 0.1, studyMode ? 60 : 100);
  let scene: THREE.Scene;
  let updateControls: (delta: number) => void;
  let updateScene: (delta: number) => void = () => {};

  if (studyMode) {
    const world = createStudyScene();
    scene = world.scene;
    const initialView = requestedView as View;
    app.dataset.view = initialView;
    camera.position.copy(views[initialView].position);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(views[initialView].target);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.7;
    controls.maxDistance = 21;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.update();

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
    updateControls = () => {
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
    };
  } else {
    const world = createMuseumScene();
    scene = world.scene;
    updateScene = world.update;
    createPamphlet();
    const pamphlet = document.querySelector<HTMLElement>('#pamphlet')!;
    const toast = document.querySelector<HTMLElement>('#game-toast')!;
    const help = document.querySelector<HTMLElement>('#player-help')!;
    let hasPamphlet = false;
    let hasSeenMap = false;
    let enteredHall = false;
    let toastTimer = 0;
    const toGuard = new THREE.Vector3();

    function showToast(message: string): void {
      toast.textContent = message;
      toast.hidden = false;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
    }

    updateControls = createPlayerControls(camera, renderer.domElement, {
      colliders: world.colliders,
      start: new THREE.Vector2(1, 17),
      findInteraction: (position, gaze) => {
        if (hasPamphlet) return null;
        toGuard.set(world.guard.x - position.x, world.guard.y - 1.7, world.guard.z - position.y);
        if (Math.hypot(toGuard.x, toGuard.z) > 2.55 || gaze.dot(toGuard.normalize()) < 0.55) return null;
        return {
          label: 'Recibir panfleto del guardia',
          activate: () => {
            hasPamphlet = true;
            app.dataset.storyState = 'pamphlet-received';
            world.openEntrance();
            help.textContent = 'WASD CAMINAR · M PANFLETO · ESC PAUSAR';
            showToast('El guardia te entregó el panfleto. Pulsá M para desplegarlo.');
          },
        };
      },
      canOpenPamphlet: () => hasPamphlet,
      onPamphletChange: (open) => {
        pamphlet.hidden = !open;
        if (open && !hasSeenMap) {
          hasSeenMap = true;
          app.dataset.storyState = 'map-seen';
          world.revealRome();
        }
      },
      onPositionChange: (position) => {
        if (position.y < -4.8 && position.y > -21.1 && Math.abs(position.x) < 8.1) {
          app.dataset.location = 'hall';
          if (!enteredHall) {
            enteredHall = true;
            showToast(hasSeenMap ? 'La luz cálida señala el futuro sector de Roma.' : 'Entraste al hall. Abrí el panfleto con M.');
          }
        } else {
          app.dataset.location = 'exterior';
        }
      },
    });
  }

  function resize(): void {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let previousTime = performance.now();
  renderer.setAnimationLoop((time) => {
    const delta = (time - previousTime) / 1000;
    previousTime = time;
    updateControls(delta);
    updateScene(delta);
    renderer.render(scene, camera);
  });
} catch (cause) {
  error.hidden = false;
  error.textContent = `No se pudo iniciar la escena 3D: ${cause instanceof Error ? cause.message : String(cause)}`;
}
