/**
 * StorageManager 模块
 * 处理游戏状态的持久化存储
 * 
 * 需求: 9.1, 9.2, 9.3, 9.4
 */

import { GameState } from '../types';

const STORAGE_KEY = 'algorithm_ascension_save';

/**
 * 存储操作结果
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 验证游戏状态是否有效
 * 检查必需字段是否存在
 */
function isValidGameState(obj: unknown): obj is GameState {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const state = obj as Record<string, unknown>;
  
  // 检查顶层必需字段
  if (!state.resources || typeof state.resources !== 'object') return false;
  if (!state.metrics || typeof state.metrics !== 'object') return false;
  if (!state.progress || typeof state.progress !== 'object') return false;
  if (!state.risks || typeof state.risks !== 'object') return false;
  if (!state.archetype || typeof state.archetype !== 'string') return false;
  if (!state.gameStatus || typeof state.gameStatus !== 'string') return false;
  
  // 检查 resources 字段
  const resources = state.resources as Record<string, unknown>;
  if (typeof resources.budget !== 'number') return false;
  if (typeof resources.computePoints !== 'number') return false;
  if (typeof resources.computeMax !== 'number') return false;
  if (typeof resources.dirtyData !== 'number') return false;
  if (typeof resources.goldenData !== 'number') return false;
  // dataCapacity 是新字段，兼容旧存档
  if (resources.dataCapacity !== undefined && typeof resources.dataCapacity !== 'number') return false;
  
  // 检查 metrics 字段
  const metrics = state.metrics as Record<string, unknown>;
  if (typeof metrics.fitScore !== 'number') return false;
  if (typeof metrics.entropy !== 'number') return false;
  if (typeof metrics.fitScoreCap !== 'number') return false;
  // 新增多维度指标，兼容旧存档
  if (metrics.accuracy !== undefined && typeof metrics.accuracy !== 'number') return false;
  if (metrics.speed !== undefined && typeof metrics.speed !== 'number') return false;
  if (metrics.creativity !== undefined && typeof metrics.creativity !== 'number') return false;
  if (metrics.robustness !== undefined && typeof metrics.robustness !== 'number') return false;
  
  // 检查 progress 字段
  const progress = state.progress as Record<string, unknown>;
  if (typeof progress.turn !== 'number') return false;
  if (typeof progress.turnsUntilExam !== 'number') return false;
  if (typeof progress.consecutiveNegativeBudget !== 'number') return false;
  
  // 检查 risks 字段
  const risks = state.risks as Record<string, unknown>;
  if (typeof risks.legalRisk !== 'number') return false;
  if (typeof risks.serverMeltdown !== 'boolean') return false;
  
  // 检查 equipment 字段（新增，兼容旧存档）
  if (state.equipment !== undefined) {
    if (typeof state.equipment !== 'object') return false;
    const equipment = state.equipment as Record<string, unknown>;
    const equipmentTypes = ['gpu', 'storage', 'network', 'cooling'];
    for (const type of equipmentTypes) {
      if (equipment[type] !== undefined) {
        const eq = equipment[type] as Record<string, unknown>;
        if (typeof eq.level !== 'number') return false;
        if (typeof eq.maxLevel !== 'number') return false;
      }
    }
  }
  
  // 检查 archetype 值
  const validArchetypes = ['startup', 'bigtech', 'academic'];
  if (!validArchetypes.includes(state.archetype as string)) return false;
  
  // 检查 gameStatus 值
  const validStatuses = ['playing', 'gameOver', 'victory'];
  if (!validStatuses.includes(state.gameStatus as string)) return false;
  
  return true;
}

/**
 * 保存游戏状态到 LocalStorage
 * 
 * @param state - 要保存的游戏状态
 * @returns 操作结果
 */
export function saveGame(state: GameState): StorageResult<void> {
  try {
    // 验证状态有效性
    if (!isValidGameState(state)) {
      return {
        success: false,
        error: '无效的游戏状态'
      };
    }
    
    // 序列化为 JSON
    const serialized = JSON.stringify(state);
    
    // 存储到 LocalStorage
    localStorage.setItem(STORAGE_KEY, serialized);
    
    return { success: true };
  } catch (error) {
    // 处理序列化错误或存储配额超出等错误
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: `保存游戏失败: ${errorMessage}`
    };
  }
}

/**
 * 从 LocalStorage 加载游戏状态
 * 
 * @returns 操作结果，包含加载的游戏状态或错误信息
 */
export function loadGame(): StorageResult<GameState> {
  try {
    // 从 LocalStorage 读取
    const serialized = localStorage.getItem(STORAGE_KEY);
    
    // 检查是否存在存档
    if (serialized === null) {
      return {
        success: false,
        error: '没有找到存档'
      };
    }
    
    // 反序列化 JSON
    const parsed = JSON.parse(serialized);
    
    // 验证状态有效性
    if (!isValidGameState(parsed)) {
      return {
        success: false,
        error: '存档损坏，数据格式无效'
      };
    }
    
    return {
      success: true,
      data: parsed as GameState
    };
  } catch (error) {
    // 处理 JSON 解析错误等
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: `加载游戏失败: ${errorMessage}`
    };
  }
}

/**
 * 检查是否存在存档
 * 
 * @returns 是否存在有效存档
 */
export function hasSavedGame(): boolean {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return false;
    }
    
    const parsed = JSON.parse(serialized);
    return isValidGameState(parsed);
  } catch {
    return false;
  }
}

/**
 * 删除存档
 * 
 * @returns 操作结果
 */
export function deleteSave(): StorageResult<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: `删除存档失败: ${errorMessage}`
    };
  }
}

/**
 * 导出存档为 JSON 字符串（用于手动备份）
 * 
 * @param state - 要导出的游戏状态
 * @returns JSON 字符串或 null
 */
export function exportSave(state: GameState): string | null {
  try {
    if (!isValidGameState(state)) {
      return null;
    }
    return JSON.stringify(state, null, 2);
  } catch {
    return null;
  }
}

/**
 * 从 JSON 字符串导入存档
 * 
 * @param jsonString - JSON 格式的存档字符串
 * @returns 操作结果
 */
export function importSave(jsonString: string): StorageResult<GameState> {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!isValidGameState(parsed)) {
      return {
        success: false,
        error: '导入的存档格式无效'
      };
    }
    
    return {
      success: true,
      data: parsed as GameState
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: `导入存档失败: ${errorMessage}`
    };
  }
}
