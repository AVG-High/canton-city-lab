import test from 'node:test';
import assert from 'node:assert/strict';
import { CITY_TRAVEL, advanceCityProgress, beginCityDrag, cityFlightFrame, cityFrame, normalizeCityWheel, smoothCityProgress, updateCityDrag } from '../src/game/cityEntryModel.ts';
const wheel = { deltaY: 100, deltaX: 0, deltaMode: 0, ctrlKey: false, metaKey: false };
const planes = ['city', 'street', 'lobby', 'office', 'facadeLeft', 'facadeRight', 'riverLeft', 'riverRight'] as const;
const numbers = (value: unknown): number[] => typeof value === 'number' ? [value] : Object.values(value as Record<string, unknown>).flatMap(numbers);

test('wheel units normalize; one huge event cannot skip a journey stage', () => {
  assert.equal(normalizeCityWheel(wheel), 100);
  assert.equal(normalizeCityWheel({ ...wheel, deltaY: 3, deltaMode: 1 }), 48);
  assert.equal(normalizeCityWheel({ ...wheel, deltaY: -1, deltaMode: 2 }), -180);
  const step = normalizeCityWheel({ ...wheel, deltaY: 999999 });
  assert.equal(advanceCityProgress(0, step), .06);
  assert.ok(CITY_TRAVEL >= 2800 && CITY_TRAVEL <= 3200);
});
test('browser zoom and non-finite inputs are ignored', () => {
  for (const event of [{ ...wheel, ctrlKey: true }, { ...wheel, metaKey: true }, { ...wheel, deltaY: NaN }, { ...wheel, deltaX: Infinity }]) assert.equal(normalizeCityWheel(event), 0);
  assert.equal(advanceCityProgress(.5, NaN), .5);
  assert.equal(advanceCityProgress(Infinity, 0), 0);
});
test('both trackpad axes advance and reverse without adding diagonal input twice', () => {
  assert.equal(normalizeCityWheel({ ...wheel, deltaX: 110 }), 110);
  assert.equal(normalizeCityWheel({ ...wheel, deltaX: -110 }), -110);
  assert.equal(normalizeCityWheel({ ...wheel, deltaY: 40, deltaX: 12 }), 40);
  assert.equal(normalizeCityWheel({ ...wheel, deltaY: 0, deltaX: 3, deltaMode: 1 }), 48);
  assert.equal(normalizeCityWheel({ ...wheel, deltaX: 110, ctrlKey: true }), 0);
});
test('rightward dragging advances and reversing returns to the same architectural frame', () => {
  const start = beginCityDrag(300, 200);
  const forward = updateCityDrag(start, 700, 210, 1200, 800);
  const progress = advanceCityProgress(.25, forward.delta);
  assert.ok(progress > .25 && progress < .5);
  const reverse = updateCityDrag(forward.state, 300, 200, 1200, 800);
  const restored = advanceCityProgress(progress, reverse.delta);
  assert.ok(Math.abs(restored - .25) < 1e-12);
  const before = numbers(cityFlightFrame(.25)), after = numbers(cityFlightFrame(restored));
  before.forEach((value, index) => assert.ok(Math.abs(value - after[index]) < 1e-10));
});
test('drag threshold prevents clicks from moving the city and locks diagonal gestures to one axis', () => {
  const start = beginCityDrag(300, 200);
  assert.equal(updateCityDrag(start, 304, 202, 1200, 800).delta, 0);
  const horizontal = updateCityDrag(start, 310, 202, 1200, 800);
  assert.equal(horizontal.state.axis, 'horizontal');
  assert.equal(updateCityDrag(horizontal.state, 310, 500, 1200, 800).delta, 0);
  const vertical = updateCityDrag(start, 302, 190, 1200, 800);
  assert.equal(vertical.state.axis, 'vertical');
  assert.ok(vertical.delta > 0);
  assert.equal(updateCityDrag(vertical.state, 500, 190, 1200, 800).delta, 0);
});
test('drag distance is proportional across desktop and mobile and safely rejects invalid measurements', () => {
  const start = beginCityDrag(0, 0);
  const desktop = updateCityDrag(start, 600, 0, 1200, 800);
  const mobile = updateCityDrag(start, 195, 0, 390, 844);
  assert.equal(desktop.delta, mobile.delta);
  assert.equal(advanceCityProgress(0, desktop.delta), .25);
  for (const [x, y, w, h] of [[NaN, 0, 1200, 800], [10, Infinity, 1200, 800], [10, 0, 0, 800], [10, 0, 1200, -1]]) {
    assert.deepEqual(updateCityDrag(start, x, y, w, h), { state: start, delta: 0 });
  }
});
test('progress clamps at both ends and forward/reverse input returns the same scene', () => {
  assert.equal(advanceCityProgress(.5, CITY_TRAVEL / 10), .6);
  assert.equal(advanceCityProgress(.6, -CITY_TRAVEL / 10), .5);
  assert.equal(advanceCityProgress(.9, CITY_TRAVEL), 1);
  assert.equal(advanceCityProgress(.1, -CITY_TRAVEL), 0);
  assert.deepEqual(cityFlightFrame(advanceCityProgress(.6, -CITY_TRAVEL / 10)), cityFlightFrame(.5));
});
test('each arrival is staged, with the exact original panorama at zero and office at completion', () => {
  const start = cityFlightFrame(0);
  assert.deepEqual(start.city, { opacity: 1, scale: 1, x: 0, y: -0, travel: 0 });
  assert.equal(start.titleOpacity, 1);
  for (const name of ['street', 'lobby', 'office', 'facadeLeft', 'facadeRight', 'riverLeft', 'riverRight'] as const) assert.equal(start[name].opacity, 0);
  assert.ok(cityFlightFrame(.54).street.opacity > .99);
  assert.ok(cityFlightFrame(.76).lobby.opacity > .99);
  assert.ok(cityFlightFrame(.92).office.opacity > .99);
  const finish = cityFlightFrame(1);
  assert.deepEqual(finish.office, { opacity: 1, scale: 1.055, x: 0, y: 0, travel: 1 });
  assert.equal(finish.veilOpacity, 1);
  for (const name of ['city', 'street', 'lobby', 'facadeLeft', 'facadeRight', 'riverLeft', 'riverRight'] as const) assert.equal(finish[name].opacity, 0);
});
test('scene transitions retain a visible background and are continuous at all handoffs', () => {
  for (let index = 0; index <= 1000; index++) {
    const frame = cityFlightFrame(index / 1000);
    const combinedOpacity = 1 - [frame.city, frame.street, frame.lobby, frame.office].reduce((remaining, scene) => remaining * (1 - scene.opacity), 1);
    assert.ok(combinedOpacity > .89, `No exposed gap at ${index / 1000}: ${combinedOpacity}`);
    for (const name of planes) {
      assert.ok(frame[name].opacity >= 0 && frame[name].opacity <= 1);
      assert.ok(frame[name].travel >= 0 && frame[name].travel <= 1);
    }
  }
  for (const boundary of [.39, .42, .435, .465, .495, .58, .645, .675, .69, .745, .75, .77, .80, .805, .86, .915, .92, .94, .945, .965, .985]) {
    const before = numbers(cityFlightFrame(boundary - 1e-7)), after = numbers(cityFlightFrame(boundary + 1e-7));
    assert.equal(before.length, after.length);
    before.forEach((value, index) => assert.ok(Math.abs(value - after[index]) < .001, `Discontinuous frame at ${boundary}`));
  }
});
test('approaching scene cameras enlarge monotonically and near façades pass outside both edges', () => {
  for (const [name, from, to] of [['city', 0, .58], ['street', .39, .79], ['lobby', .64, .94]] as const) {
    let lastScale = 0;
    for (let index = 0; index <= 200; index++) {
      const scale = cityFlightFrame(from + (to - from) * index / 200)[name].scale;
      assert.ok(scale >= lastScale);
      lastScale = scale;
    }
  }
  const near = cityFlightFrame(.49), passed = cityFlightFrame(.755);
  assert.ok(passed.facadeLeft.x < -100 && passed.facadeRight.x > 100);
  assert.ok(passed.facadeLeft.scale > near.facadeLeft.scale && passed.facadeRight.scale > near.facadeRight.scale);
  assert.ok(passed.riverLeft.x < -100 && passed.riverRight.x > 100);
  let previous = cityFlightFrame(.42);
  for (let index = 1; index <= 200; index++) {
    const frame = cityFlightFrame(.42 + .35 * index / 200);
    assert.ok(frame.facadeLeft.x <= previous.facadeLeft.x && frame.facadeRight.x >= previous.facadeRight.x);
    previous = frame;
  }
});
test('glass portal splits before office arrival; office settles only in the last eight percent', () => {
  const shut = cityFlightFrame(.75), opening = cityFlightFrame(.85), open = cityFlightFrame(.94);
  assert.equal(shut.portal.progress, 0);
  assert.equal(shut.portal.leftX, -0);
  assert.ok(opening.portal.progress > 0 && opening.portal.progress < 1);
  assert.ok(opening.portal.leftX < -20 && opening.portal.rightX > 20);
  assert.equal(open.portal.progress, 1);
  assert.equal(open.portal.leftX, -72);
  assert.equal(open.portal.rightX, 72);
  assert.equal(cityFlightFrame(.89).office.scale, cityFlightFrame(.92).office.scale);
  let previousScale = cityFlightFrame(.92).office.scale;
  for (let index = 1; index <= 100; index++) {
    const scale = cityFlightFrame(.92 + .08 * index / 100).office.scale;
    assert.ok(scale >= previousScale && scale <= 1.055);
    previousScale = scale;
  }
  assert.equal(cityFlightFrame(.92).office.scale, 1);
  assert.equal(cityFlightFrame(1).office.scale, 1.055);
  // A full-bleed office must never expose its top/bottom edge while the portal opens.
  for (let index = 0; index <= 200; index++) {
    const office = cityFlightFrame(.80 + .20 * index / 200).office;
    assert.equal(office.x, 0);
    assert.equal(office.y, 0);
    assert.ok(office.scale >= 1);
    const visibleTop = office.y - 50 * office.scale;
    const visibleBottom = office.y + 50 * office.scale;
    assert.ok(visibleTop <= -50 && visibleBottom >= 50);
  }
  assert.equal(cityFlightFrame(.98).veilOpacity, 0);
});
test('smoothing has the same speed across frame rates and reverses monotonically', () => {
  const twoFrames = smoothCityProgress(smoothCityProgress(0, 1, 16), 1, 16);
  assert.ok(Math.abs(twoFrames - smoothCityProgress(0, 1, 32)) < 1e-10);
  let progress = .7;
  for (let step = 0; step < 100; step++) {
    const next = smoothCityProgress(progress, .2, 16);
    assert.ok(next <= progress && next >= .2);
    progress = next;
  }
  assert.ok(Math.abs(progress - .2) < .001);
});
test('reduced motion disables every scene, passing plane and glass transform', () => {
  for (const progress of [0, .3, .5, .75, .85, .96, 1]) {
    const frame = cityFlightFrame(progress, true);
    for (const name of planes) assert.deepEqual([frame[name].scale, frame[name].x, frame[name].y], [1, 0, 0]);
    assert.deepEqual([frame.portal.scale, frame.portal.leftX, frame.portal.rightX], [1, 0, 0]);
  }
  for (const progress of [NaN, Infinity, -Infinity, -999, 999]) assert.ok(numbers(cityFlightFrame(progress)).every(Number.isFinite));
  assert.deepEqual(cityFlightFrame(-999), cityFlightFrame(0));
  assert.deepEqual(cityFlightFrame(999), cityFlightFrame(1));
});
test('legacy single-image frame retains its scale and title bounds', () => {
  let lastScale = 1;
  for (let index = 0; index <= 100; index++) {
    const frame = cityFrame(index / 100);
    assert.ok(frame.scale >= lastScale && frame.scale <= 2.601);
    assert.ok(frame.titleOpacity >= 0 && frame.titleOpacity <= 1);
    assert.ok(frame.veilOpacity >= 0 && frame.veilOpacity <= 1);
    lastScale = frame.scale;
  }
  assert.equal(cityFrame(0).scale, 1);
  assert.equal(cityFrame(.9, true).scale, 1);
  assert.equal(cityFrame(Infinity).scale, 1);
});
