/**
 * GameState - 게임 상태 열거형
 *
 * 게임의 현재 상태를 나타내는 상수들입니다.
 */
export const GameState = {
  /** 메인 메뉴 화면 */
  MENU: 'MENU',

  /** 게임 진행 중 */
  PLAYING: 'PLAYING',

  /** 일시정지 */
  PAUSED: 'PAUSED',

  /** 게임오버 */
  GAME_OVER: 'GAME_OVER'
};

/**
 * 상태 전환 유효성 검사
 * @param {string} from - 현재 상태
 * @param {string} to - 목표 상태
 * @returns {boolean} 전환 가능 여부
 */
export function isValidTransition(from, to) {
  const validTransitions = {
    [GameState.MENU]: [GameState.PLAYING],
    [GameState.PLAYING]: [GameState.PAUSED, GameState.GAME_OVER],
    [GameState.PAUSED]: [GameState.PLAYING, GameState.MENU],
    [GameState.GAME_OVER]: [GameState.MENU]
  };

  const allowed = validTransitions[from];
  return allowed ? allowed.includes(to) : false;
}
