import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Eye, FileText, LockKeyhole, Play, Radar, Shield, Zap } from 'lucide-react';
import type { Mission, MissionId } from './curriculum';
import { trainingPreview } from './trainingPreview';
import './mission-workbench.css';

const consoles: Record<MissionId, string> = {
  boundary: 'INFORMATION DISTRIBUTION', atomic: 'ATOMIC SETTLEMENT', visibility: 'QUERY VERIFICATION',
  audit: 'AUDIT PERMISSIONS', public: 'PUBLIC LEDGER ACCESS', trust: 'OPERATIONAL TRUST',
};
const people = [
  {id: 'seller', name: 'A', role: '운용사'}, {id: 'buyer', name: 'B', role: '은행'},
  {id: 'auditor', name: 'C', role: '감사자'}, {id: 'outsider', name: 'D', role: '외부 관찰자'},
];

/** Every scene is an illustrative policy model. No scene invokes the ledger API. */
export default function MissionWorkbench({mission, selected, toggle}: {
  mission: Mission; selected: string[]; toggle: (id: string) => void;
}) {
  const sceneRef=useRef<HTMLElement>(null);
  const [perspective, setPerspective] = useState('outsider');
  const [failure, setFailure] = useState(false);
  const [played, setPlayed] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [screenHidden, setScreenHidden] = useState(false);
  const [inspected, setInspected] = useState(0);
  useEffect(() => {setPerspective('outsider'); setFailure(false); setPlayed(false); setAttempted(false); setScreenHidden(false); setInspected(0);}, [mission.id]);
  useEffect(() => {setPlayed(false); setAttempted(false);}, [selected, failure]);
  const preview = trainingPreview(mission.id, selected, {failure});
  const receiving = selected.includes(perspective);
  const trustNodes=preview.nodes.filter(node=>node.id!=='party');
  const nodeStates={idle:'검토 대기',selected:'검토 항목 선택',blocked:'공개 미설정',planned:'전달 예정',warning:'주의할 경로',unknown:'미확정'};
  const person = people.find(item => item.id === perspective)!;

  return <div className={`gr-puzzle gr-puzzle-${mission.id}`}>
    <div className="gr-console-title"><span><span className="gr-led"/>{consoles[mission.id]}</span><span>LEARNING / 교육 시뮬레이션</span></div>
    <section ref={sceneRef} className={`gr-simulator ${preview.tone}`} aria-label="선택한 설계 시뮬레이터">
      <div className="gr-sim-heading"><span><FileText size={13}/>조건에 따라 달라지는 설계</span><small>교육용 모델 · 실제 원장 동작 없음</small></div>

      {mission.id === 'boundary' && <>
        <div className="gr-route-diagram"><div className="gr-route-contract"><FileText size={20}/><span>원본 거래계약</span><small>100 BOND / 10,000 CASH</small></div><div className="gr-route-branches" aria-label="교육용 수신자 선택 결과">{people.map(item => <div key={item.id} className={selected.includes(item.id) ? 'routed' : ''}><span className="gr-route-wire"/><span className="gr-route-person">{item.name}</span><small>{selected.includes(item.id) ? '전달 예정' : '미전달'}</small></div>)}</div></div>
        <div className="gr-peek-label"><Eye size={13}/>역할별 예상 수신함</div>
        <div className="gr-perspectives" role="group" aria-label="교육 시뮬레이션 관찰자">{people.map(item => <button key={item.id} aria-pressed={perspective === item.id} className={perspective === item.id ? 'active' : ''} onClick={() => setPerspective(item.id)}>{item.name}<small>{item.role}</small></button>)}</div>
        <div className={`gr-sim-document ${receiving ? 'revealed' : 'withheld'}`} aria-live="polite"><span>{person.name} · {person.role}의 예상 수신함</span>{receiving ? <><strong><FileText size={17}/>원본 거래계약 전체</strong><p>A → B · 채권 100단위 / B → A · 현금 10,000단위</p><small>{perspective === 'auditor' ? 'C에게 원본 전체가 전달됩니다. Observer는 필드별 마스킹이 아닙니다.' : perspective === 'outsider' ? 'D도 원본을 받는 정책입니다. 이 수업의 공개 목표를 다시 확인하세요.' : '선택한 정책에서 원본을 받도록 설정했습니다.'}</small></> : <><strong><LockKeyhole size={17}/>이 원본 계약을 받지 않는 정책</strong><p>{perspective === 'auditor' ? 'C에게 필요한 감사자료는 별도 계약으로 설계합니다.' : '원본 거래 내용은 이 교육용 수신함에 전달되지 않습니다.'}</p><small>실제 미반환 여부는 원장 실습의 인증된 조회로 확인합니다.</small></>}</div>
      </>}

      {mission.id === 'atomic' && preview.atomic && <>
        <div className="gr-sim-switch-row"><span>교환 중 어떤 일이 생기나요?</span><button className={failure ? 'fault active' : ''} aria-pressed={failure} onClick={() => setFailure(value => !value)}><Zap size={13}/>{failure ? '대금 이전 실패 켜짐' : '대금 이전 실패 넣기'}</button></div>
        <div className={`gr-balance-board ${played ? 'played' : ''}`}>
          {(['A', 'B'] as const).map(owner => {
            const before = preview.atomic!.before[owner], after = played ? preview.atomic!.after?.[owner] : null;
            return <div className="gr-sim-account" key={owner}><span className="gr-sim-account-name">PARTY {owner}<small>{owner === 'A' ? '매도자' : '매수자'}</small></span><div><span>채권</span><strong>{before.bond.toLocaleString('ko-KR')}</strong>{played && <><ArrowRight size={12}/><b>{after ? after.bond.toLocaleString('ko-KR') : '?'}</b></>}</div><div><span>현금</span><strong>{before.cash.toLocaleString('ko-KR')}</strong>{played && <><ArrowRight size={12}/><b>{after ? after.cash.toLocaleString('ko-KR') : '?'}</b></>}</div><small>{played ? '이전 → 교육 시뮬레이션 이후' : '교육 시뮬레이션 이전 보유량'}</small></div>;
          })}
        </div>
        <button className="gr-sim-play" onClick={() => setPlayed(true)}><Play size={13}/>{played ? '같은 조건으로 다시 확인' : '선택한 결제 흐름 시뮬레이션'}<ArrowRight size={13}/></button>
        {played && <div className="gr-sim-event" role="status"><strong>{preview.status}</strong><ol>{preview.atomic.steps.map((step, index) => <li key={index}>{step}</li>)}</ol></div>}
      </>}

      {mission.id === 'visibility' && preview.visibility && <>
        <div className="gr-scan-head"><Radar size={42} strokeWidth={1}/><div><span>D의 조회 응답 예시</span><strong>{preview.visibility.timeout ? '응답 시간 초과' : '대상 거래 기록 없음'}</strong><small>응답을 해석할 근거가 얼마나 모였나요?</small></div><b>{preview.visibility.count}<small>/ 4</small></b></div>
        <div className="gr-sensor-grid">{preview.visibility.controls.map(control => <div key={control.id} className={control.checked ? 'ready' : ''}><span>{control.checked ? <Check size={13}/> : '?'}</span><strong>{control.label}</strong></div>)}</div>
        <div className="gr-sim-event" role="status"><strong>{preview.status}</strong><p>{preview.body}</p></div>
      </>}

      {mission.id === 'audit' && preview.audit && <>
        <div className="gr-permission-doors"><div className={preview.audit.canReadAudit ? 'open' : ''}><FileText size={23}/><span>감사자료 읽기</span><strong>{preview.audit.canReadAudit ? '열람 허용 설정' : '열람 미설정'}</strong></div><div className={preview.audit.transferPolicy === 'allow' ? 'unsafe' : preview.audit.transferPolicy === 'deny' ? 'protected' : ''}><Shield size={23}/><span>자산 이전하기</span><strong>{({allow:'이전 허용 설정',deny:'이전 금지 설정',unset:'권한 미설정',conflicting:'정책 충돌'})[preview.audit.transferPolicy]}</strong></div></div>
        <button className="gr-sim-play" onClick={() => setAttempted(true)}><Play size={13}/>C의 자산 이전을 시뮬레이션<ArrowRight size={13}/></button>
        {attempted && <div className={`gr-sim-event ${preview.audit.transferPolicy === 'allow' ? 'unsafe' : ''}`} role="status"><strong>{preview.audit.transferPolicy === 'deny' ? '교육 예시: 이전을 막는 정책' : preview.audit.transferPolicy === 'allow' ? '교육 예시: C에게 이전 권한까지 허용됨' : '교육 예시: 먼저 실행 권한을 명확히 정하세요'}</strong><p>{preview.audit.transferPolicy === 'deny' ? preview.audit.canReadAudit ? '감사자료 열람과 이전 금지를 따로 설정했습니다. 실제 거절과 자산 보존은 실습에서 확인합니다.' : '이전은 금지했지만 감사자료 열람은 아직 미설정입니다. C가 무엇을 읽어야 하는지도 선택하세요.' : preview.audit.transferPolicy === 'allow' ? '감사자가 자산을 움직일 수 있는 설계입니다. 열람 권한과 실행 권한을 다시 나눠보세요.' : '규칙이 없거나 서로 충돌하면 이전 결과를 정할 수 없습니다.'}</p></div>}
      </>}

      {mission.id === 'audit' && preview.audit?.eraseCopiesClaim && <div className="gr-sim-copy-warning" role="status"><FileText size={15}/><p><strong>이미 받은 사본은 남을 수 있습니다.</strong>접근권한을 제거해도 C가 저장한 자료가 자동으로 삭제되지는 않습니다.</p></div>}

      {mission.id === 'public' && <>
        <div className="gr-public-demo gr-public-preview"><div><span>앱의 거래 화면</span><strong>{screenHidden ? '••••••••' : 'A → B / 100 BOND'}</strong><small>{screenHidden ? '로그인 전 · 화면 숨김' : '거래 화면 표시 중'}</small></div><div><span>별도의 공개 원장 조회</span><strong>A → B / 100 BOND</strong><small>이 예시의 기록은 그대로 보입니다</small></div></div>
        <button className="gr-hide-toggle" onClick={() => setScreenHidden(value => !value)} aria-pressed={screenHidden}><LockKeyhole size={14}/>{screenHidden ? '앱 화면 다시 표시' : '앱 화면을 로그인으로 숨겨보기'}</button>
        <p className="gr-sim-explanation" role="status">{screenHidden ? '앱 화면은 가려졌지만 공개 원장의 이전 기록은 남았습니다.' : '앱 화면과 공개 원장 읽기 경로는 별개입니다.'} A·B와 주소의 연결은 교육용 가상 매핑입니다.</p>
      </>}

      {mission.id === 'trust' && <>
        <div className="gr-topology" role="group" aria-label="신뢰 주체 탐색">{trustNodes.map((node, index) => <button key={node.id} aria-pressed={inspected === index} className={inspected === index ? 'active' : ''} onClick={() => setInspected(index)}>{index === 0 ? <Shield size={24}/> : index === 1 ? <LockKeyhole size={24}/> : <FileText size={24}/>}<strong>{node.label}</strong><span>{nodeStates[node.state]}</span></button>)}</div>
        {trustNodes[inspected] && <div className="gr-sim-event" role="status"><strong>{trustNodes[inspected].label}</strong><p>{trustNodes[inspected].detail}</p></div>}
      </>}

      <p className="gr-sim-caption">교육용 예상 결과 · 실제 실행·기밀성 검증 증거가 아닙니다.</p>
    </section>
    <div className="gr-options" role="group" aria-label="수업의 조건 선택">
      <div className="gr-select-prompt"><span>규칙을 골라 설계를 바꿔보세요</span><small>여러 개 선택 가능</small></div>
      {mission.options.map((option, index) => <button key={option.id} className={'gr-option '+(selected.includes(option.id) ? 'selected' : '')} role="checkbox" aria-checked={selected.includes(option.id)} onClick={() => toggle(option.id)}>
        <span className="gr-option-check">{selected.includes(option.id) ? <Check size={13}/> : String(index+1).padStart(2,'0')}</span><span><strong>{option.label}</strong><small>{option.description}</small></span><span className="gr-option-square">{selected.includes(option.id) && <Check size={12}/>}</span>
      </button>)}
      <button className="gr-preview-return" onClick={()=>sceneRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}><Eye size={13}/>선택한 설계의 화면 보기<ArrowRight size={13}/></button>
    </div>
    <details className="gr-rule-details"><summary><span>선택한 설계 규칙 보기</span><ChevronDown size={13}/></summary><div className="gr-code-preview"><span><span className="gr-code-violet">policy</span> <span className="gr-code-lime">training</span> {'{'}</span><span>  selected: [<b>{selected.length ? selected.map(item => '"'+item+'"').join(', ') : '/* 조건을 선택하세요 */'}</b>]</span><span>{'}'} <i>// 교육용 표현 · 실행되는 Daml 코드가 아닙니다</i></span></div></details>
  </div>;
}
