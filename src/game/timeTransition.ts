/** Fade on the game clock: pausing never swaps scenes or completes a journey. */
export async function playTimeTransition(
  overlay: HTMLElement,
  swapScene: () => void | Promise<void>,
  isPaused: () => boolean,
): Promise<void> {
  const wait = (duration: number, paint: (progress: number) => void = () => {}) => new Promise<void>(resolve => {
    let elapsed = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(now - previous, 50);
      previous = now;
      if (!isPaused()) elapsed += delta;
      paint(Math.min(elapsed / duration, 1));
      if (elapsed >= duration) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  overlay.hidden = false;
  overlay.style.opacity = '0';
  await wait(650, progress => { overlay.style.opacity = String(progress); });
  await swapScene();
  await wait(700);
  await wait(450, progress => { overlay.style.opacity = String(1 - progress); });
  overlay.hidden = true;
}
