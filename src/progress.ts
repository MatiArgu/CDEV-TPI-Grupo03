import { areaCatalog, availabilityOf, type AreaId } from './catalog';

export const saveKey = 'museo-del-tiempo:v1';
export type VisitProgress = { version: 1; hasPamphlet: boolean; photos: Partial<Record<AreaId, string>> };
const empty = (): VisitProgress => ({ version: 1, hasPamphlet: false, photos: {} });

export async function loadProgress(): Promise<VisitProgress> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(saveKey) ?? 'null');
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) return empty();
    const stored = value as VisitProgress; const progress = empty();
    progress.hasPamphlet = stored.hasPamphlet === true;
    if (!stored.photos || typeof stored.photos !== 'object') return progress;
    for (const id of Object.keys(areaCatalog) as AreaId[]) {
      const photo = stored.photos[id];
      if (availabilityOf(id) !== 'playable' || typeof photo !== 'string' || photo.length >= 500_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo)) continue;
      try {
        const image = new Image(); image.src = photo; await image.decode();
        if (image.naturalWidth && image.naturalHeight) progress.photos[id] = photo;
      } catch { /* A damaged photo must not mark its area completed. */ }
    }
    if (Object.keys(progress.photos).length) progress.hasPamphlet = true;
    return progress;
  } catch { return empty(); }
}

export function saveProgress(progress: VisitProgress): boolean {
  try { localStorage.setItem(saveKey, JSON.stringify(progress)); return true; } catch { return false; }
}

export function resetProgress(): boolean {
  try { localStorage.removeItem(saveKey); return true; } catch { return false; }
}

export async function photoForSave(source: string): Promise<string> {
  const image = new Image(); image.src = source; await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = 480; canvas.height = 360;
  canvas.getContext('2d')!.drawImage(image, 0, 0, 480, 360);
  return canvas.toDataURL('image/jpeg', 0.82);
}
