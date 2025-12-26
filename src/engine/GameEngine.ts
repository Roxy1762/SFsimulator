/**
 * 游戏引擎核心类
 * 处理所有游戏逻辑
 */

import type {
  GameState,
  ArchetypeType,
  ArchetypeConfig,
  Operation,
  OperationEffects,
  ExamResult,
  GameEvent,
  EquipmentState,
  EquipmentType,
  EquipmentLevel,
  DifficultyLevel,
  Dimensions,
  DimensionType,
  TeamMember,
} from '../types';
import { DIFFICULTY_CONFIGS, TRAIT_CONFIGS } from '../types';
import { ExamSystem, EXAM_INTERVAL } from './ExamSystem';
import { EventSystem } from './EventSystem';
import { TeamSystem } from './TeamSystem';

// ============ 设备配置 ============

/**
 * 设备等级配置
 */
export const EQUIPMENT_LEVELS: Record<EquipmentType, EquipmentLevel[]> = {
  gpu: [
    { level: 1, name: '入门级 GPU', bonus: 0, upgradeCost: 0 },
    { level: 2, name: '专业级 GPU', bonus: 15, upgradeCost: 3000 },
    { level: 3, name: '数据中心 GPU', bonus: 30, upgradeCost: 8000 },
    { level: 4, name: '顶级 AI 集群', bonus: 50, upgradeCost: 20000 },
  ],
  storage: [
    { level: 1, name: '基础存储', bonus: 0, upgradeCost: 0 },
    { level: 2, name: 'SSD 阵列', bonus: 500, upgradeCost: 2000 },
    { level: 3, name: '分布式存储', bonus: 1500, upgradeCost: 5000 },
    { level: 4, name: '云端存储集群', bonus: 3000, upgradeCost: 12000 },
  ],
  network: [
    { level: 1, name: '普通网络', bonus: 0, upgradeCost: 0 },
    { level: 2, name: '高速光纤', bonus: 20, upgradeCost: 1500 },
    { level: 3, name: '专线网络', bonus: 40, upgradeCost: 4000 },
    { level: 4, name: '全球 CDN', bonus: 60, upgradeCost: 10000 },
  ],
  cooling: [
    { level: 1, name: '风冷散热', bonus: 0, upgradeCost: 0 },
    { level: 2, name: '水冷系统', bonus: 10, upgradeCost: 2500 },
    { level: 3, name: '液氮冷却', bonus: 25, upgradeCost: 6000 },
    { level: 4, name: '浸没式冷却', bonus: 40, upgradeCost: 15000 },
  ],
};

// ============ 初始形态配置 ============

/**
 * 三种初始形态的配置
 */
export const ARCHETYPES: Record<ArchetypeType, ArchetypeConfig> = {
  startup: {
    name: '创业公司',
    description: '资源紧张，但成长潜力巨大',
    startingResources: {
      budget: 5000,
      computeMax: 3,
      dirtyData: 100,
      goldenData: 0,
    },
    startingMetrics: {
      accuracy: 5,
      speed: 10,
      creativity: 15,
      robustness: 5,
    },
    specialAbility: '考核奖励 +50%',
    modifiers: {
      examRewardMultiplier: 1.5,
    },
  },
  bigtech: {
    name: '大厂团队',
    description: '资源充足，稳定发展',
    startingResources: {
      budget: 12000,
      computeMax: 5,
      dirtyData: 300,
      goldenData: 100,
    },
    startingMetrics: {
      accuracy: 10,
      speed: 15,
      creativity: 5,
      robustness: 10,
    },
    specialAbility: '初始算力更高',
    modifiers: {},
  },
  academic: {
    name: '学术研究',
    description: '数据获取能力强，训练效率高',
    startingResources: {
      budget: 8000,
      computeMax: 4,
      dirtyData: 200,
      goldenData: 200,
    },
    startingMetrics: {
      accuracy: 15,
      speed: 5,
      creativity: 10,
      robustness: 10,
    },
    specialAbility: '训练效率 +20%',
    modifiers: {
      trainingEfficiency: 1.2,
      dataAcquisitionBonus: 0.5,
    },
  },
};

/**
 * 创建初始设备状态
 */
function createInitialEquipment(): EquipmentState {
  return {
    gpu: { type: 'gpu', level: 1, maxLevel: 4 },
    storage: { type: 'storage', level: 1, maxLevel: 4 },
    network: { type: 'network', level: 1, maxLevel: 4 },
    cooling: { type: 'cooling', level: 1, maxLevel: 4 },
  };
}

/**
 * 创建初始能力维度状态
 */
function createInitialDimensions(): Dimensions {
  return {
    algorithm: 20,
    dataProcessing: 20,
    stability: 20,
    userExperience: 20,
  };
}

/**
 * 计算团队词条对维度的加成
 * 需求: 19.2 - 在计算能力值时自动应用团队成员的词条加成
 * 需求: 20.4 - 每级+20%加成
 */
export function calculateTeamDimensionBonuses(state: GameState): Dimensions {
  const bonuses: Dimensions = {
    algorithm: 0,
    dataProcessing: 0,
    stability: 0,
    userExperience: 0,
  };

  for (const member of state.team) {
    const levelMultiplier = 1 + (member.level - 1) * 0.2; // 每级+20%

    for (const trait of member.traits) {
      const config = TRAIT_CONFIGS[trait];
      if (config.effects.dimensionBonus) {
        for (const [dim, value] of Object.entries(config.effects.dimensionBonus)) {
          if (value !== undefined) {
            bonuses[dim as DimensionType] += value * levelMultiplier;
          }
        }
      }
    }
  }

  return bonuses;
}

/**
 * 计算有效维度值（基础值 + 团队加成）
 * 需求: 13.3 - 专项培养操作增加对应维度的能力值
 * 需求: 19.2 - 在计算能力值时自动应用团队成员的词条加成
 */
export function calculateEffectiveDimensions(state: GameState): Dimensions {
  const teamBonuses = calculateTeamDimensionBonuses(state);
  
  return {
    algorithm: Math.min(100, state.dimensions.algorithm + teamBonuses.algorithm),
    dataProcessing: Math.min(100, state.dimensions.dataProcessing + teamBonuses.dataProcessing),
    stability: Math.min(100, state.dimensions.stability + teamBonuses.stability),
    userExperience: Math.min(100, state.dimensions.userExperience + teamBonuses.userExperience),
  };
}

/**
 * 计算综合拟合度（基于四个维度指标）
 */
function calculateFitScore(metrics: { accuracy: number; speed: number; creativity: number; robustness: number }): number {
  return Math.floor(
    metrics.accuracy * 0.4 +
    metrics.speed * 0.25 +
    metrics.creativity * 0.2 +
    metrics.robustness * 0.15
  );
}


// ============ 游戏引擎类 ============

export class GameEngine {
  /**
   * 初始化游戏
   * 根据选择的初始形态和难度等级初始化游戏状态
   * 
   * @param archetype - 初始形态类型
   * @param difficulty - 难度等级，默认为 'normal'
   * @returns 初始化后的游戏状态
   * 
   * 需求: 21.4 - 应用难度参数修正
   */
  static initializeGame(archetype: ArchetypeType, difficulty: DifficultyLevel = 'normal'): GameState {
    const config = ARCHETYPES[archetype];
    const initialMetrics = config.startingMetrics;
    const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
    
    // 应用难度修正：初始资金倍率
    const adjustedBudget = Math.floor(
      config.startingResources.budget * difficultyConfig.modifiers.initialBudgetMultiplier
    );
    
    return {
      resources: {
        budget: adjustedBudget,
        computePoints: config.startingResources.computeMax,
        computeMax: config.startingResources.computeMax,
        dirtyData: config.startingResources.dirtyData,
        goldenData: config.startingResources.goldenData,
        dataCapacity: 1000,
      },
      metrics: {
        fitScore: calculateFitScore(initialMetrics),
        entropy: 0,
        fitScoreCap: 100,
        accuracy: initialMetrics.accuracy,
        speed: initialMetrics.speed,
        creativity: initialMetrics.creativity,
        robustness: initialMetrics.robustness,
      },
      dimensions: createInitialDimensions(),
      progress: {
        turn: 1,
        turnsUntilExam: EXAM_INTERVAL - 1,  // 第一次考核在第5回合
        consecutiveNegativeBudget: 0,
        examsPassed: 0,
        sideJobsThisTurn: 0,
      },
      risks: {
        legalRisk: 0,
        serverMeltdown: false,
      },
      equipment: createInitialEquipment(),
      archetype: archetype,
      difficulty: difficulty,
      reputation: 0,
      team: [],
      hiringPool: [],
      gameStatus: 'playing',
    };
  }

  static getArchetypeConfig(archetype: ArchetypeType): ArchetypeConfig {
    return ARCHETYPES[archetype];
  }

  static getAllArchetypes(): Record<ArchetypeType, ArchetypeConfig> {
    return ARCHETYPES;
  }

  /**
   * 获取难度配置
   */
  static getDifficultyConfig(difficulty: DifficultyLevel) {
    return DIFFICULTY_CONFIGS[difficulty];
  }

  /**
   * 获取所有难度配置
   */
  static getAllDifficulties() {
    return DIFFICULTY_CONFIGS;
  }

  static getEquipmentLevels(type: EquipmentType): EquipmentLevel[] {
    return EQUIPMENT_LEVELS[type];
  }

  static getEquipmentInfo(state: GameState, type: EquipmentType): EquipmentLevel {
    const equipment = state.equipment[type];
    return EQUIPMENT_LEVELS[type][equipment.level - 1];
  }

  static getUpgradeCost(state: GameState, type: EquipmentType): number | null {
    const equipment = state.equipment[type];
    if (equipment.level >= equipment.maxLevel) return null;
    return EQUIPMENT_LEVELS[type][equipment.level].upgradeCost;
  }

  static canUpgradeEquipment(state: GameState, type: EquipmentType): boolean {
    const cost = this.getUpgradeCost(state, type);
    if (cost === null) return false;
    return state.resources.budget >= cost;
  }

  static upgradeEquipment(state: GameState, type: EquipmentType): GameState {
    if (!this.canUpgradeEquipment(state, type)) return state;

    const cost = this.getUpgradeCost(state, type)!;
    const equipment = state.equipment[type];
    const newLevel = equipment.level + 1;
    const newLevelInfo = EQUIPMENT_LEVELS[type][newLevel - 1];

    let newState: GameState = {
      ...state,
      resources: {
        ...state.resources,
        budget: state.resources.budget - cost,
      },
      equipment: {
        ...state.equipment,
        [type]: { ...equipment, level: newLevel },
      },
    };

    switch (type) {
      case 'gpu':
        newState.resources.computeMax = Math.min(10, state.resources.computeMax + 1);
        break;
      case 'storage':
        newState.resources.dataCapacity = state.resources.dataCapacity + newLevelInfo.bonus;
        break;
      case 'network':
        newState.metrics.speed = Math.min(100, state.metrics.speed + Math.floor(newLevelInfo.bonus / 10));
        break;
      case 'cooling':
        newState.metrics.entropy = Math.max(0, state.metrics.entropy - Math.floor(newLevelInfo.bonus / 2));
        break;
    }

    newState.metrics.fitScore = calculateFitScore(newState.metrics);
    return newState;
  }

  static canExecuteOperation(state: GameState, operation: Operation): boolean {
    const { resources } = state;
    const { cost } = operation;
    
    // 检查资源是否足够
    if (cost.budget !== undefined && resources.budget < cost.budget) return false;
    if (resources.computePoints < cost.computePoints) return false;
    if (cost.dirtyData !== undefined && resources.dirtyData < cost.dirtyData) return false;
    if (cost.goldenData !== undefined && resources.goldenData < cost.goldenData) return false;
    
    // 调用操作自身的 canExecute 检查（包括外快次数限制、声望要求等）
    if (!operation.canExecute(state)) return false;
    
    return true;
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }


  private static applyEffects(
    state: GameState,
    effects: OperationEffects,
    modifiers: ArchetypeConfig['modifiers'] = {}
  ): GameState {
    const newState = { ...state };
    newState.resources = { ...state.resources };
    newState.metrics = { ...state.metrics };
    newState.risks = { ...state.risks };

    const gpuBonus = EQUIPMENT_LEVELS.gpu[state.equipment.gpu.level - 1].bonus / 100;
    const coolingBonus = EQUIPMENT_LEVELS.cooling[state.equipment.cooling.level - 1].bonus / 100;

    if (effects.budgetChange !== undefined) {
      if (typeof effects.budgetChange === 'number') {
        newState.resources.budget += effects.budgetChange;
      } else {
        // Handle random range budget change
        const { min, max } = effects.budgetChange;
        const randomAmount = Math.floor(Math.random() * (max - min + 1)) + min;
        newState.resources.budget += randomAmount;
      }
    }

    if (effects.dirtyDataChange !== undefined) {
      const maxData = newState.resources.dataCapacity;
      newState.resources.dirtyData = this.clamp(
        newState.resources.dirtyData + effects.dirtyDataChange, 0, maxData
      );
    }

    if (effects.goldenDataChange !== undefined) {
      newState.resources.goldenData = Math.max(0, newState.resources.goldenData + effects.goldenDataChange);
    }

    const trainingMultiplier = (modifiers.trainingEfficiency || 1) * (1 + gpuBonus);

    if (effects.accuracyChange !== undefined) {
      let change = effects.accuracyChange;
      if (change > 0) change = Math.floor(change * trainingMultiplier);
      newState.metrics.accuracy = this.clamp(newState.metrics.accuracy + change, 0, newState.metrics.fitScoreCap);
    }

    if (effects.speedChange !== undefined) {
      let change = effects.speedChange;
      if (change > 0) change = Math.floor(change * trainingMultiplier);
      newState.metrics.speed = this.clamp(newState.metrics.speed + change, 0, newState.metrics.fitScoreCap);
    }

    if (effects.creativityChange !== undefined) {
      let change = effects.creativityChange;
      if (change > 0) change = Math.floor(change * trainingMultiplier);
      newState.metrics.creativity = this.clamp(newState.metrics.creativity + change, 0, newState.metrics.fitScoreCap);
    }

    if (effects.robustnessChange !== undefined) {
      let change = effects.robustnessChange;
      if (change > 0) change = Math.floor(change * trainingMultiplier);
      newState.metrics.robustness = this.clamp(newState.metrics.robustness + change, 0, newState.metrics.fitScoreCap);
    }

    // 兼容旧的 fitScoreChange
    if (effects.fitScoreChange !== undefined) {
      let fitChange = effects.fitScoreChange;
      if (fitChange > 0) fitChange = Math.floor(fitChange * trainingMultiplier);
      const perDimension = Math.floor(fitChange / 4);
      newState.metrics.accuracy = this.clamp(newState.metrics.accuracy + perDimension, 0, newState.metrics.fitScoreCap);
      newState.metrics.speed = this.clamp(newState.metrics.speed + perDimension, 0, newState.metrics.fitScoreCap);
      newState.metrics.creativity = this.clamp(newState.metrics.creativity + perDimension, 0, newState.metrics.fitScoreCap);
      newState.metrics.robustness = this.clamp(newState.metrics.robustness + perDimension, 0, newState.metrics.fitScoreCap);
    }

    newState.metrics.fitScore = calculateFitScore(newState.metrics);

    if (effects.entropyChange !== undefined) {
      let entropyChange = effects.entropyChange;
      if (entropyChange > 0) entropyChange = Math.floor(entropyChange * (1 - coolingBonus));
      newState.metrics.entropy = this.clamp(newState.metrics.entropy + entropyChange, 0, 100);
    }

    if (effects.legalRiskChange !== undefined) {
      newState.risks.legalRisk = this.clamp(newState.risks.legalRisk + effects.legalRiskChange, 0, 100);
    }

    if (effects.fitScoreCapChange !== undefined) {
      newState.metrics.fitScoreCap = this.clamp(newState.metrics.fitScoreCap + effects.fitScoreCapChange, 0, 100);
      newState.metrics.accuracy = Math.min(newState.metrics.accuracy, newState.metrics.fitScoreCap);
      newState.metrics.speed = Math.min(newState.metrics.speed, newState.metrics.fitScoreCap);
      newState.metrics.creativity = Math.min(newState.metrics.creativity, newState.metrics.fitScoreCap);
      newState.metrics.robustness = Math.min(newState.metrics.robustness, newState.metrics.fitScoreCap);
      newState.metrics.fitScore = calculateFitScore(newState.metrics);
    }

    if (effects.computeMaxChange !== undefined) {
      newState.resources.computeMax = this.clamp(newState.resources.computeMax + effects.computeMaxChange, 1, 10);
    }

    // 处理声望变化
    // 需求: 24.1 - 声望值范围为0-100
    if (effects.reputationChange !== undefined) {
      newState.reputation = this.clamp(
        (state.reputation || 0) + effects.reputationChange, 0, 100
      );
    }

    // 处理能力维度变化
    // 需求: 14.1, 14.2, 14.3, 14.4 - 专项培养操作增加对应维度
    if (effects.dimensionChange !== undefined) {
      newState.dimensions = { ...state.dimensions };
      for (const [dim, value] of Object.entries(effects.dimensionChange)) {
        if (value !== undefined) {
          const dimKey = dim as DimensionType;
          newState.dimensions[dimKey] = this.clamp(
            newState.dimensions[dimKey] + value, 0, 100
          );
        }
      }
    }

    // 处理随机维度变化
    // 需求: 15.3 - 技术峰会随机两个维度各增加15
    if (effects.randomDimensionChange !== undefined) {
      newState.dimensions = newState.dimensions ? { ...newState.dimensions } : { ...state.dimensions };
      const { count, amount } = effects.randomDimensionChange;
      const allDimensions: DimensionType[] = ['algorithm', 'dataProcessing', 'stability', 'userExperience'];
      const shuffled = [...allDimensions].sort(() => Math.random() - 0.5);
      const selectedDimensions = shuffled.slice(0, count);
      
      for (const dim of selectedDimensions) {
        newState.dimensions[dim] = this.clamp(
          newState.dimensions[dim] + amount, 0, 100
        );
      }
    }

    return newState;
  }


  static executeOperation(state: GameState, operation: Operation, randomValue?: number): GameState {
    if (!this.canExecuteOperation(state, operation)) return state;

    const config = ARCHETYPES[state.archetype];
    const modifiers = config.modifiers;

    let newState: GameState = {
      ...state,
      resources: {
        ...state.resources,
        budget: state.resources.budget - (operation.cost.budget || 0),
        computePoints: state.resources.computePoints - operation.cost.computePoints,
        dirtyData: state.resources.dirtyData - (operation.cost.dirtyData || 0),
        goldenData: state.resources.goldenData - (operation.cost.goldenData || 0),
      },
      metrics: { ...state.metrics },
      dimensions: { ...state.dimensions },
      risks: { ...state.risks },
      progress: { ...state.progress },
      equipment: { ...state.equipment },
    };

    // 如果是外快任务，增加本回合外快计数
    // 需求: 23.3 - 每回合最多执行2次外快任务
    if (operation.isSideJob) {
      newState.progress = {
        ...newState.progress,
        sideJobsThisTurn: newState.progress.sideJobsThisTurn + 1,
      };
    }

    if (operation.effects.isGamble) {
      const successRate = operation.effects.gambleSuccessRate || 0.5;
      const roll = randomValue !== undefined ? randomValue : Math.random();
      if (roll < successRate) {
        if (operation.effects.gambleSuccessEffects) {
          newState = this.applyEffects(newState, operation.effects.gambleSuccessEffects, modifiers);
        }
      } else {
        if (operation.effects.gambleFailureEffects) {
          newState = this.applyEffects(newState, operation.effects.gambleFailureEffects, modifiers);
        }
      }
    } else {
      newState = this.applyEffects(newState, operation.effects, modifiers);
    }

    return newState;
  }

  static restoreComputePoints(state: GameState): GameState {
    return {
      ...state,
      resources: { ...state.resources, computePoints: state.resources.computeMax },
    };
  }

  static shouldTriggerExam(turn: number): boolean {
    // 每5回合触发一次考核
    return turn > 0 && turn % EXAM_INTERVAL === 0;
  }

  static endTurn(state: GameState): { newState: GameState; shouldExam: boolean } {
    const newTurn = state.progress.turn + 1;
    const turnsUntilExam = EXAM_INTERVAL - (newTurn % EXAM_INTERVAL);
    const adjustedTurnsUntilExam = turnsUntilExam === EXAM_INTERVAL ? 0 : turnsUntilExam;
    const shouldExam = this.shouldTriggerExam(state.progress.turn);

    const newState: GameState = {
      ...state,
      resources: { ...state.resources, computePoints: state.resources.computeMax },
      progress: { ...state.progress, turn: newTurn, turnsUntilExam: adjustedTurnsUntilExam },
      risks: { ...state.risks, serverMeltdown: false },
    };

    return { newState, shouldExam };
  }

  static startTurn(state: GameState, randomValue?: number): GameState {
    let newState = this.restoreComputePoints(state);
    
    // 重置本回合外快任务计数
    // 需求: 23.3 - 每回合最多执行2次外快任务
    newState = {
      ...newState,
      progress: {
        ...newState.progress,
        sideJobsThisTurn: 0,
      },
    };

    if (newState.metrics.entropy > 80) {
      const coolingBonus = EQUIPMENT_LEVELS.cooling[state.equipment.cooling.level - 1].bonus / 100;
      const meltdownChance = 0.3 * (1 - coolingBonus);
      const roll = randomValue !== undefined ? randomValue : Math.random();
      
      if (roll < meltdownChance) {
        newState = {
          ...newState,
          resources: { ...newState.resources, budget: newState.resources.budget - 1000 },
          risks: { ...newState.risks, serverMeltdown: true },
        };
      }
    }

    return newState;
  }

  static triggerExam(state: GameState, scenarioRandomValue?: number): { 
    newState: GameState; 
    result: ExamResult;
    salaryInfo?: {
      totalPaid: number;
      firedMembers: TeamMember[];
    };
  } {
    const result = ExamSystem.calculateExamResult(state, scenarioRandomValue);
    const config = ARCHETYPES[state.archetype];
    const examRewardMultiplier = config.modifiers.examRewardMultiplier || 1;
    const adjustedReward = Math.floor(result.finalReward * examRewardMultiplier);
    
    // 获取难度配置
    const difficultyConfig = DIFFICULTY_CONFIGS[state.difficulty];

    let newState: GameState = {
      ...state,
      resources: { ...state.resources, budget: state.resources.budget + adjustedReward },
      progress: {
        ...state.progress,
        examsPassed: result.passed ? state.progress.examsPassed + 1 : state.progress.examsPassed,
      },
    };

    // 考核失败惩罚（不会直接结束游戏）
    // 需求: 6.9, 6.10, 26.5
    if (!result.passed) {
      // 扣除资金惩罚
      const penalty = difficultyConfig.modifiers.examFailPenalty;
      newState.resources.budget -= penalty;
      
      // 扣除声望惩罚（噩梦难度额外扣声望）
      const reputationPenalty = difficultyConfig.modifiers.examFailReputationPenalty;
      if (reputationPenalty > 0) {
        newState = this.updateReputation(newState, -reputationPenalty);
      }
      
      // 需求: 24.6 - 考核失败时声望减少10
      newState = this.updateReputation(newState, -10);
    }

    // 需求: 25.2 - 在考核结算时扣除工资
    const salaryResult = TeamSystem.paySalaries(newState);
    newState = salaryResult.newState;

    return { 
      newState, 
      result: { ...result, finalReward: adjustedReward },
      salaryInfo: {
        totalPaid: salaryResult.totalPaid,
        firedMembers: salaryResult.firedMembers,
      },
    };
  }

  static checkGameOver(state: GameState): GameState {
    if (state.gameStatus !== 'playing') return state;

    if (state.resources.budget < 0) {
      const newConsecutiveNegative = state.progress.consecutiveNegativeBudget + 1;
      if (newConsecutiveNegative >= 2) {
        return {
          ...state,
          progress: { ...state.progress, consecutiveNegativeBudget: newConsecutiveNegative },
          gameStatus: 'gameOver',
          gameOverReason: '资金连续2回合为负数，公司破产！',
        };
      }
      return {
        ...state,
        progress: { ...state.progress, consecutiveNegativeBudget: newConsecutiveNegative },
      };
    }

    return {
      ...state,
      progress: { ...state.progress, consecutiveNegativeBudget: 0 },
    };
  }

  static triggerRandomEvent(
    state: GameState,
    triggerRandomValue?: number,
    eventSelectRandomValue?: number
  ): { newState: GameState; event: GameEvent | null } {
    const event = EventSystem.tryTriggerEvent(state, triggerRandomValue, eventSelectRandomValue);
    if (!event) return { newState: state, event: null };

    let newState = EventSystem.applyEventEffects(state, event);
    if (EventSystem.isConditionalEvent(event) && event.id === 'legal_fine') {
      newState = EventSystem.resetLegalRisk(newState);
    }

    return { newState, event };
  }

  /**
   * 更新声望值
   * 需求: 24.1 - 声望值范围为0-100
   * 
   * @param state - 当前游戏状态
   * @param change - 声望变化值（正数增加，负数减少）
   * @returns 更新后的游戏状态
   */
  static updateReputation(state: GameState, change: number): GameState {
    const newReputation = this.clamp((state.reputation || 0) + change, 0, 100);
    return {
      ...state,
      reputation: newReputation,
    };
  }

  /**
   * 执行聘请顾问操作（需要选择目标维度）
   * 需求: 15.1 - 聘请顾问操作，选定维度增加20
   * 
   * @param state - 当前游戏状态
   * @param targetDimension - 目标维度
   * @returns 更新后的游戏状态
   */
  static executeHireConsultant(state: GameState, targetDimension: DimensionType): GameState {
    // 检查资源是否足够
    if (state.resources.budget < 3000 || state.resources.computePoints < 1) {
      return state;
    }

    const newState: GameState = {
      ...state,
      resources: {
        ...state.resources,
        budget: state.resources.budget - 3000,
        computePoints: state.resources.computePoints - 1,
      },
      dimensions: {
        ...state.dimensions,
        [targetDimension]: Math.min(100, state.dimensions[targetDimension] + 20),
      },
    };

    return newState;
  }

  /**
   * 执行团队培训操作
   * 需求: 20.6 - 团队培训操作，所有成员获得经验值
   * 
   * @param state - 当前游戏状态
   * @param expAmount - 每个成员获得的经验值，默认50
   * @returns 更新后的游戏状态
   */
  static executeTeamTraining(state: GameState, expAmount: number = 50): GameState {
    // 检查资源是否足够
    if (state.resources.budget < 1500 || state.team.length === 0) {
      return state;
    }

    // 导入 TeamSystem 会造成循环依赖，所以这里直接实现经验增加逻辑
    const EXP_PER_LEVEL = [0, 100, 300, 600, 1000];
    
    const calculateLevel = (exp: number): number => {
      for (let i = EXP_PER_LEVEL.length - 1; i >= 0; i--) {
        if (exp >= EXP_PER_LEVEL[i]) {
          return i + 1;
        }
      }
      return 1;
    };

    const newState: GameState = {
      ...state,
      resources: {
        ...state.resources,
        budget: state.resources.budget - 1500,
      },
      team: state.team.map(member => {
        const newExp = member.experience + expAmount;
        const newLevel = calculateLevel(newExp);
        return {
          ...member,
          experience: newExp,
          level: Math.min(newLevel, 5),
        };
      }),
    };

    return newState;
  }
}