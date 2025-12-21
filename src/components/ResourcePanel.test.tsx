/**
 * ResourcePanel 组件单元测试
 * 
 * 测试内容:
 * - 测试正确显示状态数据
 * 
 * 需求: 8.1
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcePanel } from './ResourcePanel';
import type { Resources } from '../types';

describe('ResourcePanel 组件', () => {
  const defaultResources: Resources = {
    budget: 750,
    computePoints: 3,
    computeMax: 5,
    dirtyData: 400,
    goldenData: 200,
    dataCapacity: 1000,
  };

  describe('正确显示状态数据', () => {
    it('应该显示资金数值', () => {
      render(<ResourcePanel resources={defaultResources} />);
      expect(screen.getByText('750')).toBeDefined();
    });

    it('应该显示算力数值', () => {
      render(<ResourcePanel resources={defaultResources} />);
      expect(screen.getByText('3 / 5')).toBeDefined();
    });

    it('应该显示脏数据数值', () => {
      render(<ResourcePanel resources={defaultResources} />);
      expect(screen.getByText('400')).toBeDefined();
    });

    it('应该显示黄金数据数值', () => {
      render(<ResourcePanel resources={defaultResources} />);
      expect(screen.getByText('200')).toBeDefined();
    });

    it('应该显示资源标签', () => {
      render(<ResourcePanel resources={defaultResources} />);
      expect(screen.getByText('资金')).toBeDefined();
      expect(screen.getByText('算力')).toBeDefined();
      expect(screen.getByText('脏数据')).toBeDefined();
      expect(screen.getByText('黄金数据')).toBeDefined();
    });

    it('负资金应该有negative样式类', () => {
      const negativeResources: Resources = {
        ...defaultResources,
        budget: -100,
        dataCapacity: 1000,
      };
      const { container } = render(<ResourcePanel resources={negativeResources} />);
      const budgetItem = container.querySelector('.resource-item.budget.negative');
      expect(budgetItem).not.toBeNull();
    });

    it('应该格式化大数字为K', () => {
      const largeResources: Resources = {
        ...defaultResources,
        budget: 5000,
        dirtyData: 100,
        goldenData: 50,
        dataCapacity: 1000,
      };
      render(<ResourcePanel resources={largeResources} />);
      expect(screen.getByText('5.0K')).toBeDefined();
    });
  });
});
