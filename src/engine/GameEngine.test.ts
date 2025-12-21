/**
 * Game Engine Property Tests
 * Feature: algorithm-ascension-game
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { GameEngine } from './GameEngine';
import { WebCrawl, DataCleaning, BuyPrivateData, Refactor, Distillation, AlgorithmResearch, DataEngineering, ArchitectureOptimization, UserResearch, BuyTrainingCourse, TechSummit, Freelance, TechConsulting, TechBlog } from '../operations';
import type { GameState, Operation, ArchetypeType, DifficultyLevel, TeamMember, TraitType, Dimensions, DimensionType } from '../types';
import { clampDimension, DIFFICULTY_CONFIGS } from '../types';

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

const arbitraryOperation = (): fc.Arbitrary<Operation> =>
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    category: fc.constantFrom('data', 'training', 'maintenance'),
    description: fc.string({ minLength: 0, maxLength: 100 }),
    cost: fc.record({
      budget: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
      computePoints: fc.integer({ min: 0, max: 5 }),
      dirtyData: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
      goldenData: fc.option(fc.integer({ min: 0, max: 500 }), { nil: undefined }),
    }),
    effects: fc.record({
      budgetChange: fc.option(fc.integer({ min: -5000, max: 5000 }), { nil: undefined }),
      dirtyDataChange: fc.option(fc.integer({ min: -500, max: 500 }), { nil: undefined }),
      goldenDataChange: fc.option(fc.integer({ min: -300, max: 300 }), { nil: undefined }),
      fitScoreChange: fc.option(fc.integer({ min: -30, max: 30 }), { nil: undefined }),
      entropyChange: fc.option(fc.integer({ min: -30, max: 30 }), { nil: undefined }),
      legalRiskChange: fc.option(fc.integer({ min: 0, max: 20 }), { nil: undefined }),
      fitScoreCapChange: fc.option(fc.integer({ min: -10, max: 0 }), { nil: undefined }),
    }),
    canExecute: fc.constant((_state: GameState) => true),
  });


// ============ Property Tests ============

describe('Feature: algorithm-ascension-game', () => {
  // Property 4: Operation Resource Validation
  it('Property 4: Operation resource validation - insufficient resources rejected', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.record({
          budget: fc.integer({ min: 0, max: 5000 }),
          computePoints: fc.integer({ min: 0, max: 5 }),
          dirtyData: fc.integer({ min: 0, max: 1000 }),
          goldenData: fc.integer({ min: 0, max: 500 }),
        }),
        (state, cost) => {
          const operation: Operation = {
            id: 'test_op',
            name: 'Test Operation',
            category: 'data',
            description: 'Test',
            cost: {
              budget: cost.budget,
              computePoints: cost.computePoints,
              dirtyData: cost.dirtyData,
              goldenData: cost.goldenData,
            },
            effects: {},
            // canExecute returns true to test only resource validation
            canExecute: () => true,
          };

          const canExecute = GameEngine.canExecuteOperation(state, operation);
          const expectedCanExecute =
            state.resources.budget >= cost.budget &&
            state.resources.computePoints >= cost.computePoints &&
            state.resources.dirtyData >= cost.dirtyData &&
            state.resources.goldenData >= cost.goldenData;

          expect(canExecute).toBe(expectedCanExecute);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 1: Resource Range Invariant
  it('Property 1: Resource range invariant - fitScore and entropy stay in 0-100', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        arbitraryOperation(),
        (state, operation) => {
          const validState: GameState = {
            ...state,
            metrics: {
              ...state.metrics,
              fitScore: Math.max(0, Math.min(100, state.metrics.fitScore)),
              entropy: Math.max(0, Math.min(100, state.metrics.entropy)),
              fitScoreCap: Math.max(0, Math.min(100, state.metrics.fitScoreCap)),
            },
            resources: {
              ...state.resources,
              computePoints: Math.max(0, state.resources.computePoints),
            },
          };

          const newState = GameEngine.executeOperation(validState, operation);

          expect(newState.metrics.fitScore).toBeGreaterThanOrEqual(0);
          expect(newState.metrics.fitScore).toBeLessThanOrEqual(100);
          expect(newState.metrics.entropy).toBeGreaterThanOrEqual(0);
          expect(newState.metrics.entropy).toBeLessThanOrEqual(100);
          expect(newState.resources.computePoints).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 2: Turn Start Compute Restore
  it('Property 2: Turn start compute restore - computePoints restored to max', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              computeMax: Math.max(1, state.resources.computeMax),
            },
          };

          const newState = GameEngine.restoreComputePoints(validState);
          expect(newState.resources.computePoints).toBe(validState.resources.computeMax);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 18: Turn End Increments Counter
  it('Property 18: Turn end increments counter - turn number increases by 1', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            progress: {
              ...state.progress,
              turn: Math.max(1, state.progress.turn),
            },
          };

          const originalTurn = validState.progress.turn;
          const { newState } = GameEngine.endTurn(validState);
          expect(newState.progress.turn).toBe(originalTurn + 1);
        }
      ),
      { numRuns: 20 }
    );
  });


  // Property 5: Web Crawl Operation Effects
  it('Property 5: Web crawl operation effects - correct resource changes', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(150, state.resources.budget),
              computePoints: Math.max(1, state.resources.computePoints),
            },
            metrics: {
              ...state.metrics,
              entropy: Math.min(85, Math.max(0, state.metrics.entropy)),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalComputePoints = validState.resources.computePoints;
          const originalDirtyData = validState.resources.dirtyData;
          const originalEntropy = validState.metrics.entropy;

          const newState = GameEngine.executeOperation(validState, WebCrawl);

          expect(newState.resources.budget).toBe(originalBudget - 150);
          expect(newState.resources.computePoints).toBe(originalComputePoints - 1);
          // 脏数据增加 350，但受数据容量限制
          const expectedDirtyData = Math.min(validState.resources.dataCapacity, originalDirtyData + 350);
          expect(newState.resources.dirtyData).toBe(expectedDirtyData);
          // 熵值增加 8，但受散热设备影响
          expect(newState.metrics.entropy).toBeGreaterThanOrEqual(originalEntropy);
          expect(newState.metrics.entropy).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 6: Data Cleaning Operation Effects
  it('Property 6: Data cleaning operation effects - correct resource changes', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(400, state.resources.budget),
              computePoints: Math.max(2, state.resources.computePoints),
              dirtyData: Math.max(250, state.resources.dirtyData),
            },
            metrics: {
              ...state.metrics,
              entropy: Math.max(5, Math.min(100, state.metrics.entropy)),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalComputePoints = validState.resources.computePoints;
          const originalDirtyData = validState.resources.dirtyData;
          const originalGoldenData = validState.resources.goldenData;
          const originalEntropy = validState.metrics.entropy;

          const newState = GameEngine.executeOperation(validState, DataCleaning);

          expect(newState.resources.budget).toBe(originalBudget - 400);
          expect(newState.resources.computePoints).toBe(originalComputePoints - 2);
          expect(newState.resources.dirtyData).toBe(originalDirtyData - 250);
          expect(newState.resources.goldenData).toBe(originalGoldenData + 180);
          expect(newState.metrics.entropy).toBeLessThanOrEqual(originalEntropy);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 7: Buy Private Data Operation Effects
  it('Property 7: Buy private data operation effects - correct resource changes', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(1200, state.resources.budget),
            },
            risks: {
              ...state.risks,
              legalRisk: Math.min(85, Math.max(0, state.risks.legalRisk)),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalGoldenData = validState.resources.goldenData;
          const originalLegalRisk = validState.risks.legalRisk;

          const newState = GameEngine.executeOperation(validState, BuyPrivateData);

          expect(newState.resources.budget).toBe(originalBudget - 1200);
          expect(newState.resources.goldenData).toBe(originalGoldenData + 220);
          expect(newState.risks.legalRisk).toBe(Math.min(100, originalLegalRisk + 12));
        }
      ),
      { numRuns: 20 }
    );
  });


  // Property 11: Refactor Operation Effects
  it('Property 11: Refactor operation effects - entropy decreases', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              computePoints: Math.max(2, state.resources.computePoints),
            },
            metrics: {
              ...state.metrics,
              entropy: Math.max(20, Math.min(100, state.metrics.entropy)),
            },
          };

          const originalComputePoints = validState.resources.computePoints;
          const originalEntropy = validState.metrics.entropy;

          const newState = GameEngine.executeOperation(validState, Refactor);

          expect(newState.resources.computePoints).toBe(originalComputePoints - 2);
          expect(newState.metrics.entropy).toBeLessThan(originalEntropy);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 12: Distillation Operation Effects
  it('Property 12: Distillation operation effects - entropy to zero, fitScoreCap reduced', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(2500, state.resources.budget),
              computePoints: Math.max(3, state.resources.computePoints),
            },
            metrics: {
              ...state.metrics,
              entropy: Math.max(0, Math.min(100, state.metrics.entropy)),
              fitScoreCap: Math.max(10, Math.min(100, state.metrics.fitScoreCap)),
              fitScore: Math.min(state.metrics.fitScore, state.metrics.fitScoreCap),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalComputePoints = validState.resources.computePoints;
          const originalFitScoreCap = validState.metrics.fitScoreCap;

          const newState = GameEngine.executeOperation(validState, Distillation);

          expect(newState.resources.budget).toBe(originalBudget - 2500);
          expect(newState.resources.computePoints).toBe(originalComputePoints - 3);
          expect(newState.metrics.entropy).toBe(0);
          expect(newState.metrics.fitScoreCap).toBe(Math.max(0, originalFitScoreCap - 2));
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 13: FitScore Cap Constraint
  it('Property 13: FitScore cap constraint - fitScore never exceeds cap', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        arbitraryOperation(),
        (state, operation) => {
          const validState: GameState = {
            ...state,
            metrics: {
              ...state.metrics,
              fitScore: Math.min(state.metrics.fitScore, state.metrics.fitScoreCap),
              fitScoreCap: Math.max(0, Math.min(100, state.metrics.fitScoreCap)),
            },
          };

          const newState = GameEngine.executeOperation(validState, operation);
          expect(newState.metrics.fitScore).toBeLessThanOrEqual(newState.metrics.fitScoreCap);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 14: Exam Cycle Trigger
  it('Property 14: Exam cycle trigger - exam triggers every 5 turns', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (turnNumber) => {
          const state = GameEngine.initializeGame('bigtech');
          const stateAtTurn: GameState = {
            ...state,
            progress: {
              ...state.progress,
              turn: turnNumber,
              turnsUntilExam: turnNumber % 5 === 0 ? 0 : 5 - (turnNumber % 5),
            },
          };

          // 检查当前回合是否应该触发考核（回合数是5的倍数）
          const shouldTriggerExam = GameEngine.shouldTriggerExam(stateAtTurn.progress.turn);
          const { shouldExam } = GameEngine.endTurn(stateAtTurn);

          // endTurn 返回的 shouldExam 应该与 shouldTriggerExam 一致
          expect(shouldExam).toBe(shouldTriggerExam);
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 15: Equipment Upgrade
  it('Property 15: Equipment upgrade - level increases and budget decreases', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('gpu', 'storage', 'network', 'cooling'),
        (equipmentType) => {
          const state = GameEngine.initializeGame('bigtech');
          const richState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: 50000,
            },
          };

          const originalLevel = richState.equipment[equipmentType as keyof typeof richState.equipment].level;
          const originalBudget = richState.resources.budget;

          if (GameEngine.canUpgradeEquipment(richState, equipmentType as 'gpu' | 'storage' | 'network' | 'cooling')) {
            const newState = GameEngine.upgradeEquipment(richState, equipmentType as 'gpu' | 'storage' | 'network' | 'cooling');
            
            expect(newState.equipment[equipmentType as keyof typeof newState.equipment].level).toBe(originalLevel + 1);
            expect(newState.resources.budget).toBeLessThan(originalBudget);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  // Property 26: Dimension Range Invariant
  // **Validates: Requirements 13.2**
  // *For any* dimension value, the clampDimension function should ensure it stays within 0-100 range
  it('Property 26: Dimension range invariant - all dimensions stay in 0-100 range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        (value) => {
          const clamped = clampDimension(value);
          
          // The clamped value should always be within 0-100
          expect(clamped).toBeGreaterThanOrEqual(0);
          expect(clamped).toBeLessThanOrEqual(100);
          
          // If the original value was within range, it should be unchanged
          if (value >= 0 && value <= 100) {
            expect(clamped).toBe(value);
          }
          
          // If the original value was below 0, it should be clamped to 0
          if (value < 0) {
            expect(clamped).toBe(0);
          }
          
          // If the original value was above 100, it should be clamped to 100
          if (value > 100) {
            expect(clamped).toBe(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 26b: Dimension Range Invariant for Dimensions object
  // **Validates: Requirements 13.2**
  // *For any* Dimensions object, all dimension values should be within 0-100 range
  it('Property 26b: Dimension range invariant - Dimensions object values in 0-100 range', () => {
    fc.assert(
      fc.property(
        arbitraryDimensions(),
        (dimensions) => {
          const dimensionTypes: DimensionType[] = ['algorithm', 'dataProcessing', 'stability', 'userExperience'];
          
          for (const dimType of dimensionTypes) {
            const value = dimensions[dimType];
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 37: Difficulty Parameter Application
  // **Validates: Requirements 21.2, 21.4**
  // *For any* archetype and difficulty combination, the initial budget should be correctly
  // adjusted by the difficulty's initialBudgetMultiplier
  it('Property 37: Difficulty parameter application - initial budget correctly adjusted', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        (archetype, difficulty) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const archetypeConfig = GameEngine.getArchetypeConfig(archetype);
          const difficultyConfig = GameEngine.getDifficultyConfig(difficulty);
          
          // Calculate expected budget with difficulty multiplier
          const expectedBudget = Math.floor(
            archetypeConfig.startingResources.budget * difficultyConfig.modifiers.initialBudgetMultiplier
          );
          
          // The initial budget should match the expected adjusted value
          expect(state.resources.budget).toBe(expectedBudget);
          
          // The difficulty should be stored in the game state
          expect(state.difficulty).toBe(difficulty);
          
          // Verify the multiplier is applied correctly for each difficulty level
          const multiplier = difficultyConfig.modifiers.initialBudgetMultiplier;
          if (difficulty === 'easy') {
            expect(multiplier).toBe(1.5);
          } else if (difficulty === 'normal') {
            expect(multiplier).toBe(1.0);
          } else if (difficulty === 'hard') {
            expect(multiplier).toBe(0.8);
          } else if (difficulty === 'nightmare') {
            expect(multiplier).toBe(0.6);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 27: Specialized Training Operation Effects
  // **Validates: Requirements 14.1, 14.2, 14.3, 14.4**
  // *For any* game state with sufficient resources, executing a specialized training operation
  // should increase the corresponding dimension by exactly 6 points (clamped to 0-100)
  it('Property 27: Specialized training operation effects - correct dimension increases', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.constantFrom(
          { operation: AlgorithmResearch, dimension: 'algorithm' as DimensionType },
          { operation: DataEngineering, dimension: 'dataProcessing' as DimensionType },
          { operation: ArchitectureOptimization, dimension: 'stability' as DimensionType },
          { operation: UserResearch, dimension: 'userExperience' as DimensionType }
        ),
        (state, { operation, dimension }) => {
          // Ensure state has sufficient resources for the operation
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(500, state.resources.budget),
              computePoints: Math.max(2, state.resources.computePoints),
            },
            dimensions: {
              ...state.dimensions,
              // Ensure dimension is within valid range
              [dimension]: Math.max(0, Math.min(94, state.dimensions[dimension])),
            },
          };

          const originalDimension = validState.dimensions[dimension];
          const originalBudget = validState.resources.budget;
          const originalComputePoints = validState.resources.computePoints;

          const newState = GameEngine.executeOperation(validState, operation);

          // Budget should decrease by 500
          expect(newState.resources.budget).toBe(originalBudget - 500);
          
          // Compute points should decrease by 2
          expect(newState.resources.computePoints).toBe(originalComputePoints - 2);
          
          // The target dimension should increase by 6 (clamped to 100)
          const expectedDimension = Math.min(100, originalDimension + 6);
          expect(newState.dimensions[dimension]).toBe(expectedDimension);
          
          // Other dimensions should remain unchanged
          const otherDimensions: DimensionType[] = ['algorithm', 'dataProcessing', 'stability', 'userExperience']
            .filter(d => d !== dimension) as DimensionType[];
          for (const otherDim of otherDimensions) {
            expect(newState.dimensions[otherDim]).toBe(validState.dimensions[otherDim]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 28: Premium Upgrade Operation Effects
  // **Validates: Requirements 15.2, 15.3**
  // *For any* game state with sufficient resources:
  // - BuyTrainingCourse should increase all dimensions by 5
  // - TechSummit should increase exactly 2 random dimensions by 15 each
  it('Property 28: Premium upgrade operation effects - BuyTrainingCourse increases all dimensions', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Ensure state has sufficient resources for BuyTrainingCourse
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(2000, state.resources.budget),
            },
            dimensions: {
              // Ensure dimensions are within valid range to allow +5 increase
              algorithm: Math.max(0, Math.min(95, state.dimensions.algorithm)),
              dataProcessing: Math.max(0, Math.min(95, state.dimensions.dataProcessing)),
              stability: Math.max(0, Math.min(95, state.dimensions.stability)),
              userExperience: Math.max(0, Math.min(95, state.dimensions.userExperience)),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalDimensions = { ...validState.dimensions };

          const newState = GameEngine.executeOperation(validState, BuyTrainingCourse);

          // Budget should decrease by 2000
          expect(newState.resources.budget).toBe(originalBudget - 2000);
          
          // All dimensions should increase by 5 (clamped to 100)
          expect(newState.dimensions.algorithm).toBe(Math.min(100, originalDimensions.algorithm + 5));
          expect(newState.dimensions.dataProcessing).toBe(Math.min(100, originalDimensions.dataProcessing + 5));
          expect(newState.dimensions.stability).toBe(Math.min(100, originalDimensions.stability + 5));
          expect(newState.dimensions.userExperience).toBe(Math.min(100, originalDimensions.userExperience + 5));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 28b: TechSummit increases exactly 2 random dimensions by 15
  // **Validates: Requirements 15.3**
  it('Property 28b: Premium upgrade operation effects - TechSummit increases 2 random dimensions', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Ensure state has sufficient resources for TechSummit
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(5000, state.resources.budget),
              computePoints: Math.max(2, state.resources.computePoints),
            },
            dimensions: {
              // Ensure dimensions are within valid range to allow +15 increase
              algorithm: Math.max(0, Math.min(85, state.dimensions.algorithm)),
              dataProcessing: Math.max(0, Math.min(85, state.dimensions.dataProcessing)),
              stability: Math.max(0, Math.min(85, state.dimensions.stability)),
              userExperience: Math.max(0, Math.min(85, state.dimensions.userExperience)),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalComputePoints = validState.resources.computePoints;
          const originalDimensions = { ...validState.dimensions };

          const newState = GameEngine.executeOperation(validState, TechSummit);

          // Budget should decrease by 5000
          expect(newState.resources.budget).toBe(originalBudget - 5000);
          
          // Compute points should decrease by 2
          expect(newState.resources.computePoints).toBe(originalComputePoints - 2);
          
          // Count how many dimensions increased
          const dimensionTypes: DimensionType[] = ['algorithm', 'dataProcessing', 'stability', 'userExperience'];
          let increasedCount = 0;
          let totalIncrease = 0;
          
          for (const dim of dimensionTypes) {
            const increase = newState.dimensions[dim] - originalDimensions[dim];
            if (increase > 0) {
              increasedCount++;
              totalIncrease += increase;
              // Each increased dimension should increase by exactly 15 (or clamped to 100)
              expect(increase).toBe(15);
            }
          }
          
          // Exactly 2 dimensions should have increased
          expect(increasedCount).toBe(2);
          
          // Total increase should be 30 (2 dimensions * 15 each)
          expect(totalIncrease).toBe(30);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 28c: HireConsultant increases selected dimension by 20
  // **Validates: Requirements 15.1**
  it('Property 28c: Premium upgrade operation effects - HireConsultant increases selected dimension', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.constantFrom('algorithm', 'dataProcessing', 'stability', 'userExperience') as fc.Arbitrary<DimensionType>,
        (state, targetDimension) => {
          // Ensure state has sufficient resources for HireConsultant
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              budget: Math.max(3000, state.resources.budget),
              computePoints: Math.max(1, state.resources.computePoints),
            },
            dimensions: {
              ...state.dimensions,
              // Ensure target dimension is within valid range to allow +20 increase
              [targetDimension]: Math.max(0, Math.min(80, state.dimensions[targetDimension])),
            },
          };

          const originalBudget = validState.resources.budget;
          const originalComputePoints = validState.resources.computePoints;
          const originalDimension = validState.dimensions[targetDimension];

          const newState = GameEngine.executeHireConsultant(validState, targetDimension);

          // Budget should decrease by 3000
          expect(newState.resources.budget).toBe(originalBudget - 3000);
          
          // Compute points should decrease by 1
          expect(newState.resources.computePoints).toBe(originalComputePoints - 1);
          
          // Target dimension should increase by 20 (clamped to 100)
          const expectedDimension = Math.min(100, originalDimension + 20);
          expect(newState.dimensions[targetDimension]).toBe(expectedDimension);
          
          // Other dimensions should remain unchanged
          const otherDimensions: DimensionType[] = ['algorithm', 'dataProcessing', 'stability', 'userExperience']
            .filter(d => d !== targetDimension) as DimensionType[];
          for (const otherDim of otherDimensions) {
            expect(newState.dimensions[otherDim]).toBe(validState.dimensions[otherDim]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============ ExamSystem Property Tests ============

import { ExamSystem } from './ExamSystem';

describe('Feature: algorithm-ascension-game - ExamSystem', () => {
  // Property 29: Dimension Bonus Coefficient Calculation
  // **Validates: Requirements 16.4, 16.5, 16.6, 16.7**
  // *For any* game state and focus dimensions, the dimension bonus should be calculated correctly:
  // - Single dimension: returns the bonus for that dimension
  // - Multiple dimensions: returns the average of all dimension bonuses
  // - Bonus values: 1.5 (high), 1.0 (mid), 0.6 (low) based on thresholds
  it('Property 29: Dimension bonus coefficient calculation - single dimension bonus', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.constantFrom('algorithm', 'dataProcessing', 'stability', 'userExperience') as fc.Arbitrary<DimensionType>,
        (state, dimension) => {
          const focusDimensions: DimensionType[] = [dimension];
          const dimensionValue = state.dimensions[dimension];
          const examsPassed = state.progress.examsPassed;
          
          // Calculate expected bonus based on thresholds
          const thresholdHigh = examsPassed >= 5 ? 70 : 60;
          const thresholdMid = examsPassed >= 5 ? 50 : 40;
          
          let expectedBonus: number;
          if (dimensionValue >= thresholdHigh) {
            expectedBonus = 1.5;
          } else if (dimensionValue >= thresholdMid) {
            expectedBonus = 1.0;
          } else {
            expectedBonus = 0.6;
          }
          
          const actualBonus = ExamSystem.calculateDimensionBonus(state, focusDimensions);
          
          expect(actualBonus).toBe(expectedBonus);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 29b: Dimension bonus coefficient calculation - multiple dimensions average
  // **Validates: Requirements 16.7**
  it('Property 29b: Dimension bonus coefficient calculation - multiple dimensions average', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.array(
          fc.constantFrom('algorithm', 'dataProcessing', 'stability', 'userExperience') as fc.Arbitrary<DimensionType>,
          { minLength: 2, maxLength: 2 }
        ),
        (state, focusDimensions) => {
          // Ensure unique dimensions
          const uniqueDimensions = [...new Set(focusDimensions)];
          if (uniqueDimensions.length < 2) {
            return; // Skip if dimensions are not unique
          }
          
          const examsPassed = state.progress.examsPassed;
          const thresholdHigh = examsPassed >= 5 ? 70 : 60;
          const thresholdMid = examsPassed >= 5 ? 50 : 40;
          
          // Calculate expected bonus for each dimension
          const bonuses = uniqueDimensions.map(dim => {
            const value = state.dimensions[dim];
            if (value >= thresholdHigh) return 1.5;
            if (value >= thresholdMid) return 1.0;
            return 0.6;
          });
          
          // Expected bonus is the average
          const expectedBonus = bonuses.reduce((a, b) => a + b, 0) / bonuses.length;
          
          const actualBonus = ExamSystem.calculateDimensionBonus(state, uniqueDimensions);
          
          expect(actualBonus).toBeCloseTo(expectedBonus, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 29c: Dimension bonus coefficient calculation - threshold changes at examsPassed >= 5
  // **Validates: Requirements 17.4**
  it('Property 29c: Dimension bonus coefficient calculation - threshold changes at examsPassed >= 5', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.constantFrom('algorithm', 'dataProcessing', 'stability', 'userExperience') as fc.Arbitrary<DimensionType>,
        (state, dimension) => {
          const focusDimensions: DimensionType[] = [dimension];
          
          // Test with examsPassed < 5 (thresholds: 60, 40)
          const stateBefore5: GameState = {
            ...state,
            progress: { ...state.progress, examsPassed: 4 },
            dimensions: { ...state.dimensions, [dimension]: 65 }, // Between 60 and 70
          };
          const bonusBefore5 = ExamSystem.calculateDimensionBonus(stateBefore5, focusDimensions);
          expect(bonusBefore5).toBe(1.5); // 65 >= 60, so high bonus
          
          // Test with examsPassed >= 5 (thresholds: 70, 50)
          const stateAfter5: GameState = {
            ...state,
            progress: { ...state.progress, examsPassed: 5 },
            dimensions: { ...state.dimensions, [dimension]: 65 }, // Between 50 and 70
          };
          const bonusAfter5 = ExamSystem.calculateDimensionBonus(stateAfter5, focusDimensions);
          expect(bonusAfter5).toBe(1.0); // 65 >= 50 but < 70, so mid bonus
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 29d: Dimension bonus coefficient calculation - empty focus dimensions returns 1.0
  it('Property 29d: Dimension bonus coefficient calculation - empty focus dimensions returns 1.0', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          const focusDimensions: DimensionType[] = [];
          const actualBonus = ExamSystem.calculateDimensionBonus(state, focusDimensions);
          
          expect(actualBonus).toBe(1.0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 29e: Dimension bonus coefficient calculation - bonus values are always 0.6, 1.0, or 1.5
  // **Validates: Requirements 16.4, 16.5, 16.6**
  it('Property 29e: Dimension bonus coefficient calculation - bonus values are valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // dimension value
        fc.integer({ min: 0, max: 20 }),  // examsPassed
        (dimensionValue, examsPassed) => {
          const singleBonus = ExamSystem.calculateSingleDimensionBonus(dimensionValue, examsPassed);
          
          // Single dimension bonus should be exactly one of these values
          expect([0.6, 1.0, 1.5]).toContain(singleBonus);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 30: Exam Difficulty Progression
  // **Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5**
  // *For any* game state, the exam difficulty should increase based on examsPassed:
  // - Base traffic increases based on difficulty (easy +5%, normal +8%, hard +12%, nightmare +15%)
  // - Reward multiplier increases by 10% per exam passed
  // - Double dimension exams start at examsPassed >= 3
  // - Threshold increases at examsPassed >= 5
  it('Property 30: Exam difficulty progression - base traffic increases with examsPassed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 50000 }), // base traffic
        fc.integer({ min: 0, max: 20 }),       // examsPassed
        arbitraryDifficulty(),                 // difficulty level
        (baseTraffic, examsPassed, difficulty) => {
          const adjustedTraffic = ExamSystem.calculateAdjustedBaseTraffic(baseTraffic, examsPassed, difficulty);
          
          // Get the growth rate for this difficulty
          const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
          const growthRate = difficultyConfig.modifiers.examDifficultyGrowth;
          
          // Expected: baseTraffic * (1 + growthRate)^examsPassed
          const expectedTraffic = Math.floor(baseTraffic * Math.pow(1 + growthRate, examsPassed));
          
          expect(adjustedTraffic).toBe(expectedTraffic);
          
          // Traffic should always be >= original base traffic
          expect(adjustedTraffic).toBeGreaterThanOrEqual(baseTraffic);
          
          // Traffic should increase monotonically with examsPassed
          if (examsPassed > 0) {
            const previousTraffic = ExamSystem.calculateAdjustedBaseTraffic(baseTraffic, examsPassed - 1, difficulty);
            expect(adjustedTraffic).toBeGreaterThan(previousTraffic);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 30b: Exam difficulty progression - reward multiplier increases with examsPassed
  // **Validates: Requirements 17.5**
  it('Property 30b: Exam difficulty progression - reward multiplier increases with examsPassed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }), // examsPassed
        (examsPassed) => {
          const rewardMultiplier = ExamSystem.calculateRewardMultiplier(examsPassed);
          
          // Expected: 1.10^examsPassed (每次+10%)
          const expectedMultiplier = Math.pow(1.10, examsPassed);
          
          expect(rewardMultiplier).toBeCloseTo(expectedMultiplier, 10);
          
          // Multiplier should always be >= 1.0
          expect(rewardMultiplier).toBeGreaterThanOrEqual(1.0);
          
          // Multiplier should increase monotonically with examsPassed
          if (examsPassed > 0) {
            const previousMultiplier = ExamSystem.calculateRewardMultiplier(examsPassed - 1);
            expect(rewardMultiplier).toBeGreaterThan(previousMultiplier);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 30c: Exam difficulty progression - double dimension exams start at examsPassed >= 3
  // **Validates: Requirements 17.3**
  it('Property 30c: Exam difficulty progression - double dimension exams start at examsPassed >= 3', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.integer({ min: 0, max: 8 }), // scenario index
        (state, scenarioIndex) => {
          const scenarios = ExamSystem.getScenarios();
          const safeIndex = Math.min(scenarioIndex, scenarios.length - 1);
          const scenario = scenarios[safeIndex];
          
          // Test with examsPassed < 3 (should always be single dimension)
          const stateBefore3: GameState = {
            ...state,
            progress: { ...state.progress, examsPassed: 2 },
          };
          const focusBefore3 = ExamSystem.getFocusDimensions(stateBefore3, scenario);
          expect(focusBefore3.length).toBe(1);
          
          // Test with examsPassed >= 3 (can be double dimension if scenario supports it)
          const stateAfter3: GameState = {
            ...state,
            progress: { ...state.progress, examsPassed: 3 },
          };
          const focusAfter3 = ExamSystem.getFocusDimensions(stateAfter3, scenario);
          
          if (scenario.focusDimensions.length > 1) {
            // If scenario has multiple dimensions, should return 2
            expect(focusAfter3.length).toBe(2);
          } else {
            // If scenario only has 1 dimension, should still return 1
            expect(focusAfter3.length).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 30d: Exam difficulty progression - difficulty level equals examsPassed + 1
  // **Validates: Requirements 17.1**
  it('Property 30d: Exam difficulty progression - difficulty level equals examsPassed + 1', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Ensure valid state for exam calculation
          const validState: GameState = {
            ...state,
            metrics: {
              ...state.metrics,
              fitScore: Math.max(1, state.metrics.fitScore), // Ensure non-zero fitScore
            },
            risks: {
              ...state.risks,
              serverMeltdown: false, // Ensure no meltdown
            },
          };
          
          const result = ExamSystem.calculateExamResult(validState);
          
          // Difficulty level should be examsPassed + 1
          expect(result.difficultyLevel).toBe(validState.progress.examsPassed + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 30e: Exam difficulty progression - final reward calculation is correct
  // **Validates: Requirements 17.1, 17.2, 17.5**
  it('Property 30e: Exam difficulty progression - final reward calculation is correct', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.integer({ min: 0, max: 99 }).map(n => n / 100), // scenario random value (0.00 to 0.99)
        (state, scenarioRandom) => {
          // Ensure valid state for exam calculation
          const validState: GameState = {
            ...state,
            metrics: {
              ...state.metrics,
              fitScore: Math.max(0, Math.min(100, state.metrics.fitScore)),
              entropy: Math.max(0, Math.min(100, state.metrics.entropy)),
            },
            dimensions: {
              algorithm: Math.max(0, Math.min(100, state.dimensions.algorithm)),
              dataProcessing: Math.max(0, Math.min(100, state.dimensions.dataProcessing)),
              stability: Math.max(0, Math.min(100, state.dimensions.stability)),
              userExperience: Math.max(0, Math.min(100, state.dimensions.userExperience)),
            },
            risks: {
              ...state.risks,
              serverMeltdown: false, // Ensure no meltdown for predictable calculation
            },
            reputation: Math.max(0, Math.min(100, state.reputation ?? 0)), // Ensure reputation is valid
          };
          
          const result = ExamSystem.calculateExamResult(validState, scenarioRandom);
          
          // Verify the reward calculation components
          const scenarios = ExamSystem.getScenarios();
          const scenarioIndex = Math.min(
            Math.floor(scenarioRandom * scenarios.length),
            scenarios.length - 1
          );
          const scenario = scenarios[scenarioIndex];
          
          // Calculate expected values (now with difficulty parameter)
          const expectedAdjustedTraffic = ExamSystem.calculateAdjustedBaseTraffic(
            scenario.baseTraffic,
            validState.progress.examsPassed,
            validState.difficulty
          );
          const expectedRewardMultiplier = ExamSystem.calculateRewardMultiplier(
            validState.progress.examsPassed
          );
          const focusDimensions = ExamSystem.getFocusDimensions(validState, scenario);
          const expectedDimensionBonus = ExamSystem.calculateDimensionBonus(validState, focusDimensions);
          const expectedStabilityCoeff = ExamSystem.calculateStabilityCoefficient(validState);
          const expectedFitScoreMultiplier = validState.metrics.fitScore / 100;
          
          // Calculate reputation bonus using the same value as validState
          const expectedReputationBonus = ExamSystem.calculateReputationBonus(validState.reputation);
          
          // Check dimension threshold
          const thresholdCheck = ExamSystem.checkDimensionThreshold(validState);
          
          // Calculate expected final reward (0 if threshold not met)
          const expectedReward = thresholdCheck.meetsThreshold ? Math.floor(
            expectedAdjustedTraffic *
            expectedFitScoreMultiplier *
            expectedStabilityCoeff *
            expectedDimensionBonus *
            expectedRewardMultiplier *
            expectedReputationBonus
          ) : 0;
          
          // Verify the result
          expect(result.baseTraffic).toBe(expectedAdjustedTraffic);
          expect(result.fitScoreMultiplier).toBeCloseTo(expectedFitScoreMultiplier, 10);
          expect(result.stabilityCoefficient).toBe(expectedStabilityCoeff);
          expect(result.dimensionBonus).toBeCloseTo(expectedDimensionBonus, 10);
          expect(result.finalReward).toBe(expectedReward);
          expect(result.meetsThreshold).toBe(thresholdCheck.meetsThreshold);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 39: Side Job Count Limit
  // **Validates: Requirements 23.3**
  // *For any* game state, executing side job operations should:
  // 1. Increment sideJobsThisTurn counter
  // 2. Be blocked when sideJobsThisTurn >= 2
  // 3. Reset sideJobsThisTurn to 0 at turn start
  it('Property 39: Side job count limit - sideJobsThisTurn increments and blocks at limit', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Ensure state has sufficient resources for Freelance (the simplest side job)
          // Freelance requires 2 compute points
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              computePoints: 6, // Enough for 3 attempts (2 each)
            },
            progress: {
              ...state.progress,
              sideJobsThisTurn: 0, // Start with 0 side jobs
            },
          };

          // Verify initial state can execute
          expect(Freelance.canExecute(validState)).toBe(true);

          // Execute first side job
          const stateAfterFirst = GameEngine.executeOperation(validState, Freelance);
          expect(stateAfterFirst.progress.sideJobsThisTurn).toBe(1);
          expect(stateAfterFirst.resources.computePoints).toBe(4); // 6 - 2 = 4

          // Execute second side job
          expect(Freelance.canExecute(stateAfterFirst)).toBe(true);
          const stateAfterSecond = GameEngine.executeOperation(stateAfterFirst, Freelance);
          expect(stateAfterSecond.progress.sideJobsThisTurn).toBe(2);
          expect(stateAfterSecond.resources.computePoints).toBe(2); // 4 - 2 = 2

          // Third side job should be blocked (canExecute returns false due to limit)
          expect(Freelance.canExecute(stateAfterSecond)).toBe(false);
          
          // Executing should return unchanged state (operation blocked)
          const stateAfterThird = GameEngine.executeOperation(stateAfterSecond, Freelance);
          expect(stateAfterThird.progress.sideJobsThisTurn).toBe(2);
          expect(stateAfterThird.resources.computePoints).toBe(2); // Unchanged
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 39b: Side job count resets at turn start
  // **Validates: Requirements 23.3**
  it('Property 39b: Side job count limit - sideJobsThisTurn resets at turn start', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.integer({ min: 0, max: 2 }),
        (state, sideJobCount) => {
          // Set up state with some side jobs already done
          const validState: GameState = {
            ...state,
            progress: {
              ...state.progress,
              sideJobsThisTurn: sideJobCount,
            },
          };

          // Start a new turn
          const newState = GameEngine.startTurn(validState);

          // sideJobsThisTurn should be reset to 0
          expect(newState.progress.sideJobsThisTurn).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 40: Reputation Range and Unlock
  // **Validates: Requirements 24.1, 24.2, 24.3, 24.4**
  // *For any* reputation value, it should be constrained to 0-100 range
  // and unlock side jobs at appropriate thresholds
  it('Property 40: Reputation range and unlock - reputation stays in 0-100 range', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.integer({ min: -200, max: 200 }),
        (state, reputationChange) => {
          const validState: GameState = {
            ...state,
            reputation: Math.max(0, Math.min(100, state.reputation || 0)),
          };

          // Apply reputation change
          const newState = GameEngine.updateReputation(validState, reputationChange);

          // Reputation should always be in 0-100 range
          expect(newState.reputation).toBeGreaterThanOrEqual(0);
          expect(newState.reputation).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 40b: Reputation unlock - TechConsulting requires reputation >= 30
  // **Validates: Requirements 24.2**
  it('Property 40b: Reputation unlock - TechConsulting requires reputation >= 30', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.integer({ min: 0, max: 100 }),
        (state, reputation) => {
          // Set up state with sufficient resources for TechConsulting
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              computePoints: 5, // Enough compute points
            },
            dimensions: {
              ...state.dimensions,
              algorithm: 60, // Meets algorithm requirement
            },
            progress: {
              ...state.progress,
              sideJobsThisTurn: 0, // No side jobs done yet
            },
            reputation: reputation,
          };

          const canExecute = TechConsulting.canExecute(validState);

          // TechConsulting should only be executable if reputation >= 30
          if (reputation >= 30) {
            expect(canExecute).toBe(true);
          } else {
            expect(canExecute).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 40c: Reputation unlock - TechBlog requires reputation >= 50
  // **Validates: Requirements 24.3**
  it('Property 40c: Reputation unlock - TechBlog requires reputation >= 50', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        fc.integer({ min: 0, max: 100 }),
        (state, reputation) => {
          // Set up state with sufficient resources for TechBlog
          const validState: GameState = {
            ...state,
            resources: {
              ...state.resources,
              computePoints: 5, // Enough compute points
            },
            dimensions: {
              ...state.dimensions,
              algorithm: 70, // Meets dimension requirement (>= 60)
            },
            progress: {
              ...state.progress,
              sideJobsThisTurn: 0, // No side jobs done yet
            },
            reputation: reputation,
          };

          const canExecute = TechBlog.canExecute(validState);

          // TechBlog should only be executable if reputation >= 50
          if (reputation >= 50) {
            expect(canExecute).toBe(true);
          } else {
            expect(canExecute).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 40d: Reputation bonus - exam reward +10% when reputation >= 70
  // **Validates: Requirements 24.4**
  it('Property 40d: Reputation bonus - exam reward +10% when reputation >= 70', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (reputation) => {
          const bonus = ExamSystem.calculateReputationBonus(reputation);

          if (reputation >= 70) {
            expect(bonus).toBe(1.1);
          } else {
            expect(bonus).toBe(1.0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 41: Exam Failure Reputation Penalty
  // **Validates: Requirements 24.6**
  // *For any* game state where exam fails (finalReward = 0), reputation should decrease by 10
  // Plus additional penalty for nightmare difficulty (+5)
  it('Property 41: Exam failure reputation penalty - reputation decreases on failure', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Set up state that will cause exam failure (server meltdown = 0 reward)
          const validState: GameState = {
            ...state,
            metrics: {
              ...state.metrics,
              fitScore: Math.max(1, state.metrics.fitScore),
            },
            risks: {
              ...state.risks,
              serverMeltdown: true, // This causes stabilityCoefficient = 0, so reward = 0
            },
            reputation: Math.max(20, Math.min(100, state.reputation || 50)), // Ensure enough reputation to lose
          };

          const originalReputation = validState.reputation;
          const { newState, result } = GameEngine.triggerExam(validState);

          // Exam should fail (reward = 0 due to meltdown)
          expect(result.passed).toBe(false);
          expect(result.finalReward).toBe(0);

          // Get difficulty config for additional penalty
          const difficultyConfig = DIFFICULTY_CONFIGS[validState.difficulty];
          const additionalPenalty = difficultyConfig.modifiers.examFailReputationPenalty;
          
          // Reputation should decrease by 10 + additional penalty (clamped to 0)
          const expectedReputation = Math.max(0, originalReputation - 10 - additionalPenalty);
          expect(newState.reputation).toBe(expectedReputation);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 41b: Exam success does not penalize reputation
  // **Validates: Requirements 24.6**
  it('Property 41b: Exam success does not penalize reputation', () => {
    fc.assert(
      fc.property(
        arbitraryGameState(),
        (state) => {
          // Set up state that will pass exam (no meltdown, decent fitScore)
          const validState: GameState = {
            ...state,
            metrics: {
              ...state.metrics,
              fitScore: Math.max(50, state.metrics.fitScore), // Ensure decent fitScore
              entropy: Math.min(30, state.metrics.entropy), // Low entropy for good stability
            },
            dimensions: {
              algorithm: 70,
              dataProcessing: 70,
              stability: 70,
              userExperience: 70,
            },
            risks: {
              ...state.risks,
              serverMeltdown: false, // No meltdown
            },
            reputation: Math.max(0, Math.min(100, state.reputation || 50)),
          };

          const originalReputation = validState.reputation;
          const { newState, result } = GameEngine.triggerExam(validState);

          // Exam should pass (reward > 0)
          expect(result.passed).toBe(true);
          expect(result.finalReward).toBeGreaterThan(0);

          // Reputation should remain unchanged
          expect(newState.reputation).toBe(originalReputation);
        }
      ),
      { numRuns: 100 }
    );
  });
});
