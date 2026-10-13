import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadModels } from './rendering/assets';
import { areaCatalog, areaOrder, availabilityCopy, availabilityOf, type AreaId } from './game/catalog';
import { museumLayout } from './museum/museumLayout';
import { createMuseumScene } from './museum/museum';
import { createPamphlet } from './game/pamphlet';
import { createPlayerControls } from './game/player';
import { artifactVisible, captureFrame, createCameraModel, getFrameBounds, playShutter } from './game/photo';
import { createRomeWorld } from './worlds/rome';
import { createMoonWorld } from './worlds/moon';
import { createSpaceHelmet } from './game/spaceHelmet';
import { createJapanWorld } from './worlds/japan';
import { createMedievalWorld } from './worlds/medieval';
import { createEgyptWorld } from './worlds/egypt';
import type { HistoricalWorld } from './worlds/history';
import { loadProgress, photoForSave, resetProgress, saveProgress } from './game/progress';
import { createStudyScene } from './study/studyScene';
import { playTimeTransition } from './game/timeTransition';

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(studyMode ? 45 : 68, 1, 0.1, studyMode ? 60 : 100);
  let scene: THREE.Scene;
  let updateControls: (delta: number) => void;
  let updateScene: (delta: number) => void = () => {};
  let hasHeldItems = () => false;

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
    const updateMuseum = (delta: number) => {
      if (app.dataset.playState === 'paused' || app.dataset.playState === 'intro') return;
      world.update(Math.min(delta, 0.05), app.dataset.playState === 'playing' ? camera : undefined);
    };
    updateScene = updateMuseum;
    const pamphletView = createPamphlet(camera);
    const cameraModel = createCameraModel(camera);
    const spaceHelmet = createSpaceHelmet(camera);
    const setSpacesuit = (enabled: boolean) => {
      spaceHelmet.root.visible = enabled;
      pamphletView.root.traverse(object => object.userData.setSpacesuit?.(enabled));
      camera.far = enabled ? 230 : 100; camera.updateProjectionMatrix();
    };
    hasHeldItems = () => pamphletView.root.visible || cameraModel.root.visible || spaceHelmet.root.visible;
    const toast = document.querySelector<HTMLElement>('#game-toast')!;
    const help = document.querySelector<HTMLElement>('#player-help')!;
    const viewfinder = document.querySelector<HTMLElement>('#photo-viewfinder')!;
    const transition = document.querySelector<HTMLElement>('#time-transition')!;
    const saved = await loadProgress();
    let hasPamphlet = saved.hasPamphlet;
    let hasSeenMap = false;
    let enteredHall = false;
    const completedAreas = new Set<AreaId>(Object.keys(saved.photos) as AreaId[]);
    const visitedRooms = new Set<string>();
    let history: HistoricalWorld | null = null;
    let acceptedPhoto: string | null = null;
    let museumColliders = [...world.colliders];
    let toastTimer = 0;
    let soundEnabled = true;
    const soundButton = document.querySelector<HTMLButtonElement>('#sound-button')!;
    soundButton.addEventListener('click', () => {
      const enabled = soundEnabled = !soundEnabled; soundButton.textContent = enabled ? 'Sonido: activado' : 'Sonido: silenciado';
      soundButton.setAttribute('aria-pressed', String(enabled));
    });
    document.querySelector('#restart-button')!.addEventListener('click', () => {
      if (!window.confirm('¿Reiniciar la visita y borrar las fotos y recuerdos guardados?')) return;
      if (resetProgress()) location.reload();
      else showToast('No se pudo borrar el guardado del navegador.');
    });
    if (hasPamphlet) {
      world.openEntrance();
      for (const door of world.doors) if (door.target && completedAreas.has(door.target)) world.openDoor(door);
      for (let i = 0; i < 40; i++) world.update(0.1);
      for (const id of completedAreas) {
        pamphletView.complete(id, saved.photos[id]!);
        const room = world.rooms.find((item) => item.id === id)!;
        room.root.userData.setLight(0); visitedRooms.add(id);
      }
      document.querySelector('#menu-text')!.textContent = 'Tu panfleto y tus recuerdos están guardados. Continuá la visita desde el hall.';
    }
    function persist(): boolean {
      saved.hasPamphlet = hasPamphlet;
      return saveProgress(saved);
    }
    const toGuard = new THREE.Vector3();
    const toDoor = new THREE.Vector3();

    function showToast(message: string): void {
      toast.textContent = message;
      toast.hidden = false;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
    }

    async function takePhoto(): Promise<void> {
      toast.hidden = true;
      const active = areaOrder.find((id) => availabilityOf(id) === 'playable' && !completedAreas.has(id));
      const exhibit = active && world.exhibits.get(active);
      if (!active || !exhibit || history) {
        controls.finishCinematic(true);
        return;
      }
      cameraModel.root.visible = false;
      renderer.render(scene, camera);
      const frame = getFrameBounds(renderer.domElement, viewfinder);
      const photo = captureFrame(renderer, viewfinder);
      const valid = artifactVisible(camera, exhibit.artifact, exhibit.photoSolids, frame);
      cameraModel.root.visible = true;
      if (soundEnabled) playShutter();
      await cameraModel.develop(photo, `${areaCatalog[active].name.toUpperCase()} / ${String(world.rooms.find((room) => room.id === active)!.number).padStart(2, '0')}`);
      if (!valid) {
        cameraModel.hidePrint();
        showToast(`Sin eco. Incluí ${areaCatalog[active].artifact.toLowerCase()} en la fotografía.`);
        controls.finishCinematic(true);
        return;
      }
      acceptedPhoto = await photoForSave(photo);
      controls.setCinematic('transition');
      await playTimeTransition(transition, async () => {
        cameraModel.hidePrint();
        scene.remove(camera);
        museumColliders = [...world.colliders];
        history = active === 'luna' ? createMoonWorld() : active === 'japon' ? createJapanWorld() : active === 'egipto' ? createEgyptWorld() : active === 'medieval' ? createMedievalWorld() : createRomeWorld();
        setSpacesuit(active === 'luna');
        scene = history.scene;
        scene.add(camera);
        world.colliders.splice(0, world.colliders.length, ...history.colliders);
        controls.teleport(history.spawn);
        updateScene = (delta) => {
          if (!history) return;
          const boarding = history.boarding;
          if (boarding && ['climbing', 'launching', 'finished'].includes(boarding.state())) {
            const result = boarding.update(app.dataset.playState === 'transition' ? delta : 0, camera);
            if (result === 'cabin') {
              world.colliders.splice(0, world.colliders.length, ...boarding.cabinColliders);
              controls.teleport(new THREE.Vector2(boarding.seat.x, boarding.seat.z), 0, boarding.seat.y - 1.7);
              controls.finishCinematic(false);
              help.textContent = 'MIRAR CON EL MOUSE · E INICIAR ASCENSO · ESC PAUSAR';
              showToast('Ya estás a bordo. Iniciá el ascenso desde los controles frente a vos.');
            } else if (result === 'return') void finishHistory();
            return;
          }
          if (app.dataset.playState !== 'playing') return;
          const hadHelp = history.helpActive();
          history.update(delta);
          if (!hadHelp && history.helpActive()) showToast(history.id === 'luna' ? 'Las huellas iluminadas llevan a la escalerilla de la nave.' : history.id === 'japon' ? 'Los pétalos señalan el camino entre los torii hacia el templo.' : history.id === 'egipto' ? 'Un rastro de luz recorre el templo hacia el altar.' : history.id === 'medieval' ? 'Un rastro dorado cruza el patio hacia la llave.' : 'Un rastro tenue recorre la pasarela hacia el casco.');
        };
        await renderer.compileAsync(scene, camera);
      }, () => app.dataset.playState === 'paused');
      controls.finishCinematic(false);
      help.textContent = active === 'luna' ? 'WASD CAMINAR · E SUBIR A LA NAVE · M PANFLETO · ESC PAUSAR' : 'WASD CAMINAR · SHIFT CORRER · E RECOGER · M PANFLETO · ESC PAUSAR';
      showToast(active === 'luna' ? 'El primer paso quedó detenido en el tiempo. Explorá el alunizaje y subí a la nave para iniciar el regreso.' : active === 'japon' ? 'El jardín quedó detenido en el tiempo. Cruzá el puente y buscá la máscara bajo el techo del templo.' : active === 'egipto' ? 'El tiempo se detuvo en el templo. Buscá el escarabajo del sol.' : active === 'medieval' ? 'El tiempo se detuvo en la fortaleza. Recuperá la llave junto al portón.' : 'El tiempo se detuvo en la naumaquia. Seguí la pasarela.');
    }

    async function finishHistory(): Promise<void> {
      if (!history || !acceptedPhoto) return;
      const completedId = history.id;
      let stored = true;
      controls.setCinematic('transition');
      await playTimeTransition(transition, () => {
        scene.remove(camera);
        history!.dispose();
        history = null;
        setSpacesuit(false);
        scene = world.scene;
        scene.add(camera);
        world.colliders.splice(0, world.colliders.length, ...museumColliders);
        completedAreas.add(completedId);
        saved.photos[completedId] = acceptedPhoto!;
        stored = persist();
        pamphletView.complete(completedId, acceptedPhoto!);
        const room = world.rooms.find((item) => item.id === completedId)!;
        (room.root.userData.setLight as (strength: number) => void)(0);
        const facesSouth = (completedId === 'japon' || completedId === 'luna') && room.center.x > 0;
        controls.teleport(new THREE.Vector2(room.center.x, room.center.y + (facesSouth ? -4.15 : 4.15)), facesSouth ? Math.PI : 0);
        updateScene = updateMuseum;
      }, () => app.dataset.playState === 'paused');
      controls.finishCinematic(false);
      controls.openPamphlet();
      help.textContent = 'WASD CAMINAR · SHIFT CORRER · M PANFLETO · E PUERTAS · ESC PAUSAR';
      const next = areaOrder.find((id) => availabilityOf(id) === 'playable' && !completedAreas.has(id));
      showToast(!stored ? 'Recuerdo recuperado. El navegador no pudo guardarlo: se conservará solo durante esta visita.' : next ? `${areaCatalog[completedId].name}: recuerdo recuperado. El próximo viaje está en ${areaCatalog[next].name}.` : `${completedAreas.size} viajes, ${completedAreas.size} recuerdos. La visita continúa: podés recorrer las cinco salas.`);
    }

    const controls = createPlayerControls(camera, renderer.domElement, {
      colliders: world.colliders,
      start: hasPamphlet ? new THREE.Vector2(0, -17.8) : world.spawn,
      findInteraction: (position, gaze) => {
        if (history) {
          const boarding = history.boarding;
          if (boarding?.state() === 'cabin') {
            if (gaze.z > -0.25) return null;
            return { label: 'Iniciar ascenso · volver al museo', activate: () => {
              controls.setCinematic('transition'); boarding.launch();
              showToast('Ascenso iniciado. El viaje de regreso te lleva al museo.');
            } };
          }
          const toArtifact = history.artifact.clone().sub(new THREE.Vector3(position.x, 1.7, position.y));
          if (Math.hypot(toArtifact.x, toArtifact.z) > (boarding ? 1.9 : 2.9) || gaze.dot(toArtifact.normalize()) < 0.38) return null;
          if (boarding) return { label: 'Subir por la escalerilla de la nave', activate: () => {
            controls.setCinematic('transition'); boarding.start(camera);
            showToast('Subiendo a la cabina…');
          } };
          return { label: `Recoger ${areaCatalog[history.id].artifact.toLowerCase()}`, activate: () => { void finishHistory(); } };
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
              const stored = persist();
              help.textContent = 'WASD CAMINAR · SHIFT CORRER · C POLAROID · M PANFLETO · E PUERTAS · ESC PAUSAR';
              showToast(stored ? 'El guardia te entregó el panfleto. Pulsá M para desplegarlo.' : 'Pulsá M para abrir el panfleto. El navegador no pudo guardar esta visita.');
            },
          };
        }
        const door = world.doors.find((item) => {
          if (item.progress > 0 || item.opening) return false;
          toDoor.set(item.position.x - position.x, 0, item.position.y - position.y);
          return toDoor.length() < 2.55 && gaze.dot(toDoor.normalize()) > 0.58;
        });
        if (!door) return null;
        const target = door.target;
        return {
          label: `Abrir ${target ? areaCatalog[target].name : 'regreso al hall'}`,
          activate: () => { world.openDoor(door); },
        };
      },
      canOpenPamphlet: () => hasPamphlet,
      canEquipCamera: () => {
        if (history || !hasPamphlet) return false;
        const active = areaOrder.find((id) => availabilityOf(id) === 'playable' && !completedAreas.has(id));
        return !!active && world.roomAt(new THREE.Vector2(camera.position.x, camera.position.z))?.id === active;
      },
      onCameraChange: (equipped) => {
        cameraModel.setEquipped(equipped);
        app.dataset.mode = equipped ? 'photo' : 'player';
      },
      onShutter: () => { void takePhoto(); },
      onPamphletChange: (open) => {
        pamphletView.setOpen(open);
        if (open) toast.hidden = true;
        if (open && !hasSeenMap) {
          hasSeenMap = true;
          app.dataset.storyState = 'map-seen';
        }
      },
      onPositionChange: (position) => {
        if (history) {
          app.dataset.location = `${history.id}-history`;
          delete app.dataset.room;
          return;
        }
        const room = world.roomAt(position);
        if (room) {
          app.dataset.location = 'room';
          app.dataset.room = room.id;
          if (!visitedRooms.has(room.id)) {
            visitedRooms.add(room.id);
            (room.root.userData.setLight as (strength: number) => void)(1);
            showToast(availabilityOf(room.id) === 'playable'
              ? `${areaCatalog[room.id].name}: ${areaOrder.find((id) => availabilityOf(id) === 'playable' && !completedAreas.has(id)) === room.id ? 'pulsá C para fotografiar el artefacto.' : 'el panfleto indica tu próximo viaje.'}`
              : `${String(room.number).padStart(2, '0')} · ${areaCatalog[room.id].name} — ${availabilityCopy(areaCatalog[room.id].availability).description}.`);
          }
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
    const updatePlayer = updateControls;
    updateControls = (delta) => {
      updatePlayer(delta);
      if (spaceHelmet.root.visible) spaceHelmet.update();
      const running = app.dataset.playState !== 'paused' && app.dataset.playState !== 'intro';
      if (running) {
        pamphletView.update(delta);
        cameraModel.update(delta);
      }
    };
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

  function renderFrame(): void {
    renderer.render(scene, camera);
    if (studyMode || !hasHeldItems()) return;
    const background = scene.background;
    scene.background = null;
    renderer.autoClear = false;
    renderer.clearDepth();
    // Held objects use unlit materials and never need another shadow or matrix pass.
    const updateShadows = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    scene.matrixWorldAutoUpdate = false;
    camera.layers.set(1);
    renderer.render(scene, camera);
    camera.layers.set(0);
    scene.matrixWorldAutoUpdate = true;
    renderer.shadowMap.autoUpdate = updateShadows;
    renderer.autoClear = true;
    scene.background = background;
  }

  // Prepare material programs before the visitor starts turning the camera.
  await renderer.compileAsync(scene, camera);
  renderFrame();
  let previousTime = performance.now();
  renderer.setAnimationLoop((time) => {
    const delta = (time - previousTime) / 1000;
    previousTime = time;
    updateControls(delta);
    updateScene(delta);
    renderFrame();
  });
  startButton.disabled = false;
  startButton.textContent = 'Comenzar visita ↗';
} catch (cause) {
  error.hidden = false;
  error.textContent = `No se pudo iniciar la escena 3D: ${cause instanceof Error ? cause.message : String(cause)}`;
}
