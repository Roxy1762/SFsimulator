/**
 * GameOverModal 组件
 * 显示游戏结束界面
 * - 显示游戏结局类型和描述
 * - 显示最终统计数据（回合数、最高拟合度等）
 * - 显示成就和评价
 * - 提供"重新开始"按钮
 * 
 * 需求: 1.4
 */

import type { GameState } from '../types';
import { ENDING_CONFIGS, DIFFICULTY_CONFIGS } from '../types';
import './GameOverModal.css';

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
}

/**
 * 计算游戏评分
 */
function calculateScore(gameState: GameState): number {
  const { progress, metrics, resources, reputation, dimensions } = gameState;
  
  let score = 0;
  
  // 基础分：存活回合数
  score += progress.turn * 10;
  
  // 考核通过奖励
  score += progress.examsPassed * 500;
  
  // 拟合度奖励
  score += metrics.fitScore * 20;
  
  // 维度奖励
  const avgDimension = (dimensions.algorithm + dimensions.dataProcessing + 
    dimensions.stability + dimensions.userExperience) / 4;
  score += avgDimension * 10;
  
  // 声望奖励
  score += reputation * 15;
  
  // 资金奖励（正数才加分）
  if (resources.budget > 0) {
    score += Math.floor(resources.budget / 100);
  }
  
  // 熵值惩罚
  score -= metrics.entropy * 5;
  
  return Math.max(0, Math.floor(score));
}

/**
 * 获取评级
 */
function getRating(score: number, isVictory: boolean): { grade: string; title: string; color: string } {
  if (isVictory) {
    if (score >= 10000) return { grade: 'SSS', title: '传奇算法师', color: '#f1c40f' };
    if (score >= 7500) return { grade: 'SS', title: '算法大师', color: '#e67e22' };
    if (score >= 5000) return { grade: 'S', title: '资深工程师', color: '#9b59b6' };
    return { grade: 'A', title: '优秀开发者', color: '#3498db' };
  } else {
    if (score >= 3000) return { grade: 'B', title: '有潜力的新人', color: '#2ecc71' };
    if (score >= 1500) return { grade: 'C', title: '初出茅庐', color: '#95a5a6' };
    if (score >= 500) return { grade: 'D', title: '需要努力', color: '#e74c3c' };
    return { grade: 'F', title: '从头再来', color: '#c0392b' };
  }
}

/**
 * GameOverModal 组件
 * 显示游戏结束详情和统计数据
 */
export function GameOverModal({ gameState, onRestart }: GameOverModalProps) {
  const {
    gameOverReason,
    endingType,
    progress,
    metrics,
    resources,
    archetype,
    difficulty,
    reputation,
    dimensions,
    team,
    gameStatus,
  } = gameState;

  // 获取结局配置
  const ending = endingType ? ENDING_CONFIGS[endingType] : null;
  const isVictory = gameStatus === 'victory';
  
  // 计算分数和评级
  const score = calculateScore(gameState);
  const rating = getRating(score, isVictory);

  // 获取形态名称
  const archetypeNames: Record<string, string> = {
    startup: '创业公司',
    bigtech: '大厂团队',
    academic: '学术研究',
  };

  // 获取难度名称
  const difficultyName = DIFFICULTY_CONFIGS[difficulty]?.name || difficulty;

  return (
    <div className="game-over-modal-overlay" onClick={onRestart}>
      <div 
        className={`game-over-modal ${isVictory ? 'victory' : 'defeat'}`} 
        onClick={(e) => e.stopPropagation()}
        style={{ '--ending-color': ending?.color || (isVictory ? '#3498db' : '#e74c3c') } as React.CSSProperties}
      >
        {/* 头部：结局图标和标题 */}
        <div className="game-over-modal-header">
          <span className="game-over-icon">{ending?.icon || (isVictory ? '🏆' : '💀')}</span>
          <div className="header-text">
            <h2>{ending?.title || (isVictory ? '胜利' : '游戏结束')}</h2>
            {ending?.subtitle && <span className="subtitle">{ending.subtitle}</span>}
          </div>
        </div>

        {/* 结局描述 */}
        <div className="game-over-description">
          <p>{ending?.description || gameOverReason || '未知原因'}</p>
        </div>

        {/* 评分和评级 */}
        <div className="game-over-rating">
          <div className="rating-score">
            <span className="score-label">最终得分</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <div className="rating-grade" style={{ color: rating.color }}>
            <span className="grade-value">{rating.grade}</span>
            <span className="grade-title">{rating.title}</span>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="game-over-stats">
          <h3>📊 游戏统计</h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">🎮</span>
              <span className="stat-label">初始形态</span>
              <span className="stat-value">{archetypeNames[archetype] || archetype}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">⚔️</span>
              <span className="stat-label">难度</span>
              <span className="stat-value">{difficultyName}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">⏱️</span>
              <span className="stat-label">存活回合</span>
              <span className="stat-value">{progress.turn}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <span className="stat-label">通过考核</span>
              <span className="stat-value">{progress.examsPassed} 次</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">📈</span>
              <span className="stat-label">拟合度</span>
              <span className="stat-value">{metrics.fitScore}%</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-label">熵值</span>
              <span className={`stat-value ${metrics.entropy > 50 ? 'warning' : ''}`}>
                {metrics.entropy}%
              </span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">💰</span>
              <span className="stat-label">最终资金</span>
              <span className={`stat-value ${resources.budget < 0 ? 'negative' : 'positive'}`}>
                {resources.budget.toLocaleString()}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">声望</span>
              <span className="stat-value">{reputation}</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          {/* 维度统计 */}
          <div className="dimension-stats">
            <h4>能力维度</h4>
            <div className="dimension-bars">
              <div className="dimension-bar">
                <span className="dim-label">🧠 算法</span>
                <div className="dim-progress">
                  <div className="dim-fill" style={{ width: `${dimensions.algorithm}%` }}></div>
                </div>
                <span className="dim-value">{dimensions.algorithm}</span>
              </div>
              <div className="dimension-bar">
                <span className="dim-label">📊 数据</span>
                <div className="dim-progress">
                  <div className="dim-fill" style={{ width: `${dimensions.dataProcessing}%` }}></div>
                </div>
                <span className="dim-value">{dimensions.dataProcessing}</span>
              </div>
              <div className="dimension-bar">
                <span className="dim-label">🔧 稳定</span>
                <div className="dim-progress">
                  <div className="dim-fill" style={{ width: `${dimensions.stability}%` }}></div>
                </div>
                <span className="dim-value">{dimensions.stability}</span>
              </div>
              <div className="dimension-bar">
                <span className="dim-label">👤 体验</span>
                <div className="dim-progress">
                  <div className="dim-fill" style={{ width: `${dimensions.userExperience}%` }}></div>
                </div>
                <span className="dim-value">{dimensions.userExperience}</span>
              </div>
            </div>
          </div>

          {/* 团队统计 */}
          {team.length > 0 && (
            <>
              <div className="stats-divider"></div>
              <div className="team-stats">
                <h4>👥 团队成员: {team.length} 人</h4>
                <div className="team-members">
                  {team.slice(0, 5).map(member => (
                    <span key={member.id} className={`member-badge rarity-${member.rarity}`}>
                      {member.name} Lv.{member.level}
                    </span>
                  ))}
                  {team.length > 5 && <span className="member-more">+{team.length - 5}</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 结局提示 */}
        {isVictory && ending?.requirements && (
          <div className="ending-requirements">
            <span className="req-icon">🎯</span>
            <span className="req-text">达成条件: {ending.requirements}</span>
          </div>
        )}

        {/* 鼓励语 */}
        <div className="game-over-message">
          {isVictory ? (
            <p>🎉 恭喜你达成了 <strong>{ending?.title}</strong> 结局！</p>
          ) : (
            <>
              <p>每一次失败都是通往飞升的阶梯！</p>
              <p className="hint">💡 提示：尝试不同的策略和形态组合</p>
            </>
          )}
        </div>

        <button className="game-over-restart-button" onClick={onRestart}>
          <span className="restart-icon">🔄</span>
          重新开始
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
