import * as THREE from 'three';
import { areaCatalog, areaOrder, availabilityOf, type AreaId } from './catalog';
import { holdingHand, foreground } from './held';
import { roomSlots } from '../museum/museumLayout';

export function createPamphlet(camera: THREE.PerspectiveCamera) {
  const root = new THREE.Group();
  root.name = 'panfleto-en-las-manos';
  camera.add(root);
  const completed = new Map<AreaId, HTMLImageElement>();
  const description = document.querySelector<HTMLElement>('#held-description')!;
  let open = false;
  let amount = 0;
  let time = 0;
  const pages = [-1, 1].map((side) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1400;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const hinge = new THREE.Group();
    root.add(hinge);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.90, 0.004), new THREE.MeshBasicMaterial({ color: 0xd2c7ad }));
    paper.position.x = side * 0.33;
    hinge.add(paper);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.90), new THREE.MeshBasicMaterial({ map: texture }));
    face.position.set(side * 0.33, 0, 0.0025);
    hinge.add(face);
    const hand = holdingHand(side as -1 | 1);
    hand.position.set(side * 0.63, -0.27, 0.028);
    hand.rotation.z = -side * 0.16;
    hinge.add(hand);
    return { canvas, texture, hinge, side };
  });

  function redraw(): void {
    const active = areaOrder.find((id) => availabilityOf(id) === 'playable' && !completed.has(id));
    for (const { canvas, texture, side } of pages) {
      const c = canvas.getContext('2d')!;
      c.fillStyle = '#efe5cd'; c.fillRect(0, 0, 1024, 1400);
      const shade = c.createLinearGradient(0, 0, 1024, 0);
      shade.addColorStop(side < 0 ? 0 : 1, '#fff8e800');
      shade.addColorStop(side < 0 ? 1 : 0, '#75624938');
      c.fillStyle = shade; c.fillRect(0, 0, 1024, 1400);
      c.strokeStyle = '#b5a88d'; c.lineWidth = 2; c.strokeRect(38, 38, 948, 1324);
      const text = (value: string, x: number, y: number, size = 34, color = '#354a43', serif = false) => {
        c.fillStyle = color; c.font = `${serif ? '' : '500 '}${size}px ${serif ? 'Georgia' : 'sans-serif'}`;
        c.fillText(value, x, y);
      };
      text('MUSEO DE VIAJES EN EL TIEMPO', 80, 115, 32);
      if (side < 0) {
        text('Cinco puertas.', 80, 229, 83, '#33493e', true);
        text('Un viaje en el tiempo.', 80, 310, 65, '#33493e', true);
        text('PLANO DE VISITA', 80, 406, 32);
        // Same physical positions and proportions as the gallery, north at the top.
        const scale = 19;
        const left = 512;
        const top = 475;
        const back = Math.min(...roomSlots.map((slot) => slot.z - slot.depth / 2));
        areaOrder.forEach((id, index) => {
          const slot = roomSlots[index];
          const x = left + (slot.x - slot.width / 2) * scale;
          const y = top + (slot.z - slot.depth / 2 - back) * scale;
          const w = slot.width * scale; const h = slot.depth * scale;
          c.fillStyle = areaCatalog[id].accent; c.fillRect(x + 4, y + 4, w - 8, h - 8);
          c.strokeStyle = '#657367'; c.strokeRect(x + 4, y + 4, w - 8, h - 8);
          text(String(index + 1).padStart(2, '0'), x + w / 2 - 27, y + h / 2 + 14, 52);
          if (completed.has(id)) text('✓', x + w - 47, y + h - 25, 42);
        });
        // Direction arrows follow Egypt → Rome → bridge → Japan → Moon.
        text('↑', 181, 1060, 65); text('→', 481, 650, 65); text('↓', 790, 1060, 65);
        text('HALL / ENTRADA Y REGRESO', 208, 1320, 31);
      } else {
        text('Tu recorrido', 80, 235, 85, '#33493e', true);
        areaOrder.forEach((id, index) => {
          const y = 325 + index * 108;
          c.fillStyle = areaCatalog[id].accent; c.fillRect(78, y - 34, 68, 58);
          text(String(index + 1).padStart(2, '0'), 86, y + 6, 39);
          text(areaCatalog[id].name.replace(' · 1969', ''), 177, y, 44);
          text(completed.has(id) ? 'RECUERDO RECUPERADO' : id === active ? 'VIAJE DISPONIBLE · POLAROID' : availabilityOf(id) === 'playable' ? `PRIMERO SALA ${String(areaOrder.indexOf(active!) + 1).padStart(2, '0')}` : 'VISITABLE · VIAJE EN PREPARACIÓN', 177, y + 46, 27, '#766952');
          c.strokeStyle = '#c8bca1'; c.beginPath(); c.moveTo(80, y + 76); c.lineTo(930, y + 76); c.stroke();
        });
        const memories = areaOrder.filter((id) => completed.has(id));
        if (memories.length) {
          memories.forEach((id, index) => {
            const y = 895 + index * 115;
            c.save(); c.translate(143, y + 18); c.rotate(-0.05);
            c.fillStyle = '#fff9e9'; c.fillRect(-63, -51, 144, 111);
            c.drawImage(completed.get(id)!, -56, -44, 130, 97.5); c.restore();
            text(areaCatalog[id].name.toUpperCase(), 270, y, 32);
            text(`✓ ${areaCatalog[id].artifact}`, 270, y + 47, 29);
            c.save(); c.translate(873, y + 10); c.scale(0.64, 0.64);
            if (id === 'egipto') {
              c.fillStyle = '#8f7d50'; c.beginPath(); c.ellipse(0, 0, 60, 20, 0, 0, Math.PI * 2); c.fill();
              c.fillStyle = '#477f7c'; c.beginPath(); c.ellipse(0, 0, 25, 38, 0, 0, Math.PI * 2); c.fill();
              c.strokeStyle = '#d0b573'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -32); c.lineTo(0, 32); c.stroke();
            } else if (id === 'medieval') {
              c.strokeStyle = '#9c7c48'; c.lineWidth = 13; c.beginPath(); c.arc(-22, -15, 23, 0, Math.PI * 2); c.stroke();
              c.fillStyle = '#9c7c48'; c.fillRect(-5, -21, 70, 13); c.fillRect(38, -8, 12, 22); c.fillRect(57, -8, 12, 17);
            } else {
              c.fillStyle = '#a78650'; c.beginPath(); c.arc(0, 0, 42, Math.PI, 0); c.lineTo(42, 38); c.lineTo(18, 38); c.lineTo(18, 5); c.lineTo(-18, 5); c.lineTo(-18, 38); c.lineTo(-42, 38); c.closePath(); c.fill();
              c.fillStyle = '#ae6f53'; c.fillRect(-7, -65, 14, 48);
            }
            c.restore();
          });
        } else {
          text('Explorá las cinco salas.', 80, 1070, 40, '#33493e', true);
          text('Tres épocas te esperan al otro lado', 80, 1130, 33);
          text('de la fotografía. Empezá por la sala 01.', 80, 1180, 33);
        }
        text(`${completed.size} / ${areaOrder.length} RECUERDOS${!active ? " · VISITA COMPLETADA" : ""}`, 80, 1260, 28);
        text('M GUARDAR · CLIC VOLVER AL RECORRIDO', 80, 1320, 28);
      }
      texture.needsUpdate = true;
    }
    description.textContent = `Panfleto: ${areaOrder.map((id, i) => `${i + 1}. ${areaCatalog[id].name}, ${completed.has(id) ? 'completada' : id === active ? 'viaje disponible' : availabilityOf(id) === 'playable' ? 'viaje posterior al área activa' : 'visitable, viaje en preparación'}`).join('. ')}. ${completed.size}/${areaOrder.length} recuerdos. M o clic para guardar.`;
  }
  redraw();
  foreground(root);
  root.visible = false;
  return {
    root,
    setOpen(value: boolean) { open = value; description.hidden = !value; },
    update(delta: number) {
      const dt = Math.min(delta, 0.05);
      time += dt;
      amount = THREE.MathUtils.damp(amount, open ? 1 : 0, 7, dt);
      root.visible = amount > 0.005;
      const fit = Math.min(1, camera.aspect / 1.45);
      root.scale.setScalar(fit);
      root.position.set(0, -0.045 - (1 - amount) * 1.05, -1.04);
      root.rotation.set(-0.07 - (1 - amount) * 0.55, 0, -0.012 + Math.sin(time * 1.2) * 0.003);
      pages.forEach(({ hinge, side }) => { hinge.rotation.y = -side * (0.045 + (1 - amount) * 1.48); });
    },
    complete(id: AreaId, photo: string) {
      const image = new Image();
      image.onload = () => { completed.set(id, image); redraw(); };
      image.src = photo;
    },
  };
}
