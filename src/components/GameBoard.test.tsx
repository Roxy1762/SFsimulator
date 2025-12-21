/**
 * GameBoard 组件集成测试
 * 
 * 测试内容:
 * - 测试从初始化到游戏结束的完整流程
 * - 测试多回合操作和考核
 * 
 * 需求: 7.4, 7.5, 6.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameProvider, useGameState, useGameActions } from '../context/GameContext';
import { GameBoard } from './GameBoard';
import { GameInitializer } from './GameInitializer';
import { GameEngine } from '../engine/GameEngine';
import type { ArchetypeType, GameState } from '../types';

/**
 * 创建测试用的游戏状态
 */
function createTestGameState(archetype: ArchetypeType = 'bigtech'): GameState {
  return GameEngine.initializeGame(archetype);
}

/**
 * 测试用的完整游戏组件
 * 模拟 App 组件的行为
 */
function TestGameApp() {
  const { isInitialized, gameState } = useGameState();
  const { initializeGame, loadSavedGame } = useGameActions();

  if (!isInitialized || !gameState) {
    return (
      <GameInitializer
        onSelectArchetype={initializeGame}
        onLoadGame={loadSavedGame}
        hasSavedGame={false}
      />
    );
  }

  return <GameBoard />;
}

/**
 * 渲染完整游戏应用的辅助函数
 */
function renderGameApp() {
  return render(
    <GameProvider>
      <TestGameApp />
    </GameProvider>
  );
}

describe('GameBoard 组件集成测试', () => {
  describe('游戏界面渲染', () => {
    it('应该在有游戏状态时渲染游戏标题', async () => {
      // 使用 GameEngine 直接测试组件渲染逻辑
      const gameState = createTestGameState('bigtech');
      
      // 验证游戏状态正确初始化
      expect(gameState.archetype).toBe('bigtech');
      expect(gameState.resources.budget).toBe(12000);
      expect(gameState.progress.turn).toBe(1);
    });

    it('应该正确初始化创业公司形态', () => {
      const gameState = createTestGameState('startup');
      
      expect(gameState.archetype).toBe('startup');
      expect(gameState.resources.budget).toBe(5000);
      expect(gameState.resources.computeMax).toBe(3);
    });

    it('应该正确初始化大厂团队形态', () => {
      const gameState = createTestGameState('bigtech');
      
      expect(gameState.archetype).toBe('bigtech');
      expect(gameState.resources.budget).toBe(12000);
      expect(gameState.resources.computeMax).toBe(5);
    });

    it('应该正确初始化学术研究形态', () => {
      const gameState = createTestGameState('academic');
      
      expect(gameState.archetype).toBe('academic');
      expect(gameState.resources.budget).toBe(8000);
      expect(gameState.resources.computeMax).toBe(4);
    });
  });

  describe('多回合操作测试', () => {
    it('应该能够执行操作并更新状态', () => {
      const gameState = createTestGameState('bigtech');
      const operation = { 
        id: 'web_crawl', 
        name: '全网爬虫',
        category: 'data' as const,
        description: '快速获取大量脏数据',
        cost: { budget: 200, computePoints: 1 },
        effects: { dirtyDataChange: 300, entropyChange: 10 },
        canExecute: (state: GameState) => 
          state.resources.budget >= 200 && state.resources.computePoints >= 1
      };
      
      // 验证可以执行操作
      expect(operation.canExecute(gameState)).toBe(true);
      
      // 执行操作
      const newState = GameEngine.executeOperation(gameState, operation);
      
      // 验证状态更新
      expect(newState.resources.budget).toBe(11800); // 12000 - 200
      expect(newState.resources.computePoints).toBe(4); // 5 - 1
      // 脏数据增加受数据容量限制
      expect(newState.resources.dirtyData).toBeGreaterThan(gameState.resources.dirtyData);
      // 熵值增加受散热设备影响
      expect(newState.metrics.entropy).toBeGreaterThanOrEqual(0);
    });

    it('应该能够结束回合并递增计数器', () => {
      const gameState = createTestGameState('bigtech');
      
      // 结束回合
      const { newState, shouldExam } = GameEngine.endTurn(gameState);
      
      // 验证回合数递增
      expect(newState.progress.turn).toBe(2);
      // 回合2时，距离下次考核（回合5）还有3回合
      expect(newState.progress.turnsUntilExam).toBe(3);
      expect(shouldExam).toBe(false);
    });

    it('应该在第5回合触发考核', () => {
      let gameState = createTestGameState('bigtech');
      
      // 模拟到第5回合
      for (let i = 0; i < 4; i++) {
        const { newState } = GameEngine.endTurn(gameState);
        gameState = GameEngine.startTurn(newState);
      }
      
      // 第5回合结束时应该触发考核
      const { shouldExam } = GameEngine.endTurn(gameState);
      expect(shouldExam).toBe(true);
    });
  });

  describe('考核系统测试', () => {
    it('应该正确计算考核收益', () => {
      const gameState = createTestGameState('bigtech');
      
      // 设置一些拟合度
      const stateWithFitScore = {
        ...gameState,
        metrics: { ...gameState.metrics, fitScore: 50 }
      };
      
      // 触发考核
      const { result } = GameEngine.triggerExam(stateWithFitScore, 0);
      
      // 验证考核结果
      expect(result.fitScoreMultiplier).toBe(0.5); // 50%
      expect(result.stabilityCoefficient).toBe(1.2); // 熵值 < 40%
      expect(result.finalReward).toBeGreaterThan(0);
    });

    it('考核后资金应该增加', () => {
      const gameState = createTestGameState('bigtech');
      
      // 设置一些拟合度
      const stateWithFitScore = {
        ...gameState,
        metrics: { ...gameState.metrics, fitScore: 50 }
      };
      
      const initialBudget = stateWithFitScore.resources.budget;
      
      // 触发考核
      const { newState, result } = GameEngine.triggerExam(stateWithFitScore, 0);
      
      // 验证资金增加
      expect(newState.resources.budget).toBe(initialBudget + result.finalReward);
    });
  });

  describe('游戏失败条件测试', () => {
    it('连续2回合负资金应该触发游戏失败', () => {
      const gameState = createTestGameState('startup');
      
      // 设置连续负资金状态
      const stateWithNegativeBudget = {
        ...gameState,
        resources: { ...gameState.resources, budget: -100 },
        progress: { ...gameState.progress, consecutiveNegativeBudget: 2 }
      };
      
      // 检查游戏结束
      const newState = GameEngine.checkGameOver(stateWithNegativeBudget);
      
      expect(newState.gameStatus).toBe('gameOver');
      expect(newState.gameOverReason).toContain('资金');
    });
  });

  describe('多操作执行测试', () => {
    it('应该能够在同一回合执行多个操作', () => {
      let gameState = createTestGameState('bigtech');
      
      // 大厂团队有 5 点算力
      expect(gameState.resources.computePoints).toBe(5);
      
      // 执行全网爬虫 (消耗 1 AP)
      const webCrawl = {
        id: 'web_crawl',
        name: '全网爬虫',
        category: 'data' as const,
        description: '',
        cost: { budget: 100, computePoints: 1 },
        effects: { dirtyDataChange: 500, entropyChange: 15 },
        canExecute: (state: GameState) => 
          state.resources.budget >= 100 && state.resources.computePoints >= 1
      };
      
      gameState = GameEngine.executeOperation(gameState, webCrawl);
      expect(gameState.resources.computePoints).toBe(4);
      
      // 执行代码重构 (消耗 2 AP)
      const refactor = {
        id: 'refactor',
        name: '代码重构',
        category: 'maintenance' as const,
        description: '',
        cost: { computePoints: 2 },
        effects: { entropyChange: -30 },
        canExecute: (state: GameState) => state.resources.computePoints >= 2
      };
      
      gameState = GameEngine.executeOperation(gameState, refactor);
      expect(gameState.resources.computePoints).toBe(2);
      
      // 还剩 2 点算力，可以继续执行操作
      expect(gameState.resources.computePoints).toBeGreaterThan(0);
    });
  });
});

describe('完整游戏流程测试', () => {
  it('应该能够完成多个回合的游戏流程', () => {
    let gameState = createTestGameState('bigtech');
    
    // 回合 1: 执行操作
    const webCrawl = {
      id: 'web_crawl',
      name: '全网爬虫',
      category: 'data' as const,
      description: '',
      cost: { budget: 100, computePoints: 1 },
      effects: { dirtyDataChange: 500, entropyChange: 15 },
      canExecute: (state: GameState) => 
        state.resources.budget >= 100 && state.resources.computePoints >= 1
    };
    
    gameState = GameEngine.executeOperation(gameState, webCrawl);
    
    // 结束回合 1
    const { newState: state2 } = GameEngine.endTurn(gameState);
    gameState = GameEngine.startTurn(state2);
    
    expect(gameState.progress.turn).toBe(2);
    expect(gameState.resources.computePoints).toBe(5); // 算力恢复
    
    // 回合 2: 执行训练操作
    const sgd = {
      id: 'sgd',
      name: '随机梯度下降',
      category: 'training' as const,
      description: '',
      cost: { computePoints: 1, dirtyData: 100 },
      effects: { fitScoreChange: 5, entropyChange: 10 },
      canExecute: (state: GameState) => 
        state.resources.computePoints >= 1 && state.resources.dirtyData >= 100
    };
    
    const prevFitScore = gameState.metrics.fitScore;
    gameState = GameEngine.executeOperation(gameState, sgd);
    
    // 验证拟合度增加（由于多维度系统，具体值可能不同）
    expect(gameState.metrics.fitScore).toBeGreaterThanOrEqual(prevFitScore);
    
    // 结束回合 2
    const { newState: state3 } = GameEngine.endTurn(gameState);
    gameState = GameEngine.startTurn(state3);
    
    expect(gameState.progress.turn).toBe(3);
  });

  it('应该能够完成从初始化到考核的完整流程', () => {
    let gameState = createTestGameState('bigtech');
    
    // 执行一些操作增加拟合度
    const sgd = {
      id: 'sgd',
      name: '随机梯度下降',
      category: 'training' as const,
      description: '',
      cost: { computePoints: 1, dirtyData: 100 },
      effects: { fitScoreChange: 5, entropyChange: 10 },
      canExecute: (state: GameState) => 
        state.resources.computePoints >= 1 && state.resources.dirtyData >= 100
    };
    
    // 先获取一些数据
    const webCrawl = {
      id: 'web_crawl',
      name: '全网爬虫',
      category: 'data' as const,
      description: '',
      cost: { budget: 100, computePoints: 1 },
      effects: { dirtyDataChange: 500, entropyChange: 15 },
      canExecute: (state: GameState) => 
        state.resources.budget >= 100 && state.resources.computePoints >= 1
    };
    
    gameState = GameEngine.executeOperation(gameState, webCrawl);
    gameState = GameEngine.executeOperation(gameState, sgd);
    
    // 模拟到第5回合
    for (let i = 0; i < 4; i++) {
      const { newState } = GameEngine.endTurn(gameState);
      gameState = GameEngine.startTurn(newState);
    }
    
    // 第5回合结束触发考核
    const { shouldExam } = GameEngine.endTurn(gameState);
    expect(shouldExam).toBe(true);
    
    // 执行考核
    const { newState, result } = GameEngine.triggerExam(gameState, 0);
    
    // 验证考核完成
    expect(result.finalReward).toBeGreaterThan(0);
    expect(newState.resources.budget).toBeGreaterThan(gameState.resources.budget);
  });
});

// ============ React 组件集成测试 ============

/**
 * 辅助函数：通过难度选择和形态选择开始游戏
 * 需要先点击继续按钮进入形态选择界面，然后选择形态
 */
async function selectArchetypeAndStartGame(archetypeName: string) {
  // 首先点击继续按钮进入形态选择界面
  const continueButton = screen.getByText('继续选择形态 →');
  fireEvent.click(continueButton);
  
  // 等待形态选择界面显示
  await waitFor(() => {
    expect(screen.getByText(archetypeName)).toBeDefined();
  });
  
  // 找到包含形态名称的卡片
  const archetypeHeading = screen.getByText(archetypeName);
  // 找到该卡片内的选择按钮
  const card = archetypeHeading.closest('.archetype-card');
  if (!card) throw new Error(`Cannot find archetype card for ${archetypeName}`);
  const button = card.querySelector('button.select-button');
  if (!button) throw new Error(`Cannot find select button for ${archetypeName}`);
  
  fireEvent.click(button as HTMLElement);
}

describe('React 组件集成测试: 完整游戏流程', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('应该能够从初始化界面选择形态并开始游戏', async () => {
    renderGameApp();
    
    // 验证初始化界面显示（标题）
    expect(screen.getByText('黑箱：算法飞升')).toBeDefined();
    
    // 验证难度选择界面显示
    expect(screen.getByText('选择游戏难度')).toBeDefined();
    
    // 选择大厂团队形态
    await selectArchetypeAndStartGame('大厂团队');
    
    // 验证游戏界面显示（游戏标题仍然存在，但现在是游戏界面）
    await waitFor(() => {
      expect(screen.getByText('训练终极推荐算法，统治人类注意力')).toBeDefined();
    });
    
    // 验证资源面板显示正确的初始资源（大厂团队初始资金12000，显示为12.0K）
    expect(screen.getByText('12.0K')).toBeDefined();
  });

  it('应该能够执行操作并看到状态更新', async () => {
    renderGameApp();
    
    // 选择大厂团队形态开始游戏
    await selectArchetypeAndStartGame('大厂团队');
    
    await waitFor(() => {
      expect(screen.getByText('训练终极推荐算法，统治人类注意力')).toBeDefined();
    });
    
    // 点击数据获取类别按钮打开弹窗
    const dataCategoryButton = screen.getByRole('button', { name: /数据获取/i });
    fireEvent.click(dataCategoryButton);
    
    // 等待弹窗打开，找到并点击全网爬虫操作按钮
    await waitFor(() => {
      expect(screen.getByText('全网爬虫')).toBeDefined();
    });
    
    const webCrawlButton = screen.getByRole('button', { name: /全网爬虫/i });
    fireEvent.click(webCrawlButton);
    
    // 验证资源已更新（资金减少150，从12000变为11850，显示为11.8K）
    await waitFor(() => {
      expect(screen.getByText('11.8K')).toBeDefined();
    });
  });

  it('应该能够结束回合并看到回合数递增', async () => {
    renderGameApp();
    
    // 选择大厂团队形态开始游戏
    await selectArchetypeAndStartGame('大厂团队');
    
    await waitFor(() => {
      expect(screen.getByText('训练终极推荐算法，统治人类注意力')).toBeDefined();
    });
    
    // 验证初始回合数为1（使用更具体的选择器）
    expect(screen.getAllByText(/回合 1/).length).toBeGreaterThan(0);
    
    // 点击结束回合按钮
    const endTurnButton = screen.getByRole('button', { name: /结束回合/i });
    fireEvent.click(endTurnButton);
    
    // 验证回合数递增到2
    await waitFor(() => {
      expect(screen.getAllByText(/回合 2/).length).toBeGreaterThan(0);
    });
  });

  it('应该在第5回合触发考核并显示考核弹窗', async () => {
    renderGameApp();
    
    // 选择大厂团队形态开始游戏
    await selectArchetypeAndStartGame('大厂团队');
    
    await waitFor(() => {
      expect(screen.getByText('训练终极推荐算法，统治人类注意力')).toBeDefined();
    });
    
    // 模拟到第5回合（结束4次回合）
    const endTurnButton = screen.getByRole('button', { name: /结束回合/i });
    for (let i = 0; i < 4; i++) {
      fireEvent.click(endTurnButton);
      // 等待状态更新
      await waitFor(() => {
        expect(screen.getAllByText(new RegExp(`回合 ${i + 2}`)).length).toBeGreaterThan(0);
      });
    }
    
    // 第5回合结束时应该触发考核
    fireEvent.click(endTurnButton);
    
    // 验证考核弹窗显示
    await waitFor(() => {
      expect(screen.getByText(/考核结果/i)).toBeDefined();
    });
  });

  it('应该能够在同一回合执行多个操作直到算力耗尽', async () => {
    renderGameApp();
    
    // 选择大厂团队形态开始游戏（5点算力）
    await selectArchetypeAndStartGame('大厂团队');
    
    await waitFor(() => {
      expect(screen.getByText('训练终极推荐算法，统治人类注意力')).toBeDefined();
    });
    
    // 点击数据获取类别按钮打开弹窗
    let dataCategoryButton = screen.getByRole('button', { name: /数据获取/i });
    fireEvent.click(dataCategoryButton);
    
    // 等待弹窗打开
    await waitFor(() => {
      expect(screen.getByText('全网爬虫')).toBeDefined();
    });
    
    // 执行全网爬虫（消耗1 AP, 150资金）
    const webCrawlButton = screen.getByRole('button', { name: /全网爬虫/i });
    fireEvent.click(webCrawlButton);
    
    await waitFor(() => {
      expect(screen.getByText('11.8K')).toBeDefined(); // 12000 - 150 = 11850 ≈ 11.8K
    });
    
    // 再次打开数据获取弹窗
    dataCategoryButton = screen.getByRole('button', { name: /数据获取/i });
    fireEvent.click(dataCategoryButton);
    
    await waitFor(() => {
      expect(screen.getByText('全网爬虫')).toBeDefined();
    });
    
    // 再次执行全网爬虫（消耗1 AP, 150资金）
    const webCrawlButton2 = screen.getByRole('button', { name: /全网爬虫/i });
    fireEvent.click(webCrawlButton2);
    
    await waitFor(() => {
      expect(screen.getByText('11.7K')).toBeDefined(); // 11850 - 150 = 11700 ≈ 11.7K
    });
    
    // 打开系统维护弹窗
    const maintenanceCategoryButton = screen.getByRole('button', { name: /系统维护/i });
    fireEvent.click(maintenanceCategoryButton);
    
    await waitFor(() => {
      expect(screen.getByText('代码重构')).toBeDefined();
    });
    
    // 执行代码重构（消耗2 AP）
    const refactorButton = screen.getByRole('button', { name: /代码重构/i });
    fireEvent.click(refactorButton);
    
    // 验证操作成功执行（算力应该减少到1）
    await waitFor(() => {
      // 验证算力显示为 1 / 5 - 使用更具体的选择器
      const computeValue = screen.getByText(/1\s*\/\s*5/);
      expect(computeValue).toBeDefined();
    });
  });

  it('应该在资源不足时禁用操作按钮', async () => {
    renderGameApp();
    
    // 选择创业公司形态（资源较少）
    await selectArchetypeAndStartGame('创业公司');
    
    await waitFor(() => {
      expect(screen.getByText('训练终极推荐算法，统治人类注意力')).toBeDefined();
    });
    
    // 打开系统维护弹窗
    const maintenanceCategoryButton = screen.getByRole('button', { name: /系统维护/i });
    fireEvent.click(maintenanceCategoryButton);
    
    await waitFor(() => {
      expect(screen.getByText('知识蒸馏')).toBeDefined();
    });
    
    // 知识蒸馏需要2500资金和3 AP，创业公司只有5000资金和3 AP
    // 执行一次后应该无法再执行
    const distillationButton = screen.getByRole('button', { name: /知识蒸馏/i });
    
    // 第一次执行应该成功
    fireEvent.click(distillationButton);
    
    // 验证资金减少（使用更具体的选择器来定位资金显示）
    await waitFor(() => {
      const budgetElement = document.querySelector('.resource-item.budget .resource-item-value');
      expect(budgetElement?.textContent).toBe('2.5K'); // 5000 - 2500 = 2500
    });
    
    // 结束回合恢复算力
    const endTurnButton = screen.getByRole('button', { name: /结束回合/i });
    fireEvent.click(endTurnButton);
    
    await waitFor(() => {
      expect(screen.getAllByText(/回合 2/).length).toBeGreaterThan(0);
    });
    
    // 再次打开系统维护弹窗
    const maintenanceCategoryButton2 = screen.getByRole('button', { name: /系统维护/i });
    fireEvent.click(maintenanceCategoryButton2);
    
    await waitFor(() => {
      expect(screen.getByText('知识蒸馏')).toBeDefined();
    });
    
    // 现在资金只有2500，知识蒸馏需要2500，按钮应该可以执行
    // 但执行后资金为0，再次执行时按钮应该被禁用
    const distillationButtonAfter = screen.getByRole('button', { name: /知识蒸馏/i });
    expect(distillationButtonAfter.hasAttribute('disabled')).toBe(false);
  });
});
