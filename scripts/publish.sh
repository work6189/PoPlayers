#!/bin/bash

# NPM 패키지 배포 스크립트
set -e

echo "🚀 NPM 패키지 배포를 시작합니다..."

# 현재 브랜치 확인
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  경고: main/master 브랜치가 아닙니다. 현재 브랜치: $CURRENT_BRANCH"
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 배포가 취소되었습니다."
        exit 1
    fi
fi

# Git 상태 확인
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  경고: 커밋되지 않은 변경사항이 있습니다."
    git status --short
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 배포가 취소되었습니다."
        exit 1
    fi
fi

# NPM 로그인 상태 확인
echo "🔐 NPM 로그인 상태를 확인합니다..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ NPM에 로그인되어 있지 않습니다."
    echo "다음 명령어로 로그인하세요: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ NPM 사용자: $NPM_USER"

# 패키지 이름 확인
PACKAGE_NAME=$(node -p "require('./package.json').name")
echo "📦 패키지 이름: $PACKAGE_NAME"

# 패키지 이름 중복 확인
echo "🔍 패키지 이름 중복을 확인합니다..."
if npm view "$PACKAGE_NAME" > /dev/null 2>&1; then
    echo "⚠️  경고: '$PACKAGE_NAME' 패키지가 이미 존재합니다."
    echo "package.json에서 패키지 이름을 변경하거나 스코프를 사용하세요."
    echo "예: @your-username/poplayers"
    exit 1
fi

# 버전 정보
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 현재 버전: $CURRENT_VERSION"

# 버전 업데이트 옵션
echo ""
echo "버전을 업데이트하시겠습니까?"
echo "1) patch (버그 수정): $CURRENT_VERSION -> $(npm version patch --dry-run | cut -d'v' -f2)"
echo "2) minor (새 기능): $CURRENT_VERSION -> $(npm version minor --dry-run | cut -d'v' -f2)"
echo "3) major (호환성 변경): $CURRENT_VERSION -> $(npm version major --dry-run | cut -d'v' -f2)"
echo "4) 현재 버전 유지"
echo ""
read -p "선택하세요 (1-4): " -n 1 -r VERSION_CHOICE
echo

case $VERSION_CHOICE in
    1)
        NEW_VERSION=$(npm version patch)
        echo "✅ 패치 버전으로 업데이트: $NEW_VERSION"
        ;;
    2)
        NEW_VERSION=$(npm version minor)
        echo "✅ 마이너 버전으로 업데이트: $NEW_VERSION"
        ;;
    3)
        NEW_VERSION=$(npm version major)
        echo "✅ 메이저 버전으로 업데이트: $NEW_VERSION"
        ;;
    4)
        echo "✅ 현재 버전 유지: $CURRENT_VERSION"
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

# 테스트 실행
echo "🧪 테스트를 실행합니다..."
npm test

# 린트 검사
echo "🔍 린트 검사를 실행합니다..."
npm run lint

# 타입 체크
echo "📝 타입 체크를 실행합니다..."
npm run type-check

# 빌드
echo "🔨 프로덕션 빌드를 실행합니다..."
npm run build

# 빌드 파일 확인
if [ ! -f "dist/poplayers.min.js" ] || [ ! -f "dist/poplayers.css" ]; then
    echo "❌ 빌드 파일이 생성되지 않았습니다."
    exit 1
fi

echo "✅ 빌드 완료!"

# 패키지 크기 확인
echo "📊 패키지 크기를 확인합니다..."
du -sh dist/

# 최종 확인
echo ""
echo "🚀 배포 준비가 완료되었습니다!"
echo "패키지: $PACKAGE_NAME"
echo "버전: $(node -p "require('./package.json').version")"
echo ""
read -p "NPM에 배포하시겠습니까? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 NPM에 배포 중..."
    
    # 드라이런 먼저 실행
    echo "🔍 드라이런을 실행합니다..."
    npm publish --dry-run
    
    echo ""
    read -p "실제로 배포하시겠습니까? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 실제 배포
        npm publish
        
        FINAL_VERSION=$(node -p "require('./package.json').version")
        echo ""
        echo "🎉 배포가 완료되었습니다!"
        echo "📦 패키지: https://www.npmjs.com/package/$PACKAGE_NAME"
        echo "📋 버전: $FINAL_VERSION"
        echo "📍 CDN: https://unpkg.com/$PACKAGE_NAME@$FINAL_VERSION/dist/"
        
        # Git 태그 푸시 (버전이 업데이트된 경우)
        if [ "$VERSION_CHOICE" != "4" ]; then
            echo "🏷️  Git 태그를 푸시합니다..."
            git push origin --tags
        fi
        
    else
        echo "❌ 배포가 취소되었습니다."
    fi
else
    echo "❌ 배포가 취소되었습니다."
fi