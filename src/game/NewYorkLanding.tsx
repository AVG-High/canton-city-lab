import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeftRight, ArrowUpRight, BookOpen, LayoutDashboard, Library, Mouse, Users } from 'lucide-react';
import { CITY_TRAVEL, advanceCityProgress, beginCityDrag, cityFlightFrame, normalizeCityWheel, smoothCityProgress, updateCityDrag, type CityDragState, type CitySceneFrame } from './cityEntryModel';
import { beginFlightDecode, flightAssetLimit, flightDestination, officeEntryDelay, selectFlightImage, settleFlightImage, type FlightAsset, type FlightAssets, type FlightImageRequest } from './cityFlightReadiness';
import './new-york-landing.css';

type DeskRole = 'seller' | 'buyer' | 'auditor' | 'outsider';
type Destination = 'map' | 'mission' | 'live' | 'archive';
type Props = { onStart: (role: DeskRole) => void; onTrain: () => void; onExplore: () => void; onNavigate: (target: Destination) => void; completed: number };
const destinations = [
  { id: 'map', name: '실습 대시보드', icon: LayoutDashboard },
  { id: 'mission', name: '기초 학습', icon: BookOpen },
  { id: 'live', name: '역할별 설계', icon: Users },
  { id: 'archive', name: '자료실', icon: Library },
] as const;
const initialAssets: FlightAssets = { city: 'pending', street: 'pending', lobby: 'pending', office: 'pending' };
const assetIds = ['city', 'street', 'lobby', 'office'] as const;
function selectedImageSource(image: HTMLImageElement) {
  const source = image.parentElement?.querySelector('source');
  // These pictures deliberately use one URL per source, without density descriptors.
  const selected = source && window.matchMedia(source.media).matches ? source.srcset : image.src;
  return new URL(selected, document.baseURI).href;
}
const scenes = [
  { id: 'street', name: 'nyc-waterfront-street', fullAt: .525, alt: '맨해튼 강변의 석재와 유리 건물 앞 거리' },
  { id: 'lobby', name: 'nyc-building-lobby', fullAt: .467, alt: '같은 건물의 구리빛 유리문 너머 로비' },
  { id: 'office', name: 'nyc-office-arrival', fullAt: .65, alt: '빛이 드는 시티랩 사무실과 양옆의 책상' },
] as const;
const plane = (scene: CitySceneFrame): CSSProperties => ({
  transform: `translate3d(${scene.x}vw, ${scene.y}vh, 0) scale(calc(1 + (${scene.scale} - 1) * var(--flight-zoom, 1)))`,
  willChange: scene.opacity > .001 && scene.travel > 0 && scene.travel < 1 ? 'transform' : 'auto',
});
function reveal(scene: CitySceneFrame, fullAt: number): CSSProperties {
  const t = Math.min(1, scene.travel / fullAt);
  const open = t * t * (3 - 2 * t);
  // Feather the destination into the light and depth of the previous space.
  // A hard rectangular crop would read as a floating photograph.
  return { opacity: scene.opacity, maskImage: t >= 1 ? 'none' : `radial-gradient(ellipse ${12 + 150 * open}% ${16 + 150 * open}% at 53% 54%, #000 50%, rgba(0,0,0,.9) 66%, transparent 100%)` };
}

/** A reversible architectural camera. It never creates an observation or authority. */
export default function NewYorkLanding({ onExplore, onNavigate }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const enter = useRef(onExplore);
  enter.current = onExplore;
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [loadJourney, setLoadJourney] = useState(false);
  const [assets, setAssets] = useState<FlightAssets>(initialAssets);
  const ready = useRef<FlightAssets>({ ...initialAssets });
  const images = useRef<Partial<Record<FlightAsset, HTMLImageElement | null>>>({});
  const requests = useRef<Record<FlightAsset, FlightImageRequest>>(Object.fromEntries(assetIds.map(id => [id, { source: '', revision: 0, status: 'pending' }])) as Record<FlightAsset, FlightImageRequest>);
  const wake = useRef<() => void>(() => {});
  const mounted = useRef(true);

  function publishReadiness() {
    ready.current = Object.fromEntries(assetIds.map(id => [id, requests.current[id].status])) as FlightAssets;
    setAssets(ready.current);
  }
  function syncSelectedSources() {
    if (!mounted.current) return false;
    let changed = false;
    for (const id of assetIds) {
      const image = images.current[id];
      if (!image) continue;
      const next = selectFlightImage(requests.current[id], selectedImageSource(image));
      if (next !== requests.current[id]) { requests.current[id] = next; changed = true; }
    }
    if (changed) publishReadiness();
    return changed;
  }
  function completeImage(id: FlightAsset, ticket: FlightImageRequest, image: HTMLImageElement, status: 'ready' | 'failed') {
    if (!mounted.current) return;
    if (syncSelectedSources()) wake.current();
    const next = settleFlightImage(requests.current[id], ticket, image.currentSrc || selectedImageSource(image), status);
    if (next === requests.current[id]) return;
    requests.current[id] = next;
    publishReadiness();
    if (id === 'city') setLoadJourney(true);
    wake.current();
  }
  async function imageLoaded(id: FlightAsset, image: HTMLImageElement) {
    if (!mounted.current) return;
    if (syncSelectedSources()) wake.current();
    if (image.currentSrc !== requests.current[id].source) return;
    const ticket = beginFlightDecode(requests.current[id]);
    requests.current[id] = ticket;
    publishReadiness();
    wake.current();
    try {
      await image.decode();
      completeImage(id, ticket, image, image.naturalWidth > 0 ? 'ready' : 'failed');
    } catch { completeImage(id, ticket, image, 'failed'); }
  }
  function imageError(id: FlightAsset, image: HTMLImageElement) {
    if (!mounted.current) return;
    if (syncSelectedSources()) wake.current();
    completeImage(id, requests.current[id], image, 'failed');
  }

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    mounted.current = true;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pictureMedia = window.matchMedia('(max-width: 700px)');
    setReducedMotion(media.matches);
    let target = 0, current = 0, lastFrame = 0, lastInputAt = performance.now();
    let animation = 0;
    let entryTimer: ReturnType<typeof setTimeout> | undefined;
    let exited = false;
    let focused = true;
    let officeVisibleSince: number | null = null;
    let drag: { id: number; origin: number; sample: CityDragState } | null = null;
    function finish() { if (!exited) { exited = true; enter.current(); } }
    function cancelEntry() {
      if (entryTimer) { clearTimeout(entryTimer); entryTimer = undefined; }
      officeVisibleSince = null;
      setExiting(false);
    }
    function refreshAvailability() { if (syncSelectedSources()) cancelEntry(); }
    function entryDelay() {
      refreshAvailability();
      return officeEntryDelay({ progress: current, target, officeReady: flightAssetLimit(ready.current) === 1, touchActive: !!drag, visible: !document.hidden && focused, officeVisibleSince, lastInputAt, now: performance.now() });
    }
    function scheduleEntry() {
      if (entryTimer || exited) return;
      const delay = entryDelay();
      if (delay === null) return;
      entryTimer = setTimeout(() => {
        entryTimer = undefined;
        const remaining = entryDelay();
        if (remaining === null) return;
        if (remaining <= 16) {
          setExiting(true);
          entryTimer = setTimeout(() => {
            entryTimer = undefined;
            const allowed = entryDelay();
            if (allowed !== null && allowed <= 16) finish();
            else { setExiting(false); scheduleEntry(); }
          }, 220);
        } else scheduleEntry();
      }, delay);
    }
    function frame(time: number) {
      animation = 0;
      const elapsed = lastFrame ? time - lastFrame : 16;
      lastFrame = time;
      refreshAvailability();
      const limit = flightAssetLimit(ready.current);
      if (Object.values(ready.current).includes('failed') && current > limit) {
        current = limit;
        target = Math.min(target, limit + .04);
      }
      const destination = flightDestination(current, target, ready.current);
      current = smoothCityProgress(current, destination, elapsed);
      setProgress(current);
      if (!document.hidden && current >= .945 && limit === 1) officeVisibleSince ??= time;
      else officeVisibleSince = null;
      scheduleEntry();
      if (Math.abs(destination - current) > .00015 && !exited) animation = requestAnimationFrame(frame);
    }
    function kick() { if (!animation && !exited) { lastFrame = 0; animation = requestAnimationFrame(frame); } }
    wake.current = () => { cancelEntry(); kick(); };
    function move(delta: number) {
      if (exited || !Number.isFinite(delta) || !delta || media.matches) return;
      lastInputAt = performance.now();
      setExiting(false);
      refreshAvailability();
      // Keep at most a small pending movement while a scene decodes.
      target = Math.min(advanceCityProgress(target, delta), Math.max(current, flightAssetLimit(ready.current)) + .04, 1);
      if (entryTimer) { clearTimeout(entryTimer); entryTimer = undefined; }
      kick();
    }
    const isControl = (event: Event) => event.target instanceof Element && !!event.target.closest('button, a, input, select, textarea, [data-city-navigation]');
    function wheel(event: WheelEvent) {
      const delta = normalizeCityWheel(event);
      if (!delta || drag || isControl(event) || media.matches) return;
      event.preventDefault();
      move(delta);
    }
    function key(event: KeyboardEvent) {
      if (isControl(event) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Enter') { event.preventDefault(); finish(); }
      else if (event.key === 'PageDown' || event.key === 'ArrowDown' || event.key === ' ') { event.preventDefault(); move(event.key === 'ArrowDown' ? 160 : 360); }
      else if (event.key === 'PageUp' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowUp' ? -160 : -360); }
      else if (event.key === 'Home') { event.preventDefault(); move(-CITY_TRAVEL); }
    }
    function endDrag(cancelled = false) {
      if (!drag) return;
      const previous = drag;
      drag = null;
      setDragging(false);
      if (element!.hasPointerCapture(previous.id)) element!.releasePointerCapture(previous.id);
      if (cancelled) move((previous.origin - target) * CITY_TRAVEL);
      lastInputAt = performance.now();
      kick();
      scheduleEntry();
    }
    function pointerDown(event: PointerEvent) {
      // A second finger belongs to native pinch zoom, not camera movement.
      if (!event.isPrimary) { endDrag(true); return; }
      if (event.button !== 0 || isControl(event) || media.matches || exited || event.ctrlKey || event.metaKey || event.altKey) return;
      if (drag) return;
      drag = { id: event.pointerId, origin: target, sample: beginCityDrag(event.clientX, event.clientY) };
      cancelEntry();
      element!.setPointerCapture(event.pointerId);
    }
    function pointerMove(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.id) return;
      const next = updateCityDrag(drag.sample, event.clientX, event.clientY, element!.clientWidth, element!.clientHeight);
      if (next.state.axis) {
        event.preventDefault();
        if (!drag.sample.axis) setDragging(true);
      }
      drag.sample = next.state;
      move(next.delta);
    }
    function pointerUp(event: PointerEvent) { if (event.pointerId === drag?.id) endDrag(); }
    function pointerCancel(event: PointerEvent) { if (event.pointerId === drag?.id) endDrag(true); }
    function lostCapture(event: PointerEvent) { if (event.pointerId === drag?.id) endDrag(); }
    function blur() { focused = false; endDrag(); cancelEntry(); }
    function focus() { focused = true; kick(); }
    function updatePreference() {
      setReducedMotion(media.matches);
      if (media.matches) endDrag();
      if (media.matches) { target = current = 0; officeVisibleSince = null; setProgress(0); setExiting(false); if (entryTimer) { clearTimeout(entryTimer); entryTimer = undefined; } }
      kick();
    }
    function visibility() { if (document.hidden) { endDrag(); cancelEntry(); } else kick(); }
    function pictureChanged() { if (syncSelectedSources()) { cancelEntry(); kick(); } }
    media.addEventListener('change', updatePreference);
    pictureMedia.addEventListener('change', pictureChanged);
    window.addEventListener('resize', pictureChanged);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('pointermove', pointerMove, { passive: false });
    element.addEventListener('pointerup', pointerUp);
    element.addEventListener('pointercancel', pointerCancel);
    element.addEventListener('lostpointercapture', lostCapture);
    window.addEventListener('blur', blur);
    window.addEventListener('focus', focus);
    window.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      mounted.current = false; exited = true; wake.current = () => {};
      cancelAnimationFrame(animation);
      if (entryTimer) clearTimeout(entryTimer);
      media.removeEventListener('change', updatePreference);
      pictureMedia.removeEventListener('change', pictureChanged);
      window.removeEventListener('resize', pictureChanged);
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerUp);
      element.removeEventListener('pointercancel', pointerCancel);
      element.removeEventListener('lostpointercapture', lostCapture);
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
      window.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  const view = cityFlightFrame(progress, reducedMotion);
  const blocked = flightAssetLimit(assets) < 1 && progress >= flightAssetLimit(assets) - .003;
  const failed = Object.values(assets).includes('failed');
  const chapter = progress < .39 ? 'MANHATTAN' : progress < .64 ? 'WATERFRONT' : progress < .80 ? 'THE THRESHOLD' : 'CITY LAB';
  const blockedCue = blocked && (failed || progress > .01);
  const cue = reducedMotion ? '도시로 입장해 시작하세요' : blockedCue ? failed ? '장면을 불러오지 못했습니다 · 바로 입장할 수 있습니다' : '다음 공간을 준비하고 있습니다' : progress < .39 ? '오른쪽으로 드래그하면, 도시가 가까워집니다' : progress < .64 ? '강변을 지나, 건물 앞으로' : progress < .80 ? '유리문 너머로, 계속 앞으로' : '시티랩 사무실로 들어갑니다';
  const style = { '--city-title-opacity': view.titleOpacity, '--city-veil': exiting ? 1 : 0 } as CSSProperties;
  return <div ref={root} className={'city-entry city-flight' + (dragging ? ' city-entry-dragging' : '')} id="ny-content" tabIndex={-1} style={style} data-progress={progress.toFixed(3)} data-chapter={chapter}>
    <div className="flight-stage" aria-hidden="true">
      <picture className="city-entry-image" style={plane(view.city)}>
        {!imageFailed && <source media="(max-width: 700px)" srcSet="/game/new-york/nyc-city-immersive-mobile.jpg?v=6"/>}
        <img ref={image => { images.current.city = image; }} src={imageFailed ? '/game/new-york/nyc-hero.jpg?v=6' : '/game/new-york/nyc-city-immersive.jpg?v=6'} alt="" fetchPriority="high" decoding="async" draggable={false} onLoad={event => void imageLoaded('city', event.currentTarget)} onError={event => { imageError('city', event.currentTarget); if (!imageFailed) setImageFailed(true); }}/>
      </picture>
      {loadJourney && scenes.map(scene => <div key={scene.id} className={'flight-scene flight-' + scene.id} style={reveal(view[scene.id], scene.fullAt)} data-ready={assets[scene.id]}>
        <picture style={plane(view[scene.id])}>
          <source media="(max-width: 700px)" srcSet={'/game/new-york/' + scene.name + '-mobile.jpg?v=6'}/>
          <img ref={image => { images.current[scene.id] = image; }} src={'/game/new-york/' + scene.name + '.jpg?v=6'} alt="" decoding="async" draggable={false} onLoad={event => void imageLoaded(scene.id, event.currentTarget)} onError={event => imageError(scene.id, event.currentTarget)}/>
        </picture>
      </div>)}
      <div className="flight-passage" aria-hidden="true">
        {(['facadeLeft','facadeRight','riverLeft','riverRight'] as const).map(key => <div key={key} className={'flight-near flight-' + key} style={{ ...plane(view[key]), opacity: view[key].opacity }}><div className="flight-texture"/></div>)}
      </div>
      <div className="flight-doorway" style={{opacity:view.portal.opacity}}>
        <div className="flight-door-leaf flight-door-left" style={{transform:`translate3d(${view.portal.leftX}vw,0,0) scale(${view.portal.scale})`}}/>
        <div className="flight-door-leaf flight-door-right" style={{transform:`translate3d(${view.portal.rightX}vw,0,0) scale(${view.portal.scale})`}}/>
      </div>
      <div className="flight-atmosphere"/>
    </div>
    <div className="city-entry-shade" aria-hidden="true"/>
    <header className="city-entry-title"><span>NEW YORK EDITION</span><h1>CANTON <em>CITY LAB</em></h1></header>
    <nav className="city-entry-nav" aria-label="첫 화면 메뉴" data-city-navigation>
      {destinations.map(({id,name,icon:Icon},index) => <button key={id} onClick={() => onNavigate(id)}><span className="city-nav-number">0{index+1}</span><Icon size={16} strokeWidth={1.6}/><span>{name}</span><ArrowUpRight size={14}/></button>)}
    </nav>
    <div className="city-entry-cue">
      <span className="flight-chapter">{chapter}</span>
      <span className="city-scroll-instruction"><Mouse size={17} strokeWidth={1.5}/><span>{cue}</span><ArrowLeftRight size={16}/></span>
      {!reducedMotion && <span className="city-entry-input-hint">왼쪽으로 되돌리기 · 두 손가락 스크롤로도 이동</span>}
      <button onClick={onExplore} className="city-entry-bypass">바로 입장<ArrowUpRight size={15}/></button>
      <span className="city-touch-instruction">{reducedMotion ? '바로 입장 또는 메뉴를 선택하세요' : blockedCue ? cue : '오른쪽 또는 위로 밀어 입장 · 반대로 되돌리기'}</span>
    </div>
    <div className="city-entry-progress" aria-hidden="true"><i style={{transform:`scaleX(${progress})`}}/></div>
    <div className="city-entry-veil" aria-hidden="true"/>
    <p className="city-visually-hidden">맨해튼 전경에서 강변 거리, 유리문과 로비를 지나 사무실로 들어가는 연구·교육용 연출입니다. {reducedMotion ? '움직임 감소 설정으로 카메라 이동을 생략합니다. ' : '화면을 누른 채 오른쪽으로 드래그하거나 위로 밀면 전진하고, 반대로 움직이면 되돌아갑니다. 마우스 휠, 트랙패드 두 손가락 스크롤, Page Down과 Page Up으로도 이동합니다. 두 손가락을 벌리거나 모으는 동작은 브라우저 화면 확대를 유지합니다. '}Enter와 바로 입장 버튼, 왼쪽 메뉴로 연출을 건너뛸 수 있습니다.</p>
  </div>;
}
