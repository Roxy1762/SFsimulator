/**
 * MobileNav 组件
 * 移动端底部导航栏，用于快速切换面板
 * 需求: 7.1 - 点击导航项滚动到对应面板
 * 需求: 7.2 - 根据滚动位置高亮当前面板
 * 需求: 7.3 - 底部导航栏快速切换面板
 */

import { useCallback, useEffect, useRef } from 'react';
import './MobileNav.css';

export type MobileNavPanel = 'resources' | 'operations' | 'team' | 'events';

interface MobileNavProps {
  /** 当前激活的面板 */
  activePanel: MobileNavPanel;
  /** 面板切换回调 */
  onPanelChange: (panel: MobileNavPanel) => void;
}

interface NavItem {
  id: MobileNavPanel;
  icon: string;
  label: string;
  ariaLabel: string;
  selector: string;
}

const navItems: NavItem[] = [
  { id: 'resources', icon: '💰', label: '资源', ariaLabel: '查看资源和指标', selector: '.left-sidebar' },
  { id: 'operations', icon: '⚡', label: '操作', ariaLabel: '执行游戏操作', selector: '.game-center' },
  { id: 'team', icon: '👥', label: '团队', ariaLabel: '管理团队成员', selector: '.team-panel' },
  { id: 'events', icon: '📋', label: '日志', ariaLabel: '查看事件日志', selector: '.event-log' },
];

/**
 * 获取导航栏高度（包括安全区域）
 */
function getNavHeight(): number {
  const nav = document.querySelector('.mobile-nav');
  if (nav) {
    return nav.getBoundingClientRect().height;
  }
  // 默认高度 60px + 估计的安全区域
  return 70;
}

/**
 * MobileNav 组件
 * 移动端底部导航栏
 */
export function MobileNav({ activePanel, onPanelChange }: MobileNavProps) {
  const scrollTimeoutRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  /**
   * 平滑滚动到目标面板 - 需求: 7.1
   */
  const scrollToPanel = useCallback((selector: string) => {
    const element = document.querySelector(selector);
    if (!element) return;

    // 标记正在滚动，防止滚动监听器更新激活状态
    isScrollingRef.current = true;

    // 获取元素位置
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 计算目标滚动位置，考虑粘性头部高度（约 60px）
    const headerOffset = 70;
    const targetPosition = scrollTop + rect.top - headerOffset;

    // 平滑滚动到目标位置
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });

    // 滚动完成后重置标记
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  }, []);

  /**
   * 处理导航项点击
   */
  const handleClick = useCallback((item: NavItem) => {
    onPanelChange(item.id);
    scrollToPanel(item.selector);
  }, [onPanelChange, scrollToPanel]);

  /**
   * 根据滚动位置更新激活状态 - 需求: 7.2
   */
  useEffect(() => {
    const handleScroll = () => {
      // 如果正在程序化滚动，不更新激活状态
      if (isScrollingRef.current) return;

      const navHeight = getNavHeight();
      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 检测视口中心位置
      const viewportCenter = scrollTop + (viewportHeight - navHeight) / 2;

      let closestPanel: MobileNavPanel = 'resources';
      let closestDistance = Infinity;

      // 找到距离视口中心最近的面板
      for (const item of navItems) {
        const element = document.querySelector(item.selector);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const elementTop = scrollTop + rect.top;
        const elementCenter = elementTop + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPanel = item.id;
        }
      }

      // 只有当激活面板变化时才更新
      if (closestPanel !== activePanel) {
        onPanelChange(closestPanel);
      }
    };

    // 使用 passive 事件监听器提升性能 - 需求: 11.4
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始检测
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activePanel, onPanelChange]);

  return (
    <nav className="mobile-nav" role="navigation" aria-label="移动端导航">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`mobile-nav-item ${activePanel === item.id ? 'active' : ''}`}
          onClick={() => handleClick(item)}
          aria-label={item.ariaLabel}
          aria-current={activePanel === item.id ? 'page' : undefined}
        >
          <span className="mobile-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileNav;
