import * as THREE from 'three';
import { box, mesh, toon } from './visual';
import { placeModel } from './assets';

/** A shared miniature/full-size design. The upper cabin can leave the landing stage behind. */
export function lunarLander(parent: THREE.Object3D) {
  const root = new THREE.Group(); root.name = 'nave-lunar'; parent.add(root);
  const ivory = toon(0xdadfd8), gold = toon(0xc1a36b), dark = toon(0x303d48), metal = toon(0x8d9da8);
  const ascent = new THREE.Group(); root.add(ascent);
  box(3.6, 1.05, 3.1, gold, [0, 1.52, 0], root);
  for (const side of [-1, 1]) {
    for (const z of [-1.8, 1.8]) {
      const x = side * 2.6;
      const foot = mesh(new THREE.CylinderGeometry(.45, .57, .13, 10), metal, [x, .18, z], root);
      foot.name = 'pata-lunar';
      const from = new THREE.Vector3(x, .25, z), to = new THREE.Vector3(side * 1.45, 1.85, z * .55);
      const strut = mesh(new THREE.CylinderGeometry(.08, .09, from.distanceTo(to), 8), metal, from.clone().add(to).multiplyScalar(.5).toArray() as [number,number,number], root);
      strut.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), to.sub(from).normalize());
    }
    box(.14, 1.85, 2.65, ivory, [side * 1.43, 3.03, 0], ascent);
    box(.75, 1.7, .13, ivory, [side * 1.03, 3.02, 1.35], ascent);
    box(.1, 1.85, .15, metal, [side * 1.43, 3.03, -1.38], ascent);
    box(.11, 1.2, .15, metal, [side * .56, 3.3, -1.39], ascent);
    const window = mesh(new THREE.PlaneGeometry(.83, .64), new THREE.MeshBasicMaterial({color:0x30506a}), [side*1.51,3.2,0], ascent); window.rotation.y=side*Math.PI/2;
  }
  // Closed floor and roof, rear windows and a front hatch with a genuine opening.
  box(3.05,.16,2.95,ivory,[0,2.13,0],ascent);
  box(2.85,.64,.14,ivory,[0,2.5,-1.4],ascent);
  box(2.85,.13,.14,metal,[0,3.94,-1.4],ascent);
  box(1.2,.2,.18,ivory,[0,3.94,1.37],ascent);
  box(3.1,.18,3.05,ivory,[0,4.05,0],ascent);
  mesh(new THREE.CylinderGeometry(.8,1.8,.5,8),ivory,[0,4.38,0],ascent);
  box(.07,1.2,.07,metal,[.8,5.15,0],ascent);
  const dish = placeModel('lunarDish',ascent,[.8,5.7,0],{width:.8,height:.7}); dish.rotation.y=.4;
  const hatch = box(1.24,1.72,.12,metal,[0,3.01,1.4],ascent); hatch.name='escotilla-lunar';
  const port = mesh(new THREE.CircleGeometry(.29,10), new THREE.MeshBasicMaterial({color:0x28445c}), [0,.25,.066], hatch);
  port.name = 'ventanilla-escotilla';
  mesh(new THREE.TorusGeometry(.31,.035,5,10),gold,[0,.25,.075],hatch);
  for(const side of [-1,1]) {
    mesh(new THREE.PlaneGeometry(.62,.45),new THREE.MeshBasicMaterial({color:0x28445c}),[side*1.02,3.48,1.424],ascent);
    mesh(new THREE.CylinderGeometry(.26,.26,1.25,8),ivory,[side*1.72,3.0,0],ascent);
    box(.54,.54,.04,dark,[side*1.16,1.57,1.58],root);
    box(.62,.06,.06,metal,[side*1.16,1.57,1.62],root);
  }
  mesh(new THREE.CylinderGeometry(.22,.4,.35,8),dark,[0,1.91,0],ascent);
  box(.32,.08,.15,gold,[.35,-.07,.1],hatch); // Exterior handhold.
  for(const x of [-.55,.55]) {
    const rail=box(.065,2.35,.065,metal,[x,1.1,2.18],root);rail.rotation.x=-.48;
  }
  for(let i=0;i<9;i++)box(1.15,.07,.14,metal,[0,.22+i*.24,2.64-i*.125],root);
  const engine=placeModel('rocketEngine',root,[0,.25,0],{width:1.1,height:.75,depth:1.1});engine.rotation.y=.4;
  // Readable cockpit controls, placed below the unobstructed forward windows.
  box(2.5,.38,.45,dark,[0,2.83,-1.06],ascent);
  for(const x of [-.76,0,.76])box(.51,.16,.03,new THREE.MeshBasicMaterial({color:x?0x9ba995:0x76b5a4}),[x,2.94,-.81],ascent);
  for(const x of [-.45,.45])box(.15,.09,.09,gold,[x,2.91,-.76],ascent);
  root.traverse(o=>{if(o instanceof THREE.Mesh)o.receiveShadow=false;});
  return {root,ascent,hatch};
}

export function lunarSky(scene:THREE.Scene) {
  scene.background=new THREE.Color(0x030610);
  const points:number[]=[],colors:number[]=[];
  for(let i=0;i<900;i++) {
    const y=1-2*(i+.5)/900,angle=i*2.3999632297,r=Math.sqrt(1-y*y);
    points.push(150*r*Math.cos(angle),150*y,150*r*Math.sin(angle));
    const b=.45+(i%7)*.075;colors.push(b*.85,b*.92,b);
  }
  const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(points,3));stars.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const sky=new THREE.Points(stars,new THREE.PointsMaterial({size:.18,sizeAttenuation:true,vertexColors:true}));sky.name='estrellas';scene.add(sky);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d')!;
  c.fillStyle='#3d77ac';c.fillRect(0,0,1024,512);
  // Illustrated coastlines: deliberately simple, with no downloaded maps or textures.
  c.fillStyle='#8dab8b';
  const continents=[[[90,120],[160,70],[260,90],[320,140],[255,182],[229,233],[194,240],[170,187],[130,188]],[[240,242],[318,280],[337,340],[291,422],[269,379],[257,306]],[[455,108],[543,83],[582,127],[534,155],[469,151]],[[486,178],[581,183],[611,261],[569,343],[516,299],[492,230]],[[585,108],[702,71],[842,110],[903,181],[821,213],[746,183],[722,260],[675,224],[626,162]],[[800,315],[871,305],[908,349],[866,380],[813,368]]];
  for(const polygon of continents){c.beginPath();polygon.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  c.fillStyle='#d7e9e4';c.fillRect(0,0,1024,27);c.fillRect(0,475,1024,37);
  c.strokeStyle='#e2e9e9';c.lineWidth=13;c.lineCap='round';
  for(let i=0;i<15;i++){c.beginPath();c.ellipse(80+(i*173)%890,68+(i*91)%365,46+(i%3)*14,13,-.3,0,Math.PI*.8);c.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const earth=mesh(new THREE.SphereGeometry(10,40,24),new THREE.MeshStandardMaterial({map:texture,roughness:1,emissiveMap:texture,emissive:0xffffff,emissiveIntensity:.19}),[-59,35,-104],scene);
  earth.name='tierra';earth.rotation.set(.12,-1.15,.17);earth.castShadow=earth.receiveShadow=false;
  const sun=mesh(new THREE.SphereGeometry(4,24,16),new THREE.MeshBasicMaterial({color:0xfff1c7}),[70,44,-95],scene);sun.name='sol';sun.castShadow=sun.receiveShadow=false;
  const halo=mesh(new THREE.SphereGeometry(4.8,24,16),new THREE.MeshBasicMaterial({color:0xffd89a,transparent:true,opacity:.07,depthWrite:false}),[70,44,-95],scene);halo.castShadow=false;
}


/** Kenney provides the modular suit; add a sealed helmet and a gold visor for the lunar surface. */
export function lunarAstronaut(parent: THREE.Object3D, position: [number,number,number], partner=false, rotation=0) {
  const figure=placeModel(partner?'astronautPartner':'astronaut',parent,position,{height:1.83,rotation});
  figure.updateWorldMatrix(true, true);
  const head=figure.getObjectByName('head')!;
  const center=new THREE.Box3().setFromObject(head).getCenter(new THREE.Vector3());
  figure.worldToLocal(center);head.visible=false;
  const helmet=mesh(new THREE.SphereGeometry(.34,12,10),toon(0xe1e4dc),center.toArray() as [number,number,number],figure);
  helmet.scale.set(1,1.03,.95);helmet.receiveShadow=false;
  const visor=mesh(new THREE.SphereGeometry(.292,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xae8b4c}),[center.x,center.y,center.z+.14],figure);
  visor.rotation.x=Math.PI/2;visor.scale.set(1,.85,1);visor.receiveShadow=false;
  const shine=mesh(new THREE.PlaneGeometry(.14,.055),new THREE.MeshBasicMaterial({color:0xe7d3a3}),[center.x-.08,center.y+.1,center.z+.425],figure);shine.rotation.z=.15;
  return figure;
}
