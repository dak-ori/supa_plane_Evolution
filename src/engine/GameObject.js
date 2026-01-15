/**
 * GameObject - 화면에 표시되는 모든 게임 요소의 기본 클래스
 *
 * 모든 게임 오브젝트는 이 클래스를 상속받아 구현합니다.
 * ObjectPool과 함께 사용되어 GC 압력을 최소화합니다.
 */
export class GameObject {
  constructor() {
    /** @type {number} X 좌표 (게임 좌표계) */
    this.x = 0;

    /** @type {number} Y 좌표 (게임 좌표계) */
    this.y = 0;

    /** @type {number} 너비 */
    this.width = 0;

    /** @type {number} 높이 */
    this.height = 0;

    /** @type {number} 회전 각도 (라디안) */
    this.rotation = 0;

    /** @type {boolean} 활성 상태 */
    this.active = false;

    /** @type {boolean} 렌더링 여부 */
    this.visible = true;
  }

  /**
   * 매 프레임 업데이트 로직 (서브클래스에서 오버라이드)
   * @param {number} deltaTime - 이전 프레임 이후 경과 시간 (초)
   */
  update(deltaTime) {
    // 서브클래스에서 구현
  }

  /**
   * 렌더링 로직 (서브클래스에서 오버라이드)
   * @param {CanvasRenderingContext2D} ctx - 2D 렌더링 컨텍스트
   */
  render(ctx) {
    // 서브클래스에서 구현
  }

  /**
   * 풀 반환 시 상태 초기화
   * 서브클래스에서 오버라이드 시 반드시 super.reset() 호출
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.active = false;
    this.visible = true;
  }

  /**
   * 충돌 영역 반환
   * @returns {{x: number, y: number, width: number, height: number}} 경계 박스
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}
