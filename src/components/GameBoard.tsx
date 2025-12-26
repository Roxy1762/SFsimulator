/**
 * GameBoard 组件
 * 组合所有子组件：ResourcePanel, MetricsPanel, OperationsPanel, TurnControl, EventLog
 * 实现响应式布局
 * 条件渲染考核和游戏结束弹窗
 * 
 * 需求: 8.1, 8.2, 8.3, 8.4, 8.7, 3.5, 8.6, 13.4, 18.5, 22.2, 29.8
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameState, useGameActions } from '../context/GameContext';
import { ResourcePanel } from './ResourcePanel';
import { MetricsPanel } from './MetricsPanel';
import { EquipmentPanel } from './EquipmentPanel';
import { OperationsModal } from './OperationsModal';
import { TurnControl } from './TurnControl';
import { EventLog } from './EventLog';
import { ExamModal } from './ExamModal';
import { GameOverModal } from './GameOverModal';
import { ToastContainer, useToast } from './Toast';
import { TeamPanel } from './TeamPanel';
import { SaveLoadPanel } from './SaveLoadPanel';
import { TutorialModal } from './TutorialModal';
import { MobileNav, type MobileNavPanel } from './MobileNav';
import { resetOnboarding } from './OnboardingGuide';
import { getOperationById } from '../operations';
import { calculateEffectiveDimensions } from '../engine';
import type { GameState, ExamResult, GameEvent } from '../types';
import './GameBoard.css';

interface GameBoardProps {
  onRestartOnboarding?: () => void;
}

/**
 * GameBoard 组件
 * 游戏主界面，组合所有游戏组件
 */
export function GameBoard({ onRestartOnboarding }: GameBoardProps = {}) {
  const { gameState, lastExamResult, lastEvent } = useGameState();
  const { executeOperation, resetGame, hireMember, fireMember, dispatch } = useGameActions();
  const { toasts, removeToast, success, error, warning, info } = useToast();
  
  // 控制考核弹窗显示
  const [showExamModal, setShowExamModal] = useState(false);
  
  // 控制教程弹窗显示 - 需求 28.1
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  
  // 移动端导航栏当前激活面板 - 需求 7.3
  const [activeMobilePanel, setActiveMobilePanel] = useState<MobileNavPanel>('operations');
  
  // 追踪上一次的游戏状态用于比较变化
  const prevGameStateRef = useRef<GameState | null>(null);
  
  // 追踪已处理的考核结果，防止重复弹窗
  const processedExamRef = useRef<ExamResult | null>(null);
  
  // 追踪已处理的事件，防止重复 Toast
  const processedEventRef = useRef<GameEvent | null>(null);
  
  // 当有新的考核结果时显示弹窗和 Toast
  useEffect(() => {
    if (lastExamResult && lastExamResult !== processedExamRef.current) {
      processedExamRef.current = lastExamResult;
      setShowExamModal(true);
      if (lastExamResult.finalReward > 0) {
        success(`考核通过！获得 ${lastExamResult.finalReward} 资金`, 4000);
      } else {
        warning('考核收益为 0，请提升拟合度和稳定性', 4000);
      }
    }
  }, [lastExamResult, success, warning]);

  // 当有新事件时显示 Toast
  useEffect(() => {
    if (lastEvent && lastEvent !== processedEventRef.current) {
      processedEventRef.current = lastEvent;
      if (lastEvent.type === 'positive') {
        success(`${lastEvent.name}：${lastEvent.description}`, 4000);
      } else if (lastEvent.type === 'negative') {
        error(`${lastEvent.name}：${lastEvent.description}`, 4000);
      } else {
        info(`${lastEvent.name}：${lastEvent.description}`, 4000);
      }
    }
  }, [lastEvent, success, error, info]);

  // 检测服务熔断状态变化
  useEffect(() => {
    if (gameState && prevGameStateRef.current) {
      const prevMeltdown = prevGameStateRef.current.risks.serverMeltdown;
      const currMeltdown = gameState.risks.serverMeltdown;
      
      if (!prevMeltdown && currMeltdown) {
        error('🔥 服务熔断！本回合无法执行操作', 5000);
      }
    }
    prevGameStateRef.current = gameState;
  }, [gameState, error]);

  if (!gameState) {
    return null;
  }

  const isGameOver = gameState.gameStatus === 'gameOver';
  const isVictory = gameState.gameStatus === 'victory';
  const isGameEnded = isGameOver || isVictory;
  const isMeltdown = gameState.risks.serverMeltdown;
  
  // 计算有效维度值（包含团队加成）- 需求 13.4
  const effectiveDimensions = useMemo(() => {
    return calculateEffectiveDimensions(gameState);
  }, [gameState]);

  /**
   * 处理操作执行
   */
  const handleExecuteOperation = (operationId: string) => {
    if (isGameEnded) {
      error('游戏已结束，无法执行操作');
      return;
    }
    
    if (isMeltdown) {
      warning('服务熔断中，本回合无法执行操作');
      return;
    }

    const operation = getOperationById(operationId);
    if (!operation) {
      error('操作不存在');
      return;
    }

    // 检查资源是否足够
    if (!operation.canExecute(gameState)) {
      error(`资源不足，无法执行「${operation.name}」`);
      return;
    }

    // 执行操作
    executeOperation(operationId);
    
    // 显示成功反馈
    if (operation.effects.isGamble) {
      info(`执行「${operation.name}」- 等待结果...`, 2000);
    } else {
      success(`成功执行「${operation.name}」`, 2000);
    }
  };

  /**
   * 关闭考核弹窗
   */
  const handleCloseExamModal = () => {
    setShowExamModal(false);
  };

  /**
   * 处理重新开始游戏
   */
  const handleRestart = () => {
    resetGame();
  };

  /**
   * 处理雇佣团队成员 - 需求 18.3
   */
  const handleHireMember = useCallback((memberId: string) => {
    if (isGameEnded) {
      error('游戏已结束，无法雇佣成员');
      return;
    }
    
    const member = gameState?.hiringPool.find(m => m.id === memberId);
    if (member && gameState && gameState.resources.budget < member.hiringCost) {
      error(`资金不足，无法雇佣「${member.name}」`);
      return;
    }
    
    hireMember(memberId);
    if (member) {
      success(`成功雇佣「${member.name}」`, 2000);
    }
  }, [gameState, isGameEnded, hireMember, error, success]);

  /**
   * 处理解雇团队成员 - 需求 18.6
   */
  const handleFireMember = useCallback((memberId: string) => {
    if (isGameEnded) {
      error('游戏已结束，无法解雇成员');
      return;
    }
    
    const member = gameState?.team.find(m => m.id === memberId);
    fireMember(memberId);
    if (member) {
      const refund = Math.floor(member.hiringCost * 0.3);
      info(`已解雇「${member.name}」，返还 ${refund} 资金`, 2000);
    }
  }, [gameState, isGameEnded, fireMember, error, info]);

  /**
   * 处理导入存档 - 需求 22.4
   */
  const handleImportSave = useCallback((state: GameState) => {
    // 通过 dispatch 加载游戏状态
    dispatch({ type: 'LOAD_GAME', state });
    success('存档导入成功！', 2000);
  }, [dispatch, success]);

  return (
    <div className={`game-board ${isMeltdown ? 'meltdown-active' : ''}`}>
      {/* Toast 通知 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* 游戏标题 - 需求 12.4: ARIA 地标区域 */}
      <header className="game-header" role="banner" aria-label="游戏标题">
        <h1 className="game-title">
          <span className="title-icon" aria-hidden="true">🤖</span>
          黑箱：算法飞升
        </h1>
        <p className="game-subtitle">训练终极推荐算法，统治人类注意力</p>
        <div className="header-buttons" role="navigation" aria-label="辅助功能">
          {/* 重新引导按钮 - 需求 29.8 */}
          {onRestartOnboarding && (
            <button 
              className="guide-button"
              onClick={() => {
                resetOnboarding();
                onRestartOnboarding();
              }}
              aria-label="重新启动新手引导"
              title="新手引导"
            >
              <span className="guide-icon" aria-hidden="true">🎓</span>
              <span className="guide-text">引导</span>
            </button>
          )}
          {/* 帮助按钮 - 需求 28.1, 28.5 */}
          <button 
            className="help-button"
            onClick={() => setShowTutorialModal(true)}
            aria-label="打开游戏教程"
            title="游戏教程"
          >
            <span className="help-icon" aria-hidden="true">❓</span>
            <span className="help-text">帮助</span>
          </button>
        </div>
      </header>

      {/* 主游戏区域 - 需求 12.4: ARIA 地标区域 */}
      <main className="game-main" role="main" aria-label="游戏主区域">
        {/* 左侧面板：资源和指标 - 需求 12.3, 12.4: 键盘导航和 ARIA 地标 */}
        <aside 
          className="game-sidebar left-sidebar" 
          role="complementary" 
          aria-label="资源和指标面板"
          tabIndex={0}
        >
          <ResourcePanel resources={gameState.resources} />
          <MetricsPanel 
            metrics={gameState.metrics} 
            progress={gameState.progress}
            dimensions={gameState.dimensions}
            effectiveDimensions={effectiveDimensions}
            reputation={gameState.reputation}
          />
          <EquipmentPanel />
        </aside>

        {/* 中间区域：操作面板和回合控制 - 需求 12.3: 键盘导航 */}
        <section 
          className="game-center" 
          aria-label="操作控制区域"
          tabIndex={0}
        >
          <TurnControl />
          <OperationsModal
            gameState={gameState}
            onExecuteOperation={handleExecuteOperation}
            disabled={isGameEnded || isMeltdown}
          />
        </section>

        {/* 右侧面板：团队、存档和日志 - 需求 12.3, 12.4: 键盘导航和 ARIA 地标 */}
        <aside 
          className="game-sidebar right-sidebar" 
          role="complementary" 
          aria-label="团队和日志面板"
          tabIndex={0}
        >
          {/* 团队管理面板 - 需求 18.5 */}
          <TeamPanel
            team={gameState.team}
            hiringPool={gameState.hiringPool}
            currentBudget={gameState.resources.budget}
            onHire={handleHireMember}
            onFire={handleFireMember}
            disabled={isGameEnded}
            turnsUntilExam={gameState.progress.turnsUntilExam}
          />
          {/* 存档管理面板 - 需求 22.2 */}
          <SaveLoadPanel
            gameState={gameState}
            onImport={handleImportSave}
            disabled={false}
          />
          <EventLog />
        </aside>
      </main>

      {/* 考核结果弹窗 */}
      {showExamModal && lastExamResult && (
        <ExamModal 
          result={lastExamResult} 
          onClose={handleCloseExamModal} 
        />
      )}

      {/* 游戏结束弹窗 */}
      {isGameEnded && (
        <GameOverModal 
          gameState={gameState} 
          onRestart={handleRestart} 
        />
      )}

      {/* 教程弹窗 - 需求 28.1, 28.5 */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
      />

      {/* 移动端底部导航栏 - 需求 7.3 */}
      <MobileNav
        activePanel={activeMobilePanel}
        onPanelChange={setActiveMobilePanel}
      />
    </div>
  );
}

export default GameBoard;
