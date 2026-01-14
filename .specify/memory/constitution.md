<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (Initial ratification)
Modified principles: N/A (new constitution)
Added sections:
  - Core Principles (5 principles)
  - Technical Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Compatible (no changes needed)
  - .specify/templates/spec-template.md ✅ Compatible (no changes needed)
  - .specify/templates/tasks-template.md ✅ Compatible (no changes needed)
Follow-up TODOs: None
-->

# Smooth Flight Constitution

## Core Principles

### I. Performance-First (NON-NEGOTIABLE)

모든 코드는 60fps 유지를 최우선으로 작성한다.

- 게임 루프는 반드시 `requestAnimationFrame` 기반으로 구현
- 매 프레임 GC(Garbage Collection) 유발 코드 금지: 오브젝트 풀링 필수
- 렌더링은 더티 렉탱글(Dirty Rectangle) 또는 전체 재그리기 중 성능 측정 후 결정
- 충돌 감지는 O(n²) 회피: 공간 분할 또는 거리 기반 사전 필터링 적용
- 모바일 저사양 기기(2GB RAM, 구형 CPU)에서도 원활히 작동해야 함

### II. Vanilla JavaScript Only

외부 라이브러리 의존성 없이 순수 JavaScript로 구현한다.

- 게임 엔진: 직접 구현 (Canvas 2D API 사용)
- UI 프레임워크: 사용 금지 (순수 DOM 또는 Canvas)
- 빌드 도구: 선택적 (ES Modules로 충분히 동작해야 함)
- 예외 허용: 사운드 라이브러리(Howler.js 등)는 명시적 승인 후 사용 가능

### III. Modular System Architecture

각 시스템은 독립적으로 테스트 가능하고 교체 가능해야 한다.

- 시스템 분리: Engine Core, Aircraft, Path Drawing, Collision, Level 등
- 의존성 방향: 단방향 (순환 참조 금지)
- 인터페이스 우선: 시스템 간 통신은 명확한 인터페이스/이벤트로 수행
- 각 시스템은 독립적으로 단위 테스트 가능해야 함

### IV. Cross-Platform Equality

PC와 모바일에서 동일한 게임 경험을 제공한다.

- 입력 추상화: 마우스와 터치를 통합 처리하는 단일 입력 시스템
- 반응형 캔버스: 화면 크기에 맞춰 자동 스케일링
- 터치 최적화: 터치 영역은 최소 44x44px 유지
- 성능 동등: 모바일에서도 60fps 목표 유지

### V. Simplicity Over Features

기능 추가보다 기존 기능의 안정성과 성능을 우선한다.

- YAGNI 원칙: 당장 필요하지 않은 기능은 구현하지 않음
- MVP 우선: 핵심 게임플레이가 완벽히 작동한 후 확장
- 코드 복잡도: 단일 함수 50줄, 단일 파일 300줄 이내 권장
- 추상화 최소화: 불필요한 패턴/추상화 도입 금지

## Technical Constraints

| 항목 | 제약 |
|------|------|
| 렌더링 | HTML5 Canvas 2D (WebGL 사용 금지 - 복잡도 증가) |
| 저장소 | LocalStorage (서버 의존성 제거) |
| 사운드 | Web Audio API 기본, Howler.js 선택적 허용 |
| 빌드 | ES Modules 기본, 번들러 선택적 |
| 브라우저 | Chrome/Edge/Safari/Firefox 최신 2개 버전 |
| 파일 크기 | 전체 게임 2MB 이내 (이미지/사운드 포함) |

## Development Workflow

### 코드 품질

- 모든 시스템은 단위 테스트 포함 권장 (필수 아님)
- 성능 크리티컬 코드는 프로파일링 결과 첨부
- PR 전 60fps 유지 확인 필수

### 커밋 규칙

- feat: 새로운 기능
- fix: 버그 수정
- perf: 성능 개선
- refactor: 코드 리팩토링
- docs: 문서 수정

### 브랜치 전략

- main: 안정 버전
- develop: 개발 통합
- feature/xxx: 기능 개발

## Governance

이 Constitution은 프로젝트의 최상위 지침이다.

- 모든 설계 결정은 Core Principles에 부합해야 함
- 성능 저하를 유발하는 변경은 명확한 근거와 대안 제시 필요
- Constitution 수정은 문서화, 버전 업데이트, 영향 분석 필수
- 원칙 위반이 불가피한 경우 Complexity Tracking에 기록

**Version**: 1.0.0 | **Ratified**: 2025-01-14 | **Last Amended**: 2025-01-14
