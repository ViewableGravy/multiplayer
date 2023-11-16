const times: number[] = [];
let previousFPS = 0;
let fps = 120;

export const updateFrameRate = () => {
  previousFPS = fps;
  
  const now = performance.now();
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;

  return fps;
}

export const setInnerFramerate = (el: HTMLElement) => {
  if (previousFPS !== fps) {
    el.innerHTML = `FPS: ${fps}`;
  }
}