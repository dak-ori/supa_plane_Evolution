# Quickstart: Game Engine Core

**Feature**: 001-game-engine-core
**Date**: 2025-01-15

## Prerequisites

- Modern browser (Chrome, Edge, Safari, Firefox - latest 2 versions)
- Local web server (for ES Modules support)

---

## Basic Setup

### 1. HTML Structure

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Smooth Flight</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    #game-canvas {
      touch-action: none;
    }
  </style>
</head>
<body>
  <canvas id="game-canvas"></canvas>
  <script type="module" src="src/index.js"></script>
</body>
</html>
```

### 2. Initialize Game

```javascript
// src/index.js
import { Game } from './engine/Game.js';

const game = new Game('game-canvas', {
  showFPS: true  // 개발 중 FPS 표시
});

// 게임 시작
game.start();
```

---

## Creating Game Objects

### 1. Define a Custom Object

```javascript
// src/objects/Ball.js
import { GameObject } from '../engine/GameObject.js';

export class Ball extends GameObject {
  constructor() {
    super();
    this.velocityX = 0;
    this.velocityY = 0;
    this.radius = 20;
    this.color = '#ff0000';
  }

  update(deltaTime) {
    // 위치 업데이트
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  reset() {
    super.reset();
    this.velocityX = 0;
    this.velocityY = 0;
    this.radius = 20;
    this.color = '#ff0000';
  }
}
```

### 2. Use Object Pool

```javascript
// src/index.js
import { Game } from './engine/Game.js';
import { ObjectPool } from './engine/ObjectPool.js';
import { Ball } from './objects/Ball.js';

const game = new Game('game-canvas');
const ballPool = new ObjectPool(Ball, 20);

// 공 생성
function spawnBall(x, y) {
  const ball = ballPool.acquire();
  ball.x = x;
  ball.y = y;
  ball.velocityX = Math.random() * 200 - 100;
  ball.velocityY = Math.random() * 200 - 100;
  ball.active = true;
  game.addObject(ball);
}

// 공 제거
function despawnBall(ball) {
  game.removeObject(ball);
  ballPool.release(ball);
}
```

---

## Handling Input

```javascript
// src/index.js
const inputManager = game.inputManager;

inputManager.onPointerDown = (event) => {
  console.log(`Pointer down at (${event.x}, ${event.y})`);
  spawnBall(event.x, event.y);
};

inputManager.onPointerMove = (event) => {
  // 드래그 처리
  if (event.prevX !== null) {
    const deltaX = event.x - event.prevX;
    const deltaY = event.y - event.prevY;
    console.log(`Drag delta: (${deltaX}, ${deltaY})`);
  }
};
```

---

## Game State Management

```javascript
// 상태 변화 감지
game.onStateChange((newState, oldState) => {
  console.log(`State changed: ${oldState} → ${newState}`);

  if (newState === 'PAUSED') {
    showPauseOverlay();
  } else if (newState === 'GAME_OVER') {
    showGameOverScreen();
  }
});

// UI 버튼 연결
document.getElementById('pause-btn').onclick = () => game.pause();
document.getElementById('resume-btn').onclick = () => game.resume();
document.getElementById('menu-btn').onclick = () => game.returnToMenu();
```

---

## Development Tips

### FPS Monitoring

```javascript
// 키보드로 FPS 토글
document.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    game.toggleFPS();
  }
});
```

### Performance Profiling

```javascript
// Chrome DevTools에서 Performance 탭 사용
// 1. F12 → Performance 탭
// 2. Record 버튼 클릭
// 3. 게임 플레이
// 4. Stop 후 분석

// 또는 코드로 측정
console.time('update');
game.objects.forEach(obj => obj.update(deltaTime));
console.timeEnd('update');
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 캔버스가 흐릿함 | DPR 설정 확인 (Game 클래스에서 자동 처리) |
| 터치가 스크롤됨 | CSS `touch-action: none` 확인 |
| 프레임 드롭 | 오브젝트 수 확인 (50개 이하 권장) |
| 탭 전환 시 게임 이상 | Page Visibility 처리 확인 (자동 일시정지) |

---

## File Structure Reference

```
src/
├── engine/
│   ├── Game.js           # 메인 게임 클래스
│   ├── GameLoop.js       # 게임 루프
│   ├── Renderer.js       # Canvas 렌더링
│   ├── InputManager.js   # 입력 처리
│   ├── ObjectPool.js     # 오브젝트 풀링
│   └── GameObject.js     # 기본 오브젝트 클래스
├── utils/
│   └── FPSCounter.js     # FPS 카운터
├── objects/
│   └── (게임 오브젝트들)
└── index.js              # 엔트리포인트

index.html                # HTML 파일
```

---

## Next Steps

1. **002-aircraft-system**: 비행기 시스템 구현
2. **003-path-drawing**: 경로 그리기 구현
3. **004-collision-score**: 충돌 감지 및 점수 시스템
