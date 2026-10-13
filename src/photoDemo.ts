import * as THREE from 'three';
import { artifactVisible, captureFrame, createCameraModel, getFrameBounds, playShutter } from './photo';
import { createPhotoWorld } from './photoWorld';
import { createPlayerControls } from './player';
import { playTimeTransition } from './timeTransition';

export function createPhotoDemo(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  app: HTMLElement,
  onSceneChange: (scene: THREE.Scene) => void,
): { update: (delta: number) => void; afterRender: () => void } {
  const menuTitle = document.querySelector<HTMLElement>('#menu-title')!;
  const menuText = document.querySelector<HTMLElement>('#menu-text')!;
  const menuButton = document.querySelector<HTMLElement>('#menu-button')!;
  const help = document.querySelector<HTMLElement>('#player-help')!;
  const toast = document.querySelector<HTMLElement>('#game-toast')!;
  const frame = document.querySelector<HTMLElement>('#photo-viewfinder')!;
  const result = document.querySelector<HTMLElement>('#photo-result')!;
  const resultImage = document.querySelector<HTMLImageElement>('#photo-image')!;
  const resultLabel = document.querySelector<HTMLElement>('#photo-result-label')!;
  const transition = document.querySelector<HTMLElement>('#time-transition')!;
  menuTitle.innerHTML = 'Ensayo de<br />la Polaroid.';
  menuText.textContent = 'Probá la fotografía en una sala temporal. El cristal debe verse dentro del visor para abrir un eco del tiempo.';
  menuButton.innerHTML = 'Entrar al laboratorio <span aria-hidden="true">↗</span>';
  document.querySelector<HTMLElement>('.game-card small')!.textContent = 'WASD caminar · Mouse mirar · C cámara · Clic disparar · E volver · Escape pausar';
  document.title = 'La Polaroid · Museo de viajes en el tiempo';
  help.textContent = 'WASD CAMINAR · MOUSE MIRAR · C EQUIPAR CÁMARA · ESC PAUSAR';
  app.dataset.photoLocation = 'lab';

  let world = createPhotoWorld();
  let inEcho = false;
  let pendingShot = false;
  let toastTimer = 0;
  const colliders = [...world.colliders];
  const cameraModel = createCameraModel(camera);
  world.scene.add(camera);
  onSceneChange(world.scene);

  function showToast(message: string): void {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3800);
  }

  const controls = createPlayerControls(camera, renderer.domElement, {
    colliders,
    start: new THREE.Vector2(0, 5.3),
    findInteraction: (position, gaze) => {
      if (!inEcho) return null;
      const toPortal = new THREE.Vector3(-position.x, 0, -3.8 - position.y);
      if (toPortal.length() > 2.65 || gaze.dot(toPortal.normalize()) < 0.35) return null;
      return { label: 'Volver al laboratorio', activate: () => travel(false) };
    },
    canOpenPamphlet: () => false,
    onPamphletChange: () => {},
    onPositionChange: () => {},
    canEquipCamera: () => !inEcho,
    onCameraChange: (equipped) => {
      cameraModel.visible = equipped;
      help.textContent = equipped
        ? 'MOUSE APUNTAR · CLIC DISPARAR · C GUARDAR CÁMARA · ESC PAUSAR'
        : inEcho
          ? 'WASD CAMINAR · E VOLVER POR EL PORTAL · ESC PAUSAR'
          : 'WASD CAMINAR · MOUSE MIRAR · C EQUIPAR CÁMARA · ESC PAUSAR';
    },
    onShutter: () => {
      pendingShot = true;
      cameraModel.visible = false;
      playShutter();
    },
  });

  function travel(toEcho: boolean): void {
    controls.setCinematic('transition');
    void playTimeTransition(transition, () => {
      world.scene.remove(camera);
      world.dispose();
      world = createPhotoWorld(toEcho);
      inEcho = toEcho;
      colliders.splice(0, colliders.length, ...world.colliders);
      world.scene.add(camera);
      onSceneChange(world.scene);
      controls.teleport(new THREE.Vector2(0, toEcho ? 2.2 : 5.3));
      cameraModel.visible = false;
      result.hidden = true;
      app.dataset.photoLocation = toEcho ? 'echo' : 'lab';
      help.textContent = toEcho
        ? 'WASD CAMINAR · E VOLVER POR EL PORTAL · ESC PAUSAR'
        : 'WASD CAMINAR · MOUSE MIRAR · C EQUIPAR CÁMARA · ESC PAUSAR';
    }).then(() => {
      controls.finishCinematic(false);
      showToast(toEcho ? 'Eco temporal de prueba. Acercate al portal y pulsá E para volver.' : 'Volviste al laboratorio. Podés volver a fotografiar el cristal.');
    });
  }

  function afterRender(): void {
    if (!pendingShot) return;
    pendingShot = false;
    const image = captureFrame(renderer, frame);
    const valid = world.artifact !== null && artifactVisible(camera, world.artifact, world.solids, getFrameBounds(renderer.domElement, frame));
    resultImage.src = image;
    resultLabel.textContent = 'REVELANDO / 00';
    result.hidden = false;
    result.classList.remove('photo-developed');
    requestAnimationFrame(() => result.classList.add('photo-developed'));
    window.setTimeout(() => {
      resultLabel.textContent = valid ? 'CAPTURA VÁLIDA / 01' : 'SIN ARTEFACTO / 00';
    }, 2250);
    window.setTimeout(() => {
      if (valid) travel(true);
      else {
        result.hidden = true;
        cameraModel.visible = true;
        controls.finishCinematic(true);
        showToast('El cristal no se ve dentro del visor. Movete, apuntá y probá otra vez.');
      }
    }, valid ? 3350 : 3850);
  }

  return { update: controls.update, afterRender };
}
