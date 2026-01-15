# Tasks: Game Engine Core

**Input**: Design documents from `/specs/001-game-engine-core/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing + Browser DevTools Performance profiling (자동화된 테스트 미요청)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure: `src/engine/`, `src/utils/`, `tests/manual/`
- [x] T002 [P] Create `index.html` with canvas element and ES Module script tag
- [x] T003 [P] Create game constants in `src/engine/constants.js` (GAME_WIDTH, GAME_HEIGHT, TARGET_FPS, FIXED_TIMESTEP, MAX_OBJECTS, MIN_TOUCH_SIZE)
- [x] T004 [P] Create GameConfig type definition in `src/engine/GameConfig.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Note**: CRITICAL - No user story work can begin until this phase is complete

- [x] T005 Create base GameObject class in `src/engine/GameObject.js` with x, y, width, height, rotation, active, visible properties and update(), render(), reset(), getBounds() methods
- [x] T006 Create ObjectPool class in `src/engine/ObjectPool.js` with acquire(), release(), releaseAll(), getActiveCount() methods per research.md patterns
- [x] T007 [P] Create FPSCounter utility in `src/utils/FPSCounter.js` with update(deltaTime), render(ctx), toggle() methods

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 게임 시작 및 플레이 (Priority: P1)

**Goal**: 60fps 게임 루프와 Canvas 렌더링으로 부드러운 게임 화면 제공

**Independent Test**: 빈 캔버스에 여러 오브젝트가 동시에 움직이는 상태에서 60fps가 유지되는지 확인

### Implementation for User Story 1

- [x] T008 [US1] Create Renderer class in `src/engine/Renderer.js` with setupCanvas(), calculateLetterbox(), clear(), render() methods (DPR handling, letterbox scaling per research.md)
- [x] T009 [US1] Create GameLoop class in `src/engine/GameLoop.js` with fixed timestep accumulator pattern (60Hz update, variable render per research.md)
- [x] T010 [US1] Implement frame drop handling in GameLoop with MAX_UPDATES=240 panic reset
- [x] T011 [US1] Create basic Game class shell in `src/engine/Game.js` with constructor(canvasId, config), canvas/ctx initialization
- [x] T012 [US1] Add object management to Game class: objects array, addObject(), removeObject(), getObjects() methods
- [x] T013 [US1] Integrate GameLoop into Game class with update() and render() callbacks
- [x] T014 [US1] Integrate FPSCounter into Game class with toggleFPS() method
- [x] T015 [US1] Create entry point in `src/index.js` that initializes Game instance
- [x] T016 [US1] Add window resize handler in Renderer for responsive canvas with letterbox

**Checkpoint**: User Story 1 complete - 60fps 게임 루프 동작, 오브젝트 추가/렌더링 가능

---

## Phase 4: User Story 2 - 게임 일시정지 및 재개 (Priority: P2)

**Goal**: 플레이어가 게임을 일시정지하고 재개할 수 있으며, 탭 비활성화 시 자동 일시정지

**Independent Test**: 게임 중 일시정지 → 재개 시 모든 오브젝트 위치와 상태가 보존되는지 확인

### Implementation for User Story 2

- [x] T017 [US2] Add pause() method to Game class in `src/engine/Game.js` - stops updates, keeps rendering
- [x] T018 [US2] Add resume() method to Game class - resumes updates from paused state
- [x] T019 [US2] Implement Page Visibility API handling in Game class - auto-pause on tab hidden, stay paused on return (per spec)
- [x] T020 [US2] Add wasPlayingOnHide state tracking for visibility change handling

**Checkpoint**: User Story 2 complete - 일시정지/재개 동작, 탭 전환 시 자동 일시정지

---

## Phase 5: User Story 3 - 게임 상태 전환 (Priority: P3)

**Goal**: MENU/PLAYING/PAUSED/GAME_OVER 상태 간 자연스러운 전환

**Independent Test**: 메뉴 → 플레이 → 게임오버 → 메뉴 순환이 문제없이 동작하는지 확인

### Implementation for User Story 3

- [x] T021 [US3] Create GameState enum in `src/engine/GameState.js` (MENU, PLAYING, PAUSED, GAME_OVER)
- [x] T022 [US3] Add state property and state validation to Game class
- [x] T023 [US3] Implement start() method - MENU → PLAYING transition, starts game loop
- [x] T024 [US3] Implement gameOver() method - PLAYING → GAME_OVER transition
- [x] T025 [US3] Implement returnToMenu() method - releases all pooled objects, transitions to MENU
- [x] T026 [US3] Add onStateChange callback registration for external state observers
- [x] T027 [US3] Update pause()/resume() to respect state machine (only valid from PLAYING/PAUSED)

**Checkpoint**: User Story 3 complete - 모든 상태 전환 동작, 리소스 정리 확인

---

## Phase 6: User Story 4 - 다양한 입력 방식 지원 (Priority: P4)

**Goal**: PC에서는 마우스로, 모바일에서는 터치로 동일하게 게임 조작

**Independent Test**: 동일한 조작이 마우스와 터치에서 같은 결과를 내는지 확인

### Implementation for User Story 4

- [x] T028 [US4] Create InputEvent type in `src/engine/InputEvent.js` (x, y, type, pointerId, isPrimary, prevX, prevY)
- [x] T029 [US4] Create InputManager class in `src/engine/InputManager.js` with Pointer Events API
- [x] T030 [US4] Implement getCanvasCoords() for screen-to-game coordinate transformation (with letterbox offset)
- [x] T031 [US4] Implement activePointers Map for multi-touch tracking
- [x] T032 [US4] Add event callbacks: onPointerDown, onPointerMove, onPointerUp
- [x] T033 [US4] Implement getActivePointers() and getPrimaryPointer() methods
- [x] T034 [US4] Add touch-action: none CSS to canvas for preventing default behaviors
- [x] T035 [US4] Integrate InputManager into Game class

**Checkpoint**: User Story 4 complete - 마우스/터치 입력 통합 동작

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T036 Create manual performance test page in `tests/manual/performance-test.html` with 20+ moving objects
- [x] T037 Add edge case handling: window resize during game, rapid state transitions
- [x] T038 Verify all acceptance criteria from spec.md
- [x] T039 Run quickstart.md scenarios to validate integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (constants.js) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (GameObject, ObjectPool)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (Game class with loop)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (Game class)
- **User Story 4 (Phase 6)**: Depends on Phase 3 (Game class, Renderer)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──────────────────────────────────┐
    ▼                                  │
Phase 3 (US1: Game Loop) ─────────────▶│
    │                                  │
    ├──────┬──────┐                    │
    ▼      ▼      ▼                    │
Phase 4  Phase 5  Phase 6              │
(US2)    (US3)    (US4)                │
    │      │      │                    │
    └──────┴──────┴────────────────────┘
                  │
                  ▼
           Phase 7 (Polish)
```

- **US2, US3, US4는 US1 완료 후 병렬 진행 가능**

### Within Each User Story

- Core classes before integration
- Foundation before features
- Validate independently before moving to next

### Parallel Opportunities

**Phase 1 (모두 병렬 가능)**:
```
T002 (index.html) | T003 (constants.js) | T004 (GameConfig.js)
```

**Phase 2**:
```
T005 (GameObject) → T006 (ObjectPool)  // ObjectPool depends on GameObject
T007 (FPSCounter) // Independent, parallel with above
```

**Phase 3 이후 User Story 병렬**:
```
After US1 complete:
  US2 (Developer A) | US3 (Developer B) | US4 (Developer C)
```

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Create index.html with canvas element"
Task: "Create game constants in src/engine/constants.js"
Task: "Create GameConfig type definition in src/engine/GameConfig.js"
```

## Parallel Example: After Phase 3

```bash
# After User Story 1 is complete, these can run in parallel:
Task: "Add pause() method to Game class" (US2)
Task: "Create GameState enum" (US3)
Task: "Create InputManager class" (US4)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (게임 루프 & 렌더링)
4. **STOP and VALIDATE**: 60fps 유지 확인, 오브젝트 움직임 테스트
5. Deploy/demo if ready - 기본 게임 엔진 동작 가능

### Incremental Delivery

1. Setup + Foundational → 기본 구조 완성
2. User Story 1 → 60fps 게임 루프 동작 (MVP!)
3. User Story 2 → 일시정지/재개 추가
4. User Story 3 → 상태 전환 추가
5. User Story 4 → 입력 시스템 완성
6. Each story adds value without breaking previous stories

### Single Developer Strategy (권장)

1. Phase 1 → Phase 2 → Phase 3 순차 진행
2. US1 완료 후 US2 → US3 → US4 순차 진행 (우선순위 순)
3. 각 스토리 완료 시점에서 독립 테스트

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing per spec.md (자동화된 테스트 미요청)
