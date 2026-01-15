/**
 * Slingshot - 슬링샷 발사대
 * 마우스/터치로 당겨서 비행기 발사
 */
import {
  SLINGSHOT_MAX_PULL,
  SLINGSHOT_POWER_MULT,
  SLINGSHOT_POS
} from '../engine/constants.js';

export class Slingshot {
  constructor() {
    // 슬링샷 기준점
    this.x = SLINGSHOT_POS.x;
    this.y = SLINGSHOT_POS.y;

    // 당기기 상태
    this.isDragging = false;
    this.pullX = 0;
    this.pullY = 0;

    // 발사 콜백
    this.onLaunch = null;
  }

  /**
   * 드래그 시작
   */
  startDrag(x, y) {
    this.isDragging = true;
    this._updatePull(x, y);
  }

  /**
   * 드래그 중
   */
  drag(x, y) {
    if (!this.isDragging) return;
    this._updatePull(x, y);
  }

  /**
   * 드래그 종료 (발사)
   */
  release() {
    if (!this.isDragging) return;

    this.isDragging = false;

    // 발사 속도 계산 (당긴 반대 방향)
    const power = this.getPullDistance() / SLINGSHOT_MAX_PULL;
    const vx = -this.pullX * SLINGSHOT_POWER_MULT;
    const vy = -this.pullY * SLINGSHOT_POWER_MULT;

    // 콜백 호출
    if (this.onLaunch && power > 0.1) {
      this.onLaunch(vx, vy);
    }

    // 리셋
    this.pullX = 0;
    this.pullY = 0;
  }

  /**
   * 당김 거리/방향 업데이트
   */
  _updatePull(x, y) {
    // 슬링샷 기준점에서의 오프셋
    let dx = x - this.x;
    let dy = y - this.y;

    // 최대 당김 거리 제한
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > SLINGSHOT_MAX_PULL) {
      const scale = SLINGSHOT_MAX_PULL / dist;
      dx *= scale;
      dy *= scale;
    }

    // 왼쪽으로만 당길 수 있도록 (발사는 오른쪽으로)
    if (dx > 0) dx = 0;

    this.pullX = dx;
    this.pullY = dy;
  }

  /**
   * 현재 당김 거리
   */
  getPullDistance() {
    return Math.sqrt(this.pullX * this.pullX + this.pullY * this.pullY);
  }

  /**
   * 발사 파워 (0~1)
   */
  getPower() {
    return Math.min(1, this.getPullDistance() / SLINGSHOT_MAX_PULL);
  }

  /**
   * 비행기 위치 (슬링샷에 장착된 상태)
   */
  getPlanePosition() {
    return {
      x: this.x + this.pullX,
      y: this.y + this.pullY
    };
  }

  /**
   * 렌더링
   */
  render(ctx) {
    // 슬링샷 기둥
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x - 10, this.y, 20, 80);

    // Y자 모양 윗부분
    ctx.beginPath();
    ctx.moveTo(this.x - 10, this.y);
    ctx.lineTo(this.x - 25, this.y - 40);
    ctx.lineTo(this.x - 15, this.y - 40);
    ctx.lineTo(this.x, this.y - 10);
    ctx.lineTo(this.x + 15, this.y - 40);
    ctx.lineTo(this.x + 25, this.y - 40);
    ctx.lineTo(this.x + 10, this.y);
    ctx.closePath();
    ctx.fill();

    // 고무줄 (당기고 있을 때)
    if (this.isDragging) {
      const planePos = this.getPlanePosition();

      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 4;

      // 왼쪽 고무줄
      ctx.beginPath();
      ctx.moveTo(this.x - 20, this.y - 35);
      ctx.lineTo(planePos.x, planePos.y);
      ctx.stroke();

      // 오른쪽 고무줄
      ctx.beginPath();
      ctx.moveTo(this.x + 20, this.y - 35);
      ctx.lineTo(planePos.x, planePos.y);
      ctx.stroke();

      // 파워 게이지
      this._renderPowerGauge(ctx);
    } else {
      // 대기 상태 고무줄
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.x - 20, this.y - 35);
      ctx.quadraticCurveTo(this.x, this.y - 20, this.x + 20, this.y - 35);
      ctx.stroke();
    }
  }

  /**
   * 파워 게이지 렌더링
   */
  _renderPowerGauge(ctx) {
    const power = this.getPower();

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 200, 20);

    // 파워 바
    const color = power < 0.3 ? '#4CAF50' : power < 0.7 ? '#FFC107' : '#F44336';
    ctx.fillStyle = color;
    ctx.fillRect(20, 20, 200 * power, 20);

    // 테두리
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 200, 20);

    // 텍스트
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.fillText(`Power: ${Math.round(power * 100)}%`, 25, 35);
  }

  /**
   * 리셋
   */
  reset() {
    this.isDragging = false;
    this.pullX = 0;
    this.pullY = 0;
  }
}
