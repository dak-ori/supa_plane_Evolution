/**
 * Game Engine Constants
 * Epic Plane Evolution 스타일 슬링샷 비행 게임
 */

// 게임 해상도 (HD 가로 모드 - 사이드 스크롤)
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// 성능 관련
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP = 1 / TARGET_FPS;
export const MAX_UPDATES = 240;

// 물리 상수
export const GRAVITY = 400;           // 중력 가속도 (px/s²)
export const AIR_RESISTANCE = 0.02;   // 공기 저항 계수
export const LIFT_COEFFICIENT = 0.8;  // 양력 계수
export const MIN_SPEED_FOR_LIFT = 50; // 양력 발생 최소 속도

// 슬링샷 설정
export const SLINGSHOT_MAX_PULL = 150;    // 최대 당기기 거리 (px)
export const SLINGSHOT_POWER_MULT = 8;    // 발사 파워 배수
export const SLINGSHOT_POS = { x: 150, y: 500 }; // 슬링샷 위치

// 비행기 설정
export const PLANE_ROTATION_SPEED = 3;    // 회전 속도 (rad/s)
export const PLANE_INITIAL_FUEL = 100;    // 초기 연료
export const PLANE_BOOST_COST = 20;       // 부스트 연료 소모

// 카메라 설정
export const CAMERA_FOLLOW_OFFSET_X = 300;  // 비행기 앞 여백
export const CAMERA_SMOOTHNESS = 0.08;      // 카메라 부드러움

// 월드 설정
export const GROUND_HEIGHT = 100;         // 지면 높이 (아래에서부터)
export const SKY_COLOR = '#87CEEB';
export const GROUND_COLOR = '#228B22';

// 코인 설정
export const COIN_RADIUS = 15;
export const COIN_VALUE = 10;
export const COIN_SPAWN_INTERVAL = 200;   // 코인 생성 간격 (px)

// 업그레이드 초기값
export const UPGRADE_DEFAULTS = {
  engine: 1,      // 초기 파워 배수
  wings: 1,       // 양력 배수
  fuselage: 1,    // 공기저항 감소
  fuel: 1         // 연료 배수
};
