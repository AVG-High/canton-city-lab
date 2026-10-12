/** Document-based learning puzzles. These answers never represent ledger observations. */
export const CURRICULUM_MODE = 'REFERENCE_ONLY' as const;

export type MissionId = 'boundary' | 'atomic' | 'visibility' | 'audit' | 'public' | 'trust';

export interface Mission {
  id: MissionId;
  title: string;
  englishTitle: string;
  district: string;
  description: string;
  briefing: string;
  objective: string;
  concept: string;
  reward: number;
  options: {id: string; label: string; description: string}[];
  correct: string[];
  success: string;
  hint: string;
}

export interface GameProgress {
  version: 1;
  completed: MissionId[];
  callsign: string;
  avatar: number;
}

export const missions: Mission[] = [
  {
    id: 'boundary', title: '거래정보의 수신자', englishTitle: 'INFORMATION BOUNDARIES', district: '01 · 정보 배포',
    description: '거래 당사자와 감사자가 받아야 할 정보를 구분합니다.',
    briefing: '운용사 A의 테스트 채권 100단위와 은행 B의 테스트 현금 10,000단위를 교환합니다. 이 수업의 공개 정책은 원본 거래계약을 A·B에게, 별도 감사자료를 C에게 제공하는 것입니다. 거래와 무관한 D는 원본의 수신자에서 제외합니다.',
    objective: '설계한 공개 정책에 따라 원본 거래계약을 받을 당사자 2명을 선택하세요.',
    concept: '계약별 정보 배포', reward: 100,
    options: [
      {id: 'seller', label: '운용사 A · 매도자', description: '채권을 넘기고 테스트 현금을 받는 거래 당사자.'},
      {id: 'buyer', label: '은행 B · 매수자', description: '테스트 현금을 지급하고 채권을 받는 거래 당사자.'},
      {id: 'auditor', label: '감사자 C', description: '필요한 거래 요약을 별도 감사계약으로 받는 역할.'},
      {id: 'outsider', label: '무관한 기관 D', description: '이번 거래나 감사계약에 참여하지 않는 역할.'},
    ],
    correct: ['seller', 'buyer'],
    success: '원본은 A·B에게, 필요한 감사자료는 별도 계약으로 C에게 제공하는 설계입니다. Observer를 추가해도 같은 계약의 필드가 자동으로 가려지지는 않습니다.',
    hint: '지금 선택할 대상은 원본 거래계약의 수신자입니다. C의 감사자료는 별도 계약입니다. 실제 배포 여부는 실습의 조회 근거로 확인해야 합니다.',
  },
  {
    id: 'atomic', title: '채권과 대금의 공동 결제', englishTitle: 'ATOMIC SETTLEMENT', district: '02 · 원자적 결제',
    description: '두 자산을 함께 확정하고, 실패하면 모두 되돌리는 조건을 살펴봅니다.',
    briefing: '교육 상황에서는 A·B의 동의와 자산 준비가 끝났습니다. 다음 단계는 채권 100단위와 테스트 현금 10,000단위의 최종 교환입니다. 자산 준비와 결제 완료는 다릅니다. 한쪽만 이전된 상태가 남지 않도록 교환 구조와 실패 처리를 함께 정합니다.',
    objective: '원자적인 최종 교환에 필요한 조건 2개를 선택하세요.',
    concept: '최종 교환의 원자성', reward: 100,
    options: [
      {id: 'one-transaction', label: '두 자산 이전을 하나의 최종 거래에 묶기', description: '채권과 대금이 같은 최종 거래에서 함께 확정됩니다.'},
      {id: 'rollback-both', label: '최종 거래 실패 시 두 이전 모두 되돌리기', description: '어느 한쪽만 이전된 상태가 최종 결과로 남지 않아야 합니다.'},
      {id: 'separate-transfers', label: '채권을 먼저 보내고 대금은 나중에 보내기', description: '서로 별개로 확정되는 두 송금을 순서대로 요청합니다.'},
      {id: 'canton-only', label: 'Canton이라는 이름만으로 원자성을 보장하기', description: '계약 구현이나 실패 조건은 검사하지 않습니다.'},
    ],
    correct: ['one-transaction', 'rollback-both'],
    success: '두 이전을 함께 확정하고, 실패하면 모두 되돌리는 설계입니다. 올바르게 구현한 EVM도 가능한 방식입니다. 실제 원자성은 성공·실패 거래의 전후 자산으로 검증합니다.',
    hint: '독립 송금 두 번이면 첫 송금만 끝날 수 있습니다. 최종 교환을 하나로 묶는 조건과 실패 시 전체를 되돌리는 조건이 모두 필요합니다.',
  },
  {
    id: 'visibility', title: '빈 응답을 해석하는 근거', englishTitle: 'VERIFY THE OBSERVATION', district: '03 · 조회 검증',
    description: '자료 미반환과 조회 실패를 구분하는 확인 항목을 익힙니다.',
    briefing: 'Canton의 외부 관찰자 D에게 거래 이력이 반환되지 않았다는 교육 예시입니다. 빈 화면만으로 비공개 성공을 판단할 수는 없습니다. D의 정상 인증과 조회, 대상 거래의 존재, 완료된 조회 범위를 함께 확인해야 합니다.',
    objective: '비공개 관측을 해석할 때 함께 필요한 확인 항목 4개를 선택하세요.',
    concept: '부재 관측과 정상 조회의 근거', reward: 100,
    options: [
      {id: 'empty-result', label: 'D의 응답에 대상 거래가 없음', description: 'D의 실제 권한으로 받은 응답을 확인합니다.'},
      {id: 'valid-auth', label: 'D의 인증과 정상 조회 확인', description: '유효한 D 자격과 조회 대조군으로 경로가 작동했는지 확인합니다.'},
      {id: 'target-exists', label: '대상 거래가 실제로 존재함', description: '권한 있는 별도 검증 경로로 거래의 존재를 확인합니다.'},
      {id: 'query-complete', label: '해당 거래를 포함하는 조회 범위 완료', description: '필요한 이력 구간까지 동기화와 조회를 마쳤는지 확인합니다.'},
      {id: 'timeout', label: '요청이 시간 초과됨', description: '서버가 응답하지 않았으므로 비공개 성공으로 기록합니다.'},
    ],
    correct: ['empty-result', 'valid-auth', 'target-exists', 'query-complete'],
    success: '빈 응답, 정상 인증·조회, 대상 존재, 완료된 범위가 모두 필요한 확인 항목입니다. 결론은 그 구성과 범위에만 한정됩니다. 별도 경로의 존재 확인 자료와 D가 받은 자료는 구분해야 합니다.',
    hint: '시간 초과는 조회 실패입니다. 거래가 없다는 응답에 더해, 정상 인증으로 실제 거래가 있는 범위를 끝까지 조회했다는 근거가 필요합니다.',
  },
  {
    id: 'audit', title: '감사와 실행 권한의 분리', englishTitle: 'READ WITHOUT CONTROL', district: '04 · 감사 권한',
    description: '승인된 자료의 열람과 자산 이전 권한을 따로 설계합니다.',
    briefing: 'A가 승인한 거래자료를 별도 계약으로 감사자 C에게 제공합니다. C는 거래의 조건과 결과를 읽어야 하지만 자산을 이전할 권한은 없습니다. 이후 접근권한을 제거하더라도 C가 이미 저장한 사본의 삭제를 보장하지는 않습니다.',
    objective: '감사자 C의 역할에 맞는 정책 2개를 선택하세요.',
    concept: '열람과 실행 권한의 분리', reward: 100,
    options: [
      {id: 'read-audit', label: '승인된 별도 감사자료 열람', description: 'C가 이번 거래에 대해 제공받은 자료를 확인합니다.'},
      {id: 'no-transfer', label: '자산 이전 실행 권한은 부여하지 않음', description: 'C의 이전 시도는 권한 거절되고 자산이 보존되어야 합니다.'},
      {id: 'read-means-transfer', label: '자료를 읽으면 자산 이전도 자동 허용', description: '조회 권한을 실행 권한으로 간주합니다.'},
      {id: 'erase-copies', label: '접근권한 제거로 기존 사본도 삭제', description: 'C가 이미 저장한 자료까지 없어졌다고 가정합니다.'},
    ],
    correct: ['read-audit', 'no-transfer'],
    success: '자료는 열람하되 자산은 이전하지 못하도록 권한을 분리한 설계입니다. EVM에서도 실행 권한을 나눌 수 있습니다. Canton의 계약 공개 범위도 함께 설계하고, 실습에서 실제 거절과 자산 보존을 확인합니다.',
    hint: '열람과 실행은 별도의 권한입니다. 필요한 자료의 조회만 허용하는 조건을 선택하세요. 접근권한 변경으로 이미 받은 사본까지 삭제할 수는 없습니다.',
  },
  {
    id: 'public', title: '공개 원장의 조회 경로', englishTitle: 'PUBLIC LEDGER ACCESS', district: '05 · 공개 EVM',
    description: '앱 로그인과 공개 원장 데이터의 읽기 경로를 구분합니다.',
    briefing: '같은 거래를 기밀성 계층 없는 일반 공개 ERC-20 앱에서 살펴봅니다. 화면에 로그인을 요구해도 Transfer 이벤트와 balanceOf 조회 경로는 남습니다. 이 수업에서 사용하는 회사명과 주소의 연결은 교육용 가상 매핑입니다.',
    objective: '이 구성의 데이터 공개에 관한 올바른 설명 2개를 선택하세요.',
    concept: '앱의 접근제어와 공개 원장', reward: 100,
    options: [
      {id: 'login-not-privacy', label: '앱 로그인만으로 원장 데이터를 감출 수 없음', description: '화면 접근제어는 이미 공개된 데이터의 배포 범위를 바꾸지 않습니다.'},
      {id: 'independent-rpc', label: '독립 RPC로 토큰 이동과 잔고 조회 가능', description: '일반적인 공개 구현의 이벤트와 잔고를 별도 경로로 읽을 수 있습니다.'},
      {id: 'evm-never-private', label: '모든 EVM 구성은 기밀성을 제공할 수 없음', description: '기밀성 계층을 추가한 다른 구성도 모두 같다고 결론냅니다.'},
      {id: 'address-is-identity', label: '주소만 보이면 실제 회사명도 자동 확인됨', description: '별도의 주소·기관 연결 근거 없이 실명을 확정합니다.'},
    ],
    correct: ['login-not-privacy', 'independent-rpc'],
    success: '앱 화면을 숨겨도 일반 공개 ERC-20은 별도로 조회할 수 있습니다. 이 결론은 이번 구성에 한정됩니다. 기밀성을 보완한 EVM이나 주소의 실제 소유자까지 확인한 것은 아닙니다.',
    hint: '검토 대상은 기밀성 계층 없는 공개 ERC-20 앱입니다. 앱의 로그인과 원장의 읽기 경로를 구분하고, 다른 모든 EVM 구성으로 결론을 확대하지 않습니다.',
  },
  {
    id: 'trust', title: '운영자와 남아 있는 신뢰', englishTitle: 'REMAINING TRUST', district: '06 · 운영 신뢰',
    description: '정보를 보호하는 구성에서도 필요한 운영자·키·설정의 신뢰를 확인합니다.',
    briefing: 'D를 원본 계약 수신자에서 제외해도 운영에 필요한 신뢰는 남습니다. Party 호스팅 노드의 데이터 취급, 서명키 관리자, Observer 설정을 따로 살펴봅니다. 실제 로컬 실험의 Participant들은 같은 JVM과 호스트를 공유합니다.',
    objective: '운영과 공개 정책 검토서에 남겨야 할 설명 3개를 선택하세요.',
    concept: '호스팅·키 통제·추가 공개', reward: 100,
    options: [
      {id: 'host-data', label: '호스팅 노드는 담당 Party의 데이터를 취급', description: '외부 관찰자에게 비공개여도 담당 노드 운영자에 대한 신뢰는 남습니다.'},
      {id: 'keys-separate', label: '서명키 통제와 데이터 가시성은 별도', description: '외부 서명키를 쓴다고 호스팅 노드의 데이터 취급이 없어지는 것은 아닙니다.'},
      {id: 'observer-risk', label: '불필요한 Observer와 계약 참조는 추가 공개 위험', description: '계약 관계와 실행 과정에서 전달되는 범위를 검토해야 합니다.'},
      {id: 'operator-blind', label: 'Canton이면 모든 운영자도 내용을 볼 수 없음', description: '호스팅 구조와 별도 검증 없이 운영자 비가시성을 확정합니다.'},
      {id: 'always-best', label: '이 퍼즐을 풀었으니 모든 기관에 Canton이 최선', description: '단일 교육 시나리오로 기술 선정과 비용 절감까지 결론냅니다.'},
    ],
    correct: ['host-data', 'keys-separate', 'observer-risk'],
    success: '선택적 공개에도 운영자·키 관리·계약 설정의 신뢰가 남습니다. 교육 완료는 보안 인증이나 실제 원장 검증이 아닙니다. 다음에는 원장 실습에서 같은 거래를 실행하고 근거를 수집합니다.',
    hint: '호스팅 운영자, 키 관리자, 계약 설정을 각각 검토하세요. 제품 이름이나 학습 점수만으로 모든 주체에게 기밀성이 보장되지는 않습니다.',
  },
];

export function evaluateMission(id: MissionId, selected: string[]): {correct: boolean; message: string} {
  const mission = missions.find(item => item.id === id);
  if (!mission) return {correct: false, message: '존재하지 않는 교육 미션입니다.'};
  const answers = new Set(Array.isArray(selected) ? selected : []);
  const correct = answers.size === mission.correct.length && mission.correct.every(answer => answers.has(answer));
  return {correct, message: correct ? `교육 퍼즐 정답입니다. ${mission.success}` : `조건을 다시 살펴보세요. ${mission.hint}`};
}

export function normalizeProgress(input: unknown): GameProgress {
  const source = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown> : {};
  const stored = source.version === 1 && Array.isArray(source.completed) ? new Set(source.completed) : new Set();
  const completed: MissionId[] = [];
  for (const mission of missions) {
    if (!stored.has(mission.id)) break;
    completed.push(mission.id);
  }
  const cleaned = typeof source.callsign === 'string'
    ? source.callsign.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, ' ').replace(/\s+/gu, ' ').trim()
    : '';
  return {
    version: 1,
    completed,
    callsign: [...cleaned].slice(0, 16).join('').trim() || 'GHOST-01',
    avatar: typeof source.avatar === 'number' && Number.isInteger(source.avatar) && source.avatar >= 0 && source.avatar <= 3 ? source.avatar : 0,
  };
}

export function isUnlocked(progress: GameProgress, id: MissionId): boolean {
  const index = missions.findIndex(mission => mission.id === id);
  return index >= 0 && index <= normalizeProgress(progress).completed.length;
}

export function getXp(progress: GameProgress): number {
  const completed = new Set(normalizeProgress(progress).completed);
  return missions.reduce((total, mission) => total + (completed.has(mission.id) ? mission.reward : 0), 0);
}

export function completeMission(progress: GameProgress, id: MissionId, selected: string[]): {
  progress: GameProgress; correct: boolean; message: string; awarded: number;
} {
  const normalized = normalizeProgress(progress);
  if (!isUnlocked(normalized, id)) {
    return {progress: normalized, correct: false, message: '앞선 수업을 완료하면 이 수업을 시작할 수 있습니다.', awarded: 0};
  }
  const evaluation = evaluateMission(id, selected);
  const mission = missions.find(item => item.id === id);
  if (!evaluation.correct || !mission || normalized.completed.includes(id)) {
    return {progress: normalized, ...evaluation, awarded: 0};
  }
  return {
    progress: {...normalized, completed: [...normalized.completed, id]},
    ...evaluation,
    awarded: mission.reward,
  };
}
