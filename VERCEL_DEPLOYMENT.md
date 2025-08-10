# 🚀 Vercel & 운영 서버 배포 가이드

이 문서는 PoPlayers를 Vercel과 운영 서버에 배포하는 방법을 설명합니다.

## 📋 Vercel 배포

### 1. Vercel 계정 설정

1. **Vercel 계정 생성**: https://vercel.com/signup
2. **GitHub 연동**: GitHub 저장소와 연결
3. **프로젝트 가져오기**: Import Git Repository

### 2. Vercel CLI를 통한 수동 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 초기화
vercel

# 프로덕션 배포
vercel --prod
```

### 3. GitHub Actions 자동 배포

**필요한 Secrets 설정**:
- Repository Settings → Secrets → Actions에서 추가:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

**토큰 가져오기**:
1. Vercel Dashboard → Settings → Tokens → Create Token
2. `vercel --token YOUR_TOKEN` 명령어로 ORG_ID, PROJECT_ID 확인

### 4. 환경 변수 설정 (Vercel Dashboard)

```bash
NODE_ENV=production
```

## 🐳 Docker 운영 서버 배포

### 1. Docker를 사용한 배포

```bash
# 이미지 빌드
docker build -t poplayers .

# 컨테이너 실행
docker run -d -p 3000:3000 --name poplayers-app poplayers

# 로그 확인
docker logs poplayers-app

# 컨테이너 중지
docker stop poplayers-app
```

### 2. Docker Compose를 사용한 배포

```bash
# 서비스 시작
docker-compose up -d

# Nginx 포함 배포
docker-compose --profile nginx up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

### 3. 프로덕션 환경 설정

**환경 변수 파일 (.env)**:
```bash
NODE_ENV=production
PORT=3000
DOMAIN=your-domain.com
```

**SSL 인증서 설정**:
```bash
# Let's Encrypt 사용 예시
mkdir ssl
# SSL 인증서 파일을 ssl/ 디렉토리에 배치
# - cert.pem
# - key.pem
```

## 🌐 운영 서버 직접 배포

### 1. PM2를 사용한 배포

```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start npm --name "video-player" -- start

# 부팅시 자동 시작 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs video-player

# 재시작
pm2 restart video-player

# 중지
pm2 stop video-player
```

### 2. Systemd 서비스 설정

**서비스 파일 생성** (`/etc/systemd/system/video-player.service`):
```ini
[Unit]
Description=Custom Video Player
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/custom-video-player
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

**서비스 관리**:
```bash
# 서비스 활성화
sudo systemctl enable video-player

# 서비스 시작
sudo systemctl start video-player

# 상태 확인
sudo systemctl status video-player

# 재시작
sudo systemctl restart video-player
```

### 3. Nginx 리버스 프록시 설정

**Nginx 설정** (`/etc/nginx/sites-available/video-player`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**설정 활성화**:
```bash
sudo ln -s /etc/nginx/sites-available/video-player /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우

현재 설정된 워크플로우:
- **CI/CD Pipeline** (`.github/workflows/ci.yml`): 테스트 및 NPM 배포
- **Vercel Deploy** (`.github/workflows/vercel.yml`): Vercel 자동 배포
- **Release** (`.github/workflows/release.yml`): 태그 기반 릴리스

### 배포 트리거

1. **자동 배포**:
   ```bash
   git push origin main  # Vercel 프로덕션 배포
   ```

2. **Preview 배포**:
   ```bash
   # PR 생성시 자동으로 Preview 배포 생성
   ```

3. **수동 배포**:
   ```bash
   # GitHub Actions에서 Manual trigger
   ```

## 📊 모니터링 및 로그

### 1. 애플리케이션 모니터링

```bash
# Docker 컨테이너 상태
docker stats video-player

# PM2 모니터링
pm2 monit

# Systemd 로그
journalctl -u video-player -f
```

### 2. 헬스체크

애플리케이션은 다음 엔드포인트에서 헬스체크를 제공합니다:
- `GET /` - 메인 페이지 (200 응답시 정상)
- Docker 헬스체크 자동 실행

### 3. 로그 관리

```bash
# Docker 로그
docker logs -f video-player

# PM2 로그
pm2 logs video-player

# Nginx 로그
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔧 트러블슈팅

### 일반적인 문제

1. **포트 충돌**:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **권한 문제**:
   ```bash
   sudo chown -R $USER:$USER /var/www/custom-video-player
   ```

3. **메모리 부족**:
   ```bash
   # Docker 메모리 제한 설정
   docker run -d -p 3000:3000 -m 512m custom-video-player
   ```

### Vercel 특정 문제

1. **빌드 실패**:
   - `vercel.json` 설정 확인
   - 빌드 로그에서 오류 확인
   - Node.js 버전 호환성 확인

2. **함수 타임아웃**:
   - `vercel.json`에서 `maxDuration` 설정 조정

## 🚀 성능 최적화

### 1. CDN 설정

Vercel은 자동으로 CDN을 제공하지만, 추가 최적화:
```javascript
// vercel.json에서 캐시 헤더 설정
"headers": [
  {
    "source": "/dist/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

### 2. 압축 및 최적화

```bash
# 빌드 최적화
npm run build  # 자동으로 압축 및 최적화 적용
```

### 3. 모니터링 도구

- **Vercel Analytics**: 자동 제공
- **New Relic**: 운영 서버 모니터링
- **DataDog**: 종합 모니터링

## 📞 지원

배포 관련 문제가 발생하면:
1. GitHub Actions 로그 확인
2. Vercel 배포 로그 확인  
3. 서버 로그 확인
4. 네트워크 및 DNS 설정 확인