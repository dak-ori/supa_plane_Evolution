/**
 * UpgradeManager - 업그레이드 시스템 관리
 * 코인으로 비행기 성능 업그레이드
 */
import { UPGRADE_DEFAULTS } from '../engine/constants.js';

// 업그레이드 정의
const UPGRADE_CONFIG = {
  engine: {
    name: '엔진',
    description: '발사 파워 증가',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    valuePerLevel: 0.15  // 레벨당 15% 증가
  },
  wings: {
    name: '날개',
    description: '양력 증가',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    valuePerLevel: 0.12
  },
  fuselage: {
    name: '동체',
    description: '공기저항 감소',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    valuePerLevel: 0.1
  },
  fuel: {
    name: '연료탱크',
    description: '부스트 용량 증가',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.6,
    valuePerLevel: 0.2
  }
};

export class UpgradeManager {
  constructor() {
    // 현재 레벨 (localStorage에서 로드)
    this.levels = this._loadLevels();

    // 보유 코인
    this.coins = this._loadCoins();
  }

  /**
   * 레벨 데이터 로드
   */
  _loadLevels() {
    try {
      const saved = localStorage.getItem('upgradeLevels');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load upgrade levels:', e);
    }
    return { ...UPGRADE_DEFAULTS };
  }

  /**
   * 코인 데이터 로드
   */
  _loadCoins() {
    try {
      const saved = localStorage.getItem('coins');
      if (saved) {
        return parseInt(saved, 10);
      }
    } catch (e) {
      console.warn('Failed to load coins:', e);
    }
    return 0;
  }

  /**
   * 저장
   */
  save() {
    try {
      localStorage.setItem('upgradeLevels', JSON.stringify(this.levels));
      localStorage.setItem('coins', this.coins.toString());
    } catch (e) {
      console.warn('Failed to save upgrade data:', e);
    }
  }

  /**
   * 코인 추가
   */
  addCoins(amount) {
    this.coins += amount;
    this.save();
  }

  /**
   * 특정 업그레이드 비용 계산
   */
  getUpgradeCost(type) {
    const config = UPGRADE_CONFIG[type];
    if (!config) return Infinity;

    const level = this.levels[type] || 1;
    if (level >= config.maxLevel) return Infinity;

    return Math.floor(config.baseCost * Math.pow(config.costMultiplier, level - 1));
  }

  /**
   * 업그레이드 가능 여부
   */
  canUpgrade(type) {
    const cost = this.getUpgradeCost(type);
    return this.coins >= cost && cost < Infinity;
  }

  /**
   * 업그레이드 실행
   */
  upgrade(type) {
    if (!this.canUpgrade(type)) return false;

    const cost = this.getUpgradeCost(type);
    this.coins -= cost;
    this.levels[type] = (this.levels[type] || 1) + 1;

    this.save();
    return true;
  }

  /**
   * 특정 업그레이드의 현재 배수값
   */
  getMultiplier(type) {
    const config = UPGRADE_CONFIG[type];
    if (!config) return 1;

    const level = this.levels[type] || 1;
    return 1 + (level - 1) * config.valuePerLevel;
  }

  /**
   * 모든 업그레이드 배수 반환 (Airplane 생성용)
   */
  getAllMultipliers() {
    return {
      engine: this.getMultiplier('engine'),
      wings: this.getMultiplier('wings'),
      fuselage: this.getMultiplier('fuselage'),
      fuel: this.getMultiplier('fuel')
    };
  }

  /**
   * 업그레이드 정보 반환 (UI용)
   */
  getUpgradeInfo(type) {
    const config = UPGRADE_CONFIG[type];
    if (!config) return null;

    return {
      name: config.name,
      description: config.description,
      level: this.levels[type] || 1,
      maxLevel: config.maxLevel,
      cost: this.getUpgradeCost(type),
      canUpgrade: this.canUpgrade(type),
      multiplier: this.getMultiplier(type)
    };
  }

  /**
   * 모든 업그레이드 정보
   */
  getAllUpgradeInfo() {
    return Object.keys(UPGRADE_CONFIG).map(type => ({
      type,
      ...this.getUpgradeInfo(type)
    }));
  }

  /**
   * 데이터 리셋 (테스트용)
   */
  reset() {
    this.levels = { ...UPGRADE_DEFAULTS };
    this.coins = 0;
    this.save();
  }
}
