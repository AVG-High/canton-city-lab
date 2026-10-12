# Canton City Lab — 다른 컴퓨터에서 이어가기

이 비공개 저장소는 2026-10-12에 공개 Canton City Lab **v14** 소스를 보관한 것입니다. 도시 입구의 오른쪽 드래그·역방향 이동, 뉴욕 이미지, BGM, 메뉴형 실습, 역할별 설계, 여섯 교육 미션과 검증 코드를 포함합니다.

현재 공개 사이트: https://canton-city-lab.hojag57.chatgpt.site/

## 실행

본인 GitHub 계정으로 로그인한 환경에서 다음 명령을 실행합니다. 비공개 저장소이므로 GitHub 인증이 필요합니다. Node.js 24 계열을 사용합니다. 이번 Windows 검증 환경의 Node 버전은 24.19.0입니다. nvm을 사용하는 경우 저장소의 .nvmrc로 버전을 선택할 수 있습니다.

```sh
git clone https://github.com/AVG-High/canton-city-lab.git
cd canton-city-lab
npm ci
npm run build
npm test
npm run dev
```

개발 서버: http://127.0.0.1:4327/ . Node 테스트 중 배포 경계 검사는 dist를 읽으므로 **build 다음에 test**를 실행합니다. main이 최신 코드입니다. 파일을 수정한 뒤 build와 test를 확인하고 커밋·push하면 다른 컴퓨터에서 이어갈 수 있습니다.

## 포함한 버전

- v13: 드래그 입력 변경 전 공개 프런트엔드 소스. 원래 Sites 소스의 checkpoint/canton-city-lab-v13-20261008에서 보관했습니다.
- v14: 오른쪽 드래그와 가로·세로 트랙패드 스크롤을 지원하는 공개 소스와 이 저장소의 인수인계 문서.
- main: v14. v13과 v14는 Git 태그로 확인할 수 있습니다. 해당 태그는 프런트엔드 소스이며, 로컬 원본 앱 전체를 포함한 별도 ZIP 롤백 보관본과는 범위가 다릅니다.

원본 소스 커밋: 86212ea7931a746ca1f9bfb6ca456c54db4f02c5 . SOURCE_MANIFEST.json은 원본의 경로·SHA-256과 이 GitHub 보관본에서 추가·변경한 인수인계 파일을 기록합니다. .openai/hosting.json은 기존 Sites 프로젝트 ID만 보관하며 자격 증명이 아닙니다.

## 실습과 실제 원장 구분

이 사이트는 **REFERENCE_ONLY 교육용 프런트엔드**입니다. 실제 Canton·Ganache·DevNet·TestNet·MainNet에 연결하지 않고 거래나 실제 프라이버시 증거를 만들지 않습니다. 퀴즈 정답과 XP도 교육 진행 상태입니다. 별도의 로컬 실제 원장 앱과 V1 보관본은 이 저장소에 포함하지 않았습니다.

학습 진행은 브라우저 localStorage에 저장되므로 다른 컴퓨터에 자동으로 옮겨지지 않습니다. BGM은 방문 시 꺼져 있고 직접 재생합니다. 이미지 원본 해상도와 재샘플링된 제공 크기는 ASSETS.md와 docs의 설명을 확인합니다.

## 게시

이 저장소로 push하는 것은 소스 보관이며 기존 공개 사이트를 자동으로 바꾸지 않습니다. 다시 게시할 때는 동일한 Sites 프로젝트의 지원되는 저장·배포 흐름을 사용합니다. GitHub 저장소는 비공개이며 기존 공개 웹사이트의 접근 설정은 변경하지 않았습니다.

## 검증 범위

공개 v14의 기존 기록: 온라인 자동 검사 36/36, 원본 관련 검사 35/35, 양쪽 TypeScript/Vite 빌드 통과, Chrome 로컬 입력 9/9·공개 확인 3/3. 이번 보관본도 새로 의존성을 설치한 뒤 build와 test를 확인합니다. 실제 MacBook Safari·iPhone Safari의 기기 검증은 아직 아닙니다. docs/ENTRY_INPUT.md와 docs/entry-input-browser.json에 입력 검증 범위가 있습니다.

환경변수, 비밀키·토큰, 런타임 개인 상태, node_modules, dist, Sites 저장소의 Git 메타데이터는 제외했습니다. 아트워크와 음원 출처·이용 조건은 기존 ASSETS.md와 음악 설정의 설명을 유지합니다.
