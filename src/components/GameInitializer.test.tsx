/**
 * GameInitializer 组件单元测试
 * 
 * 测试内容:
 * - 测试渲染难度选择界面
 * - 测试渲染三种形态选项
 * - 测试选择形态触发初始化
 * 
 * 需求: 10.1, 21.1, 21.3
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameInitializer } from './GameInitializer';
import { GameEngine } from '../engine/GameEngine';
import { DIFFICULTY_CONFIGS } from '../types';

describe('GameInitializer 组件', () => {
  describe('难度选择界面', () => {
    it('应该首先显示难度选择界面', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      // 验证四种难度都显示
      expect(screen.getByText('简单')).toBeDefined();
      expect(screen.getByText('普通')).toBeDefined();
      expect(screen.getByText('困难')).toBeDefined();
      expect(screen.getByText('噩梦')).toBeDefined();
    });

    it('应该显示每种难度的描述', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      expect(screen.getByText(DIFFICULTY_CONFIGS.easy.description)).toBeDefined();
      expect(screen.getByText(DIFFICULTY_CONFIGS.normal.description)).toBeDefined();
      expect(screen.getByText(DIFFICULTY_CONFIGS.hard.description)).toBeDefined();
      expect(screen.getByText(DIFFICULTY_CONFIGS.nightmare.description)).toBeDefined();
    });

    it('应该显示难度参数', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      // 验证难度参数标签显示
      expect(screen.getAllByText('初始资金:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('考核难度增长:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('负面事件概率:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('雇佣费用:').length).toBeGreaterThan(0);
    });

    it('默认应该选中普通难度', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      const normalCard = screen.getByText('普通').closest('.difficulty-card');
      expect(normalCard?.classList.contains('selected')).toBe(true);
    });

    it('点击难度卡片应该选中该难度', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      const hardCard = screen.getByText('困难').closest('.difficulty-card');
      if (hardCard) {
        fireEvent.click(hardCard);
      }

      expect(hardCard?.classList.contains('selected')).toBe(true);
    });

    it('应该显示继续选择形态按钮', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      expect(screen.getByText('继续选择形态 →')).toBeDefined();
    });
  });

  describe('形态选择界面', () => {
    const goToArchetypeStep = () => {
      // 点击继续按钮进入形态选择界面
      fireEvent.click(screen.getByText('继续选择形态 →'));
    };

    it('点击继续按钮后应该显示形态选择界面', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      goToArchetypeStep();

      // 验证三种形态名称都显示
      expect(screen.getByText('创业公司')).toBeDefined();
      expect(screen.getByText('大厂团队')).toBeDefined();
      expect(screen.getByText('学术研究')).toBeDefined();
    });

    it('应该显示已选择的难度', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      // 选择困难难度
      const hardCard = screen.getByText('困难').closest('.difficulty-card');
      if (hardCard) {
        fireEvent.click(hardCard);
      }

      goToArchetypeStep();

      // 验证显示已选难度
      expect(screen.getByText('当前难度:')).toBeDefined();
      // 在 difficulty-badge 中应该显示困难
      const badge = screen.getByText('困难', { selector: '.difficulty-badge' });
      expect(badge).toBeDefined();
    });

    it('应该显示每种形态的描述', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      goToArchetypeStep();

      const archetypes = GameEngine.getAllArchetypes();
      
      expect(screen.getByText(archetypes.startup.description)).toBeDefined();
      expect(screen.getByText(archetypes.bigtech.description)).toBeDefined();
      expect(screen.getByText(archetypes.academic.description)).toBeDefined();
    });

    it('应该显示每种形态的特殊能力', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      goToArchetypeStep();

      const archetypes = GameEngine.getAllArchetypes();
      
      expect(screen.getByText(archetypes.startup.specialAbility)).toBeDefined();
      expect(screen.getByText(archetypes.bigtech.specialAbility)).toBeDefined();
      expect(screen.getByText(archetypes.academic.specialAbility)).toBeDefined();
    });

    it('应该渲染三个选择按钮', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      goToArchetypeStep();

      const selectButtons = screen.getAllByText('选择此形态');
      expect(selectButtons.length).toBe(3);
    });

    it('点击更改难度按钮应该返回难度选择界面', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      goToArchetypeStep();

      // 点击更改难度按钮
      fireEvent.click(screen.getByText('更改难度'));

      // 应该回到难度选择界面
      expect(screen.getByText('继续选择形态 →')).toBeDefined();
    });
  });

  describe('选择形态触发初始化', () => {
    const goToArchetypeStep = () => {
      fireEvent.click(screen.getByText('继续选择形态 →'));
    };

    it('点击创业公司卡片应该触发 onSelectArchetype 并传入 startup 和默认难度 normal', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      goToArchetypeStep();

      // 点击创业公司卡片
      const startupCard = screen.getByText('创业公司').closest('.archetype-card');
      if (startupCard) {
        fireEvent.click(startupCard);
      }

      expect(mockOnSelect).toHaveBeenCalledWith('startup', 'normal');
    });

    it('选择困难难度后点击大厂团队应该传入 bigtech 和 hard', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      // 选择困难难度
      const hardCard = screen.getByText('困难').closest('.difficulty-card');
      if (hardCard) {
        fireEvent.click(hardCard);
      }

      goToArchetypeStep();

      // 找到大厂团队卡片内的选择按钮
      const bigtechCard = screen.getByText('大厂团队').closest('.archetype-card');
      const selectButton = bigtechCard?.querySelector('.select-button');
      
      if (selectButton) {
        fireEvent.click(selectButton);
      }

      expect(mockOnSelect).toHaveBeenCalledWith('bigtech', 'hard');
    });

    it('选择噩梦难度后点击学术研究应该传入 academic 和 nightmare', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} />);

      // 选择噩梦难度
      const nightmareCard = screen.getByText('噩梦').closest('.difficulty-card');
      if (nightmareCard) {
        fireEvent.click(nightmareCard);
      }

      goToArchetypeStep();

      // 找到学术研究卡片内的选择按钮
      const academicCard = screen.getByText('学术研究').closest('.archetype-card');
      const selectButton = academicCard?.querySelector('.select-button');
      
      if (selectButton) {
        fireEvent.click(selectButton);
      }

      expect(mockOnSelect).toHaveBeenCalledWith('academic', 'nightmare');
    });
  });

  describe('继续游戏功能', () => {
    it('当有存档时应该在难度选择界面显示继续游戏按钮', () => {
      const mockOnSelect = vi.fn();
      const mockOnLoad = vi.fn();
      render(
        <GameInitializer 
          onSelectArchetype={mockOnSelect} 
          onLoadGame={mockOnLoad}
          hasSavedGame={true}
        />
      );

      expect(screen.getByText('继续上次游戏')).toBeDefined();
    });

    it('当没有存档时不应该显示继续游戏按钮', () => {
      const mockOnSelect = vi.fn();
      render(<GameInitializer onSelectArchetype={mockOnSelect} hasSavedGame={false} />);

      expect(screen.queryByText('继续上次游戏')).toBeNull();
    });

    it('点击继续游戏按钮应该触发 onLoadGame', () => {
      const mockOnSelect = vi.fn();
      const mockOnLoad = vi.fn();
      render(
        <GameInitializer 
          onSelectArchetype={mockOnSelect} 
          onLoadGame={mockOnLoad}
          hasSavedGame={true}
        />
      );

      fireEvent.click(screen.getByText('继续上次游戏'));
      expect(mockOnLoad).toHaveBeenCalled();
    });
  });
});
