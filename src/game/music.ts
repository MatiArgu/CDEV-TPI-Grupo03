import type { AreaId } from './catalog';

export type MusicTrack = 'museo' | AreaId;

// Credits and licenses: public/assets/music/CREDITOS.md.
const files: Record<MusicTrack, string> = {
  museo: 'museo.m4a',
  egipto: 'egipto.m4a',
  roma: 'roma.m4a',
  medieval: 'medieval.m4a',
  japon: 'japon.ogg',
  luna: 'luna.ogg',
};
const fadeSeconds = 2;
const baseVolume = 0.4;
const pausedVolume = 0.35;

type Voice = { track: MusicTrack; element: HTMLAudioElement; level: number; target: number; handedOff: boolean };

export function createMusic() {
  const voices: Voice[] = [];
  let current: MusicTrack | null = null;
  let enabled = true;

  function start(track: MusicTrack): void {
    const element = new Audio(`${import.meta.env.BASE_URL}assets/music/${files[track]}`);
    element.volume = 0;
    voices.push({ track, element, level: 0, target: 1, handedOff: false });
    element.play().catch(() => {});
  }

  return {
    play(track: MusicTrack): void {
      if (track === current) return;
      current = track;
      for (const voice of voices) voice.target = 0;
      start(track);
    },
    setEnabled(value: boolean): void { enabled = value; },
    update(delta: number, paused: boolean): void {
      const step = Math.min(delta, 0.1) / fadeSeconds;
      const master = enabled ? baseVolume * (paused ? pausedVolume : 1) : 0;
      for (const voice of [...voices]) {
        const { element } = voice;
        // Crossfade into a fresh copy before the end so loops never cut abruptly.
        if (!voice.handedOff && voice.target > 0 && element.duration && element.currentTime > element.duration - fadeSeconds) {
          voice.handedOff = true;
          voice.target = 0;
          start(voice.track);
        }
        voice.level = voice.target > voice.level ? Math.min(voice.target, voice.level + step) : Math.max(voice.target, voice.level - step);
        element.volume = voice.level * master;
        if ((voice.level === 0 && voice.target === 0) || element.ended) {
          element.pause();
          voices.splice(voices.indexOf(voice), 1);
        }
      }
    },
  };
}
