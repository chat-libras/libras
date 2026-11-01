import type { LibrasControls } from '../LibrasTranslator';

export function resolveControls(controls: LibrasControls | undefined) {
  if (controls === undefined || controls === true) {
    return { start: true, text: true, speed: true };
  }
  if (controls === false) return { start: false, text: false, speed: false };
  return { start: !!controls.start, text: !!controls.text, speed: !!controls.speed };
}
