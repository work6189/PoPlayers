export interface PoPlayersConfig {
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  playbackRates?: number[];
  volume?: number;
  startTime?: number;
  theme?: 'default' | 'dark' | 'light';
  responsive?: boolean;
}

export interface PoPlayersEvents {
  'ready': () => void;
  'play': () => void;
  'pause': () => void;
  'ended': () => void;
  'timeupdate': (currentTime: number) => void;
  'durationchange': (duration: number) => void;
  'volumechange': (volume: number) => void;
  'ratechange': (rate: number) => void;
  'fullscreenchange': (isFullscreen: boolean) => void;
  'error': (error: Error) => void;
  'loadstart': () => void;
  'loadeddata': () => void;
  'canplay': () => void;
  'seeking': () => void;
  'seeked': () => void;
}

export interface VideoSource {
  src: string;
  type?: string;
  label?: string;
  default?: boolean;
}

export interface PoPlayersState {
  isPlaying: boolean;
  isPaused: boolean;
  isEnded: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  buffered: TimeRanges | null;
  seekable: TimeRanges | null;
}

export interface ControlsConfig {
  play?: boolean;
  pause?: boolean;
  progress?: boolean;
  time?: boolean;
  volume?: boolean;
  fullscreen?: boolean;
  playbackRate?: boolean;
  quality?: boolean;
}

export type EventListener<T extends keyof PoPlayersEvents> = PoPlayersEvents[T];

export interface PoPlayersInstance {
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  load(source: string | VideoSource[]): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setPlaybackRate(rate: number): void;
  enterFullscreen(): void;
  exitFullscreen(): void;
  destroy(): void;
  on<T extends keyof PoPlayersEvents>(event: T, listener: EventListener<T>): void;
  off<T extends keyof PoPlayersEvents>(event: T, listener: EventListener<T>): void;
  getState(): PoPlayersState;
}