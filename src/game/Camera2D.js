/**
 * Camera2D - 2D 팔로우 카메라
 * 비행기를 부드럽게 따라가는 사이드 스크롤 카메라
 */
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  CAMERA_FOLLOW_OFFSET_X,
  CAMERA_SMOOTHNESS
} from '../engine/constants.js';

export class Camera2D {
  constructor() {
    // 카메라 위치 (월드 좌표 기준 뷰포트 왼쪽 상단)
    this.x = 0;
    this.y = 0;

    // 타겟
    this.target = null;

    // 설정
    this.followOffsetX = CAMERA_FOLLOW_OFFSET_X;
    this.smoothness = CAMERA_SMOOTHNESS;

    // 경계
    this.minX = 0;
    this.minY = 0;
    this.maxY = 0;  // 무제한 (하늘로)
  }

  /**
   * 추적 대상 설정
   */
  setTarget(target) {
    this.target = target;
  }

  /**
   * 즉시 타겟 위치로 이동
   */
  snapToTarget() {
    if (!this.target) return;

    this.x = Math.max(this.minX, this.target.x - this.followOffsetX);
    this.y = this._calculateTargetY();
  }

  /**
   * 목표 Y 위치 계산
   */
  _calculateTargetY() {
    if (!this.target) return 0;

    // 타겟을 화면 중앙에 유지하되, 지면 아래로는 가지 않음
    let targetY = this.target.y - GAME_HEIGHT / 2;

    // 최소값 제한 (화면이 지면 아래로 가지 않도록)
    targetY = Math.max(this.minY, targetY);

    return targetY;
  }

  /**
   * 매 프레임 업데이트
   */
  update(deltaTime) {
    if (!this.target) return;

    // 목표 위치
    const targetX = Math.max(this.minX, this.target.x - this.followOffsetX);
    const targetY = this._calculateTargetY();

    // 부드러운 이동 (lerp)
    this.x += (targetX - this.x) * this.smoothness;
    this.y += (targetY - this.y) * this.smoothness;

    // X는 뒤로 가지 않음 (한번 지나간 곳은 돌아오지 않음)
    this.minX = Math.max(this.minX, this.x);
  }

  /**
   * 월드 좌표를 화면 좌표로 변환
   */
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  /**
   * 화면 좌표를 월드 좌표로 변환
   */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  /**
   * 오브젝트가 화면에 보이는지 체크
   */
  isVisible(x, y, width = 0, height = 0) {
    const margin = 100; // 여유 마진
    return (
      x + width / 2 > this.x - margin &&
      x - width / 2 < this.x + GAME_WIDTH + margin &&
      y + height / 2 > this.y - margin &&
      y - height / 2 < this.y + GAME_HEIGHT + margin
    );
  }

  /**
   * 렌더링 컨텍스트에 카메라 변환 적용
   */
  applyTransform(ctx) {
    ctx.translate(-this.x, -this.y);
  }

  /**
   * 리셋
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.minX = 0;
  }
}
