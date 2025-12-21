/**
 * 核心类型定义
 * 《黑箱：算法飞升》游戏
 */

// ============ 能力维度类型 ============

/**
 * 能力维度类型
 * - algorithm: 算法优化
 * - dataProcessing: 数据处理
 * - stability: 系统稳定
 * - userExperience: 用户体验
 */
export type DimensionType = 'algorithm' | 'dataProcessing' | 'stability' | 'userExperience';

/**
 * 能力维度状态
 * 每个维度的值范围为 0-100
 */
export interface Dimensions {
  algorithm: number;        // 算法优化 (0-100)
  dataProcessing: number;   // 数据处理 (0-100)
  stability: number;        // 系统稳定 (0-100)
  userExperience: number;   // 用户体验 (0-100)
}

// ============ 初始形态类型 ============

/**
 * 初始形态类型
 * - startup: 创业公司
 * - bigtech: 大厂团队
 * - academic: 学术研究
 */
export type ArchetypeType = 'startup' | 'bigtech' | 'academic';

/**
 * 初始形态配置
 */
export interface ArchetypeConfig {
  name: string;
  description: string;
  startingResources: {
    budget: number;
    computeMax: number;
    dirtyData: number;
    goldenData: number;
  };
  startingMetrics: {
    accuracy: number;
    speed: number;
    creativity: number;
    robustness: number;
  };
  specialAbility: string;
  modifiers: {
    examRewardMultiplier?: number;
    trainingEfficiency?: number;
    dataAcquisitionBonus?: number;
  };
}

// ============ 难度系统类型 ============

/**
 * 难度等级类型
 * - easy: 简单
 * - normal: 普通
 * - hard: 困难
 * - nightmare: 噩梦
 */
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'nightmare';

/**
 * 维度门槛配置
 */
export interface DimensionThreshold {
  examCount: number;    // 考核次数阈值
  dimCount: number;     // 需要达标的维度数量
  value: number;        // 维度值要求
}

/**
 * 难度修正参数
 */
export interface DifficultyModifiers {
  initialBudgetMultiplier: number;    // 初始资金倍率
  examDifficultyGrowth: number;       // 考核难度增长速度（百分比，如0.05表示+5%）
  negativeEventChance: number;        // 负面事件概率
  hiringCostMultiplier: number;       // 雇佣费用倍率
  examFailPenalty: number;            // 考核失败资金惩罚
  examFailReputationPenalty: number;  // 考核失败声望惩罚
  dimensionThreshold1: DimensionThreshold; // 第一阶段维度门槛
  dimensionThreshold2: DimensionThreshold; // 第二阶段维度门槛
}

/**
 * 难度配置
 */
export interface DifficultyConfig {
  name: string;
  description: string;
  modifiers: DifficultyModifiers;
}

/**
 * 难度配置对象
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: '简单',
    description: '适合新手，资源充足，挑战较低',
    modifiers: {
      initialBudgetMultiplier: 1.5,
      examDifficultyGrowth: 0.05,           // 每次考核+5%
      negativeEventChance: 0.05,
      hiringCostMultiplier: 0.8,
      examFailPenalty: 500,                 // 考核失败扣500资金
      examFailReputationPenalty: 0,         // 不扣声望
      dimensionThreshold1: { examCount: 5, dimCount: 1, value: 40 },  // 第5次考核后1个维度≥40
      dimensionThreshold2: { examCount: 8, dimCount: 2, value: 50 }   // 第8次考核后2个维度≥50
    }
  },
  normal: {
    name: '普通',
    description: '标准难度，平衡的游戏体验',
    modifiers: {
      initialBudgetMultiplier: 1.0,
      examDifficultyGrowth: 0.08,           // 每次考核+8%
      negativeEventChance: 0.10,
      hiringCostMultiplier: 1.0,
      examFailPenalty: 1000,                // 考核失败扣1000资金
      examFailReputationPenalty: 0,         // 不扣声望
      dimensionThreshold1: { examCount: 4, dimCount: 1, value: 45 },  // 第4次考核后1个维度≥45
      dimensionThreshold2: { examCount: 6, dimCount: 2, value: 55 }   // 第6次考核后2个维度≥55
    }
  },
  hard: {
    name: '困难',
    description: '资源紧张，需要精确规划',
    modifiers: {
      initialBudgetMultiplier: 0.8,
      examDifficultyGrowth: 0.12,           // 每次考核+12%
      negativeEventChance: 0.15,
      hiringCostMultiplier: 1.2,
      examFailPenalty: 2000,                // 考核失败扣2000资金
      examFailReputationPenalty: 0,         // 不扣声望
      dimensionThreshold1: { examCount: 3, dimCount: 1, value: 50 },  // 第3次考核后1个维度≥50
      dimensionThreshold2: { examCount: 5, dimCount: 2, value: 60 }   // 第5次考核后2个维度≥60
    }
  },
  nightmare: {
    name: '噩梦',
    description: '极限挑战，一步错步步错',
    modifiers: {
      initialBudgetMultiplier: 0.6,
      examDifficultyGrowth: 0.15,           // 每次考核+15%
      negativeEventChance: 0.20,
      hiringCostMultiplier: 1.5,
      examFailPenalty: 3000,                // 考核失败扣3000资金
      examFailReputationPenalty: 5,         // 考核失败扣5声望
      dimensionThreshold1: { examCount: 2, dimCount: 1, value: 55 },  // 第2次考核后1个维度≥55
      dimensionThreshold2: { examCount: 4, dimCount: 2, value: 65 }   // 第4次考核后2个维度≥65
    }
  }
};

// ============ 团队系统类型 ============

/**
 * 团队成员稀有度类型
 * - common: 普通 (60%概率, 0词条)
 * - rare: 稀有 (25%概率, 1词条)
 * - epic: 史诗 (12%概率, 2词条)
 * - legendary: 传说 (3%概率, 3词条)
 * 需求: 18.2, 18.3
 */
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * 稀有度配置接口
 */
export interface RarityConfig {
  name: string;           // 显示名称
  color: string;          // 显示颜色
  traitSlots: number;     // 词条槽位数量
  dropRate: number;       // 出现概率
  baseSalary: number;     // 基础工资（每5回合）
  baseHiringCost: number; // 基础雇佣费用
}

/**
 * 稀有度配置对象
 * 需求: 18.2, 18.3
 */
export const RARITY_CONFIGS: Record<RarityType, RarityConfig> = {
  common: {
    name: '普通',
    color: '#9e9e9e',
    traitSlots: 0,
    dropRate: 0.60,
    baseSalary: 200,
    baseHiringCost: 600
  },
  rare: {
    name: '稀有',
    color: '#2196f3',
    traitSlots: 1,
    dropRate: 0.25,
    baseSalary: 350,
    baseHiringCost: 1200
  },
  epic: {
    name: '史诗',
    color: '#9c27b0',
    traitSlots: 2,
    dropRate: 0.12,
    baseSalary: 550,
    baseHiringCost: 2500
  },
  legendary: {
    name: '传说',
    color: '#ff9800',
    traitSlots: 3,
    dropRate: 0.03,
    baseSalary: 900,
    baseHiringCost: 4500
  }
};

/**
 * 能力词条类型
 * 需求: 19.1
 */
export type TraitType = 
  | 'algorithm_expert'      // 算法专家：算法优化+8
  | 'data_engineer'         // 数据工程师：数据处理+8
  | 'architect'             // 架构师：系统稳定+8
  | 'product_manager'       // 产品经理：用户体验+8
  | 'fullstack'             // 全栈开发：所有维度+2
  | 'efficiency'            // 效率达人：每回合+1 AP
  | 'cost_control'          // 成本控制：资金消耗-8%
  | 'data_mining';          // 数据挖掘：数据获取+15%

/**
 * 词条效果配置
 */
export interface TraitEffects {
  dimensionBonus?: Partial<Record<DimensionType, number>>;
  apBonus?: number;
  costReduction?: number;
  dataBonus?: number;
}

/**
 * 词条配置
 */
export interface TraitConfig {
  name: string;
  description: string;
  effects: TraitEffects;
}

/**
 * 词条配置对象
 */
export const TRAIT_CONFIGS: Record<TraitType, TraitConfig> = {
  algorithm_expert: {
    name: '算法专家',
    description: '算法优化维度+8',
    effects: { dimensionBonus: { algorithm: 8 } }
  },
  data_engineer: {
    name: '数据工程师',
    description: '数据处理维度+8',
    effects: { dimensionBonus: { dataProcessing: 8 } }
  },
  architect: {
    name: '架构师',
    description: '系统稳定维度+8',
    effects: { dimensionBonus: { stability: 8 } }
  },
  product_manager: {
    name: '产品经理',
    description: '用户体验维度+8',
    effects: { dimensionBonus: { userExperience: 8 } }
  },
  fullstack: {
    name: '全栈开发',
    description: '所有维度+2',
    effects: { dimensionBonus: { algorithm: 2, dataProcessing: 2, stability: 2, userExperience: 2 } }
  },
  efficiency: {
    name: '效率达人',
    description: '每回合额外+1 AP',
    effects: { apBonus: 1 }
  },
  cost_control: {
    name: '成本控制',
    description: '所有操作资金消耗-8%',
    effects: { costReduction: 0.08 }
  },
  data_mining: {
    name: '数据挖掘',
    description: '数据获取操作效果+15%',
    effects: { dataBonus: 0.15 }
  }
};

/**
 * 团队成员基础属性
 * 需求: 18.2
 */
export interface BaseStats {
  computeContribution: number;  // 算力贡献 (0-20)
  dataEfficiency: number;       // 数据效率 (0-20)
  maintenanceSkill: number;     // 维护能力 (0-20)
}

/**
 * 团队成员
 * 需求: 18.2, 18.3
 */
export interface TeamMember {
  id: string;
  name: string;
  rarity: RarityType;           // 稀有度
  baseStats: BaseStats;         // 基础属性
  traits: TraitType[];          // 能力词条列表（根据稀有度决定数量）
  level: number;                // 等级 (1-10)
  experience: number;           // 当前经验值
  hiringCost: number;           // 雇佣费用
  salary: number;               // 当前工资（随等级增长）
}

// ============ 设备系统类型 ============

/**
 * 设备类型
 */
export type EquipmentType = 'gpu' | 'storage' | 'network' | 'cooling';

/**
 * 设备等级配置
 */
export interface EquipmentLevel {
  level: number;
  name: string;
  bonus: number;  // 加成百分比
  upgradeCost: number;  // 升级到下一级的费用
}

/**
 * 设备状态
 */
export interface Equipment {
  type: EquipmentType;
  level: number;
  maxLevel: number;
}

/**
 * 所有设备状态
 */
export interface EquipmentState {
  gpu: Equipment;       // GPU - 影响训练效率
  storage: Equipment;   // 存储 - 影响数据容量
  network: Equipment;   // 网络 - 影响数据获取
  cooling: Equipment;   // 散热 - 影响熵值控制
}

// ============ 游戏状态类型 ============

/**
 * 资源状态
 */
export interface Resources {
  budget: number;           // 资金
  computePoints: number;    // 当前算力点数
  computeMax: number;       // 算力上限
  dirtyData: number;        // 脏数据数量
  goldenData: number;       // 黄金数据数量
  dataCapacity: number;     // 数据容量上限
}

/**
 * 模型能力指标（多维度）
 */
export interface ModelMetrics {
  accuracy: number;      // 准确率 (0-100) - 模型预测的准确程度
  speed: number;         // 推理速度 (0-100) - 模型响应速度
  creativity: number;    // 创造力 (0-100) - 生成内容的多样性
  robustness: number;    // 鲁棒性 (0-100) - 对抗攻击的抵抗力
}

/**
 * 系统指标
 */
export interface SystemMetrics {
  entropy: number;          // 熵值/技术债 (0-100)
  fitScoreCap: number;      // 综合能力上限 (初始100)
}

/**
 * 综合指标（兼容旧代码）
 */
export interface Metrics {
  fitScore: number;         // 综合拟合指数 (0-100) - 由四个维度计算得出
  entropy: number;          // 熵值/技术债 (0-100)
  fitScoreCap: number;      // 拟合度上限 (初始100)
  // 新增多维度指标
  accuracy: number;         // 准确率
  speed: number;            // 推理速度
  creativity: number;       // 创造力
  robustness: number;       // 鲁棒性
}

/**
 * 游戏进度
 */
export interface Progress {
  turn: number;             // 当前回合数
  turnsUntilExam: number;   // 距离考核回合数
  consecutiveNegativeBudget: number; // 连续负资金回合数
  examsPassed: number;      // 已通过考核次数
  sideJobsThisTurn: number; // 本回合已执行外快次数
}

/**
 * 风险指标
 */
export interface Risks {
  legalRisk: number;        // 法律风险 (0-100)
  serverMeltdown: boolean;  // 是否触发服务熔断
}

/**
 * 游戏状态类型
 */
export type GameStatusType = 'playing' | 'gameOver' | 'victory';

/**
 * 完整游戏状态
 */
export interface GameState {
  resources: Resources;
  metrics: Metrics;
  dimensions: Dimensions;     // 能力维度
  progress: Progress;
  risks: Risks;
  equipment: EquipmentState;  // 设备状态
  archetype: ArchetypeType;
  difficulty: DifficultyLevel; // 难度等级
  reputation: number;         // 声望值 (0-100)
  team: TeamMember[];         // 当前团队成员
  hiringPool: TeamMember[];   // 可雇佣候选人池
  gameStatus: GameStatusType;
  gameOverReason?: string;
  version?: string;           // 存档版本号
}


// ============ 操作类型 ============

/**
 * 操作类别
 */
export type OperationCategory = 
  | 'data'           // 数据获取
  | 'training'       // 模型训练
  | 'maintenance'    // 系统维护
  | 'dimension'      // 专项培养
  | 'premium'        // 付费提升
  | 'team'           // 团队管理
  | 'sideJob';       // 外快任务

/**
 * 操作效果
 */
export interface OperationEffects {
  budgetChange?: number | { min: number; max: number }; // 支持随机范围
  dirtyDataChange?: number;
  goldenDataChange?: number;
  fitScoreChange?: number;
  entropyChange?: number;
  legalRiskChange?: number;
  fitScoreCapChange?: number;
  computeMaxChange?: number;  // 算力上限变化
  reputationChange?: number;  // 声望变化
  
  // 多维度指标变化
  accuracyChange?: number;
  speedChange?: number;
  creativityChange?: number;
  robustnessChange?: number;
  
  // 能力维度变化
  dimensionChange?: Partial<Record<DimensionType, number>>;
  randomDimensionChange?: { count: number; amount: number }; // 随机N个维度各增加amount
  
  // 特殊效果 - 赌博类操作
  isGamble?: boolean;
  gambleSuccessRate?: number;
  gambleSuccessEffects?: OperationEffects;
  gambleFailureEffects?: OperationEffects;
}

/**
 * 操作消耗
 */
export interface OperationCost {
  budget?: number;
  computePoints: number;
  dirtyData?: number;
  goldenData?: number;
}

/**
 * 操作定义
 */
export interface Operation {
  id: string;
  name: string;
  category: OperationCategory;
  description: string;
  cost: OperationCost;
  effects: OperationEffects;
  canExecute: (state: GameState) => boolean;
  isSideJob?: boolean;              // 是否为外快任务
  requiresDimensionChoice?: boolean; // 需要选择目标维度
}

// ============ 考核系统类型 ============

/**
 * 考核场景
 */
export interface ExamScenario {
  name: string;
  baseTraffic: number;
  focusDimensions: DimensionType[]; // 该场景侧重的维度（必须至少有一个）
}

/**
 * 考核结果
 */
export interface ExamResult {
  scenario: string;
  baseTraffic: number;
  fitScoreMultiplier: number;
  stabilityCoefficient: number;
  dimensionBonus: number;           // 维度加成
  focusDimensions: DimensionType[]; // 重点考核维度
  difficultyLevel: number;          // 当前难度等级
  finalReward: number;
  passed: boolean;
  meetsThreshold: boolean;          // 是否满足维度门槛
  thresholdInfo?: {                 // 维度门槛信息
    required: { dimCount: number; value: number } | null;
    current: number;                // 当前达标维度数
  };
}

// ============ 事件系统类型 ============

/**
 * 事件类型
 */
export type EventType = 'positive' | 'negative' | 'neutral';

/**
 * 游戏事件
 */
export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  effects: OperationEffects;
  triggerCondition?: (state: GameState) => boolean;
}

// ============ 游戏日志类型 ============

/**
 * 日志条目类型
 */
export type LogEntryType = 'operation' | 'event' | 'exam' | 'system';

/**
 * 游戏日志条目
 */
export interface LogEntry {
  id: string;
  type: LogEntryType;
  message: string;
  turn: number;
  timestamp: number;
}


// ============ 操作类别配置类型 ============

/**
 * 操作类别配置
 */
export interface OperationCategoryConfig {
  id: OperationCategory;
  name: string;
  icon: string;
  description: string;
  defaultExpanded: boolean;
}

/**
 * 操作类别配置数组
 */
export const OPERATION_CATEGORIES: OperationCategoryConfig[] = [
  { id: 'data', name: '数据获取', icon: '📊', description: '获取和处理数据', defaultExpanded: false },
  { id: 'training', name: '模型训练', icon: '🧠', description: '训练和优化模型', defaultExpanded: false },
  { id: 'maintenance', name: '系统维护', icon: '🔧', description: '维护系统稳定性', defaultExpanded: false },
  { id: 'dimension', name: '专项培养', icon: '📈', description: '提升特定能力维度', defaultExpanded: false },
  { id: 'premium', name: '付费提升', icon: '💎', description: '花费资金快速提升', defaultExpanded: false },
  { id: 'team', name: '团队管理', icon: '👥', description: '管理开发团队', defaultExpanded: false },
  { id: 'sideJob', name: '外快任务', icon: '💰', description: '赚取额外收入', defaultExpanded: false }
];

// ============ 辅助函数 ============

/**
 * 约束维度值在有效范围内 (0-100)
 */
export function clampDimension(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * 约束声望值在有效范围内 (0-100)
 */
export function clampReputation(value: number): number {
  return Math.max(0, Math.min(100, value));
}
