// Golden closing card with falling confetti, shown once the five journeys are complete.
const colors = ['#f2c75c', '#e9a03b', '#fff1c1', '#e58362', '#8ddccb', '#64c7b8'];

export function createFinale() {
  const root = document.querySelector<HTMLElement>('#finale')!;
  const canvas = document.querySelector<HTMLCanvasElement>('#finale-confetti')!;
  const context = canvas.getContext('2d')!;
  let pieces: { x: number; y: number; speed: number; drift: number; spin: number; size: number; color: string }[] = [];
  let frame = 0;
  let openedAt = 0;

  function draw(): void {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const time = performance.now() / 1000;
    for (const piece of pieces) {
      piece.y += piece.speed;
      if (piece.y > canvas.height + 20) piece.y = -20;
      const x = piece.x * canvas.width + Math.sin(time * piece.drift + piece.spin) * 30;
      context.save();
      context.translate(x, piece.y);
      context.rotate(time * piece.drift + piece.spin);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      context.restore();
    }
    frame = requestAnimationFrame(draw);
  }

  return {
    show(): void {
      pieces = Array.from({ length: 140 }, (_, i) => ({
        x: Math.random(), y: -Math.random() * window.innerHeight, speed: 1.2 + Math.random() * 2.4,
        drift: 0.8 + Math.random() * 2, spin: i, size: 7 + Math.random() * 8, color: colors[i % colors.length],
      }));
      root.hidden = false;
      openedAt = performance.now();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    },
    hide(): void {
      root.hidden = true;
      cancelAnimationFrame(frame);
    },
    // A short delay keeps a reflexive M (the pamphlet key) from restarting the visit by accident.
    ready: () => !root.hidden && performance.now() - openedAt > 1500,
  };
}
