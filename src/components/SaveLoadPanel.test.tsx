/**
 * SaveLoadPanel 组件单元测试
 * 
 * 测试内容:
 * - 测试导出功能
 * - 测试导入功能
 * - 测试错误处理
 * 
 * 需求: 22.2, 22.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveLoadPanel } from './SaveLoadPanel';
import { SaveSystem } from '../utils/SaveSystem';
import type { GameState } from '../types';

// Mock SaveSystem
vi.mock('../utils/SaveSystem', () => ({
  SaveSystem: {
    exportSave: vi.fn(),
    importSave: vi.fn(),
    copyToClipboard: vi.fn(),
    readFromClipboard: vi.fn(),
  },
}));

// 创建模拟的游戏状态
const createMockGameState = (): GameState => ({
  resources: {
    budget: 5000,
    computePoints: 3,
    computeMax: 5,
    dirtyData: 100,
    goldenData: 50,
    dataCapacity: 1000,
  },
  metrics: {
    fitScore: 50,
    entropy: 20,
    fitScoreCap: 100,
    accuracy: 50,
    speed: 50,
    creativity: 50,
    robustness: 50,
  },
  dimensions: {
    algorithm: 30,
    dataProcessing: 30,
    stability: 30,
    userExperience: 30,
  },
  progress: {
    turn: 5,
    turnsUntilExam: 2,
    consecutiveNegativeBudget: 0,
    examsPassed: 0,
    sideJobsThisTurn: 0,
  },
  risks: {
    legalRisk: 10,
    serverMeltdown: false,
  },
  equipment: {
    gpu: { type: 'gpu', level: 1, maxLevel: 4 },
    storage: { type: 'storage', level: 1, maxLevel: 4 },
    network: { type: 'network', level: 1, maxLevel: 4 },
    cooling: { type: 'cooling', level: 1, maxLevel: 4 },
  },
  archetype: 'startup',
  difficulty: 'normal',
  reputation: 20,
  team: [],
  hiringPool: [],
  gameStatus: 'playing',
});

describe('SaveLoadPanel 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本渲染', () => {
    it('应该显示面板标题', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );
      expect(screen.getByText('存档管理')).toBeDefined();
    });

    it('应该显示导出按钮', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );
      expect(screen.getByText('导出存档')).toBeDefined();
    });

    it('应该显示导入按钮', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );
      expect(screen.getByText('导入存档')).toBeDefined();
    });
  });

  describe('导出功能', () => {
    it('无游戏状态时导出按钮应该禁用', () => {
      render(
        <SaveLoadPanel 
          gameState={null} 
          onImport={vi.fn()} 
        />
      );
      const exportBtn = screen.getByText('导出存档').closest('button');
      expect(exportBtn?.disabled).toBe(true);
    });

    it('disabled 为 true 时导出按钮应该禁用', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
          disabled={true}
        />
      );
      const exportBtn = screen.getByText('导出存档').closest('button');
      expect(exportBtn?.disabled).toBe(true);
    });

    it('点击导出按钮应该调用 SaveSystem.exportSave', async () => {
      const mockExport = 'base64encodedstring';
      vi.mocked(SaveSystem.exportSave).mockReturnValue(mockExport);
      vi.mocked(SaveSystem.copyToClipboard).mockResolvedValue(true);

      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      fireEvent.click(screen.getByText('导出存档'));

      await waitFor(() => {
        expect(SaveSystem.exportSave).toHaveBeenCalled();
      });
    });

    it('导出成功应该显示成功消息', async () => {
      vi.mocked(SaveSystem.exportSave).mockReturnValue('base64string');
      vi.mocked(SaveSystem.copyToClipboard).mockResolvedValue(true);

      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      fireEvent.click(screen.getByText('导出存档'));

      await waitFor(() => {
        expect(screen.getByText('存档已复制到剪贴板！')).toBeDefined();
      });
    });

    it('导出失败应该显示错误消息', async () => {
      vi.mocked(SaveSystem.exportSave).mockReturnValue(null);

      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      fireEvent.click(screen.getByText('导出存档'));

      await waitFor(() => {
        expect(screen.getByText('导出失败：无法序列化游戏状态')).toBeDefined();
      });
    });
  });

  describe('导入功能', () => {
    it('点击导入按钮应该打开导入弹窗', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      fireEvent.click(screen.getByText('导入存档'));

      expect(screen.getByText('请粘贴存档字符串到下方输入框：')).toBeDefined();
    });

    it('导入弹窗应该有取消按钮', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      fireEvent.click(screen.getByText('导入存档'));

      expect(screen.getByText('取消')).toBeDefined();
    });

    it('点击取消应该关闭弹窗', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      fireEvent.click(screen.getByText('导入存档'));
      fireEvent.click(screen.getByText('取消'));

      expect(screen.queryByText('请粘贴存档字符串到下方输入框：')).toBeNull();
    });

    it('导入成功应该调用 onImport', async () => {
      const mockState = createMockGameState();
      vi.mocked(SaveSystem.importSave).mockReturnValue({
        success: true,
        state: mockState,
      });

      const onImport = vi.fn();
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={onImport} 
        />
      );

      // 打开导入弹窗
      fireEvent.click(screen.getByText('导入存档'));

      // 输入存档字符串
      const textarea = screen.getByPlaceholderText('在此粘贴存档字符串...');
      fireEvent.change(textarea, { target: { value: 'validbase64string' } });

      // 点击确认导入
      fireEvent.click(screen.getByText('确认导入'));

      await waitFor(() => {
        expect(onImport).toHaveBeenCalledWith(mockState);
      });
    });

    it('导入失败应该显示错误消息', async () => {
      vi.mocked(SaveSystem.importSave).mockReturnValue({
        success: false,
        error: '无效的存档格式',
      });

      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      // 打开导入弹窗
      fireEvent.click(screen.getByText('导入存档'));

      // 输入存档字符串
      const textarea = screen.getByPlaceholderText('在此粘贴存档字符串...');
      fireEvent.change(textarea, { target: { value: 'invalidstring' } });

      // 点击确认导入
      fireEvent.click(screen.getByText('确认导入'));

      await waitFor(() => {
        expect(screen.getByText('无效的存档格式')).toBeDefined();
      });
    });

    it('空输入应该显示错误消息', async () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      // 打开导入弹窗
      fireEvent.click(screen.getByText('导入存档'));

      // 不输入任何内容，直接点击确认
      // 确认按钮应该是禁用的
      const confirmBtn = screen.getByText('确认导入').closest('button');
      expect(confirmBtn?.disabled).toBe(true);
    });
  });

  describe('从剪贴板粘贴', () => {
    it('点击粘贴按钮应该调用 readFromClipboard', async () => {
      vi.mocked(SaveSystem.readFromClipboard).mockResolvedValue('clipboardcontent');

      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      // 打开导入弹窗
      fireEvent.click(screen.getByText('导入存档'));

      // 点击粘贴按钮
      fireEvent.click(screen.getByText('📋 从剪贴板粘贴'));

      await waitFor(() => {
        expect(SaveSystem.readFromClipboard).toHaveBeenCalled();
      });
    });

    it('粘贴成功应该填充输入框', async () => {
      vi.mocked(SaveSystem.readFromClipboard).mockResolvedValue('clipboardcontent');

      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
        />
      );

      // 打开导入弹窗
      fireEvent.click(screen.getByText('导入存档'));

      // 点击粘贴按钮
      fireEvent.click(screen.getByText('📋 从剪贴板粘贴'));

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('在此粘贴存档字符串...') as HTMLTextAreaElement;
        expect(textarea.value).toBe('clipboardcontent');
      });
    });
  });

  describe('禁用状态', () => {
    it('disabled 为 true 时导入按钮应该禁用', () => {
      render(
        <SaveLoadPanel 
          gameState={createMockGameState()} 
          onImport={vi.fn()} 
          disabled={true}
        />
      );
      const importBtn = screen.getByText('导入存档').closest('button');
      expect(importBtn?.disabled).toBe(true);
    });
  });
});
