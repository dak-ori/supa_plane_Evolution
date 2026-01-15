/**
 * ObjectPool - 재사용 가능한 게임 오브젝트 풀
 *
 * 게임 루프 내에서 GC 압력을 제거하기 위해 오브젝트를 미리 할당하고 재사용합니다.
 * research.md의 패턴을 따릅니다.
 *
 * @template T extends GameObject
 */
export class ObjectPool {
  /**
   * @param {new () => T} ObjectType - GameObject 서브클래스 생성자
   * @param {number} [initialSize=10] - 초기 풀 크기
   */
  constructor(ObjectType, initialSize = 10) {
    /** @type {T[]} 사용 가능한 오브젝트 */
    this.available = [];

    /** @type {Set<T>} 사용 중인 오브젝트 */
    this.inUse = new Set();

    /** @type {new () => T} 오브젝트 생성자 */
    this.ObjectType = ObjectType;

    // 초기 풀 크기만큼 미리 생성
    for (let i = 0; i < initialSize; i++) {
      this.available.push(new ObjectType());
    }
  }

  /**
   * 풀에서 오브젝트를 획득
   * 풀이 비어있으면 자동으로 확장
   * @returns {T} 초기화된 오브젝트 (active = false 상태)
   */
  acquire() {
    if (this.available.length === 0) {
      // 풀이 비어있으면 50% 확장 (최소 1개)
      const growSize = Math.ceil(this.inUse.size * 0.5) || 1;
      for (let i = 0; i < growSize; i++) {
        this.available.push(new this.ObjectType());
      }
    }

    const obj = this.available.pop();
    this.inUse.add(obj);
    return obj;
  }

  /**
   * 오브젝트를 풀에 반환
   * @param {T} obj - 반환할 오브젝트
   */
  release(obj) {
    // 이미 반환된 오브젝트 중복 반환 방지
    if (!this.inUse.has(obj)) {
      return;
    }

    this.inUse.delete(obj);
    obj.reset(); // 상태 초기화 필수
    this.available.push(obj);
  }

  /**
   * 모든 사용 중인 오브젝트를 반환
   */
  releaseAll() {
    for (const obj of this.inUse) {
      obj.reset();
      this.available.push(obj);
    }
    this.inUse.clear();
  }

  /**
   * 사용 중인 오브젝트 수 반환
   * @returns {number}
   */
  getActiveCount() {
    return this.inUse.size;
  }

  /**
   * 전체 풀 크기 반환 (사용 중 + 사용 가능)
   * @returns {number}
   */
  getTotalSize() {
    return this.available.length + this.inUse.size;
  }
}
