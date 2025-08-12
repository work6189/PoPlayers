# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.32] - 2025-12-28

### Improved
- Docker 테스트 환경을 LTS 버전으로 최적화
  - Node.js LTS 버전만 지원 (18, 20, 22)
  - 비 LTS 버전(16, 21, 23, 24) 제거로 안정성 향상
- 진행바 핸들 UX 개선
  - 마우스 호버 시 핸들 동적 위치 표시
  - 드래그 중 핸들 크기 확대 효과
  - 마우스 벗어남 시 자동 숨김 처리
- 진행바 핸들 정확한 중앙 정렬 (`translateX(-50%)` 추가)
- 핸들 z-index 개선으로 상호작용 향상

### Fixed
- Docker 빌드 시 `npm ci` 실패 문제 해결
  - `--ignore-scripts` 옵션 추가로 prepare 스크립트 건너뛰기
  - 네이티브 모듈 빌드를 위한 시스템 의존성 추가
- 진행바 핸들 위치 정확성 개선
- 마우스 호버 중 핸들 위치 업데이트 로직 최적화

### Changed
- Node.js 엔진 요구사항을 18.0.0 이상으로 명시
- CI/CD 파이프라인에 Node.js 22.x 추가
- Docker 테스트 스크립트 LTS 버전 전용으로 개선
- DOCKER_TESTING.md 문서 LTS 버전 정보로 업데이트

### Removed
- Vercel 배포 관련 파일 및 설정 제거
- 불필요한 배포 스크립트 정리
- Docker 설정에서 비 LTS Node.js 버전 지원 중단

## [1.0.31] - 2025-08-11

### Fixed
- 배포 스크립트 버그 수정
- README.md 문서 개선
- NPM 배포 관련 설정 수정

### Changed
- package.json 설정 최적화

## [1.0.3] - 2025-08-10

### Fixed
- ESLint 설정 개선
- 코드 품질 향상
- NPM 배포 준비 완료

### Changed
- 컴포넌트 명칭 정리

## [1.0.2] - 2025-08-10

### Fixed
- 버전 관리 스크립트 수정
- package.json 버전 업데이트 로직 개선

### Added
- Docker 설정 개선
- Vercel 배포 설정 추가

## [1.0.1] - 2025-08-10

### Fixed
- ESLint 규칙 개선
- TypeScript 타입 안전성 강화
- 컴포넌트 내부 로직 최적화

### Changed
- 컨트롤 버튼 텍스트 개선

## [1.0.0] - 2025-08-05

### Added
- 초기 릴리스
- HTML5 비디오 플레이어 코어 기능
- TypeScript 지원
- 완전한 재생 컨트롤 (재생/일시정지, 진행바, 볼륨, 전체화면)
- 키보드 단축키 지원
- 다양한 테마 (기본, 다크, 라이트)
- 반응형 디자인
- 이벤트 시스템
- CDN 및 NPM 배포 지원
- 접근성 기능
- 고대비 모드 지원
- 애니메이션 감소 모드 지원

### Features
- 재생 속도 조절
- 볼륨 컨트롤
- 전체화면 모드
- 진행바 드래그 앤 드롭
- 자동 숨김 컨트롤
- 다중 비디오 소스 지원
- 포스터 이미지 지원
- 미리 로드 옵션
- 반복 재생
- 자동 재생

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## [Unreleased]

### Planned
- HLS 스트리밍 지원
- DASH 스트리밍 지원
- 자막 지원
- 플레이리스트 기능
- 화질 선택 기능
- 플러그인 시스템
- 더 많은 테마 옵션
- 모바일 제스처 지원