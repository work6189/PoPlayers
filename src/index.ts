import { VideoPlayer } from './components/VideoPlayer';
import { PoPlayersConfig, PoPlayersInstance } from './types';
import './styles/poplayers.scss';

// 메인 팩토리 함수
function createPoPlayers(
  containerId: string | HTMLElement, 
  config?: PoPlayersConfig
): PoPlayersInstance {
  return new VideoPlayer(containerId, config);
}

// 클래스 생성자 함수 (new 키워드와 함께 사용)
function PoPlayersConstructor(
  containerId: string | HTMLElement, 
  config?: PoPlayersConfig
): PoPlayersInstance {
  return new VideoPlayer(containerId, config);
}

// 추가 속성들 설정
PoPlayersConstructor.createPoPlayers = createPoPlayers;
PoPlayersConstructor.VideoPlayer = VideoPlayer;
PoPlayersConstructor.version = '1.0.0';

// 글로벌 윈도우 객체에 등록 (CDN 사용시)
if (typeof window !== 'undefined') {
  (window as any).PoPlayers = PoPlayersConstructor;
  (globalThis as any).PoPlayers = PoPlayersConstructor;
}

// ES 모듈 및 CommonJS 내보내기
export { VideoPlayer, createPoPlayers };
export type { PoPlayersConfig, PoPlayersInstance };
export default PoPlayersConstructor;

// 타입 내보내기
export type * from './types';