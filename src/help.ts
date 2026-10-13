import * as THREE from 'three';
import { box } from './visual';

export function createRouteHelp(
  scene: THREE.Scene,
  route: Array<[number, number, number]>,
  material: THREE.Material,
): { active: () => boolean; update: (delta: number) => void } {
  const marks = route.map((position) => {
    const mark = box(0.3, 0.02, 0.7, material, position, scene);
    mark.rotation.y = Math.PI / 4;
    mark.castShadow = false;
    mark.visible = false;
    return mark;
  });
  let elapsed = 0;
  let active = false;
  return {
    active: () => active,
    update: (delta) => {
      elapsed += delta;
      if (active || elapsed < 20) return;
      active = true;
      marks.forEach((mark) => { mark.visible = true; });
    },
  };
}
