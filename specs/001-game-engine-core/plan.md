# Implementation Plan: Game Engine Core

**Branch**: `001-game-engine-core` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-game-engine-core/spec.md`

## Summary

60fps 게임 루프와 Canvas 2D 렌더링을 담당하는 게임 엔진 코어 시스템 구현. requestAnimationFrame 기반 게임 루프, 델타 타임 기반 업데이트, 게임 상태 관리(MENU/PLAYING/PAUSED/GAME_OVER), 통합 입력 시스템(마우스/터치), 반응형 캔버스(letterbox), 오브젝트 풀링을 포함한다.

## Technical Context

**Language/Version**: JavaScript ES2020+ (Vanilla JS, ES Modules)
**Primary Dependencies**: None (Canvas 2D API only)
**Storage**: N/A (이 기능에서는 저장소 미사용)
**Testing**: Manual testing + Browser DevTools Performance profiling
**Target Platform**: Web Browser (Chrome/Edge/Safari/Firefox 최신 2개 버전)
**Project Type**: Single project (browser-based game)
**Performance Goals**: 60fps 유지 (95% 시간 동안 55fps 이상), 입력 지연 100ms 이내
**Constraints**: Canvas 2D only (WebGL 금지), 매 프레임 GC 유발 금지, 최대 50개 오브젝트, 모바일 2GB RAM 지원
**Scale/Scope**: 동시 게임 오브젝트 50개, 디자인 해상도 720x1280px (HD 세로)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Performance-First | PASS | requestAnimationFrame 기반 루프, 오브젝트 풀링, 델타 타임 적용 |
| II. Vanilla JavaScript Only | PASS | 외부 라이브러리 없음, Canvas 2D API만 사용 |
| III. Modular System Architecture | PASS | Engine Core 독립 시스템으로 설계, 명확한 인터페이스 |
| IV. Cross-Platform Equality | PASS | 마우스/터치 통합 입력, 반응형 캔버스, 44px 터치 영역 |
| V. Simplicity Over Features | PASS | 핵심 기능만 구현, YAGNI 준수 |

**Technical Constraints Check**:
- Rendering: Canvas 2D (WebGL 금지) - PASS
- File size: 엔진 코어만으로 2MB 이내 충분 - PASS

**GATE STATUS: PASSED** - Phase 0 진행 가능

### Post-Design Re-Check (Phase 1 완료 후)

| Principle | Status | Design Verification |
|-----------|--------|---------------------|
| I. Performance-First | PASS | Fixed timestep (60Hz), accumulator pattern, panic reset for frame drops, object pooling with ~40% improvement |
| II. Vanilla JavaScript Only | PASS | No dependencies, Pointer Events API (native), Page Visibility API (native) |
| III. Modular System Architecture | PASS | 6 independent modules (Game, GameLoop, Renderer, InputManager, ObjectPool, GameObject), clear contracts defined |
| IV. Cross-Platform Equality | PASS | Pointer Events unifies mouse/touch/pen, DPR-aware canvas, letterbox scaling, 44px touch targets |
| V. Simplicity Over Features | PASS | 4 game states only, single canvas (no layers), full clear strategy |

**POST-DESIGN GATE STATUS: PASSED** - Phase 2 (tasks) 진행 가능

## Project Structure

### Documentation (this feature)

```text
specs/001-game-engine-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── Game.js              # 게임 메인 클래스, 상태 관리
│   ├── GameLoop.js          # requestAnimationFrame 기반 루프
│   ├── Renderer.js          # Canvas 2D 렌더링 담당
│   ├── InputManager.js      # 마우스/터치 통합 입력
│   ├── ObjectPool.js        # 오브젝트 풀링 시스템
│   └── GameObject.js        # 기본 게임 오브젝트 클래스
├── utils/
│   └── FPSCounter.js        # FPS 모니터링 (토글 가능)
└── index.js                 # 엔트리포인트

tests/
├── manual/
│   └── performance-test.html  # 성능 테스트용 HTML
└── unit/
    └── (future unit tests)
```

**Structure Decision**: Single project 구조 선택. 브라우저 기반 게임으로 프론트엔드만 존재하며, src/engine/ 하위에 코어 엔진 모듈을 배치한다.

## Complexity Tracking

> No violations detected. Constitution principles fully satisfied.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | - | - |
