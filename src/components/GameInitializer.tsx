/**
 * GameInitializer 组件
 * 显示难度选择和三种初始形态选项，让玩家选择开始游戏
 * 
 * 需求: 10.1, 10.5, 10.6, 21.1, 21.3
 */

import { useState } from 'react';
import type { ArchetypeType, ArchetypeConfig, DifficultyLevel, DifficultyConfig } from '../types';
import { DIFFICULTY_CONFIGS } from '../types';
import { GameEngine } from '../engine/GameEngine';
import './GameInitializer.css';

interface GameInitializerProps {
  onSelectArchetype: (archetype: ArchetypeType, difficulty: DifficultyLevel) => void;
  onLoadGame?: () => void;
  hasSavedGame?: boolean;
}

/**
 * 难度卡片组件
 */
interface DifficultyCardProps {
  difficultyKey: DifficultyLevel;
  config: DifficultyConfig;
  isSelected: boolean;
  onSelect: () => void;
}

function DifficultyCard({ difficultyKey, config, isSelected, onSelect }: DifficultyCardProps) {
  return (
    <div 
      className={`difficulty-card difficulty-${difficultyKey} ${isSelected ? 'selected' : ''}`} 
      onClick={onSelect}
    >
      <h3 className="difficulty-name">{config.name}</h3>
      <p className="difficulty-description">{config.description}</p>
      
      <div className="difficulty-modifiers">
        <h4>难度参数</h4>
        <ul>
          <li>
            <span className="modifier-label">初始资金:</span>
            <span className={`modifier-value ${config.modifiers.initialBudgetMultiplier >= 1 ? 'positive' : 'negative'}`}>
              ×{config.modifiers.initialBudgetMultiplier}
            </span>
          </li>
          <li>
            <span className="modifier-label">考核难度增长:</span>
            <span className={`modifier-value ${config.modifiers.examDifficultyGrowth <= 1 ? 'positive' : 'negative'}`}>
              ×{config.modifiers.examDifficultyGrowth}
            </span>
          </li>
          <li>
            <span className="modifier-label">负面事件概率:</span>
            <span className={`modifier-value ${config.modifiers.negativeEventChance <= 0.1 ? 'positive' : 'negative'}`}>
              {Math.round(config.modifiers.negativeEventChance * 100)}%
            </span>
          </li>
          <li>
            <span className="modifier-label">雇佣费用:</span>
            <span className={`modifier-value ${config.modifiers.hiringCostMultiplier <= 1 ? 'positive' : 'negative'}`}>
              ×{config.modifiers.hiringCostMultiplier}
            </span>
          </li>
        </ul>
      </div>
      
      {isSelected && <div className="selected-indicator">✓ 已选择</div>}
    </div>
  );
}

/**
 * 形态卡片组件
 */
interface ArchetypeCardProps {
  archetypeKey: ArchetypeType;
  config: ArchetypeConfig;
  onSelect: () => void;
}

function ArchetypeCard({ archetypeKey, config, onSelect }: ArchetypeCardProps) {
  return (
    <div className={`archetype-card archetype-${archetypeKey}`} onClick={onSelect}>
      <h3 className="archetype-name">{config.name}</h3>
      <p className="archetype-description">{config.description}</p>
      
      <div className="archetype-resources">
        <h4>起始资源</h4>
        <ul>
          <li>
            <span className="resource-label">资金:</span>
            <span className="resource-value">{config.startingResources.budget.toLocaleString()}</span>
          </li>
          <li>
            <span className="resource-label">算力上限:</span>
            <span className="resource-value">{config.startingResources.computeMax}</span>
          </li>
          <li>
            <span className="resource-label">脏数据:</span>
            <span className="resource-value">{config.startingResources.dirtyData}</span>
          </li>
          <li>
            <span className="resource-label">黄金数据:</span>
            <span className="resource-value">{config.startingResources.goldenData}</span>
          </li>
        </ul>
      </div>
      
      <div className="archetype-ability">
        <h4>特殊能力</h4>
        <p>{config.specialAbility}</p>
      </div>
      
      <button className="select-button" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        选择此形态
      </button>
    </div>
  );
}

/**
 * 游戏初始化组件
 * 显示难度选择和三种初始形态供玩家选择
 */
export function GameInitializer({ onSelectArchetype, onLoadGame, hasSavedGame }: GameInitializerProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');
  const [step, setStep] = useState<'difficulty' | 'archetype'>('difficulty');
  
  const archetypes = GameEngine.getAllArchetypes();
  const archetypeKeys: ArchetypeType[] = ['startup', 'bigtech', 'academic'];
  const difficultyKeys: DifficultyLevel[] = ['easy', 'normal', 'hard', 'nightmare'];

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
  };

  const handleContinueToArchetype = () => {
    setStep('archetype');
  };

  const handleBackToDifficulty = () => {
    setStep('difficulty');
  };

  const handleArchetypeSelect = (archetype: ArchetypeType) => {
    onSelectArchetype(archetype, selectedDifficulty);
  };

  return (
    <div className="game-initializer">
      <div className="initializer-header">
        <h1>黑箱：算法飞升</h1>
        <p className="subtitle">
          {step === 'difficulty' 
            ? '选择游戏难度' 
            : '选择你的初始形态，开始你的算法帝国之旅'}
        </p>
      </div>

      {hasSavedGame && onLoadGame && step === 'difficulty' && (
        <div className="saved-game-section">
          <button className="load-game-button" onClick={onLoadGame}>
            继续上次游戏
          </button>
          <p className="or-divider">或选择新游戏</p>
        </div>
      )}

      {step === 'difficulty' && (
        <>
          <div className="difficulty-grid">
            {difficultyKeys.map((key) => (
              <DifficultyCard
                key={key}
                difficultyKey={key}
                config={DIFFICULTY_CONFIGS[key]}
                isSelected={selectedDifficulty === key}
                onSelect={() => handleDifficultySelect(key)}
              />
            ))}
          </div>
          
          <div className="step-navigation">
            <button 
              className="continue-button"
              onClick={handleContinueToArchetype}
            >
              继续选择形态 →
            </button>
          </div>
        </>
      )}

      {step === 'archetype' && (
        <>
          <div className="selected-difficulty-banner">
            <span>当前难度: </span>
            <strong className={`difficulty-badge difficulty-${selectedDifficulty}`}>
              {DIFFICULTY_CONFIGS[selectedDifficulty].name}
            </strong>
            <button className="change-difficulty-btn" onClick={handleBackToDifficulty}>
              更改难度
            </button>
          </div>

          <div className="archetype-grid">
            {archetypeKeys.map((key) => (
              <ArchetypeCard
                key={key}
                archetypeKey={key}
                config={archetypes[key]}
                onSelect={() => handleArchetypeSelect(key)}
              />
            ))}
          </div>
        </>
      )}

      <div className="game-intro">
        <h2>游戏简介</h2>
        <p>
          你是一名推荐系统的首席架构师。在资源限制下，通过收集数据、训练模型、
          升级硬件来应对流量考核。每7回合将面临一次流量洪峰考核，
          根据你的模型拟合度和系统稳定性获得收益。
        </p>
        <p>
          注意平衡拟合指数和熵值——过高的熵值会导致系统不稳定，
          甚至触发服务熔断！资金连续2回合为负将导致公司破产。
        </p>
      </div>
    </div>
  );
}

export default GameInitializer;
