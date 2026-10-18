import * as THREE from 'three';

/** Short first-person arrival: the world moves the camera; the player can only look around. */
export type Arrival = {
  /** Yaw for the player's view when the ride begins. */
  facing: number;
  /** Fade to the spawn point instead of stepping down beside the vehicle. */
  cut?: boolean;
  /** Places the camera; returns true once the rider is on foot (or ready for the cut). */
  update: (delta: number, camera: THREE.PerspectiveCamera) => boolean;
};

type RideOptions = {
  /** Faces +Z in its own space. */
  vehicle: THREE.Object3D;
  path: Array<[number, number, number]>;
  /** Camera position in the vehicle's space. */
  seat: THREE.Vector3;
  duration: number;
  /** Where the rider steps down, at eye height. */
  spawn: THREE.Vector2;
  /** Animate legs or oars; `pace` is 0 when stopped and about 1.5 at full speed. */
  gait?: (time: number, pace: number) => void;
  bob?: number;
  onMove?: () => void;
};

const dismountTime = 0.9;

export function createRide(options: RideOptions): Arrival {
  const curve = new THREE.CatmullRomCurve3(options.path.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const tangent = new THREE.Vector3();
  const seat = new THREE.Vector3();
  const ground = new THREE.Vector3(options.spawn.x, 1.7, options.spawn.y);
  let elapsed = 0;

  function place(u: number): void {
    curve.getPointAt(u, options.vehicle.position);
    curve.getTangentAt(u, tangent);
    options.vehicle.rotation.y = Math.atan2(tangent.x, tangent.z);
  }
  place(0);
  curve.getTangentAt(0, tangent);

  return {
    facing: Math.atan2(-tangent.x, -tangent.z),
    update(delta, camera) {
      elapsed += delta;
      const t = Math.min(elapsed / options.duration, 1);
      // Ease in and out so setting off and stopping feel weighty.
      place(t * t * (3 - 2 * t));
      const pace = 6 * t * (1 - t);
      options.gait?.(elapsed, pace);
      if (delta > 0) options.onMove?.();
      options.vehicle.updateMatrixWorld(true);
      seat.copy(options.seat);
      options.vehicle.localToWorld(seat);
      seat.y += Math.abs(Math.sin(elapsed * 4.2)) * (options.bob ?? 0.05) * Math.min(1, pace);
      const step = Math.min(Math.max(elapsed - options.duration, 0) / dismountTime, 1);
      camera.position.lerpVectors(seat, ground, step * step * (3 - 2 * step));
      camera.position.y += Math.sin(step * Math.PI) * 0.2;
      return step >= 1;
    },
  };
}
