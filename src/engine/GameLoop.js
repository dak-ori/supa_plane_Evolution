/**
 * GameLoop - requestAnimationFrame 기반 게임 루프
 *
 * Fixed timestep (60Hz) + variable rendering 패턴을 사용합니다.
 * research.md의 accumulator 패턴을 따릅니다.
 */
import { FIXED_TIMESTEP, MAX_UPDATES } from './constants.js';

export class GameLoop {
  /**
   * @param {function(number): void} updateCallback - 업데이트 콜백 (deltaTime)
   * @param {function(number): void} renderCallback - 렌더 콜백 (alpha for interpolation)
   */
  constructor(updateCallback, renderCallback) {
    /** @type {function(number): void} */
    this.updateCallback = updateCallback;

    /** @type {function(number): void} */
    this.renderCallback = renderCallback;

    /** @type {boolean} 실행 중 여부 */
    this.running = false;

    /** @type {boolean} 일시정지 여부 */
    this.paused = false;

    /** @type {number} 마지막 프레임 시간 */
    this._lastTime = 0;

    /** @type {number} 누적 시간 (accumulator) */
    this._accumulator = 0;

    /** @type {number|null} requestAnimationFrame ID */
    this._rafId = null;

    /** @type {function(number): void} bound loop function */
    this._boundLoop = this._loop.bind(this);
  }

  /**
   * 게임 루프 시작
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  /**
   * 게임 루프 정지
   */
  stop() {
    this.running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /**
   * 일시정지 (렌더링은 계속, 업데이트 중지)
   */
  pause() {
    this.paused = true;
  }

  /**
   * 재개
   */
  resume() {
    if (!this.paused) return;

    this.paused = false;
    // 재개 시 시간 리셋하여 큰 deltaTime 방지
    this._lastTime = performance.now();
    this._accumulator = 0;
  }

  /**
   * 메인 루프
   * @param {number} currentTime - 현재 시간 (ms)
   * @private
   */
  _loop(currentTime) {
    if (!this.running) return;

    // 다음 프레임 예약
    this._rafId = requestAnimationFrame(this._boundLoop);

    // 델타 타임 계산 (초 단위)
    const deltaTime = (currentTime - this._lastTime) / 1000;
    this._lastTime = currentTime;

    // 일시정지 상태: 렌더링만 수행
    if (this.paused) {
      this.renderCallback(0);
      return;
    }

    // accumulator에 델타 타임 추가
    this._accumulator += deltaTime;

    // Fixed timestep 업데이트 (60Hz)
    let updateCount = 0;
    while (this._accumulator >= FIXED_TIMESTEP && updateCount < MAX_UPDATES) {
      this.updateCallback(FIXED_TIMESTEP);
      this._accumulator -= FIXED_TIMESTEP;
      updateCount++;
    }

    // Frame drop panic: 너무 많은 업데이트가 필요하면 리셋
    if (updateCount >= MAX_UPDATES) {
      // Panic reset - 게임이 멈추지 않도록
      this._accumulator = FIXED_TIMESTEP;
    }

    // 렌더링 (보간을 위한 alpha 값 전달)
    const alpha = this._accumulator / FIXED_TIMESTEP;
    this.renderCallback(alpha);
  }
}
