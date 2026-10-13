function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export async function playTimeTransition(overlay: HTMLElement, swapScene: () => void): Promise<void> {
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('time-transition-active'));
  await wait(650);
  swapScene();
  await wait(700);
  overlay.classList.remove('time-transition-active');
  await wait(450);
  overlay.hidden = true;
}
