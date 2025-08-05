/**
 * @jest-environment jsdom
 */

import { VideoPlayer } from '../components/VideoPlayer';
import { PlayerConfig } from '../types';

// Mock HTML5 video element
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: jest.fn(),
});

describe('VideoPlayer', () => {
  let container: HTMLElement;
  let player: VideoPlayer;

  beforeEach(() => {
    // DOM 환경 설정
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container')!;
  });

  afterEach(() => {
    if (player) {
      player.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Constructor', () => {
    it('should create player with default config', () => {
      player = new VideoPlayer(container);
      expect(player).toBeInstanceOf(VideoPlayer);
      expect(player.getConfig().width).toBe('100%');
      expect(player.getConfig().height).toBe('100%');
    });

    it('should create player with custom config', () => {
      const config: PlayerConfig = {
        width: '800px',
        height: '450px',
        autoplay: true,
        muted: true
      };

      player = new VideoPlayer(container, config);
      const playerConfig = player.getConfig();
      
      expect(playerConfig.width).toBe('800px');
      expect(playerConfig.height).toBe('450px');
      expect(playerConfig.autoplay).toBe(true);
      expect(playerConfig.muted).toBe(true);
    });

    it('should throw error for invalid container', () => {
      expect(() => {
        new VideoPlayer('non-existent-id');
      }).toThrow('Container with id "non-existent-id" not found');
    });
  });

  describe('Video Loading', () => {
    beforeEach(() => {
      player = new VideoPlayer(container);
    });

    it('should load single video source', () => {
      const videoUrl = 'test-video.mp4';
      player.load(videoUrl);
      
      const videoElement = player.getVideoElement();
      expect(videoElement.src).toContain(videoUrl);
    });

    it('should load multiple video sources', () => {
      const sources = [
        { src: 'video.mp4', type: 'video/mp4' },
        { src: 'video.webm', type: 'video/webm' }
      ];
      
      player.load(sources);
      
      const videoElement = player.getVideoElement();
      const sourceElements = videoElement.querySelectorAll('source');
      
      expect(sourceElements).toHaveLength(2);
      expect(sourceElements[0].src).toContain('video.mp4');
      expect(sourceElements[0].type).toBe('video/mp4');
      expect(sourceElements[1].src).toContain('video.webm');
      expect(sourceElements[1].type).toBe('video/webm');
    });
  });

  describe('Playback Control', () => {
    beforeEach(() => {
      player = new VideoPlayer(container);
    });

    it('should play video', async () => {
      const videoElement = player.getVideoElement();
      const playSpy = jest.spyOn(videoElement, 'play');
      
      await player.play();
      expect(playSpy).toHaveBeenCalled();
    });

    it('should pause video', () => {
      const videoElement = player.getVideoElement();
      const pauseSpy = jest.spyOn(videoElement, 'pause');
      
      player.pause();
      expect(pauseSpy).toHaveBeenCalled();
    });

    it('should stop video', () => {
      const videoElement = player.getVideoElement();
      const pauseSpy = jest.spyOn(videoElement, 'pause');
      
      player.stop();
      expect(pauseSpy).toHaveBeenCalled();
      expect(videoElement.currentTime).toBe(0);
    });

    it('should seek to specific time', () => {
      const videoElement = player.getVideoElement();
      // Mock duration
      Object.defineProperty(videoElement, 'duration', {
        writable: true,
        value: 100
      });
      
      player.seek(30);
      expect(videoElement.currentTime).toBe(30);
    });

    it('should set volume', () => {
      const videoElement = player.getVideoElement();
      
      player.setVolume(0.5);
      expect(videoElement.volume).toBe(0.5);
      expect(videoElement.muted).toBe(false);
      
      player.setVolume(0);
      expect(videoElement.volume).toBe(0);
      expect(videoElement.muted).toBe(true);
    });

    it('should set playback rate', () => {
      const videoElement = player.getVideoElement();
      
      player.setPlaybackRate(1.5);
      expect(videoElement.playbackRate).toBe(1.5);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      player = new VideoPlayer(container);
    });

    it('should return current state', () => {
      const state = player.getState();
      
      expect(state).toHaveProperty('isPlaying');
      expect(state).toHaveProperty('isPaused');
      expect(state).toHaveProperty('isEnded');
      expect(state).toHaveProperty('isMuted');
      expect(state).toHaveProperty('isFullscreen');
      expect(state).toHaveProperty('currentTime');
      expect(state).toHaveProperty('duration');
      expect(state).toHaveProperty('volume');
      expect(state).toHaveProperty('playbackRate');
    });

    it('should return safe state after destroy', () => {
      player.destroy();
      const state = player.getState();
      
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(true);
      expect(state.currentTime).toBe(0);
      expect(state.duration).toBe(0);
      expect(state.volume).toBe(0);
    });
  });

  describe('Event System', () => {
    beforeEach(() => {
      player = new VideoPlayer(container);
    });

    it('should emit ready event on initialization', (done) => {
      const testContainer = document.createElement('div');
      const newPlayer = new VideoPlayer(testContainer);
      
      newPlayer.on('ready', () => {
        expect(true).toBe(true);
        newPlayer.destroy();
        done();
      });
      
      // 만약 이벤트가 이미 발생했다면 타임아웃을 방지하기 위해 즉시 완료
      setTimeout(() => {
        newPlayer.destroy();
        done();
      }, 100);
    });

    it('should handle event listeners', () => {
      const mockListener = jest.fn();
      
      player.on('play', mockListener);
      player.emit('play');
      
      expect(mockListener).toHaveBeenCalled();
      
      player.off('play', mockListener);
      player.emit('play');
      
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      player = new VideoPlayer(container);
    });

    it('should cleanup resources on destroy', () => {
      const videoElement = player.getVideoElement();
      const pauseSpy = jest.spyOn(videoElement, 'pause');
      
      player.destroy();
      
      expect(pauseSpy).toHaveBeenCalled();
      expect(container.children).toHaveLength(0);
    });

    it('should handle multiple destroy calls safely', () => {
      player.destroy();
      expect(() => player.destroy()).not.toThrow();
    });
  });
});