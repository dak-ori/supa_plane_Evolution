# Engine API Contract

**Module**: Game Engine Core
**Version**: 1.0.0
**Date**: 2025-01-15

## Overview

게임 엔진 코어의 공개 인터페이스 정의. 다른 게임 시스템(Aircraft, Path Drawing, Collision 등)이 이 인터페이스를 통해 엔진과 상호작용한다.

---

## Game Class Interface

### Constructor

```javascript
new Game(canvasId: string, config?: Partial<GameConfig>)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| canvasId | string | Yes | Canvas 요소의 ID |
| config | Partial<GameConfig> | No | 게임 설정 오버라이드 |

**Throws**: `Error` if canvas element not found

---

### Properties

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| state | GameState | read-only | 현재 게임 상태 |
| config | GameConfig | read-only | 게임 설정 |
| canvas | HTMLCanvasElement | read-only | 캔버스 요소 |

---

### Methods

#### start()
게임을 시작하고 PLAYING 상태로 전환.

```javascript
game.start(): void
```

**Pre-condition**: `state === GameState.MENU`
**Post-condition**: `state === GameState.PLAYING`, 게임 루프 시작

---

#### pause()
게임을 일시정지.

```javascript
game.pause(): void
```

**Pre-condition**: `state === GameState.PLAYING`
**Post-condition**: `state === GameState.PAUSED`, 업데이트 중지 (렌더링은 유지)

---

#### resume()
일시정지된 게임을 재개.

```javascript
game.resume(): void
```

**Pre-condition**: `state === GameState.PAUSED`
**Post-condition**: `state === GameState.PLAYING`, 업데이트 재개

---

#### gameOver()
게임오버 상태로 전환.

```javascript
game.gameOver(): void
```

**Pre-condition**: `state === GameState.PLAYING`
**Post-condition**: `state === GameState.GAME_OVER`, 업데이트 중지

---

#### returnToMenu()
메인 메뉴로 복귀. 모든 게임 오브젝트 정리.

```javascript
game.returnToMenu(): void
```

**Pre-condition**: `state !== GameState.MENU`
**Post-condition**: `state === GameState.MENU`, 모든 풀 오브젝트 반환

---

#### addObject(object)
게임 오브젝트를 활성 목록에 추가.

```javascript
game.addObject(object: GameObject): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| object | GameObject | 추가할 게임 오브젝트 |

---

#### removeObject(object)
게임 오브젝트를 활성 목록에서 제거.

```javascript
game.removeObject(object: GameObject): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| object | GameObject | 제거할 게임 오브젝트 |

---

#### getObjects()
활성 게임 오브젝트 목록 반환.

```javascript
game.getObjects(): GameObject[]
```

**Returns**: 활성 상태인 모든 게임 오브젝트 배열 (읽기 전용 복사본 아님, 직접 수정 금지)

---

#### toggleFPS()
FPS 카운터 표시 토글.

```javascript
game.toggleFPS(): void
```

---

### Events

게임은 이벤트 기반 통신을 위해 콜백을 등록할 수 있다.

#### onStateChange

```javascript
game.onStateChange(callback: (newState: GameState, oldState: GameState) => void): void
```

---

## ObjectPool Interface

### Constructor

```javascript
new ObjectPool(ObjectType: Constructor<T>, initialSize?: number)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ObjectType | Constructor<T> | - | GameObject 서브클래스 생성자 |
| initialSize | number | 10 | 초기 풀 크기 |

---

### Methods

#### acquire()
풀에서 오브젝트를 획득.

```javascript
pool.acquire(): T
```

**Returns**: 초기화된 오브젝트 (active = false 상태)
**Note**: 풀이 비어있으면 자동으로 확장

---

#### release(object)
오브젝트를 풀에 반환.

```javascript
pool.release(object: T): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| object | T | 반환할 오브젝트 |

**Pre-condition**: object가 이 풀에서 획득된 것
**Post-condition**: `object.reset()` 호출됨, 풀에 반환됨

---

#### releaseAll()
모든 사용 중인 오브젝트를 반환.

```javascript
pool.releaseAll(): void
```

---

#### getActiveCount()
사용 중인 오브젝트 수 반환.

```javascript
pool.getActiveCount(): number
```

---

## InputManager Interface

### Constructor

```javascript
new InputManager(canvas: HTMLCanvasElement, gameWidth: number, gameHeight: number)
```

---

### Methods

#### getActivePointers()
현재 활성화된 모든 포인터 반환.

```javascript
inputManager.getActivePointers(): Map<number, InputEvent>
```

**Returns**: pointerId → InputEvent 맵

---

#### getPrimaryPointer()
주 포인터(첫 번째 터치 또는 마우스) 반환.

```javascript
inputManager.getPrimaryPointer(): InputEvent | null
```

---

### Event Callbacks

```javascript
inputManager.onPointerDown = (event: InputEvent) => void
inputManager.onPointerMove = (event: InputEvent) => void
inputManager.onPointerUp = (event: InputEvent) => void
```

---

## GameObject Interface

모든 게임 오브젝트가 구현해야 하는 인터페이스.

### Required Methods

#### update(deltaTime)
매 프레임 업데이트 로직.

```javascript
update(deltaTime: number): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| deltaTime | number | 이전 프레임 이후 경과 시간 (초) |

---

#### render(ctx)
렌더링 로직.

```javascript
render(ctx: CanvasRenderingContext2D): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| ctx | CanvasRenderingContext2D | 2D 렌더링 컨텍스트 |

---

#### reset()
풀 반환 시 상태 초기화.

```javascript
reset(): void
```

**Post-condition**: 모든 필드가 기본값으로 초기화됨

---

## Constants

```javascript
// 게임 디자인 해상도
const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

// 성능 제한
const TARGET_FPS = 60;
const FIXED_TIMESTEP = 1 / 60; // 약 16.67ms
const MAX_OBJECTS = 50;

// 입력
const MIN_TOUCH_SIZE = 44; // CSS 픽셀
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| E001 | INVALID_STATE_TRANSITION | 허용되지 않은 상태 전환 시도 |
| E002 | CANVAS_NOT_FOUND | 캔버스 요소를 찾을 수 없음 |
| E003 | POOL_EXHAUSTED | 풀 최대 크기 도달 (경고만, 에러 아님) |
