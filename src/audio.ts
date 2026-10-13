/** Quiet synthesized air and room tone; starts only after the visitor's click. */
export function createAmbience() {
  let context: AudioContext | null = null;
  let volume: GainNode; let filter: BiquadFilterNode;
  let muted = false;
  return {
    enabled: () => !muted,
    toggle() { muted = !muted; return !muted; },
    async start() {
      if (!context) {
        context = new AudioContext(); volume = context.createGain(); volume.gain.value = 0;
        filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 550;
        const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
        const data = buffer.getChannelData(0); let smooth = 0;
        for (let i = 0; i < data.length; i++) { smooth = (smooth + (Math.random() * 2 - 1) * 0.03) / 1.03; data[i] = smooth * 3; }
        const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
        source.connect(filter).connect(volume).connect(context.destination); source.start();
      }
      if (context.state === 'suspended') await context.resume();
    },
    update(location: string, paused: boolean) {
      if (!context) return;
      const outdoors = location === 'exterior' || location.endsWith('-history');
      volume.gain.setTargetAtTime(muted || paused ? 0 : outdoors ? 0.16 : 0.035, context.currentTime, 0.6);
      filter.frequency.setTargetAtTime(location === 'egipto-history' ? 800 : outdoors ? 500 : 230, context.currentTime, 0.8);
    },
  };
}
