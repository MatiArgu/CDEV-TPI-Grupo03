import { areaCatalog, areaOrder, areaNumber, availabilityCopy, availabilityOf } from './catalog';

export function createPamphlet(): void {
  const map = document.querySelector<HTMLElement>('#pamphlet-map')!;
  const index = document.querySelector<HTMLElement>('#pamphlet-index')!;
  const note = document.querySelector<HTMLElement>('#pamphlet-note')!;

  for (let row = 0; row < 5; row++) {
    for (const side of ['left', 'right'] as const) {
      const id = areaOrder[side === 'left' ? row : 9 - row];
      const node = document.createElement('div');
      node.className = `map-room map-room-${side}`;
      node.dataset.areaId = id;
      node.dataset.availability = areaCatalog[id].availability;
      const status = availabilityCopy(areaCatalog[id].availability);
      node.dataset.status = status.badge;
      node.style.setProperty('--area-accent', areaCatalog[id].accent);
      node.textContent = String(areaNumber(id)).padStart(2, '0');
      node.setAttribute('aria-label', `${areaNumber(id)}: ${areaCatalog[id].name}, ${status.description}`);
      node.style.gridRow = String(row + 1);
      map.append(node);
    }
  }
  const courtyard = document.createElement('span');
  courtyard.className = 'map-courtyard';
  courtyard.textContent = 'PATIO';
  courtyard.setAttribute('aria-hidden', 'true');
  map.append(courtyard);

  areaOrder.forEach((id) => {
    const availability = availabilityCopy(areaCatalog[id].availability);
    const item = document.createElement('li');
    item.dataset.areaId = id;
    item.dataset.availability = areaCatalog[id].availability;
    item.style.setProperty('--area-accent', areaCatalog[id].accent);
    const number = document.createElement('span');
    number.textContent = String(areaNumber(id)).padStart(2, '0');
    const name = document.createElement('span');
    name.textContent = areaCatalog[id].name;
    const status = document.createElement('span');
    status.className = 'pamphlet-status';
    status.textContent = availability.badge;
    status.setAttribute('aria-label', availability.description);
    item.append(number, name, status);
    index.append(item);
  });

  const installed = areaOrder.filter((id) => availabilityOf(id) === 'playable').length;
  if (installed > 0) note.textContent = `${installed} exhibición${installed === 1 ? '' : 'es'} instalada${installed === 1 ? '' : 's'}. Abrí cada puerta al completar la sala anterior; las áreas WIP permanecen cerradas.`;
}
