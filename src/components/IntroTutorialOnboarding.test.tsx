/**
 * 游戏简介、教程和引导系统集成测试
 * 
 * 测试内容:
 * - 测试首次进入流程
 * - 测试引导完成流程
 * - 测试教程访问流程
 * 
 * 需求: 27, 28, 29
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameIntro, resetIntroViewed, hasViewedIntro } from './GameIntro';
import { TutorialModal } from './TutorialModal';
import { OnboardingGuide, resetOnboarding, hasCompletedOnboarding, ONBOARDING_STEPS } from './OnboardingGuide';
import { useState } from 'react';

// Mock ResizeObserver for test environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/**
 * 简化的测试应用组件
 * 模拟 App 组件的简介和教程流程
 */
function TestIntroApp() {
  const [showIntro, setShowIntro] = useState(!hasViewedIntro());
  const [showTutorial, setShowTutorial] = useState(false);

  if (showIntro) {
    return (
      <>
        <GameIntro
          onStartGame={() => setShowIntro(false)}
          onViewTutorial={() => {
            setShowIntro(false);
            setShowTutorial(true);
          }}
        />
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      </>
    );
  }

  return (
    <>
      <div data-testid="game-initializer">游戏初始化界面</div>
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}

/**
 * 测试引导系统的应用组件
 */
function TestOnboardingApp() {
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding());

  return (
    <>
      {/* 模拟游戏界面的目标元素 */}
      <div className="resource-panel" style={{ position: 'fixed', top: 100, left: 100, width: 200, height: 100 }}>
        资源面板
      </div>
      <div className="operations-modal-trigger" style={{ position: 'fixed', top: 250, left: 100, width: 200, height: 50 }}>
        操作面板
      </div>
      <div className="metrics-panel" style={{ position: 'fixed', top: 100, left: 350, width: 200, height: 150 }}>
        指标面板
      </div>
      <div className="turn-control" style={{ position: 'fixed', top: 300, left: 350, width: 200, height: 50 }}>
        回合控制
      </div>
      <div className="exam-preview" style={{ position: 'fixed', top: 400, left: 350, width: 200, height: 50 }}>
        考核预告
      </div>
      <div className="team-panel" style={{ position: 'fixed', top: 100, left: 600, width: 200, height: 200 }}>
        团队面板
      </div>
      
      <OnboardingGuide
        isActive={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
      
      {!showOnboarding && <div data-testid="onboarding-complete">引导已完成</div>}
    </>
  );
}

describe('首次进入流程集成测试', () => {
  beforeEach(() => {
    localStorage.clear();
    resetIntroViewed();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('首次进入应该显示游戏简介界面', () => {
    render(<TestIntroApp />);
    
    expect(screen.getByText('黑箱：算法飞升')).toBeDefined();
    expect(screen.getByText('背景故事')).toBeDefined();
  });

  it('点击开始游戏应该进入初始化界面', () => {
    render(<TestIntroApp />);
    
    const startButton = screen.getByText('开始游戏');
    fireEvent.click(startButton);
    
    expect(screen.getByTestId('game-initializer')).toBeDefined();
  });

  it('点击开始游戏后再次进入不应该显示简介', () => {
    const { unmount } = render(<TestIntroApp />);
    
    const startButton = screen.getByText('开始游戏');
    fireEvent.click(startButton);
    
    // 卸载并重新渲染
    unmount();
    render(<TestIntroApp />);
    
    // 应该直接显示初始化界面
    expect(screen.getByTestId('game-initializer')).toBeDefined();
    expect(screen.queryByText('背景故事')).toBeNull();
  });

  it('点击查看教程应该打开教程弹窗', () => {
    render(<TestIntroApp />);
    
    const tutorialButton = screen.getByText('查看教程');
    fireEvent.click(tutorialButton);
    
    expect(screen.getByText('游戏教程')).toBeDefined();
  });
});

describe('教程访问流程集成测试', () => {
  beforeEach(() => {
    localStorage.clear();
    resetIntroViewed();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('从简介界面打开教程后可以浏览所有章节', () => {
    render(<TestIntroApp />);
    
    // 打开教程
    const tutorialButton = screen.getByText('查看教程');
    fireEvent.click(tutorialButton);
    
    // 验证第一章内容
    expect(screen.getByText('回合制游戏')).toBeDefined();
    
    // 切换到第二章
    const nextButton = screen.getByText('下一章');
    fireEvent.click(nextButton);
    expect(screen.getByText('三大核心资源')).toBeDefined();
    
    // 切换到第三章
    fireEvent.click(nextButton);
    expect(screen.getByText('拟合指数')).toBeDefined();
  });

  it('关闭教程后应该返回简介界面', () => {
    render(<TestIntroApp />);
    
    // 打开教程
    const tutorialButton = screen.getByText('查看教程');
    fireEvent.click(tutorialButton);
    
    // 关闭教程
    const closeButton = screen.getByLabelText('关闭教程');
    fireEvent.click(closeButton);
    
    // 应该回到简介界面（但简介已被标记为已查看，所以显示初始化界面）
    expect(screen.getByTestId('game-initializer')).toBeDefined();
  });

  it('教程章节导航应该正常工作', () => {
    render(<TestIntroApp />);
    
    // 打开教程
    const tutorialButton = screen.getByText('查看教程');
    fireEvent.click(tutorialButton);
    
    // 点击团队系统章节
    const teamNavButton = screen.getByRole('button', { name: /团队系统/i });
    fireEvent.click(teamNavButton);
    
    // 验证显示团队系统内容
    expect(screen.getByText('雇佣团队')).toBeDefined();
  });
});

describe('引导完成流程集成测试', () => {
  beforeEach(() => {
    localStorage.clear();
    resetOnboarding();
    (window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('首次游戏应该显示新手引导', () => {
    render(<TestOnboardingApp />);
    
    // 应该显示第一步引导（使用 tooltip-title 类来区分）
    const tooltipTitle = document.querySelector('.tooltip-title');
    expect(tooltipTitle?.textContent).toBe('资源面板');
  });

  it('完成所有引导步骤后应该关闭引导', async () => {
    render(<TestOnboardingApp />);
    
    // 逐步完成引导
    for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
      const nextButton = screen.getByText('下一步');
      fireEvent.click(nextButton);
    }
    
    // 最后一步点击完成
    const completeButton = screen.getByText('完成');
    fireEvent.click(completeButton);
    
    // 引导应该关闭
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-complete')).toBeDefined();
    });
  });

  it('跳过引导后应该关闭引导', async () => {
    render(<TestOnboardingApp />);
    
    // 点击跳过
    const skipButton = screen.getByText('跳过引导');
    fireEvent.click(skipButton);
    
    // 引导应该关闭
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-complete')).toBeDefined();
    });
  });

  it('完成引导后再次进入不应该显示引导', () => {
    const { unmount } = render(<TestOnboardingApp />);
    
    // 跳过引导
    const skipButton = screen.getByText('跳过引导');
    fireEvent.click(skipButton);
    
    // 卸载并重新渲染
    unmount();
    render(<TestOnboardingApp />);
    
    // 应该直接显示完成状态
    expect(screen.getByTestId('onboarding-complete')).toBeDefined();
    expect(screen.queryByText('跳过引导')).toBeNull();
  });

  it('引导步骤应该按顺序显示', () => {
    render(<TestOnboardingApp />);
    
    // 验证步骤顺序（使用 tooltip-title 类来区分）
    const expectedSteps = ['资源面板', '操作面板', '指标面板', '回合控制', '考核预告', '团队面板'];
    
    for (let i = 0; i < expectedSteps.length; i++) {
      const tooltipTitle = document.querySelector('.tooltip-title');
      expect(tooltipTitle?.textContent).toBe(expectedSteps[i]);
      
      if (i < expectedSteps.length - 1) {
        const nextButton = screen.getByText('下一步');
        fireEvent.click(nextButton);
      }
    }
  });

  it('引导进度指示器应该正确显示当前步骤', () => {
    render(<TestOnboardingApp />);
    
    // 初始应该显示 "1 / 6"
    expect(screen.getByText(/1\s*\/\s*6/)).toBeDefined();
    
    // 点击下一步
    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);
    
    // 应该显示 "2 / 6"
    expect(screen.getByText(/2\s*\/\s*6/)).toBeDefined();
  });
});
