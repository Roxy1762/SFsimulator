/**
 * SaveSystem 模块
 * 处理游戏存档的导出和导入功能
 * 
 * 需求: 22.1 - 导出存档为Base64编码字符串
 * 需求: 22.4 - 验证并反序列化存档数据
 * 需求: 22.7 - 存档包含版本号以支持向后兼容
 */

import { GameState, DifficultyLevel } from '../types';

/**
 * 当前存档版本号
 */
export const CURRENT_SAVE_VERSION = '2.0.0';

/**
 * 存档数据结构
 */
export interface SaveData {
  version: string;
  timestamp: number;
  state: GameState;
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  state?: GameState;
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
  
  // 检查 metrics 字段
  const metrics = state.metrics as Record<string, unknown>;
  if (typeof metrics.fitScore !== 'number') return false;
  if (typeof metrics.entropy !== 'number') return false;
  if (typeof metrics.fitScoreCap !== 'number') return false;
  
  // 检查 progress 字段
  const progress = state.progress as Record<string, unknown>;
  if (typeof progress.turn !== 'number') return false;
  if (typeof progress.turnsUntilExam !== 'number') return false;
  if (typeof progress.consecutiveNegativeBudget !== 'number') return false;
  
  // 检查 risks 字段
  const risks = state.risks as Record<string, unknown>;
  if (typeof risks.legalRisk !== 'number') return false;
  if (typeof risks.serverMeltdown !== 'boolean') return false;
  
  // 检查 archetype 值
  const validArchetypes = ['startup', 'bigtech', 'academic'];
  if (!validArchetypes.includes(state.archetype as string)) return false;
  
  // 检查 gameStatus 值
  const validStatuses = ['playing', 'gameOver', 'victory'];
  if (!validStatuses.includes(state.gameStatus as string)) return false;
  
  return true;
}

/**
 * 版本迁移逻辑
 * 将旧版本存档迁移到当前版本
 * 
 * 需求: 22.7 - 支持向后兼容
 * 
 * @param state - 旧版本的游戏状态
 * @param _fromVersion - 旧版本号（保留用于未来版本迁移逻辑）
 * @returns 迁移后的游戏状态
 */
function migrateState(state: GameState, _fromVersion: string): GameState {
  // 确保新字段存在，提供默认值
  const migratedState: GameState = {
    ...state,
    version: CURRENT_SAVE_VERSION,
    // 确保 dimensions 字段存在
    dimensions: state.dimensions || {
      algorithm: 20,
      dataProcessing: 20,
      stability: 20,
      userExperience: 20,
    },
    // 确保 reputation 字段存在
    reputation: state.reputation ?? 0,
    // 确保 team 字段存在
    team: state.team || [],
    // 确保 hiringPool 字段存在
    hiringPool: state.hiringPool || [],
    // 确保 difficulty 字段存在
    difficulty: state.difficulty || ('normal' as DifficultyLevel),
    // 确保 equipment 字段存在
    equipment: state.equipment || {
      gpu: { type: 'gpu', level: 1, maxLevel: 4 },
      storage: { type: 'storage', level: 1, maxLevel: 4 },
      network: { type: 'network', level: 1, maxLevel: 4 },
      cooling: { type: 'cooling', level: 1, maxLevel: 4 },
    },
    // 确保 progress 字段完整
    progress: {
      ...state.progress,
      examsPassed: state.progress.examsPassed ?? 0,
      sideJobsThisTurn: state.progress.sideJobsThisTurn ?? 0,
    },
    // 确保 metrics 字段完整
    metrics: {
      ...state.metrics,
      accuracy: state.metrics.accuracy ?? state.metrics.fitScore * 0.4,
      speed: state.metrics.speed ?? state.metrics.fitScore * 0.25,
      creativity: state.metrics.creativity ?? state.metrics.fitScore * 0.2,
      robustness: state.metrics.robustness ?? state.metrics.fitScore * 0.15,
    },
    // 确保 resources 字段完整
    resources: {
      ...state.resources,
      dataCapacity: state.resources.dataCapacity ?? 1000,
    },
  };

  return migratedState;
}

/**
 * SaveSystem 类
 * 处理游戏存档的导出和导入
 */
export class SaveSystem {
  /**
   * 导出游戏状态为 Base64 编码字符串
   * 
   * 需求: 22.1 - 将当前游戏状态序列化为Base64编码字符串
   * 需求: 22.7 - 导出存档中包含版本号
   * 
   * @param state - 要导出的游戏状态
   * @returns Base64 编码的存档字符串，如果失败返回 null
   */
  static exportSave(state: GameState): string | null {
    try {
      // 验证状态有效性
      if (!isValidGameState(state)) {
        console.error('导出失败: 无效的游戏状态');
        return null;
      }

      // 创建存档数据结构
      const saveData: SaveData = {
        version: CURRENT_SAVE_VERSION,
        timestamp: Date.now(),
        state: {
          ...state,
          version: CURRENT_SAVE_VERSION,
        },
      };

      // 序列化为 JSON
      const json = JSON.stringify(saveData);
      
      // 编码为 Base64
      // 使用 encodeURIComponent 处理 Unicode 字符
      const base64 = btoa(encodeURIComponent(json));
      
      return base64;
    } catch (error) {
      console.error('导出存档失败:', error);
      return null;
    }
  }

  /**
   * 从 Base64 编码字符串导入游戏状态
   * 
   * 需求: 22.4 - 验证并反序列化存档数据
   * 需求: 22.5 - 如果存档数据有效则恢复游戏状态
   * 需求: 22.6 - 如果存档数据无效则显示错误信息
   * 需求: 22.7 - 支持版本迁移
   * 
   * @param encoded - Base64 编码的存档字符串
   * @returns 导入结果，包含成功状态、游戏状态或错误信息
   */
  static importSave(encoded: string): ImportResult {
    try {
      // 检查输入是否为空
      if (!encoded || typeof encoded !== 'string' || encoded.trim() === '') {
        return {
          success: false,
          error: '存档字符串为空',
        };
      }

      // 解码 Base64
      let json: string;
      try {
        json = decodeURIComponent(atob(encoded.trim()));
      } catch {
        return {
          success: false,
          error: '无效的存档格式：Base64解码失败',
        };
      }

      // 解析 JSON
      let saveData: unknown;
      try {
        saveData = JSON.parse(json);
      } catch {
        return {
          success: false,
          error: '无效的存档格式：JSON解析失败',
        };
      }

      // 验证存档数据结构
      if (!saveData || typeof saveData !== 'object') {
        return {
          success: false,
          error: '无效的存档格式：数据结构错误',
        };
      }

      const data = saveData as Record<string, unknown>;

      // 检查版本号
      if (!data.version || typeof data.version !== 'string') {
        return {
          success: false,
          error: '无效的存档格式：缺少版本号',
        };
      }

      // 检查游戏状态
      if (!data.state || typeof data.state !== 'object') {
        return {
          success: false,
          error: '无效的存档格式：缺少游戏状态',
        };
      }

      // 验证游戏状态有效性
      if (!isValidGameState(data.state)) {
        return {
          success: false,
          error: '无效的存档格式：游戏状态数据不完整',
        };
      }

      // 执行版本迁移
      const migratedState = migrateState(data.state as GameState, data.version as string);

      return {
        success: true,
        state: migratedState,
      };
    } catch (error) {
      console.error('导入存档失败:', error);
      return {
        success: false,
        error: `导入存档失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 复制文本到剪贴板
   * 
   * 需求: 22.2 - 将导出的存档字符串复制到剪贴板
   * 
   * @param text - 要复制的文本
   * @returns Promise，成功返回 true，失败返回 false
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      // 降级方案：使用 document.execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch {
        return false;
      }
    }
  }

  /**
   * 从剪贴板读取文本
   * 
   * @returns Promise，成功返回剪贴板文本，失败返回 null
   */
  static async readFromClipboard(): Promise<string | null> {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('从剪贴板读取失败:', error);
      return null;
    }
  }

  /**
   * 验证存档字符串是否有效（不执行完整导入）
   * 
   * @param encoded - Base64 编码的存档字符串
   * @returns 是否为有效存档
   */
  static isValidSave(encoded: string): boolean {
    const result = this.importSave(encoded);
    return result.success;
  }

  /**
   * 获取当前存档版本号
   * 
   * @returns 当前版本号
   */
  static getCurrentVersion(): string {
    return CURRENT_SAVE_VERSION;
  }
}
