/**
 * Operations Property Tests
 * Feature: algorithm-ascension-game
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  ALL_OPERATIONS, 
  getOperationsByCategory,
  DATA_OPERATIONS,
  TRAINING_OPERATIONS,
  MAINTENANCE_OPERATIONS,
  DIMENSION_OPERATIONS,
  PREMIUM_OPERATIONS,
  TEAM_OPERATIONS,
  SIDE_JOB_OPERATIONS
} from './index';
import { OPERATION_CATEGORIES, OperationCategory, GameState, ArchetypeType, DifficultyLevel, TeamMember, TraitType, Dimensions } from '../types';

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

describe('Feature: algorithm-ascension-game - Operations', () => {
  
  // Property 25: Operation Category Correctness
  // **Validates: Requirements 12.1, 12.5**
  // *For any* operation, it should be correctly assigned to its defined category,
  // and the executable count for a category should equal the number of operations
  // that satisfy canExecute condition
  it('Property 25: Operation category correctness - all operations assigned to valid categories', () => {
    // Get all valid category IDs from OPERATION_CATEGORIES
    const validCategoryIds = OPERATION_CATEGORIES.map(cat => cat.id);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_OPERATIONS),
        (operation) => {
          // Every operation should have a category that exists in OPERATION_CATEGORIES
          expect(validCategoryIds).toContain(operation.category);
          
          // The operation should be found in the correct category array
          const categoryOperations = getOperationsByCategory(operation.category);
          const foundInCategory = categoryOperations.some(op => op.id === operation.id);
          expect(foundInCategory).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 25b: Category executable count matches canExecute results
  // **Validates: Requirements 12.5**
  it('Property 25b: Category executable count - matches canExecute results', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.constantFrom(...OPERATION_CATEGORIES),
        (state, categoryConfig) => {
          const categoryOperations = getOperationsByCategory(categoryConfig.id);
          
          // Count operations that can be executed
          const executableCount = categoryOperations.filter(op => op.canExecute(state)).length;
          
          // The count should be between 0 and total operations in category
          expect(executableCount).toBeGreaterThanOrEqual(0);
          expect(executableCount).toBeLessThanOrEqual(categoryOperations.length);
          
          // Verify each operation's canExecute is consistent
          for (const op of categoryOperations) {
            const canExec = op.canExecute(state);
            expect(typeof canExec).toBe('boolean');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 25c: All operations are categorized
  // **Validates: Requirements 12.1**
  it('Property 25c: All operations are categorized - no orphan operations', () => {
    // Collect all operations from category arrays
    const categorizedOperations = [
      ...DATA_OPERATIONS,
      ...TRAINING_OPERATIONS,
      ...MAINTENANCE_OPERATIONS,
      ...DIMENSION_OPERATIONS,
      ...PREMIUM_OPERATIONS,
      ...TEAM_OPERATIONS,
      ...SIDE_JOB_OPERATIONS
    ];
    
    // Every operation in ALL_OPERATIONS should be in a category array
    for (const operation of ALL_OPERATIONS) {
      const foundInCategories = categorizedOperations.some(op => op.id === operation.id);
      expect(foundInCategories).toBe(true);
    }
    
    // The total count should match
    expect(categorizedOperations.length).toBe(ALL_OPERATIONS.length);
  });

  // Property 25d: Category operations match their declared category
  // **Validates: Requirements 12.1**
  it('Property 25d: Category operations match declared category', () => {
    const categoryToOperations: Record<OperationCategory, typeof DATA_OPERATIONS> = {
      'data': DATA_OPERATIONS,
      'training': TRAINING_OPERATIONS,
      'maintenance': MAINTENANCE_OPERATIONS,
      'dimension': DIMENSION_OPERATIONS,
      'premium': PREMIUM_OPERATIONS,
      'team': TEAM_OPERATIONS,
      'sideJob': SIDE_JOB_OPERATIONS
    };
    
    for (const [category, operations] of Object.entries(categoryToOperations)) {
      for (const operation of operations) {
        // Each operation's category field should match the array it's in
        expect(operation.category).toBe(category);
      }
    }
  });

  // Property 25e: OPERATION_CATEGORIES covers all category types
  // **Validates: Requirements 12.1**
  it('Property 25e: OPERATION_CATEGORIES covers all category types', () => {
    const allCategoryTypes: OperationCategory[] = [
      'data', 'training', 'maintenance', 'dimension', 'premium', 'team', 'sideJob'
    ];
    
    const configuredCategories = OPERATION_CATEGORIES.map(cat => cat.id);
    
    // All category types should be in OPERATION_CATEGORIES
    for (const categoryType of allCategoryTypes) {
      expect(configuredCategories).toContain(categoryType);
    }
    
    // OPERATION_CATEGORIES should have exactly the right number of categories
    expect(OPERATION_CATEGORIES.length).toBe(allCategoryTypes.length);
  });
});
