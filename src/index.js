/**
 * Smooth Flight - Game Entry Point
 */
import { Game } from './engine/Game.js';
import { GameObject } from './engine/GameObject.js';

// 테스트용 움직이는 오브젝트
class TestBall extends GameObject {
  constructor() {
    super();
    this.vx = 0;
    this.vy = 0;
    this.radius = 20;
    this.color = '#ff6b6b';
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // 경계 충돌 처리
    if (this.x - this.radius < 0 || this.x + this.radius > 720) {
      this.vx *= -1;
      this.x = Math.max(this.radius, Math.min(720 - this.radius, this.x));
    }
    if (this.y - this.radius < 0 || this.y + this.radius > 1280) {
      this.vy *= -1;
      this.y = Math.max(this.radius, Math.min(1280 - this.radius, this.y));
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  reset() {
    super.reset();
    this.vx = 0;
    this.vy = 0;
    this.radius = 20;
    this.color = '#ff6b6b';
  }
}

// 게임 초기화
const game = new Game('game-canvas', {
  showFPS: true
});

// 상태 변경 콜백
game.onStateChange((newState, oldState) => {
  console.log(`Game state: ${oldState} → ${newState}`);
});

// 테스트 오브젝트 생성 함수
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

function createTestObjects() {
  for (let i = 0; i < 20; i++) {
    const ball = new TestBall();
    ball.x = Math.random() * 680 + 20;
    ball.y = Math.random() * 1240 + 20;
    ball.vx = (Math.random() - 0.5) * 400;
    ball.vy = (Math.random() - 0.5) * 400;
    ball.radius = Math.random() * 15 + 10;
    ball.color = colors[i % colors.length];
    ball.active = true;
    game.addObject(ball);
  }
}

// 초기 테스트 오브젝트 생성 및 게임 시작
createTestObjects();
game.start();

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'f':
      game.toggleFPS();
      break;
    case 'p':
      if (game.state === 'PLAYING') {
        game.pause();
      } else if (game.state === 'PAUSED') {
        game.resume();
      }
      break;
    case 'escape':
      if (game.state === 'PAUSED' || game.state === 'GAME_OVER') {
        game.returnToMenu();
        createTestObjects();
        game.start();
      }
      break;
  }
});

// 디버깅용 전역 접근
window.game = game;

console.log('Smooth Flight Game Engine initialized');
console.log('Controls: F=FPS toggle, P=Pause/Resume, ESC=Restart');
