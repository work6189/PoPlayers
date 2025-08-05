# Custom Video Player

jwplayer와 같은 현대적이고 커스터마이징 가능한 HTML5 비디오 플레이어입니다.

## 기능

- 🎥 HTML5 비디오 지원
- 🎛️ 완전한 재생 컨트롤 (재생/일시정지, 진행바, 볼륨, 전체화면)
- ⚡ TypeScript로 작성
- 🎨 커스터마이징 가능한 테마
- 📱 반응형 디자인
- ⌨️ 키보드 단축키 지원
- 🔧 다양한 설정 옵션
- 🌐 CDN 및 NPM 배포 지원

## 설치

### NPM
```bash
npm install @your-username/custom-video-player
```

### CDN
```html
<link rel="stylesheet" href="https://unpkg.com/@your-username/custom-video-player@latest/dist/player.css">
<script src="https://unpkg.com/@your-username/custom-video-player@latest/dist/player.min.js"></script>
```

## 사용법

### 기본 사용법

```html
<div id="player-container"></div>

<script>
const player = new CustomVideoPlayer('player-container', {
  width: '800px',
  height: '450px',
  controls: true,
  autoplay: false
});

player.load('path/to/your/video.mp4');
</script>
```

### ES 모듈

```javascript
import { createPlayer } from '@your-username/custom-video-player';

const player = createPlayer('player-container', {
  width: '100%',
  height: '400px',
  theme: 'dark'
});

player.load('https://example.com/video.mp4');
```

### TypeScript

```typescript
import { createPlayer, PlayerConfig } from '@your-username/custom-video-player';

const config: PlayerConfig = {
  width: '800px',
  height: '450px',
  controls: true,
  autoplay: false,
  theme: 'dark'
};

const player = createPlayer('player-container', config);
player.load('video.mp4');
```

## 설정 옵션

```typescript
interface PlayerConfig {
  width?: string | number;           // 플레이어 너비
  height?: string | number;          // 플레이어 높이
  controls?: boolean;                // 컨트롤 표시 여부
  autoplay?: boolean;                // 자동 재생
  muted?: boolean;                   // 음소거
  loop?: boolean;                    // 반복 재생
  preload?: 'none' | 'metadata' | 'auto';  // 미리 로드
  poster?: string;                   // 포스터 이미지
  playbackRates?: number[];          // 재생 속도 옵션
  volume?: number;                   // 초기 볼륨 (0-1)
  startTime?: number;                // 시작 시간 (초)
  theme?: 'default' | 'dark' | 'light';  // 테마
  responsive?: boolean;              // 반응형
}
```

## API 메서드

```javascript
// 재생 제어
player.play();                     // 재생
player.pause();                    // 일시정지
player.stop();                     // 중지

// 비디오 로드
player.load('video.mp4');          // 단일 소스
player.load([                      // 다중 소스
  { src: 'video.mp4', type: 'video/mp4' },
  { src: 'video.webm', type: 'video/webm' }
]);

// 탐색 및 설정
player.seek(30);                   // 30초로 이동
player.setVolume(0.5);             // 볼륨 50%
player.setPlaybackRate(1.5);       // 1.5배속

// 전체화면
player.enterFullscreen();          // 전체화면 진입
player.exitFullscreen();           // 전체화면 해제

// 상태 조회
const state = player.getState();   // 현재 상태 반환

// 정리
player.destroy();                  // 플레이어 제거
```

## 이벤트

```javascript
player.on('ready', () => {
  console.log('플레이어 준비됨');
});

player.on('play', () => {
  console.log('재생 시작');
});

player.on('pause', () => {
  console.log('일시정지');
});

player.on('timeupdate', (currentTime) => {
  console.log('현재 시간:', currentTime);
});

player.on('error', (error) => {
  console.error('에러 발생:', error);
});
```

## 키보드 단축키

- `Space`: 재생/일시정지
- `←`: 10초 뒤로
- `→`: 10초 앞으로
- `↑`: 볼륨 증가
- `↓`: 볼륨 감소
- `F`: 전체화면 토글
- `M`: 음소거 토글

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint

# 테스트
npm test
```

## 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 변경 사항

### v1.0.0
- 초기 릴리스
- 기본 비디오 플레이어 기능
- TypeScript 지원
- 다양한 테마 지원
- 반응형 디자인