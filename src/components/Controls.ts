import { PoPlayersConfig } from '../types';
import { createElement, formatTime, throttle } from '../utils/dom';
import { VideoPlayer } from './VideoPlayer';

export class Controls {
  private player: VideoPlayer;
  private config: Required<PoPlayersConfig>;
  private controlsElement!: HTMLElement;
  private playButton!: HTMLButtonElement;
  private progressBar!: HTMLElement;
  private progressFilled!: HTMLElement;
  private progressHandle!: HTMLElement;
  private timeDisplay!: HTMLElement;
  private volumeButton!: HTMLButtonElement;
  private volumeSlider!: HTMLInputElement;
  private fullscreenButton!: HTMLButtonElement;
  private playbackRateButton!: HTMLButtonElement;
  private isVisible = true;
  private hideTimeout: NodeJS.Timeout | null = null;

  constructor(player: VideoPlayer, config: Required<PoPlayersConfig>) {
    this.player = player;
    this.config = config;
    this.createControls();
    this.setupEventListeners();
  }

  private createControls(): void {
    this.controlsElement = createElement('div', 'player-controls');
    
    // 컨트롤 바 컨테이너
    const controlsBar = createElement('div', 'controls-bar');
    
    // 재생/일시정지 버튼
    this.playButton = createElement('button', 'control-button play-button');
    this.playButton.innerHTML = this.getPlayIcon();
    this.playButton.title = '재생';
    
    // 진행 바 컨테이너
    const progressContainer = createElement('div', 'progress-container');
    this.progressBar = createElement('div', 'progress-bar');
    this.progressFilled = createElement('div', 'progress-filled');
    this.progressHandle = createElement('div', 'progress-handle');
    
    this.progressBar.appendChild(this.progressFilled);
    this.progressBar.appendChild(this.progressHandle);
    progressContainer.appendChild(this.progressBar);
    
    // 시간 표시
    this.timeDisplay = createElement('div', 'time-display');
    this.timeDisplay.textContent = '0:00 / 0:00';
    
    // 볼륨 컨트롤
    const volumeContainer = createElement('div', 'volume-container');
    this.volumeButton = createElement('button', 'control-button volume-button');
    this.volumeButton.innerHTML = this.getVolumeIcon(this.config.volume);
    this.volumeButton.title = '음소거';
    
    this.volumeSlider = createElement('input', 'volume-slider') as HTMLInputElement;
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '1';
    this.volumeSlider.step = '0.1';
    this.volumeSlider.value = this.config.volume.toString();
    
    volumeContainer.appendChild(this.volumeButton);
    volumeContainer.appendChild(this.volumeSlider);
    
    // 재생 속도 버튼
    this.playbackRateButton = createElement('button', 'control-button rate-button');
    this.playbackRateButton.textContent = '1x';
    this.playbackRateButton.title = '재생 속도';
    
    // 전체화면 버튼
    this.fullscreenButton = createElement('button', 'control-button fullscreen-button');
    this.fullscreenButton.innerHTML = this.getFullscreenIcon();
    this.fullscreenButton.title = '전체화면';
    
    // 컨트롤 바에 요소들 추가
    controlsBar.appendChild(this.playButton);
    controlsBar.appendChild(progressContainer);
    controlsBar.appendChild(this.timeDisplay);
    controlsBar.appendChild(volumeContainer);
    controlsBar.appendChild(this.playbackRateButton);
    controlsBar.appendChild(this.fullscreenButton);
    
    this.controlsElement.appendChild(controlsBar);
  }

  private setupEventListeners(): void {
    // 재생/일시정지 버튼
    this.playButton.addEventListener('click', () => {
      const state = this.player.getState();
      if (state.isPlaying) {
        this.player.pause();
      } else {
        this.player.play();
      }
    });

    // 진행 바 클릭
    this.progressBar.addEventListener('click', (e) => {
      const rect = this.progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const state = this.player.getState();
      const seekTime = percent * state.duration;
      this.player.seek(seekTime);
    });

    // 진행 바 드래그
    let isDragging = false;
    this.progressHandle.addEventListener('mousedown', () => {
      isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const rect = this.progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const state = this.player.getState();
      const seekTime = percent * state.duration;
      this.player.seek(seekTime);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // 볼륨 버튼
    this.volumeButton.addEventListener('click', () => {
      const state = this.player.getState();
      if (state.isMuted || state.volume === 0) {
        this.player.setVolume(this.config.volume);
      } else {
        this.player.setVolume(0);
      }
    });

    // 볼륨 슬라이더
    this.volumeSlider.addEventListener('input', (e) => {
      const volume = parseFloat((e.target as HTMLInputElement).value);
      this.player.setVolume(volume);
    });

    // 재생 속도 버튼
    let currentRateIndex = this.config.playbackRates.indexOf(1);
    this.playbackRateButton.addEventListener('click', () => {
      currentRateIndex = (currentRateIndex + 1) % this.config.playbackRates.length;
      const newRate = this.config.playbackRates[currentRateIndex];
      this.player.setPlaybackRate(newRate);
      this.playbackRateButton.textContent = `${newRate}x`;
    });

    // 전체화면 버튼
    this.fullscreenButton.addEventListener('click', () => {
      const state = this.player.getState();
      if (state.isFullscreen) {
        this.player.exitFullscreen();
      } else {
        this.player.enterFullscreen();
      }
    });

    // 플레이어 이벤트 리스너
    this.player.on('play', () => {
      this.playButton.innerHTML = this.getPauseIcon();
      this.playButton.title = '일시정지';
    });

    this.player.on('pause', () => {
      this.playButton.innerHTML = this.getPlayIcon();
      this.playButton.title = '재생';
    });

    this.player.on('timeupdate', (currentTime) => {
      this.updateProgress(currentTime);
    });

    this.player.on('durationchange', (duration) => {
      this.updateTimeDisplay(this.player.getState().currentTime, duration);
    });

    this.player.on('volumechange', (volume) => {
      this.volumeSlider.value = volume.toString();
      this.volumeButton.innerHTML = this.getVolumeIcon(volume);
    });

    this.player.on('fullscreenchange', (isFullscreen) => {
      this.fullscreenButton.innerHTML = isFullscreen 
        ? this.getExitFullscreenIcon() 
        : this.getFullscreenIcon();
      this.fullscreenButton.title = isFullscreen ? '전체화면 해제' : '전체화면';
    });

    // 마우스 이동시 컨트롤 표시
    const container = this.player.getContainer();
    const throttledMouseMove = throttle(() => {
      this.showControls();
    }, 100);

    container.addEventListener('mousemove', throttledMouseMove);
    container.addEventListener('mouseleave', () => {
      this.hideControls();
    });

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
      if (!this.isPlayerFocused()) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.playButton.click();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.player.seek(this.player.getState().currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.player.seek(this.player.getState().currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.player.setVolume(Math.min(1, this.player.getState().volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.player.setVolume(Math.max(0, this.player.getState().volume - 0.1));
          break;
        case 'KeyF':
          e.preventDefault();
          this.fullscreenButton.click();
          break;
        case 'KeyM':
          e.preventDefault();
          this.volumeButton.click();
          break;
      }
    });
  }

  private updateProgress(currentTime: number): void {
    const state = this.player.getState();
    if (state.duration > 0) {
      const percent = (currentTime / state.duration) * 100;
      this.progressFilled.style.width = `${percent}%`;
      this.progressHandle.style.left = `${percent}%`;
    }
    this.updateTimeDisplay(currentTime, state.duration);
  }

  private updateTimeDisplay(currentTime: number, duration: number): void {
    const current = formatTime(currentTime);
    const total = formatTime(duration);
    this.timeDisplay.textContent = `${current} / ${total}`;
  }

  private showControls(): void {
    this.isVisible = true;
    this.controlsElement.classList.add('visible');
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.hideTimeout = setTimeout(() => {
      this.hideControls();
    }, 3000);
  }

  private hideControls(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.isVisible = false;
    this.controlsElement.classList.remove('visible');
  }

  private isPlayerFocused(): boolean {
    const container = this.player.getContainer();
    return container.contains(document.activeElement) || 
           document.activeElement === container;
  }

  // 아이콘 SVG 문자열들
  private getPlayIcon(): string {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>`;
  }

  private getPauseIcon(): string {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>`;
  }

  private getVolumeIcon(volume: number): string {
    if (volume === 0) {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>`;
    } else if (volume < 0.5) {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>`;
    } else {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>`;
    }
  }

  private getFullscreenIcon(): string {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>`;
  }

  private getExitFullscreenIcon(): string {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>`;
  }

  getElement(): HTMLElement {
    return this.controlsElement;
  }

  destroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    if (this.controlsElement.parentNode) {
      this.controlsElement.parentNode.removeChild(this.controlsElement);
    }
  }
}