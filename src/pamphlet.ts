import { areaCatalog, areaOrder, areaNumber } from './catalog';

export function createPamphlet(): void {
  const map = document.querySelector<HTMLElement>('#pamphlet-map')!;
  const index = document.querySelector<HTMLElement>('#pamphlet-index')!;

  for (let row = 0; row < 5; row++) {
    for (const offset of [0, 1]) {
      const id = areaOrder[row * 2 + offset];
      const node = document.createElement('div');
      node.className = 'map-room';
      node.dataset.areaId = id;
      node.dataset.availability = areaCatalog[id].availability;
      node.style.setProperty('--area-accent', areaCatalog[id].accent);
      node.textContent = String(areaNumber(id)).padStart(2, '0');
      node.setAttribute('aria-label', `${areaNumber(id)}: ${areaCatalog[id].name}, en preparación`);
      map.append(node);
      if (offset === 0) {
        const corridor = document.createElement('span');
        corridor.className = 'map-corridor';
        map.append(corridor);
      }
    }
  }

  areaOrder.forEach((id) => {
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
    status.textContent = 'WIP';
    status.setAttribute('aria-label', 'En preparación');
    item.append(number, name, status);
    index.append(item);
  });
}
