/**
 * StorageManager 测试
 * Feature: algorithm-ascension-game
 * 
 * 属性 20: 游戏状态序列化往返
 * 验证: 需求 9.1, 9.2
 * 
 * 单元测试: LocalStorage 集成
 * 验证: 需求 9.3, 9.4
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { 
  exportSave, 
  importSave, 
  saveGame, 
  loadGame, 
  hasSavedGame, 
  deleteSave 
} from './StorageManager';
import type { GameState, ArchetypeType, EquipmentState } from '../types';

// ============ 测试数据生成器 ============

/**
 * 生成有效的初始形态类型
 */
const arbitraryArchetype = (): fc.Arbitrary<ArchetypeType> =>
  fc.constantFrom('startup', 'bigtech', 'academic');

/**
 * 生成有效的设备状态
 */
const arbitraryEquipment = (): fc.Arbitrary<EquipmentState> =>
  fc.record({
    gpu: fc.record({
      type: fc.constant('gpu' as const),
      level: fc.integer({ min: 1, max: 4 }),
      maxLevel: fc.constant(4),
    }),
    storage: fc.record({
      type: fc.constant('storage' as const),
      level: fc.integer({ min: 1, max: 4 }),
      maxLevel: fc.constant(4),
    }),
    network: fc.record({
      type: fc.constant('network' as const),
      level: fc.integer({ min: 1, max: 4 }),
      maxLevel: fc.constant(4),
    }),
    cooling: fc.record({
      type: fc.constant('cooling' as const),
      level: fc.integer({ min: 1, max: 4 }),
      maxLevel: fc.constant(4),
    }),
  });

/**
 * 生成有效的游戏状态
 * 用于属性测试的游戏状态生成器
 */
const arbitraryGameState = (): fc.Arbitrary<GameState> =>
  fc.record({
    resources: fc.record({
      budget: fc.integer({ min: -5000, max: 50000 }),
      computePoints: fc.integer({ min: 0, max: 10 }),
      computeMax: fc.integer({ min: 3, max: 10 }),
      dirtyData: fc.integer({ min: 0, max: 10000 }),
      goldenData: fc.integer({ min: 0, max: 5000 }),
      dataCapacity: fc.integer({ min: 1000, max: 5000 }),
    }),
    metrics: fc.record({
      fitScore: fc.integer({ min: 0, max: 100 }),
      entropy: fc.integer({ min: 0, max: 100 }),
      fitScoreCap: fc.integer({ min: 50, max: 100 }),
      accuracy: fc.integer({ min: 0, max: 100 }),
      speed: fc.integer({ min: 0, max: 100 }),
      creativity: fc.integer({ min: 0, max: 100 }),
      robustness: fc.integer({ min: 0, max: 100 }),
    }),
    progress: fc.record({
      turn: fc.integer({ min: 1, max: 100 }),
      turnsUntilExam: fc.integer({ min: 0, max: 7 }),
      consecutiveNegativeBudget: fc.integer({ min: 0, max: 3 }),
      examsPassed: fc.integer({ min: 0, max: 20 }),
      sideJobsThisTurn: fc.integer({ min: 0, max: 2 }),
    }),
    risks: fc.record({
      legalRisk: fc.integer({ min: 0, max: 100 }),
      serverMeltdown: fc.boolean(),
    }),
    equipment: arbitraryEquipment(),
    dimensions: fc.record({
      algorithm: fc.integer({ min: 0, max: 100 }),
      dataProcessing: fc.integer({ min: 0, max: 100 }),
      stability: fc.integer({ min: 0, max: 100 }),
      userExperience: fc.integer({ min: 0, max: 100 }),
    }),
    difficulty: fc.constantFrom('easy', 'normal', 'hard', 'nightmare') as fc.Arbitrary<'easy' | 'normal' | 'hard' | 'nightmare'>,
    reputation: fc.integer({ min: 0, max: 100 }),
    team: fc.constant([]),
    hiringPool: fc.constant([]),
    archetype: arbitraryArchetype(),
    gameStatus: fc.constantFrom('playing', 'gameOver', 'victory'),
    gameOverReason: fc.option(fc.string(), { nil: undefined }),
    version: fc.constant('2.0.0'),
  });

// ============ 属性测试 ============

describe('Feature: algorithm-ascension-game', () => {
  /**
   * 属性 20: 游戏状态序列化往返
   * 对于任意有效的游戏状态，序列化为JSON后再反序列化应产生等价的游戏状态对象。
   * 验证: 需求 9.1, 9.2
   */
  it('Property 20: 游戏状态序列化往返 - 序列化后反序列化应产生等价对象', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // 序列化游戏状态
          const serialized = exportSave(state);
          
          // 验证序列化成功
          expect(serialized).not.toBeNull();
          
          // 反序列化游戏状态
          const result = importSave(serialized!);
          
          // 验证反序列化成功
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          
          // 验证反序列化后的状态与原状态等价
          const deserialized = result.data!;
          
          // 验证资源字段
          expect(deserialized.resources.budget).toBe(state.resources.budget);
          expect(deserialized.resources.computePoints).toBe(state.resources.computePoints);
          expect(deserialized.resources.computeMax).toBe(state.resources.computeMax);
          expect(deserialized.resources.dirtyData).toBe(state.resources.dirtyData);
          expect(deserialized.resources.goldenData).toBe(state.resources.goldenData);
          
          // 验证指标字段
          expect(deserialized.metrics.fitScore).toBe(state.metrics.fitScore);
          expect(deserialized.metrics.entropy).toBe(state.metrics.entropy);
          expect(deserialized.metrics.fitScoreCap).toBe(state.metrics.fitScoreCap);
          
          // 验证进度字段
          expect(deserialized.progress.turn).toBe(state.progress.turn);
          expect(deserialized.progress.turnsUntilExam).toBe(state.progress.turnsUntilExam);
          expect(deserialized.progress.consecutiveNegativeBudget).toBe(state.progress.consecutiveNegativeBudget);
          
          // 验证风险字段
          expect(deserialized.risks.legalRisk).toBe(state.risks.legalRisk);
          expect(deserialized.risks.serverMeltdown).toBe(state.risks.serverMeltdown);
          
          // 验证其他字段
          expect(deserialized.archetype).toBe(state.archetype);
          expect(deserialized.gameStatus).toBe(state.gameStatus);
          expect(deserialized.gameOverReason).toBe(state.gameOverReason);
        }
      ),
      { numRuns: 20 }
    );
  });
});


// ============ 单元测试: LocalStorage 集成 ============
// 验证: 需求 9.3, 9.4

/**
 * 创建有效的测试游戏状态
 */
function createValidGameState(): GameState {
  return {
    resources: {
      budget: 5000,
      computePoints: 3,
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
    progress: {
      turn: 5,
      turnsUntilExam: 2,
      consecutiveNegativeBudget: 0,
      examsPassed: 0,
      sideJobsThisTurn: 0,
    },
    risks: {
      legalRisk: 20,
      serverMeltdown: false,
    },
    equipment: {
      gpu: { type: 'gpu', level: 1, maxLevel: 4 },
      storage: { type: 'storage', level: 1, maxLevel: 4 },
      network: { type: 'network', level: 1, maxLevel: 4 },
      cooling: { type: 'cooling', level: 1, maxLevel: 4 },
    },
    dimensions: {
      algorithm: 20,
      dataProcessing: 20,
      stability: 20,
      userExperience: 20,
    },
    difficulty: 'normal',
    reputation: 0,
    team: [],
    hiringPool: [],
    archetype: 'bigtech',
    gameStatus: 'playing',
    version: '2.0.0',
  };
}

describe('LocalStorage 集成测试', () => {
  // 每个测试前清理 localStorage
  beforeEach(() => {
    localStorage.clear();
  });

  describe('保存和加载功能', () => {
    it('应该成功保存游戏状态到 LocalStorage', () => {
      const state = createValidGameState();
      
      const result = saveGame(state);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      
      // 验证数据确实存储到了 localStorage
      const stored = localStorage.getItem('algorithm_ascension_save');
      expect(stored).not.toBeNull();
    });

    it('应该成功从 LocalStorage 加载游戏状态', () => {
      const state = createValidGameState();
      saveGame(state);
      
      const result = loadGame();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.resources.budget).toBe(5000);
      expect(result.data?.archetype).toBe('bigtech');
      expect(result.data?.gameStatus).toBe('playing');
    });

    it('保存后加载应该返回等价的游戏状态', () => {
      const originalState = createValidGameState();
      originalState.gameOverReason = '测试原因';
      
      saveGame(originalState);
      const result = loadGame();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(originalState);
    });

    it('hasSavedGame 应该正确检测存档存在', () => {
      expect(hasSavedGame()).toBe(false);
      
      saveGame(createValidGameState());
      
      expect(hasSavedGame()).toBe(true);
    });

    it('deleteSave 应该成功删除存档', () => {
      saveGame(createValidGameState());
      expect(hasSavedGame()).toBe(true);
      
      const result = deleteSave();
      
      expect(result.success).toBe(true);
      expect(hasSavedGame()).toBe(false);
    });
  });

  describe('错误处理 - 存档损坏', () => {
    it('加载不存在的存档应该返回错误', () => {
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('没有找到存档');
    });

    it('加载无效 JSON 格式的存档应该返回错误', () => {
      localStorage.setItem('algorithm_ascension_save', 'invalid json {{{');
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('加载游戏失败');
    });

    it('加载缺少必需字段的存档应该返回错误', () => {
      const incompleteState = {
        resources: { budget: 1000 },
        // 缺少其他必需字段
      };
      localStorage.setItem('algorithm_ascension_save', JSON.stringify(incompleteState));
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('存档损坏，数据格式无效');
    });

    it('加载字段类型错误的存档应该返回错误', () => {
      const invalidState = {
        resources: {
          budget: 'not a number', // 应该是 number
          computePoints: 3,
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
        progress: {
          turn: 5,
          turnsUntilExam: 2,
          consecutiveNegativeBudget: 0,
        },
        risks: {
          legalRisk: 20,
          serverMeltdown: false,
        },
        equipment: {
          gpu: { type: 'gpu', level: 1, maxLevel: 4 },
          storage: { type: 'storage', level: 1, maxLevel: 4 },
          network: { type: 'network', level: 1, maxLevel: 4 },
          cooling: { type: 'cooling', level: 1, maxLevel: 4 },
        },
        archetype: 'bigtech',
        gameStatus: 'playing',
      };
      localStorage.setItem('algorithm_ascension_save', JSON.stringify(invalidState));
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('存档损坏，数据格式无效');
    });

    it('加载无效 archetype 值的存档应该返回错误', () => {
      const invalidState = createValidGameState();
      (invalidState as unknown as { archetype: string }).archetype = 'invalid_archetype';
      localStorage.setItem('algorithm_ascension_save', JSON.stringify(invalidState));
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('存档损坏，数据格式无效');
    });

    it('加载无效 gameStatus 值的存档应该返回错误', () => {
      const invalidState = createValidGameState();
      (invalidState as unknown as { gameStatus: string }).gameStatus = 'invalid_status';
      localStorage.setItem('algorithm_ascension_save', JSON.stringify(invalidState));
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('存档损坏，数据格式无效');
    });

    it('hasSavedGame 对损坏的存档应该返回 false', () => {
      localStorage.setItem('algorithm_ascension_save', 'corrupted data');
      
      expect(hasSavedGame()).toBe(false);
    });

    it('importSave 对无效 JSON 应该返回错误', () => {
      const result = importSave('not valid json');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('导入存档失败');
    });

    it('importSave 对缺少字段的数据应该返回错误', () => {
      const result = importSave(JSON.stringify({ resources: {} }));
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('导入的存档格式无效');
    });
  });
});
