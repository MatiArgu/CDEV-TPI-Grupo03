export const areaCatalog = {
  roma: { name: 'Roma Antigua', artifact: 'Casco de gladiador', accent: '#e9a077', availability: 'playable' },
  egipto: { name: 'Egipto Antiguo', artifact: 'Escarabajo egipcio', accent: '#e4c989', availability: 'wip' },
  grecia: { name: 'Grecia Antigua', artifact: 'Corona de laurel', accent: '#a9d8d0', availability: 'wip' },
  babilonia: { name: 'Mesopotamia · Babilonia', artifact: 'Tablilla cuneiforme', accent: '#c3bbd8', availability: 'wip' },
  medieval: { name: 'Edad Media · Castillo medieval', artifact: 'Llave antigua', accent: '#b7c7ab', availability: 'wip' },
  renacimiento: { name: 'Renacimiento Italiano', artifact: 'Compás de artista', accent: '#e8b9ac', availability: 'wip' },
  japon: { name: 'Japón Feudal', artifact: 'Máscara de samurái', accent: '#dcb9be', availability: 'wip' },
  paris_1830: { name: 'Revolución de Julio · París, 1830', artifact: 'Escarapela tricolor', accent: '#a8c6da', availability: 'wip' },
  titanic: { name: 'Titanic · 1912', artifact: 'Reloj de bolsillo', accent: '#adc8ce', availability: 'wip' },
  luna: { name: 'Llegada a la Luna · 1969', artifact: 'Insignia Apollo 11', accent: '#cbc7e0', availability: 'wip' },
} as const;

export type AreaId = keyof typeof areaCatalog;
export type AreaAvailability = 'wip' | 'playable';

export function availabilityOf(id: AreaId): AreaAvailability {
  return areaCatalog[id].availability;
}

export function availabilityCopy(availability: AreaAvailability): { badge: string; sign: string; description: string } {
  return availability === 'wip'
    ? { badge: 'WIP', sign: 'EN PREPARACIÓN · WIP', description: 'sala en preparación' }
    : { badge: 'LISTA', sign: 'EXHIBICIÓN INSTALADA', description: 'exhibición instalada' };
}

// The index determines the physical slot, room number and map position.
export const areaOrder: AreaId[] = [
  'roma', 'egipto', 'grecia', 'babilonia', 'medieval',
  'renacimiento', 'japon', 'paris_1830', 'titanic', 'luna',
];

if (areaOrder.length !== Object.keys(areaCatalog).length || new Set(areaOrder).size !== areaOrder.length) {
  throw new Error('areaOrder debe contener cada área exactamente una vez');
}

export function areaNumber(id: AreaId): number {
  const index = areaOrder.indexOf(id);
  if (index < 0) throw new Error(`Falta ${id} en areaOrder`);
  return index + 1;
}
