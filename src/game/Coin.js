/**
 * Coin - 수집 가능한 코인
 */
import { GameObject } from '../engine/GameObject.js';
import { COIN_RADIUS, COIN_VALUE } from '../engine/constants.js';

export class Coin extends GameObject {
  constructor() {
    super();

    this.radius = COIN_RADIUS;
    this.value = COIN_VALUE;
    this.collected = false;

    // 애니메이션
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 3;
    this.bobAmount = 5;
    this.rotation = 0;
    this.rotationSpeed = 2;
  }

  update(deltaTime) {
    if (this.collected) return;

    // 위아래 흔들림
    this.bobOffset += this.bobSpeed * deltaTime;

    // 회전
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * 비행기와 충돌 체크
   */
  checkCollision(airplane) {
    if (this.collected) return false;

    const dx = this.x - airplane.x;
    const dy = this.y - airplane.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 충돌 판정 (비행기 크기 + 코인 크기)
    const hitDist = this.radius + Math.max(airplane.width, airplane.height) / 2;

    if (dist < hitDist) {
      this.collect();
      return true;
    }
    return false;
  }

  /**
   * 코인 수집
   */
  collect() {
    this.collected = true;
    this.active = false;
  }

  /**
   * 리셋
   */
  reset() {
    super.reset();
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.rotation = 0;
  }

  /**
   * 렌더링
   */
  render(ctx) {
    if (this.collected) return;

    const bobY = Math.sin(this.bobOffset) * this.bobAmount;

    ctx.save();
    ctx.translate(this.x, this.y + bobY);
    ctx.rotate(this.rotation);

    // 코인 외곽 (금색)
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 코인 내부 무늬
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1;
    ctx.stroke();

    // $ 심볼
    ctx.fillStyle = '#DAA520';
    ctx.font = `bold ${this.radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    ctx.restore();
  }
}
