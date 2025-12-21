/**
 * TutorialModal 组件单元测试
 * 
 * 测试内容:
 * - 测试组件渲染
 * - 测试章节切换功能
 * - 测试导航按钮
 * 
 * 需求: 28.1, 28.2, 28.3, 28.4, 28.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialModal } from './TutorialModal';

describe('TutorialModal 组件单元测试', () => {
  describe('组件渲染', () => {
    it('当 isOpen 为 false 时不应该渲染任何内容', () => {
      const onClose = vi.fn();
      const { container } = render(<TutorialModal isOpen={false} onClose={onClose} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('当 isOpen 为 true 时应该渲染弹窗', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      expect(screen.getByText('游戏教程')).toBeDefined();
    });

    it('应该渲染所有章节导航按钮', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 使用 getAllByText 因为章节名称可能出现在导航和内容中
      expect(screen.getAllByText('基础操作').length).toBeGreaterThan(0);
      expect(screen.getAllByText('资源管理').length).toBeGreaterThan(0);
      expect(screen.getAllByText('模型训练').length).toBeGreaterThan(0);
      expect(screen.getAllByText('考核系统').length).toBeGreaterThan(0);
      expect(screen.getAllByText('团队系统').length).toBeGreaterThan(0);
      expect(screen.getAllByText('外快系统').length).toBeGreaterThan(0);
    });

    it('应该默认显示第一章内容', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 第一章是"基础操作"
      expect(screen.getByText('回合制游戏')).toBeDefined();
    });

    it('应该渲染关闭按钮', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      expect(screen.getByLabelText('关闭教程')).toBeDefined();
    });

    it('应该渲染上一章和下一章按钮', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      expect(screen.getByText('上一章')).toBeDefined();
      expect(screen.getByText('下一章')).toBeDefined();
    });
  });

  describe('章节切换功能', () => {
    it('点击章节导航应该切换到对应章节', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 点击"资源管理"章节
      const resourceNavButton = screen.getByRole('button', { name: /资源管理/i });
      fireEvent.click(resourceNavButton);
      
      // 验证显示资源管理章节内容
      expect(screen.getByText('三大核心资源')).toBeDefined();
    });

    it('点击下一章按钮应该切换到下一章', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 初始在第一章
      expect(screen.getByText('回合制游戏')).toBeDefined();
      
      // 点击下一章
      const nextButton = screen.getByText('下一章');
      fireEvent.click(nextButton);
      
      // 验证切换到第二章（资源管理）
      expect(screen.getByText('三大核心资源')).toBeDefined();
    });

    it('点击上一章按钮应该切换到上一章', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 先切换到第二章
      const nextButton = screen.getByText('下一章');
      fireEvent.click(nextButton);
      expect(screen.getByText('三大核心资源')).toBeDefined();
      
      // 点击上一章
      const prevButton = screen.getByText('上一章');
      fireEvent.click(prevButton);
      
      // 验证回到第一章
      expect(screen.getByText('回合制游戏')).toBeDefined();
    });

    it('在第一章时上一章按钮应该被禁用', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      const prevButton = screen.getByText('上一章').closest('button');
      expect(prevButton?.hasAttribute('disabled')).toBe(true);
    });

    it('在最后一章时下一章按钮应该被禁用', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 切换到最后一章（外快系统）
      const sideJobNavButton = screen.getByRole('button', { name: /外快系统/i });
      fireEvent.click(sideJobNavButton);
      
      const nextButton = screen.getByText('下一章').closest('button');
      expect(nextButton?.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('关闭功能', () => {
    it('点击关闭按钮应该调用 onClose', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('关闭教程');
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('点击遮罩层应该调用 onClose', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      const overlay = document.querySelector('.tutorial-modal-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('点击弹窗内容不应该关闭弹窗', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      const modal = document.querySelector('.tutorial-modal');
      if (modal) {
        fireEvent.click(modal);
        expect(onClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('页码指示器', () => {
    it('应该渲染正确数量的页码点', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      const paginationDots = document.querySelectorAll('.pagination-dot');
      expect(paginationDots.length).toBe(6); // 6个章节
    });

    it('点击页码点应该切换到对应章节', () => {
      const onClose = vi.fn();
      render(<TutorialModal isOpen={true} onClose={onClose} />);
      
      // 点击第三个页码点（模型训练）
      const paginationDots = document.querySelectorAll('.pagination-dot');
      fireEvent.click(paginationDots[2]);
      
      // 验证显示模型训练章节内容
      expect(screen.getByText('拟合指数')).toBeDefined();
    });
  });
});
