import * as THREE from 'three';

/** Faceted pastel dome and a few low-poly cloud silhouettes; no textures or effects. */
export function addLowPolySky(scene: THREE.Scene, desert = false): void {
  const horizon = new THREE.Color(desert ? 0xf0ddba : 0xd9e8dd);
  const zenith = new THREE.Color(desert ? 0x87bbc3 : 0x83bfcf);
  scene.background = horizon;
  const geometry = new THREE.SphereGeometry(85, 20, 12).toNonIndexed();
  const positions = geometry.attributes.position;
  const colors: number[] = [];
  for (let i = 0; i < positions.count; i += 3) {
    const height = (positions.getY(i) + positions.getY(i + 1) + positions.getY(i + 2)) / 255;
    const color = horizon.clone().lerp(zenith, THREE.MathUtils.clamp(height, 0, 1) * 0.72);
    for (let j = 0; j < 3; j++) colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false }));
  dome.name = 'cielo-lowpoly'; dome.frustumCulled = false; dome.renderOrder = -100;
  dome.onBeforeRender = (_renderer, _scene, camera) => { camera.getWorldPosition(dome.position); dome.updateMatrixWorld(); };
  scene.add(dome);
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
