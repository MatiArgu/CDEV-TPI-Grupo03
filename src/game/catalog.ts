export const areaCatalog = {
  roma: { name: 'Antigua Roma', artifact: 'Casco de gladiador', accent: '#e9a077', availability: 'playable' },
  egipto: { name: 'Antiguo Egipto', artifact: 'Escarabajo egipcio', accent: '#e4c989', availability: 'playable' },
  medieval: { name: 'Época Medieval', artifact: 'Llave antigua', accent: '#b7c7ab', availability: 'playable' },
  japon: { name: 'Japón Feudal', artifact: 'Máscara de samurái', accent: '#dcb9be', availability: 'wip' },
  luna: { name: 'Llegada a la Luna · 1969', artifact: 'Insignia Apollo 11', accent: '#cbc7e0', availability: 'wip' },
} as const;

export type AreaId = keyof typeof areaCatalog;
export type AreaAvailability = 'wip' | 'playable';

export function availabilityOf(id: AreaId): AreaAvailability {
  return areaCatalog[id].availability;
}

export function availabilityCopy(availability: AreaAvailability): { badge: string; sign: string; description: string } {
  return availability === 'wip'
    ? { badge: 'PRÓXIMAMENTE', sign: 'VIAJE EN PREPARACIÓN', description: 'visitable · viaje en preparación' }
    : { badge: 'LISTA', sign: 'EXHIBICIÓN INSTALADA', description: 'exhibición instalada' };
}

// The index determines the physical slot, room number and map position.
export const areaOrder: AreaId[] = ['egipto', 'roma', 'medieval', 'japon', 'luna'];

if (areaOrder.length !== Object.keys(areaCatalog).length || new Set(areaOrder).size !== areaOrder.length) {
  throw new Error('areaOrder debe contener cada área exactamente una vez');
}

export function areaNumber(id: AreaId): number {
  const index = areaOrder.indexOf(id);
  if (index < 0) throw new Error(`Falta ${id} en areaOrder`);
  return index + 1;
}
