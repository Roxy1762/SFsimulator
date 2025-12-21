/**
 * MetricsPanel 组件单元测试
 * 
 * 测试内容:
 * - 测试正确显示状态数据
 * - 测试熵值颜色标识
 * - 测试能力维度显示
 * 
 * 需求: 8.2, 8.3, 13.4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsPanel } from './MetricsPanel';
import type { Metrics, Progress, Dimensions } from '../types';

describe('MetricsPanel 组件', () => {
  const defaultMetrics: Metrics = {
    fitScore: 50,
    entropy: 30,
    fitScoreCap: 100,
    accuracy: 40,
    speed: 50,
    creativity: 30,
    robustness: 35,
  };

  const defaultProgress: Progress = {
    turn: 5,
    turnsUntilExam: 2,
    consecutiveNegativeBudget: 0,
    examsPassed: 0,
    sideJobsThisTurn: 0,
  };

  const defaultDimensions: Dimensions = {
    algorithm: 30,
    dataProcessing: 40,
    stability: 50,
    userExperience: 25,
  };

  describe('正确显示状态数据', () => {
    it('应该显示综合拟合指数', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('50%')).toBeDefined();
      expect(screen.getByText('综合拟合')).toBeDefined();
    });

    it('应该显示熵值', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('30%')).toBeDefined();
      expect(screen.getByText('熵值')).toBeDefined();
    });

    it('应该显示当前回合数', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('当前回合')).toBeDefined();
    });

    it('应该显示距离考核回合数', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('2 回合')).toBeDefined();
      expect(screen.getByText('距离考核')).toBeDefined();
    });

    it('考核临近时应该显示警告', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('即将考核!')).toBeDefined();
    });

    it('拟合度上限低于100时应该显示上限', () => {
      const metricsWithLowCap: Metrics = {
        ...defaultMetrics,
        fitScoreCap: 90,
      };
      render(<MetricsPanel metrics={metricsWithLowCap} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('上限: 90%')).toBeDefined();
    });

    it('应该显示多维度指标', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('准确率')).toBeDefined();
      expect(screen.getByText('推理速度')).toBeDefined();
      expect(screen.getByText('创造力')).toBeDefined();
      expect(screen.getByText('鲁棒性')).toBeDefined();
    });

    it('应该显示能力维度', () => {
      render(<MetricsPanel metrics={defaultMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      expect(screen.getByText('能力维度')).toBeDefined();
      expect(screen.getByText('算法优化')).toBeDefined();
      expect(screen.getByText('数据处理')).toBeDefined();
      expect(screen.getByText('系统稳定')).toBeDefined();
      expect(screen.getByText('用户体验')).toBeDefined();
    });
  });

  describe('熵值颜色标识', () => {
    it('熵值<=40时应该显示安全状态（绿色）', () => {
      const safeMetrics: Metrics = {
        ...defaultMetrics,
        entropy: 30,
      };
      const { container } = render(<MetricsPanel metrics={safeMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      
      const entropyGauge = container.querySelector('.circular-gauge.entropy-safe');
      expect(entropyGauge).not.toBeNull();
      
      expect(screen.getByText('稳定')).toBeDefined();
      expect(screen.getByText('✅ 系统稳定，考核收益 +20%')).toBeDefined();
    });

    it('熵值在41-80时应该显示危险状态（黄色）', () => {
      const warningMetrics: Metrics = {
        ...defaultMetrics,
        entropy: 60,
      };
      const { container } = render(<MetricsPanel metrics={warningMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      
      const entropyGauge = container.querySelector('.circular-gauge.entropy-warning');
      expect(entropyGauge).not.toBeNull();
      
      expect(screen.getByText('危险区')).toBeDefined();
      expect(screen.getByText('⚠️ 危险区：考核收益 -20%')).toBeDefined();
    });

    it('熵值>80时应该显示崩溃状态（红色）', () => {
      const dangerMetrics: Metrics = {
        ...defaultMetrics,
        entropy: 90,
      };
      const { container } = render(<MetricsPanel metrics={dangerMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      
      const entropyGauge = container.querySelector('.circular-gauge.entropy-danger');
      expect(entropyGauge).not.toBeNull();
      
      expect(screen.getByText('崩溃区')).toBeDefined();
      expect(screen.getByText('🚨 崩溃区：每回合可能服务熔断！')).toBeDefined();
    });

    it('熵值正好为40时应该显示安全状态', () => {
      const boundaryMetrics: Metrics = {
        ...defaultMetrics,
        entropy: 40,
      };
      const { container } = render(<MetricsPanel metrics={boundaryMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      
      const entropyGauge = container.querySelector('.circular-gauge.entropy-safe');
      expect(entropyGauge).not.toBeNull();
    });

    it('熵值正好为80时应该显示危险状态', () => {
      const boundaryMetrics: Metrics = {
        ...defaultMetrics,
        entropy: 80,
      };
      const { container } = render(<MetricsPanel metrics={boundaryMetrics} progress={defaultProgress} dimensions={defaultDimensions} />);
      
      const entropyGauge = container.querySelector('.circular-gauge.entropy-warning');
      expect(entropyGauge).not.toBeNull();
    });
  });
});
