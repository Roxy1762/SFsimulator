/**
 * 防抖工具函数
 * 需求: 11.2 - resize 事件防抖
 * 
 * 用于优化布局计算性能，防止频繁的 resize 事件触发导致性能问题
 */

/**
 * 防抖函数类型定义
 */
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * 创建防抖函数
 * 
 * @param func - 需要防抖的函数
 * @param delay - 防抖延迟时间（毫秒），默认 100ms
 * @returns 防抖后的函数，包含 cancel 和 flush 方法
 * 
 * @example
 * ```typescript
 * const debouncedResize = debounce((width: number, height: number) => {
 *   console.log(`Viewport: ${width}x${height}`);
 * }, 100);
 * 
 * window.addEventListener('resize', () => {
 *   debouncedResize(window.innerWidth, window.innerHeight);
 * });
 * 
 * // 取消待执行的防抖调用
 * debouncedResize.cancel();
 * 
 * // 立即执行待执行的防抖调用
 * debouncedResize.flush();
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 100
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFn = (...args: Parameters<T>): void => {
    lastArgs = args;
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (lastArgs !== null) {
        func(...lastArgs);
        lastArgs = null;
      }
      timeoutId = null;
    }, delay);
  };

  /**
   * 取消待执行的防抖调用
   */
  debouncedFn.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  /**
   * 立即执行待执行的防抖调用
   */
  debouncedFn.flush = (): void => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}

/**
 * 默认的 resize 事件防抖延迟时间（毫秒）
 * 需求: 11.2 - 设置 100ms 延迟
 */
export const DEFAULT_RESIZE_DEBOUNCE_DELAY = 100;

/**
 * 创建用于 resize 事件的防抖处理器
 * 
 * @param handler - resize 事件处理函数
 * @param delay - 防抖延迟时间，默认 100ms
 * @returns 防抖后的处理器
 * 
 * @example
 * ```typescript
 * const handleResize = createResizeHandler((width, height) => {
 *   // 布局计算逻辑
 *   updateLayout(width, height);
 * });
 * 
 * window.addEventListener('resize', handleResize);
 * 
 * // 清理
 * window.removeEventListener('resize', handleResize);
 * handleResize.cancel();
 * ```
 */
export function createResizeHandler(
  handler: (width: number, height: number) => void,
  delay: number = DEFAULT_RESIZE_DEBOUNCE_DELAY
): DebouncedFunction<(width: number, height: number) => void> & { handleEvent: () => void } {
  const debouncedHandler = debounce(handler, delay);
  
  // 添加 handleEvent 方法以支持直接作为事件监听器使用
  const resizeHandler = Object.assign(debouncedHandler, {
    handleEvent: () => {
      debouncedHandler(window.innerWidth, window.innerHeight);
    }
  });
  
  return resizeHandler;
}

export default debounce;
