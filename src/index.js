/**
 * Epic Plane Evolution - Entry Point
 * 슬링샷 비행 게임
 */
import { SlingshotGame } from './game/SlingshotGame.js';

// 게임 인스턴스 생성
const game = new SlingshotGame('game-canvas');

// 디버깅용 전역 접근
window.game = game;

console.log('🛩️ Epic Plane Evolution');
console.log('조작법:');
console.log('  - 마우스/터치: 슬링샷 당기기, 비행 중 위로 기울이기');
console.log('  - W/↑/Space: 위로 기울이기');
console.log('  - S/↓: 아래로 기울이기');
console.log('  - F: FPS 토글');
