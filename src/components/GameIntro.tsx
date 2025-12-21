/**
 * GameIntro 组件
 * 游戏简介界面，展示游戏背景故事、目标和核心资源介绍
 * 
 * 需求: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8
 */

import { useState, useEffect } from 'react';
import './GameIntro.css';

// 本地存储键名
const INTRO_VIEWED_KEY = 'algorithm_ascension_intro_viewed';

interface GameIntroProps {
  onStartGame: () => void;
  onViewTutorial?: () => void;
}

/**
 * 检查是否已查看过简介
 */
export function hasViewedIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_VIEWED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 标记简介已查看
 */
export function markIntroViewed(): void {
  try {
    localStorage.setItem(INTRO_VIEWED_KEY, 'true');
  } catch {
    // 忽略存储错误
  }
}

/**
 * 重置简介查看状态（用于测试或设置）
 */
export function resetIntroViewed(): void {
  try {
    localStorage.removeItem(INTRO_VIEWED_KEY);
  } catch {
    // 忽略存储错误
  }
}

/**
 * 核心资源卡片数据
 */
const RESOURCE_CARDS = [
  {
    icon: '💰',
    name: '资金 (Budget)',
    description: '公司运营的命脉。用于购买数据、雇佣团队、升级设备。连续2回合资金为负将导致公司破产！',
    color: '#f59e0b'
  },
  {
    icon: '⚡',
    name: '算力 (AP)',
    description: '每回合可用的行动点数。执行操作需要消耗算力，回合结束后恢复到上限。',
    color: '#3b82f6'
  },
  {
    icon: '📊',
    name: '数据',
    description: '分为脏数据和黄金数据。脏数据需要清洗才能高效训练，黄金数据可直接用于精细调优。',
    color: '#22c55e'
  }
];

/**
 * 核心机制卡片数据
 */
const MECHANIC_CARDS = [
  {
    icon: '📈',
    name: '拟合指数',
    description: '模型的性能指标，越高在考核中获得的收益越多。通过训练操作提升。',
    color: '#8b5cf6'
  },
  {
    icon: '🔥',
    name: '熵值/技术债',
    description: '系统的混乱程度。过高会降低收益，超过80%可能触发服务熔断！需要通过维护操作降低。',
    color: '#ef4444'
  },
  {
    icon: '🎯',
    name: '流量考核',
    description: '每5回合进行一次考核，根据拟合指数、稳定性和能力维度计算收益。考核失败会扣除资金。',
    color: '#06b6d4'
  }
];

/**
 * GameIntro 组件
 * 显示游戏简介、背景故事和核心机制介绍
 */
export function GameIntro({ onStartGame, onViewTutorial }: GameIntroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 入场动画延迟
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = () => {
    markIntroViewed();
    onStartGame();
  };

  const handleViewTutorial = () => {
    markIntroViewed();
    onViewTutorial?.();
  };

  return (
    <div className={`game-intro-container ${isVisible ? 'visible' : ''}`}>
      {/* 标题区域 */}
      <header className="intro-header">
        <div className="intro-logo">🤖</div>
        <h1 className="intro-title">黑箱：算法飞升</h1>
        <p className="intro-tagline">成为推荐系统的终极架构师</p>
      </header>

      {/* 背景故事 */}
      <section className="intro-section story-section">
        <h2 className="section-title">
          <span className="section-icon">📖</span>
          背景故事
        </h2>
        <div className="story-content">
          <p>
            在这个数据驱动的时代，你被任命为一家科技公司的<strong>推荐系统首席架构师</strong>。
            你的使命是在有限的资源下，通过收集数据、训练模型、管理团队，
            打造出能够<strong>统治人类注意力</strong>的终极算法。
          </p>
          <p>
            但这条路并不平坦——你需要应对定期的<strong>流量洪峰考核</strong>，
            平衡系统的<strong>性能与稳定性</strong>，还要小心不要让公司陷入财务危机。
            每一个决策都可能影响你的算法帝国的命运。
          </p>
        </div>
      </section>

      {/* 游戏目标 */}
      <section className="intro-section objective-section">
        <h2 className="section-title">
          <span className="section-icon">🎯</span>
          游戏目标
        </h2>
        <div className="objective-content">
          <div className="objective-card primary">
            <div className="objective-icon">🏆</div>
            <div className="objective-text">
              <h3>通过流量考核</h3>
              <p>每5回合面临一次考核，根据模型表现获得资金奖励</p>
            </div>
          </div>
          <div className="objective-card">
            <div className="objective-icon">📊</div>
            <div className="objective-text">
              <h3>提升模型性能</h3>
              <p>通过训练提高拟合指数，培养多维度能力</p>
            </div>
          </div>
          <div className="objective-card">
            <div className="objective-icon">⚖️</div>
            <div className="objective-text">
              <h3>保持系统稳定</h3>
              <p>控制熵值，避免服务熔断和系统崩溃</p>
            </div>
          </div>
          <div className="objective-card">
            <div className="objective-icon">💼</div>
            <div className="objective-text">
              <h3>管理公司财务</h3>
              <p>保持资金流动，避免连续2回合负资金导致破产</p>
            </div>
          </div>
        </div>
      </section>

      {/* 核心资源 */}
      <section className="intro-section resources-section">
        <h2 className="section-title">
          <span className="section-icon">💎</span>
          核心资源
        </h2>
        <div className="resource-cards">
          {RESOURCE_CARDS.map((resource, index) => (
            <div 
              key={resource.name}
              className="resource-card"
              style={{ 
                '--card-color': resource.color,
                '--card-delay': `${index * 0.1}s`
              } as React.CSSProperties}
            >
              <div className="resource-icon">{resource.icon}</div>
              <h3 className="resource-name">{resource.name}</h3>
              <p className="resource-description">{resource.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 核心机制 */}
      <section className="intro-section mechanics-section">
        <h2 className="section-title">
          <span className="section-icon">⚙️</span>
          核心机制
        </h2>
        <div className="mechanic-cards">
          {MECHANIC_CARDS.map((mechanic, index) => (
            <div 
              key={mechanic.name}
              className="mechanic-card"
              style={{ 
                '--card-color': mechanic.color,
                '--card-delay': `${index * 0.1}s`
              } as React.CSSProperties}
            >
              <div className="mechanic-icon">{mechanic.icon}</div>
              <h3 className="mechanic-name">{mechanic.name}</h3>
              <p className="mechanic-description">{mechanic.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 导航按钮 */}
      <div className="intro-actions">
        <button 
          className="intro-button primary"
          onClick={handleStartGame}
        >
          <span className="button-icon">🚀</span>
          开始游戏
        </button>
        {onViewTutorial && (
          <button 
            className="intro-button secondary"
            onClick={handleViewTutorial}
          >
            <span className="button-icon">📚</span>
            查看教程
          </button>
        )}
      </div>

      {/* 底部提示 */}
      <footer className="intro-footer">
        <p>提示：首次游戏建议选择"简单"难度和"大厂团队"形态</p>
      </footer>
    </div>
  );
}

export default GameIntro;
