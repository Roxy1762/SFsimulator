/**
 * GameOverModal 组件单元测试
 * 
 * 测试内容:
 * - 测试游戏结束显示
 * - 测试重新开始功能
 * 
 * 需求: 1.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOverModal } from './GameOverModal';
import type { GameState } from '../types';

describe('GameOverModal 组件', () => {
  const defaultGameState: GameState = {
    resources: {
      budget: -500,
      computePoints: 3,
      computeMax: 5,
      dirtyData: 200,
      goldenData: 100,
      dataCapacity: 1000,
    },
    metrics: {
      fitScore: 45,
      entropy: 85,
      fitScoreCap: 95,
      accuracy: 40,
      speed: 50,
      creativity: 30,
      robustness: 35,
    },
    progress: {
      turn: 15,
      turnsUntilExam: 3,
      consecutiveNegativeBudget: 2,
      examsPassed: 0,
      sideJobsThisTurn: 0,
    },
    risks: {
      legalRisk: 30,
      serverMeltdown: false,
    },
    equipment: {
      gpu: { type: 'gpu', level: 1, maxLevel: 4 },
      storage: { type: 'storage', level: 1, maxLevel: 4 },
      network: { type: 'network', level: 1, maxLevel: 4 },
      cooling: { type: 'cooling', level: 1, maxLevel: 4 },
    },
    dimensions: {
      algorithm: 20,
      dataProcessing: 20,
      stability: 20,
      userExperience: 20,
    },
    difficulty: 'normal',
    reputation: 0,
    team: [],
    hiringPool: [],
    archetype: 'startup',
    gameStatus: 'gameOver',
    gameOverReason: '资金连续2回合为负数',
    version: '2.0.0',
  };

  describe('游戏结束显示', () => {
    it('应该显示游戏结束标题', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('游戏结束')).toBeDefined();
    });

    it('应该显示游戏结束原因', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('资金连续2回合为负数')).toBeDefined();
    });

    it('应该显示初始形态', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('创业公司')).toBeDefined();
    });

    it('应该显示存活回合数', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('存活回合数')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
    });

    it('应该显示最终拟合度', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('最终拟合度')).toBeDefined();
      expect(screen.getByText('45%')).toBeDefined();
    });

    it('应该显示最终熵值', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('最终熵值')).toBeDefined();
      expect(screen.getByText('85%')).toBeDefined();
    });

    it('应该显示最终资金', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('最终资金')).toBeDefined();
      expect(screen.getByText('-500')).toBeDefined();
    });

    it('应该显示拟合度上限', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('拟合度上限')).toBeDefined();
      expect(screen.getByText('95%')).toBeDefined();
    });

    it('负资金应该有特殊样式', () => {
      const onRestart = vi.fn();
      const { container } = render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      const negativeValue = container.querySelector('.stat-value.negative');
      expect(negativeValue).not.toBeNull();
    });
  });

  describe('不同形态显示', () => {
    it('应该正确显示大厂团队形态', () => {
      const bigtechState: GameState = {
        ...defaultGameState,
        archetype: 'bigtech',
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={bigtechState} onRestart={onRestart} />);
      expect(screen.getByText('大厂团队')).toBeDefined();
    });

    it('应该正确显示学术研究形态', () => {
      const academicState: GameState = {
        ...defaultGameState,
        archetype: 'academic',
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={academicState} onRestart={onRestart} />);
      expect(screen.getByText('学术研究')).toBeDefined();
    });
  });

  describe('重新开始功能', () => {
    it('点击重新开始按钮应该调用onRestart', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      
      const restartButton = screen.getByText('重新开始');
      fireEvent.click(restartButton);
      
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('点击遮罩层应该调用onRestart', () => {
      const onRestart = vi.fn();
      const { container } = render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      
      const overlay = container.querySelector('.game-over-modal-overlay');
      if (overlay) {
        fireEvent.click(overlay);
      }
      
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('点击弹窗内容不应该触发重新开始', () => {
      const onRestart = vi.fn();
      const { container } = render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      
      const modal = container.querySelector('.game-over-modal');
      if (modal) {
        fireEvent.click(modal);
      }
      
      expect(onRestart).not.toHaveBeenCalled();
    });
  });

  describe('边缘情况', () => {
    it('没有游戏结束原因时应该显示默认文本', () => {
      const stateWithoutReason: GameState = {
        ...defaultGameState,
        gameOverReason: undefined,
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={stateWithoutReason} onRestart={onRestart} />);
      expect(screen.getByText('未知原因')).toBeDefined();
    });

    it('正资金应该正常显示', () => {
      const positiveState: GameState = {
        ...defaultGameState,
        resources: {
          ...defaultGameState.resources,
          budget: 5000,
        },
      };
      const onRestart = vi.fn();
      const { container } = render(<GameOverModal gameState={positiveState} onRestart={onRestart} />);
      expect(screen.getByText('5,000')).toBeDefined();
      const negativeValue = container.querySelector('.stat-value.negative');
      expect(negativeValue).toBeNull();
    });
  });
});
