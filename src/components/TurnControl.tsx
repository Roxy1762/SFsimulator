/**
 * TurnControl 组件
 * 显示"结束回合"按钮
 * 处理回合结束逻辑
 * 显示当前回合状态（正常/服务熔断）
 * 
 * 需求: 7.5
 */

import { useState, useRef } from 'react';
import { useGameState, useGameActions } from '../context/GameContext';
import './TurnControl.css';

/**
 * TurnControl 组件
 * 控制回合结束和显示当前回合状态
 */
export function TurnControl() {
  const { gameState } = useGameState();
  const { endTurn, startTurn, triggerExam, triggerEvent, checkGameOver } = useGameActions();
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedTurnRef = useRef<number>(0);

  if (!gameState) {
    return null;
  }

  const { progress, risks, gameStatus } = gameState;
  const isGameOver = gameStatus !== 'playing';
  const isMeltdown = risks.serverMeltdown;

  /**
   * 处理结束回合
   * 执行完整的回合结束流程
   */
  const handleEndTurn = () => {
    if (isGameOver || isProcessing) return;
    
    // 防止同一回合重复处理
    if (lastProcessedTurnRef.current === progress.turn) return;
    lastProcessedTurnRef.current = progress.turn;
    
    setIsProcessing(true);

    // 先保存当前回合是否需要考核的状态
    const shouldTriggerExam = progress.turnsUntilExam === 1;

    // 1. 结束当前回合
    endTurn();

    // 2. 检查是否需要触发考核（每7回合）- 使用之前保存的状态
    if (shouldTriggerExam) {
      // 使用 setTimeout 确保状态更新后再触发考核
      setTimeout(() => {
        triggerExam();
      }, 0);
    }

    // 3. 开始新回合（恢复算力，检查熔断）
    setTimeout(() => {
      startTurn();
      
      // 4. 尝试触发随机事件
      triggerEvent();

      // 5. 检查游戏结束条件
      checkGameOver();
      
      setIsProcessing(false);
    }, shouldTriggerExam ? 50 : 0);
  };

  return (
    <div className="turn-control">
      {/* 回合状态显示 */}
      <div className={`turn-status ${isMeltdown ? 'meltdown' : 'normal'}`}>
        {isMeltdown ? (
          <>
            <span className="status-icon">🔥</span>
            <span className="status-text">服务熔断中</span>
            <span className="status-desc">本回合无法执行操作</span>
          </>
        ) : (
          <>
            <span className="status-icon">✅</span>
            <span className="status-text">系统正常</span>
            <span className="status-desc">可以执行操作</span>
          </>
        )}
      </div>

      {/* 结束回合按钮 */}
      <button
        className="end-turn-button"
        onClick={handleEndTurn}
        disabled={isGameOver || isProcessing}
      >
        <span className="button-icon">⏭️</span>
        <span className="button-text">{isProcessing ? '处理中...' : '结束回合'}</span>
        <span className="button-turn">回合 {progress.turn}</span>
      </button>

      {/* 考核提醒 */}
      {progress.turnsUntilExam <= 2 && !isGameOver && (
        <div className="exam-reminder">
          <span className="reminder-icon">⚠️</span>
          <span className="reminder-text">
            {progress.turnsUntilExam === 1 
              ? '下回合将进行考核！' 
              : `距离考核还有 ${progress.turnsUntilExam} 回合`}
          </span>
        </div>
      )}
    </div>
  );
}

export default TurnControl;
