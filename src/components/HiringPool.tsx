/**
 * HiringPool 组件
 * 显示可雇佣的候选人列表，包含稀有度和基础属性
 * 
 * 需求: 18.1, 18.5, 18.6
 */

import type { TeamMember, TraitType, RarityType } from '../types';
import { TRAIT_CONFIGS, RARITY_CONFIGS } from '../types';
import './HiringPool.css';

interface HiringPoolProps {
  candidates: TeamMember[];
  currentBudget: number;
  onHire: (memberId: string) => void;
  disabled?: boolean;
}

/**
 * 获取词条显示名称
 */
function getTraitName(trait: TraitType): string {
  return TRAIT_CONFIGS[trait].name;
}

/**
 * 获取词条描述
 */
function getTraitDescription(trait: TraitType): string {
  return TRAIT_CONFIGS[trait].description;
}

/**
 * 获取词条图标
 */
function getTraitIcon(trait: TraitType): string {
  const icons: Record<TraitType, string> = {
    algorithm_expert: '🧮',
    data_engineer: '📊',
    architect: '🏗️',
    product_manager: '📋',
    fullstack: '💻',
    efficiency: '⚡',
    cost_control: '💵',
    data_mining: '⛏️',
  };
  return icons[trait];
}

/**
 * 格式化费用显示
 */
function formatCost(cost: number): string {
  if (cost >= 1000) {
    return (cost / 1000).toFixed(1) + 'K';
  }
  return cost.toString();
}

/**
 * 获取稀有度配置
 */
function getRarityConfig(rarity: RarityType) {
  return RARITY_CONFIGS[rarity];
}

/**
 * 候选人卡片组件
 */
interface CandidateCardProps {
  candidate: TeamMember;
  canAfford: boolean;
  onHire: () => void;
  disabled?: boolean;
}

function CandidateCard({ candidate, canAfford, onHire, disabled }: CandidateCardProps) {
  const isDisabled = disabled || !canAfford;
  const rarityConfig = getRarityConfig(candidate.rarity);
  
  return (
    <div className={`candidate-card rarity-${candidate.rarity} ${!canAfford ? 'unaffordable' : ''}`}>
      <div className="candidate-header">
        <div className="candidate-name-row">
          <span className="candidate-name">{candidate.name}</span>
          <span 
            className={`candidate-rarity rarity-${candidate.rarity}`}
            style={{ backgroundColor: rarityConfig.color }}
          >
            {rarityConfig.name}
          </span>
        </div>
        <span className="candidate-cost">
          {formatCost(candidate.hiringCost)}
        </span>
      </div>
      
      {/* 基础属性显示 */}
      <div className="candidate-stats">
        <div className="stat-badge" title="算力贡献">
          <span className="stat-icon">⚡</span>
          <span className="stat-val">{candidate.baseStats.computeContribution}</span>
        </div>
        <div className="stat-badge" title="数据效率">
          <span className="stat-icon">📊</span>
          <span className="stat-val">{candidate.baseStats.dataEfficiency}</span>
        </div>
        <div className="stat-badge" title="维护能力">
          <span className="stat-icon">🔧</span>
          <span className="stat-val">{candidate.baseStats.maintenanceSkill}</span>
        </div>
      </div>
      
      {/* 工资预览 */}
      <div className="candidate-salary">
        <span className="salary-icon">💰</span>
        <span className="salary-text">工资: {candidate.salary}/考核</span>
      </div>
      
      <div className="candidate-traits">
        {candidate.traits.length === 0 ? (
          <span className="no-traits-hint">无词条</span>
        ) : (
          candidate.traits.map((trait) => (
            <div 
              key={trait} 
              className={`candidate-trait ${trait}`}
              title={getTraitDescription(trait)}
            >
              <span className="trait-icon">{getTraitIcon(trait)}</span>
              <span className="trait-name">{getTraitName(trait)}</span>
            </div>
          ))
        )}
      </div>
      
      <button 
        className={`hire-button ${isDisabled ? 'disabled' : ''}`}
        onClick={onHire}
        disabled={isDisabled}
        title={!canAfford ? '资金不足' : '雇佣此成员'}
      >
        {!canAfford ? '资金不足' : '雇佣'}
      </button>
    </div>
  );
}

/**
 * HiringPool 组件
 */
export function HiringPool({ candidates, currentBudget, onHire, disabled }: HiringPoolProps) {
  if (candidates.length === 0) {
    return (
      <div className="hiring-pool">
        <h4 className="hiring-pool-title">
          <span className="title-icon">👥</span>
          候选人池
        </h4>
        <div className="no-candidates">
          暂无候选人，下回合将刷新
        </div>
      </div>
    );
  }

  return (
    <div className="hiring-pool">
      <h4 className="hiring-pool-title">
        <span className="title-icon">👥</span>
        候选人池
        <span className="candidate-count">({candidates.length}人)</span>
      </h4>
      
      <div className="candidates-list">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            canAfford={currentBudget >= candidate.hiringCost}
            onHire={() => onHire(candidate.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

export default HiringPool;
