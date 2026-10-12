import type { MissionId } from './curriculum.ts';

export type PreviewTone = 'neutral' | 'positive' | 'warning' | 'danger';
export type PreviewNodeState = 'idle' | 'selected' | 'blocked' | 'planned' | 'warning' | 'unknown';
export interface PreviewCard { id: string; title: string; value: string; detail: string; tone: PreviewTone }
export interface PreviewNode { id: string; label: string; detail: string; state: PreviewNodeState }
export interface PreviewEdge { from: string; to: string; label: string; active: boolean; tone: PreviewTone }
export interface TrainingBalances { A: { bond: number; cash: number }; B: { bond: number; cash: number } }
export interface AtomicPreview {
  failure: boolean;
  layout: 'atomic' | 'independent' | 'incomplete' | 'conflicting';
  before: TrainingBalances;
  after: TrainingBalances | null;
  legs: { asset: 'bond' | 'cash'; from: 'A' | 'B'; to: 'A' | 'B'; amount: number; state: 'pending' | 'transferred' | 'rolled-back' | 'failed' | 'unknown' }[];
  steps: string[];
}
export interface TrainingPreview {
  id: MissionId;
  mode: 'REFERENCE_ONLY';
  trainingOnly: true;
  title: string;
  body: string;
  tone: PreviewTone;
  status: string;
  disclaimer: string;
  nodes: PreviewNode[];
  edges: PreviewEdge[];
  cards: PreviewCard[];
  boundary?: { recipients: { id: string; role: 'A' | 'B' | 'C' | 'D'; selected: boolean; delivery: 'planned' | 'withheld' }[] };
  atomic?: AtomicPreview;
  visibility?: { controls: { id: string; label: string; checked: boolean }[]; count: number; total: 4; timeout: boolean; interpretable: boolean };
  audit?: { canReadAudit: boolean; canTransfer: boolean | null; transferPolicy: 'allow' | 'deny' | 'unset' | 'conflicting'; conflicting: boolean; eraseCopiesClaim: boolean; copiesDeleted: false };
  public?: { loginHidden: boolean; independentRpc: boolean; ledgerExposure: true; realCompanyIdentity: 'requires-external-mapping' };
  trust?: { hostAcknowledged: boolean; keysSeparated: boolean; observerRiskAcknowledged: boolean };
}

const disclaimer = '교육용 조건 시뮬레이션입니다. 예상 설계와 가상 값은 실제 원장의 실행·조회 근거가 아니며, 어떤 체인의 충족 판정도 생성하지 않습니다.';
const card = (id: string, title: string, value: string, detail: string, tone: PreviewTone = 'neutral'): PreviewCard => ({ id, title, value, detail, tone });
const node = (id: string, label: string, detail: string, state: PreviewNodeState = 'idle'): PreviewNode => ({ id, label, detail, state });
const edge = (from: string, to: string, label: string, active: boolean, tone: PreviewTone = 'neutral'): PreviewEdge => ({ from, to, label, active, tone });
const balances = (): TrainingBalances => ({ A: { bond: 1000, cash: 0 }, B: { bond: 0, cash: 20000 } });

/** No API, persistence or ledger evidence is involved: selections only change a teaching model. */
export function trainingPreview(id: MissionId, selected: string[], options: { failure: boolean } = { failure: false }): TrainingPreview {
  const chosen = new Set(Array.isArray(selected) ? selected : []);
  const has = (value: string) => chosen.has(value);
  const common = { id, mode: 'REFERENCE_ONLY' as const, trainingOnly: true as const, disclaimer };

  if (id === 'boundary') {
    const recipients = [
      { id: 'seller', role: 'A' as const, label: 'A · 매도자' },
      { id: 'buyer', role: 'B' as const, label: 'B · 매수자' },
      { id: 'auditor', role: 'C' as const, label: 'C · 감사자' },
      { id: 'outsider', role: 'D' as const, label: 'D · 외부 관찰자' },
    ].map(item => ({ ...item, selected: has(item.id), delivery: has(item.id) ? 'planned' as const : 'withheld' as const }));
    const extra = recipients.some(item => item.selected && ['C', 'D'].includes(item.role));
    const missing = recipients.some(item => !item.selected && ['A', 'B'].includes(item.role));
    const description = (role: string, receiving: boolean) => receiving
      ? ['C', 'D'].includes(role) ? '원본 전체 전달 예정 · 이 수업의 필요 범위 초과' : '원본 거래계약 전달 예정'
      : ['A', 'B'].includes(role) ? '원본 미전달 · 당사자 업무 정보 부족' : '원본 미전달 예정';
    return {
      ...common, title: '누구의 화면에 원본이 도착할까?', status: '계약 수신자 설계', tone: extra ? 'warning' : missing ? 'neutral' : 'positive',
      body: '선택한 주체를 원본 거래계약 수신자로 가정합니다. C에게 필요한 감사자료는 별도 계약이며, 수신자를 추가해도 원본의 일부 필드만 자동으로 가려지지는 않습니다.',
      boundary: { recipients: recipients.map(({ label: _label, ...item }) => item) },
      nodes: [node('contract', '원본 거래계약', 'A·B / 100 BOND / 10,000 CASH', 'selected'), ...recipients.map(item => node(item.id, item.label, description(item.role, item.selected), item.selected ? ['C', 'D'].includes(item.role) ? 'warning' : 'planned' : ['A', 'B'].includes(item.role) ? 'warning' : 'blocked'))],
      edges: recipients.map(item => edge('contract', item.id, item.selected ? '원본 전달 예정' : '전달하지 않는 정책', item.selected, item.selected && ['C', 'D'].includes(item.role) ? 'warning' : 'neutral')),
      cards: recipients.map(item => card(item.id, item.label, item.selected ? '원본 수신 예정' : '원본 미수신 예정', description(item.role, item.selected), item.selected && ['C', 'D'].includes(item.role) || !item.selected && ['A', 'B'].includes(item.role) ? 'warning' : 'neutral')),
    };
  }

  if (id === 'atomic') {
    const one = has('one-transaction'), rollback = has('rollback-both'), independent = has('separate-transfers');
    const layout: AtomicPreview['layout'] = independent && (one || rollback) ? 'conflicting' : one && rollback ? 'atomic' : independent ? 'independent' : 'incomplete';
    const failure = options.failure === true, before = balances();
    const after = layout === 'incomplete' || layout === 'conflicting' ? null : layout === 'atomic' && failure ? balances()
      : { A: { bond: 900, cash: failure ? 0 : 10000 }, B: { bond: 100, cash: failure ? 20000 : 10000 } };
    const legState: AtomicPreview['legs'][number]['state'] = after === null ? 'unknown' : layout === 'atomic' && failure ? 'rolled-back' : 'transferred';
    const atomic: AtomicPreview = {
      failure, layout, before, after,
      legs: [
        { asset: 'bond', from: 'A', to: 'B', amount: 100, state: legState },
        { asset: 'cash', from: 'B', to: 'A', amount: 10000, state: after === null ? 'unknown' : failure && layout === 'independent' ? 'failed' : legState },
      ],
      steps: layout === 'conflicting' ? ['하나의 최종 거래 또는 독립 송금 중 한 구조를 선택해야 합니다.', '충돌하는 설계이므로 잔액 결과를 계산하지 않았습니다.']
        : layout === 'incomplete' ? ['최종 교환의 구조와 실패 처리가 아직 충분히 정해지지 않았습니다.', '미선택 조건을 임의로 보충해 성공이나 부분 이전을 만들지 않습니다.']
        : layout === 'atomic' ? failure ? ['채권·대금 이전을 하나의 최종 거래에서 처리합니다.', '대금 처리에 실패를 주입합니다.', '최종 거래의 두 이전을 모두 되돌려 시작 잔액으로 남깁니다.']
          : ['채권·대금 이전을 하나의 최종 거래에 묶습니다.', '두 이전을 함께 확정하는 교육 시나리오입니다.']
        : failure ? ['첫 번째 독립 송금: A의 채권 100이 B에게 이전됩니다.', '두 번째 독립 송금: 대금 이전이 실패합니다.', '이미 확정된 첫 송금은 자동으로 되돌아가지 않는 교육 시나리오입니다.']
          : ['첫 번째 독립 송금: 채권 100을 이전합니다.', '두 번째 독립 송금: 현금 10,000을 이전합니다.', '이번에 둘 다 성공해도 실패 시의 공동 되돌림은 증명되지 않습니다.'],
    };
    const partial = layout === 'independent' && failure;
    const tone: PreviewTone = layout === 'conflicting' || partial ? 'danger' : layout === 'incomplete' || layout === 'independent' ? 'warning' : 'positive';
    const status = layout === 'conflicting' ? '설계 조건 충돌' : layout === 'incomplete' ? '설계 조건 미완성' : partial ? '가정한 실패: 한쪽만 이전' : failure ? '가정한 실패: 두 이전 되돌림' : layout === 'atomic' ? '가정한 성공: 함께 확정' : '가정한 성공: 순차 확정';
    return {
      ...common, title: '대금 처리가 실패하면 누가 무엇을 갖고 있을까?', status, tone, atomic,
      body: '시작 잔액에서 채권 100과 현금 10,000을 교환하는 가상 모델입니다. 실패 토글은 대금 처리 단계에 오류를 넣습니다. 이 정수 값은 테스트 현금의 교육용 표시 단위이며 실제 원장 잔액·기본 단위 응답이 아닙니다. 같은 원자성 요구는 올바르게 구현한 EVM에도 적용됩니다.' + (has('canton-only') ? ' Canton이라는 이름만으로 이 설계나 실패 처리를 보장하지 않습니다.' : ''),
      nodes: [node('A', 'A · 매도자', after ? `채권 ${after.A.bond} / 현금 ${after.A.cash}` : '설계 미확정 · 이후 잔액 미계산', after ? partial ? 'warning' : 'planned' : 'unknown'), node('exchange', layout === 'independent' ? '두 독립 송금' : '최종 교환', status, after ? partial ? 'warning' : 'selected' : 'unknown'), node('B', 'B · 매수자', after ? `채권 ${after.B.bond} / 현금 ${after.B.cash}` : '설계 미확정 · 이후 잔액 미계산', after ? partial ? 'warning' : 'planned' : 'unknown')],
      edges: atomic.legs.map(leg => edge(leg.from, leg.to, `${leg.asset === 'bond' ? '채권' : '현금'} ${leg.amount} · ${leg.state === 'transferred' ? '가상 이전' : leg.state === 'rolled-back' ? '가상 되돌림' : leg.state === 'failed' ? '가상 실패' : '미계산'}`, leg.state === 'transferred', leg.state === 'failed' ? 'danger' : 'neutral')),
      cards: [card('A', 'A · 교육용 잔액', after ? `채권 ${after.A.bond} / 현금 ${after.A.cash}` : '이후 잔액 미계산', '시작: 채권 1,000 / 현금 0', tone), card('B', 'B · 교육용 잔액', after ? `채권 ${after.B.bond} / 현금 ${after.B.cash}` : '이후 잔액 미계산', '시작: 채권 0 / 현금 20,000', tone), card('scope', '판단 범위', '선택한 구조의 가상 결과', layout === 'independent' && !failure ? '두 번 모두 성공한 예시는 원자성의 증거가 아닙니다.' : '원장별 실제 성공·실패 거래와 전후 자산은 별도로 확인해야 합니다.')],
    };
  }

  if (id === 'visibility') {
    const controls = [
      { id: 'empty-result', label: 'D의 응답에 대상 거래 없음' }, { id: 'valid-auth', label: 'D의 인증과 정상 조회 대조군' },
      { id: 'target-exists', label: '별도 권한 경로의 대상 존재 확인' }, { id: 'query-complete', label: '대상 구간까지 조회 완료' },
    ].map(item => ({ ...item, checked: has(item.id) }));
    const count = controls.filter(item => item.checked).length, timeout = has('timeout'), interpretable = count === 4 && !timeout;
    return {
      ...common, title: '빈 응답을 해석할 단서를 모으세요.', status: timeout ? '가정한 조회 오류 · 성공 근거 아님' : interpretable ? '해석에 필요한 조건 선택됨' : '해석 조건 부족', tone: timeout ? 'danger' : interpretable ? 'positive' : 'warning',
      body: timeout ? '시간 초과가 선택되었습니다. 다른 항목을 모두 골라도 응답하지 않은 요청을 완료된 조회나 프라이버시 성공으로 취급할 수 없습니다.' : '체크는 필요한 관측 조건을 배우는 동작입니다. 실제 인증·대상 존재·조회 구간을 확인한 증거가 아니며, 이 화면에서는 비공개를 판정하지 않습니다.',
      visibility: { controls, count, total: 4, timeout, interpretable },
      nodes: [node('D', 'D · 조회자', '별도의 유효한 역할 자격이 필요', 'selected'), ...controls.map(item => node(item.id, item.label, item.checked ? '학습 조건 선택됨' : '아직 선택하지 않은 조건', item.checked ? 'selected' : 'unknown')), node('interpretation', '관측 해석', timeout ? '시간 초과로 조회 완료를 주장할 수 없음' : interpretable ? '실제 증거를 수집할 체크리스트 준비' : '부족한 조건 확인 필요', timeout ? 'warning' : interpretable ? 'planned' : 'unknown')],
      edges: controls.map(item => edge(item.id, 'interpretation', item.checked ? '검토할 조건' : '누락된 조건', item.checked, timeout ? 'warning' : 'neutral')),
      cards: [card('controls', '학습 조건', `${count} / 4 선택`, '선택 횟수는 실제 조회 성공 횟수가 아닙니다.', interpretable ? 'positive' : 'neutral'), card('query', '조회 오류 가정', timeout ? '시간 초과' : '시간 초과 미선택', timeout ? '빈 응답과도 다릅니다. 정상 조회 근거로 사용할 수 없습니다.' : '오류를 선택하지 않은 것만으로 실제 조회가 완료되지는 않습니다.', timeout ? 'danger' : 'neutral'), card('scope', 'D에게 공개된 정보', '별도 존재 대조와 구분', '권한 있는 검증 경로의 대상 존재 확인이 D에게 전달된 원문이라는 뜻은 아닙니다.')],
    };
  }

  if (id === 'audit') {
    const canReadAudit = has('read-audit'), allow = has('read-means-transfer'), deny = has('no-transfer'), conflicting = allow && deny;
    const transferPolicy = conflicting ? 'conflicting' : allow ? 'allow' : deny ? 'deny' : 'unset';
    const canTransfer = conflicting || !allow && !deny ? null : allow;
    const eraseCopiesClaim = has('erase-copies');
    const transferLabel = conflicting ? '허용·금지 조건 충돌' : canTransfer === null ? '이전 정책 미지정' : canTransfer ? '이전 허용 설계' : '이전 금지 설계';
    return {
      ...common, title: '자료 열람과 자산 이전 권한을 구분하세요.', status: conflicting ? '권한 정책 충돌' : canReadAudit && canTransfer === false && !eraseCopiesClaim ? '열람·실행 권한을 분리한 설계' : '권한 정책 검토', tone: conflicting || canTransfer === true ? 'danger' : eraseCopiesClaim || canTransfer === null || !canReadAudit ? 'warning' : 'positive',
      body: '별도 감사자료의 열람과 자산 이전은 독립된 권한으로 가정합니다. 여기의 허용·금지는 설계 선택이며 실제 명령 거절이 아닙니다. 이미 받은 사본은 미래 접근권한을 없애도 자동 삭제되지 않습니다.',
      audit: { canReadAudit, canTransfer, transferPolicy, conflicting, eraseCopiesClaim, copiesDeleted: false },
      nodes: [node('receipt', '별도 감사자료', '원본 거래계약과 구분', 'selected'), node('C', 'C · 감사자', canReadAudit ? '감사자료 열람 예정' : '감사자료 열람 미선택', canReadAudit ? 'planned' : 'blocked'), node('assets', '거래 자산', transferLabel, conflicting || canTransfer === true ? 'warning' : canTransfer === false ? 'blocked' : 'unknown'), node('copy', '기존 수신 사본', '접근권한 제거로 자동 삭제되지 않음', eraseCopiesClaim ? 'warning' : 'idle')],
      edges: [edge('receipt', 'C', canReadAudit ? '열람을 허용한 설계' : '열람 미선택', canReadAudit), edge('C', 'assets', transferLabel, canTransfer === true, canTransfer === true || conflicting ? 'danger' : 'neutral'), edge('C', 'copy', '수신 후 저장할 수 있음', canReadAudit)],
      cards: [card('read', '감사자료 열람', canReadAudit ? '열람 허용 설계' : '열람 미선택', 'C에게 필요한 승인 자료는 별도 계약으로 설계합니다.'), card('transfer', '자산 이전', transferLabel, '실습에서는 실제 거절 사유와 전후 자산 보존을 함께 확인해야 합니다.', conflicting || canTransfer === true ? 'danger' : 'neutral'), card('copies', '이미 받은 자료', '기존 사본이 남을 수 있음', '권한 변경은 이전에 받은 사본의 삭제를 보장하지 않습니다.', eraseCopiesClaim ? 'warning' : 'neutral')],
    };
  }

  if (id === 'public') {
    const loginHidden = has('login-not-privacy'), independentRpc = has('independent-rpc');
    const generalized = has('evm-never-private'), identityClaim = has('address-is-identity');
    return {
      ...common, title: '앱을 가리면 공개 기록도 사라질까?', status: '일반 공개 ERC-20의 조회 경로', tone: generalized || identityClaim ? 'warning' : loginHidden && independentRpc ? 'positive' : 'neutral',
      body: '기밀성 계층 없는 일반 공개 ERC-20을 가정합니다. 앱 화면의 가림과 별개로 원장 기록의 읽기 경로는 존재합니다. 이 모델의 A·B 표기는 제공된 가상 매핑이며, 실제 주소만으로 회사명을 알았다는 뜻이 아닙니다.',
      public: { loginHidden, independentRpc, ledgerExposure: true, realCompanyIdentity: 'requires-external-mapping' },
      nodes: [node('ledger', '일반 공개 원장', '교육 예시: 100 BOND / 10,000 CASH', 'planned'), node('app', '앱 화면', loginHidden ? '로그인 뒤로 숨긴 가정' : '교육 거래가 보이는 화면', loginHidden ? 'blocked' : 'planned'), node('rpc', '독립 RPC 경로', independentRpc ? '앱 밖에서 읽을 경로를 선택함' : '선택 여부와 관계없이 공개 조회 경로는 존재', independentRpc ? 'selected' : 'idle'), node('identity', '주소 → 실제 회사명', '별도 연결 근거 필요', identityClaim ? 'warning' : 'unknown')],
      edges: [edge('ledger', 'app', loginHidden ? '앱 가림은 데이터 삭제가 아님' : '앱에서 표시', !loginHidden), edge('ledger', 'rpc', '이벤트·잔고의 공개 읽기 경로', true), edge('rpc', 'identity', '주소의 실명 연결은 별도', false, identityClaim ? 'warning' : 'neutral')],
      cards: [card('screen', '앱 화면', loginHidden ? '•••••••• · 로그인 필요' : 'A → B · 100 BOND', '로그인 가림을 선택해도 아래의 공개 원장 예시는 남습니다.'), card('ledger', '공개 원장 예시', '100 BOND / 10,000 CASH', '교육용 고정 값이며 실제 RPC를 요청한 결과가 아닙니다.'), card('identity', '실제 회사명', '추가 매핑 근거 필요', '공개 주소와 실명은 같은 정보가 아닙니다.', identityClaim ? 'warning' : 'neutral'), card('scope', '비교 범위', '기밀성 계층 없는 공개 ERC-20', '모든 EVM 구성에 같은 결론을 적용하지 않습니다.', generalized ? 'warning' : 'neutral')],
    };
  }

  const hostAcknowledged = has('host-data'), keysSeparated = has('keys-separate'), observerRiskAcknowledged = has('observer-risk');
  const blindClaim = has('operator-blind'), winnerClaim = has('always-best');
  return {
    ...common, title: '정보와 권한이 누구를 거치는지 연결하세요.', status: '남은 신뢰 조건의 교육 지도', tone: blindClaim || winnerClaim ? 'warning' : hostAcknowledged && keysSeparated && observerRiskAcknowledged ? 'positive' : 'neutral',
    body: 'Party를 호스팅하는 노드는 담당 데이터를 취급하며, 외부 서명키 통제는 별도 축입니다. Observer와 계약 참조는 필요한 범위로 설계해야 합니다. 아래 연결은 개념 모델로, 운영자 메모리나 네트워크를 관측한 결과가 아닙니다.',
    trust: { hostAcknowledged, keysSeparated, observerRiskAcknowledged },
    nodes: [node('party', 'Party의 계약 자료', '역할에 전달되는 업무 데이터', 'selected'), node('host', '호스팅 노드', '담당 Party 데이터 취급', blindClaim ? 'warning' : hostAcknowledged ? 'selected' : 'idle'), node('keys', '서명키 관리자', '실행 승인 키 통제 · 데이터 가시성과 별도', keysSeparated ? 'selected' : 'idle'), node('observer', '추가 Observer', '불필요하게 지정한 경우 추가 공개 가능', observerRiskAcknowledged ? 'warning' : 'idle')],
    edges: [edge('party', 'host', '담당 데이터의 저장·처리', true, blindClaim ? 'warning' : 'neutral'), edge('keys', 'party', '서명·실행 승인 경로', true), edge('party', 'observer', '과다 지정 시 공개 가능 · 조건부 가정', observerRiskAcknowledged, 'warning')],
    cards: [card('host', '호스팅 데이터', hostAcknowledged ? '검토할 신뢰로 선택' : '아직 선택하지 않은 신뢰', '선택하지 않아도 담당 노드의 데이터 취급 자체가 없어지지 않습니다.', blindClaim ? 'warning' : 'neutral'), card('keys', '서명키 통제', keysSeparated ? '별도 축으로 구분' : '구분 필요', '외부 키를 사용한다고 호스팅 노드에 데이터를 숨긴 것은 아닙니다.'), card('observer', '추가 공개 경로', observerRiskAcknowledged ? '설정 위험 검토 선택' : '설정 검토 필요', 'Observer와 계약 참조의 실제 배포 결과를 확인해야 합니다.'), card('scope', '결론의 범위', '업무별 요구와 신뢰를 비교', '이 교육 모델로 전체 기관의 최선의 선택이나 비용 절감을 증명하지 않습니다.', winnerClaim ? 'warning' : 'neutral')],
  };
}
