import * as THREE from 'three';
import { foreground } from './held';

/** A camera-mounted visor rim; its clear center leaves the lunar landscape readable. */
export function createSpaceHelmet(camera:THREE.PerspectiveCamera) {
  const root=new THREE.Group();root.name='visor-casco-espacial';camera.add(root);
  const shape=new THREE.Shape();shape.moveTo(-2,-2);shape.lineTo(2,-2);shape.lineTo(2,2);shape.lineTo(-2,2);shape.closePath();
  const opening=new THREE.Path();opening.absellipse(0,.015,.985,.945,0,Math.PI*2,true,0);shape.holes.push(opening);
  const shell=new THREE.Mesh(new THREE.ShapeGeometry(shape,48),new THREE.MeshBasicMaterial({color:0x19232b,side:THREE.DoubleSide}));root.add(shell);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1,.023,5,64),new THREE.MeshBasicMaterial({color:0x87928f}));rim.scale.set(.985,.945,1);rim.position.y=.015;root.add(rim);
  for(const side of [-1,1]) {
    const latch=new THREE.Mesh(new THREE.BoxGeometry(.045,.13,.02),new THREE.MeshBasicMaterial({color:0xc4c8bd}));latch.position.set(side*.94,-.24,.015);root.add(latch);
    const curve=new THREE.EllipseCurve(0,.015,.94,.9,side<0?2.25:.22,side<0?2.85:.67);
    const reflection=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(16)),new THREE.LineBasicMaterial({color:0xe7c992,transparent:true,opacity:.24}));reflection.position.z=.005;reflection.layers.set(1);root.add(reflection);
  }
  foreground(root);root.position.z=-.54;root.visible=false;
  return {root,update(){const h=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*.54;root.scale.set(h*camera.aspect,h,1);}};
}
