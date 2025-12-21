/**
 * ExamModal 组件单元测试
 * 
 * 测试内容:
 * - 测试考核结果显示
 * - 测试重点考核维度显示
 * - 测试维度加成显示
 * - 测试难度等级显示
 * - 测试关闭弹窗功能
 * 
 * 需求: 6.2, 16.2, 17.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamModal } from './ExamModal';
import type { ExamResult } from '../types';

describe('ExamModal 组件', () => {
  const defaultResult: ExamResult = {
    scenario: '周五晚高峰',
    baseTraffic: 10000,
    fitScoreMultiplier: 0.75,
    stabilityCoefficient: 1.2,
    dimensionBonus: 1.5,
    focusDimensions: ['algorithm', 'stability'],
    difficultyLevel: 1,
    finalReward: 9000,
    passed: true,
    meetsThreshold: true,
  };

  describe('考核结果显示', () => {
    it('应该显示考核场景名称', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('周五晚高峰')).toBeDefined();
    });

    it('应该显示基础流量', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('10,000')).toBeDefined();
    });

    it('应该显示拟合指数', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('× 75%')).toBeDefined();
    });

    it('应该显示稳定性系数', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('稳定性系数')).toBeDefined();
      expect(screen.getByText(/系统稳定 \(\+20%\)/)).toBeDefined();
    });

    it('应该显示最终收益', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('+9,000')).toBeDefined();
    });

    it('通过考核时应该显示成功样式', () => {
      const onClose = vi.fn();
      const { container } = render(<ExamModal result={defaultResult} onClose={onClose} />);
      const resultDiv = container.querySelector('.exam-result.result-passed');
      expect(resultDiv).not.toBeNull();
    });

    it('未通过考核时应该显示失败样式和警告', () => {
      const failedResult: ExamResult = {
        ...defaultResult,
        stabilityCoefficient: 0,
        finalReward: 0,
        passed: false,
      };
      const onClose = vi.fn();
      const { container } = render(<ExamModal result={failedResult} onClose={onClose} />);
      
      const resultDiv = container.querySelector('.exam-result.result-failed');
      expect(resultDiv).not.toBeNull();
      expect(screen.getByText(/本次考核收益为零/)).toBeDefined();
    });
  });

  describe('重点考核维度显示 - 需求 16.2', () => {
    it('应该显示重点考核维度标签', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('重点考核维度')).toBeDefined();
    });

    it('应该显示算法优化维度', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText(/算法优化/)).toBeDefined();
    });

    it('应该显示系统稳定维度', () => {
      const onClose = vi.fn();
      const { container } = render(<ExamModal result={defaultResult} onClose={onClose} />);
      const stabilityTag = container.querySelector('.focus-dimension-tag.stability');
      expect(stabilityTag).not.toBeNull();
      expect(stabilityTag?.textContent).toContain('系统稳定');
    });

    it('单维度考核时只显示一个维度', () => {
      const singleDimResult: ExamResult = {
        ...defaultResult,
        focusDimensions: ['dataProcessing'],
      };
      const onClose = vi.fn();
      render(<ExamModal result={singleDimResult} onClose={onClose} />);
      expect(screen.getByText(/数据处理/)).toBeDefined();
    });
  });

  describe('维度加成显示 - 需求 16.4, 16.5, 16.6, 16.7', () => {
    it('应该显示维度加成标签', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('维度加成')).toBeDefined();
    });

    it('维度加成为1.5时应该显示优秀', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText(/优秀 \(\+50%\)/)).toBeDefined();
    });

    it('维度加成为1.0时应该显示合格', () => {
      const midResult: ExamResult = {
        ...defaultResult,
        dimensionBonus: 1.0,
      };
      const onClose = vi.fn();
      render(<ExamModal result={midResult} onClose={onClose} />);
      expect(screen.getByText(/合格 \(±0%\)/)).toBeDefined();
    });

    it('维度加成为0.6时应该显示不足', () => {
      const lowResult: ExamResult = {
        ...defaultResult,
        dimensionBonus: 0.6,
      };
      const onClose = vi.fn();
      render(<ExamModal result={lowResult} onClose={onClose} />);
      expect(screen.getByText(/不足 \(-40%\)/)).toBeDefined();
    });
  });

  describe('难度等级显示 - 需求 17.6', () => {
    it('应该显示难度等级', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText('难度 Lv.1')).toBeDefined();
    });

    it('应该显示更高的难度等级', () => {
      const highDifficultyResult: ExamResult = {
        ...defaultResult,
        difficultyLevel: 5,
      };
      const onClose = vi.fn();
      render(<ExamModal result={highDifficultyResult} onClose={onClose} />);
      expect(screen.getByText('难度 Lv.5')).toBeDefined();
    });
  });

  describe('稳定性系数显示', () => {
    it('稳定性系数为1.2时应该显示系统稳定', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      expect(screen.getByText(/系统稳定 \(\+20%\)/)).toBeDefined();
    });

    it('稳定性系数为0.8时应该显示危险区', () => {
      const warningResult: ExamResult = {
        ...defaultResult,
        stabilityCoefficient: 0.8,
      };
      const onClose = vi.fn();
      render(<ExamModal result={warningResult} onClose={onClose} />);
      expect(screen.getByText(/危险区 \(-20%\)/)).toBeDefined();
    });

    it('稳定性系数为0.5时应该显示崩溃区', () => {
      const dangerResult: ExamResult = {
        ...defaultResult,
        stabilityCoefficient: 0.5,
      };
      const onClose = vi.fn();
      render(<ExamModal result={dangerResult} onClose={onClose} />);
      expect(screen.getByText(/崩溃区 \(-50%\)/)).toBeDefined();
    });

    it('稳定性系数为0时应该显示服务熔断', () => {
      const meltdownResult: ExamResult = {
        ...defaultResult,
        stabilityCoefficient: 0,
        finalReward: 0,
        passed: false,
      };
      const onClose = vi.fn();
      render(<ExamModal result={meltdownResult} onClose={onClose} />);
      expect(screen.getByText(/服务熔断/)).toBeDefined();
    });
  });

  describe('关闭弹窗功能', () => {
    it('点击继续按钮应该调用onClose', () => {
      const onClose = vi.fn();
      render(<ExamModal result={defaultResult} onClose={onClose} />);
      
      const continueButton = screen.getByText('继续');
      fireEvent.click(continueButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('点击遮罩层应该调用onClose', () => {
      const onClose = vi.fn();
      const { container } = render(<ExamModal result={defaultResult} onClose={onClose} />);
      
      const overlay = container.querySelector('.exam-modal-overlay');
      if (overlay) {
        fireEvent.click(overlay);
      }
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('点击弹窗内容不应该关闭弹窗', () => {
      const onClose = vi.fn();
      const { container } = render(<ExamModal result={defaultResult} onClose={onClose} />);
      
      const modal = container.querySelector('.exam-modal');
      if (modal) {
        fireEvent.click(modal);
      }
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
