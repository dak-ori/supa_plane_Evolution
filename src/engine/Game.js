/**
 * Game - 전체 게임 인스턴스
 *
 * 게임 상태 관리, 시스템 조율, 오브젝트 관리를 담당합니다.
 */
import { createConfig } from './GameConfig.js';
import { GameLoop } from './GameLoop.js';
import { Renderer } from './Renderer.js';
import { InputManager } from './InputManager.js';
import { FPSCounter } from '../utils/FPSCounter.js';
import { GameState, isValidTransition } from './GameState.js';

export class Game {
  /**
   * @param {string} canvasId - Canvas 요소의 ID
   * @param {Partial<import('./GameConfig.js').GameConfig>} [userConfig] - 게임 설정 오버라이드
   */
  constructor(canvasId, userConfig = {}) {
    // 캔버스 요소 찾기
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas element not found: ${canvasId}`);
    }

    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;

    /** @type {import('./GameConfig.js').GameConfig} */
    this.config = createConfig(userConfig);

    /** @type {Renderer} */
    this.renderer = new Renderer(canvas, this.config.gameWidth, this.config.gameHeight);

    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.renderer.ctx;

    /** @type {GameLoop} */
    this.gameLoop = new GameLoop(
      (dt) => this._update(dt),
      (alpha) => this._render(alpha)
    );

    /** @type {FPSCounter} */
    this.fpsCounter = new FPSCounter();
    this.fpsCounter.visible = this.config.showFPS;

    /** @type {InputManager} */
    this.inputManager = new InputManager(canvas, this.renderer);

    /** @type {import('./GameObject.js').GameObject[]} 활성 게임 오브젝트 목록 */
    this.objects = [];

    /** @type {string} 현재 게임 상태 */
    this.state = GameState.MENU;

    /** @type {function(string, string): void | null} 상태 변경 콜백 */
    this._stateChangeCallback = null;

    /** @type {boolean} 탭 숨김 전 플레이 중이었는지 */
    this._wasPlayingOnHide = false;

    // Page Visibility API 설정
    this._boundVisibilityChange = this._onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._boundVisibilityChange);

    // 게임 루프 시작 (렌더링만, 업데이트는 PLAYING 상태에서만)
    this.gameLoop.start();
    this.gameLoop.pause(); // 초기 상태는 MENU이므로 일시정지
  }

  /**
   * 상태 변경 콜백 등록
   * @param {function(string, string): void} callback - (newState, oldState) => void
   */
  onStateChange(callback) {
    this._stateChangeCallback = callback;
  }

  /**
   * 상태 변경 (내부 메서드)
   * @param {string} newState - 새 상태
   * @private
   */
  _setState(newState) {
    const oldState = this.state;
    if (oldState === newState) return;

    if (!isValidTransition(oldState, newState)) {
      console.warn(`Invalid state transition: ${oldState} → ${newState}`);
      return;
    }

    this.state = newState;

    if (this._stateChangeCallback) {
      this._stateChangeCallback(newState, oldState);
    }
  }

  /**
   * 게임 시작 (MENU → PLAYING)
   */
  start() {
    if (this.state !== GameState.MENU) return;
    this._setState(GameState.PLAYING);
    this.gameLoop.resume();
  }

  /**
   * 게임 일시정지 (PLAYING → PAUSED)
   */
  pause() {
    if (this.state !== GameState.PLAYING) return;
    this._setState(GameState.PAUSED);
    this.gameLoop.pause();
  }

  /**
   * 게임 재개 (PAUSED → PLAYING)
   */
  resume() {
    if (this.state !== GameState.PAUSED) return;
    this._setState(GameState.PLAYING);
    this.gameLoop.resume();
  }

  /**
   * 게임오버 (PLAYING → GAME_OVER)
   */
  gameOver() {
    if (this.state !== GameState.PLAYING) return;
    this._setState(GameState.GAME_OVER);
    this.gameLoop.pause();
  }

  /**
   * 메뉴로 복귀 (PAUSED/GAME_OVER → MENU)
   */
  returnToMenu() {
    if (this.state === GameState.MENU) return;
    if (this.state !== GameState.PAUSED && this.state !== GameState.GAME_OVER) return;

    // 모든 오브젝트 정리
    this.objects.length = 0;

    this._setState(GameState.MENU);
    this.gameLoop.pause();
  }

  /**
   * 일시정지 상태 여부
   * @returns {boolean}
   */
  isPaused() {
    return this.state === GameState.PAUSED;
  }

  /**
   * Page Visibility 변경 핸들러
   * @private
   */
  _onVisibilityChange() {
    if (document.hidden) {
      // 탭이 숨겨질 때: PLAYING 상태면 일시정지
      if (this.state === GameState.PLAYING) {
        this._wasPlayingOnHide = true;
        this.pause();
      }
    }
    // 탭이 다시 보일 때: 일시정지 상태 유지 (spec 요구사항)
    // 사용자가 수동으로 resume() 호출해야 함
  }

  /**
   * 게임 오브젝트를 활성 목록에 추가
   * @param {import('./GameObject.js').GameObject} object - 추가할 게임 오브젝트
   */
  addObject(object) {
    if (this.objects.indexOf(object) === -1) {
      this.objects.push(object);
    }
  }

  /**
   * 게임 오브젝트를 활성 목록에서 제거
   * @param {import('./GameObject.js').GameObject} object - 제거할 게임 오브젝트
   */
  removeObject(object) {
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }

  /**
   * 활성 게임 오브젝트 목록 반환
   * @returns {import('./GameObject.js').GameObject[]}
   */
  getObjects() {
    return this.objects;
  }

  /**
   * FPS 카운터 표시 토글
   */
  toggleFPS() {
    this.fpsCounter.toggle();
  }

  /**
   * 내부 업데이트 메서드
   * @param {number} deltaTime - 경과 시간 (초)
   * @private
   */
  _update(deltaTime) {
    // FPS 카운터 업데이트
    this.fpsCounter.update(deltaTime);

    // 모든 활성 오브젝트 업데이트
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      if (obj.active) {
        obj.update(deltaTime);
      }
    }
  }

  /**
   * 내부 렌더링 메서드
   * @param {number} alpha - 보간 알파 값 (0~1)
   * @private
   */
  _render(alpha) {
    // 화면 클리어
    this.renderer.clear('#1a1a2e');

    // 모든 활성 오브젝트 렌더링
    this.renderer.render(this.objects);

    // FPS 카운터 렌더링
    this.fpsCounter.render(this.ctx);
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.gameLoop.stop();
    this.renderer.destroy();
    this.inputManager.destroy();
    this.objects.length = 0;
    document.removeEventListener('visibilitychange', this._boundVisibilityChange);
  }
}
