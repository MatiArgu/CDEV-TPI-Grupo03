export const areaCatalog = {
  roma: { name: 'Roma Antigua', artifact: 'Casco de gladiador' },
  egipto: { name: 'Egipto Antiguo', artifact: 'Escarabajo egipcio' },
  grecia: { name: 'Grecia Antigua', artifact: 'Corona de laurel' },
  babilonia: { name: 'Mesopotamia · Babilonia', artifact: 'Tablilla cuneiforme' },
  medieval: { name: 'Edad Media · Castillo medieval', artifact: 'Llave antigua' },
  renacimiento: { name: 'Renacimiento Italiano', artifact: 'Compás de artista' },
  japon: { name: 'Japón Feudal', artifact: 'Máscara de samurái' },
  paris_1830: { name: 'Revolución de Julio · París, 1830', artifact: 'Escarapela tricolor' },
  titanic: { name: 'Titanic · 1912', artifact: 'Reloj de bolsillo' },
  luna: { name: 'Llegada a la Luna · 1969', artifact: 'Insignia Apollo 11' },
} as const;

export type AreaId = keyof typeof areaCatalog;

// The index determines map position and room number. Later stages will use it for room placement.
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
