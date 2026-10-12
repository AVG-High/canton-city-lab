import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeftRight, BookOpen, Check, FileText, LockKeyhole, Network, ShieldCheck } from 'lucide-react';
import './web-lab-intro.css';

type Role = 'seller' | 'buyer' | 'auditor' | 'outsider';
const roles = [
  { id: 'seller' as const, letter: 'A', name: '운용사', subtitle: '매도자', title: '넘기는 채권, 받는 대금.', body: '운용사 A는 자신의 매매 조건과 채권·대금의 이전 결과를 확인해야 합니다. 다른 기관의 모든 장부까지 볼 필요는 없습니다.', scope: '원본 거래계약 · 자신의 자산 기록', read: ['거래 상대방과 합의한 조건', '테스트 채권 100단위 매도', '테스트 현금 10,000단위 수령'], write: '자신의 거래 동의와 채권 준비', outside: '다른 기관의 무관한 거래는 이 공개 정책의 대상이 아닙니다.' },
  { id: 'buyer' as const, letter: 'B', name: '은행', subtitle: '매수자', title: '대금을 지급하고, 채권을 인수합니다.', body: '은행 B는 대금 지급과 채권 인수가 함께 끝나는지 확인해야 합니다. 최종 교환이 실패하면 어느 한 자산만 이전되어서는 안 됩니다.', scope: '원본 거래계약 · 자신의 자산 기록', read: ['거래 상대방과 합의한 조건', '테스트 현금 10,000단위 지급', '테스트 채권 100단위 인수'], write: '자신의 동의·대금 준비·최종 교환', outside: '원자적 교환은 올바르게 구현한 공개 EVM에서도 가능합니다.' },
  { id: 'auditor' as const, letter: 'C', name: '감사자', subtitle: '승인된 열람', title: '읽을 수 있어도, 옮길 수는 없습니다.', body: '감사자 C에게는 이 거래의 검증에 필요한 별도 감사자료를 제공합니다. 원본 계약의 Observer로 지정하는 것은 필드별 마스킹과 다릅니다.', scope: '별도 감사계약 · 승인한 자료', read: ['이 거래의 당사자와 자산 종류', '합의한 수량과 대가', '승인된 결제 기록'], write: '자산 이전 권한 없음', outside: '권한을 나중에 없애도 이미 저장한 감사자료 사본은 사라지지 않습니다.' },
  { id: 'outsider' as const, letter: 'D', name: '외부 관찰자', subtitle: '거래 밖의 시야', title: '거래 밖에는 어떤 흔적이 남을까요?', body: 'Canton 구성의 목표는 D에게 원본 거래계약을 배포하지 않는 것입니다. 기밀성 계층이 없는 일반 공개 ERC-20 구성에서는 토큰 이동과 주소별 잔고를 조회할 수 있습니다.', scope: '원본 거래계약 · 비수신 설계 목표', read: ['Canton: 원본 계약을 받지 않는 정책', '일반 공개 EVM: 공개된 토큰 이동', '주소와 실제 기관의 연결은 별도 정보'], write: '경제적 거래 실행 권한 없음', outside: '빈 응답이나 오류만으로 비공개를 증명할 수 없습니다. 정상 인증·동기화와 조회 근거를 함께 확인해야 합니다.' },
];

export default function WebLabIntro({ entryRole, onTrain }: { entryRole: Role; onTrain: () => void }) {
  const [active, setActive] = useState<Role>(entryRole);
  useEffect(() => setActive(entryRole), [entryRole]);
  const role = roles.find(item => item.id === active)!;
  return <div className="ny-web-lab">
    <div className="ny-online-status" role="status"><Network size={18}/><div><strong>설계 소개 · 실제 원장 서버 미연결</strong><p>아래 내용은 문서에 근거한 공개 정책입니다. 거래 실행·인증된 조회·프라이버시 판정을 생성하지 않습니다.</p></div></div>
    <div className="ny-web-role-tabs" role="tablist" aria-label="역할별 설계">
      {roles.map((item, index) => <button key={item.id} id={`web-role-${item.id}`} role="tab" aria-selected={active === item.id} aria-controls="web-role-panel" tabIndex={active === item.id ? 0 : -1} onClick={() => setActive(item.id)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % 4 : event.key === 'ArrowLeft' ? (index + 3) % 4 : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : -1;
        if (next >= 0) { event.preventDefault(); setActive(roles[next].id); document.getElementById(`web-role-${roles[next].id}`)?.focus(); }
      }}><span>{item.letter}</span><strong>{item.name}</strong><small>{item.subtitle}</small></button>)}
    </div>
    <section className="ny-web-role-panel" id="web-role-panel" role="tabpanel" aria-labelledby={`web-role-${active}`}>
      <div className="ny-web-role-copy"><span className="gr-eyebrow">PERSPECTIVE {role.letter} / DESIGN TARGET</span><h2>{role.title}</h2><p>{role.body}</p><div className="ny-web-context"><ArrowLeftRight size={19}/><span>테스트 채권 <b>100</b> ↔ 테스트 현금 <b>10,000</b></span></div></div>
      <div className="ny-web-role-document"><span className="gr-eyebrow"><FileText size={15}/>계약별 공개 범위</span><h3>{role.scope}</h3><ul>{role.read.map(item => <li key={item}><Check size={15}/>{item}</li>)}</ul><div className="ny-web-action"><ShieldCheck size={17}/><span><small>실행 권한</small><strong>{role.write}</strong></span></div><p><LockKeyhole size={16}/>{role.outside}</p></div>
    </section>
    <section className="ny-web-trust"><div><span className="gr-eyebrow">THE REMAINING TRUST</span><h2>가려진 정보에도,<br/>운영의 신뢰는 남습니다.</h2></div><div><p>Party를 호스팅하는 Participant 운영자는 그 역할에서 처리하는 데이터를 취급합니다. 외부 서명키의 통제와 데이터 보관·접근은 구분해야 합니다.</p><p>실제 실습에서는 두 원장의 같은 거래, A·B·C·D의 인증된 조회, C의 자산 이전 거절을 검증합니다. 이 온라인 학습판은 그 결과를 대신하지 않습니다.</p><button className="gr-button secondary" onClick={onTrain}><BookOpen size={16}/>기초 학습으로 이해하기<ArrowRight size={16}/></button></div></section>
  </div>;
}
