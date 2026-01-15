# Data Model: Game Engine Core

**Feature**: 001-game-engine-core
**Date**: 2025-01-15

## Entity Overview

```
┌─────────────┐     manages      ┌─────────────┐
│    Game     │─────────────────▶│  GameLoop   │
└─────────────┘                  └─────────────┘
       │                                │
       │ owns                           │ calls
       ▼                                ▼
┌─────────────┐     renders      ┌─────────────┐
│ GameObject  │◀────────────────│  Renderer   │
└─────────────┘                  └─────────────┘
       ▲
       │ pools
┌─────────────┐
│ ObjectPool  │
└─────────────┘

┌─────────────┐     notifies     ┌─────────────┐
│InputManager │─────────────────▶│    Game     │
└─────────────┘                  └─────────────┘
```

---

## Core Entities

### 1. Game

게임 전체 인스턴스. 상태 관리와 시스템 조율을 담당.

| Field | Type | Description |
|-------|------|-------------|
| state | GameState | 현재 게임 상태 |
| canvas | HTMLCanvasElement | 렌더링 대상 캔버스 |
| ctx | CanvasRenderingContext2D | 2D 렌더링 컨텍스트 |
| gameLoop | GameLoop | 게임 루프 인스턴스 |
| renderer | Renderer | 렌더러 인스턴스 |
| inputManager | InputManager | 입력 관리자 |
| objects | GameObject[] | 활성 게임 오브젝트 목록 |
| config | GameConfig | 게임 설정 |

**Methods**:
- `start()`: 게임 시작 (MENU → PLAYING)
- `pause()`: 일시정지 (PLAYING → PAUSED)
- `resume()`: 재개 (PAUSED → PLAYING)
- `gameOver()`: 게임오버 (PLAYING → GAME_OVER)
- `returnToMenu()`: 메뉴로 복귀 (* → MENU)

---

### 2. GameState (Enum)

```javascript
const GameState = {
  MENU: 'MENU',         // 메인 메뉴 화면
  PLAYING: 'PLAYING',   // 게임 진행 중
  PAUSED: 'PAUSED',     // 일시정지
  GAME_OVER: 'GAME_OVER' // 게임오버
};
```

**State Transitions**:

| From | To | Trigger |
|------|----|---------|
| MENU | PLAYING | start() |
| PLAYING | PAUSED | pause(), tab hidden |
| PLAYING | GAME_OVER | gameOver() |
| PAUSED | PLAYING | resume() |
| PAUSED | MENU | returnToMenu() |
| GAME_OVER | MENU | returnToMenu() |

---

### 3. GameObject

화면에 표시되는 모든 게임 요소의 기본 클래스.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| x | number | 0 | X 좌표 (게임 좌표계) |
| y | number | 0 | Y 좌표 (게임 좌표계) |
| width | number | 0 | 너비 |
| height | number | 0 | 높이 |
| rotation | number | 0 | 회전 각도 (라디안) |
| active | boolean | false | 활성 상태 |
| visible | boolean | true | 렌더링 여부 |

**Methods**:
- `update(deltaTime)`: 매 프레임 업데이트 (오버라이드 가능)
- `render(ctx)`: 렌더링 (오버라이드 가능)
- `reset()`: 풀 반환 시 상태 초기화
- `getBounds()`: 충돌 영역 반환 `{x, y, width, height}`

**Validation Rules**:
- x, y: 숫자 (게임 좌표계 내)
- width, height: 0 이상
- rotation: 0 ~ 2π

---

### 4. ObjectPool<T extends GameObject>

재사용 가능한 게임 오브젝트 풀.

| Field | Type | Description |
|-------|------|-------------|
| available | T[] | 사용 가능한 오브젝트 |
| inUse | Set<T> | 사용 중인 오브젝트 |
| ObjectType | Constructor<T> | 오브젝트 생성자 |
| maxSize | number | 최대 풀 크기 (기본 50) |

**Methods**:
- `acquire()`: T - 풀에서 오브젝트 획득
- `release(obj: T)`: void - 오브젝트 반환
- `releaseAll()`: void - 모든 오브젝트 반환
- `getActiveCount()`: number - 사용 중인 오브젝트 수

**Invariants**:
- `available.length + inUse.size <= maxSize`
- 반환된 오브젝트는 반드시 `reset()` 호출

---

### 5. InputEvent

사용자 입력 정보를 담는 데이터 객체.

| Field | Type | Description |
|-------|------|-------------|
| x | number | 게임 좌표계 X |
| y | number | 게임 좌표계 Y |
| type | 'mouse' \| 'touch' \| 'pen' | 입력 장치 타입 |
| pointerId | number | 포인터 고유 ID |
| isPrimary | boolean | 주 포인터 여부 |
| prevX | number \| null | 이전 X 좌표 |
| prevY | number \| null | 이전 Y 좌표 |

---

### 6. GameConfig

게임 설정 값.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| gameWidth | number | 720 | 게임 디자인 너비 |
| gameHeight | number | 1280 | 게임 디자인 높이 |
| targetFPS | number | 60 | 목표 FPS |
| maxObjects | number | 50 | 최대 오브젝트 수 |
| showFPS | boolean | false | FPS 카운터 표시 |

---

## Supporting Types

### Bounds

충돌 감지용 경계 박스.

```javascript
{
  x: number,      // 좌상단 X
  y: number,      // 좌상단 Y
  width: number,  // 너비
  height: number  // 높이
}
```

### LetterboxInfo

레터박스 렌더링 정보.

```javascript
{
  scale: number,   // 스케일 비율
  offsetX: number, // X 오프셋 (pillarbox)
  offsetY: number  // Y 오프셋 (letterbox)
}
```

---

## State Diagram

```
        ┌──────────────────────────────────────────┐
        │                                          │
        ▼                                          │
    ┌───────┐    start()    ┌─────────┐            │
    │ MENU  │──────────────▶│ PLAYING │            │
    └───────┘               └─────────┘            │
        ▲                    │       │             │
        │                    │       │             │
        │    returnToMenu()  │       │ gameOver()  │
        │                    │       │             │
        │           pause()  │       ▼             │
        │           tab hide │   ┌──────────┐      │
        │                    │   │GAME_OVER │──────┘
        │                    ▼   └──────────┘ returnToMenu()
        │               ┌────────┐
        │               │ PAUSED │
        │               └────────┘
        │                    │
        └────────────────────┘
              returnToMenu()
```

---

## Memory Management

### Object Lifecycle

1. **Creation**: 게임 시작 시 풀에 미리 생성
2. **Acquisition**: `pool.acquire()` → `active = true`
3. **Usage**: `update()`, `render()` 호출
4. **Release**: `pool.release(obj)` → `reset()` → `active = false`

### GC Prevention Rules

- 게임 루프 내에서 `new` 키워드 사용 금지
- 배열 재할당 금지 (`arr = []` 대신 `arr.length = 0`)
- 임시 객체는 풀에서 재사용
