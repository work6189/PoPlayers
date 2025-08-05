import { VideoPlayer } from './components/VideoPlayer';
import { PlayerConfig, PlayerInstance } from './types';
import './styles/player.scss';

// 메인 팩토리 함수
function createPlayer(
  containerId: string | HTMLElement, 
  config?: PlayerConfig
): PlayerInstance {
  return new VideoPlayer(containerId, config);
}

// 클래스 생성자 함수 (new 키워드와 함께 사용)
function CustomVideoPlayerConstructor(
  containerId: string | HTMLElement, 
  config?: PlayerConfig
): PlayerInstance {
  return new VideoPlayer(containerId, config);
}

// 추가 속성들 설정
CustomVideoPlayerConstructor.createPlayer = createPlayer;
CustomVideoPlayerConstructor.VideoPlayer = VideoPlayer;
CustomVideoPlayerConstructor.version = '1.0.0';

// 글로벌 윈도우 객체에 등록 (CDN 사용시)
if (typeof window !== 'undefined') {
  (window as any).CustomVideoPlayer = CustomVideoPlayerConstructor;
  (globalThis as any).CustomVideoPlayer = CustomVideoPlayerConstructor;
}

// ES 모듈 및 CommonJS 내보내기
export { VideoPlayer, createPlayer };
export type { PlayerConfig, PlayerInstance };
export default CustomVideoPlayerConstructor;

// 타입 내보내기
export type * from './types';