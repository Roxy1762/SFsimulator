/**
 * EventLog 组件单元测试
 * 
 * 测试内容:
 * - 测试事件日志显示
 * - 测试不同类型消息的区分
 * 
 * 需求: 8.7
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventLog } from './EventLog';
import type { LogEntry } from '../types';

// Mock the GameContext hooks
vi.mock('../context/GameContext', () => ({
  useGameState: vi.fn(),
}));

import { useGameState } from '../context/GameContext';

describe('EventLog 组件', () => {
  const createMockLogs = (): LogEntry[] => [
    {
      id: 'log_1',
      type: 'system',
      message: '游戏开始！选择了「大厂团队」形态',
      turn: 1,
      timestamp: Date.now() - 10000,
    },
    {
      id: 'log_2',
      type: 'operation',
      message: '执行了「全网爬虫」',
      turn: 1,
      timestamp: Date.now() - 8000,
    },
    {
      id: 'log_3',
      type: 'event',
      message: '事件「投资人注资」：获得天使投资',
      turn: 2,
      timestamp: Date.now() - 5000,
    },
    {
      id: 'log_4',
      type: 'exam',
      message: '考核「周五晚高峰」完成！获得收益 5000',
      turn: 7,
      timestamp: Date.now() - 1000,
    },
  ];

  describe('日志显示', () => {
    it('应该显示所有日志条目', () => {
      const mockLogs = createMockLogs();
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: mockLogs,
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('游戏开始！选择了「大厂团队」形态')).toBeDefined();
      expect(screen.getByText('执行了「全网爬虫」')).toBeDefined();
      expect(screen.getByText('事件「投资人注资」：获得天使投资')).toBeDefined();
      expect(screen.getByText('考核「周五晚高峰」完成！获得收益 5000')).toBeDefined();
    });

    it('应该显示日志数量', () => {
      const mockLogs = createMockLogs();
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: mockLogs,
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('4')).toBeDefined();
    });

    it('没有日志时应该显示空状态', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('暂无日志')).toBeDefined();
    });
  });

  describe('日志类型区分', () => {
    it('应该显示操作类型标签', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [{
          id: 'log_1',
          type: 'operation',
          message: '执行了「全网爬虫」',
          turn: 1,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('操作')).toBeDefined();
    });

    it('应该显示事件类型标签', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [{
          id: 'log_1',
          type: 'event',
          message: '事件「投资人注资」',
          turn: 1,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('事件')).toBeDefined();
    });

    it('应该显示考核类型标签', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [{
          id: 'log_1',
          type: 'exam',
          message: '考核完成',
          turn: 7,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('考核')).toBeDefined();
    });

    it('应该显示系统类型标签', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [{
          id: 'log_1',
          type: 'system',
          message: '游戏开始',
          turn: 1,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('系统')).toBeDefined();
    });

    it('应该为不同类型的日志应用不同的样式类', () => {
      const mockLogs = createMockLogs();
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: mockLogs,
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      const { container } = render(<EventLog />);
      
      expect(container.querySelector('.log-item-system')).not.toBeNull();
      expect(container.querySelector('.log-item-operation')).not.toBeNull();
      expect(container.querySelector('.log-item-event')).not.toBeNull();
      expect(container.querySelector('.log-item-exam')).not.toBeNull();
    });
  });

  describe('回合信息显示', () => {
    it('应该显示每条日志的回合数', () => {
      vi.mocked(useGameState).mockReturnValue({
        gameState: null,
        logs: [{
          id: 'log_1',
          type: 'operation',
          message: '执行了操作',
          turn: 5,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      });

      render(<EventLog />);
      
      expect(screen.getByText('回合 5')).toBeDefined();
    });
  });
});
