#!/bin/bash

# Node.js 버전별 Docker 테스트 스크립트
# 사용법: ./scripts/test-docker.sh [command] [node-version]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 도움말 표시
show_help() {
    echo "Node.js 버전별 Docker 테스트 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  dev [18|20|22]     - 특정 Node.js 버전으로 개발 서버 실행"
    echo "  test                           - 테스트 실행"
    echo "  lint                           - 린터 실행"
    echo "  typecheck                      - 타입 체크 실행"
    echo "  build [18|20|22]   - 특정 Node.js 버전으로 빌드 테스트"
    echo "  build-all                      - 모든 LTS Node.js 버전에서 빌드 테스트"
    echo "  clean                - Docker 이미지 및 컨테이너 정리"
    echo "  status               - 실행 중인 컨테이너 상태 확인"
    echo ""
    echo "Examples:"
    echo "  $0 dev 18            # Node.js 18에서 개발 서버 실행 (http://localhost:3018)"
    echo "  $0 test              # 테스트 실행"
    echo "  $0 build 20          # Node.js 20에서 빌드 테스트"
    echo "  $0 build-all         # 모든 LTS 버전에서 빌드 테스트"
    echo "  $0 clean             # Docker 정리"
}

# Node.js 버전별 개발 서버 실행
run_dev() {
    local node_version=${1:-20}
    
    # 지원되는 버전 확인
    if [[ ! "$node_version" =~ ^(18|20|22)$ ]]; then
        log_error "지원되지 않는 Node.js 버전입니다: $node_version"
        log_info "지원되는 LTS 버전: 18, 20, 22"
        exit 1
    fi
    
    local port=$((3000 + node_version))
    
    log_info "Node.js ${node_version}에서 개발 서버를 시작합니다..."
    log_info "URL: http://localhost:${port}"
    
    docker-compose -f docker-compose.test.yml up --build test-node${node_version}
}

# 테스트 실행
run_test() {
    log_info "테스트를 실행합니다..."
    docker-compose -f docker-compose.test.yml --profile test up --build test-runner
}

# 린터 실행
run_lint() {
    log_info "린터를 실행합니다..."
    docker-compose -f docker-compose.test.yml --profile lint up --build lint-runner
}

# 타입 체크 실행
run_typecheck() {
    log_info "타입 체크를 실행합니다..."
    docker-compose -f docker-compose.test.yml --profile typecheck up --build typecheck-runner
}

# 특정 버전에서 빌드 테스트
run_build() {
    local node_version=${1:-20}
    
    # 지원되는 버전 확인
    if [[ ! "$node_version" =~ ^(18|20|22)$ ]]; then
        log_error "지원되지 않는 Node.js 버전입니다: $node_version"
        log_info "지원되는 LTS 버전: 18, 20, 22"
        exit 1
    fi
    
    log_info "Node.js ${node_version}에서 빌드를 테스트합니다..."
    docker-compose -f docker-compose.test.yml --profile build-test up --build build-test-node${node_version}
}

# 모든 버전에서 빌드 테스트
run_build_all() {
    local versions=(18 20 22)
    local failed_versions=()
    
    log_info "모든 LTS Node.js 버전에서 빌드를 테스트합니다..."
    
    for version in "${versions[@]}"; do
        log_info "Node.js ${version}에서 빌드 중..."
        
        if docker-compose -f docker-compose.test.yml --profile build-test up --build build-test-node${version}; then
            log_success "Node.js ${version}: 빌드 성공"
        else
            log_error "Node.js ${version}: 빌드 실패"
            failed_versions+=($version)
        fi
        
        # 컨테이너 정리
        docker-compose -f docker-compose.test.yml --profile build-test down
    done
    
    if [ ${#failed_versions[@]} -eq 0 ]; then
        log_success "모든 LTS Node.js 버전에서 빌드가 성공했습니다!"
    else
        log_error "다음 버전에서 빌드가 실패했습니다: ${failed_versions[*]}"
        exit 1
    fi
}

# Docker 정리
clean_docker() {
    log_info "Docker 이미지 및 컨테이너를 정리합니다..."
    
    # 컨테이너 중지 및 제거
    docker-compose -f docker-compose.test.yml down --rmi all --volumes --remove-orphans 2>/dev/null || true
    
    # poplayers 관련 이미지 제거
    docker images | grep poplayers-test | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    
    # 사용하지 않는 이미지 및 볼륨 정리
    docker system prune -f
    
    log_success "Docker 정리가 완료되었습니다."
}

# 컨테이너 상태 확인
check_status() {
    log_info "실행 중인 컨테이너 상태:"
    docker-compose -f docker-compose.test.yml ps
    
    echo ""
    log_info "사용 가능한 LTS 버전 포트:"
    echo "  Node.js 18: http://localhost:3018"
    echo "  Node.js 20: http://localhost:3020"
    echo "  Node.js 22: http://localhost:3022"
}

# 메인 로직
case "${1:-help}" in
    "dev")
        run_dev $2
        ;;
    "test")
        run_test
        ;;
    "lint")
        run_lint
        ;;
    "typecheck")
        run_typecheck
        ;;
    "build")
        run_build $2
        ;;
    "build-all")
        run_build_all
        ;;
    "clean")
        clean_docker
        ;;
    "status")
        check_status
        ;;
    "help"|*)
        show_help
        ;;
esac
