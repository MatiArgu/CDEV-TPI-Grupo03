import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { Collider } from '../game/collision';
import { materials as mat, outline, toon } from './visual';

const sources = {
  astronaut: 'space-kit/astronautA',
  astronautPartner: 'space-kit/astronautB',
  rocketEngine: 'space-kit/rocket_baseA',
  lunarDish: 'space-kit/satelliteDish',
  lunarBoulder: 'space-kit/rock_largeB',
  lunarRocks: 'space-kit/rocks_smallA',
  bamboo: 'nature-kit/crops_bambooStageB',
  key: 'mini-dungeon/key',
  chest: 'mini-dungeon/chest',
  shield: 'mini-dungeon/shield-rectangle',
  medievalSword: 'mini-dungeon/weapon-sword',
  medievalTable: 'mini-dungeon/table',
  knight: 'mini-dungeon/character-human',
  castleWall: 'castle-kit/wall',
  castleTower: 'castle-kit/tower-square-base',
  castleRoof: 'castle-kit/tower-square-top-roof',
  castleGate: 'castle-kit/gate',
  castleBanner: 'castle-kit/flag-banner-long',
  catapult: 'castle-kit/siege-catapult',
  palm: 'nature-kit/tree_palmDetailedTall',
  bentPalm: 'nature-kit/tree_palmBend',
  obelisk: 'nature-kit/statue_obelisk',
  urn: 'graveyard-kit/urn-round',
  trophy: 'mini-arena/trophy',
  weaponRack: 'mini-arena/weapon-rack',
  gladius: 'mini-arena/weapon-sword',

  oak: 'nature-kit/tree_oak',
  tree: 'nature-kit/tree_detailed',
  slenderTree: 'nature-kit/tree_thin',
  cypress: 'nature-kit/tree_pineRoundD',
  bush: 'nature-kit/plant_bush',
  smallBush: 'nature-kit/plant_bushSmall',
  flowers: 'nature-kit/flower_redA',
  yellowFlowers: 'nature-kit/flower_yellowC',
  leaves: 'nature-kit/grass_leafs',
  rock: 'nature-kit/rock_smallA',
  pot: 'nature-kit/pot_large',
  bench: 'furniture-kit/bench',
  museumBench: 'furniture-kit/benchCushion',
  plant: 'furniture-kit/pottedPlant',
  smallPlant: 'furniture-kit/plantSmall1',
  column: 'mini-arena/column',
  brokenColumn: 'mini-arena/column-damaged',
  statue: 'mini-arena/statue',
  soldier: 'mini-arena/character-soldier',
  spear: 'mini-arena/weapon-spear',
  banner: 'mini-arena/banner',
  rowboat: 'pirate-kit/boat-row-large',
  paddle: 'pirate-kit/tool-paddle',
  barrel: 'pirate-kit/barrel',
  crate: 'pirate-kit/crate',
  planks: 'pirate-kit/platform-planks',
  archedWindow: 'modular-buildings/window-white-round-top',
  tallWindow: 'modular-buildings/window-white-tall',
  locomotive: 'train-kit/train-locomotive-a',
  passengerCar: 'train-kit/train-locomotive-passenger-a',
  railroad: 'train-kit/railroad-straight',
} as const;

export type ModelId = keyof typeof sources;
const templates = new Map<ModelId, THREE.Group>();

// Templates own these resources for the application's lifetime. Scene instances
// share their geometry and textures; SkeletonUtils gives figures independent bones.
export async function loadModels(): Promise<void> {
  const missing: string[] = [];
  const manager = new THREE.LoadingManager();
  manager.onError = (url) => { missing.push(url); };
  const loader = new GLTFLoader(manager);
  await Promise.all((Object.entries(sources) as [ModelId, string][]).map(async ([id, path]) => {
    if (templates.has(id)) return;
    const { scene } = await loader.loadAsync(`${import.meta.env.BASE_URL}assets/kenney/${path}.glb`);
    if (id === 'astronaut' || id === 'astronautPartner') scene.rotation.y = -Math.PI / 2;
    const converted = new Map<THREE.Material, THREE.MeshToonMaterial>();
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const convert = (source: THREE.MeshStandardMaterial): THREE.MeshToonMaterial => {
        let material = converted.get(source);
        if (material) return material;
        const color = source.color.clone();
        if (/leaf|grass/i.test(source.name)) color.set(0x83b89c);
        else if (/wood|bark/i.test(source.name)) color.set(0x9e7d63);
        else if (!source.map) color.lerp(new THREE.Color(0xe7ead8), 0.13);
        material = toon(color);
        material.name = source.name;
        material.map = source.map;
        if (path.startsWith('train-kit/') && material.map) {
          // This palette includes gradients; nearest sampling stripes the large car sides.
          material.map.magFilter = THREE.LinearFilter;
          material.map.minFilter = THREE.LinearMipmapLinearFilter;
          material.map.needsUpdate = true;
        }
        material.side = source.side;
        material.transparent = source.transparent;
        material.opacity = source.opacity;
        material.alphaTest = source.alphaTest;
        converted.set(source, material);
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => convert(material as THREE.MeshStandardMaterial))
        : convert(object.material as THREE.MeshStandardMaterial);
      object.castShadow = true;
      object.receiveShadow = !path.startsWith('space-kit/') && !['oak', 'tree', 'slenderTree', 'cypress', 'bush', 'smallBush', 'flowers', 'yellowFlowers', 'leaves', 'palm', 'bentPalm', 'locomotive', 'passengerCar'].includes(id);
      object.userData.sharedAsset = true;
      if (['statue', 'column', 'brokenColumn', 'rowboat'].includes(id)) {
        outline(object, 0.22);
        object.children[object.children.length - 1].userData.sharedAsset = true;
      }
    });
    converted.forEach((_, original) => original.dispose());
    if (id === 'archedWindow') {
      // Follow the polygonal arch midway through the Kenney frame's thickness.
      // Native model coordinates keep pane and frame aligned at every placement scale.
      const shape = new THREE.Shape();
      shape.moveTo(-0.13125, 0);
      shape.lineTo(0.13125, 0);
      shape.lineTo(0.13125, 0.305);
      shape.lineTo(0.09135, 0.40135);
      shape.lineTo(0, 0.43919);
      shape.lineTo(-0.09135, 0.40135);
      shape.lineTo(-0.13125, 0.305);
      shape.closePath();
      const pane = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat.door);
      pane.name = 'arched-window-pane';
      pane.position.z = 0.026;
      pane.userData.sharedAsset = true;
      scene.add(pane);
    }
    templates.set(id, scene);
  }));
  if (missing.length) throw new Error(`No se pudieron cargar recursos: ${missing.join(', ')}`);
}

type Placement = {
  height?: number;
  width?: number;
  depth?: number;
  rotation?: number;
  color?: THREE.ColorRepresentation;
};

export function placeModel(
  id: ModelId,
  parent: THREE.Object3D,
  position: [number, number, number],
  options: Placement = {},
): THREE.Group {
  const template = templates.get(id);
  if (!template) throw new Error(`Modelo sin cargar: ${id}`);
  const model = clone(template) as THREE.Group;
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = options.height ? options.height / size.y : options.width ? options.width / size.x : 1;
  model.scale.setScalar(scale);
  if (options.width) model.scale.x = options.width / size.x;
  if (options.depth) model.scale.z = options.depth / size.z;
  model.position.set(
    -(bounds.min.x + size.x / 2) * model.scale.x,
    -bounds.min.y * model.scale.y,
    -(bounds.min.z + size.z / 2) * model.scale.z,
  );
  if (options.color !== undefined) {
    const material = toon(options.color);
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = material;
      object.userData.ownedMaterial = true;
    });
  }
  const root = new THREE.Group();
  root.name = `kenney:${id}`;
  root.position.set(...position);
  root.rotation.y = options.rotation ?? 0;
  root.add(model);
  parent.add(root);
  return root;
}

// Compute after the room's transform, so collision bounds follow areaOrder too.
export function modelCollider(object: THREE.Object3D, inset = 0): Collider {
  object.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(object);
  return { minX: bounds.min.x + inset, maxX: bounds.max.x - inset, minZ: bounds.min.z + inset, maxZ: bounds.max.z - inset };
}
