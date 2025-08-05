import { PlayerConfig, PlayerState, VideoSource, PlayerInstance } from '../types';
import { PlayerEventEmitter } from '../utils/events';
import { createElement, formatTime, throttle, requestFullscreen, exitFullscreen, isFullscreenSupported } from '../utils/dom';
import { Controls } from './Controls';

export class VideoPlayer extends PlayerEventEmitter implements PlayerInstance {
  private container: HTMLElement;
  private videoElement!: HTMLVideoElement;
  private controls!: Controls;
  private config: Required<PlayerConfig>;
  private isDestroyed = false;

  constructor(containerId: string | HTMLElement, config: PlayerConfig = {}) {
    super();

    // 기본 설정
    this.config = {
      width: '100%',
      height: '100%',
      controls: true,
      autoplay: false,
      muted: false,
      loop: false,
      preload: 'metadata',
      poster: '',
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      volume: 1,
      startTime: 0,
      theme: 'default',
      responsive: true,
      ...config
    };

    // 컨테이너 설정
    this.container = typeof containerId === 'string' 
      ? document.getElementById(containerId)!
      : containerId;

    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.init();
  }

  private init(): void {
    this.setupContainer();
    this.createVideoElement();
    this.setupEventListeners();
    
    if (this.config.controls) {
      this.controls = new Controls(this, this.config);
      this.container.appendChild(this.controls.getElement());
    }

    this.emit('ready');
  }

  private setupContainer(): void {
    this.container.classList.add('custom-video-player');
    this.container.style.position = 'relative';
    this.container.style.width = typeof this.config.width === 'number' 
      ? `${this.config.width}px` 
      : this.config.width;
    this.container.style.height = typeof this.config.height === 'number' 
      ? `${this.config.height}px` 
      : this.config.height;
  }

  private createVideoElement(): void {
    this.videoElement = createElement('video', 'video-element');
    
    // 비디오 속성 설정
    this.videoElement.preload = this.config.preload;
    this.videoElement.muted = this.config.muted;
    this.videoElement.loop = this.config.loop;
    this.videoElement.volume = this.config.volume;
    
    if (this.config.poster) {
      this.videoElement.poster = this.config.poster;
    }

    // 스타일 설정
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.display = 'block';

    this.container.appendChild(this.videoElement);
  }

  private setupEventListeners(): void {
    const throttledTimeUpdate = throttle((e: Event) => {
      const video = e.target as HTMLVideoElement;
      this.emit('timeupdate', video.currentTime);
    }, 250);

    // 비디오 이벤트 리스너
    this.videoElement.addEventListener('loadstart', () => this.emit('loadstart'));
    this.videoElement.addEventListener('loadeddata', () => this.emit('loadeddata'));
    this.videoElement.addEventListener('canplay', () => this.emit('canplay'));
    this.videoElement.addEventListener('play', () => this.emit('play'));
    this.videoElement.addEventListener('pause', () => this.emit('pause'));
    this.videoElement.addEventListener('ended', () => this.emit('ended'));
    this.videoElement.addEventListener('timeupdate', throttledTimeUpdate);
    this.videoElement.addEventListener('durationchange', (e) => {
      const video = e.target as HTMLVideoElement;
      this.emit('durationchange', video.duration);
    });
    this.videoElement.addEventListener('volumechange', (e) => {
      const video = e.target as HTMLVideoElement;
      this.emit('volumechange', video.volume);
    });
    this.videoElement.addEventListener('ratechange', (e) => {
      const video = e.target as HTMLVideoElement;
      this.emit('ratechange', video.playbackRate);
    });
    this.videoElement.addEventListener('seeking', () => this.emit('seeking'));
    this.videoElement.addEventListener('seeked', () => this.emit('seeked'));
    this.videoElement.addEventListener('error', (e) => {
      const video = e.target as HTMLVideoElement;
      const error = video.error;
      if (error) {
        this.emit('error', new Error(`Video error: ${error.message}`));
      }
    });

    // 풀스크린 이벤트
    document.addEventListener('fullscreenchange', () => {
      this.emit('fullscreenchange', !!document.fullscreenElement);
    });
    document.addEventListener('webkitfullscreenchange', () => {
      this.emit('fullscreenchange', !!(document as any).webkitFullscreenElement);
    });
    document.addEventListener('mozfullscreenchange', () => {
      this.emit('fullscreenchange', !!(document as any).mozFullScreenElement);
    });
    document.addEventListener('MSFullscreenChange', () => {
      this.emit('fullscreenchange', !!(document as any).msFullscreenElement);
    });
  }

  // Public API Methods
  async play(): Promise<void> {
    if (this.isDestroyed) return;
    
    try {
      await this.videoElement.play();
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  pause(): void {
    if (this.isDestroyed) return;
    this.videoElement.pause();
  }

  stop(): void {
    if (this.isDestroyed) return;
    this.pause();
    this.seek(0);
  }

  load(source: string | VideoSource[]): void {
    if (this.isDestroyed) return;

    // 기존 소스 제거
    while (this.videoElement.firstChild) {
      this.videoElement.removeChild(this.videoElement.firstChild);
    }

    if (typeof source === 'string') {
      this.videoElement.src = source;
    } else {
      source.forEach(src => {
        const sourceElement = createElement('source');
        sourceElement.src = src.src;
        if (src.type) sourceElement.type = src.type;
        this.videoElement.appendChild(sourceElement);
      });
    }

    this.videoElement.load();

    if (this.config.startTime > 0) {
      this.videoElement.addEventListener('loadeddata', () => {
        this.seek(this.config.startTime);
      }, { once: true });
    }

    if (this.config.autoplay) {
      this.videoElement.addEventListener('canplay', () => {
        this.play().catch(error => {
          console.warn('Autoplay failed:', error);
        });
      }, { once: true });
    }
  }

  seek(time: number): void {
    if (this.isDestroyed) return;
    this.videoElement.currentTime = Math.max(0, Math.min(time, this.videoElement.duration || 0));
  }

  setVolume(volume: number): void {
    if (this.isDestroyed) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.videoElement.volume = clampedVolume;
    this.videoElement.muted = clampedVolume === 0;
  }

  setPlaybackRate(rate: number): void {
    if (this.isDestroyed) return;
    this.videoElement.playbackRate = rate;
  }

  enterFullscreen(): void {
    if (this.isDestroyed || !isFullscreenSupported()) return;
    requestFullscreen(this.container);
  }

  exitFullscreen(): void {
    if (this.isDestroyed) return;
    exitFullscreen();
  }

  getState(): PlayerState {
    if (this.isDestroyed) {
      return {
        isPlaying: false,
        isPaused: true,
        isEnded: false,
        isMuted: false,
        isFullscreen: false,
        currentTime: 0,
        duration: 0,
        volume: 0,
        playbackRate: 1,
        buffered: null,
        seekable: null
      };
    }

    return {
      isPlaying: !this.videoElement.paused && !this.videoElement.ended,
      isPaused: this.videoElement.paused,
      isEnded: this.videoElement.ended,
      isMuted: this.videoElement.muted,
      isFullscreen: !!document.fullscreenElement,
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration || 0,
      volume: this.videoElement.volume,
      playbackRate: this.videoElement.playbackRate,
      buffered: this.videoElement.buffered,
      seekable: this.videoElement.seekable
    };
  }

  destroy(): void {
    if (this.isDestroyed) return;

    this.pause();
    this.removeAllListeners();
    
    if (this.controls) {
      this.controls.destroy();
    }

    if (this.container && this.videoElement) {
      this.container.removeChild(this.videoElement);
    }

    this.isDestroyed = true;
  }

  // Getter methods
  getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  getContainer(): HTMLElement {
    return this.container;
  }

  getConfig(): Required<PlayerConfig> {
    return { ...this.config };
  }
}