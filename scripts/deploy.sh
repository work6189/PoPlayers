#!/bin/bash

# 배포 스크립트
set -e

echo "🚀 Custom Video Player 배포 시작..."

# 버전 확인
VERSION=$(node -p "require('./package.json').version")
echo "📦 버전: v$VERSION"

# 빌드
echo "🔨 프로젝트 빌드 중..."
npm run build

# 파일 검증
if [ ! -f "dist/player.min.js" ] || [ ! -f "dist/player.css" ]; then
    echo "❌ 빌드 파일이 없습니다."
    exit 1
fi

echo "✅ 빌드 완료!"

# NPM 배포 (선택사항)
read -p "NPM에 배포하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 NPM 배포 중..."
    npm publish
    echo "✅ NPM 배포 완료!"
fi

# CDN 배포 (선택사항)
read -p "CDN에 배포하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 CDN 배포 중..."
    
    # 여기에 CDN 배포 로직 추가
    # 예: AWS S3, CloudFlare, GitHub Pages 등
    
    # AWS S3 예시:
    # aws s3 sync dist/ s3://your-cdn-bucket/v$VERSION/
    # aws s3 sync dist/ s3://your-cdn-bucket/latest/
    
    # GitHub Pages 예시:
    # git subtree push --prefix dist origin gh-pages
    
    echo "✅ CDN 배포 완료!"
fi

echo "🎉 배포가 완료되었습니다!"
echo "📍 NPM: https://www.npmjs.com/package/custom-video-player"
echo "📍 CDN: https://unpkg.com/custom-video-player@$VERSION/dist/"