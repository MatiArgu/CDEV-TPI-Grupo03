import * as THREE from 'three';
import type { Collider } from './scene';

type Mode = 'intro' | 'playing' | 'paused' | 'pamphlet';

export type Interaction = { label: string; activate: () => void };

type PlayerOptions = {
  colliders: Collider[];
  start: THREE.Vector2;
  findInteraction: (position: THREE.Vector2, gaze: THREE.Vector3) => Interaction | null;
  canOpenPamphlet: () => boolean;
  onPamphletChange: (open: boolean) => void;
  onPositionChange: (position: THREE.Vector2) => void;
};

const eyeHeight = 1.7;
const playerRadius = 0.28;
const walkSpeed = 3.2;

export function createPlayerControls(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  options: PlayerOptions,
): (delta: number) => void {
  const menu = document.querySelector<HTMLElement>('#game-menu')!;
  const menuTitle = document.querySelector<HTMLElement>('#menu-title')!;
  const menuText = document.querySelector<HTMLElement>('#menu-text')!;
  const menuButton = document.querySelector<HTMLButtonElement>('#menu-button')!;
  const prompt = document.querySelector<HTMLElement>('#interaction-prompt')!;
  const promptLabel = document.querySelector<HTMLElement>('#interaction-label')!;
  const app = document.querySelector<HTMLElement>('#app')!;

  const pressed = new Set<string>();
  const position = options.start.clone();
  const gaze = new THREE.Vector3();
  let interaction: Interaction | null = null;
  let mode: Mode = 'intro';
  let yaw = 0;
  let pitch = 0;
  let bobPhase = 0;
  let bobOffset = 0;

  camera.rotation.order = 'YXZ';
  camera.position.set(position.x, eyeHeight, position.y);
  app.dataset.playState = mode;

  function setMode(next: Mode): void {
    const wasPamphlet = mode === 'pamphlet';
    mode = next;
    app.dataset.playState = mode;
    if (mode !== 'playing') {
      pressed.clear();
      interaction = null;
      prompt.hidden = true;
      bobOffset = 0;
      camera.position.y = eyeHeight;
    }
    if (wasPamphlet !== (mode === 'pamphlet')) options.onPamphletChange(mode === 'pamphlet');
    menu.hidden = mode === 'playing' || mode === 'pamphlet';
    if (mode === 'paused') {
      menuTitle.textContent = 'En pausa';
      menuText.textContent = 'El recorrido se detuvo. Hacé clic para volver y recuperar el mouse.';
      menuButton.textContent = 'Volver al recorrido';
    }
  }

  function pause(): void {
    setMode('paused');
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }

  async function requestControl(): Promise<void> {
    try {
      await canvas.requestPointerLock();
    } catch {
      menuText.textContent = 'No se pudo capturar el mouse. Hacé clic para intentarlo de nuevo.';
    }
  }

  menuButton.addEventListener('click', requestControl);
  canvas.addEventListener('click', () => {
    if (mode === 'paused') void requestControl();
  });
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) setMode('playing');
    else if (mode === 'playing' || mode === 'pamphlet') setMode('paused');
  });
  document.addEventListener('pointerlockerror', () => {
    if (mode !== 'playing') menuText.textContent = 'No se pudo capturar el mouse. Hacé clic para intentarlo de nuevo.';
  });
  document.addEventListener('mousemove', (event) => {
    if (mode !== 'playing' || document.pointerLockElement !== canvas) return;
    yaw -= event.movementX * 0.0022;
    pitch = THREE.MathUtils.clamp(pitch - event.movementY * 0.0022, -1.35, 1.35);
  });
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      if (mode === 'playing' || mode === 'pamphlet') pause();
      return;
    }
    if (event.code === 'KeyM' && !event.repeat) {
      if (mode === 'playing' && options.canOpenPamphlet()) setMode('pamphlet');
      else if (mode === 'pamphlet') setMode(document.pointerLockElement === canvas ? 'playing' : 'paused');
      return;
    }
    if (mode !== 'playing') return;
    if (event.code === 'KeyE' && !event.repeat && interaction) {
      interaction.activate();
      interaction = null;
      prompt.hidden = true;
      return;
    }
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
      event.preventDefault();
      pressed.add(event.code);
    }
  });
  document.addEventListener('keyup', (event) => pressed.delete(event.code));
  window.addEventListener('blur', () => {
    pressed.clear();
    if (mode === 'playing' || mode === 'pamphlet') pause();
  });

  function blocked(x: number, z: number): boolean {
    return options.colliders.some(({ minX, maxX, minZ, maxZ }) => {
      const nearX = THREE.MathUtils.clamp(x, minX, maxX);
      const nearZ = THREE.MathUtils.clamp(z, minZ, maxZ);
      return (x - nearX) ** 2 + (z - nearZ) ** 2 < playerRadius ** 2;
    });
  }

  return (delta: number) => {
    const step = Math.min(delta, 0.05);
    let moving = false;
    if (mode === 'playing' && document.pointerLockElement === canvas) {
      const forward = Number(pressed.has('KeyW')) - Number(pressed.has('KeyS'));
      const sideways = Number(pressed.has('KeyD')) - Number(pressed.has('KeyA'));
      const length = Math.hypot(forward, sideways);
      if (length > 0) {
        const amount = walkSpeed * step / length;
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * sideways) * amount;
        const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * sideways) * amount;
        if (Math.abs(dx) > 0.0001 && !blocked(position.x + dx, position.y)) {
          position.x += dx;
          moving = true;
        }
        if (Math.abs(dz) > 0.0001 && !blocked(position.x, position.y + dz)) {
          position.y += dz;
          moving = true;
        }
      }
      camera.rotation.set(pitch, yaw, 0);
      camera.getWorldDirection(gaze);
      interaction = options.findInteraction(position, gaze);
      prompt.hidden = !interaction;
      if (interaction) promptLabel.textContent = interaction.label;
    }
    if (moving) bobPhase += step * 10;
    const targetBob = moving ? Math.sin(bobPhase) * 0.025 : 0;
    bobOffset = THREE.MathUtils.lerp(bobOffset, targetBob, Math.min(step * 14, 1));
    camera.position.set(position.x, eyeHeight + bobOffset, position.y);
    options.onPositionChange(position);
  };
}
