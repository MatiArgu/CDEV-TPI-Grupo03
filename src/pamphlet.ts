import { areaCatalog, areaOrder, areaNumber } from './catalog';

export function createPamphlet(): void {
  const map = document.querySelector<HTMLElement>('#pamphlet-map')!;
  const index = document.querySelector<HTMLElement>('#pamphlet-index')!;

  for (let row = 0; row < 5; row++) {
    for (const offset of [0, 1]) {
      const id = areaOrder[row * 2 + offset];
      const node = document.createElement('div');
      node.className = `map-room${id === 'roma' ? ' map-room-rome' : ''}`;
      node.textContent = String(areaNumber(id)).padStart(2, '0');
      node.setAttribute('aria-label', `${areaNumber(id)}: ${areaCatalog[id].name}`);
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
    if (id === 'roma') item.className = 'pamphlet-rome';
    const number = document.createElement('span');
    number.textContent = String(areaNumber(id)).padStart(2, '0');
    const name = document.createElement('span');
    name.textContent = areaCatalog[id].name;
    item.append(number, name);
    index.append(item);
  });
}
