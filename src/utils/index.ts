/**
 * 工具函数模块
 * 导出所有工具函数
 */

// StorageManager - 游戏状态持久化
export {
  saveGame,
  loadGame,
  hasSavedGame,
  deleteSave,
  exportSave,
  importSave,
  type StorageResult
} from './StorageManager';

// SaveSystem - 存档导出导入系统
export {
  SaveSystem,
  CURRENT_SAVE_VERSION,
  type SaveData,
  type ImportResult
} from './SaveSystem';

// Debounce - 防抖工具函数 (需求: 11.2)
export {
  debounce,
  createResizeHandler,
  DEFAULT_RESIZE_DEBOUNCE_DELAY,
  type DebouncedFunction
} from './debounce';
