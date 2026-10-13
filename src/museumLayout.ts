// One footprint for the entrance hall and both wings of the U-shaped circuit.
export const galleryLayout = {
  frontZ: -21.45,
  step: 16,
  wingX: 7.05,
  innerX: 1.65,
} as const;

export const museumLayout = {
  halfWidth: galleryLayout.wingX * 2 - galleryLayout.innerX,
  frontZ: -4.25,
  hallBackZ: galleryLayout.frontZ,
  backZ: galleryLayout.frontZ - galleryLayout.step * 5,
  wallHeight: 5.4,
  wallThickness: 0.32,
  floorY: 0.145,
} as const;
