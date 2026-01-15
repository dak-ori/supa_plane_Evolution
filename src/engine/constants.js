/**
 * Game Engine Constants
 * 게임 엔진에서 사용하는 상수 정의
 */

// 게임 디자인 해상도 (HD 세로 모드)
export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

// 성능 관련
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP = 1 / TARGET_FPS; // 약 16.67ms
export const MAX_OBJECTS = 50;
export const MAX_UPDATES = 240; // Frame drop panic threshold

// 입력 관련
export const MIN_TOUCH_SIZE = 44; // CSS 픽셀 (WCAG 권장)
