import * as THREE from 'three';
import type { AreaId } from '../game/catalog';
import type { Collider } from '../game/collision';

export type HistoricalWorld = {
  id: AreaId;
  scene: THREE.Scene;
  colliders: Collider[];
  spawn: THREE.Vector2;
  artifact: THREE.Vector3;
  helpActive: () => boolean;
  update: (delta: number) => void;
  dispose: () => void;
};

/** Release scene-owned resources, retaining the shared Kenney templates and toon ramp. */
export function disposeHistoricalScene(scene: THREE.Scene): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (object instanceof THREE.Light && 'shadow' in object) (object as THREE.DirectionalLight).shadow?.dispose();
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points)) return;
    if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
    if (!object.userData.sharedAsset) geometries.add(object.geometry);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    if (!object.userData.sharedMaterial && (!object.userData.sharedAsset || object.userData.ownedMaterial)) list.forEach((material) => {
      materials.add(material);
      // Recolored Kenney materials may still reference template-owned texture maps.
      if (!object.userData.sharedAsset && !object.userData.sharedTexture && 'map' in material && material.map instanceof THREE.Texture) textures.add(material.map);
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
  if (scene.background instanceof THREE.Texture) scene.background.dispose();
  scene.clear();
}
