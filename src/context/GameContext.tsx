/**
 * GameContext - 游戏状态管理
 * 使用 React Context API + useReducer 管理游戏状态
 * 
 * 需求: 7.4, 7.5, 9.5
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import type { GameState, ArchetypeType, ExamResult, GameEvent, LogEntry, EquipmentType, DifficultyLevel } from '../types';
import { DIFFICULTY_CONFIGS, TRAIT_CONFIGS } from '../types';
import { GameEngine } from '../engine/GameEngine';
import { TeamSystem } from '../engine/TeamSystem';
import { SaveSystem } from '../utils/SaveSystem';
import { saveGame, loadGame, hasSavedGame } from '../utils/StorageManager';
import { ALL_OPERATIONS, getOperationById } from '../operations';

// ============ Action 类型定义 ============

export type GameAction =
  | { type: 'INITIALIZE_GAME'; archetype: ArchetypeType; difficulty: DifficultyLevel }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'EXECUTE_OPERATION'; operationId: string; randomValue?: number }
  | { type: 'END_TURN' }
  | { type: 'START_TURN'; randomValue?: number }
  | { type: 'TRIGGER_EXAM'; scenarioRandomValue?: number }
  | { type: 'TRIGGER_EVENT'; triggerRandomValue?: number; eventSelectRandomValue?: number }
  | { type: 'CHECK_GAME_OVER' }
  | { type: 'ADD_LOG'; entry: Omit<LogEntry, 'id' | 'timestamp'> }
  | { type: 'RESET_GAME' }
  | { type: 'UPGRADE_EQUIPMENT'; equipmentType: EquipmentType }
  // 团队系统 actions - 需求: 18.3, 18.6
  | { type: 'HIRE_MEMBER'; memberId: string }
  | { type: 'FIRE_MEMBER'; memberId: string }
  // 存档系统 actions - 需求: 22.1, 22.4
  | { type: 'EXPORT_SAVE' }
  | { type: 'IMPORT_SAVE'; saveString: string }
  // 难度选择 action - 需求: 21.4
  | { type: 'SELECT_DIFFICULTY'; difficulty: DifficultyLevel }
  // 刷新候选人池 action - 需求: 18.1
  | { type: 'REFRESH_HIRING_POOL' };

// ============ 扩展游戏状态（包含日志） ============

export interface ExtendedGameState {
  gameState: GameState | null;
  logs: LogEntry[];
  lastExamResult: ExamResult | null;
  lastEvent: GameEvent | null;
  isInitialized: boolean;
  // 存档系统状态 - 需求: 22.1, 22.4
  lastSaveString: string | null;
  lastImportError: string | null;
}

// ============ 初始状态 ============

const initialExtendedState: ExtendedGameState = {
  gameState: null,
  logs: [],
  lastExamResult: null,
  lastEvent: null,
  isInitialized: false,
  lastSaveString: null,
  lastImportError: null,
};

// ============ 生成唯一ID ============

let logIdCounter = 0;
function generateLogId(): string {
  return `log_${Date.now()}_${logIdCounter++}`;
}

// ============ Reducer 函数 ============

function gameReducer(state: ExtendedGameState, action: GameAction): ExtendedGameState {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      let newGameState = GameEngine.initializeGame(action.archetype, action.difficulty);
      const archetypeName = GameEngine.getArchetypeConfig(action.archetype).name;
      const difficultyName = DIFFICULTY_CONFIGS[action.difficulty].name;
      
      // 生成初始候选人池 - 需求: 18.1
      const initialHiringPool = TeamSystem.generateHiringPool(newGameState);
      newGameState = {
        ...newGameState,
        hiringPool: initialHiringPool,
      };
      
      return {
        ...state,
        gameState: newGameState,
        logs: [{
          id: generateLogId(),
          type: 'system',
          message: `游戏开始！选择了「${archetypeName}」形态，难度：${difficultyName}`,
          turn: 1,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
        lastSaveString: null,
        lastImportError: null,
      };
    }

    case 'LOAD_GAME': {
      return {
        ...state,
        gameState: action.state,
        logs: [{
          id: generateLogId(),
          type: 'system',
          message: '游戏存档已加载',
          turn: action.state.progress.turn,
          timestamp: Date.now(),
        }],
        lastExamResult: null,
        lastEvent: null,
        isInitialized: true,
      };
    }

    case 'EXECUTE_OPERATION': {
      if (!state.gameState) return state;
      
      const operation = getOperationById(action.operationId);
      if (!operation) return state;

      // 检查是否可以执行操作
      if (!GameEngine.canExecuteOperation(state.gameState, operation)) {
        return {
          ...state,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `无法执行「${operation.name}」：资源不足`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      }

      // 检查服务熔断状态
      if (state.gameState.risks.serverMeltdown) {
        return {
          ...state,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `服务熔断中，无法执行操作`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      }

      const newGameState = GameEngine.executeOperation(
        state.gameState,
        operation,
        action.randomValue
      );

      // 生成操作日志
      let logMessage = `执行了「${operation.name}」`;
      if (operation.effects.isGamble) {
        const succeeded = newGameState.metrics.fitScore > state.gameState.metrics.fitScore;
        logMessage += succeeded ? ' - 成功！' : ' - 失败...';
      }

      return {
        ...state,
        gameState: newGameState,
        logs: [...state.logs, {
          id: generateLogId(),
          type: 'operation',
          message: logMessage,
          turn: state.gameState.progress.turn,
          timestamp: Date.now(),
        }],
      };
    }

    case 'END_TURN': {
      if (!state.gameState) return state;

      const { newState, shouldExam } = GameEngine.endTurn(state.gameState);

      return {
        ...state,
        gameState: newState,
        logs: [...state.logs, {
          id: generateLogId(),
          type: 'system',
          message: `回合 ${state.gameState.progress.turn} 结束${shouldExam ? '，即将进行考核！' : ''}`,
          turn: state.gameState.progress.turn,
          timestamp: Date.now(),
        }],
      };
    }

    case 'START_TURN': {
      if (!state.gameState) return state;

      // 基础回合开始逻辑（包括重置外快任务计数 - 需求 23.3）
      let newGameState = GameEngine.startTurn(state.gameState, action.randomValue);
      const logs = [...state.logs];

      // 刷新候选人池 - 需求: 18.1
      const newHiringPool = TeamSystem.generateHiringPool(newGameState);
      newGameState = {
        ...newGameState,
        hiringPool: newHiringPool,
      };

      // 应用团队 AP 加成 - 需求: 19.1 (效率达人词条)
      const teamBonuses = TeamSystem.calculateTeamBonuses(newGameState);
      if (teamBonuses.apBonus > 0) {
        const apBonus = Math.floor(teamBonuses.apBonus);
        newGameState = {
          ...newGameState,
          resources: {
            ...newGameState.resources,
            computePoints: Math.min(
              newGameState.resources.computePoints + apBonus,
              newGameState.resources.computeMax + apBonus // 允许超过基础上限
            ),
          },
        };
        if (apBonus > 0) {
          logs.push({
            id: generateLogId(),
            type: 'system',
            message: `团队效率加成：额外获得 ${apBonus} AP`,
            turn: newGameState.progress.turn,
            timestamp: Date.now(),
          });
        }
      }

      if (newGameState.risks.serverMeltdown) {
        logs.push({
          id: generateLogId(),
          type: 'system',
          message: '⚠️ 服务熔断！本回合无法执行操作，扣除维修费用 1000',
          turn: newGameState.progress.turn,
          timestamp: Date.now(),
        });
      }

      return {
        ...state,
        gameState: newGameState,
        logs,
      };
    }

    case 'TRIGGER_EXAM': {
      if (!state.gameState) return state;

      const { newState, result, salaryInfo } = GameEngine.triggerExam(
        state.gameState,
        action.scenarioRandomValue
      );

      const logs = [...state.logs];
      
      // 添加考核结果日志
      logs.push({
        id: generateLogId(),
        type: 'exam',
        message: `考核「${result.scenario}」完成！获得收益 ${result.finalReward}`,
        turn: state.gameState.progress.turn,
        timestamp: Date.now(),
      });

      // 添加工资支付日志 - 需求: 25.2
      if (salaryInfo && salaryInfo.totalPaid > 0) {
        logs.push({
          id: generateLogId(),
          type: 'system',
          message: `支付团队工资：${salaryInfo.totalPaid}`,
          turn: state.gameState.progress.turn,
          timestamp: Date.now(),
        });
      }

      // 添加解雇成员日志 - 需求: 25.5
      if (salaryInfo && salaryInfo.firedMembers.length > 0) {
        const firedNames = salaryInfo.firedMembers.map(m => m.name).join('、');
        logs.push({
          id: generateLogId(),
          type: 'system',
          message: `⚠️ 资金不足支付工资，解雇了：${firedNames}`,
          turn: state.gameState.progress.turn,
          timestamp: Date.now(),
        });
      }

      return {
        ...state,
        gameState: newState,
        lastExamResult: result,
        logs,
      };
    }

    case 'TRIGGER_EVENT': {
      if (!state.gameState) return state;

      const { newState, event } = GameEngine.triggerRandomEvent(
        state.gameState,
        action.triggerRandomValue,
        action.eventSelectRandomValue
      );

      if (!event) {
        return state;
      }

      return {
        ...state,
        gameState: newState,
        lastEvent: event,
        logs: [...state.logs, {
          id: generateLogId(),
          type: 'event',
          message: `事件「${event.name}」：${event.description}`,
          turn: state.gameState.progress.turn,
          timestamp: Date.now(),
        }],
      };
    }

    case 'CHECK_GAME_OVER': {
      if (!state.gameState) return state;

      const newGameState = GameEngine.checkGameOver(state.gameState);

      if (newGameState.gameStatus === 'gameOver' && state.gameState.gameStatus === 'playing') {
        return {
          ...state,
          gameState: newGameState,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `游戏结束：${newGameState.gameOverReason}`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      }

      return {
        ...state,
        gameState: newGameState,
      };
    }

    case 'ADD_LOG': {
      return {
        ...state,
        logs: [...state.logs, {
          ...action.entry,
          id: generateLogId(),
          timestamp: Date.now(),
        }],
      };
    }

    case 'RESET_GAME': {
      return initialExtendedState;
    }

    case 'UPGRADE_EQUIPMENT': {
      if (!state.gameState) return state;

      const equipmentType = action.equipmentType;
      if (!GameEngine.canUpgradeEquipment(state.gameState, equipmentType)) {
        return state;
      }

      const currentInfo = GameEngine.getEquipmentInfo(state.gameState, equipmentType);
      const newGameState = GameEngine.upgradeEquipment(state.gameState, equipmentType);
      const newInfo = GameEngine.getEquipmentInfo(newGameState, equipmentType);

      const equipmentNames: Record<string, string> = {
        gpu: 'GPU',
        storage: '存储',
        network: '网络',
        cooling: '散热',
      };

      return {
        ...state,
        gameState: newGameState,
        logs: [...state.logs, {
          id: generateLogId(),
          type: 'system',
          message: `升级${equipmentNames[equipmentType]}：${currentInfo.name} → ${newInfo.name}`,
          turn: state.gameState.progress.turn,
          timestamp: Date.now(),
        }],
      };
    }

    // ============ 团队系统 actions ============

    case 'HIRE_MEMBER': {
      // 需求: 18.3 - 扣除雇佣费用并将成员加入团队
      if (!state.gameState) return state;

      try {
        const newGameState = TeamSystem.hireMember(state.gameState, action.memberId);
        const hiredMember = newGameState.team.find(m => m.id === action.memberId);
        const memberName = hiredMember?.name || '新成员';
        const traitNames = hiredMember?.traits.map(t => TRAIT_CONFIGS[t].name).join('、') || '';

        return {
          ...state,
          gameState: newGameState,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `雇佣了「${memberName}」，词条：${traitNames}`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '雇佣失败';
        return {
          ...state,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `雇佣失败：${errorMessage}`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      }
    }

    case 'FIRE_MEMBER': {
      // 需求: 18.6 - 移除成员并返还50%雇佣费用
      if (!state.gameState) return state;

      try {
        const firedMember = state.gameState.team.find(m => m.id === action.memberId);
        const memberName = firedMember?.name || '成员';
        const refund = firedMember ? Math.floor(firedMember.hiringCost * 0.5) : 0;
        
        const newGameState = TeamSystem.fireMember(state.gameState, action.memberId);

        return {
          ...state,
          gameState: newGameState,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `解雇了「${memberName}」，返还 ${refund} 资金`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '解雇失败';
        return {
          ...state,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: `解雇失败：${errorMessage}`,
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      }
    }

    case 'REFRESH_HIRING_POOL': {
      // 需求: 18.1 - 每回合刷新3个候选人
      if (!state.gameState) return state;

      const newHiringPool = TeamSystem.generateHiringPool(state.gameState);
      
      return {
        ...state,
        gameState: {
          ...state.gameState,
          hiringPool: newHiringPool,
        },
      };
    }

    // ============ 存档系统 actions ============

    case 'EXPORT_SAVE': {
      // 需求: 22.1 - 将当前游戏状态序列化为Base64编码字符串
      if (!state.gameState) return state;

      const saveString = SaveSystem.exportSave(state.gameState);
      
      if (saveString) {
        return {
          ...state,
          lastSaveString: saveString,
          lastImportError: null,
          logs: [...state.logs, {
            id: generateLogId(),
            type: 'system',
            message: '存档已导出',
            turn: state.gameState.progress.turn,
            timestamp: Date.now(),
          }],
        };
      } else {
        return {
          ...state,
          lastSaveString: null,
          lastImportError: '导出存档失败',
        };
      }
    }

    case 'IMPORT_SAVE': {
      // 需求: 22.4 - 验证并反序列化存档数据
      const result = SaveSystem.importSave(action.saveString);
      
      if (result.success && result.state) {
        return {
          ...state,
          gameState: result.state,
          lastSaveString: null,
          lastImportError: null,
          isInitialized: true,
          logs: [{
            id: generateLogId(),
            type: 'system',
            message: '存档已导入',
            turn: result.state.progress.turn,
            timestamp: Date.now(),
          }],
        };
      } else {
        return {
          ...state,
          lastImportError: result.error || '导入存档失败',
        };
      }
    }

    // ============ 难度选择 action ============

    case 'SELECT_DIFFICULTY': {
      // 需求: 21.4 - 应用难度参数修正
      // 这个 action 主要用于在游戏初始化前选择难度
      // 实际的难度应用在 INITIALIZE_GAME 中完成
      // 这里可以用于更新 UI 状态或预览难度效果
      return state;
    }

    default:
      return state;
  }
}

// ============ Context 定义 ============

interface GameContextValue {
  state: ExtendedGameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// ============ Provider 组件 ============

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialExtendedState);

  // 自动保存逻辑 - 当游戏状态改变时保存
  useEffect(() => {
    if (state.gameState && state.isInitialized) {
      saveGame(state.gameState);
    }
  }, [state.gameState, state.isInitialized]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// ============ 自定义 Hooks ============

/**
 * useGameContext - 获取完整的 Context 值
 * 内部使用，确保在 Provider 内部调用
 */
function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

/**
 * useGameState - 访问游戏状态
 * 需求: 7.4
 */
export function useGameState(): ExtendedGameState {
  const { state } = useGameContext();
  return state;
}

/**
 * useGameActions - 访问 dispatch 函数和封装的 action 方法
 * 需求: 7.4
 */
export function useGameActions() {
  const { dispatch } = useGameContext();

  const initializeGame = useCallback((archetype: ArchetypeType, difficulty: DifficultyLevel = 'normal') => {
    dispatch({ type: 'INITIALIZE_GAME', archetype, difficulty });
  }, [dispatch]);

  const loadSavedGame = useCallback(() => {
    const result = loadGame();
    if (result.success && result.data) {
      dispatch({ type: 'LOAD_GAME', state: result.data });
      return true;
    }
    return false;
  }, [dispatch]);

  const executeOperation = useCallback((operationId: string, randomValue?: number) => {
    dispatch({ type: 'EXECUTE_OPERATION', operationId, randomValue });
  }, [dispatch]);

  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, [dispatch]);

  const startTurn = useCallback((randomValue?: number) => {
    dispatch({ type: 'START_TURN', randomValue });
  }, [dispatch]);

  const triggerExam = useCallback((scenarioRandomValue?: number) => {
    dispatch({ type: 'TRIGGER_EXAM', scenarioRandomValue });
  }, [dispatch]);

  const triggerEvent = useCallback((triggerRandomValue?: number, eventSelectRandomValue?: number) => {
    dispatch({ type: 'TRIGGER_EVENT', triggerRandomValue, eventSelectRandomValue });
  }, [dispatch]);

  const checkGameOver = useCallback(() => {
    dispatch({ type: 'CHECK_GAME_OVER' });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_LOG', entry });
  }, [dispatch]);

  const upgradeEquipment = useCallback((equipmentType: EquipmentType) => {
    dispatch({ type: 'UPGRADE_EQUIPMENT', equipmentType });
  }, [dispatch]);

  // 检查是否有存档
  const checkHasSavedGame = useCallback(() => {
    return hasSavedGame();
  }, []);

  // ============ 团队系统 actions ============

  // 雇佣团队成员 - 需求: 18.3
  const hireMember = useCallback((memberId: string) => {
    dispatch({ type: 'HIRE_MEMBER', memberId });
  }, [dispatch]);

  // 解雇团队成员 - 需求: 18.6
  const fireMember = useCallback((memberId: string) => {
    dispatch({ type: 'FIRE_MEMBER', memberId });
  }, [dispatch]);

  // 刷新候选人池 - 需求: 18.1
  const refreshHiringPool = useCallback(() => {
    dispatch({ type: 'REFRESH_HIRING_POOL' });
  }, [dispatch]);

  // ============ 存档系统 actions ============

  // 导出存档 - 需求: 22.1
  const exportSave = useCallback(() => {
    dispatch({ type: 'EXPORT_SAVE' });
  }, [dispatch]);

  // 导入存档 - 需求: 22.4
  const importSave = useCallback((saveString: string) => {
    dispatch({ type: 'IMPORT_SAVE', saveString });
  }, [dispatch]);

  // ============ 难度选择 action ============

  // 选择难度 - 需求: 21.4
  const selectDifficulty = useCallback((difficulty: DifficultyLevel) => {
    dispatch({ type: 'SELECT_DIFFICULTY', difficulty });
  }, [dispatch]);

  return {
    dispatch,
    initializeGame,
    loadSavedGame,
    executeOperation,
    endTurn,
    startTurn,
    triggerExam,
    triggerEvent,
    checkGameOver,
    resetGame,
    addLog,
    upgradeEquipment,
    checkHasSavedGame,
    // 团队系统
    hireMember,
    fireMember,
    refreshHiringPool,
    // 存档系统
    exportSave,
    importSave,
    // 难度选择
    selectDifficulty,
  };
}

/**
 * useOperations - 获取可用操作列表
 * 需求: 7.4
 */
export function useOperations() {
  const { state } = useGameContext();
  const gameState = state.gameState;

  // 获取所有操作及其可执行状态
  const operations = useMemo(() => {
    return ALL_OPERATIONS.map(operation => ({
      ...operation,
      canExecuteNow: gameState ? operation.canExecute(gameState) : false,
    }));
  }, [gameState]);

  // 按类别分组的操作
  const operationsByCategory = useMemo(() => {
    return {
      data: operations.filter(op => op.category === 'data'),
      training: operations.filter(op => op.category === 'training'),
      maintenance: operations.filter(op => op.category === 'maintenance'),
    };
  }, [operations]);

  // 获取可执行的操作
  const executableOperations = useMemo(() => {
    return operations.filter(op => op.canExecuteNow);
  }, [operations]);

  return {
    allOperations: operations,
    operationsByCategory,
    executableOperations,
    getOperationById,
  };
}

export { GameContext };
