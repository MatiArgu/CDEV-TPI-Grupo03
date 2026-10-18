import * as THREE from 'three';

const duration = 1.9;
const count = 150;

/**
 * Golden spiral that rises around the recovered artifact before the return.
 * Built hidden with the world, so its shaders compile during the arrival fade.
 */
export function createDeparture(scene: THREE.Scene, origin: THREE.Vector3) {
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 32;
  const paint = dot.getContext('2d')!; const fade = paint.createRadialGradient(16, 16, 0, 16, 16, 16);
  fade.addColorStop(0, '#ffffff'); fade.addColorStop(0.4, '#ffffffaa'); fade.addColorStop(1, '#ffffff00');
  paint.fillStyle = fade; paint.fillRect(0, 0, 32, 32);
  const sparkMaterial = new THREE.PointsMaterial({ color: 0xffd98a, map: new THREE.CanvasTexture(dot), size: 0.12, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(geometry, sparkMaterial);
  sparks.frustumCulled = false;
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), glowMaterial);
  glow.position.copy(origin);
  glow.scale.setScalar(0.01);
  scene.add(sparks, glow);
  let elapsed = 0;
  let running = false;

  return {
    start(): void { running = true; elapsed = 0; },
    running: () => running,
    /** Returns true once the effect has finished. */
    update(delta: number): boolean {
      if (!running) return false;
      elapsed += delta;
      const t = Math.min(elapsed / duration, 1);
      for (let i = 0; i < count; i++) {
        const offset = i / count;
        const rise = (offset + elapsed * 0.55) % 1;
        const angle = offset * Math.PI * 14 + elapsed * 4.5;
        const radius = 1.4 * (1 - rise * 0.8) * Math.min(1, t * 2.5);
        positions[i * 3] = origin.x + Math.cos(angle) * radius;
        positions[i * 3 + 1] = origin.y - 0.8 + rise * 3.4;
        positions[i * 3 + 2] = origin.z + Math.sin(angle) * radius;
      }
      geometry.attributes.position.needsUpdate = true;
      sparkMaterial.opacity = Math.min(1, t * 3);
      glow.scale.setScalar(0.2 + t * t * 1.1);
      glowMaterial.opacity = Math.min(0.45, t * 0.8);
      if (t >= 1) running = false;
      return t >= 1;
    },
  };
}
