/**
 * GameOverModal 组件单元测试
 * 
 * 测试内容:
 * - 测试游戏结束显示
 * - 测试胜利结局显示
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
      expect(screen.getByText('存活回合')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
    });

    it('应该显示拟合度', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('拟合度')).toBeDefined();
      expect(screen.getByText('45%')).toBeDefined();
    });

    it('应该显示熵值', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('熵值')).toBeDefined();
      expect(screen.getByText('85%')).toBeDefined();
    });

    it('应该显示最终资金', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('最终资金')).toBeDefined();
      expect(screen.getByText('-500')).toBeDefined();
    });

    it('应该显示声望', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('声望')).toBeDefined();
    });

    it('负资金应该有特殊样式', () => {
      const onRestart = vi.fn();
      const { container } = render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      const negativeValue = container.querySelector('.stat-value.negative');
      expect(negativeValue).not.toBeNull();
    });

    it('应该显示评分和评级', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('最终得分')).toBeDefined();
    });

    it('应该显示能力维度', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={defaultGameState} onRestart={onRestart} />);
      expect(screen.getByText('能力维度')).toBeDefined();
      expect(screen.getByText('🧠 算法')).toBeDefined();
      expect(screen.getByText('📊 数据')).toBeDefined();
      expect(screen.getByText('🔧 稳定')).toBeDefined();
      expect(screen.getByText('👤 体验')).toBeDefined();
    });
  });

  describe('胜利结局显示', () => {
    const victoryState: GameState = {
      ...defaultGameState,
      gameStatus: 'victory',
      gameOverReason: '算法达到飞升境界，突破极限！',
      endingType: 'ascension',
      metrics: {
        ...defaultGameState.metrics,
        fitScore: 95,
        accuracy: 90,
        speed: 85,
        creativity: 80,
        robustness: 85,
      },
      dimensions: {
        algorithm: 85,
        dataProcessing: 82,
        stability: 80,
        userExperience: 81,
      },
      resources: {
        ...defaultGameState.resources,
        budget: 50000,
      },
    };

    it('应该显示胜利结局标题', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={victoryState} onRestart={onRestart} />);
      // 使用 getAllByText 因为标题会出现在多个地方
      const elements = screen.getAllByText('算法飞升');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('应该显示胜利结局副标题', () => {
      const onRestart = vi.fn();
      render(<GameOverModal gameState={victoryState} onRestart={onRestart} />);
      expect(screen.getByText('突破极限')).toBeDefined();
    });

    it('胜利结局应该有victory样式类', () => {
      const onRestart = vi.fn();
      const { container } = render(<GameOverModal gameState={victoryState} onRestart={onRestart} />);
      const modal = container.querySelector('.game-over-modal.victory');
      expect(modal).not.toBeNull();
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

  describe('不同结局类型', () => {
    it('应该显示破产结局', () => {
      const bankruptcyState: GameState = {
        ...defaultGameState,
        endingType: 'bankruptcy',
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={bankruptcyState} onRestart={onRestart} />);
      expect(screen.getByText('破产清算')).toBeDefined();
    });

    it('应该显示熵值崩溃结局', () => {
      const entropyState: GameState = {
        ...defaultGameState,
        endingType: 'entropy_collapse',
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={entropyState} onRestart={onRestart} />);
      expect(screen.getByText('系统崩溃')).toBeDefined();
    });

    it('应该显示法律制裁结局', () => {
      const legalState: GameState = {
        ...defaultGameState,
        endingType: 'legal_shutdown',
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={legalState} onRestart={onRestart} />);
      expect(screen.getByText('法律制裁')).toBeDefined();
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

    it('有团队成员时应该显示团队统计', () => {
      const stateWithTeam: GameState = {
        ...defaultGameState,
        team: [
          {
            id: '1',
            name: '张三',
            rarity: 'rare',
            baseStats: { computeContribution: 10, dataEfficiency: 10, maintenanceSkill: 10 },
            traits: ['algorithm_expert'],
            level: 3,
            experience: 200,
            hiringCost: 1200,
            salary: 350,
          },
        ],
      };
      const onRestart = vi.fn();
      render(<GameOverModal gameState={stateWithTeam} onRestart={onRestart} />);
      expect(screen.getByText(/团队成员/)).toBeDefined();
      expect(screen.getByText(/张三/)).toBeDefined();
    });
  });
});
