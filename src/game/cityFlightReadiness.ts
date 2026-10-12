export type FlightAsset = 'city' | 'street' | 'lobby' | 'office';
export type AssetStatus = 'pending' | 'ready' | 'failed';
export type FlightAssets = Record<FlightAsset, AssetStatus>;
export type FlightImageRequest = { source: string; revision: number; status: AssetStatus };
export type FlightImageTicket = Pick<FlightImageRequest, 'source' | 'revision'>;

/** A decoded desktop image does not make a newly selected mobile source ready. */
export function selectFlightImage(request: FlightImageRequest, source: string): FlightImageRequest {
  return request.source === source ? request : { source, revision: request.revision + 1, status: 'pending' };
}
export function beginFlightDecode(request: FlightImageRequest): FlightImageRequest {
  return { ...request, revision: request.revision + 1, status: 'pending' };
}
/** Reject completion of an obsolete decode, including a switch away and back. */
export function settleFlightImage(request: FlightImageRequest, ticket: FlightImageTicket, displayedSource: string, status: 'ready' | 'failed'): FlightImageRequest {
  if (request.source !== ticket.source || request.revision !== ticket.revision || displayedSource !== ticket.source) return request;
  return request.status === status ? request : { ...request, status };
}

// Hold before an unloaded image can occupy the viewport. Loading is never a scene.
export function flightAssetLimit(assets: FlightAssets) {
  if (assets.city !== 'ready') return 0;
  if (assets.street !== 'ready') return .385;
  if (assets.lobby !== 'ready') return .635;
  if (assets.office !== 'ready') return .795;
  return 1;
}
/** A responsive source replacement pauses in place; an actual failure holds safely. */
export function flightDestination(current: number, target: number, assets: FlightAssets) {
  const limit = flightAssetLimit(assets);
  return Math.min(target, Object.values(assets).includes('failed') ? limit : Math.max(current, limit));
}
export function officeEntryDelay(input: { progress: number; target: number; officeReady: boolean; touchActive: boolean; visible: boolean; officeVisibleSince: number | null; lastInputAt: number; now: number }): number | null {
  if (!input.visible || input.touchActive || !input.officeReady || input.target !== 1 || input.progress < .996 || input.officeVisibleSince === null || !Number.isFinite(input.officeVisibleSince) || !Number.isFinite(input.now) || !Number.isFinite(input.lastInputAt)) return null;
  return Math.max(16, 280 - (input.now - input.lastInputAt), 650 - (input.now - input.officeVisibleSince));
}
