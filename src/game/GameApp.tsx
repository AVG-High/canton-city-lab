import { useEffect, useRef, useState } from 'react';
import './game.css';
import { ArrowLeftRight, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp, ExternalLink, Flag, Landmark, LockKeyhole, Menu, Network, ReceiptText, RotateCcw, ScanEye, ShieldCheck, Terminal, Trophy, UserRound, Users, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { missions, normalizeProgress, completeMission, getXp, isUnlocked, type MissionId } from './curriculum';
type Role = 'seller' | 'buyer' | 'auditor' | 'outsider';
import WebLabIntro from './WebLabIntro';
import MissionWorkbench from './MissionWorkbench';
import NewYorkLanding from './NewYorkLanding';
import CityBackgroundMusic from './CityBackgroundMusic';
import './new-york-academy.css';
import './city-workspace.css';
import './city-interior.css';
import { references, cantonSource, trustSource } from '../references';

type Page = 'identity' | 'map' | 'mission' | 'live' | 'archive';
type DeskRole = 'seller' | 'buyer' | 'auditor' | 'outsider';
// This existing key preserves V1 learning progress; it never stores ledger evidence.
const storageKey = 'canton-city-lab-online-v2';
const pageLabels: Record<Page, string> = { identity: '도시 입구', map: '실습 대시보드', mission: '기초 학습', live: '역할별 설계', archive: '자료실' };
const navItems = [{ id: 'identity', icon: Landmark }, { id: 'map', icon: Flag }, { id: 'mission', icon: BookOpen }, { id: 'live', icon: ArrowLeftRight }, { id: 'archive', icon: ReceiptText }] as const;
const lessonNames = ['정보의 배포', '동시 결제', '조회 근거', '감사 권한', '공개 원장', '운영 신뢰'];
const lessonIcons = [Users, ArrowLeftRight, ReceiptText, ShieldCheck, ScanEye, Network];
const desks: { role: DeskRole; code: string; name: string; label: string }[] = [
  { role: 'seller', code: 'A', name: '매도자', label: '운용사 A' },
  { role: 'buyer', code: 'B', name: '매수자', label: '은행 B' },
  { role: 'auditor', code: 'C', name: '감사자', label: '감사자 C' },
  { role: 'outsider', code: 'D', name: '외부 관찰자', label: '무관한 기관 D' },
];
function initialProgress() { try { return normalizeProgress(JSON.parse(localStorage.getItem(storageKey) || 'null')); } catch { return normalizeProgress(null); } }
function initialPage(): Page { const name = location.hash.split('/')[2]; return ['identity', 'map', 'mission', 'live', 'archive'].includes(name) ? name as Page : 'identity'; }
function learnerName(name: string) { return /^GHOST-\d+$/i.test(name) ? '학습자' : name; }

// Historical components may still import this; V2 does not render the artwork.
export function PixelRunner({ variant = 0, className = '' }: { variant?: number; className?: string }) {
  const palettes = [['#bded61', '#2c473b'], ['#78dcd1', '#263c4d'], ['#c6a0ec', '#3d2c49'], ['#ffbe72', '#4c382b']];
  const [light, dark] = palettes[variant] ?? palettes[0];
  return <svg className={'gr-pixel-runner ' + className} viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges"><rect width="32" height="32" fill="#151c1a"/><path d="M9 5h14v2h3v5h2v14H4V12h2V7h3z" fill={dark}/><path d="M11 7h11v2h2v3H8V9h3z" fill="#496455"/><path d="M9 12h15v12H8V14h1z" fill="#0a1010"/><path d="M8 13h16v5H8z" fill={light}/><path d="M11 14h4v2h-4zm8 0h3v2h-3z" fill="#20382c"/><path d="M11 22h11v2H11z" fill="#739185"/><path d="M7 25h5v7H2v-4h5zm13 0h5v3h5v4H20z" fill={dark}/><path d="M12 27h8v5h-8z" fill="#101713"/><path d="M5 7h2v2H5zm20-3h2v2h-2zM3 17h2v4H3z" fill={light}/></svg>;
}

export default function GameApp({ onOpenLab }: { onOpenLab: () => void }) {
  const [progress, setProgress] = useState(initialProgress);
  const [page, setPage] = useState<Page>(initialPage);
  const [selectedDesk, setSelectedDesk] = useState<DeskRole>('seller');
  const [entryRole, setEntryRole] = useState<Role | null>(null);
  const [activeId, setActiveId] = useState<MissionId>(() => missions[Math.min(initialProgress().completed.length, missions.length - 1)].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; awarded: number } | null>(null);
  const [hint, setHint] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [dialog, setDialogState] = useState<'briefing' | 'profile' | 'reset' | null>(null);
  const dialogOriginRef = useRef<HTMLElement | null>(null);
  function setDialog(next: 'briefing' | 'profile' | 'reset' | null) { if (next && !dialog) dialogOriginRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setDialogState(next); }
  const dialogRef = useRef<HTMLElement>(null);
  const [sound, setSound] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [archiveTab, setArchiveTab] = useState<'concepts' | 'networks'>('concepts');
  const [search, setSearch] = useState('');
  const previousViewRef = useRef({ page, activeId });
  const xp = getXp(progress), completed = progress.completed.length;
  const current = missions.find(item => item.id === activeId) ?? missions[0];
  const activeIndex = missions.findIndex(item => item.id === current.id);
  const nextMission = missions[Math.min(completed, missions.length - 1)];
  const name = learnerName(progress.callsign);
  function closeDrawer() {
    const focused = document.activeElement;
    const restoreMenu = focused instanceof HTMLElement && !!focused.closest('.gr-sidebar,.gr-mobile-scrim');
    setDrawer(false);
    if (restoreMenu) menuButtonRef.current?.focus();
  }
  useEffect(() => { if (!drawer || dialog) return; const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDrawer(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [drawer, dialog]);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(progress)); setSaveError(false); } catch { setSaveError(true); } }, [progress]);
  useEffect(() => { const listener = () => { setEntryRole(null); if (location.hash !== '#/lab') setPage(initialPage()); }; window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener); }, []);
  useEffect(() => {
    const previous = previousViewRef.current;
    previousViewRef.current = { page, activeId };
    // Leave first arrival and in-page anchors alone. Only announce a new view.
    if (previous.page === page && (page !== 'mission' || previous.activeId === activeId)) return;
    document.getElementById(page === 'identity' ? 'ny-content' : 'gr-main')?.focus({ preventScroll: true });
  }, [page, activeId]);
  useEffect(() => {
    if (!dialog) return;
    const previous = dialogOriginRef.current;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDialog(null);
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (!dialogRef.current?.contains(document.activeElement)) { event.preventDefault(); first?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', listener);
    return () => { window.removeEventListener('keydown', listener); previous?.focus(); };
  }, [dialog]);
  function go(next: Page, role?: DeskRole) { setEntryRole(role ?? null); setPage(next); setDrawer(false); window.history.replaceState(null, '', '#/academy/' + next); window.scrollTo({ top: 0, behavior: 'instant' }); document.getElementById('gr-main')?.scrollTo({ top: 0, behavior: 'instant' }); }
  function enterDesk(role: DeskRole) { setSelectedDesk(role); go('live', role); }
  function openMission(id: MissionId) { if (!isUnlocked(progress, id)) return; setActiveId(id); setSelected([]); setFeedback(null); setHint(false); go('mission'); }
  function ping() { if (!sound) return; try { const context = new AudioContext(); const osc = context.createOscillator(), gain = context.createGain(); osc.connect(gain); gain.connect(context.destination); osc.type = 'sine'; osc.frequency.setValueAtTime(660, context.currentTime); osc.frequency.exponentialRampToValueAtTime(990, context.currentTime + .12); gain.gain.setValueAtTime(.035, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .2); osc.start(); osc.stop(context.currentTime + .2); osc.onended = () => void context.close(); } catch { /* Audio never gates learning. */ } }
  function submit() { const result = completeMission(progress, current.id, selected); setFeedback({ correct: result.correct, message: result.message, awarded: result.awarded }); if (result.correct) { setProgress(result.progress); ping(); } }
  function toggle(id: string) { setSelected(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]); setFeedback(null); }
  function downloadProgress() { const payload = { title: 'CANTON CITY LAB — 기초 학습 기록', mode: 'EDUCATIONAL_TRAINING_ONLY', callsign: progress.callsign, xp, completed: missions.filter(item => progress.completed.includes(item.id)).map(item => item.title), note: '문서 기반 교육 퍼즐의 완료 기록입니다. 실제 원장의 실행·비공개 검증 증거가 아닙니다.' }; const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'canton-city-lab-learning.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  if (page === 'identity') return <div className="ghost-app ny-entry-app"><CityBackgroundMusic/><NewYorkLanding completed={completed} onStart={enterDesk} onTrain={() => openMission(nextMission.id)} onExplore={() => go('map')} onNavigate={(target: 'map' | 'mission' | 'live' | 'archive') => target === 'mission' ? openMission(nextMission.id) : go(target)}/></div>;

  return <div className="ghost-app ny-academy-app cw-app">
    <CityBackgroundMusic inert={!!dialog}/>
    <a className="gr-skip" href="#gr-main" onClick={event => { event.preventDefault(); const main = document.getElementById('gr-main'); main?.focus(); main?.scrollIntoView({ block: 'start' }); }}>본문으로 건너뛰기</a>
    {drawer && <button className="gr-mobile-scrim" aria-label="메뉴 닫기" onClick={closeDrawer}/>}
    <aside id="cw-navigation-panel" inert={dialog ? true : undefined} className={'gr-sidebar ' + (drawer ? 'open' : '')}>
      <button className="gr-logo" onClick={() => go('identity')} aria-label="Canton City Lab 도시 입구"><span className="ny-brand-symbol" aria-hidden="true"><i/><i/><i/></span><span>CANTON<small>CITY LAB</small></span></button>
      <span className="ny-edition">NEW YORK / EDITION 02</span>
      <div className="gr-side-label">MY LEARNING</div>
      <button className="gr-operative" onClick={() => setDialog('profile')} aria-label="학습 프로필 설정"><span className="ny-profile-glyph"><UserRound size={20}/></span><span><strong>{name}</strong><small>기초 학습 {completed} / 6</small></span><ChevronRight size={14}/></button>
      <div className="gr-xp-row"><span>학습 진행 <b>{xp} XP</b></span><small>최대 600 XP</small></div><div className="gr-progress-track"><span style={{ width: (xp / 600 * 100) + '%' }}/></div>
      <nav aria-label="아카데미 메뉴">{navItems.map(({ id, icon: Icon }) => <button key={id} className={'gr-nav ' + (page === id ? 'active' : '')} aria-current={page === id ? 'page' : undefined} onClick={() => id === 'mission' ? openMission(nextMission.id) : go(id)}><Icon size={17}/><span>{pageLabels[id]}</span>{page === id && <ChevronRight size={13}/>}</button>)}</nav>
      <div className="gr-side-line"/><div className="gr-side-label">LEARNING PATH <span>{completed.toString().padStart(2, '0')}/06</span></div>
      <div className="gr-mini-missions">{missions.map((mission, index) => <button key={mission.id} disabled={!isUnlocked(progress, mission.id)} onClick={() => openMission(mission.id)} className={page === 'mission' && current.id === mission.id ? 'active' : ''}><span className={progress.completed.includes(mission.id) ? 'complete' : ''}>{progress.completed.includes(mission.id) ? <Check size={11}/> : String(index + 1).padStart(2, '0')}</span><span>{lessonNames[index]}</span>{!isUnlocked(progress, mission.id) && <LockKeyhole size={11}/>}</button>)}</div>
      <div className="gr-sidebar-bottom"><p>하나의 거래를,<br/><strong>서로 다른 시야로.</strong></p><button onClick={onOpenLab}>원장 실습 연결 안내<ArrowUpRight size={13}/></button><span className="gr-build">ONLINE LEARNING / V2</span></div>
    </aside>
    <div className="gr-workspace ci-workspace" inert={dialog ? true : undefined}>
      <div className="ci-architecture" aria-hidden="true"><picture><source media="(max-width: 760px)" srcSet="/game/new-york/nyc-office-arrival-mobile.jpg?v=6"/><img src="/game/new-york/nyc-office-arrival.jpg?v=6" alt="" decoding="async"/></picture></div>
      <header className="gr-topbar"><div><button ref={menuButtonRef} className="gr-mobile-menu" onClick={() => setDrawer(value => !value)} aria-label={drawer ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={drawer} aria-controls="cw-navigation-panel"><Menu size={20}/></button><span className="gr-top-path"><span className="gr-top-brand">CITY LAB</span><ChevronRight size={12}/><strong>{pageLabels[page]}</strong></span></div><div className="gr-top-tools"><span className="gr-training-status">{page === 'live' ? 'DESIGN PREVIEW' : page === 'archive' ? 'REFERENCE LIBRARY' : 'LEARNING STUDIO'}</span><button aria-label={sound ? '효과음 끄기' : '효과음 켜기'} aria-pressed={sound} onClick={() => setSound(value => !value)}>{sound ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button><button aria-label="이용 안내 보기" onClick={() => setDialog('briefing')}><CircleHelp size={18}/></button><button className="gr-profile-tool" aria-label="학습 프로필 설정" onClick={() => setDialog('profile')}><UserRound size={18}/></button></div></header>
      <main className={"gr-main " + (page === "map" ? "cw-main-dashboard" : "")} id="gr-main" tabIndex={-1}>
        {saveError && <p className="gr-storage-warning" role="status">이 브라우저에서 학습 진행을 저장하지 못했습니다. ‘학습 기록 저장’으로 현재 내용을 내려받을 수 있습니다.</p>}
        {page === 'map' && <div className="cw-dashboard">
          <section className="cw-dashboard-heading" aria-labelledby="ny-map-title">
            <div><span className="gr-eyebrow">CITY LAB / WORKSPACE</span><h1 id="ny-map-title">어떤 시야로 시작할까요?</h1></div>
            <button className="cw-resume" onClick={() => openMission(completed === 6 ? missions[0].id : nextMission.id)}><BookOpen size={16}/>{completed === 0 ? '첫 학습 시작' : completed === 6 ? '학습 복습' : '학습 이어하기'}<ArrowUpRight size={16}/></button>
          </section>

          <section className="cw-trade-context" aria-label="이번 체험의 거래">
            <div className="cw-trade-name"><ArrowLeftRight size={18}/><span><small>하나의 모의 채권 거래</small><strong>운용사 A <span>↔</span> 은행 B</strong></span></div>
            <div className="cw-trade-amount"><span>TEST BOND <b>100</b></span><ArrowLeftRight size={15}/><span>TEST CASH <b>10,000</b></span></div>
            <span className="cw-environment">문서 기반 소개 · 원장 미연결</span>
          </section>

          <section className="cw-role-section" aria-labelledby="cw-roles-title">
            <div className="cw-section-heading"><h2 id="cw-roles-title">역할별 설계 보기</h2><span>역할을 클릭해 해당 화면으로 이동합니다.</span></div>
            <div className="cw-role-grid">{desks.map((item, index) => {
              const Icon = [Landmark, ArrowLeftRight, ShieldCheck, ScanEye][index];
              return <button key={item.role} className={'cw-role-card cw-role-' + item.role} onClick={() => enterDesk(item.role)} aria-label={item.label + ' 관점 보기'}>
                <span className="cw-role-top"><span className="cw-role-code">{item.code}</span><Icon size={18} strokeWidth={1.5}/></span>
                <strong>{item.label}</strong><span className="cw-role-subtitle">{['채권을 보내고 대금을 받습니다.', '대금을 지급하고 채권을 받습니다.', '승인된 자료와 권한을 확인합니다.', '거래 밖에서 보이는 정보를 살핍니다.'][index]}</span>
                <span className="cw-role-action">{item.name} 관점 보기<ArrowUpRight size={14}/></span>
              </button>;
            })}</div>
          </section>

          <div className="cw-dashboard-bottom">
            <section className="cw-learning-panel" aria-labelledby="cw-lessons-title">
              <div className="cw-section-heading"><h2 id="cw-lessons-title">기초 학습</h2><span>{completed} / 6 완료 · {xp} XP</span></div>
              <div className="cw-lesson-grid">{missions.map((mission, index) => {
                const done = progress.completed.includes(mission.id), unlocked = isUnlocked(progress, mission.id), Icon = lessonIcons[index];
                return <button key={mission.id} className={'cw-lesson ' + (done ? 'done' : unlocked ? 'available' : 'locked')} disabled={!unlocked} onClick={() => openMission(mission.id)} aria-label={String(index + 1) + '번 ' + mission.title + (done ? ', 완료한 학습 복습' : unlocked ? ', 학습 시작' : ', 앞 학습 완료 후 열림')}>
                  <span className="cw-lesson-icon"><Icon size={19} strokeWidth={1.6}/></span><span className="cw-lesson-copy"><small>LESSON {String(index + 1).padStart(2, '0')}</small><strong>{lessonNames[index]}</strong><span>{done ? '복습하기' : unlocked ? '시작하기 · +100 XP' : '앞 학습 완료 후'}</span></span>
                  <span className="cw-lesson-state">{done ? <Check size={16}/> : unlocked ? <ArrowUpRight size={16}/> : <LockKeyhole size={14}/>}</span>
                </button>;
              })}</div>
              <p className="cw-learning-note">문서 기반 선택 퍼즐 · 실제 원장 관측과 별도</p>
            </section>

            <section className="cw-tools-panel" aria-labelledby="cw-tools-title">
              <div className="cw-section-heading"><h2 id="cw-tools-title">바로 가기</h2><span>TOOLS</span></div>
              <button className="cw-tool" onClick={() => go('archive')}><ReceiptText size={19}/><span><strong>자료실</strong><small>핵심 개념과 공식 문서</small></span><ArrowUpRight size={16}/></button>
              <button className="cw-tool" onClick={onOpenLab}><Network size={19}/><span><strong>원장 연결 안내</strong><small>실제 거래 실습에 필요한 환경</small></span><ArrowUpRight size={16}/></button>
              <button className="cw-tool" onClick={downloadProgress}><Trophy size={19}/><span><strong>학습 기록 저장</strong><small>이 브라우저의 진행 내려받기</small></span><ArrowUpRight size={16}/></button>
              <div className="cw-workspace-note"><CircleHelp size={15}/><p>온라인 학습판에는 실제 원장이 연결되지 않았습니다. 설계 소개는 거래·조회 근거가 아닙니다.</p></div>
            </section>
          </div>
        </div>}
        {page === 'mission' && <div className="gr-mission-page"><div className="gr-page-title"><div><span className="gr-eyebrow">LEARNING STUDIO / LESSON {String(activeIndex + 1).padStart(2, '0')}</span><h1>{current.title}</h1><p>{current.description}</p></div><span className="gr-reward"><Zap size={16}/>{progress.completed.includes(current.id) ? '100 XP 학습 완료' : '+100 학습 XP'}</span></div><div className="gr-lesson-progress">{missions.map((mission, index) => <button key={mission.id} disabled={!isUnlocked(progress, mission.id)} className={(activeId === mission.id ? 'active ' : '') + (progress.completed.includes(mission.id) ? 'done' : '')} aria-label={String(index + 1) + '번 ' + mission.title} aria-current={activeId === mission.id ? 'step' : undefined} onClick={() => openMission(mission.id)}><span>{progress.completed.includes(mission.id) ? <Check size={13}/> : String(index + 1).padStart(2, '0')}</span><i/></button>)}</div>
          <div className="gr-lesson-grid"><aside className="gr-briefing-panel"><div className="gr-mentor"><span className="ny-lesson-glyph"><BookOpen size={23}/></span><div><span>LESSON BRIEF</span><strong>{lessonNames[activeIndex]}</strong><small>문서 기반 교육 · 실제 거래와 별도</small></div></div><div className="gr-transmission"><span className="gr-eyebrow">CONTEXT</span><p>{current.briefing}</p></div><div className="gr-objective"><span><Flag size={15}/>학습 목표</span><p>{current.objective}</p></div><div className="gr-concept"><span>KEY PRINCIPLE</span><h3>{current.concept}</h3><p>여러 조건을 선택하고 예상 결과가 어떻게 바뀌는지 확인하세요.</p></div><button className="gr-hint-button" onClick={() => setHint(value => !value)} aria-expanded={hint}><CircleHelp size={15}/>{hint ? '힌트 접기' : '학습 힌트 보기'}<ChevronRight size={13}/></button>{hint && <div className="gr-hint" role="note">{current.hint}</div>}<p className="gr-training-note">교육 퍼즐의 정답은 실제 원장의 프라이버시 검증 결과와 별개입니다.</p></aside><div className="gr-puzzle-column"><MissionWorkbench key={current.id} mission={current} selected={selected} toggle={toggle}/>{feedback && <div className={'gr-feedback ' + (feedback.correct ? 'correct' : 'incorrect')} role="status"><span className="gr-feedback-icon">{feedback.correct ? <Check size={21}/> : <RotateCcw size={20}/>}</span><div><strong>{feedback.correct ? '학습 조건을 확인했습니다.' : '선택한 조건을 다시 살펴보세요.'}</strong><p>{feedback.message}</p>{feedback.correct && <div className="gr-next-sector"><Flag size={13}/>{activeIndex < 5 ? '다음 학습 · ' + lessonNames[activeIndex + 1] : '기초 학습 완료 · 역할별 설계 보기 이동 가능'}</div>}{feedback.awarded > 0 && <small>+{feedback.awarded} 학습 XP · 교육 진행에만 반영</small>}</div></div>}<div className="gr-puzzle-footer"><span><Terminal size={14}/>선택한 조건 {selected.length}개</span>{feedback?.correct ? <button className="gr-button" onClick={() => activeIndex < 5 ? openMission(missions[activeIndex + 1].id) : go('live')}>{activeIndex < 5 ? '다음 학습으로' : '역할별 설계 보기'}<ArrowRight size={16}/></button> : <button className="gr-button" disabled={!selected.length} onClick={submit}>선택한 조건 확인<ArrowRight size={16}/></button>}</div></div></div>
          {completed === 6 && <section className="gr-graduation"><Trophy size={27}/><div><h3>기초 학습 여섯 단계를 완료했습니다.</h3><p>학습 XP는 원장의 검증 점수가 아닙니다. 실제 응답·근거 확인에는 별도 원장 서버 연결이 필요합니다.</p></div><button className="gr-button secondary" onClick={downloadProgress}>학습 기록 저장<ArrowUpRight size={14}/></button></section>}
        </div>}
        {page === 'live' && <><div className="gr-page-title"><div><span className="gr-eyebrow">FOUR PERSPECTIVES / DESIGN PREVIEW</span><h1>하나의 거래. 서로 다른 공개 범위.</h1><p>역할별로 필요한 정보와 실행 권한을 살펴봅니다. 이 온라인 페이지는 설계 소개이며 실제 원장과 연결되어 있지 않습니다.</p></div><span className="gr-mode-tag">문서 기반 설계 소개</span></div><WebLabIntro entryRole={entryRole ?? selectedDesk} onTrain={() => openMission(nextMission.id)}/></>}
        {page === 'archive' && <><div className="gr-page-title"><div><span className="gr-eyebrow">REFERENCE LIBRARY</span><h1>설명에서 근거로.</h1><p>학습의 핵심 개념과 서로 다른 프라이버시 구조의 공식 자료를 확인하세요.</p></div><BookOpen size={32}/></div><div className="gr-archive-toolbar"><div role="tablist" aria-label="자료실 분류"><button role="tab" aria-selected={archiveTab === 'concepts'} onClick={() => setArchiveTab('concepts')} className={archiveTab === 'concepts' ? 'active' : ''}>핵심 개념</button><button role="tab" aria-selected={archiveTab === 'networks'} onClick={() => setArchiveTab('networks')} className={archiveTab === 'networks' ? 'active' : ''}>다른 구조</button></div><input aria-label="자료 검색" value={search} onChange={event => setSearch(event.target.value)} placeholder="개념 또는 네트워크 검색…"/></div><div className="gr-archive-grid">{archiveTab === 'concepts' ? missions.filter(mission => [mission.title, mission.concept, mission.success].join(' ').toLowerCase().includes(search.toLowerCase())).map((mission, index) => <article className="gr-archive-card" key={mission.id}><span className="gr-eyebrow">PRINCIPLE / {String(index + 1).padStart(2, '0')}<BookOpen size={15}/></span><h2>{mission.concept}</h2><p>{mission.success}</p><a href={mission.id === 'trust' ? trustSource : mission.id === 'public' ? 'https://eips.ethereum.org/EIPS/eip-20' : cantonSource} target="_blank" rel="noreferrer">공식 문서 읽기<ExternalLink size={13}/></a></article>) : references.filter(item => [item.name, item.title, item.body].join(' ').toLowerCase().includes(search.toLowerCase())).map(item => <article className="gr-archive-card" key={item.name}><span className="gr-eyebrow">{item.category}<span>{item.symbol}</span></span><h2>{item.name}</h2><strong>{item.title}</strong><p>{item.body}</p><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={13}/></a><small>문서 기반 설명 · 이 앱에서 미실행</small></article>)}</div>{!(archiveTab === 'concepts' ? missions.some(item => [item.title, item.concept, item.success].join(' ').toLowerCase().includes(search.toLowerCase())) : references.some(item => [item.name, item.title, item.body].join(' ').toLowerCase().includes(search.toLowerCase()))) && <p className="gr-empty">검색어에 맞는 자료가 없습니다.</p>}<div className="gr-archive-sources"><span>ABOUT THE EVIDENCE</span><p>문서 기반 설명과 별도의 실제 원장 실행을 구분합니다. 조회 실패나 미실행은 프라이버시 성공을 뜻하지 않습니다. 뉴욕은 이 디자인의 무대이며, 화면에 등장하는 기관과 자산은 교육용입니다.</p><button className="gr-text-button" onClick={onOpenLab}>실제 원장 연결 상태 보기<ArrowUpRight size={14}/></button></div></>}
        <footer className="gr-footer"><span>CANTON CITY LAB <i>/</i> NEW YORK EDITION</span><span>연구·교육용 체험 · 실제 자금 사용 없음</span></footer>
      </main>
    </div>
    {dialog && <div className="gr-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) setDialog(null); }}><section ref={dialogRef} className="gr-modal" role="dialog" aria-modal="true" aria-labelledby="gr-dialog-title"><button className="gr-modal-close" onClick={() => setDialog(null)} aria-label="닫기" autoFocus><X size={20}/></button>{dialog === 'briefing' ? <><span className="gr-eyebrow">CITY LAB / FIELD GUIDE</span><h2 id="gr-dialog-title">같은 거래를 네 가지 시야로.</h2><p>운용사 A가 은행 B에 테스트 채권 100단위를 제공하고, B는 테스트 현금 10,000단위를 지급합니다.</p><p>당사자는 거래를 확인하고, 감사자 C는 승인된 자료를 읽습니다. 무관한 D의 시야에서도 관찰해 누가 어떤 정보를 받는지 확인하세요.</p><ol><li><strong>먼저 원리를 이해합니다.</strong><span>정보 배포·결제·조회·감사·공개 원장·운영 신뢰를 여섯 학습으로 살펴봅니다.</span></li><li><strong>실제 원장 실습은 따로 확인합니다.</strong><span>기존 로컬 실습에서는 두 실제 원장을 비교합니다. 이 온라인 학습판에는 실습 서버가 연결되지 않았으며, 실행·조회 증거를 생성하지 않습니다.</span></li><li><strong>확인한 근거만으로 판단합니다.</strong><span>충족·미충족·확인 불가를 구분합니다. 역할을 선택하거나 화면을 숨긴 것만으로 비공개가 증명되지는 않습니다.</span></li></ol><div className="gr-modal-note">뉴욕은 디자인의 배경입니다. 이 체험은 실제 금융기관의 채택 이유나 규제 적합성을 증명하는 도구가 아닙니다. 기초 학습과 실제 원장 관측은 구분됩니다.</div><button className="gr-button" onClick={() => { setDialog(null); if (page !== 'mission') completed === 6 ? go('live') : openMission(nextMission.id); }}>{page === 'mission' ? '진행 중인 학습으로 돌아가기' : completed === 6 ? '역할별 설계 보기' : completed === 0 ? '기초 학습 시작' : '기초 학습 이어하기'}<ArrowRight size={16}/></button></> : dialog === 'profile' ? <><span className="gr-eyebrow">LEARNER PROFILE</span><h2 id="gr-dialog-title">학습 프로필.</h2><div className="ny-profile-summary"><span className="ny-profile-glyph"><UserRound size={25}/></span><div><strong>{name}</strong><small>{completed} / 6 학습 완료 · {xp} 교육 XP</small></div></div><label className="gr-callsign">표시 이름<input value={learnerName(progress.callsign)} maxLength={16} onChange={event => setProgress(value => ({ ...value, callsign: event.target.value }))} onBlur={() => setProgress(value => normalizeProgress(value))}/></label><p className="gr-modal-note">프로필과 학습 진행은 이 브라우저에만 저장됩니다. 실명·지갑·개인 키를 입력할 필요가 없습니다.</p><div className="gr-profile-actions"><button className="gr-button secondary" onClick={downloadProgress}>학습 기록 저장</button><button className="gr-text-button" onClick={() => setDialog('reset')}><RotateCcw size={13}/>학습 진행 초기화</button></div><button className="gr-button" onClick={() => { setProgress(value => normalizeProgress(value)); setDialog(null); }}>프로필 적용<Check size={15}/></button></> : <><span className="gr-eyebrow">RESET LEARNING</span><h2 id="gr-dialog-title">학습을 처음부터 시작할까요?</h2><p>이 브라우저의 학습 완료와 XP를 초기화합니다. 실제 원장의 거래·실험 기록은 변경하지 않습니다.</p><div className="gr-profile-actions"><button className="gr-button secondary" onClick={() => setDialog('profile')}>취소</button><button className="gr-button" onClick={() => { setProgress(normalizeProgress({ callsign: progress.callsign, avatar: progress.avatar })); setSelected([]); setFeedback(null); setActiveId(missions[0].id); setDialog(null); go('map'); }}>학습만 초기화</button></div></>}</section></div>}
  </div>;
}

