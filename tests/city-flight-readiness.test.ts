import test from 'node:test';
import assert from 'node:assert/strict';
import { beginFlightDecode, flightAssetLimit, flightDestination, officeEntryDelay, selectFlightImage, settleFlightImage, type FlightAssets } from '../src/game/cityFlightReadiness.ts';

test('each unloaded or failed scene holds the camera before that scene, in travel order', () => {
  const assets: FlightAssets = { city: 'pending', street: 'pending', lobby: 'pending', office: 'pending' };
  assert.equal(flightAssetLimit(assets), 0);
  assets.city = 'ready'; assert.equal(flightAssetLimit(assets), .385);
  assets.street = 'ready'; assert.equal(flightAssetLimit(assets), .635);
  assets.lobby = 'ready'; assert.equal(flightAssetLimit(assets), .795);
  assets.office = 'ready'; assert.equal(flightAssetLimit(assets), 1);
  assets.street = 'failed'; assert.equal(flightAssetLimit(assets), .385);
});
const arrival = { progress: .999, target: 1, officeReady: true, touchActive: false, visible: true, officeVisibleSince: 1000, lastInputAt: 1250, now: 1400 };
test('office arrival requires a decoded image, visible office, completed travel and released touch', () => {
  for (const input of [{ ...arrival, officeReady: false }, { ...arrival, target: .98 }, { ...arrival, progress: .90 }, { ...arrival, touchActive: true }, { ...arrival, visible: false }, { ...arrival, officeVisibleSince: null }, { ...arrival, now: NaN }]) assert.equal(officeEntryDelay(input), null);
});
test('an office stays visible long enough and continuing input postpones the exit', () => {
  assert.equal(officeEntryDelay(arrival), 250);
  assert.equal(officeEntryDelay({ ...arrival, now: 1700 }), 16);
  assert.equal(officeEntryDelay({ ...arrival, lastInputAt: 1690, now: 1700 }), 270);
  assert.equal(officeEntryDelay({ ...arrival, target: .9 }), null);
});

test('changing selected picture source invalidates readiness and rejects obsolete decode completion', () => {
  const desktop = { source: '/desktop.jpg', revision: 1, status: 'ready' as const };
  const mobile = selectFlightImage(desktop, '/mobile.jpg');
  assert.equal(mobile.status, 'pending');
  assert.equal(mobile.revision, 2);
  assert.equal(settleFlightImage(mobile, desktop, '/desktop.jpg', 'ready'), mobile);
  assert.equal(settleFlightImage(mobile, mobile, '/desktop.jpg', 'ready'), mobile);
  const backToDesktop = selectFlightImage(mobile, '/desktop.jpg');
  assert.equal(settleFlightImage(backToDesktop, desktop, '/desktop.jpg', 'ready'), backToDesktop);
  assert.equal(selectFlightImage(backToDesktop, '/desktop.jpg'), backToDesktop);
  const firstDecode = beginFlightDecode(backToDesktop);
  const retryDecode = beginFlightDecode(firstDecode);
  assert.equal(settleFlightImage(retryDecode, firstDecode, '/desktop.jpg', 'failed'), retryDecode);
  assert.equal(settleFlightImage(retryDecode, firstDecode, '/desktop.jpg', 'ready'), retryDecode);
});

test('the currently selected source may fail after ready and recover on a later load', () => {
  const request = { source: '/office-mobile.jpg', revision: 4, status: 'pending' as const };
  const decoded = settleFlightImage(request, request, request.source, 'ready');
  assert.equal(decoded.status, 'ready');
  const failed = settleFlightImage(decoded, decoded, decoded.source, 'failed');
  assert.equal(failed.status, 'failed');
  assert.equal(settleFlightImage(failed, failed, failed.source, 'ready').status, 'ready');
});

test('responsive decoding pauses forward travel in place without preventing reverse movement', () => {
  const assets: FlightAssets = { city: 'ready', street: 'ready', lobby: 'ready', office: 'pending' };
  assert.equal(flightDestination(.94, 1, assets), .94);
  assert.equal(flightDestination(.94, .88, assets), .88);
  assert.equal(flightDestination(.70, .9, assets), .795);
  assets.office = 'ready';
  assert.equal(flightDestination(.94, 1, assets), 1);
  assets.office = 'failed';
  assert.equal(flightDestination(.94, 1, assets), .795);
});
