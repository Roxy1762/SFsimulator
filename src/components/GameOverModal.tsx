/**
 * GameOverModal 组件
 * 显示游戏结束界面
 * - 显示游戏结束原因
 * - 显示最终统计数据（回合数、最高拟合度等）
 * - 提供"重新开始"按钮
 * 
 * 需求: 1.4
 */

import type { GameState } from '../types';
import './GameOverModal.css';

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
}

/**
 * GameOverModal 组件
 * 显示游戏结束详情和统计数据
 */
export function GameOverModal({ gameState, onRestart }: GameOverModalProps) {
  const {
    gameOverReason,
    progress,
    metrics,
    resources,
    archetype,
  } = gameState;

  // 获取形态名称
  const archetypeNames: Record<string, string> = {
    startup: '创业公司',
    bigtech: '大厂团队',
    academic: '学术研究',
  };

  return (
    <div className="game-over-modal-overlay" onClick={onRestart}>
      <div className="game-over-modal" onClick={(e) => e.stopPropagation()}>
        <div className="game-over-modal-header">
          <span className="game-over-icon">💀</span>
          <h2>游戏结束</h2>
        </div>

        <div className="game-over-reason">
          <span className="reason-label">失败原因</span>
          <span className="reason-text">{gameOverReason || '未知原因'}</span>
        </div>

        <div className="game-over-stats">
          <h3>最终统计</h3>
          
          <div className="stat-row">
            <span className="stat-label">初始形态</span>
            <span className="stat-value">{archetypeNames[archetype] || archetype}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">存活回合数</span>
            <span className="stat-value">{progress.turn}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">最终拟合度</span>
            <span className="stat-value">{metrics.fitScore}%</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">最终熵值</span>
            <span className="stat-value">{metrics.entropy}%</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">最终资金</span>
            <span className={`stat-value ${resources.budget < 0 ? 'negative' : ''}`}>
              {resources.budget.toLocaleString()}
            </span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">拟合度上限</span>
            <span className="stat-value">{metrics.fitScoreCap}%</span>
          </div>
        </div>

        <div className="game-over-message">
          <p>你的算法帝国已经崩塌...</p>
          <p>但每一次失败都是通往飞升的阶梯！</p>
        </div>

        <button className="game-over-restart-button" onClick={onRestart}>
          重新开始
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
