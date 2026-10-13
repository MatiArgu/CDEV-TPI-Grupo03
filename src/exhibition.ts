import * as THREE from 'three';
import { box, mesh, toon } from './visual';

// Shared museum finishes; the outdoor scenes keep their daylight palette.
export const exhibition = {
  wall: 0x646c5f, panel: 0x303a34, ceiling: 0x202723,
  stone: 0xaaa28b, bronze: 0x9c8153, plinth: 0x252d29,
};

export function stoneFloor(parent: THREE.Object3D, width: number, depth: number, x: number, z: number, y: number): void {
  const columns = Math.ceil(width / 1.25);
  const rows = Math.ceil(depth / 1.6);
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.035, 1), toon(exhibition.stone), columns * rows);
  const tile = new THREE.Object3D();
  const color = new THREE.Color();
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const index = row * columns + column;
    tile.position.set(x - width / 2 + (column + 0.5) * width / columns, y, z - depth / 2 + (row + 0.5) * depth / rows);
    tile.scale.set(width / columns - 0.025, 1, depth / rows - 0.025);
    tile.updateMatrix();
    tiles.setMatrixAt(index, tile.matrix);
    tiles.setColorAt(index, color.setScalar(0.76 + ((column * 17 + row * 13) % 7) * 0.035));
  }
  tiles.receiveShadow = true;
  tiles.name = 'losas-museo';
  parent.add(tiles);
}

/** A real downlight plus a subtle, feathered cone; no postprocessing or shadow map per lamp. */
export function exhibitSpot(parent: THREE.Object3D, x: number, z: number, height: number, intensity: number, radius: number, beam = false, shadows = false): (strength: number) => void {
  const housing = toon(exhibition.plinth);
  mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.18, 12), housing, [x, height + 0.12, z], parent);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffebbe });
  mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 16), glow, [x, height + 0.025, z], parent).castShadow = false;
  const light = new THREE.SpotLight(0xffe6b7, intensity, height + 2, Math.atan(radius / height), 0.7, 1.3);
  light.position.set(x, height, z);
  light.target.position.set(x, 0, z);
  light.castShadow = shadows;
  if (shadows) {
    light.shadow.mapSize.set(512, 512);
    light.shadow.camera.near = 0.15;
    light.shadow.normalBias = 0.025;
  }
  parent.add(light, light.target);
  let haze: THREE.Mesh | undefined;
  if (beam) {
    const geometry = new THREE.CylinderGeometry(0.1, radius, height - 0.2, 32, 1, true);
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { strength: { value: 1 } },
      vertexShader: `varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
        void main() { vUv = uv; vec4 p = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal); vView = -p.xyz;
          gl_Position = projectionMatrix * p; }`,
      fragmentShader: `varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
        uniform float strength;
        void main() { float edge = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.5);
          float fade = smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.88, 1.0, vUv.y));
          gl_FragColor = vec4(1.0, 0.9, 0.64, 0.065 * edge * fade * strength); }`,
    });
    haze = mesh(geometry, material, [x, height / 2 + 0.1, z], parent);
    haze.castShadow = haze.receiveShadow = false;
    haze.name = 'haz-de-luz';
  }
  return (strength) => {
    light.intensity = intensity * strength;
    // Keep the light in the shader list during the short opening flicker.
    glow.color.set(0xffebbe).multiplyScalar(0.12 + strength * 0.88);
    if (haze) {
      haze.visible = strength > 0;
      (haze.material as THREE.ShaderMaterial).uniforms.strength.value = strength;
    }
  };
}

export function plinth(parent: THREE.Object3D, x: number, z: number, width: number, height: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0.15, z);
  parent.add(group);
  const dark = toon(exhibition.plinth);
  box(width, 0.1, width, dark, [0, 0.05, 0], group);
  box(width * 0.87, height - 0.16, width * 0.87, dark, [0, height / 2, 0], group);
  box(width, 0.08, width, toon(exhibition.bronze), [0, height - 0.04, 0], group);
  return group;
}

/** Matte lime plaster with restrained joints, shared by hall and exhibition walls. */
export function museumWallMaterial(color: number = exhibition.wall): THREE.MeshToonMaterial {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#ede8da'; c.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let col = -1; col < 3; col++) {
    const x = col * 256 + (row % 2) * 128;
    c.fillStyle = ['#e9e4d7', '#eee9dc', '#e6e1d4'][(row + col + 3) % 3];
    c.fillRect(x + 2, row * 128 + 2, 252, 124);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 2);
  const material = toon(color); material.map = texture;
  return material;
}

export function wallPanels(parent: THREE.Object3D, width: number, depth: number): void {
  const panel = museumWallMaterial(0x778073);
  const base = toon(0x39443b); const molding = toon(0x9c987e);
  const count = Math.max(2, Math.round(depth / 3.5));
  const bay = (depth - 0.5) / count;
  for (const side of [-1, 1]) {
    const x = side * (width / 2 - 0.19);
    for (let i = 0; i < count; i++) {
      const z = -depth / 2 + 0.25 + bay * (i + 0.5);
      box(0.045, 3.6, bay - 0.14, panel, [x, 2.85, z], parent).castShadow = false;
      box(0.09, 0.82, bay - 0.14, base, [x - side * 0.045, 0.62, z], parent).castShadow = false;
      box(0.12, 4.6, 0.07, molding, [x - side * 0.05, 2.53, z - bay / 2 + 0.035], parent).castShadow = false;
    }
    for (const y of [0.22, 1.08, 4.75]) box(0.12, 0.065, depth - 0.5, molding, [x - side * 0.05, y, 0], parent).castShadow = false;
  }
}

export function exhibitLabel(parent: THREE.Object3D, title: string, subtitle: string, position: [number, number, number], width: number): THREE.Mesh {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 192;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#252d29'; c.fillRect(0, 0, 768, 192);
  c.strokeStyle = '#b2986f'; c.strokeRect(8, 8, 752, 176);
  c.textAlign = 'center'; c.fillStyle = '#e4d7b7';
  c.font = '38px Georgia'; c.fillText(title, 384, 85);
  c.font = '20px sans-serif'; c.fillText(subtitle, 384, 135);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const label = mesh(new THREE.PlaneGeometry(width, width / 4), new THREE.MeshBasicMaterial({ map: texture }), position, parent);
  label.castShadow = false; return label;
}
