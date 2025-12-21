/**
 * TurnControl 组件单元测试
 * 
 * 测试内容:
 * - 测试结束回合按钮功能
 * - 测试回合状态显示（正常/服务熔断）
 * 
 * 需求: 7.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TurnControl } from './TurnControl';
import type { GameState } from '../types';

// Mock the GameContext hooks
const mockEndTurn = vi.fn();
const mockStartTurn = vi.fn();
const mockTriggerExam = vi.fn();
const mockTriggerEvent = vi.fn();
const mockCheckGameOver = vi.fn();

vi.mock('../context/GameContext', () => ({
  useGameState: vi.fn(),
  useGameActions: () => ({
    endTurn: mockEndTurn,
    startTurn: mockStartTurn,
    triggerExam: mockTriggerExam,
    triggerEvent: mockTriggerEvent,
    checkGameOver: mockCheckGameOver,
  }),
}));

import { useGameState } from '../context/GameContext';

describe('TurnControl 组件', () => {
  const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
    resources: {
      budget: 5000,
      computePoints: 3,
      computeMax: 5,
      dirtyData: 500,
      goldenData: 200,
      dataCapacity: 1000,
    },
    metrics: {
      fitScore: 50,
      entropy: 30,
      fitScoreCap: 100,
      accuracy: 40,
      speed: 50,
      creativity: 30,
      robustness: 35,
    },
    progress: {
      turn: 3,
      turnsUntilExam: 4,
      consecutiveNegativeBudget: 0,
      examsPassed: 0,
      sideJobsThisTurn: 0,
    },
    risks: {
      legalRisk: 0,
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
    archetype: 'bigtech',
    gameStatus: 'playing',
    version: '2.0.0',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常状态显示', () => {
    it('应该显示系统正常状态', () => {
      const mockState = createMockGameState();
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      expect(screen.getByText('系统正常')).toBeDefined();
      expect(screen.getByText('可以执行操作')).toBeDefined();
    });

    it('应该显示结束回合按钮', () => {
      const mockState = createMockGameState();
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      expect(screen.getByText('结束回合')).toBeDefined();
      expect(screen.getByText('回合 3')).toBeDefined();
    });
  });

  describe('服务熔断状态显示', () => {
    it('应该显示服务熔断状态', () => {
      const mockState = createMockGameState({
        risks: {
          legalRisk: 0,
          serverMeltdown: true,
        },
      });
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      expect(screen.getByText('服务熔断中')).toBeDefined();
      expect(screen.getByText('本回合无法执行操作')).toBeDefined();
    });
  });

  describe('结束回合按钮功能', () => {
    it('点击结束回合按钮应该调用 endTurn', async () => {
      const mockState = createMockGameState();
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      const button = screen.getByText('结束回合').closest('button');
      expect(button).not.toBeNull();
      
      fireEvent.click(button!);
      
      // endTurn 应该立即被调用
      expect(mockEndTurn).toHaveBeenCalledTimes(1);
    });

    it('游戏结束时按钮应该被禁用', () => {
      const mockState = createMockGameState({
        gameStatus: 'gameOver',
      });
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      const button = screen.getByText('结束回合').closest('button');
      expect(button).not.toBeNull();
      expect(button!.hasAttribute('disabled')).toBe(true);
    });

    it('游戏结束时点击按钮不应该触发任何操作', () => {
      const mockState = createMockGameState({
        gameStatus: 'gameOver',
      });
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      const button = screen.getByText('结束回合').closest('button');
      fireEvent.click(button!);
      
      expect(mockEndTurn).not.toHaveBeenCalled();
    });
  });

  describe('考核提醒', () => {
    it('距离考核2回合时应该显示提醒', () => {
      const mockState = createMockGameState({
        progress: {
          turn: 5,
          turnsUntilExam: 2,
          consecutiveNegativeBudget: 0,
          examsPassed: 0,
          sideJobsThisTurn: 0,
        },
      });
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      expect(screen.getByText('距离考核还有 2 回合')).toBeDefined();
    });

    it('距离考核1回合时应该显示即将考核提醒', () => {
      const mockState = createMockGameState({
        progress: {
          turn: 6,
          turnsUntilExam: 1,
          consecutiveNegativeBudget: 0,
          examsPassed: 0,
          sideJobsThisTurn: 0,
        },
      });
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      expect(screen.getByText('下回合将进行考核！')).toBeDefined();
    });

    it('距离考核超过2回合时不应该显示提醒', () => {
      const mockState = createMockGameState({
        progress: {
          turn: 1,
          turnsUntilExam: 6,
          consecutiveNegativeBudget: 0,
          examsPassed: 0,
          sideJobsThisTurn: 0,
        },
      });
      vi.mocked(useGameState).mockReturnValue({
        gameState: mockState,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<TurnControl />);
      
      expect(screen.queryByText(/距离考核/)).toBeNull();
      expect(screen.queryByText(/下回合将进行考核/)).toBeNull();
    });
  });

  describe('无游戏状态', () => {
    it('没有游戏状态时不应该渲染任何内容', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: false,
        lastSaveString: null,
        lastImportError: null,
      });

      const { container } = render(<TurnControl />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});
