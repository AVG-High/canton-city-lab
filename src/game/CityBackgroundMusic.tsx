import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, LoaderCircle, Pause, Play, Volume2 } from 'lucide-react';
import './city-background-music.css';

const trackSource = '/game/audio/new-york-skyline-203813.mp3';
const defaultVolume = 0.18;
const deviceVolumeNote = '이 브라우저에서는 기기 음량으로 재생됩니다. 기기의 음량 버튼으로 조절하세요.';
type Playback = 'off' | 'loading' | 'playing' | 'paused' | 'error';

/** One player for the academy. Playback always starts with a deliberate click. */
export default function CityBackgroundMusic({ inert = false }: { inert?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const disclosureRef = useRef<HTMLButtonElement>(null);
  const wantedRef = useRef(false);
  const requestRef = useRef(0);
  const mountedRef = useRef(false);
  const [playback, setPlayback] = useState<Playback>('off');
  const [volume, setVolume] = useState(defaultVolume);
  const [volumeSupported, setVolumeSupported] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const controlsId = useId();
  const volumeId = useId();
  const messageId = useId();

  function applyVolume(next: number) {
    const audio = audioRef.current;
    if (!audio) return;
    let supported = true;
    try { audio.volume = next; } catch { supported = false; }
    // iOS may ignore the setter and keep returning 1. Never display a false 18%.
    setVolumeSupported(supported && Math.abs(audio.volume - next) < 0.001);
    setVolume(audio.volume);
  }

  function pausePlayback() {
    wantedRef.current = false;
    requestRef.current += 1;
    audioRef.current?.pause();
    setPlayback('paused');
    setError('');
  }

  function failPlayback(message: string) {
    if (!mountedRef.current) return;
    wantedRef.current = false;
    requestRef.current += 1;
    audioRef.current?.pause();
    setPlayback('error');
    setError(message);
  }

  function startPlayback() {
    const audio = audioRef.current;
    if (!audio || document.hidden) return;
    const request = ++requestRef.current;
    wantedRef.current = true;
    setError('');
    setPlayback('loading');
    // Even preload="none" can be speculative in browsers. Defer the URL itself.
    if (!audio.getAttribute('src')) audio.src = trackSource;
    else if (audio.error) audio.load();
    try {
      const pending = audio.play();
      Promise.resolve(pending).then(() => {
        if (!mountedRef.current || !wantedRef.current || document.hidden) {
          audio.pause();
          return;
        }
        if (request === requestRef.current && !audio.paused) setPlayback('playing');
      }).catch((cause: unknown) => {
        if (!mountedRef.current || request !== requestRef.current || !wantedRef.current) return;
        const blocked = cause instanceof DOMException && cause.name === 'NotAllowedError';
        failPlayback(blocked
          ? '브라우저가 재생을 막았습니다. 음악 버튼을 눌러 다시 시도하세요.'
          : '음악을 불러오지 못했습니다. 음악 버튼을 눌러 다시 시도하세요.');
      });
    } catch {
      failPlayback('음악을 재생하지 못했습니다. 음악 버튼을 눌러 다시 시도하세요.');
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    mountedRef.current = true;
    applyVolume(defaultVolume);
    const play = () => {
      if (!wantedRef.current || document.hidden) audio.pause();
      else setPlayback('loading');
    };
    const playing = () => {
      if (!wantedRef.current || document.hidden) audio.pause();
      else setPlayback('playing');
    };
    const waiting = () => {
      if (wantedRef.current && !audio.paused) setPlayback('loading');
    };
    const pause = () => {
      // Ignore a queued pause from an earlier click once a newer play has begun.
      if (!wantedRef.current || !audio.paused) return;
      wantedRef.current = false;
      requestRef.current += 1;
      setPlayback('paused');
    };
    const ended = () => {
      wantedRef.current = false;
      requestRef.current += 1;
      setPlayback('paused');
    };
    const failed = () => {
      if (wantedRef.current) failPlayback('음악을 불러오지 못했습니다. 음악 버튼을 눌러 다시 시도하세요.');
    };
    const volumeChanged = () => setVolume(audio.volume);
    const visibility = () => {
      if (document.hidden && (wantedRef.current || !audio.paused)) pausePlayback();
    };
    audio.addEventListener('play', play);
    audio.addEventListener('playing', playing);
    audio.addEventListener('waiting', waiting);
    audio.addEventListener('stalled', waiting);
    audio.addEventListener('pause', pause);
    audio.addEventListener('ended', ended);
    audio.addEventListener('error', failed);
    audio.addEventListener('volumechange', volumeChanged);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      mountedRef.current = false;
      wantedRef.current = false;
      requestRef.current += 1;
      audio.removeEventListener('play', play);
      audio.removeEventListener('playing', playing);
      audio.removeEventListener('waiting', waiting);
      audio.removeEventListener('stalled', waiting);
      audio.removeEventListener('pause', pause);
      audio.removeEventListener('ended', ended);
      audio.removeEventListener('error', failed);
      audio.removeEventListener('volumechange', volumeChanged);
      document.removeEventListener('visibilitychange', visibility);
      audio.pause();
      if (audio.hasAttribute('src')) { audio.removeAttribute('src'); audio.load(); }
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setExpanded(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [expanded]);

  const active = playback === 'playing' || playback === 'loading';
  const action = playback === 'playing' ? '일시정지' : playback === 'loading' ? '준비 취소' : playback === 'error' ? '다시 시도' : playback === 'paused' ? '다시 재생' : '켜기';
  const stateText = playback === 'playing' ? '음악 재생 중' : playback === 'loading' ? '음악 준비 중' : playback === 'paused' ? '음악 일시정지됨. 직접 눌러 다시 재생하세요.' : playback === 'error' ? error : '음악 꺼짐';
  const message = error || (!volumeSupported ? deviceVolumeNote : '');

  return <div ref={rootRef} className="city-bgm" data-playback={playback} data-volume-control={volumeSupported ? 'browser' : 'device'} inert={inert || undefined} aria-label="배경 음악" onKeyDown={event => {
    if (event.key === 'Escape' && expanded) { event.stopPropagation(); setExpanded(false); disclosureRef.current?.focus(); }
  }}>
    <audio ref={audioRef} preload="none" loop hidden aria-hidden="true"/>
    <span className="city-bgm-sr-only" role="status" aria-live="polite">{stateText}</span>
    <div className="city-bgm-pill">
      <button className="city-bgm-toggle" type="button" aria-label={'배경 음악 ' + action} aria-pressed={active} aria-busy={playback === 'loading'} aria-describedby={message ? messageId : undefined} title={'배경 음악 ' + action} onClick={() => active ? pausePlayback() : startPlayback()}>
        {playback === 'loading' ? <LoaderCircle className="city-bgm-loading" size={15} aria-hidden="true"/> : playback === 'playing' ? <Pause size={15} aria-hidden="true"/> : <Play size={15} aria-hidden="true"/>}
        <span>음악<span className="city-bgm-action"> {playback === 'loading' ? '준비 중' : playback === 'playing' ? '쉬기' : playback === 'paused' ? '재개' : playback === 'error' ? '재시도' : '켜기'}</span></span>
      </button>
      <button ref={disclosureRef} className="city-bgm-disclosure" type="button" aria-label="음량과 음악 정보" title="음량과 음악 정보" aria-expanded={expanded} aria-controls={controlsId} onClick={() => setExpanded(value => !value)}><ChevronDown size={15} aria-hidden="true"/></button>
    </div>
    {message && !expanded && <p id={messageId} className="city-bgm-message">{message}</p>}
    {expanded && <div className="city-bgm-panel" id={controlsId}>
      <span className="city-bgm-caption">CITY SOUNDTRACK</span>
      <a className="city-bgm-credit" href="https://pixabay.com/music/smooth-jazz-new-york-skyline-203813/" target="_blank" rel="noreferrer">New York Skyline</a>
      <a className="city-bgm-artist" href="https://pixabay.com/users/geoffharvey-9096471/" target="_blank" rel="noreferrer">Geoff Harvey · Pixabay</a>
      {volumeSupported ? <>
        <label className="city-bgm-volume" htmlFor={volumeId}><span><Volume2 size={14} aria-hidden="true"/>음량</span><output htmlFor={volumeId}>{Math.round(volume * 100)}%</output></label>
        <input id={volumeId} type="range" min="0" max="1" step="0.01" value={volume} aria-valuetext={Math.round(volume * 100) + '%'} onChange={event => applyVolume(Number(event.target.value))}/>
      </> : <p id={!error ? messageId : undefined} className="city-bgm-device-volume"><Volume2 size={14} aria-hidden="true"/><span>{deviceVolumeNote}</span></p>}
      <p className="city-bgm-note">탭을 떠나면 잠시 멈춥니다.<br/>돌아온 뒤 직접 눌러 이어 들으세요.</p>
      <a className="city-bgm-license" href="https://pixabay.com/service/license-summary/" target="_blank" rel="noreferrer">Pixabay Content License</a>
      {error && <p id={messageId} className="city-bgm-panel-error">{error}</p>}
    </div>}
  </div>;
}
