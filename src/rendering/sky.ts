import * as THREE from 'three';

/** Infinite smooth gradient; the background has no visible geometry or parallax. */
export function addSky(scene: THREE.Scene, desert = false): void {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const gradient = context.createLinearGradient(0, 0, 0, 144);
  gradient.addColorStop(0, desert ? '#80b8cc' : '#80b6d2');
  gradient.addColorStop(0.48, desert ? '#b3d1d7' : '#b0d2e0');
  gradient.addColorStop(0.88, desert ? '#eee0c4' : '#d9e8dd');
  gradient.addColorStop(1, desert ? '#f0ddba' : '#d9e8dd');
  context.fillStyle = gradient; context.fillRect(0, 0, 512, 256);
  const background = new THREE.CanvasTexture(canvas);
  background.colorSpace = THREE.SRGBColorSpace;
  background.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = background;
  const cloudGeometry = new THREE.IcosahedronGeometry(1, 1);
  const cloudPositions = cloudGeometry.attributes.position;
  const cloudColors: number[] = [];
  for (let i = 0; i < cloudPositions.count; i++) {
    const color = new THREE.Color(0xfff7e8).lerp(new THREE.Color(0xb9d0cf), Math.max(0, -cloudPositions.getY(i)) * 0.5);
    cloudColors.push(color.r, color.g, color.b);
  }
  cloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(cloudColors, 3));
  const clouds = new THREE.InstancedMesh(cloudGeometry, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), 35);
  clouds.name = 'nubes-lowpoly';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) {
    const angle = i * Math.PI * 2 / 7;
    dummy.position.set(Math.cos(angle) * 48 + (j - 2) * 2.9, 20 + i % 3 * 5 + Math.sin(j) * 1.1, Math.sin(angle) * 48 - 7);
    dummy.scale.set(3.8, 1.2 + (j % 3) * 0.6, 2.2);
    dummy.rotation.set(0, i * 0.3, 0); dummy.updateMatrix();
    clouds.setMatrixAt(i * 5 + j, dummy.matrix);
  }
  scene.add(clouds);
}
