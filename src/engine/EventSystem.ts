/**
 * 事件系统
 * 处理随机事件和条件触发事件
 */

import type { GameState, GameEvent } from '../types';

// ============ 事件定义 ============

/**
 * 所有游戏事件
 */
export const GAME_EVENTS: GameEvent[] = [
  // 正面事件
  {
    id: 'investor_funding',
    name: '投资人注资',
    description: '获得天使投资，资金增加3000',
    type: 'positive',
    effects: { budgetChange: 3000 },
  },
  {
    id: 'talent_recruitment',
    name: '人才招募',
    description: '招募到优秀工程师，熵值减少8',
    type: 'positive',
    effects: { entropyChange: -8 },
  },
  {
    id: 'data_donation',
    name: '数据捐赠',
    description: '合作伙伴捐赠数据，获得100黄金数据',
    type: 'positive',
    effects: { goldenDataChange: 100 },
  },
  {
    id: 'algorithm_breakthrough',
    name: '算法突破',
    description: '研究取得突破，拟合度增加5',
    type: 'positive',
    effects: { fitScoreChange: 5 },
  },
  {
    id: 'government_grant',
    name: '政府补贴',
    description: '获得科技创新补贴，资金增加2000',
    type: 'positive',
    effects: { budgetChange: 2000 },
  },
  
  // 负面事件
  {
    id: 'server_failure',
    name: '服务器故障',
    description: '硬件故障导致损失，资金减少1500，熵值增加15',
    type: 'negative',
    effects: { budgetChange: -1500, entropyChange: 15 },
  },
  {
    id: 'data_leak',
    name: '数据泄露',
    description: '部分数据泄露，黄金数据减少50，法律风险增加10',
    type: 'negative',
    effects: { goldenDataChange: -50, legalRiskChange: 10 },
  },
  {
    id: 'competitor_poaching',
    name: '竞争对手挖角',
    description: '核心员工被挖走，熵值增加12',
    type: 'negative',
    effects: { entropyChange: 12 },
  },
  {
    id: 'market_crash',
    name: '市场波动',
    description: '市场不景气，资金减少1000',
    type: 'negative',
    effects: { budgetChange: -1000 },
  },
  {
    id: 'model_degradation',
    name: '模型退化',
    description: '模型性能下降，拟合度减少3',
    type: 'negative',
    effects: { fitScoreChange: -3 },
  },
  
  // 条件触发事件
  {
    id: 'legal_fine',
    name: '隐私数据罚款',
    description: '因违规使用数据被罚款，资金减少2500',
    type: 'negative',
    effects: { budgetChange: -2500 },
    triggerCondition: (state: GameState) => state.risks.legalRisk >= 50,
  },
  {
    id: 'regulatory_investigation',
    name: '监管调查',
    description: '监管部门介入调查，资金减少1500，法律风险清零',
    type: 'negative',
    effects: { budgetChange: -1500, legalRiskChange: -100 },
    triggerCondition: (state: GameState) => state.risks.legalRisk >= 80,
  },
];

// ============ 事件系统类 ============

export class EventSystem {
  /**
   * 随机事件触发概率
   */
  private static readonly RANDOM_EVENT_PROBABILITY = 0.1;

  /**
   * 获取所有事件
   */
  static getAllEvents(): GameEvent[] {
    return GAME_EVENTS;
  }

  /**
   * 根据ID获取事件
   */
  static getEventById(eventId: string): GameEvent | undefined {
    return GAME_EVENTS.find((e) => e.id === eventId);
  }

  /**
   * 检查条件触发事件
   */
  static checkConditionalEvents(state: GameState): GameEvent | null {
    const conditionalEvent = GAME_EVENTS.find(
      (e) => e.triggerCondition && e.triggerCondition(state)
    );
    return conditionalEvent || null;
  }

  /**
   * 获取随机事件
   */
  static getRandomEvent(randomValue?: number): GameEvent | null {
    const randomEvents = GAME_EVENTS.filter((e) => !e.triggerCondition);
    if (randomEvents.length === 0) return null;

    const roll = randomValue !== undefined ? randomValue : Math.random();
    const index = Math.floor(roll * randomEvents.length);
    return randomEvents[index];
  }

  /**
   * 尝试触发事件
   */
  static tryTriggerEvent(
    state: GameState,
    triggerRandomValue?: number,
    eventSelectRandomValue?: number
  ): GameEvent | null {
    // 首先检查条件触发事件
    const conditionalEvent = this.checkConditionalEvents(state);
    if (conditionalEvent) return conditionalEvent;

    // 随机事件触发检查（10%概率）
    const triggerRoll =
      triggerRandomValue !== undefined ? triggerRandomValue : Math.random();

    if (triggerRoll < this.RANDOM_EVENT_PROBABILITY) {
      return this.getRandomEvent(eventSelectRandomValue);
    }

    return null;
  }

  /**
   * 应用事件效果到游戏状态
   */
  static applyEventEffects(state: GameState, event: GameEvent): GameState {
    const effects = event.effects;
    const newState: GameState = {
      ...state,
      resources: { ...state.resources },
      metrics: { ...state.metrics },
      risks: { ...state.risks },
    };

    if (effects.budgetChange !== undefined) {
      // Handle both number and { min, max } types
      if (typeof effects.budgetChange === 'number') {
        newState.resources.budget += effects.budgetChange;
      } else {
        // Random range - use middle value for events (or could randomize)
        const { min, max } = effects.budgetChange;
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        newState.resources.budget += randomValue;
      }
    }

    if (effects.dirtyDataChange !== undefined) {
      newState.resources.dirtyData = Math.max(
        0,
        newState.resources.dirtyData + effects.dirtyDataChange
      );
    }

    if (effects.goldenDataChange !== undefined) {
      newState.resources.goldenData = Math.max(
        0,
        newState.resources.goldenData + effects.goldenDataChange
      );
    }

    if (effects.fitScoreChange !== undefined) {
      newState.metrics.fitScore = Math.max(
        0,
        Math.min(
          newState.metrics.fitScoreCap,
          newState.metrics.fitScore + effects.fitScoreChange
        )
      );
    }

    if (effects.entropyChange !== undefined) {
      newState.metrics.entropy = Math.max(
        0,
        Math.min(100, newState.metrics.entropy + effects.entropyChange)
      );
    }

    if (effects.legalRiskChange !== undefined) {
      newState.risks.legalRisk = Math.max(
        0,
        Math.min(100, newState.risks.legalRisk + effects.legalRiskChange)
      );
    }

    if (effects.fitScoreCapChange !== undefined) {
      newState.metrics.fitScoreCap = Math.max(
        0,
        Math.min(100, newState.metrics.fitScoreCap + effects.fitScoreCapChange)
      );
      if (newState.metrics.fitScore > newState.metrics.fitScoreCap) {
        newState.metrics.fitScore = newState.metrics.fitScoreCap;
      }
    }

    return newState;
  }

  /**
   * 重置法律风险计数器
   */
  static resetLegalRisk(state: GameState): GameState {
    return {
      ...state,
      risks: {
        ...state.risks,
        legalRisk: 0,
      },
    };
  }

  /**
   * 检查事件是否为条件触发事件
   */
  static isConditionalEvent(event: GameEvent): boolean {
    return event.triggerCondition !== undefined;
  }
}
