/**
 * Airplane - 물리 기반 비행기
 * 중력, 양력, 공기저항을 적용한 비행 시뮬레이션
 */
import { GameObject } from '../engine/GameObject.js';
import {
  GRAVITY,
  AIR_RESISTANCE,
  LIFT_COEFFICIENT,
  MIN_SPEED_FOR_LIFT,
  PLANE_ROTATION_SPEED,
  GROUND_HEIGHT,
  GAME_HEIGHT
} from '../engine/constants.js';

export class Airplane extends GameObject {
  constructor(upgrades = {}) {
    super();

    // 물리 상태
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;  // 기울기 (라디안)

    // 업그레이드 배수
    this.engineMult = upgrades.engine || 1;
    this.wingsMult = upgrades.wings || 1;
    this.fuselageMult = upgrades.fuselage || 1;

    // 비행 상태
    this.isFlying = false;
    this.isLaunched = false;
    this.hasLanded = false;

    // 크기
    this.width = 60;
    this.height = 20;

    // 거리 추적
    this.distanceTraveled = 0;
    this.maxHeight = 0;
    this.startX = 0;
  }

  /**
   * 슬링샷에서 발사
   */
  launch(vx, vy) {
    this.vx = vx * this.engineMult;
    this.vy = vy * this.engineMult;
    this.angle = Math.atan2(vy, vx);
    this.isFlying = true;
    this.isLaunched = true;
    this.startX = this.x;
  }

  /**
   * 위로 기울이기 (양력 증가)
   */
  pitchUp(deltaTime) {
    if (!this.isFlying) return;
    this.angle -= PLANE_ROTATION_SPEED * deltaTime;
    this.angle = Math.max(this.angle, -Math.PI / 3); // 최대 60도 위
  }

  /**
   * 아래로 기울이기 (급강하)
   */
  pitchDown(deltaTime) {
    if (!this.isFlying) return;
    this.angle += PLANE_ROTATION_SPEED * deltaTime;
    this.angle = Math.min(this.angle, Math.PI / 3); // 최대 60도 아래
  }

  /**
   * 물리 업데이트
   */
  update(deltaTime) {
    if (!this.isFlying || this.hasLanded) return;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    // 1. 중력 적용
    this.vy += GRAVITY * deltaTime;

    // 2. 공기 저항 (속도에 비례)
    const dragFactor = 1 - (AIR_RESISTANCE / this.fuselageMult);
    this.vx *= dragFactor;
    this.vy *= dragFactor;

    // 3. 양력 (속도와 기울기에 따라)
    if (speed > MIN_SPEED_FOR_LIFT) {
      // 기울기가 위를 향할수록 양력 증가
      const liftAngle = -Math.sin(this.angle);
      const lift = LIFT_COEFFICIENT * this.wingsMult * speed * liftAngle * deltaTime;
      this.vy -= lift;
    }

    // 4. 위치 업데이트
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // 5. 비행기 각도를 속도 방향으로 자연스럽게 맞춤
    const targetAngle = Math.atan2(this.vy, this.vx);
    this.angle = this.angle * 0.9 + targetAngle * 0.1;

    // 6. 거리 추적
    this.distanceTraveled = Math.max(0, this.x - this.startX);
    this.maxHeight = Math.max(this.maxHeight, GAME_HEIGHT - GROUND_HEIGHT - this.y);

    // 7. 지면 충돌 체크
    const groundY = GAME_HEIGHT - GROUND_HEIGHT;
    if (this.y >= groundY - this.height / 2) {
      this.y = groundY - this.height / 2;
      this.land();
    }
  }

  /**
   * 착륙 처리
   */
  land() {
    this.isFlying = false;
    this.hasLanded = true;
    this.vx = 0;
    this.vy = 0;
  }

  /**
   * 현재 속도 반환
   */
  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  /**
   * 리셋
   */
  reset() {
    super.reset();
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.isFlying = false;
    this.isLaunched = false;
    this.hasLanded = false;
    this.distanceTraveled = 0;
    this.maxHeight = 0;
    this.startX = 0;
  }

  /**
   * 렌더링
   */
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // 동체 (흰색)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 날개 (파란색)
    ctx.fillStyle = '#4A90D9';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-15, -20);
    ctx.lineTo(5, -20);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();

    // 꼬리 날개
    ctx.fillStyle = '#D94A4A';
    ctx.beginPath();
    ctx.moveTo(-this.width / 2 + 5, 0);
    ctx.lineTo(-this.width / 2, -12);
    ctx.lineTo(-this.width / 2 + 10, 0);
    ctx.closePath();
    ctx.fill();

    // 조종석 (유리)
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(this.width / 4, -2, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
