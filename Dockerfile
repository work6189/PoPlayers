# 멀티 스테이지 빌드를 사용하여 최적화된 이미지 생성
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성 포함, prepare 스크립트 건너뛰기)
RUN npm ci --ignore-scripts

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine AS production

# 작업 디렉토리 설정
WORKDIR /app

# 프로덕션 의존성만 설치 (prepare 스크립트 건너뛰기)
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 포트 설정
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# 비root 사용자 생성 및 권한 설정
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# 애플리케이션 실행 (빌드는 이미 완료되었으므로 serve만 실행)
CMD ["npx", "serve", "dist", "-p", "3000"]