/**
 * GameConfig - 게임 설정 값
 * @typedef {Object} GameConfig
 * @property {number} gameWidth - 게임 디자인 너비
 * @property {number} gameHeight - 게임 디자인 높이
 * @property {number} targetFPS - 목표 FPS
 * @property {number} maxObjects - 최대 오브젝트 수
 * @property {boolean} showFPS - FPS 카운터 표시 여부
 */

import { GAME_WIDTH, GAME_HEIGHT, TARGET_FPS, MAX_OBJECTS } from './constants.js';

/**
 * 기본 게임 설정
 * @type {GameConfig}
 */
export const DEFAULT_CONFIG = {
  gameWidth: GAME_WIDTH,
  gameHeight: GAME_HEIGHT,
  targetFPS: TARGET_FPS,
  maxObjects: MAX_OBJECTS,
  showFPS: false
};

/**
 * 사용자 설정과 기본 설정을 병합
 * @param {Partial<GameConfig>} [userConfig={}] - 사용자 정의 설정
 * @returns {GameConfig} 병합된 설정
 */
export function createConfig(userConfig = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig
  };
}
