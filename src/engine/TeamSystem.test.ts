/**
 * Team System Property Tests
 * Feature: algorithm-ascension-game
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TeamSystem, TEAM_CONSTANTS, EXP_PER_LEVEL, BASE_STAT_RANGES } from './TeamSystem';
import { GameEngine } from './GameEngine';
import type { GameState, TeamMember, TraitType, DifficultyLevel, ArchetypeType, RarityType, BaseStats } from '../types';
import { RARITY_CONFIGS } from '../types';

// ============ Test Data Generators ============

const arbitraryArchetype = (): fc.Arbitrary<ArchetypeType> =>
  fc.constantFrom('startup', 'bigtech', 'academic');

const arbitraryDifficulty = (): fc.Arbitrary<DifficultyLevel> =>
  fc.constantFrom('easy', 'normal', 'hard', 'nightmare');

const arbitraryRarity = (): fc.Arbitrary<RarityType> =>
  fc.constantFrom('common', 'rare', 'epic', 'legendary');

const arbitraryTraitType = (): fc.Arbitrary<TraitType> =>
  fc.constantFrom(
    'algorithm_expert', 'data_engineer', 'architect', 'product_manager',
    'fullstack', 'efficiency', 'cost_control', 'data_mining'
  );

const arbitraryBaseStats = (): fc.Arbitrary<BaseStats> =>
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
    level: fc.integer({ min: 1, max: 10 }),
    experience: fc.integer({ min: 0, max: 4000 }),
    hiringCost: fc.integer({ min: 600, max: 5000 }),
    salary: fc.integer({ min: 200, max: 1000 }),
  });

// ============ Property Tests ============

describe('Feature: algorithm-ascension-game - Team System', () => {
  // Property 31: Team Member Rarity and Trait Count (Updated)
  // **Validates: Requirements 18.2, 18.3**
  // *For any* generated team member, the number of traits should match the rarity's trait slots
  // Special characters have their own trait configurations
  it('Property 31: Team member rarity and trait count - traits match rarity slots', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        (archetype, difficulty) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const member = TeamSystem.generateTeamMember(state);
          
          // Member should have a valid rarity
          const validRarities: RarityType[] = ['common', 'rare', 'epic', 'legendary'];
          expect(validRarities).toContain(member.rarity);
          
          // Special characters have their own trait configurations
          if (member.isSpecial) {
            // Special characters can have more traits than normal
            expect(member.traits.length).toBeGreaterThan(0);
            expect(member.traits.length).toBeLessThanOrEqual(5);
          } else {
            // Trait count should match rarity's trait slots for normal members
            const expectedTraitCount = RARITY_CONFIGS[member.rarity].traitSlots;
            expect(member.traits.length).toBe(expectedTraitCount);
          }
          
          // All traits should be unique (no duplicates)
          const uniqueTraits = new Set(member.traits);
          expect(uniqueTraits.size).toBe(member.traits.length);
          
          // All traits should be valid trait types
          const validTraits: TraitType[] = [
            'algorithm_expert', 'data_engineer', 'architect', 'product_manager',
            'fullstack', 'efficiency', 'cost_control', 'data_mining', 'tester'
          ];
          for (const trait of member.traits) {
            expect(validTraits).toContain(trait);
          }
          
          // Member should have valid base stats within rarity range
          const statRange = BASE_STAT_RANGES[member.rarity];
          expect(member.baseStats.computeContribution).toBeGreaterThanOrEqual(statRange.min);
          expect(member.baseStats.computeContribution).toBeLessThanOrEqual(statRange.max);
          expect(member.baseStats.dataEfficiency).toBeGreaterThanOrEqual(statRange.min);
          expect(member.baseStats.dataEfficiency).toBeLessThanOrEqual(statRange.max);
          expect(member.baseStats.maintenanceSkill).toBeGreaterThanOrEqual(statRange.min);
          expect(member.baseStats.maintenanceSkill).toBeLessThanOrEqual(statRange.max);
          
          // Member should have salary matching rarity (or special config for special characters)
          if (!member.isSpecial) {
            expect(member.salary).toBe(RARITY_CONFIGS[member.rarity].baseSalary);
          }
        }
      ),
      { numRuns: 100 }
    );
  });


  // Property 31b: Hiring pool generation
  // **Validates: Requirements 18.1, 18.2, 18.3**
  // *For any* game state, generating a hiring pool should produce exactly 3 candidates with valid rarity
  // Special characters have their own trait configurations
  it('Property 31b: Hiring pool generation - produces 3 candidates with valid rarity and traits', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        (archetype, difficulty) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const pool = TeamSystem.generateHiringPool(state);
          
          // Pool should have exactly 3 candidates
          expect(pool.length).toBe(TEAM_CONSTANTS.HIRING_POOL_SIZE);
          
          // Each candidate should have valid properties
          for (const member of pool) {
            expect(member.id).toBeTruthy();
            expect(member.name).toBeTruthy();
            
            // Rarity should be valid
            const validRarities: RarityType[] = ['common', 'rare', 'epic', 'legendary'];
            expect(validRarities).toContain(member.rarity);
            
            // Special characters have their own trait configurations
            if (member.isSpecial) {
              expect(member.traits.length).toBeGreaterThan(0);
              expect(member.traits.length).toBeLessThanOrEqual(5);
            } else {
              // Trait count should match rarity for normal members
              const expectedTraitCount = RARITY_CONFIGS[member.rarity].traitSlots;
              expect(member.traits.length).toBe(expectedTraitCount);
            }
            
            // Base stats should be valid
            expect(member.baseStats).toBeDefined();
            expect(member.baseStats.computeContribution).toBeGreaterThanOrEqual(0);
            expect(member.baseStats.dataEfficiency).toBeGreaterThanOrEqual(0);
            expect(member.baseStats.maintenanceSkill).toBeGreaterThanOrEqual(0);
            
            expect(member.level).toBe(1);
            expect(member.experience).toBe(0);
            expect(member.hiringCost).toBeGreaterThan(0);
            expect(member.salary).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 32: Team Size Limit
  // **Validates: Requirements 18.4**
  // *For any* game state with a full team, hiring should throw an error
  it('Property 32: Team size limit - cannot hire when team is full', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.array(arbitraryTeamMember(), { minLength: 5, maxLength: 5 }),
        (archetype, difficulty, fullTeam) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const stateWithFullTeam: GameState = {
            ...state,
            team: fullTeam,
            hiringPool: TeamSystem.generateHiringPool(state),
            resources: {
              ...state.resources,
              budget: 100000, // Ensure enough budget
            },
          };
          
          // Team should be at max size
          expect(stateWithFullTeam.team.length).toBe(TEAM_CONSTANTS.MAX_TEAM_SIZE);
          
          // Trying to hire should throw an error
          const candidateId = stateWithFullTeam.hiringPool[0]?.id;
          if (candidateId) {
            expect(() => TeamSystem.hireMember(stateWithFullTeam, candidateId)).toThrow('团队已满');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 33: Hire Operation Effects
  // **Validates: Requirements 18.3**
  // *For any* valid hire operation, budget decreases and team size increases
  it('Property 33: Hire operation effects - budget decreases and team grows', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        (archetype, difficulty) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const pool = TeamSystem.generateHiringPool(state);
          const candidate = pool[0];
          
          const stateWithPool: GameState = {
            ...state,
            hiringPool: pool,
            resources: {
              ...state.resources,
              budget: candidate.hiringCost + 1000, // Ensure enough budget
            },
          };
          
          const originalBudget = stateWithPool.resources.budget;
          const originalTeamSize = stateWithPool.team.length;
          
          const newState = TeamSystem.hireMember(stateWithPool, candidate.id);
          
          // Budget should decrease by hiring cost
          expect(newState.resources.budget).toBe(originalBudget - candidate.hiringCost);
          
          // Team size should increase by 1
          expect(newState.team.length).toBe(originalTeamSize + 1);
          
          // The hired member should be in the team
          expect(newState.team.find(m => m.id === candidate.id)).toBeTruthy();
          
          // The hired member should be removed from hiring pool
          expect(newState.hiringPool.find(m => m.id === candidate.id)).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 34: Fire Operation Effects (Updated for 30% refund)
  // **Validates: Requirements 18.7**
  // *For any* valid fire operation, budget increases by 30% of hiring cost and team size decreases
  it('Property 34: Fire operation effects - budget increases by 30% and team shrinks', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        arbitraryTeamMember(),
        (archetype, difficulty, member) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const stateWithTeam: GameState = {
            ...state,
            team: [member],
          };
          
          const originalBudget = stateWithTeam.resources.budget;
          const originalTeamSize = stateWithTeam.team.length;
          const expectedRefund = Math.floor(member.hiringCost * TEAM_CONSTANTS.FIRE_REFUND_RATE);
          
          const newState = TeamSystem.fireMember(stateWithTeam, member.id);
          
          // Budget should increase by 30% of hiring cost
          expect(newState.resources.budget).toBe(originalBudget + expectedRefund);
          
          // Team size should decrease by 1
          expect(newState.team.length).toBe(originalTeamSize - 1);
          
          // The fired member should not be in the team
          expect(newState.team.find(m => m.id === member.id)).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 35: Team Trait Bonus Calculation
  // **Validates: Requirements 19.2, 20.4**
  // *For any* team with members, bonuses should be calculated correctly with level multiplier
  it('Property 35: Team trait bonus calculation - correct bonuses with level multiplier', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.array(arbitraryTeamMember(), { minLength: 1, maxLength: 5 }),
        (archetype, difficulty, team) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const stateWithTeam: GameState = {
            ...state,
            team,
          };
          
          const bonuses = TeamSystem.calculateTeamBonuses(stateWithTeam);
          
          // All dimension bonuses should be non-negative
          expect(bonuses.dimensionBonus.algorithm).toBeGreaterThanOrEqual(0);
          expect(bonuses.dimensionBonus.dataProcessing).toBeGreaterThanOrEqual(0);
          expect(bonuses.dimensionBonus.stability).toBeGreaterThanOrEqual(0);
          expect(bonuses.dimensionBonus.userExperience).toBeGreaterThanOrEqual(0);
          
          // AP bonus should be non-negative
          expect(bonuses.apBonus).toBeGreaterThanOrEqual(0);
          
          // Cost reduction should be non-negative
          expect(bonuses.costReduction).toBeGreaterThanOrEqual(0);
          
          // Data bonus should be non-negative
          expect(bonuses.dataBonus).toBeGreaterThanOrEqual(0);
          
          // Verify level multiplier effect: higher level members should contribute more
          // For a single member with algorithm_expert trait at level 1 vs level 10
          // Level bonus rate is now 8% per level (LEVEL_BONUS_RATE = 0.08)
          const level1Member: TeamMember = {
            id: 'test-1',
            name: 'Test',
            rarity: 'rare',
            baseStats: { computeContribution: 8, dataEfficiency: 7, maintenanceSkill: 6 },
            traits: ['algorithm_expert'],
            level: 1,
            experience: 0,
            hiringCost: 2000,
            salary: 350,
          };
          const level10Member: TeamMember = {
            id: 'test-10',
            name: 'Test',
            rarity: 'rare',
            baseStats: { computeContribution: 8, dataEfficiency: 7, maintenanceSkill: 6 },
            traits: ['algorithm_expert'],
            level: 10,
            experience: 4000,
            hiringCost: 2000,
            salary: 350,
          };
          
          const stateLevel1: GameState = { ...state, team: [level1Member] };
          const stateLevel10: GameState = { ...state, team: [level10Member] };
          
          const bonusLevel1 = TeamSystem.calculateTeamBonuses(stateLevel1);
          const bonusLevel10 = TeamSystem.calculateTeamBonuses(stateLevel10);
          
          // Level 10 should have 1.72x the bonus of level 1 (1 + 9 * 0.08 = 1.72)
          expect(bonusLevel10.dimensionBonus.algorithm).toBeCloseTo(
            bonusLevel1.dimensionBonus.algorithm * 1.72,
            5
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 36: Team Member Level Range (Updated for 1-10)
  // **Validates: Requirements 20.1**
  // *For any* experience value, the calculated level should be between 1 and 10
  it('Property 36: Team member level range - level always between 1 and 10', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 5000 }),
        (exp) => {
          const level = TeamSystem.calculateLevel(exp);
          
          // Level should always be between 1 and 10
          expect(level).toBeGreaterThanOrEqual(1);
          expect(level).toBeLessThanOrEqual(10);
          
          // Verify level thresholds (EXP_PER_LEVEL = [0, 80, 200, 400, 700, 1100, 1600, 2200, 3000, 4000])
          if (exp < EXP_PER_LEVEL[1]) {
            expect(level).toBe(1);
          } else if (exp < EXP_PER_LEVEL[2]) {
            expect(level).toBe(2);
          } else if (exp < EXP_PER_LEVEL[3]) {
            expect(level).toBe(3);
          } else if (exp < EXP_PER_LEVEL[4]) {
            expect(level).toBe(4);
          } else if (exp < EXP_PER_LEVEL[5]) {
            expect(level).toBe(5);
          } else if (exp < EXP_PER_LEVEL[6]) {
            expect(level).toBe(6);
          } else if (exp < EXP_PER_LEVEL[7]) {
            expect(level).toBe(7);
          } else if (exp < EXP_PER_LEVEL[8]) {
            expect(level).toBe(8);
          } else if (exp < EXP_PER_LEVEL[9]) {
            expect(level).toBe(9);
          } else {
            expect(level).toBe(10);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 36b: Experience addition and level up
  // **Validates: Requirements 20.2, 20.3**
  // *For any* member, adding experience should correctly update level
  it('Property 36b: Experience addition - correctly updates level', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.integer({ min: 0, max: 500 }),
        (archetype, difficulty, expToAdd) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const member: TeamMember = {
            id: 'test-member',
            name: 'Test',
            rarity: 'epic',
            baseStats: { computeContribution: 10, dataEfficiency: 9, maintenanceSkill: 8 },
            traits: ['algorithm_expert', 'data_engineer'],
            level: 1,
            experience: 0,
            hiringCost: 2000,
            salary: 550,
          };
          
          const stateWithMember: GameState = {
            ...state,
            team: [member],
          };
          
          const newState = TeamSystem.addExperience(stateWithMember, member.id, expToAdd);
          const updatedMember = newState.team.find(m => m.id === member.id);
          
          expect(updatedMember).toBeTruthy();
          if (updatedMember) {
            // Experience should be added
            expect(updatedMember.experience).toBe(expToAdd);
            
            // Level should be calculated correctly
            const expectedLevel = TeamSystem.calculateLevel(expToAdd);
            expect(updatedMember.level).toBe(Math.min(expectedLevel, 5));
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============ Salary System Property Tests ============

describe('Feature: algorithm-ascension-game - Salary System', () => {
  // Property 42: Team Salary System
  // **Validates: Requirements 25.1, 25.2, 25.3**
  // *For any* team member, salary should be calculated based on rarity and level
  it('Property 42: Team salary system - salary based on rarity and level', () => {
    fc.assert(
      fc.property(
        arbitraryRarity(),
        fc.integer({ min: 1, max: 5 }),
        (rarity, level) => {
          const member: TeamMember = {
            id: 'test-salary',
            name: 'Test',
            rarity,
            baseStats: { computeContribution: 10, dataEfficiency: 10, maintenanceSkill: 10 },
            traits: [],
            level,
            experience: 0,
            hiringCost: 1000,
            salary: RARITY_CONFIGS[rarity].baseSalary,
          };

          const calculatedSalary = TeamSystem.calculateMemberSalary(member);
          const baseSalary = RARITY_CONFIGS[rarity].baseSalary;
          const expectedSalary = Math.floor(baseSalary * (1 + (level - 1) * TEAM_CONSTANTS.SALARY_LEVEL_MULTIPLIER));

          // Salary should match expected calculation
          expect(calculatedSalary).toBe(expectedSalary);

          // Salary should increase with level
          if (level > 1) {
            const level1Member = { ...member, level: 1 };
            const level1Salary = TeamSystem.calculateMemberSalary(level1Member);
            expect(calculatedSalary).toBeGreaterThan(level1Salary);
          }

          // Salary should be based on rarity
          expect(calculatedSalary).toBeGreaterThanOrEqual(baseSalary);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 42b: Total salary calculation
  // **Validates: Requirements 25.2**
  // *For any* team, total salary should be sum of all member salaries
  it('Property 42b: Total salary calculation - sum of all member salaries', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.array(arbitraryTeamMember(), { minLength: 0, maxLength: 5 }),
        (archetype, difficulty, team) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const stateWithTeam: GameState = {
            ...state,
            team,
          };

          const totalSalary = TeamSystem.calculateTotalSalary(stateWithTeam);
          const expectedTotal = team.reduce((sum, member) => {
            return sum + TeamSystem.calculateMemberSalary(member);
          }, 0);

          expect(totalSalary).toBe(expectedTotal);

          // Empty team should have zero salary
          if (team.length === 0) {
            expect(totalSalary).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 42c: Salary payment deducts correct amount
  // **Validates: Requirements 25.2**
  // *For any* team with sufficient budget, paying salaries should deduct the correct amount
  it('Property 42c: Salary payment - deducts correct amount when budget sufficient', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.array(arbitraryTeamMember(), { minLength: 1, maxLength: 3 }),
        (archetype, difficulty, team) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const totalSalary = team.reduce((sum, m) => sum + TeamSystem.calculateMemberSalary(m), 0);
          
          // Ensure sufficient budget
          const stateWithTeam: GameState = {
            ...state,
            team,
            resources: {
              ...state.resources,
              budget: totalSalary + 10000, // More than enough
            },
          };

          const originalBudget = stateWithTeam.resources.budget;
          const { newState, firedMembers, totalPaid } = TeamSystem.paySalaries(stateWithTeam);

          // No members should be fired
          expect(firedMembers.length).toBe(0);

          // Budget should decrease by total salary
          expect(newState.resources.budget).toBe(originalBudget - totalSalary);

          // Total paid should equal total salary
          expect(totalPaid).toBe(totalSalary);

          // Team should remain unchanged
          expect(newState.team.length).toBe(team.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 43: Salary insufficient firing
  // **Validates: Requirements 25.5**
  // *For any* team with insufficient budget, members should be fired until salaries can be paid
  it('Property 43: Salary insufficient firing - fires members until budget sufficient', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.array(arbitraryTeamMember(), { minLength: 2, maxLength: 5 }),
        (archetype, difficulty, team) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          
          // Calculate total salary
          const totalSalary = team.reduce((sum, m) => sum + TeamSystem.calculateMemberSalary(m), 0);
          
          // Set budget to less than total salary but more than 0
          const insufficientBudget = Math.floor(totalSalary * 0.3);
          
          const stateWithTeam: GameState = {
            ...state,
            team,
            resources: {
              ...state.resources,
              budget: insufficientBudget,
            },
          };

          const { newState, firedMembers, totalPaid } = TeamSystem.paySalaries(stateWithTeam);

          // Some members should be fired (or all if budget is very low)
          const remainingTeamSalary = TeamSystem.calculateTotalSalary(newState);
          
          // After firing, remaining salary should be payable
          if (newState.team.length > 0) {
            expect(newState.resources.budget).toBeGreaterThanOrEqual(0);
            expect(totalPaid).toBe(remainingTeamSalary);
          }

          // Fired members + remaining team should equal original team
          expect(firedMembers.length + newState.team.length).toBe(team.length);

          // If members were fired, budget was insufficient for original team
          if (firedMembers.length > 0) {
            expect(insufficientBudget).toBeLessThan(totalSalary);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 43b: Zero budget fires all members
  // **Validates: Requirements 25.5**
  // *For any* team with zero budget, all members should be fired
  it('Property 43b: Zero budget - fires all members', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.array(arbitraryTeamMember(), { minLength: 1, maxLength: 5 }),
        (archetype, difficulty, team) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          
          const stateWithTeam: GameState = {
            ...state,
            team,
            resources: {
              ...state.resources,
              budget: 0,
            },
          };

          const { newState, firedMembers, totalPaid } = TeamSystem.paySalaries(stateWithTeam);

          // All members should be fired
          expect(newState.team.length).toBe(0);
          expect(firedMembers.length).toBe(team.length);
          expect(totalPaid).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 42d: Salary updates on level up
  // **Validates: Requirements 25.3**
  // *For any* member that levels up, salary should increase
  it('Property 42d: Salary updates on level up - salary increases with level', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        arbitraryRarity(),
        fc.integer({ min: 50, max: 200 }),
        (archetype, difficulty, rarity, expToAdd) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          const baseSalary = RARITY_CONFIGS[rarity].baseSalary;
          
          const member: TeamMember = {
            id: 'test-level-up',
            name: 'Test',
            rarity,
            baseStats: { computeContribution: 10, dataEfficiency: 10, maintenanceSkill: 10 },
            traits: ['algorithm_expert'],
            level: 1,
            experience: 0,
            hiringCost: 2000,
            salary: baseSalary,
          };

          const stateWithMember: GameState = {
            ...state,
            team: [member],
          };

          const newState = TeamSystem.addExperience(stateWithMember, member.id, expToAdd);
          const updatedMember = newState.team.find(m => m.id === member.id);

          expect(updatedMember).toBeTruthy();
          if (updatedMember) {
            const expectedLevel = Math.min(TeamSystem.calculateLevel(expToAdd), 5);
            const expectedSalary = Math.floor(baseSalary * (1 + (expectedLevel - 1) * TEAM_CONSTANTS.SALARY_LEVEL_MULTIPLIER));
            
            // Salary should be updated based on new level
            expect(updatedMember.salary).toBe(expectedSalary);
            
            // If level increased, salary should be higher than base
            if (expectedLevel > 1) {
              expect(updatedMember.salary).toBeGreaterThan(baseSalary);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============ Level Up Trait Acquisition Property Tests ============

describe('Feature: algorithm-ascension-game - Level Up Trait Acquisition', () => {
  // Property 44: Level Up Trait Acquisition Probability
  // **Validates: Requirements 20.5**
  // *For any* team member leveling up to an even level (2/4/6/8/10), there is a 25% chance to acquire a new trait (max 3)
  it('Property 44: Level up trait acquisition - traits can be acquired at even levels with max 3', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        fc.integer({ min: 0, max: 2 }), // Initial trait count (0-2)
        fc.integer({ min: 1, max: 9 }), // Starting level
        (archetype, difficulty, initialTraitCount, startLevel) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          
          // Create a member with specific initial traits
          const initialTraits: TraitType[] = ALL_TRAITS.slice(0, initialTraitCount);
          
          const member: TeamMember = {
            id: 'test-trait-acquisition',
            name: 'Test',
            rarity: 'rare',
            baseStats: { computeContribution: 10, dataEfficiency: 10, maintenanceSkill: 10 },
            traits: initialTraits,
            level: startLevel,
            experience: EXP_PER_LEVEL[startLevel - 1] || 0,
            hiringCost: 2000,
            salary: 350,
          };

          const stateWithMember: GameState = {
            ...state,
            team: [member],
          };

          // Add enough experience to level up to level 10
          const expToMax = EXP_PER_LEVEL[9] + 100; // More than enough for level 10
          const newState = TeamSystem.addExperience(stateWithMember, member.id, expToMax);
          const updatedMember = newState.team.find(m => m.id === member.id);

          expect(updatedMember).toBeTruthy();
          if (updatedMember) {
            // Traits should never exceed MAX_TRAITS (3)
            expect(updatedMember.traits.length).toBeLessThanOrEqual(TEAM_CONSTANTS.MAX_TRAITS);
            
            // Traits should be at least the initial count (can only gain, not lose)
            expect(updatedMember.traits.length).toBeGreaterThanOrEqual(initialTraitCount);
            
            // All original traits should still be present
            for (const trait of initialTraits) {
              expect(updatedMember.traits).toContain(trait);
            }
            
            // All traits should be unique
            const uniqueTraits = new Set(updatedMember.traits);
            expect(uniqueTraits.size).toBe(updatedMember.traits.length);
            
            // All traits should be valid
            for (const trait of updatedMember.traits) {
              expect(ALL_TRAITS).toContain(trait);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 44b: Trait acquisition respects max limit
  // **Validates: Requirements 20.5**
  // *For any* member with 3 traits, leveling up should not add more traits
  it('Property 44b: Trait acquisition respects max limit - no traits added when at max', () => {
    fc.assert(
      fc.property(
        arbitraryArchetype(),
        arbitraryDifficulty(),
        (archetype, difficulty) => {
          const state = GameEngine.initializeGame(archetype, difficulty);
          
          // Create a member with max traits (3)
          const maxTraits: TraitType[] = ['algorithm_expert', 'data_engineer', 'architect'];
          
          const member: TeamMember = {
            id: 'test-max-traits',
            name: 'Test',
            rarity: 'legendary',
            baseStats: { computeContribution: 15, dataEfficiency: 15, maintenanceSkill: 15 },
            traits: maxTraits,
            level: 1,
            experience: 0,
            hiringCost: 4500,
            salary: 900,
          };

          const stateWithMember: GameState = {
            ...state,
            team: [member],
          };

          // Add enough experience to reach level 10
          const expToMax = EXP_PER_LEVEL[9] + 100;
          const newState = TeamSystem.addExperience(stateWithMember, member.id, expToMax);
          const updatedMember = newState.team.find(m => m.id === member.id);

          expect(updatedMember).toBeTruthy();
          if (updatedMember) {
            // Traits should remain at exactly 3 (max)
            expect(updatedMember.traits.length).toBe(TEAM_CONSTANTS.MAX_TRAITS);
            
            // Should have the same traits as before
            for (const trait of maxTraits) {
              expect(updatedMember.traits).toContain(trait);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 44c: tryAcquireNewTrait returns valid trait or null
  // **Validates: Requirements 20.5**
  // *For any* current trait set, tryAcquireNewTrait returns either a valid new trait or null
  it('Property 44c: tryAcquireNewTrait - returns valid new trait or null', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTraitType(), { minLength: 0, maxLength: 3 }),
        (currentTraits) => {
          // Make traits unique
          const uniqueTraits = [...new Set(currentTraits)];
          
          // Run multiple times to test probability
          for (let i = 0; i < 10; i++) {
            const result = TeamSystem.tryAcquireNewTrait(uniqueTraits);
            
            if (uniqueTraits.length >= TEAM_CONSTANTS.MAX_TRAITS) {
              // Should always return null when at max
              expect(result).toBeNull();
            } else if (result !== null) {
              // If a trait is returned, it should be valid and not already owned
              expect(ALL_TRAITS).toContain(result);
              expect(uniqueTraits).not.toContain(result);
            }
            // result can be null due to 25% probability
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Export ALL_TRAITS for testing
const ALL_TRAITS: TraitType[] = [
  'algorithm_expert', 'data_engineer', 'architect', 'product_manager',
  'fullstack', 'efficiency', 'cost_control', 'data_mining', 'tester'
];
