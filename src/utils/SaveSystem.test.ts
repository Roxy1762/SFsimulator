/**
 * SaveSystem Property Tests
 * Feature: algorithm-ascension-game
 * 
 * Property 38: 存档导出导入往返
 * **Validates: Requirements 22.1, 22.4, 22.5, 22.7**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { SaveSystem, CURRENT_SAVE_VERSION } from './SaveSystem';
import type { GameState, ArchetypeType, DifficultyLevel, TeamMember, TraitType, Dimensions } from '../types';

// ============ Test Data Generators ============

const arbitraryArchetype = (): fc.Arbitrary<ArchetypeType> =>
  fc.constantFrom('startup', 'bigtech', 'academic');

const arbitraryDifficulty = (): fc.Arbitrary<DifficultyLevel> =>
  fc.constantFrom('easy', 'normal', 'hard', 'nightmare');

const arbitraryTraitType = (): fc.Arbitrary<TraitType> =>
  fc.constantFrom(
    'algorithm_expert', 'data_engineer', 'architect', 'product_manager',
    'fullstack', 'efficiency', 'cost_control', 'data_mining'
  );

const arbitraryRarity = (): fc.Arbitrary<'common' | 'rare' | 'epic' | 'legendary'> =>
  fc.constantFrom('common', 'rare', 'epic', 'legendary');

const arbitraryBaseStats = () =>
  fc.record({
    computeContribution: fc.integer({ min: 3, max: 20 }),
    dataEfficiency: fc.integer({ min: 3, max: 20 }),
    maintenanceSkill: fc.integer({ min: 3, max: 20 }),
  });

const arbitraryTeamMember = (): fc.Arbitrary<TeamMember> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 10 }),
    rarity: arbitraryRarity(),
    baseStats: arbitraryBaseStats(),
    traits: fc.array(arbitraryTraitType(), { minLength: 0, maxLength: 3 }),
    level: fc.integer({ min: 1, max: 5 }),
    experience: fc.integer({ min: 0, max: 1000 }),
    hiringCost: fc.integer({ min: 600, max: 5000 }),
    salary: fc.integer({ min: 200, max: 1000 }),
  });

const arbitraryDimensions = (): fc.Arbitrary<Dimensions> =>
  fc.record({
    algorithm: fc.integer({ min: 0, max: 100 }),
    dataProcessing: fc.integer({ min: 0, max: 100 }),
    stability: fc.integer({ min: 0, max: 100 }),
    userExperience: fc.integer({ min: 0, max: 100 }),
  });

const arbitraryEquipment = () =>
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
    dimensions: arbitraryDimensions(),
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
    archetype: arbitraryArchetype(),
    difficulty: arbitraryDifficulty(),
    reputation: fc.integer({ min: 0, max: 100 }),
    team: fc.array(arbitraryTeamMember(), { minLength: 0, maxLength: 5 }),
    hiringPool: fc.array(arbitraryTeamMember(), { minLength: 0, maxLength: 3 }),
    gameStatus: fc.constantFrom('playing', 'gameOver', 'victory'),
    gameOverReason: fc.option(fc.string(), { nil: undefined }),
    version: fc.option(fc.string(), { nil: undefined }),
  });

// ============ Property Tests ============

describe('Feature: algorithm-ascension-game - SaveSystem', () => {
  // Property 38: Save Export/Import Round Trip
  // **Validates: Requirements 22.1, 22.4, 22.5, 22.7**
  // *For any* valid game state, exporting to Base64 string and then importing
  // should produce an equivalent game state, and the export should contain a version number
  it('Property 38: Save export/import round trip - state preserved after export and import', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Export the state to Base64
          const exported = SaveSystem.exportSave(state);
          
          // Export should succeed and return a non-null string
          expect(exported).not.toBeNull();
          expect(typeof exported).toBe('string');
          expect(exported!.length).toBeGreaterThan(0);
          
          // Import the exported string
          const importResult = SaveSystem.importSave(exported!);
          
          // Import should succeed
          expect(importResult.success).toBe(true);
          expect(importResult.state).toBeDefined();
          expect(importResult.error).toBeUndefined();
          
          const importedState = importResult.state!;
          
          // The imported state should have the current version
          expect(importedState.version).toBe(CURRENT_SAVE_VERSION);
          
          // Core game state should be preserved
          // Resources
          expect(importedState.resources.budget).toBe(state.resources.budget);
          expect(importedState.resources.computePoints).toBe(state.resources.computePoints);
          expect(importedState.resources.computeMax).toBe(state.resources.computeMax);
          expect(importedState.resources.dirtyData).toBe(state.resources.dirtyData);
          expect(importedState.resources.goldenData).toBe(state.resources.goldenData);
          expect(importedState.resources.dataCapacity).toBe(state.resources.dataCapacity);
          
          // Metrics
          expect(importedState.metrics.fitScore).toBe(state.metrics.fitScore);
          expect(importedState.metrics.entropy).toBe(state.metrics.entropy);
          expect(importedState.metrics.fitScoreCap).toBe(state.metrics.fitScoreCap);
          expect(importedState.metrics.accuracy).toBe(state.metrics.accuracy);
          expect(importedState.metrics.speed).toBe(state.metrics.speed);
          expect(importedState.metrics.creativity).toBe(state.metrics.creativity);
          expect(importedState.metrics.robustness).toBe(state.metrics.robustness);
          
          // Dimensions
          expect(importedState.dimensions.algorithm).toBe(state.dimensions.algorithm);
          expect(importedState.dimensions.dataProcessing).toBe(state.dimensions.dataProcessing);
          expect(importedState.dimensions.stability).toBe(state.dimensions.stability);
          expect(importedState.dimensions.userExperience).toBe(state.dimensions.userExperience);
          
          // Progress
          expect(importedState.progress.turn).toBe(state.progress.turn);
          expect(importedState.progress.turnsUntilExam).toBe(state.progress.turnsUntilExam);
          expect(importedState.progress.consecutiveNegativeBudget).toBe(state.progress.consecutiveNegativeBudget);
          expect(importedState.progress.examsPassed).toBe(state.progress.examsPassed);
          expect(importedState.progress.sideJobsThisTurn).toBe(state.progress.sideJobsThisTurn);
          
          // Risks
          expect(importedState.risks.legalRisk).toBe(state.risks.legalRisk);
          expect(importedState.risks.serverMeltdown).toBe(state.risks.serverMeltdown);
          
          // Equipment
          expect(importedState.equipment.gpu.level).toBe(state.equipment.gpu.level);
          expect(importedState.equipment.storage.level).toBe(state.equipment.storage.level);
          expect(importedState.equipment.network.level).toBe(state.equipment.network.level);
          expect(importedState.equipment.cooling.level).toBe(state.equipment.cooling.level);
          
          // Archetype and difficulty
          expect(importedState.archetype).toBe(state.archetype);
          expect(importedState.difficulty).toBe(state.difficulty);
          
          // Reputation
          expect(importedState.reputation).toBe(state.reputation);
          
          // Team
          expect(importedState.team.length).toBe(state.team.length);
          for (let i = 0; i < state.team.length; i++) {
            expect(importedState.team[i].id).toBe(state.team[i].id);
            expect(importedState.team[i].name).toBe(state.team[i].name);
            expect(importedState.team[i].level).toBe(state.team[i].level);
            expect(importedState.team[i].experience).toBe(state.team[i].experience);
            expect(importedState.team[i].hiringCost).toBe(state.team[i].hiringCost);
            expect(importedState.team[i].traits).toEqual(state.team[i].traits);
          }
          
          // Hiring pool
          expect(importedState.hiringPool.length).toBe(state.hiringPool.length);
          
          // Game status
          expect(importedState.gameStatus).toBe(state.gameStatus);
          expect(importedState.gameOverReason).toBe(state.gameOverReason);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 38b: Export contains version number
  // **Validates: Requirements 22.7**
  it('Property 38b: Export contains version number', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const exported = SaveSystem.exportSave(state);
          expect(exported).not.toBeNull();
          
          // Decode using TextDecoder (new format)
          const binaryString = atob(exported!);
          const uint8Array = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
          }
          const decoder = new TextDecoder();
          const json = decoder.decode(uint8Array);
          const saveData = JSON.parse(json);
          
          expect(saveData.version).toBe(CURRENT_SAVE_VERSION);
          expect(saveData.timestamp).toBeDefined();
          expect(typeof saveData.timestamp).toBe('number');
          expect(saveData.state).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 38c: isValidSave correctly identifies valid saves
  // **Validates: Requirements 22.5, 22.6**
  it('Property 38c: isValidSave correctly identifies valid saves', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const exported = SaveSystem.exportSave(state);
          expect(exported).not.toBeNull();
          
          // Valid export should be recognized as valid
          expect(SaveSystem.isValidSave(exported!)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============ Helper function for encoding test data ============

function encodeTestData(data: unknown): string {
  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(json);
  const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString);
}

// ============ Unit Tests for Invalid Input Handling ============

describe('SaveSystem - Invalid Input Handling', () => {
  it('should return error for empty string', () => {
    const result = SaveSystem.importSave('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for invalid Base64', () => {
    const result = SaveSystem.importSave('not-valid-base64!!!');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Base64');
  });

  it('should return error for valid Base64 but invalid JSON', () => {
    const invalidJson = encodeTestData('not json').slice(0, -5) + 'XXXXX'; // Corrupt the data
    const result = SaveSystem.importSave(invalidJson);
    expect(result.success).toBe(false);
    expect(result.error).toContain('JSON');
  });

  it('should return error for valid JSON but missing version', () => {
    const noVersion = encodeTestData({ state: {} });
    const result = SaveSystem.importSave(noVersion);
    expect(result.success).toBe(false);
    expect(result.error).toContain('版本号');
  });

  it('should return error for valid JSON but missing state', () => {
    const noState = encodeTestData({ version: '1.0.0' });
    const result = SaveSystem.importSave(noState);
    expect(result.success).toBe(false);
    expect(result.error).toContain('游戏状态');
  });

  it('should return error for incomplete game state', () => {
    const incompleteState = encodeTestData({
      version: '1.0.0',
      state: {
        resources: { budget: 1000 },
        // Missing other required fields
      }
    });
    const result = SaveSystem.importSave(incompleteState);
    expect(result.success).toBe(false);
    expect(result.error).toContain('不完整');
  });

  it('should return null for invalid state in exportSave', () => {
    const invalidState = { resources: {} } as unknown as GameState;
    const result = SaveSystem.exportSave(invalidState);
    expect(result).toBeNull();
  });

  it('should return false for invalid save in isValidSave', () => {
    expect(SaveSystem.isValidSave('')).toBe(false);
    expect(SaveSystem.isValidSave('invalid')).toBe(false);
  });

  it('should return current version from getCurrentVersion', () => {
    expect(SaveSystem.getCurrentVersion()).toBe(CURRENT_SAVE_VERSION);
  });
});
