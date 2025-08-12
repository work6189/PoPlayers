# 🐳 Docker를 이용한 Node.js 버전별 테스트 가이드

이 문서는 다양한 Node.js 버전에서 PoPlayers를 테스트하는 방법을 설명합니다.

## 📋 개요

프로젝트는 다음과 같은 Docker 설정을 제공합니다:
- **Dockerfile.test**: 테스트용 Docker 이미지
- **docker-compose.test.yml**: 다중 Node.js 버전 테스트 환경
- **scripts/test-docker.sh**: 테스트 자동화 스크립트

## 🚀 빠른 시작

### 1. 기본 사용법

```bash
# 도움말 확인
./scripts/test-docker.sh help

# Node.js 20에서 개발 서버 실행 (기본값)
./scripts/test-docker.sh dev

# Node.js 18에서 개발 서버 실행
./scripts/test-docker.sh dev 18
```

### 2. 지원하는 Node.js LTS 버전

- **Node.js 18**: `localhost:3018` (LTS)
- **Node.js 20**: `localhost:3020` (LTS, 기본값)
- **Node.js 22**: `localhost:3022` (LTS)

## 🧪 테스트 명령어

### 개발 서버 실행

```bash
# 특정 Node.js LTS 버전에서 개발 서버 실행
./scripts/test-docker.sh dev 18    # Node.js 18 (http://localhost:3018)
./scripts/test-docker.sh dev 20    # Node.js 20 (http://localhost:3020)
./scripts/test-docker.sh dev 22    # Node.js 22 (http://localhost:3022)
```

### 빌드 테스트

```bash
# 특정 LTS 버전에서 빌드 테스트
./scripts/test-docker.sh build 18

# 모든 LTS 버전에서 빌드 테스트
./scripts/test-docker.sh build-all
```

### 코드 품질 검사

```bash
# 테스트 실행
./scripts/test-docker.sh test

# 린터 실행
./scripts/test-docker.sh lint

# 타입 체크 실행
./scripts/test-docker.sh typecheck
```

### 상태 확인 및 정리

```bash
# 실행 중인 컨테이너 상태 확인
./scripts/test-docker.sh status

# Docker 이미지 및 컨테이너 정리
./scripts/test-docker.sh clean
```

## 🛠️ 수동 Docker 명령어

### 개별 서비스 실행

```bash
# Node.js 18에서 개발 서버 실행
docker-compose -f docker-compose.test.yml up --build test-node18

# 백그라운드에서 실행
docker-compose -f docker-compose.test.yml up -d --build test-node18

# 특정 서비스 중지
docker-compose -f docker-compose.test.yml stop test-node18
```

### 프로파일을 사용한 실행

```bash
# 테스트 실행
docker-compose -f docker-compose.test.yml --profile test up --build

# 린터 실행
docker-compose -f docker-compose.test.yml --profile lint up --build

# 모든 LTS 버전에서 빌드 테스트
docker-compose -f docker-compose.test.yml --profile build-test up --build
```

### 커스텀 Node.js 버전

```bash
# 특정 Node.js LTS 버전으로 이미지 빌드 (예: Node.js 18)
docker build -f Dockerfile.test --build-arg NODE_VERSION=18 -t poplayers-test:node18 .

# 커스텀 이미지로 컨테이너 실행
docker run -p 3018:3000 -v $(pwd):/app -v /app/node_modules poplayers-test:node18
```

## 📁 파일 구조

```
project/
├── Dockerfile.test              # 테스트용 Dockerfile
├── docker-compose.test.yml      # 다중 버전 테스트 설정
├── scripts/
│   └── test-docker.sh          # 테스트 자동화 스크립트
└── DOCKER_TESTING.md           # 이 문서
```

## 🔧 설정 세부사항

### Dockerfile.test

- **베이스 이미지**: `node:${NODE_VERSION}-alpine`
- **빌드 인자**: `NODE_VERSION` (기본값: 20)
- **포트**: 3000
- **명령어**: `npm run dev` (개발 모드)
- **볼륨 마운트**: 소스 코드 실시간 반영

### docker-compose.test.yml

- **서비스별 포트 매핑**: Node 버전 + 3000 (예: Node 18 → 3018)
- **볼륨 마운트**: 로컬 소스와 동기화
- **헬스체크**: 자동 상태 모니터링
- **프로파일**: 용도별 서비스 그룹화

## 🚨 문제 해결

### 1. 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :3018

# 포트를 사용하는 프로세스 종료
kill -9 $(lsof -ti:3018)
```

### 2. Docker 이미지 문제

```bash
# 모든 관련 이미지 삭제 후 재빌드
./scripts/test-docker.sh clean
./scripts/test-docker.sh dev 18
```

### 3. node_modules 권한 문제

```bash
# 볼륨 삭제 후 재생성
docker-compose -f docker-compose.test.yml down --volumes
docker-compose -f docker-compose.test.yml up --build test-node18
```

### 4. 메모리 부족

```bash
# Docker 메모리 사용량 확인
docker stats

# 사용하지 않는 컨테이너 정리
docker system prune -a
```

## 🎯 사용 사례

### 1. 새로운 기능 개발

```bash
# Node.js 20에서 개발
./scripts/test-docker.sh dev 20

# 다른 LTS 버전에서 호환성 확인
./scripts/test-docker.sh dev 18
./scripts/test-docker.sh dev 22
```

### 2. 배포 전 검증

```bash
# 모든 LTS 버전에서 빌드 테스트
./scripts/test-docker.sh build-all

# 코드 품질 검사
./scripts/test-docker.sh lint
./scripts/test-docker.sh typecheck
./scripts/test-docker.sh test
```

### 3. 버그 재현

```bash
# 특정 Node.js LTS 버전에서만 발생하는 버그 확인
./scripts/test-docker.sh dev 18  # 다른 LTS 버전에서 확인
./scripts/test-docker.sh dev 20  # 정상 작동하는 버전
```

## 📊 성능 모니터링

### 리소스 사용량 확인

```bash
# 컨테이너별 리소스 사용량
docker stats

# 특정 컨테이너 로그 확인
docker-compose -f docker-compose.test.yml logs test-node18

# 실시간 로그 모니터링
docker-compose -f docker-compose.test.yml logs -f test-node18
```

## 🔗 관련 문서

- [README.md](./README.md) - 프로젝트 개요
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [CHANGELOG.md](./CHANGELOG.md) - 변경사항 기록

## 💡 팁

1. **개발 중에는** 단일 버전(Node.js 20)을 사용하고, **배포 전에** 모든 LTS 버전에서 테스트
2. **볼륨 마운트**로 소스 코드 변경사항이 실시간 반영됨
3. **헬스체크**로 컨테이너 상태를 자동 모니터링
4. **프로파일**을 사용하여 필요한 서비스만 선택적 실행
5. **정기적으로** `./scripts/test-docker.sh clean`으로 불필요한 이미지 정리
