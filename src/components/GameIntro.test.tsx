/**
 * GameIntro 组件单元测试
 * 
 * 测试内容:
 * - 测试组件渲染
 * - 测试按钮点击事件
 * - 测试本地存储功能
 * 
 * 需求: 27.1, 27.2, 27.3, 27.4, 27.6, 27.7, 27.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameIntro, hasViewedIntro, markIntroViewed, resetIntroViewed } from './GameIntro';

describe('GameIntro 组件单元测试', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('组件渲染', () => {
    it('应该渲染游戏标题', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('黑箱：算法飞升')).toBeDefined();
    });

    it('应该渲染游戏副标题', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('成为推荐系统的终极架构师')).toBeDefined();
    });

    it('应该渲染背景故事章节', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('背景故事')).toBeDefined();
    });

    it('应该渲染游戏目标章节', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('游戏目标')).toBeDefined();
    });

    it('应该渲染核心资源章节', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('核心资源')).toBeDefined();
    });

    it('应该渲染核心机制章节', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('核心机制')).toBeDefined();
    });

    it('应该渲染开始游戏按钮', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.getByText('开始游戏')).toBeDefined();
    });

    it('应该渲染查看教程按钮（当提供 onViewTutorial 时）', () => {
      const onStartGame = vi.fn();
      const onViewTutorial = vi.fn();
      render(<GameIntro onStartGame={onStartGame} onViewTutorial={onViewTutorial} />);
      
      expect(screen.getByText('查看教程')).toBeDefined();
    });

    it('不应该渲染查看教程按钮（当未提供 onViewTutorial 时）', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(screen.queryByText('查看教程')).toBeNull();
    });
  });

  describe('按钮交互', () => {
    it('点击开始游戏按钮应该调用 onStartGame', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      const startButton = screen.getByText('开始游戏');
      fireEvent.click(startButton);
      
      expect(onStartGame).toHaveBeenCalledTimes(1);
    });

    it('点击查看教程按钮应该调用 onViewTutorial', () => {
      const onStartGame = vi.fn();
      const onViewTutorial = vi.fn();
      render(<GameIntro onStartGame={onStartGame} onViewTutorial={onViewTutorial} />);
      
      const tutorialButton = screen.getByText('查看教程');
      fireEvent.click(tutorialButton);
      
      expect(onViewTutorial).toHaveBeenCalledTimes(1);
    });

    it('点击开始游戏按钮应该标记简介已查看', () => {
      const onStartGame = vi.fn();
      render(<GameIntro onStartGame={onStartGame} />);
      
      expect(hasViewedIntro()).toBe(false);
      
      const startButton = screen.getByText('开始游戏');
      fireEvent.click(startButton);
      
      expect(hasViewedIntro()).toBe(true);
    });

    it('点击查看教程按钮应该标记简介已查看', () => {
      const onStartGame = vi.fn();
      const onViewTutorial = vi.fn();
      render(<GameIntro onStartGame={onStartGame} onViewTutorial={onViewTutorial} />);
      
      expect(hasViewedIntro()).toBe(false);
      
      const tutorialButton = screen.getByText('查看教程');
      fireEvent.click(tutorialButton);
      
      expect(hasViewedIntro()).toBe(true);
    });
  });

  describe('本地存储功能', () => {
    it('hasViewedIntro 应该在未查看时返回 false', () => {
      expect(hasViewedIntro()).toBe(false);
    });

    it('markIntroViewed 应该正确标记已查看', () => {
      expect(hasViewedIntro()).toBe(false);
      markIntroViewed();
      expect(hasViewedIntro()).toBe(true);
    });

    it('resetIntroViewed 应该重置查看状态', () => {
      markIntroViewed();
      expect(hasViewedIntro()).toBe(true);
      resetIntroViewed();
      expect(hasViewedIntro()).toBe(false);
    });
  });
});
