/**
 * MobileNav 组件
 * 移动端底部导航栏，用于快速切换面板
 * 需求: 7.3 - 底部导航栏快速切换面板
 */

import { useCallback } from 'react';
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
}

const navItems: NavItem[] = [
  { id: 'resources', icon: '💰', label: '资源', ariaLabel: '查看资源和指标' },
  { id: 'operations', icon: '⚡', label: '操作', ariaLabel: '执行游戏操作' },
  { id: 'team', icon: '👥', label: '团队', ariaLabel: '管理团队成员' },
  { id: 'events', icon: '📋', label: '日志', ariaLabel: '查看事件日志' },
];

/**
 * MobileNav 组件
 * 移动端底部导航栏
 */
export function MobileNav({ activePanel, onPanelChange }: MobileNavProps) {
  const handleClick = useCallback((panel: MobileNavPanel) => {
    onPanelChange(panel);
    
    // 滚动到对应面板
    const panelMap: Record<MobileNavPanel, string> = {
      resources: '.left-sidebar',
      operations: '.game-center',
      team: '.team-panel',
      events: '.event-log',
    };
    
    const selector = panelMap[panel];
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [onPanelChange]);

  return (
    <nav className="mobile-nav" role="navigation" aria-label="移动端导航">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`mobile-nav-item ${activePanel === item.id ? 'active' : ''}`}
          onClick={() => handleClick(item.id)}
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
