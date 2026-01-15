/**
 * SlingshotGame - 슬링샷 비행 게임 메인 클래스
 * Epic Plane Evolution 스타일
 */
import { GameLoop } from '../engine/GameLoop.js';
import { Renderer } from '../engine/Renderer.js';
import { FPSCounter } from '../utils/FPSCounter.js';
import { Airplane } from './Airplane.js';
import { Slingshot } from './Slingshot.js';
import { Coin } from './Coin.js';
import { Camera2D } from './Camera2D.js';
import { UpgradeManager } from './UpgradeManager.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_HEIGHT,
  SKY_COLOR,
  GROUND_COLOR,
  SLINGSHOT_POS,
  COIN_SPAWN_INTERVAL,
  COIN_VALUE
} from '../engine/constants.js';

// 게임 상태
const GamePhase = {
  MENU: 'MENU',
  READY: 'READY',      // 슬링샷 대기
  FLYING: 'FLYING',    // 비행 중
  LANDED: 'LANDED'     // 착륙 (결과 표시)
};

export class SlingshotGame {
  constructor(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas not found: ${canvasId}`);
    }

    this.canvas = canvas;

    // 렌더러
    this.renderer = new Renderer(canvas, GAME_WIDTH, GAME_HEIGHT);
    this.ctx = this.renderer.ctx;

    // 게임 루프
    this.gameLoop = new GameLoop(
      (dt) => this._update(dt),
      () => this._render()
    );

    // FPS 카운터
    this.fpsCounter = new FPSCounter();
    this.fpsCounter.visible = true;

    // 카메라
    this.camera = new Camera2D();

    // 업그레이드 매니저
    this.upgradeManager = new UpgradeManager();

    // 슬링샷
    this.slingshot = new Slingshot();
    this.slingshot.onLaunch = (vx, vy) => this._launchPlane(vx, vy);

    // 비행기
    this.airplane = null;

    // 코인
    this.coins = [];
    this.lastCoinX = SLINGSHOT_POS.x;

    // 현재 라운드 점수
    this.roundCoins = 0;
    this.roundDistance = 0;

    // 게임 상태
    this.phase = GamePhase.MENU;

    // 입력 상태
    this.inputState = {
      pitchUp: false,
      pitchDown: false
    };

    // 이벤트 바인딩
    this._setupInput();

    // 게임 루프 시작
    this.gameLoop.start();
  }

  /**
   * 입력 설정
   */
  _setupInput() {
    // 마우스/터치 이벤트
    this.canvas.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
    this.canvas.addEventListener('pointercancel', (e) => this._onPointerUp(e));

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => this._onKeyDown(e));
    document.addEventListener('keyup', (e) => this._onKeyUp(e));

    // 터치 기본 동작 방지
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  }

  /**
   * 포인터 좌표를 게임 좌표로 변환
   */
  _getGameCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return this.renderer.screenToGame(screenX, screenY);
  }

  _onPointerDown(e) {
    const pos = this._getGameCoords(e);

    if (this.phase === GamePhase.MENU) {
      this._startGame();
    } else if (this.phase === GamePhase.READY) {
      this.slingshot.startDrag(pos.x, pos.y);
    } else if (this.phase === GamePhase.FLYING) {
      // 터치/클릭으로 피치 업
      this.inputState.pitchUp = true;
    } else if (this.phase === GamePhase.LANDED) {
      this._returnToReady();
    }
  }

  _onPointerMove(e) {
    if (this.phase === GamePhase.READY) {
      const pos = this._getGameCoords(e);
      this.slingshot.drag(pos.x, pos.y);
    }
  }

  _onPointerUp(e) {
    if (this.phase === GamePhase.READY) {
      this.slingshot.release();
    } else if (this.phase === GamePhase.FLYING) {
      this.inputState.pitchUp = false;
    }
  }

  _onKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        this.inputState.pitchUp = true;
        if (this.phase === GamePhase.MENU) this._startGame();
        if (this.phase === GamePhase.LANDED) this._returnToReady();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.inputState.pitchDown = true;
        break;
      case 'f':
      case 'F':
        this.fpsCounter.toggle();
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        this.inputState.pitchUp = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.inputState.pitchDown = false;
        break;
    }
  }

  /**
   * 게임 시작 (MENU → READY)
   */
  _startGame() {
    this.phase = GamePhase.READY;
    this._resetRound();
  }

  /**
   * 라운드 초기화
   */
  _resetRound() {
    // 비행기 생성
    const upgrades = this.upgradeManager.getAllMultipliers();
    this.airplane = new Airplane(upgrades);
    this.airplane.x = SLINGSHOT_POS.x;
    this.airplane.y = SLINGSHOT_POS.y;

    // 카메라 리셋
    this.camera.reset();
    this.camera.setTarget(this.airplane);

    // 슬링샷 리셋
    this.slingshot.reset();

    // 코인 리셋
    this.coins = [];
    this.lastCoinX = SLINGSHOT_POS.x + 300;
    this._spawnInitialCoins();

    // 점수 리셋
    this.roundCoins = 0;
    this.roundDistance = 0;
  }

  /**
   * 초기 코인 생성
   */
  _spawnInitialCoins() {
    for (let i = 0; i < 20; i++) {
      this._spawnCoin();
    }
  }

  /**
   * 코인 생성
   */
  _spawnCoin() {
    const coin = new Coin();
    coin.x = this.lastCoinX + COIN_SPAWN_INTERVAL * (0.5 + Math.random());
    coin.y = GAME_HEIGHT - GROUND_HEIGHT - 50 - Math.random() * 400;
    coin.active = true;
    this.coins.push(coin);
    this.lastCoinX = coin.x;
  }

  /**
   * 비행기 발사
   */
  _launchPlane(vx, vy) {
    if (!this.airplane) return;

    this.airplane.launch(vx, vy);
    this.phase = GamePhase.FLYING;
    this.camera.snapToTarget();
  }

  /**
   * 착륙 처리
   */
  _onLanded() {
    this.phase = GamePhase.LANDED;

    // 코인 보상 저장
    this.upgradeManager.addCoins(this.roundCoins);

    this.roundDistance = Math.floor(this.airplane.distanceTraveled);
  }

  /**
   * 다시 준비 상태로
   */
  _returnToReady() {
    this.phase = GamePhase.READY;
    this._resetRound();
  }

  /**
   * 업데이트
   */
  _update(deltaTime) {
    this.fpsCounter.update(deltaTime);

    if (this.phase === GamePhase.READY) {
      // 슬링샷에 비행기 위치 동기화
      if (this.airplane) {
        const pos = this.slingshot.getPlanePosition();
        this.airplane.x = pos.x;
        this.airplane.y = pos.y;
      }
    } else if (this.phase === GamePhase.FLYING) {
      // 입력 처리
      if (this.inputState.pitchUp) {
        this.airplane.pitchUp(deltaTime);
      }
      if (this.inputState.pitchDown) {
        this.airplane.pitchDown(deltaTime);
      }

      // 비행기 업데이트
      this.airplane.update(deltaTime);

      // 카메라 업데이트
      this.camera.update(deltaTime);

      // 코인 업데이트 및 충돌 체크
      for (const coin of this.coins) {
        if (coin.active) {
          coin.update(deltaTime);
          if (coin.checkCollision(this.airplane)) {
            this.roundCoins += COIN_VALUE;
          }
        }
      }

      // 더 많은 코인 생성 (비행기가 앞으로 갈수록)
      while (this.lastCoinX < this.airplane.x + GAME_WIDTH * 2) {
        this._spawnCoin();
      }

      // 착륙 체크
      if (this.airplane.hasLanded) {
        this._onLanded();
      }
    }

    // 코인 애니메이션 (모든 상태에서)
    for (const coin of this.coins) {
      if (coin.active) {
        coin.update(deltaTime);
      }
    }
  }

  /**
   * 렌더링
   */
  _render() {
    const ctx = this.ctx;

    // 배경 클리어
    this.renderer.clear(SKY_COLOR);

    // 카메라 변환 적용
    ctx.save();
    this.camera.applyTransform(ctx);

    // 지면 렌더링
    this._renderGround(ctx);

    // 코인 렌더링
    for (const coin of this.coins) {
      if (coin.active && this.camera.isVisible(coin.x, coin.y, 30, 30)) {
        coin.render(ctx);
      }
    }

    // 슬링샷 렌더링 (카메라 영역 내에서만)
    if (this.camera.isVisible(SLINGSHOT_POS.x, SLINGSHOT_POS.y, 100, 100)) {
      this.slingshot.render(ctx);
    }

    // 비행기 렌더링
    if (this.airplane) {
      this.airplane.render(ctx);
    }

    ctx.restore();

    // UI 렌더링 (카메라 변환 없이)
    this._renderUI(ctx);

    // FPS 카운터
    this.fpsCounter.render(ctx);
  }

  /**
   * 지면 렌더링
   */
  _renderGround(ctx) {
    const groundY = GAME_HEIGHT - GROUND_HEIGHT;

    // 풀밭
    ctx.fillStyle = GROUND_COLOR;
    ctx.fillRect(
      this.camera.x - 100,
      groundY,
      GAME_WIDTH + 200 + this.camera.x,
      GROUND_HEIGHT
    );

    // 땅 경계선
    ctx.strokeStyle = '#1a5c1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.camera.x - 100, groundY);
    ctx.lineTo(this.camera.x + GAME_WIDTH + 100, groundY);
    ctx.stroke();
  }

  /**
   * UI 렌더링
   */
  _renderUI(ctx) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';

    // 코인 표시
    ctx.fillText(`💰 ${this.upgradeManager.coins + this.roundCoins}`, 20, 60);

    if (this.phase === GamePhase.FLYING || this.phase === GamePhase.LANDED) {
      // 거리 표시
      const distance = Math.floor(this.airplane?.distanceTraveled || 0);
      ctx.fillText(`📏 ${distance}m`, 20, 90);
    }

    // 상태별 메시지
    if (this.phase === GamePhase.MENU) {
      this._renderCenteredText(ctx, '🛩️ Epic Plane Evolution', 80);
      this._renderCenteredText(ctx, '화면을 클릭하여 시작', 40, 50);
    } else if (this.phase === GamePhase.READY) {
      this._renderCenteredText(ctx, '⬅️ 슬링샷을 당겨서 발사!', 30, -200);
    } else if (this.phase === GamePhase.LANDED) {
      this._renderCenteredText(ctx, `🎉 ${this.roundDistance}m 비행!`, 60);
      this._renderCenteredText(ctx, `💰 +${this.roundCoins} 코인`, 40, 60);
      this._renderCenteredText(ctx, '클릭하여 다시 시도', 24, 120);
    }
  }

  /**
   * 중앙 정렬 텍스트
   */
  _renderCenteredText(ctx, text, fontSize, offsetY = 0) {
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT / 2 + offsetY;

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }

  /**
   * 정리
   */
  destroy() {
    this.gameLoop.stop();
    this.renderer.destroy();
  }
}
