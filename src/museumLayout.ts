// One footprint for the entrance hall and both wings of the U-shaped circuit.
export const galleryLayout = {
  frontZ: -21.45,
  step: 16,
  wingX: 7.05,
  innerX: 1.65,
  bridgeDepth: 10,
} as const;

export const museumLayout = {
  halfWidth: galleryLayout.wingX * 2 - galleryLayout.innerX,
  frontZ: -4.25,
  hallBackZ: galleryLayout.frontZ,
  backZ: galleryLayout.frontZ - galleryLayout.step * 2 - galleryLayout.bridgeDepth,
  wallHeight: 5.4,
  wallThickness: 0.32,
  floorY: 0.145,
} as const;

// Five physical positions, in walking order. Identity always comes from areaOrder.
export const roomSlots = [
  { x: -galleryLayout.wingX, z: galleryLayout.frontZ - galleryLayout.step / 2, width: (galleryLayout.wingX - galleryLayout.innerX) * 2, depth: galleryLayout.step },
  { x: -galleryLayout.wingX, z: galleryLayout.frontZ - galleryLayout.step * 1.5, width: (galleryLayout.wingX - galleryLayout.innerX) * 2, depth: galleryLayout.step },
  { x: 0, z: museumLayout.backZ + galleryLayout.bridgeDepth / 2, width: museumLayout.halfWidth * 2, depth: galleryLayout.bridgeDepth },
  { x: galleryLayout.wingX, z: galleryLayout.frontZ - galleryLayout.step * 1.5, width: (galleryLayout.wingX - galleryLayout.innerX) * 2, depth: galleryLayout.step },
  { x: galleryLayout.wingX, z: galleryLayout.frontZ - galleryLayout.step / 2, width: (galleryLayout.wingX - galleryLayout.innerX) * 2, depth: galleryLayout.step },
] as const;
