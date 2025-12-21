/**
 * OnboardingGuide 组件
 * 新手引导系统，在首次游戏时提供逐步引导
 * 
 * 需求: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import './OnboardingGuide.css';

// 本地存储键名
const ONBOARDING_COMPLETED_KEY = 'algorithm_ascension_onboarding_completed';

/**
 * 引导步骤数据结构
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;  // 目标元素的CSS选择器
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: string;
  tips?: string[];
}

/**
 * 引导步骤定义 - 需求 29.2
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'resources',
    title: '资源面板',
    description: '这里显示你的核心资源：资金、算力（AP）和数据。资金是公司命脉，连续2回合为负会导致破产！算力每回合恢复，用于执行操作。',
    targetSelector: '.resource-panel',
    position: 'right',
    icon: '💎',
    tips: ['保持资金储备应对突发情况', '合理规划每回合的算力使用']
  },
  {
    id: 'operations',
    title: '操作面板',
    description: '点击这里展开操作菜单。操作按类别分组：数据获取、模型训练、系统维护等。每个操作都会消耗资源并产生效果。',
    targetSelector: '.operations-modal-trigger',
    position: 'bottom',
    icon: '🎮',
    tips: ['灰色操作表示资源不足', '注意操作的熵值增加']
  },
  {
    id: 'metrics',
    title: '指标面板',
    description: '拟合指数代表模型性能，越高考核收益越多。熵值代表技术债，过高会降低收益甚至触发服务熔断！',
    targetSelector: '.metrics-panel',
    position: 'right',
    icon: '📊',
    tips: ['熵值超过80%有30%概率熔断', '定期使用"代码重构"降低熵值']
  },
  {
    id: 'turn-control',
    title: '回合控制',
    description: '点击"结束回合"推进游戏。每回合可执行多个操作直到算力耗尽。注意查看距离下次考核的回合数！',
    targetSelector: '.turn-control',
    position: 'left',
    icon: '⏱️',
    tips: ['考核前确保拟合指数和维度达标', '熵值过高时优先维护']
  },
  {
    id: 'exam-preview',
    title: '考核预告',
    description: '每5回合进行一次流量考核。考核会根据拟合指数、稳定性和能力维度计算收益。考核失败会扣除资金！',
    targetSelector: '.exam-preview',
    position: 'left',
    icon: '🎯',
    tips: ['提前查看考核的维度要求', '平衡发展多个维度']
  },
  {
    id: 'team',
    title: '团队面板',
    description: '在这里管理你的开发团队。雇佣成员获得能力加成，但需要支付工资。团队最多5人，稀有度越高词条越多！',
    targetSelector: '.team-panel',
    position: 'left',
    icon: '👥',
    tips: ['考核时结算工资', '解雇只返还30%费用']
  }
];

interface OnboardingGuideProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * 检查是否已完成引导
 */
export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 标记引导已完成
 */
export function markOnboardingCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch {
    // 忽略存储错误
  }
}

/**
 * 重置引导状态（用于设置中重新启动引导）
 */
export function resetOnboarding(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch {
    // 忽略存储错误
  }
}

/**
 * 计算提示框位置
 */
function calculateTooltipPosition(
  targetRect: DOMRect,
  position: OnboardingStep['position']
): { top: number; left: number; arrowPosition: string } {
  const padding = 16;
  const tooltipWidth = 320;
  const tooltipHeight = 200; // 估计高度
  
  let top = 0;
  let left = 0;
  let arrowPosition = position;
  
  switch (position) {
    case 'top':
      top = targetRect.top - tooltipHeight - padding;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + padding;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - padding;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + padding;
      break;
  }
  
  // 边界检查和调整
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 水平边界调整
  if (left < padding) {
    left = padding;
  } else if (left + tooltipWidth > viewportWidth - padding) {
    left = viewportWidth - tooltipWidth - padding;
  }
  
  // 垂直边界调整
  if (top < padding) {
    top = padding;
  } else if (top + tooltipHeight > viewportHeight - padding) {
    top = viewportHeight - tooltipHeight - padding;
  }
  
  return { top, left, arrowPosition };
}

/**
 * OnboardingGuide 组件
 * 显示新手引导遮罩和提示
 */
export function OnboardingGuide({ isActive, onComplete, onSkip }: OnboardingGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; arrowPosition: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  // 更新目标元素位置
  const updateTargetPosition = useCallback(() => {
    if (!currentStep) return;
    
    const targetElement = document.querySelector(currentStep.targetSelector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      setTooltipPosition(calculateTooltipPosition(rect, currentStep.position));
    } else {
      // 如果找不到目标元素，尝试使用备用选择器或跳过
      setTargetRect(null);
      setTooltipPosition(null);
    }
  }, [currentStep]);

  // 监听目标元素位置变化
  useEffect(() => {
    if (!isActive || !currentStep) return;

    updateTargetPosition();

    // 监听窗口大小变化
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    // 使用 ResizeObserver 监听目标元素大小变化
    const targetElement = document.querySelector(currentStep.targetSelector);
    if (targetElement) {
      observerRef.current = new ResizeObserver(updateTargetPosition);
      observerRef.current.observe(targetElement);
    }

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isActive, currentStep, updateTargetPosition]);

  // 步骤切换动画
  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isActive]);

  // 下一步
  const handleNext = useCallback(() => {
    if (isLastStep) {
      markOnboardingCompleted();
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep, onComplete]);

  // 上一步
  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  // 跳过引导
  const handleSkip = useCallback(() => {
    markOnboardingCompleted();
    onSkip();
  }, [onSkip]);

  // 跳转到指定步骤
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < ONBOARDING_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  if (!isActive || !currentStep) {
    return null;
  }

  return (
    <div className="onboarding-overlay">
      {/* 遮罩层 - 需求 29.3 */}
      <div className="onboarding-mask">
        {/* 高亮区域 - 使用 SVG 实现镂空效果 */}
        {targetRect && (
          <svg className="onboarding-mask-svg" width="100%" height="100%">
            <defs>
              <mask id="onboarding-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                  className={isAnimating ? 'highlight-animate' : ''}
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#onboarding-mask)"
            />
          </svg>
        )}
        
        {/* 高亮边框 */}
        {targetRect && (
          <div
            className={`onboarding-highlight ${isAnimating ? 'animate' : ''}`}
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </div>

      {/* 提示框 - 需求 29.4 */}
      {tooltipPosition && (
        <div
          className={`onboarding-tooltip ${tooltipPosition.arrowPosition} ${isAnimating ? 'animate' : ''}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {/* 箭头指示 */}
          <div className={`tooltip-arrow ${tooltipPosition.arrowPosition}`} />
          
          {/* 头部 */}
          <header className="tooltip-header">
            <div className="tooltip-title-area">
              <span className="tooltip-icon">{currentStep.icon}</span>
              <h3 className="tooltip-title">{currentStep.title}</h3>
            </div>
            <span className="tooltip-step-indicator">
              {currentStepIndex + 1} / {ONBOARDING_STEPS.length}
            </span>
          </header>

          {/* 内容 */}
          <div className="tooltip-content">
            <p className="tooltip-description">{currentStep.description}</p>
            
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="tooltip-tips">
                <div className="tips-header">
                  <span className="tips-icon">💡</span>
                  <span>小贴士</span>
                </div>
                <ul className="tips-list">
                  {currentStep.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 进度指示器 - 需求 29.4 */}
          <div className="tooltip-progress">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                className={`progress-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
                onClick={() => goToStep(index)}
                aria-label={`跳转到步骤 ${index + 1}`}
              />
            ))}
          </div>

          {/* 底部按钮 - 需求 29.5, 29.6 */}
          <footer className="tooltip-footer">
            <button
              className="tooltip-button skip"
              onClick={handleSkip}
            >
              跳过引导
            </button>
            
            <div className="tooltip-nav-buttons">
              {!isFirstStep && (
                <button
                  className="tooltip-button prev"
                  onClick={handlePrev}
                >
                  <span className="nav-arrow">←</span>
                  上一步
                </button>
              )}
              
              <button
                className="tooltip-button next primary"
                onClick={handleNext}
              >
                {isLastStep ? '完成' : '下一步'}
                {!isLastStep && <span className="nav-arrow">→</span>}
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

export default OnboardingGuide;
