// Intentional wheel distance for the complete panorama → street → lobby → office journey.
export const CITY_TRAVEL = 3000;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const finiteProgress = (value: number) => Number.isFinite(value) ? clamp(value) : 0;
const segment = (progress: number, start: number, end: number) => clamp((progress - start) / (end - start));
const smoothstep = (start: number, end: number, progress: number) => {
  const value = segment(progress, start, end);
  return value * value * (3 - 2 * value);
};
const exposure = (progress: number, enterStart: number, enterEnd: number, exitStart = 1, exitEnd = 2) =>
  smoothstep(enterStart, enterEnd, progress) * (1 - smoothstep(exitStart, exitEnd, progress));

export function normalizeCityWheel(event: { deltaY: number; deltaX: number; deltaMode: number; ctrlKey: boolean; metaKey: boolean }): number {
  // Trackpad scrolling can arrive on either axis. Modified wheel events belong
  // to browser/pinch zoom and must never move the architectural camera.
  if (event.ctrlKey || event.metaKey || !Number.isFinite(event.deltaY) || !Number.isFinite(event.deltaX)) return 0;
  const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 720 : 1;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  return clamp(delta * factor, -180, 180);
}

export type CityDragState = { startX: number; startY: number; x: number; y: number; axis: 'horizontal' | 'vertical' | null };
export function beginCityDrag(x: number, y: number): CityDragState {
  return { startX: x, startY: y, x, y, axis: null };
}
/** Rightward dragging or upward swiping advances; reverse input retraces the camera.
 * Lock the dominant axis after a small threshold so diagonal noise cannot jump
 * between directions. Two viewport lengths cover the complete journey.
 */
export function updateCityDrag(state: CityDragState, x: number, y: number, width: number, height: number): { state: CityDragState; delta: number } {
  if (![state.x, state.y, x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return { state, delta: 0 };
  const dx = x - state.startX, dy = y - state.startY;
  if (!state.axis && Math.max(Math.abs(dx), Math.abs(dy)) < 6) return { state, delta: 0 };
  const axis = state.axis ?? (Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical');
  const distance = axis === 'horizontal' ? x - state.x : state.y - y;
  const size = axis === 'horizontal' ? width : height;
  return { state: { ...state, x, y, axis }, delta: clamp(distance * CITY_TRAVEL / (size * 2), -CITY_TRAVEL / 2, CITY_TRAVEL / 2) };
}
export function advanceCityProgress(current: number, delta: number): number {
  return Number.isFinite(delta) ? clamp(finiteProgress(current) + delta / CITY_TRAVEL) : finiteProgress(current);
}
export function smoothCityProgress(current: number, target: number, milliseconds: number): number {
  const from = finiteProgress(current), to = finiteProgress(target);
  const elapsed = Number.isFinite(milliseconds) ? clamp(milliseconds, 0, 64) : 16;
  const next = from + (to - from) * (1 - Math.exp(-elapsed / 130));
  return Math.abs(next - to) < .00015 ? to : next;
}

// Kept for consumers of the original single-image camera.
export function cityFrame(progress: number, reducedMotion = false) {
  const p = finiteProgress(progress);
  return {
    scale: reducedMotion ? 1 : Math.exp(Math.log(2.6) * Math.pow(p, 1.55)),
    titleOpacity: 1 - smoothstep(.10, .42, p),
    veilOpacity: smoothstep(.88, 1, p),
  };
}

export interface CitySceneFrame {
  opacity: number;
  scale: number;
  /** Translation units are viewport width and height, independent of artwork pixels. */
  x: number;
  y: number;
  travel: number;
}

/**
 * Reversible layered camera, not a timeline: every frame is derived from one position.
 * The next photograph is visible before the preceding camera plane passes it. Separate
 * nearby river/façade planes sweep outward, then glass leaves open onto the office.
 * Image layers use translate3d(x vw, y vh, 0) scale(scale), origin 50% 55%.
 */
export function cityFlightFrame(progress: number, reducedMotion = false) {
  const p = finiteProgress(progress);
  const scene = (opacity: number, scale: number, x: number, y: number, travel: number): CitySceneFrame => ({
    opacity,
    scale: reducedMotion ? 1 : scale,
    x: reducedMotion ? 0 : x,
    y: reducedMotion ? 0 : y,
    travel,
  });
  const cityTravel = segment(p, 0, .58);
  const streetTravel = segment(p, .39, .79);
  const lobbyTravel = segment(p, .64, .94);
  const officeTravel = segment(p, .80, 1);
  const nearTravel = segment(p, .42, .77);
  const nearSweep = Math.pow(nearTravel, 1.65);
  const nearOpacity = exposure(p, .415, .465, .675, .77);
  const riverTravel = segment(p, .385, .72);
  const riverSweep = Math.pow(riverTravel, 1.45);
  const riverOpacity = exposure(p, .385, .435, .60, .72);
  const portalTravel = smoothstep(.75, .94, p);
  const officeSettle = smoothstep(.92, 1, p);
  return {
    progress: p,
    titleOpacity: 1 - smoothstep(.10, .34, p),
    // Only the final arrival blends into the workspace; the office stays visible first.
    veilOpacity: smoothstep(.985, 1, p),
    city: scene(1 - smoothstep(.435, .58, p), Math.exp(Math.log(3.3) * Math.pow(cityTravel, 1.55)), 0, -1.2 * cityTravel, cityTravel),
    street: scene(exposure(p, .39, .495, .685, .80), .94 * Math.exp(Math.log(2.8 / .94) * Math.pow(streetTravel, 1.22)), 0, 3.0 - 6.0 * streetTravel, streetTravel),
    lobby: scene(exposure(p, .645, .745, .86, .965), .95 * Math.exp(Math.log(2.25 / .95) * lobbyTravel), 0, 2.4 - 3.4 * lobbyTravel, lobbyTravel),
    office: scene(smoothstep(.805, .915, p), 1 + .055 * officeSettle, 0, 0, officeTravel),
    facadeLeft: scene(nearOpacity, .9 + 2.05 * nearSweep, -3 - 133 * nearSweep, -2 + 17 * nearSweep, nearTravel),
    facadeRight: scene(nearOpacity, .88 + 2.3 * nearSweep, 4 + 145 * nearSweep, -1 + 21 * nearSweep, nearTravel),
    riverLeft: scene(riverOpacity, .88 + 1.85 * riverSweep, -2 - 106 * riverSweep, 11 + 24 * riverSweep, riverTravel),
    riverRight: scene(riverOpacity, .88 + 1.85 * riverSweep, 2 + 106 * riverSweep, 11 + 24 * riverSweep, riverTravel),
    portal: {
      progress: portalTravel,
      opacity: exposure(p, .69, .745, .945, 1),
      scale: reducedMotion ? 1 : 1 + .65 * portalTravel,
      leftX: reducedMotion ? 0 : -72 * Math.pow(portalTravel, 1.15),
      rightX: reducedMotion ? 0 : 72 * Math.pow(portalTravel, 1.15),
    },
  };
}
