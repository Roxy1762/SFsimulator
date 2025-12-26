/**
 * 团队系统
 * 处理团队成员的雇佣、解雇、升级和词条加成计算
 * 
 * 需求: 18.1, 18.2, 18.3, 18.4, 18.6, 19.1, 19.2, 20.1, 20.2, 20.3, 20.4, 20.6
 */

import type {
  GameState,
  TeamMember,
  TraitType,
  DimensionType,
  RarityType,
  BaseStats,
  SpecialCharacterType,
} from '../types';
import { TRAIT_CONFIGS, DIFFICULTY_CONFIGS, RARITY_CONFIGS, SPECIAL_CHARACTER_CONFIGS } from '../types';

// ============ 常量配置 ============

/**
 * 团队系统常量
 */
export const TEAM_CONSTANTS = {
  /** 团队最大人数 - 需求 18.4 */
  MAX_TEAM_SIZE: 5,
  /** 候选人池大小 - 需求 18.1 */
  HIRING_POOL_SIZE: 3,
  /** 解雇退款比例 - 需求 18.7 */
  FIRE_REFUND_RATE: 0.3,
  /** 等级加成系数（基础属性） - 需求 20.4 */
  LEVEL_BONUS_RATE: 0.08,
  /** 工资等级增长系数 - 需求 25.3 */
  SALARY_LEVEL_MULTIPLIER: 0.10,
  /** 最大词条数量 - 需求 20.5 */
  MAX_TRAITS: 3,
  /** 升级获得词条概率 - 需求 20.5 */
  TRAIT_UNLOCK_CHANCE: 0.25,
  /** 可能获得新词条的等级（偶数级） - 需求 20.5 */
  TRAIT_UNLOCK_LEVELS: [2, 4, 6, 8, 10] as readonly number[],
};

/**
 * 基础属性范围配置（根据稀有度）
 * 需求: 18.2
 */
export const BASE_STAT_RANGES: Record<RarityType, { min: number; max: number }> = {
  common: { min: 3, max: 8 },
  rare: { min: 5, max: 12 },
  epic: { min: 8, max: 16 },
  legendary: { min: 12, max: 20 },
};

/**
 * 升级所需经验值 - 需求 20.1, 20.2, 20.3
 * 索引对应等级-1，值为升级到该等级所需的累计经验
 * 等级范围: 1-10
 */
export const EXP_PER_LEVEL = [0, 80, 200, 400, 700, 1100, 1600, 2200, 3000, 4000];

/**
 * 候选人名字池
 */
const CANDIDATE_NAMES = [
  '张伟', '李娜', '王强', '刘洋', '陈静', '杨帆', '赵磊', '周敏',
  '吴昊', '郑琳', '孙鹏', '马丽', '朱杰', '胡涛', '林芳', '何勇',
  '高明', '罗敏', '梁华', '宋雪', '唐亮', '许婷', '韩冰', '冯雷',
];

/**
 * 所有可用的词条类型
 */
const ALL_TRAITS: TraitType[] = [
  'algorithm_expert', 'data_engineer', 'architect', 'product_manager',
  'fullstack', 'efficiency', 'cost_control', 'data_mining', 'tester'
];

// ============ 团队系统类 ============

export class TeamSystem {
  /**
   * 生成候选人池
   * 需求: 18.1 - 每回合刷新3个候选人
   * 
   * @param state - 当前游戏状态
   * @returns 新的候选人数组
   */
  static generateHiringPool(state: GameState): TeamMember[] {
    const pool: TeamMember[] = [];
    for (let i = 0; i < TEAM_CONSTANTS.HIRING_POOL_SIZE; i++) {
      pool.push(this.generateTeamMember(state));
    }
    return pool;
  }

  /**
   * 根据概率决定稀有度
   * 需求: 18.2, 18.3 - 根据稀有度概率生成成员
   * 
   * @returns 随机稀有度
   */
  static determineRarity(): RarityType {
    const roll = Math.random();
    // 传说: 3%, 史诗: 12%, 稀有: 25%, 普通: 60%
    if (roll < RARITY_CONFIGS.legendary.dropRate) {
      return 'legendary';
    } else if (roll < RARITY_CONFIGS.legendary.dropRate + RARITY_CONFIGS.epic.dropRate) {
      return 'epic';
    } else if (roll < RARITY_CONFIGS.legendary.dropRate + RARITY_CONFIGS.epic.dropRate + RARITY_CONFIGS.rare.dropRate) {
      return 'rare';
    }
    return 'common';
  }

  /**
   * 生成随机基础属性
   * 需求: 18.2 - 生成随机基础属性
   * 
   * @param rarity - 稀有度
   * @returns 基础属性对象
   */
  static generateBaseStats(rarity: RarityType): BaseStats {
    const range = BASE_STAT_RANGES[rarity];
    return {
      computeContribution: this.randomInRange(range.min, range.max),
      dataEfficiency: this.randomInRange(range.min, range.max),
      maintenanceSkill: this.randomInRange(range.min, range.max),
    };
  }

  /**
   * 在指定范围内生成随机整数
   * 
   * @param min - 最小值（包含）
   * @param max - 最大值（包含）
   * @returns 随机整数
   */
  private static randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成单个团队成员
   * 需求: 18.2, 18.3 - 根据稀有度概率生成成员，根据稀有度决定词条数量
   * 支持彩蛋特殊角色：豆沙团子(7%)、过球衣(15%)
   * 
   * @param state - 当前游戏状态
   * @returns 新生成的团队成员
   */
  static generateTeamMember(state: GameState): TeamMember {
    // 首先检查是否生成特殊彩蛋角色
    const specialCharacter = this.tryGenerateSpecialCharacter(state);
    if (specialCharacter) {
      return specialCharacter;
    }
    
    // 根据概率决定稀有度
    const rarity = this.determineRarity();
    const rarityConfig = RARITY_CONFIGS[rarity];
    
    // 根据稀有度决定词条数量
    const traitCount = rarityConfig.traitSlots;
    const traits = this.getRandomTraits(traitCount);
    
    // 生成基础属性
    const baseStats = this.generateBaseStats(rarity);
    
    // 计算雇佣费用：基础费用 * 难度修正
    const difficultyConfig = DIFFICULTY_CONFIGS[state.difficulty];
    const hiringCost = Math.floor(rarityConfig.baseHiringCost * difficultyConfig.modifiers.hiringCostMultiplier);
    
    // 计算初始工资
    const salary = rarityConfig.baseSalary;
    
    // 随机选择名字
    const name = CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)];
    
    return {
      id: this.generateUUID(),
      name,
      rarity,
      baseStats,
      traits,
      level: 1,
      experience: 0,
      hiringCost,
      salary,
    };
  }

  /**
   * 尝试生成特殊彩蛋角色
   * 豆沙团子: 7%概率，5个词条
   * 过球衣: 15%概率，测试人员词条
   * 
   * @param state - 当前游戏状态
   * @returns 特殊角色或null
   */
  static tryGenerateSpecialCharacter(state: GameState): TeamMember | null {
    const roll = Math.random();
    
    // 检查豆沙团子 (7%)
    if (roll < SPECIAL_CHARACTER_CONFIGS.doushatuanzi.dropRate) {
      return this.createSpecialCharacter('doushatuanzi', state);
    }
    
    // 检查过球衣 (15%)，概率区间为 7% - 22%
    if (roll < SPECIAL_CHARACTER_CONFIGS.doushatuanzi.dropRate + SPECIAL_CHARACTER_CONFIGS.guoqiuyi.dropRate) {
      return this.createSpecialCharacter('guoqiuyi', state);
    }
    
    return null;
  }

  /**
   * 创建特殊彩蛋角色
   * 
   * @param type - 特殊角色类型
   * @param state - 当前游戏状态
   * @returns 特殊角色成员
   */
  static createSpecialCharacter(type: SpecialCharacterType, state: GameState): TeamMember {
    const config = SPECIAL_CHARACTER_CONFIGS[type];
    const difficultyConfig = DIFFICULTY_CONFIGS[state.difficulty];
    
    // 特殊角色使用传说级的基础属性范围
    const baseStats = this.generateBaseStats('legendary');
    
    // 计算雇佣费用
    const hiringCost = Math.floor(config.baseHiringCost * difficultyConfig.modifiers.hiringCostMultiplier);
    
    return {
      id: this.generateUUID(),
      name: config.name,
      rarity: 'legendary', // 特殊角色显示为传说级
      baseStats,
      traits: [...config.traits], // 使用配置的固定词条
      level: 1,
      experience: 0,
      hiringCost,
      salary: config.baseSalary,
      isSpecial: true,
      specialType: type,
    };
  }

  /**
   * 获取随机词条
   * 需求: 18.2 - 随机能力词条
   * 
   * @param count - 需要的词条数量
   * @returns 随机选择的词条数组（不重复）
   */
  static getRandomTraits(count: number): TraitType[] {
    if (count <= 0) return [];
    // 复制并打乱词条数组
    const shuffled = [...ALL_TRAITS].sort(() => Math.random() - 0.5);
    // 返回前count个
    return shuffled.slice(0, count);
  }

  /**
   * 雇佣团队成员
   * 需求: 18.3 - 扣除雇佣费用并将成员加入团队
   * 需求: 18.4 - 限制团队最大人数为5人
   * 
   * @param state - 当前游戏状态
   * @param memberId - 要雇佣的成员ID
   * @returns 更新后的游戏状态
   * @throws Error 如果团队已满、候选人不存在或资金不足
   */
  static hireMember(state: GameState, memberId: string): GameState {
    // 检查团队人数上限
    if (state.team.length >= TEAM_CONSTANTS.MAX_TEAM_SIZE) {
      throw new Error('团队已满');
    }
    
    // 查找候选人
    const member = state.hiringPool.find(m => m.id === memberId);
    if (!member) {
      throw new Error('候选人不存在');
    }
    
    // 检查资金
    if (state.resources.budget < member.hiringCost) {
      throw new Error('资金不足');
    }
    
    return {
      ...state,
      resources: {
        ...state.resources,
        budget: state.resources.budget - member.hiringCost,
      },
      team: [...state.team, member],
      hiringPool: state.hiringPool.filter(m => m.id !== memberId),
    };
  }

  /**
   * 解雇团队成员
   * 需求: 18.7 - 移除成员并返还30%雇佣费用
   * 
   * @param state - 当前游戏状态
   * @param memberId - 要解雇的成员ID
   * @returns 更新后的游戏状态
   * @throws Error 如果成员不存在
   */
  static fireMember(state: GameState, memberId: string): GameState {
    const member = state.team.find(m => m.id === memberId);
    if (!member) {
      throw new Error('成员不存在');
    }
    
    // 计算退款金额
    const refund = Math.floor(member.hiringCost * TEAM_CONSTANTS.FIRE_REFUND_RATE);
    
    return {
      ...state,
      resources: {
        ...state.resources,
        budget: state.resources.budget + refund,
      },
      team: state.team.filter(m => m.id !== memberId),
    };
  }

  /**
   * 为团队成员增加经验值
   * 需求: 20.2 - 参与操作增加经验值
   * 需求: 20.3 - 经验值达到阈值时升级
   * 需求: 20.5 - 升级到偶数级时有概率获得新词条
   * 需求: 25.3 - 升级时更新工资
   * 
   * @param state - 当前游戏状态
   * @param memberId - 成员ID
   * @param exp - 增加的经验值
   * @returns 更新后的游戏状态
   */
  static addExperience(state: GameState, memberId: string, exp: number): GameState {
    return {
      ...state,
      team: state.team.map(member => {
        if (member.id !== memberId) return member;
        
        const oldLevel = member.level;
        const newExp = member.experience + exp;
        const newLevel = Math.min(this.calculateLevel(newExp), 10); // 最高10级
        
        // 检查是否升级并可能获得新词条
        let newTraits = [...member.traits];
        if (newLevel > oldLevel) {
          // 检查从旧等级到新等级之间是否经过了可获得词条的等级
          for (let level = oldLevel + 1; level <= newLevel; level++) {
            if (TEAM_CONSTANTS.TRAIT_UNLOCK_LEVELS.includes(level)) {
              // 尝试获得新词条
              const acquiredTrait = this.tryAcquireNewTrait(newTraits);
              if (acquiredTrait) {
                newTraits = [...newTraits, acquiredTrait];
              }
            }
          }
        }
        
        // 如果升级了，更新工资
        const updatedMember: TeamMember = {
          ...member,
          experience: newExp,
          level: newLevel,
          traits: newTraits,
        };
        
        // 更新工资
        return this.updateMemberSalary(updatedMember);
      }),
    };
  }

  /**
   * 尝试获得新词条
   * 需求: 20.5 - 升级到偶数级时25%概率获得新词条，最多3个
   * 
   * @param currentTraits - 当前已有的词条
   * @returns 新获得的词条，如果没有获得则返回null
   */
  static tryAcquireNewTrait(currentTraits: TraitType[]): TraitType | null {
    // 检查是否已达到最大词条数
    if (currentTraits.length >= TEAM_CONSTANTS.MAX_TRAITS) {
      return null;
    }
    
    // 25%概率获得新词条
    if (Math.random() >= TEAM_CONSTANTS.TRAIT_UNLOCK_CHANCE) {
      return null;
    }
    
    // 获取可用的词条（排除已有的）
    const availableTraits = ALL_TRAITS.filter(trait => !currentTraits.includes(trait));
    if (availableTraits.length === 0) {
      return null;
    }
    
    // 随机选择一个新词条
    return availableTraits[Math.floor(Math.random() * availableTraits.length)];
  }

  /**
   * 为所有团队成员增加经验值
   * 需求: 20.6 - 团队培训操作
   * 需求: 20.5 - 升级到偶数级时有概率获得新词条
   * 需求: 25.3 - 升级时更新工资
   * 
   * @param state - 当前游戏状态
   * @param exp - 增加的经验值
   * @returns 更新后的游戏状态
   */
  static addExperienceToAll(state: GameState, exp: number): GameState {
    return {
      ...state,
      team: state.team.map(member => {
        const oldLevel = member.level;
        const newExp = member.experience + exp;
        const newLevel = Math.min(this.calculateLevel(newExp), 10);
        
        // 检查是否升级并可能获得新词条
        let newTraits = [...member.traits];
        if (newLevel > oldLevel) {
          // 检查从旧等级到新等级之间是否经过了可获得词条的等级
          for (let level = oldLevel + 1; level <= newLevel; level++) {
            if (TEAM_CONSTANTS.TRAIT_UNLOCK_LEVELS.includes(level)) {
              // 尝试获得新词条
              const acquiredTrait = this.tryAcquireNewTrait(newTraits);
              if (acquiredTrait) {
                newTraits = [...newTraits, acquiredTrait];
              }
            }
          }
        }
        
        const updatedMember: TeamMember = {
          ...member,
          experience: newExp,
          level: newLevel,
          traits: newTraits,
        };
        
        // 更新工资
        return this.updateMemberSalary(updatedMember);
      }),
    };
  }

  /**
   * 根据经验值计算等级
   * 需求: 20.1 - 维护经验值和等级(1-10级)
   * 需求: 20.3 - 经验值达到升级阈值时提升等级
   * 
   * @param exp - 当前经验值
   * @returns 对应的等级(1-10)
   */
  static calculateLevel(exp: number): number {
    for (let i = EXP_PER_LEVEL.length - 1; i >= 0; i--) {
      if (exp >= EXP_PER_LEVEL[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * 计算团队词条加成
   * 需求: 19.2 - 在计算能力值时自动应用团队成员的词条加成
   * 需求: 20.4 - 每级+8%加成
   * 
   * @param state - 当前游戏状态
   * @returns 团队加成对象
   */
  static calculateTeamBonuses(state: GameState): {
    dimensionBonus: Record<DimensionType, number>;
    apBonus: number;
    costReduction: number;
    dataBonus: number;
  } {
    const result = {
      dimensionBonus: {
        algorithm: 0,
        dataProcessing: 0,
        stability: 0,
        userExperience: 0,
      } as Record<DimensionType, number>,
      apBonus: 0,
      costReduction: 0,
      dataBonus: 0,
    };
    
    for (const member of state.team) {
      // 等级加成：每级+8%
      const levelMultiplier = 1 + (member.level - 1) * TEAM_CONSTANTS.LEVEL_BONUS_RATE;
      
      for (const trait of member.traits) {
        const config = TRAIT_CONFIGS[trait];
        
        // 维度加成
        if (config.effects.dimensionBonus) {
          for (const [dim, value] of Object.entries(config.effects.dimensionBonus)) {
            if (value !== undefined) {
              result.dimensionBonus[dim as DimensionType] += value * levelMultiplier;
            }
          }
        }
        
        // AP加成
        if (config.effects.apBonus) {
          result.apBonus += config.effects.apBonus * levelMultiplier;
        }
        
        // 成本减免
        if (config.effects.costReduction) {
          result.costReduction += config.effects.costReduction * levelMultiplier;
        }
        
        // 数据加成
        if (config.effects.dataBonus) {
          result.dataBonus += config.effects.dataBonus * levelMultiplier;
        }
      }
    }
    
    return result;
  }

  /**
   * 计算成员当前工资
   * 需求: 25.1 - 根据稀有度设置基础工资
   * 需求: 25.3 - 每级工资增加10%
   * 
   * @param member - 团队成员
   * @returns 当前工资
   */
  static calculateMemberSalary(member: TeamMember): number {
    const baseSalary = RARITY_CONFIGS[member.rarity].baseSalary;
    const levelMultiplier = 1 + (member.level - 1) * TEAM_CONSTANTS.SALARY_LEVEL_MULTIPLIER;
    return Math.floor(baseSalary * levelMultiplier);
  }

  /**
   * 计算团队总工资
   * 需求: 25.2 - 计算所有团队成员的工资总和
   * 
   * @param state - 当前游戏状态
   * @returns 团队总工资
   */
  static calculateTotalSalary(state: GameState): number {
    return state.team.reduce((total, member) => {
      return total + this.calculateMemberSalary(member);
    }, 0);
  }

  /**
   * 支付团队工资
   * 需求: 25.2 - 在考核结算时扣除工资
   * 需求: 25.5 - 资金不足时随机解雇成员
   * 
   * @param state - 当前游戏状态
   * @returns 更新后的游戏状态和解雇信息
   */
  static paySalaries(state: GameState): { 
    newState: GameState; 
    firedMembers: TeamMember[];
    totalPaid: number;
  } {
    let currentState = { ...state };
    const firedMembers: TeamMember[] = [];
    let totalPaid = 0;

    // 持续检查是否能支付工资，如果不能则解雇成员
    while (currentState.team.length > 0) {
      const totalSalary = this.calculateTotalSalary(currentState);
      
      if (currentState.resources.budget >= totalSalary) {
        // 可以支付所有工资
        currentState = {
          ...currentState,
          resources: {
            ...currentState.resources,
            budget: currentState.resources.budget - totalSalary,
          },
        };
        totalPaid = totalSalary;
        break;
      } else {
        // 资金不足，随机解雇一名成员
        const randomIndex = Math.floor(Math.random() * currentState.team.length);
        const firedMember = currentState.team[randomIndex];
        firedMembers.push(firedMember);
        
        currentState = {
          ...currentState,
          team: currentState.team.filter((_, index) => index !== randomIndex),
        };
      }
    }

    // 如果团队为空，不需要支付工资
    if (currentState.team.length === 0 && firedMembers.length > 0) {
      totalPaid = 0;
    }

    return { newState: currentState, firedMembers, totalPaid };
  }

  /**
   * 更新成员工资（升级时调用）
   * 需求: 25.3 - 工资随等级增长
   * 
   * @param member - 团队成员
   * @returns 更新工资后的成员
   */
  static updateMemberSalary(member: TeamMember): TeamMember {
    return {
      ...member,
      salary: this.calculateMemberSalary(member),
    };
  }

  /**
   * 生成UUID
   * 用于生成唯一的成员ID
   */
  private static generateUUID(): string {
    // 简单的UUID生成，如果环境支持crypto则使用crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // 降级方案
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
