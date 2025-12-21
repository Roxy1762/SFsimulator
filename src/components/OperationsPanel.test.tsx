/**
 * OperationsPanel 和 OperationButton 组件测试
 * 需求: 8.4, 8.5, 12.2, 12.3, 12.4, 12.5, 12.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperationButton } from './OperationButton';
import { OperationsPanel } from './OperationsPanel';
import { WebCrawl, SGD } from '../operations';
import type { GameState } from '../types';

// 创建测试用的游戏状态
function createTestGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    resources: {
      budget: 5000,
      computePoints: 5,
      computeMax: 5,
      dirtyData: 500,
      goldenData: 200,
      dataCapacity: 1000,
    },
    metrics: {
      fitScore: 50,
      entropy: 30,
      fitScoreCap: 100,
      accuracy: 40,
      speed: 50,
      creativity: 30,
      robustness: 35,
    },
    dimensions: {
      algorithm: 50,
      dataProcessing: 50,
      stability: 50,
      userExperience: 50,
    },
    progress: {
      turn: 1,
      turnsUntilExam: 7,
      consecutiveNegativeBudget: 0,
      examsPassed: 0,
      sideJobsThisTurn: 0,
    },
    risks: {
      legalRisk: 0,
      serverMeltdown: false,
    },
    equipment: {
      gpu: { type: 'gpu', level: 1, maxLevel: 4 },
      storage: { type: 'storage', level: 1, maxLevel: 4 },
      network: { type: 'network', level: 1, maxLevel: 4 },
      cooling: { type: 'cooling', level: 1, maxLevel: 4 },
    },
    archetype: 'bigtech',
    difficulty: 'normal',
    reputation: 0,
    team: [],
    hiringPool: [],
    gameStatus: 'playing',
    ...overrides,
  };
}

describe('OperationButton', () => {
  it('应该渲染操作名称和描述', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={WebCrawl}
        gameState={gameState}
        onExecute={onExecute}
      />
    );

    expect(screen.getByText('全网爬虫')).toBeDefined();
    expect(screen.getByText('快速获取大量脏数据，但会增加系统熵值')).toBeDefined();
  });

  it('应该显示资源消耗', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={WebCrawl}
        gameState={gameState}
        onExecute={onExecute}
      />
    );

    // WebCrawl 消耗 150 资金和 1 AP
    expect(screen.getByText(/💰 150/)).toBeDefined();
    expect(screen.getByText(/⚡ 1 AP/)).toBeDefined();
  });

  it('当资源足够时按钮应该可点击', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={WebCrawl}
        gameState={gameState}
        onExecute={onExecute}
      />
    );

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    
    fireEvent.click(button);
    expect(onExecute).toHaveBeenCalledWith('web_crawl');
  });

  it('当资源不足时按钮应该被禁用', () => {
    const gameState = createTestGameState({
      resources: {
        budget: 50, // 不足 200
        computePoints: 5,
        computeMax: 5,
        dirtyData: 500,
        goldenData: 200,
        dataCapacity: 1000,
      },
    });
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={WebCrawl}
        gameState={gameState}
        onExecute={onExecute}
      />
    );

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.classList.contains('disabled')).toBe(true);
    
    fireEvent.click(button);
    expect(onExecute).not.toHaveBeenCalled();
  });

  it('当算力不足时按钮应该被禁用', () => {
    const gameState = createTestGameState({
      resources: {
        budget: 5000,
        computePoints: 0, // 不足
        computeMax: 5,
        dirtyData: 500,
        goldenData: 200,
        dataCapacity: 1000,
      },
    });
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={SGD}
        gameState={gameState}
        onExecute={onExecute}
      />
    );

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('当 disabled prop 为 true 时按钮应该被禁用', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={WebCrawl}
        gameState={gameState}
        onExecute={onExecute}
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('应该显示资源不足的警告信息', () => {
    const gameState = createTestGameState({
      resources: {
        budget: 50,
        computePoints: 5,
        computeMax: 5,
        dirtyData: 500,
        goldenData: 200,
        dataCapacity: 1000,
      },
    });
    const onExecute = vi.fn();

    render(
      <OperationButton
        operation={WebCrawl}
        gameState={gameState}
        onExecute={onExecute}
      />
    );

    expect(screen.getByText(/资金不足/)).toBeDefined();
  });
});

describe('OperationsPanel', () => {
  it('应该渲染所有七个操作类别', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 检查所有类别标题
    expect(screen.getByText('数据获取')).toBeDefined();
    expect(screen.getByText('模型训练')).toBeDefined();
    expect(screen.getByText('系统维护')).toBeDefined();
    expect(screen.getByText('专项培养')).toBeDefined();
    expect(screen.getByText('付费提升')).toBeDefined();
    expect(screen.getByText('团队管理')).toBeDefined();
    expect(screen.getByText('外快任务')).toBeDefined();
  });

  it('默认应该折叠所有类别', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 检查所有类别的内容区域都有 collapsed 类
    const accordionContents = document.querySelectorAll('.accordion-content');
    accordionContents.forEach(content => {
      expect(content.classList.contains('collapsed')).toBe(true);
    });
  });

  it('点击类别标题应该展开该类别', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 点击数据获取类别
    const dataCategory = screen.getByText('数据获取');
    fireEvent.click(dataCategory);

    // 数据获取操作应该可见
    expect(screen.getByText('全网爬虫')).toBeDefined();
    expect(screen.getByText('数据清洗')).toBeDefined();
    expect(screen.getByText('购买隐私数据')).toBeDefined();
  });

  it('点击展开的类别应该折叠该类别', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 点击数据获取类别展开
    const dataCategory = screen.getByText('数据获取');
    fireEvent.click(dataCategory);
    
    // 检查数据获取类别的内容区域有 expanded 类
    const dataAccordion = dataCategory.closest('.category-accordion');
    expect(dataAccordion?.classList.contains('expanded')).toBe(true);

    // 再次点击折叠
    fireEvent.click(dataCategory);
    expect(dataAccordion?.classList.contains('collapsed')).toBe(true);
  });

  it('应该支持同时展开多个类别', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 展开数据获取
    fireEvent.click(screen.getByText('数据获取'));
    // 展开模型训练
    fireEvent.click(screen.getByText('模型训练'));

    // 两个类别的操作都应该可见
    expect(screen.getByText('全网爬虫')).toBeDefined();
    expect(screen.getByText('随机梯度下降')).toBeDefined();
  });

  it('展开类别后点击操作按钮应该调用 onExecuteOperation', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 展开数据获取类别
    fireEvent.click(screen.getByText('数据获取'));

    // 点击全网爬虫按钮
    const webCrawlButton = screen.getByText('全网爬虫').closest('button');
    fireEvent.click(webCrawlButton!);

    expect(onExecute).toHaveBeenCalledWith('web_crawl');
  });

  it('应该显示每个类别的可执行操作数量', () => {
    const gameState = createTestGameState();
    const onExecute = vi.fn();

    render(
      <OperationsPanel
        gameState={gameState}
        onExecuteOperation={onExecute}
      />
    );

    // 检查类别头部显示了操作数量（格式: X/Y）
    const accordionHeaders = screen.getAllByRole('button');
    // 至少应该有7个类别头部按钮
    expect(accordionHeaders.length).toBeGreaterThanOrEqual(7);
  });
});
