export const references = [
  {name:'Zcash', category:'비공개 송금 · 조회 키', symbol:'Z', title:'어떤 조회 키를 공유하느냐가 중요합니다.', body:'Incoming Viewing Key와 Full Viewing Key는 조회 범위가 다릅니다. 조회 키 공유를 거래 실행 권한과 구분해야 합니다. 이 앱은 Zcash의 채권·현금 교환을 실행하거나 검증하지 않았습니다.', url:'https://zips.z.cash/zip-0316', source:'ZIP 316 · Unified Viewing Keys', checked:'2026-09-15'},
  {name:'Monero', category:'비공개 송금 · 조회 전용 지갑', symbol:'M', title:'조회 전용 지갑도 감사의 한 경로입니다.', body:'조회 전용 지갑으로 들어오는 거래를 볼 수 있습니다. 지출을 반영한 잔액 파악에는 key image 같은 추가 정보가 필요합니다. 공개할 증거와 범위를 따져야 하며, 여기서는 실제 송금을 실행하지 않았습니다.', url:'https://www.getmonero.org/resources/user-guides/view_only.html', source:'Monero · View Only Wallets', checked:'2026-09-15'},
  {name:'Prividium', category:'프라이버시를 강화한 EVM', symbol:'P', title:'EVM에서도 기밀성을 보완할 수 있습니다.', body:'Prividium은 비공개 거래 데이터, 역할별 접근과 Ethereum에 제출하는 증명을 결합하는 구성을 설명합니다. 이번 일반 공개 ERC-20 실험과는 별도의 대안이며, 동일한 거래를 실행하는 후속 검증이 필요합니다.', url:'https://docs.zksync.io/zk-stack/prividium/overview', source:'ZKsync · Prividium Overview', checked:'2026-09-15'},
  {name:'Privacy Pools', category:'프라이버시 풀 · 집합 증명', symbol:'○', title:'증명하는 명제가 다른 구조입니다.', body:'ASP는 승인된 입금 라벨 집합을 관리하고 출금 시 포함 증명에 필요한 정보를 제공합니다. 집합 운영자에 대한 신뢰와 정책을 함께 살펴야 합니다. 이 설명은 법적 적합성 판정이 아니며 실제 연결은 하지 않습니다.', url:'https://docs.privacypools.com/layers/asp', source:'Privacy Pools · ASP Layer', checked:'2026-09-15'},
];
export const cantonSource = 'https://docs.canton.network/overview/learn/privacy-model';
export const trustSource = 'https://docs.canton.network/overview/learn/trust-model';
