/**
 * InputEvent - 사용자 입력 정보를 담는 데이터 객체
 *
 * @typedef {Object} InputEvent
 * @property {number} x - 게임 좌표계 X
 * @property {number} y - 게임 좌표계 Y
 * @property {'mouse'|'touch'|'pen'} type - 입력 장치 타입
 * @property {number} pointerId - 포인터 고유 ID
 * @property {boolean} isPrimary - 주 포인터 여부
 * @property {number|null} prevX - 이전 X 좌표
 * @property {number|null} prevY - 이전 Y 좌표
 */

/**
 * InputEvent 생성 헬퍼
 * @param {number} x
 * @param {number} y
 * @param {string} type
 * @param {number} pointerId
 * @param {boolean} isPrimary
 * @returns {InputEvent}
 */
export function createInputEvent(x, y, type, pointerId, isPrimary) {
  return {
    x,
    y,
    type,
    pointerId,
    isPrimary,
    prevX: null,
    prevY: null
  };
}
