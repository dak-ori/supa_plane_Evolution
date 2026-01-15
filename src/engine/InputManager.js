/**
 * InputManager - 마우스/터치 통합 입력 관리
 *
 * Pointer Events API를 사용하여 마우스, 터치, 펜 입력을 통합 처리합니다.
 */
import { createInputEvent } from './InputEvent.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

export class InputManager {
  /**
   * @param {HTMLCanvasElement} canvas - 입력을 받을 캔버스
   * @param {import('./Renderer.js').Renderer} renderer - 좌표 변환을 위한 렌더러
   */
  constructor(canvas, renderer) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;

    /** @type {import('./Renderer.js').Renderer} */
    this.renderer = renderer;

    /** @type {Map<number, import('./InputEvent.js').InputEvent>} 활성 포인터 맵 */
    this.activePointers = new Map();

    // 이벤트 콜백
    /** @type {function(import('./InputEvent.js').InputEvent): void | null} */
    this.onPointerDown = null;

    /** @type {function(import('./InputEvent.js').InputEvent): void | null} */
    this.onPointerMove = null;

    /** @type {function(import('./InputEvent.js').InputEvent): void | null} */
    this.onPointerUp = null;

    // CSS로 기본 터치 동작 방지
    canvas.style.touchAction = 'none';

    // 이벤트 리스너 바인딩
    this._boundPointerDown = this._handlePointerDown.bind(this);
    this._boundPointerMove = this._handlePointerMove.bind(this);
    this._boundPointerUp = this._handlePointerUp.bind(this);
    this._boundPointerCancel = this._handlePointerUp.bind(this);

    canvas.addEventListener('pointerdown', this._boundPointerDown);
    canvas.addEventListener('pointermove', this._boundPointerMove);
    canvas.addEventListener('pointerup', this._boundPointerUp);
    canvas.addEventListener('pointercancel', this._boundPointerCancel);
  }

  /**
   * 스크린 좌표를 게임 좌표로 변환
   * @param {PointerEvent} event
   * @returns {{x: number, y: number}}
   */
  getCanvasCoords(event) {
    const rect = this.canvas.getBoundingClientRect();

    // 스크린 좌표에서 캔버스 로컬 좌표로
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    // 레터박스 오프셋과 스케일 적용하여 게임 좌표로 변환
    const gameX = (localX - this.renderer.offsetX / this.renderer.scale * (rect.width / (this.renderer.gameWidth * this.renderer.scale))) / this.renderer.scale * (this.renderer.gameWidth * this.renderer.scale / rect.width) * this.renderer.gameWidth / this.renderer.gameWidth;

    // 간소화된 변환 (렌더러의 screenToGame 사용)
    return this.renderer.screenToGame(event.clientX, event.clientY);
  }

  /**
   * @param {PointerEvent} event
   * @private
   */
  _handlePointerDown(event) {
    const coords = this.getCanvasCoords(event);
    const inputEvent = createInputEvent(
      coords.x,
      coords.y,
      event.pointerType,
      event.pointerId,
      event.isPrimary
    );

    this.activePointers.set(event.pointerId, inputEvent);

    if (this.onPointerDown) {
      this.onPointerDown(inputEvent);
    }
  }

  /**
   * @param {PointerEvent} event
   * @private
   */
  _handlePointerMove(event) {
    const inputEvent = this.activePointers.get(event.pointerId);
    if (!inputEvent) return;

    const coords = this.getCanvasCoords(event);

    // 이전 좌표 저장
    inputEvent.prevX = inputEvent.x;
    inputEvent.prevY = inputEvent.y;

    // 새 좌표 업데이트
    inputEvent.x = coords.x;
    inputEvent.y = coords.y;

    if (this.onPointerMove) {
      this.onPointerMove(inputEvent);
    }
  }

  /**
   * @param {PointerEvent} event
   * @private
   */
  _handlePointerUp(event) {
    const inputEvent = this.activePointers.get(event.pointerId);
    if (!inputEvent) return;

    this.activePointers.delete(event.pointerId);

    if (this.onPointerUp) {
      this.onPointerUp(inputEvent);
    }
  }

  /**
   * 현재 활성화된 모든 포인터 반환
   * @returns {Map<number, import('./InputEvent.js').InputEvent>}
   */
  getActivePointers() {
    return this.activePointers;
  }

  /**
   * 주 포인터(첫 번째 터치 또는 마우스) 반환
   * @returns {import('./InputEvent.js').InputEvent | null}
   */
  getPrimaryPointer() {
    for (const inputEvent of this.activePointers.values()) {
      if (inputEvent.isPrimary) {
        return inputEvent;
      }
    }
    return null;
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.canvas.removeEventListener('pointerdown', this._boundPointerDown);
    this.canvas.removeEventListener('pointermove', this._boundPointerMove);
    this.canvas.removeEventListener('pointerup', this._boundPointerUp);
    this.canvas.removeEventListener('pointercancel', this._boundPointerCancel);
    this.activePointers.clear();
  }
}
