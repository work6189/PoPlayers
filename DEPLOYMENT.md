# 🚀 Deployment Guide

이 문서는 PoPlayers 패키지를 NPM에 배포하는 방법을 설명합니다.

## 📋 사전 준비

### 1. NPM 토큰 설정

1. **NPM 토큰 생성**:
   ```bash
   npm login
   # 또는 https://www.npmjs.com/ 에서 Access Token 생성
   ```

2. **GitHub Secrets 설정**:
   - Repository Settings → Secrets and variables → Actions
   - `NPM_TOKEN` 추가 (Automation 타입 토큰 사용)

### 2. 패키지 정보 업데이트

`package.json`에서 다음 정보를 실제 값으로 변경:


## 🎯 배포 방법

### 방법 1: 자동 태그 기반 배포 (권장)

```bash
# 패치 버전 릴리스 (1.0.0 → 1.0.1)
npm run release:patch

# 마이너 버전 릴리스 (1.0.0 → 1.1.0)
npm run release:minor

# 메이저 버전 릴리스 (1.0.0 → 2.0.0)
npm run release:major

# 프리릴리스 버전 (1.0.0 → 1.0.1-0)
npm run release:prerelease
```

**동작 과정**:
1. `package.json` 버전 업데이트
2. Git 태그 생성 및 푸시
3. GitHub Actions가 자동으로 감지
4. 테스트, 빌드, NPM 배포 실행
5. GitHub Release 생성

### 방법 2: 커밋 메시지 기반 배포

```bash
git add .
git commit -m "feat: add new feature [release]"
git push origin main
```

**트리거 키워드**:
- `[release]`
- `[publish]`

### 방법 3: 수동 배포

```bash
# 로컬에서 직접 배포
npm run publish:npm

# 또는 GitHub Actions 수동 실행
# Repository → Actions → CI/CD Pipeline → Run workflow
```

## 📊 배포 프로세스

### GitHub Actions 워크플로우

1. **CI/CD Pipeline** (`.github/workflows/ci.yml`):
   - 모든 푸시에서 테스트 실행
   - main 브랜치에서 배포 조건 확인
   - 커밋 메시지에 `[release]` 포함시 배포

2. **Release Workflow** (`.github/workflows/release.yml`):
   - 태그 푸시시 자동 실행
   - 버전 검증 및 중복 체크
   - NPM 배포 및 GitHub Release 생성

### 배포 단계

1. **사전 검증**:
   - 버전 중복 확인
   - 테스트 실행
   - 린트 검사
   - 타입 체크

2. **빌드 및 배포**:
   - 프로덕션 빌드
   - NPM 배포 (스코프 패키지 자동 감지)
   - 아티팩트 업로드

3. **릴리스 생성**:
   - GitHub Release 생성
   - 자동 changelog 생성
   - CDN 링크 포함

## 🔧 트러블슈팅

### 일반적인 문제

1. **NPM_TOKEN 오류**:
   ```bash
   # 토큰 권한 확인
   npm whoami
   
   # 새 토큰 생성 (Automation 타입)
   npm token create --type=automation
   ```

2. **버전 충돌**:
   ```bash
   # 현재 NPM 버전 확인
   npm view @work6189/poplayer version
   
   # 로컬 버전 확인
   npm version
   ```

3. **스코프 패키지 권한**:
   ```bash
   # 퍼블릭 배포 권한 설정
   npm publish --access public
   ```

### GitHub Actions 디버깅

1. **워크플로우 로그 확인**:
   - Repository → Actions → 실패한 워크플로우 클릭
   - 각 단계별 로그 확인

2. **시크릿 확인**:
   - Repository Settings → Secrets and variables → Actions
   - `NPM_TOKEN`이 올바르게 설정되어 있는지 확인

## 📈 배포 후 확인

### 1. NPM 패키지 확인
```bash
# 패키지 정보 확인
npm view @work6189/poplayer

# 설치 테스트
npm install @work6189/poplayer
```

### 2. CDN 링크 확인
- https://unpkg.com/@work6189/poplayer@latest/
- https://cdn.jsdelivr.net/npm/@work6189/poplayer@latest/

### 3. GitHub Release 확인
- Repository → Releases에서 새 릴리스 확인
- 자동 생성된 changelog 검토

## 📝 베스트 프랙티스

1. **시맨틱 버전 관리**:
   - `patch`: 버그 수정
   - `minor`: 새 기능 추가 (하위 호환)
   - `major`: 호환성 변경

2. **커밋 메시지 규칙**:
   ```
   feat: 새 기능
   fix: 버그 수정
   docs: 문서 변경
   style: 코드 스타일 변경
   refactor: 코드 리팩토링
   test: 테스트 추가/수정
   chore: 빌드/설정 변경
   ```

3. **배포 전 체크리스트**:
   - [ ] 모든 테스트 통과
   - [ ] 문서 업데이트
   - [ ] CHANGELOG.md 업데이트
   - [ ] 버전 번호 확인
   - [ ] 브랜치 상태 확인

## 🔄 롤백 가이드

NPM에서는 배포된 버전을 삭제할 수 없으므로, 문제 발생시 새 버전으로 수정해야 합니다:

```bash
# 긴급 패치 배포
npm run release:patch

# 또는 수동으로
npm version patch
git push --follow-tags
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. GitHub Actions 로그
2. NPM 패키지 상태
3. 토큰 권한 및 만료일
4. 네트워크 연결 상태