/**
 * Team UI 组件单元测试
 * 
 * 测试内容:
 * - 测试成员卡片渲染
 * - 测试雇佣/解雇交互
 * 
 * 需求: 18.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamMemberCard } from './TeamMemberCard';
import { HiringPool } from './HiringPool';
import { TeamPanel } from './TeamPanel';
import type { TeamMember } from '../types';

// 测试用的团队成员数据
const createMockMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  id: 'member-1',
  name: '张伟',
  rarity: 'rare',
  baseStats: {
    computeContribution: 8,
    dataEfficiency: 7,
    maintenanceSkill: 6,
  },
  traits: ['algorithm_expert', 'efficiency'],
  level: 2,
  experience: 150,
  hiringCost: 2000,
  salary: 350,
  ...overrides,
});

describe('TeamMemberCard 组件', () => {
  describe('成员卡片渲染', () => {
    it('应该显示成员名称', () => {
      const member = createMockMember({ name: '李娜' });
      render(<TeamMemberCard member={member} />);
      expect(screen.getByText('李娜')).toBeDefined();
    });

    it('应该显示成员等级', () => {
      const member = createMockMember({ level: 3 });
      render(<TeamMemberCard member={member} />);
      expect(screen.getByText('Lv.3')).toBeDefined();
    });

    it('应该显示能力词条', () => {
      const member = createMockMember({ traits: ['algorithm_expert', 'data_engineer'] });
      render(<TeamMemberCard member={member} />);
      expect(screen.getByText('算法专家')).toBeDefined();
      expect(screen.getByText('数据工程师')).toBeDefined();
    });

    it('应该显示经验进度', () => {
      const member = createMockMember({ experience: 150, level: 2 });
      render(<TeamMemberCard member={member} />);
      expect(screen.getByText('150 / 200')).toBeDefined();
    });

    it('满级成员应该显示已满级', () => {
      const member = createMockMember({ level: 10, experience: 4500 });
      render(<TeamMemberCard member={member} />);
      expect(screen.getByText('已满级')).toBeDefined();
    });
  });

  describe('解雇交互', () => {
    it('应该显示解雇按钮', () => {
      const member = createMockMember();
      const onFire = vi.fn();
      render(<TeamMemberCard member={member} onFire={onFire} />);
      expect(screen.getByText('解雇')).toBeDefined();
    });

    it('点击解雇按钮应该调用 onFire', () => {
      const member = createMockMember({ id: 'test-id' });
      const onFire = vi.fn();
      render(<TeamMemberCard member={member} onFire={onFire} />);
      
      fireEvent.click(screen.getByText('解雇'));
      expect(onFire).toHaveBeenCalledWith('test-id');
    });

    it('showFireButton 为 false 时不显示解雇按钮', () => {
      const member = createMockMember();
      render(<TeamMemberCard member={member} showFireButton={false} />);
      expect(screen.queryByText('解雇')).toBeNull();
    });
  });
});

describe('HiringPool 组件', () => {
  const mockCandidates: TeamMember[] = [
    createMockMember({ id: 'c1', name: '候选人A', hiringCost: 1500 }),
    createMockMember({ id: 'c2', name: '候选人B', hiringCost: 2500 }),
  ];

  describe('候选人列表渲染', () => {
    it('应该显示所有候选人', () => {
      render(
        <HiringPool 
          candidates={mockCandidates} 
          currentBudget={3000} 
          onHire={vi.fn()} 
        />
      );
      expect(screen.getByText('候选人A')).toBeDefined();
      expect(screen.getByText('候选人B')).toBeDefined();
    });

    it('应该显示雇佣费用', () => {
      render(
        <HiringPool 
          candidates={mockCandidates} 
          currentBudget={3000} 
          onHire={vi.fn()} 
        />
      );
      expect(screen.getByText('1.5K')).toBeDefined();
      expect(screen.getByText('2.5K')).toBeDefined();
    });

    it('无候选人时应该显示提示', () => {
      render(
        <HiringPool 
          candidates={[]} 
          currentBudget={3000} 
          onHire={vi.fn()} 
        />
      );
      expect(screen.getByText('暂无候选人，下回合将刷新')).toBeDefined();
    });
  });

  describe('雇佣交互', () => {
    it('资金充足时应该显示雇佣按钮', () => {
      render(
        <HiringPool 
          candidates={[mockCandidates[0]]} 
          currentBudget={3000} 
          onHire={vi.fn()} 
        />
      );
      expect(screen.getByText('雇佣')).toBeDefined();
    });

    it('点击雇佣按钮应该调用 onHire', () => {
      const onHire = vi.fn();
      render(
        <HiringPool 
          candidates={[mockCandidates[0]]} 
          currentBudget={3000} 
          onHire={onHire} 
        />
      );
      
      fireEvent.click(screen.getByText('雇佣'));
      expect(onHire).toHaveBeenCalledWith('c1');
    });

    it('资金不足时应该显示资金不足', () => {
      render(
        <HiringPool 
          candidates={[mockCandidates[1]]} 
          currentBudget={1000} 
          onHire={vi.fn()} 
        />
      );
      expect(screen.getByText('资金不足')).toBeDefined();
    });
  });
});

describe('TeamPanel 组件', () => {
  const mockTeam: TeamMember[] = [
    createMockMember({ id: 't1', name: '团队成员A' }),
  ];
  
  const mockHiringPool: TeamMember[] = [
    createMockMember({ id: 'h1', name: '候选人X', hiringCost: 1500 }),
  ];

  describe('团队面板渲染', () => {
    it('应该显示团队人数', () => {
      render(
        <TeamPanel 
          team={mockTeam}
          hiringPool={mockHiringPool}
          currentBudget={3000}
          onHire={vi.fn()}
          onFire={vi.fn()}
        />
      );
      expect(screen.getByText('1 / 5')).toBeDefined();
    });

    it('应该显示当前团队成员', () => {
      render(
        <TeamPanel 
          team={mockTeam}
          hiringPool={mockHiringPool}
          currentBudget={3000}
          onHire={vi.fn()}
          onFire={vi.fn()}
        />
      );
      expect(screen.getByText('团队成员A')).toBeDefined();
    });

    it('无团队成员时应该显示提示', () => {
      render(
        <TeamPanel 
          team={[]}
          hiringPool={mockHiringPool}
          currentBudget={3000}
          onHire={vi.fn()}
          onFire={vi.fn()}
        />
      );
      expect(screen.getByText('暂无团队成员，从候选人池中雇佣吧！')).toBeDefined();
    });

    it('团队满员时应该显示警告', () => {
      const fullTeam = Array.from({ length: 5 }, (_, i) => 
        createMockMember({ id: `t${i}`, name: `成员${i}` })
      );
      render(
        <TeamPanel 
          team={fullTeam}
          hiringPool={mockHiringPool}
          currentBudget={3000}
          onHire={vi.fn()}
          onFire={vi.fn()}
        />
      );
      expect(screen.getByText('⚠️ 团队已满，需解雇成员后才能雇佣新人')).toBeDefined();
    });
  });

  describe('雇佣/解雇交互', () => {
    it('点击雇佣应该调用 onHire', () => {
      const onHire = vi.fn();
      render(
        <TeamPanel 
          team={[]}
          hiringPool={mockHiringPool}
          currentBudget={3000}
          onHire={onHire}
          onFire={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByText('雇佣'));
      expect(onHire).toHaveBeenCalledWith('h1');
    });

    it('点击解雇应该调用 onFire', () => {
      const onFire = vi.fn();
      render(
        <TeamPanel 
          team={mockTeam}
          hiringPool={mockHiringPool}
          currentBudget={3000}
          onHire={vi.fn()}
          onFire={onFire}
        />
      );
      
      fireEvent.click(screen.getByText('解雇'));
      expect(onFire).toHaveBeenCalledWith('t1');
    });
  });
});
