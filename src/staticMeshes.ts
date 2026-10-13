import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Batch only explicitly static decorations, within a small spatial group. */
export function batchStaticMeshes(root: THREE.Object3D): void {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const batches = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.Material>[]>();
  root.traverseVisible((object) => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.SkinnedMesh || object instanceof THREE.InstancedMesh) return;
    if (Array.isArray(object.material) || object.material.transparent || object.geometry.morphAttributes.position) return;
    const attributes = Object.keys(object.geometry.attributes).sort().join(',');
    const key = `${object.material.uuid}:${object.castShadow}:${object.receiveShadow}:${attributes}`;
    const batch = batches.get(key) ?? [];
    batch.push(object); batches.set(key, batch);
  });
  for (const objects of batches.values()) {
    if (objects.length < 2) continue;
    const geometries = objects.map((object) => {
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      return geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
    });
    const geometry = mergeGeometries(geometries);
    geometries.forEach((part) => part.dispose());
    if (!geometry) continue;
    const merged = new THREE.Mesh(geometry, objects[0].material);
    merged.name = 'decoracion-estatica';
    merged.castShadow = objects[0].castShadow;
    merged.receiveShadow = objects[0].receiveShadow;
    for (const object of objects) {
      // Keep the selective outlines, preserving their world transforms.
      for (const child of [...object.children]) root.attach(child);
      object.removeFromParent();
    }
    root.add(merged);
  }
}
