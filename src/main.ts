import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadModels } from './assets';
import { areaCatalog, areaOrder, availabilityCopy, availabilityOf, type AreaId } from './catalog';
import { galleryLayout, museumLayout } from './museumLayout';
import { createMuseumScene } from './museum';
import { createPamphlet } from './pamphlet';
import { createPlayerControls } from './player';
import { artifactVisible, captureFrame, createCameraModel, getFrameBounds, playShutter } from './photo';
import { createRomeWorld, type RomeWorld } from './rome';
import { createStudyScene } from './scene';
import { playTimeTransition } from './timeTransition';

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
  const startButton = document.querySelector<HTMLButtonElement>('#menu-button')!;
  startButton.disabled = true;
  startButton.textContent = 'Preparando la visita…';
  await loadModels();
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
    scene.add(camera);
    const updateMuseum = (delta: number) => world.update(delta, app.dataset.playState === 'playing' ? camera : undefined);
    updateScene = updateMuseum;
    const pamphletView = createPamphlet();
    const cameraModel = createCameraModel(camera);
    const pamphlet = document.querySelector<HTMLElement>('#pamphlet')!;
    const toast = document.querySelector<HTMLElement>('#game-toast')!;
    const help = document.querySelector<HTMLElement>('#player-help')!;
    const viewfinder = document.querySelector<HTMLElement>('#photo-viewfinder')!;
    const photoResult = document.querySelector<HTMLElement>('#photo-result')!;
    const photoImage = document.querySelector<HTMLImageElement>('#photo-image')!;
    const photoLabel = document.querySelector<HTMLElement>('#photo-result-label')!;
    const transition = document.querySelector<HTMLElement>('#time-transition')!;
    let hasPamphlet = false;
    let hasSeenMap = false;
    let enteredHall = false;
    const completedAreas = new Set<AreaId>();
    const visitedRooms = new Set<string>();
    let history: RomeWorld | null = null;
    let acceptedPhoto: string | null = null;
    let museumColliders = [...world.colliders];
    let toastTimer = 0;
    const toGuard = new THREE.Vector3();
    const toDoor = new THREE.Vector3();

    function showToast(message: string): void {
      toast.textContent = message;
      toast.hidden = false;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
    }

    async function takePhoto(): Promise<void> {
      const active = areaOrder.find((id) => availabilityOf(id) === 'playable' && !completedAreas.has(id));
      const exhibit = active && world.exhibits.get(active);
      if (!active || !exhibit || history) {
        controls.finishCinematic(true);
        return;
      }
      cameraModel.visible = false;
      renderer.render(scene, camera);
      const frame = getFrameBounds(renderer.domElement, viewfinder);
      const photo = captureFrame(renderer, viewfinder);
      const valid = artifactVisible(camera, exhibit.artifact, exhibit.photoSolids, frame);
      cameraModel.visible = true;
      playShutter();
      photoImage.src = photo;
      photoLabel.textContent = `REVELANDO / ${String(world.rooms.find((room) => room.id === active)!.number).padStart(2, '0')}`;
      photoResult.classList.remove('photo-developed');
      photoResult.hidden = false;
      requestAnimationFrame(() => photoResult.classList.add('photo-developed'));
      await new Promise<void>((resolve) => window.setTimeout(resolve, 2600));
      if (!valid) {
        photoLabel.textContent = 'SIN ECO / VOLVÉ A INTENTARLO';
        await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
        photoResult.hidden = true;
        controls.finishCinematic(true);
        return;
      }
      acceptedPhoto = photo;
      photoLabel.textContent = 'ECO ENCONTRADO / ROMA';
      controls.setCinematic('transition');
      await playTimeTransition(transition, () => {
        photoResult.hidden = true;
        scene.remove(camera);
        museumColliders = [...world.colliders];
        history = createRomeWorld();
        scene = history.scene;
        scene.add(camera);
        world.colliders.splice(0, world.colliders.length, ...history.colliders);
        controls.teleport(history.spawn);
        updateScene = (delta) => {
          if (app.dataset.playState !== 'playing' || !history) return;
          const hadHelp = history.helpActive();
          history.update(delta);
          if (!hadHelp && history.helpActive()) showToast('Un rastro tenue recorre la pasarela hacia el casco.');
        };
      });
      controls.finishCinematic(false);
      help.textContent = 'WASD CAMINAR · SHIFT CORRER · E RECOGER · M PANFLETO · ESC PAUSAR';
      showToast('El tiempo se detuvo en la naumaquia. Seguí la pasarela.');
    }

    async function finishRome(): Promise<void> {
      if (!history || !acceptedPhoto) return;
      const completedId = history.id;
      controls.setCinematic('transition');
      await playTimeTransition(transition, () => {
        scene.remove(camera);
        history!.dispose();
        history = null;
        scene = world.scene;
        scene.add(camera);
        world.colliders.splice(0, world.colliders.length, ...museumColliders);
        completedAreas.add(completedId);
        pamphletView.complete(completedId, acceptedPhoto!);
        const room = world.rooms.find((item) => item.id === completedId)!;
        (room.root.userData.setLight as (strength: number) => void)(0);
        controls.teleport(new THREE.Vector2(room.center.x, room.center.y + 4.15));
        updateScene = updateMuseum;
      });
      controls.finishCinematic(false);
      controls.openPamphlet();
      help.textContent = 'WASD CAMINAR · SHIFT CORRER · M PANFLETO · E PUERTAS · ESC PAUSAR';
      showToast('Roma completada: 1/10. Egipto se instalará en la próxima etapa.');
    }

    const controls = createPlayerControls(camera, renderer.domElement, {
      colliders: world.colliders,
      start: world.spawn,
      findInteraction: (position, gaze) => {
        if (history) {
          const toArtifact = history.artifact.clone().sub(new THREE.Vector3(position.x, 1.7, position.y));
          if (Math.hypot(toArtifact.x, toArtifact.z) > 2.9 || gaze.dot(toArtifact.normalize()) < 0.38) return null;
          return { label: 'Recoger casco de gladiador', activate: () => { void finishRome(); } };
        }
        if (!hasPamphlet) {
          toGuard.set(world.guard.x - position.x, world.guard.y - 1.7, world.guard.z - position.y);
          if (Math.hypot(toGuard.x, toGuard.z) > 2.55 || gaze.dot(toGuard.normalize()) < 0.55) return null;
          return {
            label: 'Recibir panfleto del guardia',
            activate: () => {
              hasPamphlet = true;
              app.dataset.storyState = 'pamphlet-received';
              world.openEntrance();
              help.textContent = 'WASD CAMINAR · SHIFT CORRER · C POLAROID · M PANFLETO · E PUERTAS · ESC PAUSAR';
              showToast('El guardia te entregó el panfleto. Pulsá M para desplegarlo.');
            },
          };
        }
        const door = world.doors.find((item) => {
          if (item.progress > 0 || item.opening) return false;
          toDoor.set(item.position.x - position.x, 0, item.position.y - position.y);
          return toDoor.length() < 2.55 && gaze.dot(toDoor.normalize()) > 0.58;
        });
        if (!door) return null;
        const required = door.required;
        const target = door.target;
        const targetReady = !target || !required || availabilityOf(target) === 'playable';
        const unlocked = (!required || completedAreas.has(required)) && targetReady;
        return {
          label: unlocked
            ? `Abrir ${target ? areaCatalog[target].name : 'regreso al hall'}`
            : `Puerta cerrada · ${required && !completedAreas.has(required) ? `completá ${areaCatalog[required].name}` : 'sala en preparación'}`,
          activate: () => {
            if (unlocked) {
              world.openDoor(door);
              showToast(target
                ? `${areaCatalog[target].name}: las luces vuelven a encenderse.`
                : 'El recorrido vuelve al hall.');
            } else {
              showToast(required && !completedAreas.has(required)
                ? `Primero tenés que completar ${areaCatalog[required].name}.`
                : 'Esa sala todavía está en preparación.');
            }
          },
        };
      },
      canOpenPamphlet: () => hasPamphlet,
      canEquipCamera: () => {
        if (history || !hasPamphlet) return false;
        const active = areaOrder.find((id) => availabilityOf(id) === 'playable' && !completedAreas.has(id));
        return !!active && world.roomAt(new THREE.Vector2(camera.position.x, camera.position.z))?.id === active;
      },
      onCameraChange: (equipped) => {
        cameraModel.visible = equipped;
        app.dataset.mode = equipped ? 'photo' : 'player';
      },
      onShutter: () => { void takePhoto(); },
      onPamphletChange: (open) => {
        pamphlet.hidden = !open;
        if (open && !hasSeenMap) {
          hasSeenMap = true;
          app.dataset.storyState = 'map-seen';
        }
      },
      onPositionChange: (position) => {
        if (history) {
          app.dataset.location = 'roma-history';
          delete app.dataset.room;
          return;
        }
        const room = world.roomAt(position);
        if (room) {
          app.dataset.location = 'room';
          app.dataset.room = room.id;
          if (!visitedRooms.has(room.id)) {
            visitedRooms.add(room.id);
            showToast(room.id === 'roma'
              ? 'Roma Antigua: observá el casco. Pulsá C para preparar la Polaroid.'
              : `${String(room.number).padStart(2, '0')} · ${areaCatalog[room.id].name} — ${availabilityCopy(areaCatalog[room.id].availability).description}.`);
          }
        } else if (
          position.y < galleryLayout.frontZ - galleryLayout.step * 4
          && position.y > galleryLayout.frontZ - galleryLayout.step * 5
          && Math.abs(position.x) < galleryLayout.innerX
        ) {
          app.dataset.location = 'gallery';
          delete app.dataset.room;
        } else if (position.y < museumLayout.frontZ - 0.5 && position.y > museumLayout.hallBackZ && Math.abs(position.x) < museumLayout.halfWidth - 0.3) {
          app.dataset.location = 'hall';
          delete app.dataset.room;
          if (!enteredHall) {
            enteredHall = true;
            showToast(hasSeenMap ? 'Acercate a la puerta 01 y pulsá E para entrar.' : 'Entraste al hall. Abrí el panfleto con M.');
          }
        } else {
          app.dataset.location = 'exterior';
          delete app.dataset.room;
        }
      },
    });
    updateControls = controls.update;
  }

  function resize(): void {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
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
  startButton.disabled = false;
  startButton.textContent = 'Comenzar visita ↗';
} catch (cause) {
  error.hidden = false;
  error.textContent = `No se pudo iniciar la escena 3D: ${cause instanceof Error ? cause.message : String(cause)}`;
}
