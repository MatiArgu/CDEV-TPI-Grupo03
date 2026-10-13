import * as THREE from 'three';
import { box, mesh, toon } from './visual';

export function japaneseMaterials() {
  return { red: toon(0xb83f39), dark: toon(0x283c3a), wood: toon(0x75533f), gold: toon(0xc7a46a),
    ivory: toon(0xf0ddae), stone: toon(0x919c89), paper: toon(0xe6dec6), steel: toon(0xb8c9c5),
    pink: toon(0xe7a4b7), blush: toon(0xf1c3ce), green: toon(0x718f60) };
}
type Palette = ReturnType<typeof japaneseMaterials>;

function polygon(parent: THREE.Object3D, points: number[][], depth: number, material: THREE.Material, z = 0) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const object = mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), material, [0, 0, z], parent);
  return object;
}

/** Front is +Z. Sculpted cheeks, brows, tusks and horns keep the red Oni readable in a photo. */
export function oniMask(parent: THREE.Object3D, position: [number, number, number], m: Palette): THREE.Group {
  const root = new THREE.Group(); root.name = 'mascara-oni-roja'; root.position.set(...position); parent.add(root);
  const face = mesh(new THREE.SphereGeometry(0.46, 10, 8), m.red, [0, 0, 0], root); face.scale.set(0.86, 1, 0.44);
  polygon(root, [[-.28,-.15],[-.25,-.38],[0,-.46],[.25,-.38],[.28,-.15]], .15, m.red, .03);
  for (const side of [-1, 1]) {
    const horn = mesh(new THREE.ConeGeometry(.095, .43, 7), m.ivory, [side*.25,.52,0], root); horn.rotation.z = -side*.25;
    const ear = mesh(new THREE.ConeGeometry(.13,.28,4), m.red, [side*.4,.06,0], root); ear.rotation.z = -side*1.15;
    const eye = polygon(root, [[.055,.07],[.31,.15],[.26,-.015],[.09,-.025]], .02, m.dark, .185); eye.scale.x = side;
    const pupil = box(.065,.026,.018,m.ivory,[side*.19,.055,.216],root); pupil.rotation.z = side*.2;
    const brow = box(.3,.075,.07,m.red,[side*.19,.185,.18],root); brow.rotation.z = side*.28;
    const cheek = mesh(new THREE.IcosahedronGeometry(.16,0),m.red,[side*.27,-.12,.12],root); cheek.scale.set(1,.8,.65);
    const tusk = mesh(new THREE.ConeGeometry(.052,.19,6),m.ivory,[side*.18,-.2,.25],root); tusk.rotation.z = -side*.23;
  }
  const nose = mesh(new THREE.ConeGeometry(.105,.2,4),m.red,[0,-.03,.24],root); nose.rotation.x = Math.PI/2;
  polygon(root,[[-.2,-.19],[-.13,-.34],[.13,-.34],[.2,-.19],[0,-.24]],.025,m.dark,.185);
  for(const x of [-.09,0,.09]) box(.048,.055,.04,m.ivory,[x,-.315,.227],root);
  root.traverse((object) => { if (object instanceof THREE.Mesh) object.receiveShadow = false; });
  return root;
}

export function katana(parent: THREE.Object3D, m: Palette, length = 1.8): THREE.Group {
  const root = new THREE.Group(); parent.add(root);
  polygon(root, [[-.57,.015],[.59,.07],[.88,.21],[.72,.035],[.53,-.005],[-.57,-.045]], .025,m.steel);
  box(.42,.085,.08,m.dark,[-.8,-.015,.015],root);
  for(let x=-.97;x<-.6;x+=.07) box(.025,.09,.087,m.ivory,[x,-.015,.015],root).rotation.z=.3;
  const guard=mesh(new THREE.CylinderGeometry(.115,.115,.045,10),m.gold,[-.57,-.01,.015],root);guard.rotation.z=Math.PI/2;
  root.scale.setScalar(length/1.8);return root;
}

export function torii(parent: THREE.Object3D, m: Palette): THREE.Group {
  const root=new THREE.Group();root.name='torii';parent.add(root);
  for(const x of [-2.1,2.1]) {
    mesh(new THREE.CylinderGeometry(.16,.2,4.1,8),m.red,[x,2.2,0],root);
    mesh(new THREE.CylinderGeometry(.23,.25,.5,8),m.dark,[x,.4,0],root);
  }
  box(5.2,.22,.3,m.red,[0,3.52,0],root);box(.23,.72,.24,m.red,[0,3.88,0],root);
  polygon(root,[[-3,4.45],[-2,4.17],[2,4.17],[3,4.45],[2.95,4.15],[2,3.94],[-2,3.94],[-2.95,4.15]],.48,m.dark,-.24);
  box(5.6,.18,.36,m.red,[0,4.03,0],root);
  root.traverse((object) => { if (object instanceof THREE.Mesh) object.receiveShadow = false; });
  return root;
}

/** Closed curved roof, including its underside; a shallow grid keeps the silhouette low-poly. */
export function japaneseRoof(parent: THREE.Object3D, m: Palette, width: number, depth: number, height: number, y: number) {
  const vertices:number[]=[],indices:number[]=[];const n=8;
  for(let z=0;z<=n;z++)for(let x=0;x<=n;x++) {
    const u=x/n*2-1,v=z/n*2-1;
    const h=height*(Math.pow(1-Math.max(Math.abs(u)*.7,Math.abs(v)),1.5)+.22*Math.pow(Math.abs(v),8)+.14*Math.pow(Math.abs(u),8));
    vertices.push(u*width/2,h,v*depth/2);
  }
  for(let z=0;z<n;z++)for(let x=0;x<n;x++){const a=z*(n+1)+x,b=a+1,c=a+n+1;indices.push(a,c,b,b,c,c+1);}
  const perimeter:number[]=[];
  for(let x=0;x<=n;x++)perimeter.push(x);
  for(let z=1;z<=n;z++)perimeter.push(z*(n+1)+n);
  for(let x=n-1;x>=0;x--)perimeter.push(n*(n+1)+x);
  for(let z=n-1;z>0;z--)perimeter.push(z*(n+1));
  const center=vertices.length/3;vertices.push(0,-.08,0);
  perimeter.forEach((a,i)=>{const b=perimeter[(i+1)%perimeter.length],base=vertices.length/3;vertices.push(vertices[a*3],-.08,vertices[a*3+2],vertices[b*3],-.08,vertices[b*3+2]);indices.push(a,b,base,b,base+1,base,center,base,base+1);});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return mesh(geometry,m.dark,[0,y,0],parent);
}

export function stoneLantern(parent: THREE.Object3D, m: Palette, x: number, z: number) {
  const root=new THREE.Group();root.position.set(x,.15,z);parent.add(root);
  box(.8,.18,.8,m.stone,[0,.09,0],root);box(.28,.65,.28,m.stone,[0,.49,0],root);
  box(.6,.13,.6,m.stone,[0,.88,0],root);box(.4,.42,.4,m.paper,[0,1.12,0],root);
  for(const a of [-1,1])for(const b of [-1,1])box(.07,.49,.07,m.stone,[a*.24,1.12,b*.24],root);
  japaneseRoof(root,m,.95,.95,.34,1.37);mesh(new THREE.SphereGeometry(.09,6,4),m.stone,[0,1.76,0],root);
  root.traverse((object) => { if (object instanceof THREE.Mesh) object.receiveShadow = false; });
  return root;
}

export function cherryTree(parent: THREE.Object3D, m: Palette, x: number, z: number, scale = 1) {
  const root=new THREE.Group();root.position.set(x,.1,z);root.scale.setScalar(scale);parent.add(root);
  mesh(new THREE.CylinderGeometry(.15,.27,2.8,7),m.wood,[0,1.4,0],root).rotation.z=.12;
  for(const [i,px,py,pz] of [[0,-1,3.1,0],[1,.8,3.3,.3],[2,0,4,0],[3,-.1,3.35,-1],[4,-.2,3.2,1]]){
    const branch=mesh(new THREE.CylinderGeometry(.07,.12,1.7,5),m.wood,[px*.45,2.4,pz*.4],root);branch.rotation.z=-px*.6;branch.rotation.x=pz*.5;
    const crown=mesh(new THREE.IcosahedronGeometry(1.25,1),i%2?m.blush:m.pink,[px,py,pz],root);crown.scale.y=.67;crown.receiveShadow=false;
  }
  return root;
}
