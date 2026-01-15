/**
 * FPSCounter - 프레임 레이트 모니터링 유틸리티
 *
 * 성능 모니터링을 위한 FPS 카운터로, 토글하여 화면에 표시할 수 있습니다.
 */
export class FPSCounter {
  constructor() {
    /** @type {boolean} 표시 여부 */
    this.visible = false;

    /** @type {number} 현재 FPS */
    this.fps = 0;

    /** @type {number} 프레임 카운트 */
    this._frameCount = 0;

    /** @type {number} 경과 시간 누적 */
    this._elapsed = 0;

    /** @type {number} 업데이트 간격 (초) */
    this._updateInterval = 0.5;
  }

  /**
   * FPS 업데이트
   * @param {number} deltaTime - 이전 프레임 이후 경과 시간 (초)
   */
  update(deltaTime) {
    this._frameCount++;
    this._elapsed += deltaTime;

    // 0.5초마다 FPS 계산
    if (this._elapsed >= this._updateInterval) {
      this.fps = Math.round(this._frameCount / this._elapsed);
      this._frameCount = 0;
      this._elapsed = 0;
    }
  }

  /**
   * FPS 카운터 렌더링
   * @param {CanvasRenderingContext2D} ctx - 2D 렌더링 컨텍스트
   */
  render(ctx) {
    if (!this.visible) return;

    const text = `FPS: ${this.fps}`;
    const padding = 8;
    const fontSize = 16;

    ctx.save();

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = `${fontSize}px monospace`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillRect(padding, padding, textWidth + padding * 2, fontSize + padding);

    // 텍스트
    ctx.fillStyle = this.fps >= 55 ? '#00ff00' : this.fps >= 30 ? '#ffff00' : '#ff0000';
    ctx.fillText(text, padding * 2, padding + fontSize);

    ctx.restore();
  }

  /**
   * 표시 여부 토글
   */
  toggle() {
    this.visible = !this.visible;
  }
}
