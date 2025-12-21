/**
 * 操作模块
 * 导出所有游戏操作定义
 */

import { Operation, GameState } from '../types';

// ============ 数据获取操作 ============

/**
 * 全网爬虫操作
 * 消耗低资金和1 AP，增加大量脏数据，熵值增加8
 */
export const WebCrawl: Operation = {
  id: 'web_crawl',
  name: '全网爬虫',
  category: 'data',
  description: '快速获取大量脏数据，但会增加系统熵值',
  cost: {
    budget: 150,
    computePoints: 1
  },
  effects: {
    dirtyDataChange: 350,
    entropyChange: 8
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 150 &&
    state.resources.computePoints >= 1
};

/**
 * 数据清洗操作
 * 消耗中等资金和2 AP，将脏数据转化为黄金数据，熵值减少5
 */
export const DataCleaning: Operation = {
  id: 'data_cleaning',
  name: '数据清洗',
  category: 'data',
  description: '将脏数据转化为黄金数据，降低熵值',
  cost: {
    budget: 400,
    computePoints: 2,
    dirtyData: 250
  },
  effects: {
    goldenDataChange: 180,
    entropyChange: -5
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 400 &&
    state.resources.computePoints >= 2 &&
    state.resources.dirtyData >= 250
};

/**
 * 购买隐私数据操作
 * 消耗高资金和0 AP，直接获得黄金数据，法律风险增加12%
 */
export const BuyPrivateData: Operation = {
  id: 'buy_private_data',
  name: '购买隐私数据',
  category: 'data',
  description: '直接获得黄金数据，但增加法律风险',
  cost: {
    budget: 1200,
    computePoints: 0
  },
  effects: {
    goldenDataChange: 220,
    legalRiskChange: 12
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 1200
};

/**
 * 合作数据共享
 * 消耗中等资金，获得少量黄金数据，无风险
 */
export const DataPartnership: Operation = {
  id: 'data_partnership',
  name: '合作数据共享',
  category: 'data',
  description: '与合作伙伴共享数据，安全但效率较低',
  cost: {
    budget: 600,
    computePoints: 1
  },
  effects: {
    goldenDataChange: 100,
    dirtyDataChange: 120
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 600 &&
    state.resources.computePoints >= 1
};

/**
 * 用户行为采集
 * 低成本获取脏数据，但法律风险小幅增加
 */
export const UserTracking: Operation = {
  id: 'user_tracking',
  name: '用户行为采集',
  category: 'data',
  description: '追踪用户行为获取数据，有轻微法律风险',
  cost: {
    budget: 80,
    computePoints: 1
  },
  effects: {
    dirtyDataChange: 220,
    legalRiskChange: 4,
    entropyChange: 4
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 80 &&
    state.resources.computePoints >= 1
};


// ============ 模型训练操作 ============

/**
 * 随机梯度下降(SGD)操作
 * 消耗脏数据和1 AP，主要提升准确率，熵值增加
 */
export const SGD: Operation = {
  id: 'sgd',
  name: '随机梯度下降',
  category: 'training',
  description: '使用脏数据进行基础训练，提升准确率',
  cost: {
    computePoints: 1,
    dirtyData: 120
  },
  effects: {
    accuracyChange: 5,
    speedChange: 2,
    entropyChange: 6
  },
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 1 &&
    state.resources.dirtyData >= 120
};

/**
 * 精细微调操作
 * 消耗黄金数据和2 AP，均衡提升各项指标
 */
export const FineTuning: Operation = {
  id: 'fine_tuning',
  name: '精细微调',
  category: 'training',
  description: '使用黄金数据进行高质量训练，均衡提升',
  cost: {
    computePoints: 2,
    goldenData: 60
  },
  effects: {
    accuracyChange: 6,
    speedChange: 4,
    creativityChange: 3,
    robustnessChange: 3,
    entropyChange: 12
  },
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 2 &&
    state.resources.goldenData >= 60
};

/**
 * 对抗训练操作
 * 消耗3 AP，以45%概率大幅提升鲁棒性或导致指标倒扣
 */
export const AdversarialTraining: Operation = {
  id: 'adversarial_training',
  name: '对抗训练',
  category: 'training',
  description: '高风险高回报，主要提升鲁棒性',
  cost: {
    computePoints: 3
  },
  effects: {
    isGamble: true,
    gambleSuccessRate: 0.45,
    gambleSuccessEffects: {
      robustnessChange: 18,
      accuracyChange: 6,
      entropyChange: 10
    },
    gambleFailureEffects: {
      robustnessChange: -4,
      accuracyChange: -2,
      entropyChange: 12
    }
  },
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 3
};

/**
 * 迁移学习
 * 消耗资金和算力，主要提升速度
 */
export const TransferLearning: Operation = {
  id: 'transfer_learning',
  name: '迁移学习',
  category: 'training',
  description: '利用预训练模型，主要提升推理速度',
  cost: {
    budget: 800,
    computePoints: 2,
    goldenData: 25
  },
  effects: {
    speedChange: 8,
    accuracyChange: 3,
    entropyChange: 4
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 800 &&
    state.resources.computePoints >= 2 &&
    state.resources.goldenData >= 25
};

/**
 * 强化学习
 * 高消耗但主要提升创造力
 */
export const ReinforcementLearning: Operation = {
  id: 'reinforcement_learning',
  name: '强化学习',
  category: 'training',
  description: '通过奖励机制优化，主要提升创造力',
  cost: {
    budget: 600,
    computePoints: 3,
    dirtyData: 150
  },
  effects: {
    creativityChange: 10,
    speedChange: 3,
    entropyChange: 16
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 600 &&
    state.resources.computePoints >= 3 &&
    state.resources.dirtyData >= 150
};

/**
 * 模型蒸馏训练
 * 提升速度但降低创造力
 */
export const ModelDistillationTraining: Operation = {
  id: 'model_distillation_training',
  name: '模型蒸馏训练',
  category: 'training',
  description: '压缩模型提升速度，但牺牲创造力',
  cost: {
    budget: 500,
    computePoints: 2
  },
  effects: {
    speedChange: 12,
    creativityChange: -2,
    entropyChange: 6
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 500 &&
    state.resources.computePoints >= 2
};


// ============ 系统维护操作 ============

/**
 * 代码重构操作
 * 消耗2 AP，熵值减少25
 */
export const Refactor: Operation = {
  id: 'refactor',
  name: '代码重构',
  category: 'maintenance',
  description: '整理代码，降低熵值',
  cost: {
    computePoints: 2
  },
  effects: {
    entropyChange: -25
  },
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 2
};

/**
 * 知识蒸馏操作
 * 消耗3 AP和高资金，熵值归零，拟合度上限永久降低2%
 */
export const Distillation: Operation = {
  id: 'distillation',
  name: '知识蒸馏',
  category: 'maintenance',
  description: '清零熵值，但永久降低拟合度上限',
  cost: {
    budget: 2500,
    computePoints: 3
  },
  effects: {
    entropyChange: -100,
    fitScoreCapChange: -2
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 2500 &&
    state.resources.computePoints >= 3
};

/**
 * 系统优化
 * 消耗资金和算力，小幅降低熵值
 */
export const SystemOptimization: Operation = {
  id: 'system_optimization',
  name: '系统优化',
  category: 'maintenance',
  description: '优化系统性能，降低熵值',
  cost: {
    budget: 300,
    computePoints: 1
  },
  effects: {
    entropyChange: -12
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 300 &&
    state.resources.computePoints >= 1
};

/**
 * 合规审计
 * 消耗资金，降低法律风险
 */
export const ComplianceAudit: Operation = {
  id: 'compliance_audit',
  name: '合规审计',
  category: 'maintenance',
  description: '进行合规检查，降低法律风险',
  cost: {
    budget: 1000,
    computePoints: 1
  },
  effects: {
    legalRiskChange: -25
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 1000 &&
    state.resources.computePoints >= 1
};

/**
 * 服务器扩容
 * 消耗大量资金，增加算力上限
 */
export const ServerUpgrade: Operation = {
  id: 'server_upgrade',
  name: '服务器扩容',
  category: 'maintenance',
  description: '升级服务器，永久增加1点算力上限',
  cost: {
    budget: 4000,
    computePoints: 0
  },
  effects: {
    computeMaxChange: 1
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 4000 &&
    state.resources.computeMax < 8
};


// ============ 专项培养操作 ============
// 需求: 14.1, 14.2, 14.3, 14.4 - 专项培养行动

/**
 * 算法研究操作
 * 消耗2 AP和500资金，算法优化维度增加6
 * 需求: 14.1
 */
export const AlgorithmResearch: Operation = {
  id: 'algorithm_research',
  name: '算法研究',
  category: 'dimension',
  description: '深入研究算法理论，提升算法优化能力',
  cost: {
    budget: 500,
    computePoints: 2
  },
  effects: {
    dimensionChange: { algorithm: 6 }
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 500 &&
    state.resources.computePoints >= 2
};

/**
 * 数据工程操作
 * 消耗2 AP和500资金，数据处理维度增加6
 * 需求: 14.2
 */
export const DataEngineering: Operation = {
  id: 'data_engineering',
  name: '数据工程',
  category: 'dimension',
  description: '优化数据管道，提升数据处理能力',
  cost: {
    budget: 500,
    computePoints: 2
  },
  effects: {
    dimensionChange: { dataProcessing: 6 }
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 500 &&
    state.resources.computePoints >= 2
};

/**
 * 架构优化操作
 * 消耗2 AP和500资金，系统稳定维度增加6
 * 需求: 14.3
 */
export const ArchitectureOptimization: Operation = {
  id: 'architecture_optimization',
  name: '架构优化',
  category: 'dimension',
  description: '重构系统架构，提升系统稳定性',
  cost: {
    budget: 500,
    computePoints: 2
  },
  effects: {
    dimensionChange: { stability: 6 }
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 500 &&
    state.resources.computePoints >= 2
};

/**
 * 用户调研操作
 * 消耗2 AP和500资金，用户体验维度增加6
 * 需求: 14.4
 */
export const UserResearch: Operation = {
  id: 'user_research',
  name: '用户调研',
  category: 'dimension',
  description: '深入了解用户需求，提升用户体验能力',
  cost: {
    budget: 500,
    computePoints: 2
  },
  effects: {
    dimensionChange: { userExperience: 6 }
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 500 &&
    state.resources.computePoints >= 2
};


// ============ 付费提升操作 ============
// 需求: 15.1, 15.2, 15.3 - 付费能力提升行动

/**
 * 聘请顾问操作
 * 消耗3000资金和1 AP，选定维度增加20
 * 需求: 15.1
 * 注意: 此操作需要选择目标维度，由UI层处理
 */
export const HireConsultant: Operation = {
  id: 'hire_consultant',
  name: '聘请顾问',
  category: 'premium',
  description: '聘请行业专家，大幅提升选定维度',
  cost: {
    budget: 3000,
    computePoints: 1
  },
  effects: {
    // 默认效果为空，实际效果由 executeHireConsultant 函数处理
  },
  requiresDimensionChoice: true,
  canExecute: (state: GameState) =>
    state.resources.budget >= 3000 &&
    state.resources.computePoints >= 1
};

/**
 * 购买培训课程操作
 * 消耗2000资金和0 AP，所有维度各增加5
 * 需求: 15.2
 */
export const BuyTrainingCourse: Operation = {
  id: 'buy_training_course',
  name: '购买培训课程',
  category: 'premium',
  description: '购买在线课程，全面提升团队能力',
  cost: {
    budget: 2000,
    computePoints: 0
  },
  effects: {
    dimensionChange: { algorithm: 5, dataProcessing: 5, stability: 5, userExperience: 5 }
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 2000
};

/**
 * 技术峰会操作
 * 消耗5000资金和2 AP，随机两个维度各增加15
 * 需求: 15.3
 */
export const TechSummit: Operation = {
  id: 'tech_summit',
  name: '技术峰会',
  category: 'premium',
  description: '参加技术峰会，随机两个维度大幅提升',
  cost: {
    budget: 5000,
    computePoints: 2
  },
  effects: {
    randomDimensionChange: { count: 2, amount: 15 }
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 5000 &&
    state.resources.computePoints >= 2
};


// ============ 团队管理操作 ============
// 需求: 20.6 - 团队培训操作

/**
 * 团队培训操作
 * 消耗1500资金，所有成员获得经验值
 * 需求: 20.6, 20.7
 */
export const TeamTraining: Operation = {
  id: 'team_training',
  name: '团队培训',
  category: 'team',
  description: '组织团队培训，所有成员获得经验',
  cost: {
    budget: 1500,
    computePoints: 0
  },
  effects: {
    // 经验值增加由 TeamSystem.addExperienceToAll 处理
  },
  canExecute: (state: GameState) =>
    state.resources.budget >= 1500 &&
    state.team.length > 0
};


// ============ 外快任务操作 ============
// 需求: 23.1, 23.2 - 外快赚钱系统

/**
 * 接私活操作
 * 消耗2 AP，获得800-1200资金（随机），熵值+5
 * 需求: 23.1
 */
export const Freelance: Operation = {
  id: 'freelance',
  name: '接私活',
  category: 'sideJob',
  description: '接外包项目赚取收入，但会增加技术债',
  cost: {
    computePoints: 2
  },
  effects: {
    budgetChange: { min: 800, max: 1200 },
    entropyChange: 5
  },
  isSideJob: true,
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 2 &&
    state.progress.sideJobsThisTurn < 2
};

/**
 * 技术咨询操作
 * 消耗1 AP，需要算法优化>=50，声望>=30，获得1500资金
 * 需求: 23.1, 24.2
 */
export const TechConsulting: Operation = {
  id: 'tech_consulting',
  name: '技术咨询',
  category: 'sideJob',
  description: '提供技术咨询服务，需要较高算法能力和声望',
  cost: {
    computePoints: 1
  },
  effects: {
    budgetChange: 1500
  },
  isSideJob: true,
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 1 &&
    state.dimensions.algorithm >= 50 &&
    (state.reputation || 0) >= 30 &&
    state.progress.sideJobsThisTurn < 2
};

/**
 * 数据标注外包操作
 * 消耗1 AP，消耗200脏数据，获得600资金
 * 需求: 23.1
 */
export const DataLabelingOutsource: Operation = {
  id: 'data_labeling_outsource',
  name: '数据标注外包',
  category: 'sideJob',
  description: '将脏数据外包标注，换取收入',
  cost: {
    computePoints: 1,
    dirtyData: 200
  },
  effects: {
    budgetChange: 600
  },
  isSideJob: true,
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 1 &&
    state.resources.dirtyData >= 200 &&
    state.progress.sideJobsThisTurn < 2
};

/**
 * 开源贡献操作
 * 消耗2 AP，获得500资金，随机维度+5，声望+10
 * 需求: 23.1
 */
export const OpenSourceContribution: Operation = {
  id: 'open_source_contribution',
  name: '开源贡献',
  category: 'sideJob',
  description: '贡献开源项目，获得收入和声望',
  cost: {
    computePoints: 2
  },
  effects: {
    budgetChange: 500,
    reputationChange: 10,
    randomDimensionChange: { count: 1, amount: 5 }
  },
  isSideJob: true,
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 2 &&
    state.progress.sideJobsThisTurn < 2
};

/**
 * 技术博客操作
 * 消耗1 AP，需要任意维度>=60，声望>=50，获得400资金，声望+15
 * 需求: 23.1, 24.3
 */
export const TechBlog: Operation = {
  id: 'tech_blog',
  name: '技术博客',
  category: 'sideJob',
  description: '撰写技术博客，需要较高专业能力和声望',
  cost: {
    computePoints: 1
  },
  effects: {
    budgetChange: 400,
    reputationChange: 15
  },
  isSideJob: true,
  canExecute: (state: GameState) =>
    state.resources.computePoints >= 1 &&
    (state.reputation || 0) >= 50 &&
    (state.dimensions.algorithm >= 60 ||
     state.dimensions.dataProcessing >= 60 ||
     state.dimensions.stability >= 60 ||
     state.dimensions.userExperience >= 60) &&
    state.progress.sideJobsThisTurn < 2
};


// ============ 操作注册表 ============

/**
 * 所有数据获取操作
 */
export const DATA_OPERATIONS: Operation[] = [
  WebCrawl,
  DataCleaning,
  BuyPrivateData,
  DataPartnership,
  UserTracking
];

/**
 * 所有模型训练操作
 */
export const TRAINING_OPERATIONS: Operation[] = [
  SGD,
  FineTuning,
  AdversarialTraining,
  TransferLearning,
  ReinforcementLearning,
  ModelDistillationTraining
];

/**
 * 所有系统维护操作
 */
export const MAINTENANCE_OPERATIONS: Operation[] = [
  Refactor,
  Distillation,
  SystemOptimization,
  ComplianceAudit,
  ServerUpgrade
];

/**
 * 所有专项培养操作
 * 需求: 14.1, 14.2, 14.3, 14.4
 */
export const DIMENSION_OPERATIONS: Operation[] = [
  AlgorithmResearch,
  DataEngineering,
  ArchitectureOptimization,
  UserResearch
];

/**
 * 所有付费提升操作
 * 需求: 15.1, 15.2, 15.3
 */
export const PREMIUM_OPERATIONS: Operation[] = [
  HireConsultant,
  BuyTrainingCourse,
  TechSummit
];

/**
 * 所有团队管理操作
 * 需求: 20.6
 */
export const TEAM_OPERATIONS: Operation[] = [
  TeamTraining
];

/**
 * 所有外快任务操作
 * 需求: 23.1, 23.2
 */
export const SIDE_JOB_OPERATIONS: Operation[] = [
  Freelance,
  TechConsulting,
  DataLabelingOutsource,
  OpenSourceContribution,
  TechBlog
];

/**
 * 所有操作的完整列表
 */
export const ALL_OPERATIONS: Operation[] = [
  ...DATA_OPERATIONS,
  ...TRAINING_OPERATIONS,
  ...MAINTENANCE_OPERATIONS,
  ...DIMENSION_OPERATIONS,
  ...PREMIUM_OPERATIONS,
  ...TEAM_OPERATIONS,
  ...SIDE_JOB_OPERATIONS
];

/**
 * 操作ID到操作对象的映射
 */
export const OPERATIONS_MAP: Map<string, Operation> = new Map(
  ALL_OPERATIONS.map(op => [op.id, op])
);

/**
 * 根据ID获取操作
 * @param id 操作ID
 * @returns 操作对象，如果不存在则返回undefined
 */
export function getOperationById(id: string): Operation | undefined {
  return OPERATIONS_MAP.get(id);
}

/**
 * 根据类别获取操作列表
 * @param category 操作类别
 * @returns 该类别的所有操作
 */
export function getOperationsByCategory(category: 'data' | 'training' | 'maintenance' | 'dimension' | 'premium' | 'team' | 'sideJob'): Operation[] {
  switch (category) {
    case 'data':
      return DATA_OPERATIONS;
    case 'training':
      return TRAINING_OPERATIONS;
    case 'maintenance':
      return MAINTENANCE_OPERATIONS;
    case 'dimension':
      return DIMENSION_OPERATIONS;
    case 'premium':
      return PREMIUM_OPERATIONS;
    case 'team':
      return TEAM_OPERATIONS;
    case 'sideJob':
      return SIDE_JOB_OPERATIONS;
    default:
      return [];
  }
}
