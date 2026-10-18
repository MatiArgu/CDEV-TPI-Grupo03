// Synthesized effects: no audio files, no licenses to track.
let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean): void { enabled = value; }

function audio(): AudioContext | null {
  if (!enabled) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function envelope(ctx: AudioContext, start: number, peak: number, attack: number, release: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
  gain.connect(ctx.destination);
  return gain;
}

function tone(ctx: AudioContext, type: OscillatorType, frequency: number, start: number, peak: number, attack: number, release: number): OscillatorNode {
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.connect(envelope(ctx, start, peak, attack, release));
  oscillator.start(start);
  oscillator.stop(start + attack + release + 0.02);
  return oscillator;
}

function hiss(ctx: AudioContext, filter: BiquadFilterType, frequency: number, start: number, peak: number, attack: number, release: number): BiquadFilterNode {
  noise ??= (() => {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  })();
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const shape = ctx.createBiquadFilter();
  shape.type = filter;
  shape.frequency.setValueAtTime(frequency, start);
  source.connect(shape).connect(envelope(ctx, start, peak, attack, release));
  source.start(start, Math.random());
  source.stop(start + attack + release + 0.02);
  return shape;
}

export function playShutter(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 'square', 220, now, 0.08, 0.008, 0.047);
  tone(ctx, 'square', 125, now + 0.07, 0.08, 0.008, 0.047);
}

// Lower cutoff sounds softer: sand and grass muffle, the helmet almost silences the Moon.
const surfaces = { museo: 1500, egipto: 520, roma: 1100, medieval: 850, japon: 650, luna: 220 } as const;
export type Surface = keyof typeof surfaces;

export function playStep(surface: Surface): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  hiss(ctx, 'lowpass', surfaces[surface] * (0.9 + Math.random() * 0.2), now, surface === 'luna' ? 0.05 : 0.09, 0.006, 0.09);
}

export function playDoor(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  const creak = tone(ctx, 'sawtooth', 180, now, 0.012, 0.25, 0.9);
  creak.frequency.linearRampToValueAtTime(120, now + 1.1);
  tone(ctx, 'sine', 70, now + 1.05, 0.25, 0.01, 0.4);
}

export function playPaper(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  hiss(ctx, 'highpass', 2600, now, 0.05, 0.02, 0.18);
  hiss(ctx, 'highpass', 3400, now + 0.12, 0.035, 0.02, 0.15);
}

// Rising major arpeggio with soft bell partials when the artifact is recovered.
export function playCelestial(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((frequency, i) => {
    tone(ctx, 'sine', frequency, now + i * 0.11, 0.07, 0.04, 2.4);
    tone(ctx, 'triangle', frequency * 2, now + i * 0.11, 0.015, 0.02, 1.2);
  });
}

// Bright rising fanfare for the golden closing card.
export function playFanfare(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  [[0, 523.25], [0.16, 659.25], [0.32, 783.99]].forEach(([delay, frequency]) => {
    tone(ctx, 'triangle', frequency, now + delay, 0.09, 0.02, 0.35);
  });
  for (const frequency of [523.25, 659.25, 783.99, 1046.5]) {
    tone(ctx, 'triangle', frequency, now + 0.5, 0.06, 0.04, 2.6);
    tone(ctx, 'sine', frequency * 2, now + 0.5, 0.02, 0.04, 1.8);
  }
}

export function playTimeWarp(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  const sweep = hiss(ctx, 'bandpass', 300, now, 0.12, 0.6, 1.2);
  sweep.Q.value = 4;
  sweep.frequency.exponentialRampToValueAtTime(3200, now + 1.6);
}

export function playLaunch(): void {
  const ctx = audio(); if (!ctx) return;
  const now = ctx.currentTime;
  hiss(ctx, 'lowpass', 160, now, 0.35, 0.8, 3.5);
  tone(ctx, 'sine', 45, now, 0.2, 0.8, 3.5);
}
