/**
 * TeamMemberCard 组件
 * 显示团队成员信息：名称、等级、经验进度、能力词条、稀有度、基础属性、工资
 * 
 * 需求: 18.5, 18.6, 20.5
 */

import { useState } from 'react';
import type { TeamMember, TraitType, RarityType } from '../types';
import { TRAIT_CONFIGS, RARITY_CONFIGS } from '../types';
import { EXP_PER_LEVEL } from '../engine/TeamSystem';
import './TeamMemberCard.css';

interface TeamMemberCardProps {
  member: TeamMember;
  onFire?: (memberId: string) => void;
  onRename?: (memberId: string, newName: string) => void;
  showFireButton?: boolean;
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
 * 获取稀有度配置
 */
function getRarityConfig(rarity: RarityType) {
  return RARITY_CONFIGS[rarity];
}

/**
 * 格式化工资显示
 */
function formatSalary(salary: number): string {
  return salary.toLocaleString();
}

/**
 * 计算经验进度百分比
 */
function calculateExpProgress(member: TeamMember): number {
  const currentLevel = member.level;
  if (currentLevel >= 10) return 100; // 满级
  
  const currentLevelExp = EXP_PER_LEVEL[currentLevel - 1];
  const nextLevelExp = EXP_PER_LEVEL[currentLevel];
  const expInCurrentLevel = member.experience - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  
  return Math.min(100, (expInCurrentLevel / expNeededForNextLevel) * 100);
}

/**
 * 获取下一级所需经验
 */
function getExpToNextLevel(member: TeamMember): string {
  if (member.level >= 10) return '已满级';
  
  const nextLevelExp = EXP_PER_LEVEL[member.level];
  return `${member.experience} / ${nextLevelExp}`;
}

/**
 * TeamMemberCard 组件
 */
export function TeamMemberCard({ member, onFire, onRename, showFireButton = true }: TeamMemberCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  
  const expProgress = calculateExpProgress(member);
  const expDisplay = getExpToNextLevel(member);
  const rarityConfig = getRarityConfig(member.rarity);
  
  const handleFire = () => {
    if (onFire) {
      onFire(member.id);
    }
  };

  const handleNameClick = () => {
    if (onRename) {
      setEditName(member.name);
      setIsEditing(true);
    }
  };

  const handleNameSubmit = () => {
    if (onRename && editName.trim() && editName.trim() !== member.name) {
      onRename(member.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(member.name);
      setIsEditing(false);
    }
  };

  return (
    <div className={`team-member-card rarity-${member.rarity}`}>
      <div className="member-header">
        <div className="member-info">
          {isEditing ? (
            <input
              type="text"
              className="member-name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              autoFocus
              maxLength={10}
            />
          ) : (
            <span 
              className={`member-name ${onRename ? 'editable' : ''}`}
              onClick={handleNameClick}
              title={onRename ? '点击修改名字' : undefined}
            >
              {member.name}
            </span>
          )}
          <span 
            className={`rarity-badge rarity-${member.rarity}`}
            style={{ backgroundColor: rarityConfig.color }}
          >
            {rarityConfig.name}
          </span>
          <span className={`member-level ${member.level >= 10 ? 'max-level' : ''}`}>Lv.{member.level}</span>
        </div>
        {showFireButton && onFire && (
          <button 
            className="fire-button"
            onClick={handleFire}
            title="解雇成员（返还30%雇佣费用）"
          >
            解雇
          </button>
        )}
      </div>
      
      {/* 基础属性区域 */}
      <div className="base-stats-section">
        <span className="stats-label">基础属性</span>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <span className="stat-name">算力</span>
            <span className="stat-value">{member.baseStats.computeContribution}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-name">数据</span>
            <span className="stat-value">{member.baseStats.dataEfficiency}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔧</span>
            <span className="stat-name">维护</span>
            <span className="stat-value">{member.baseStats.maintenanceSkill}</span>
          </div>
        </div>
      </div>
      
      {/* 工资显示 */}
      <div className="salary-section">
        <span className="salary-label">💰 工资</span>
        <span className="salary-value">{formatSalary(member.salary)}/考核</span>
      </div>
      
      <div className="exp-section">
        <div className="exp-header">
          <span className="exp-label">经验</span>
          <span className="exp-value">{expDisplay}</span>
        </div>
        <div className="exp-bar">
          <div 
            className={`exp-bar-fill ${member.level >= 10 ? 'max-level' : ''}`}
            style={{ width: `${expProgress}%` }}
          />
        </div>
      </div>
      
      <div className="traits-section">
        <span className="traits-label">能力词条 ({member.traits.length}/3)</span>
        <div className="traits-list">
          {member.traits.length === 0 ? (
            <span className="no-traits">暂无词条</span>
          ) : (
            member.traits.map((trait) => (
              <div 
                key={trait} 
                className={`trait-tag ${trait}`}
                title={getTraitDescription(trait)}
              >
                <span className="trait-icon">{getTraitIcon(trait)}</span>
                <span className="trait-name">{getTraitName(trait)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamMemberCard;
