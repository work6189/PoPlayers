// Jest 설정 파일

// jsdom 환경에서 필요한 전역 설정
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// HTMLMediaElement의 기본 속성들 모킹
Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
});

Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
  writable: true,
  value: 0,
});

Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
  writable: true,
  value: 1,
});

Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
  writable: true,
  value: true,
});

Object.defineProperty(HTMLMediaElement.prototype, 'ended', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
  writable: true,
  value: 1,
});

Object.defineProperty(HTMLMediaElement.prototype, 'buffered', {
  writable: true,
  value: {
    length: 0,
    start: jest.fn(),
    end: jest.fn(),
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'seekable', {
  writable: true,
  value: {
    length: 0,
    start: jest.fn(),
    end: jest.fn(),
  },
});

// Fullscreen API 모킹
Object.defineProperty(document, 'fullscreenEnabled', {
  writable: true,
  value: true,
});

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

// 콘솔 에러 무시 (테스트 중 불필요한 에러 메시지 제거)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});