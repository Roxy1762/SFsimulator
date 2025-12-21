/**
 * 考核系统
 * 处理流量洪峰考核逻辑
 */

import type { GameState, ExamResult, ExamScenario, DimensionType, DifficultyLevel } from '../types';
import { DIFFICULTY_CONFIGS } from '../types';

// ============ 考核常量 ============

/**
 * 考核间隔（每5回合一次考核）
 */
export const EXAM_INTERVAL = 5;

// ============ 考核场景配置 ============

/**
 * 考核场景列表
 * 每个场景包含名称、基础流量和重点考核维度
 * 需求: 16.1, 16.2
 */
const EXAM_SCENARIOS: ExamScenario[] = [
  { name: '日常流量', baseTraffic: 5000, focusDimensions: ['stability'] },
  { name: '周末高峰', baseTraffic: 8000, focusDimensions: ['stability', 'userExperience'] },
  { name: '周五晚高峰', baseTraffic: 12000, focusDimensions: ['algorithm', 'stability'] },
  { name: '突发新闻爆发', baseTraffic: 18000, focusDimensions: ['dataProcessing', 'stability'] },
  { name: '双11购物节', baseTraffic: 30000, focusDimensions: ['algorithm', 'userExperience'] },
  { name: '春节红包大战', baseTraffic: 50000, focusDimensions: ['algorithm', 'stability'] },
  { name: '新用户增长', baseTraffic: 10000, focusDimensions: ['userExperience', 'dataProcessing'] },
  { name: '算法竞赛', baseTraffic: 15000, focusDimensions: ['algorithm'] },
  { name: '数据迁移', baseTraffic: 12000, focusDimensions: ['dataProcessing', 'stability'] },
];

// ============ 考核系统类 ============

export class ExamSystem {
  /**
   * 获取所有考核场景
   * @returns 考核场景列表
   */
  static getScenarios(): ExamScenario[] {
    return EXAM_SCENARIOS;
  }

  /**
   * 随机选择考核场景
   * @param randomValue 可选的随机值（用于测试）
   * @returns 选中的考核场景
   */
  static getRandomScenario(randomValue?: number): ExamScenario {
    const roll = randomValue !== undefined ? randomValue : Math.random();
    const index = Math.floor(roll * EXAM_SCENARIOS.length);
    // 确保索引在有效范围内
    const safeIndex = Math.min(index, EXAM_SCENARIOS.length - 1);
    return EXAM_SCENARIOS[safeIndex];
  }

  /**
   * 获取本次考核的重点维度
   * 根据已通过考核次数决定是否出现双维度考核
   * - 考核次数 < 3: 只考核单维度
   * - 考核次数 >= 3: 可以出现双维度考核
   * 
   * 需求: 16.1, 16.2, 17.3
   * 
   * @param state 游戏状态
   * @param scenario 考核场景
   * @returns 重点考核维度数组
   */
  static getFocusDimensions(state: GameState, scenario: ExamScenario): DimensionType[] {
    const examsPassed = state.progress.examsPassed;
    
    // 考核次数 >= 3 时开始出现双维度考核
    if (examsPassed >= 3 && scenario.focusDimensions.length > 1) {
      return scenario.focusDimensions.slice(0, 2);
    }
    
    // 否则只返回第一个维度
    return [scenario.focusDimensions[0]];
  }

  /**
   * 计算单个维度的加成系数
   * 根据维度值和阈值计算加成
   * 
   * 需求: 16.4, 16.5, 16.6, 17.4
   * 
   * @param dimensionValue 维度能力值
   * @param examsPassed 已通过考核次数
   * @returns 加成系数
   */
  static calculateSingleDimensionBonus(dimensionValue: number, examsPassed: number): number {
    // 考核次数 >= 5 时阈值提高
    const thresholdHigh = examsPassed >= 5 ? 70 : 60;
    const thresholdMid = examsPassed >= 5 ? 50 : 40;
    
    if (dimensionValue >= thresholdHigh) {
      return 1.5;
    }
    if (dimensionValue >= thresholdMid) {
      return 1.0;
    }
    return 0.6;
  }

  /**
   * 计算维度加成系数
   * 根据重点考核维度的能力值计算加成
   * - 单维度: 直接返回该维度的加成
   * - 多维度: 取各维度加成的平均值
   * 
   * 需求: 16.4, 16.5, 16.6, 16.7, 17.4
   * 
   * @param state 游戏状态
   * @param focusDimensions 重点考核维度
   * @returns 维度加成系数
   */
  static calculateDimensionBonus(state: GameState, focusDimensions: DimensionType[]): number {
    if (focusDimensions.length === 0) {
      return 1.0;
    }
    
    const examsPassed = state.progress.examsPassed;
    
    // 计算每个维度的加成
    const bonuses = focusDimensions.map(dim => {
      const dimensionValue = state.dimensions[dim];
      return this.calculateSingleDimensionBonus(dimensionValue, examsPassed);
    });
    
    // 多维度取平均值
    const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus, 0);
    return totalBonus / bonuses.length;
  }

  /**
   * 计算稳定性系数
   * 根据熵值和宕机状态确定系数
   * - 如果触发宕机，系数为0
   * - 如果熵值 < 40%，系数为1.2
   * - 如果熵值在40-80%，系数为0.8
   * - 如果熵值 > 80%，系数为0.5
   * 
   * @param state 游戏状态
   * @returns 稳定性系数
   */
  static calculateStabilityCoefficient(state: GameState): number {
    // 如果触发服务熔断，系数为0
    if (state.risks.serverMeltdown) {
      return 0;
    }

    const entropy = state.metrics.entropy;

    // 熵值 < 40%，系数为1.2
    if (entropy < 40) {
      return 1.2;
    }

    // 熵值在40-80%（包含40和80），系数为0.8
    if (entropy <= 80) {
      return 0.8;
    }

    // 熵值 > 80%，系数为0.5
    return 0.5;
  }

  /**
   * 计算调整后的基础流量
   * 根据已通过考核次数和难度等级增加基础流量要求
   * 
   * 需求: 17.1, 17.2, 26.1
   * 
   * @param baseTraffic 原始基础流量
   * @param examsPassed 已通过考核次数
   * @param difficulty 难度等级
   * @returns 调整后的基础流量
   */
  static calculateAdjustedBaseTraffic(
    baseTraffic: number, 
    examsPassed: number,
    difficulty: DifficultyLevel
  ): number {
    const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
    const growthRate = difficultyConfig.modifiers.examDifficultyGrowth;
    
    // 根据难度动态调整增长率
    // 简单+5%，普通+8%，困难+12%，噩梦+15%
    const difficultyMultiplier = Math.pow(1 + growthRate, examsPassed);
    return Math.floor(baseTraffic * difficultyMultiplier);
  }

  /**
   * 计算奖励倍率
   * 根据已通过考核次数增加奖励以保持平衡
   * 
   * 需求: 17.5
   * 
   * @param examsPassed 已通过考核次数
   * @returns 奖励倍率
   */
  static calculateRewardMultiplier(examsPassed: number): number {
    // 每次考核奖励增加10%
    return Math.pow(1.10, examsPassed);
  }

  /**
   * 计算声望加成
   * 需求: 24.4 - 声望值 >= 70 时考核奖励+10%
   * 
   * @param reputation 声望值
   * @returns 声望加成系数
   */
  static calculateReputationBonus(reputation: number): number {
    if (reputation >= 70) {
      return 1.1; // +10%
    }
    return 1.0;
  }

  /**
   * 检查维度门槛要求
   * 根据难度和考核次数检查是否满足维度门槛
   * 
   * 需求: 17.4, 26.4, 26.5
   * 
   * @param state 游戏状态
   * @returns 门槛检查结果
   */
  static checkDimensionThreshold(state: GameState): {
    meetsThreshold: boolean;
    required: { dimCount: number; value: number } | null;
    current: number;
  } {
    const difficultyConfig = DIFFICULTY_CONFIGS[state.difficulty];
    const examsPassed = state.progress.examsPassed;
    const dims = state.dimensions;
    const dimValues = [dims.algorithm, dims.dataProcessing, dims.stability, dims.userExperience];
    
    const threshold1 = difficultyConfig.modifiers.dimensionThreshold1;
    const threshold2 = difficultyConfig.modifiers.dimensionThreshold2;
    
    // 检查第二阶段门槛（更高要求）
    if (examsPassed >= threshold2.examCount) {
      const countMet = dimValues.filter(v => v >= threshold2.value).length;
      return {
        meetsThreshold: countMet >= threshold2.dimCount,
        required: { dimCount: threshold2.dimCount, value: threshold2.value },
        current: countMet
      };
    }
    
    // 检查第一阶段门槛
    if (examsPassed >= threshold1.examCount) {
      const countMet = dimValues.filter(v => v >= threshold1.value).length;
      return {
        meetsThreshold: countMet >= threshold1.dimCount,
        required: { dimCount: threshold1.dimCount, value: threshold1.value },
        current: countMet
      };
    }
    
    // 未达到门槛要求的考核次数
    return {
      meetsThreshold: true,
      required: null,
      current: 0
    };
  }

  /**
   * 计算考核结果
   * 收益公式：调整后基础流量 × (拟合指数/100) × 稳定性系数 × 维度加成 × 奖励倍率 × 声望加成
   * 
   * 需求: 17.1, 17.2, 17.5, 24.4, 26.1, 26.4, 26.5
   * 
   * @param state 游戏状态
   * @param scenarioRandomValue 可选的场景随机值（用于测试）
   * @returns 考核结果
   */
  static calculateExamResult(
    state: GameState,
    scenarioRandomValue?: number
  ): ExamResult {
    // 随机选择考核场景
    const scenario = this.getRandomScenario(scenarioRandomValue);
    
    // 获取重点考核维度
    const focusDimensions = this.getFocusDimensions(state, scenario);

    // 计算拟合指数乘数
    const fitScoreMultiplier = state.metrics.fitScore / 100;

    // 计算稳定性系数
    const stabilityCoefficient = this.calculateStabilityCoefficient(state);
    
    // 计算维度加成
    // 需求: 16.4, 16.5, 16.6, 16.7
    const dimensionBonus = this.calculateDimensionBonus(state, focusDimensions);
    
    // 计算难度等级
    const difficultyLevel = state.progress.examsPassed + 1;
    
    // 计算调整后的基础流量（根据难度动态增长）
    // 需求: 17.1, 17.2, 26.1
    const adjustedBaseTraffic = this.calculateAdjustedBaseTraffic(
      scenario.baseTraffic, 
      state.progress.examsPassed,
      state.difficulty
    );
    
    // 计算奖励倍率（保持平衡）
    // 需求: 17.5
    const rewardMultiplier = this.calculateRewardMultiplier(state.progress.examsPassed);
    
    // 计算声望加成
    // 需求: 24.4
    const reputationBonus = this.calculateReputationBonus(state.reputation || 0);
    
    // 检查维度门槛
    // 需求: 26.4, 26.5
    const thresholdCheck = this.checkDimensionThreshold(state);

    // 计算最终收益（如果不满足门槛则为0）
    const finalReward = thresholdCheck.meetsThreshold ? Math.floor(
      adjustedBaseTraffic * fitScoreMultiplier * stabilityCoefficient * dimensionBonus * rewardMultiplier * reputationBonus
    ) : 0;

    return {
      scenario: scenario.name,
      baseTraffic: adjustedBaseTraffic,
      fitScoreMultiplier,
      stabilityCoefficient,
      dimensionBonus,
      focusDimensions,
      difficultyLevel,
      finalReward,
      passed: finalReward > 0 && thresholdCheck.meetsThreshold,
      meetsThreshold: thresholdCheck.meetsThreshold,
      thresholdInfo: {
        required: thresholdCheck.required,
        current: thresholdCheck.current
      }
    };
  }
}
