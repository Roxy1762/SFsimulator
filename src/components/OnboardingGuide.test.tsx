/**
 * OnboardingGuide 组件单元测试
 * 
 * 测试内容:
 * - 测试组件渲染
 * - 测试步骤推进功能
 * - 测试本地存储功能
 * 
 * 需求: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  OnboardingGuide, 
  hasCompletedOnboarding, 
  markOnboardingCompleted, 
  resetOnboarding,
  ONBOARDING_STEPS 
} from './OnboardingGuide';

// Mock ResizeObserver for test environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('OnboardingGuide 组件单元测试', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock ResizeObserver
    (window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    // 模拟目标元素
    document.body.innerHTML = `
      <div class="resource-panel" style="position: fixed; top: 100px; left: 100px; width: 200px; height: 100px;"></div>
      <div class="operations-modal-trigger" style="position: fixed; top: 250px; left: 100px; width: 200px; height: 50px;"></div>
      <div class="metrics-panel" style="position: fixed; top: 100px; left: 350px; width: 200px; height: 150px;"></div>
      <div class="turn-control" style="position: fixed; top: 300px; left: 350px; width: 200px; height: 50px;"></div>
      <div class="exam-preview" style="position: fixed; top: 400px; left: 350px; width: 200px; height: 50px;"></div>
      <div class="team-panel" style="position: fixed; top: 100px; left: 600px; width: 200px; height: 200px;"></div>
    `;
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  describe('组件渲染', () => {
    it('当 isActive 为 false 时不应该渲染任何内容', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      const { container } = render(
        <OnboardingGuide isActive={false} onComplete={onComplete} onSkip={onSkip} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('当 isActive 为 true 时应该渲染引导界面', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      // 应该显示第一步的标题
      expect(screen.getByText('资源面板')).toBeDefined();
    });

    it('应该显示步骤指示器', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      // 应该显示 "1 / 6"
      expect(screen.getByText(/1\s*\/\s*6/)).toBeDefined();
    });

    it('应该渲染跳过引导按钮', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      expect(screen.getByText('跳过引导')).toBeDefined();
    });

    it('应该渲染下一步按钮', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      expect(screen.getByText('下一步')).toBeDefined();
    });

    it('第一步不应该显示上一步按钮', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      expect(screen.queryByText('上一步')).toBeNull();
    });
  });

  describe('步骤推进功能', () => {
    it('点击下一步应该推进到下一个步骤', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      // 初始在第一步
      expect(screen.getByText('资源面板')).toBeDefined();
      
      // 点击下一步
      const nextButton = screen.getByText('下一步');
      fireEvent.click(nextButton);
      
      // 验证切换到第二步
      expect(screen.getByText('操作面板')).toBeDefined();
    });

    it('点击上一步应该回到上一个步骤', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      // 先推进到第二步
      const nextButton = screen.getByText('下一步');
      fireEvent.click(nextButton);
      expect(screen.getByText('操作面板')).toBeDefined();
      
      // 点击上一步
      const prevButton = screen.getByText('上一步');
      fireEvent.click(prevButton);
      
      // 验证回到第一步
      expect(screen.getByText('资源面板')).toBeDefined();
    });

    it('在最后一步点击完成应该调用 onComplete', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      // 推进到最后一步
      for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
        const nextButton = screen.getByText('下一步');
        fireEvent.click(nextButton);
      }
      
      // 最后一步应该显示"完成"按钮
      expect(screen.getByText('完成')).toBeDefined();
      
      // 点击完成
      const completeButton = screen.getByText('完成');
      fireEvent.click(completeButton);
      
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('完成引导应该标记为已完成', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      expect(hasCompletedOnboarding()).toBe(false);
      
      // 推进到最后一步并完成
      for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
        const nextButton = screen.getByText('下一步');
        fireEvent.click(nextButton);
      }
      
      const completeButton = screen.getByText('完成');
      fireEvent.click(completeButton);
      
      expect(hasCompletedOnboarding()).toBe(true);
    });
  });

  describe('跳过功能', () => {
    it('点击跳过引导应该调用 onSkip', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      const skipButton = screen.getByText('跳过引导');
      fireEvent.click(skipButton);
      
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('跳过引导应该标记为已完成', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      expect(hasCompletedOnboarding()).toBe(false);
      
      const skipButton = screen.getByText('跳过引导');
      fireEvent.click(skipButton);
      
      expect(hasCompletedOnboarding()).toBe(true);
    });
  });

  describe('进度指示器', () => {
    it('应该渲染正确数量的进度点', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      const progressDots = document.querySelectorAll('.progress-dot');
      expect(progressDots.length).toBe(ONBOARDING_STEPS.length);
    });

    it('点击进度点应该跳转到对应步骤', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();
      render(
        <OnboardingGuide isActive={true} onComplete={onComplete} onSkip={onSkip} />
      );
      
      // 点击第三个进度点
      const progressDots = document.querySelectorAll('.progress-dot');
      fireEvent.click(progressDots[2]);
      
      // 验证跳转到第三步（指标面板）
      expect(screen.getByText('指标面板')).toBeDefined();
    });
  });

  describe('本地存储功能', () => {
    it('hasCompletedOnboarding 应该在未完成时返回 false', () => {
      expect(hasCompletedOnboarding()).toBe(false);
    });

    it('markOnboardingCompleted 应该正确标记已完成', () => {
      expect(hasCompletedOnboarding()).toBe(false);
      markOnboardingCompleted();
      expect(hasCompletedOnboarding()).toBe(true);
    });

    it('resetOnboarding 应该重置完成状态', () => {
      markOnboardingCompleted();
      expect(hasCompletedOnboarding()).toBe(true);
      resetOnboarding();
      expect(hasCompletedOnboarding()).toBe(false);
    });
  });

  describe('引导步骤数据', () => {
    it('应该有6个引导步骤', () => {
      expect(ONBOARDING_STEPS.length).toBe(6);
    });

    it('每个步骤应该有必要的属性', () => {
      ONBOARDING_STEPS.forEach(step => {
        expect(step.id).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.targetSelector).toBeDefined();
        expect(step.position).toBeDefined();
        expect(step.icon).toBeDefined();
      });
    });
  });
});
