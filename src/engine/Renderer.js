/**
 * Renderer - Canvas 2D 렌더링 담당
 *
 * DPR(Device Pixel Ratio) 처리, letterbox 스케일링,
 * 캔버스 초기화 및 리사이즈를 담당합니다.
 */
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas - 렌더링 대상 캔버스
   * @param {number} gameWidth - 게임 디자인 너비
   * @param {number} gameHeight - 게임 디자인 높이
   */
  constructor(canvas, gameWidth = GAME_WIDTH, gameHeight = GAME_HEIGHT) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;

    /** @type {CanvasRenderingContext2D} */
    this.ctx = canvas.getContext('2d', { alpha: false });

    /** @type {number} 게임 디자인 너비 */
    this.gameWidth = gameWidth;

    /** @type {number} 게임 디자인 높이 */
    this.gameHeight = gameHeight;

    /** @type {number} 스케일 비율 */
    this.scale = 1;

    /** @type {number} X 오프셋 (pillarbox) */
    this.offsetX = 0;

    /** @type {number} Y 오프셋 (letterbox) */
    this.offsetY = 0;

    /** @type {number} Device Pixel Ratio */
    this.dpr = window.devicePixelRatio || 1;

    // 초기 캔버스 설정
    this.setupCanvas();

    // 리사이즈 이벤트 바인딩
    this._boundResize = this._onResize.bind(this);
    window.addEventListener('resize', this._boundResize);
  }

  /**
   * 캔버스 초기 설정 (DPR 적용)
   */
  setupCanvas() {
    this.dpr = window.devicePixelRatio || 1;
    this.calculateLetterbox();

    // 캔버스 실제 크기 (DPR 적용)
    const canvasWidth = this.gameWidth * this.scale;
    const canvasHeight = this.gameHeight * this.scale;

    this.canvas.width = canvasWidth * this.dpr;
    this.canvas.height = canvasHeight * this.dpr;

    // CSS 크기
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;

    // 캔버스 위치 (중앙 정렬 + 오프셋)
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = `${this.offsetX}px`;
    this.canvas.style.top = `${this.offsetY}px`;

    // 컨텍스트 스케일 적용
    this.ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, 0, 0);
  }

  /**
   * Letterbox 스케일링 계산
   * 화면 비율을 유지하면서 뷰포트에 맞춤
   */
  calculateLetterbox() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const gameAspect = this.gameWidth / this.gameHeight;
    const windowAspect = windowWidth / windowHeight;

    if (windowAspect > gameAspect) {
      // 창이 더 넓음: pillarbox (좌우 여백)
      this.scale = windowHeight / this.gameHeight;
      this.offsetX = (windowWidth - this.gameWidth * this.scale) / 2;
      this.offsetY = 0;
    } else {
      // 창이 더 높음: letterbox (상하 여백)
      this.scale = windowWidth / this.gameWidth;
      this.offsetX = 0;
      this.offsetY = (windowHeight - this.gameHeight * this.scale) / 2;
    }
  }

  /**
   * 캔버스 클리어
   * @param {string} [color='#000000'] - 배경색
   */
  clear(color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
  }

  /**
   * 게임 오브젝트 배열 렌더링
   * @param {import('./GameObject.js').GameObject[]} objects - 렌더링할 오브젝트 배열
   */
  render(objects) {
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj.active && obj.visible) {
        obj.render(this.ctx);
      }
    }
  }

  /**
   * 윈도우 리사이즈 핸들러
   * @private
   */
  _onResize() {
    this.setupCanvas();
  }

  /**
   * 리소스 정리
   */
  destroy() {
    window.removeEventListener('resize', this._boundResize);
  }

  /**
   * 스크린 좌표를 게임 좌표로 변환
   * @param {number} screenX - 스크린 X 좌표
   * @param {number} screenY - 스크린 Y 좌표
   * @returns {{x: number, y: number}} 게임 좌표
   */
  screenToGame(screenX, screenY) {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale
    };
  }
}
