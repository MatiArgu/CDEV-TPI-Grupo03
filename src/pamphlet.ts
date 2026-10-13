import { areaCatalog, areaOrder, areaNumber, availabilityCopy, availabilityOf } from './catalog';

export function createPamphlet(): { complete: (id: keyof typeof areaCatalog, photo: string) => void } {
  const map = document.querySelector<HTMLElement>('#pamphlet-map')!;
  const index = document.querySelector<HTMLElement>('#pamphlet-index')!;
  const note = document.querySelector<HTMLElement>('#pamphlet-note')!;
  const collection = document.querySelector<HTMLElement>('#pamphlet-collection')!;

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

  return { complete: (id, photo) => {
    const mapRoom = map.querySelector<HTMLElement>(`[data-area-id="${id}"]`)!;
    const indexItem = index.querySelector<HTMLElement>(`[data-area-id="${id}"]`)!;
    mapRoom.dataset.progress = 'completed';
    mapRoom.dataset.status = 'HECHA';
    mapRoom.setAttribute('aria-label', `${areaNumber(id)}: ${areaCatalog[id].name}, completada`);
    const thumb = document.createElement('img');
    thumb.className = 'map-photo-thumb';
    thumb.src = photo;
    thumb.alt = `Fotografía de ${areaCatalog[id].artifact}`;
    mapRoom.append(thumb);
    indexItem.dataset.progress = 'completed';
    const badge = indexItem.querySelector<HTMLElement>('.pamphlet-status')!;
    badge.textContent = 'HECHA';
    badge.setAttribute('aria-label', 'Área completada');

    collection.hidden = false;
    const memory = document.createElement('div');
    memory.className = 'pamphlet-memory';
    const picture = document.createElement('img');
    picture.src = photo;
    picture.alt = `Polaroid de ${areaCatalog[id].name}`;
    const detail = document.createElement('div');
    if (id === 'roma') detail.innerHTML = '<svg viewBox="0 0 48 42" aria-hidden="true"><path d="M9 22C9 9 16 4 24 4s15 5 15 18l-3 12H12L9 22Zm7-2h16m-19 5h22M24 5v-3m-4 32v5h8v-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const label = document.createElement('span');
    label.textContent = `${String(areaNumber(id)).padStart(2, '0')} · ${areaCatalog[id].artifact.toUpperCase()}`;
    detail.append(label);
    memory.append(picture, detail);
    collection.append(memory);
    const count = index.querySelectorAll('[data-progress="completed"]').length;
    note.textContent = `${count}/10 salas completadas. Las áreas en preparación siguen cerradas.`;
  } };
}
