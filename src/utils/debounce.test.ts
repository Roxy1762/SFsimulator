/**
 * 防抖工具函数属性测试
 * 
 * Property 12: Resize Event Debouncing
 * *For any* window resize event that triggers JavaScript layout calculations, 
 * the handler should be debounced with a minimum delay of 100ms to prevent 
 * performance issues.
 * 
 * **Validates: Requirements 11.2**
 * **Feature: responsive-layout-optimization, Property 12: Resize Event Debouncing**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { debounce, createResizeHandler, DEFAULT_RESIZE_DEBOUNCE_DELAY } from './debounce';

describe('Property 12: Resize Event Debouncing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * 验证默认防抖延迟为 100ms - 需求: 11.2
   */
  it('默认防抖延迟应为 100ms - 需求: 11.2', () => {
    expect(DEFAULT_RESIZE_DEBOUNCE_DELAY).toBe(100);
  });

  /**
   * Property 12.1: 对于任意快速连续调用，防抖函数应只执行最后一次
   */
  describe('Property 12.1: 快速连续调用只执行最后一次', () => {
    it('对于任意数量的快速连续调用，防抖函数应只执行一次', () => {
      fc.assert(
        fc.property(
          // 生成 2 到 50 次的快速连续调用
          fc.integer({ min: 2, max: 50 }),
          (callCount) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            // 快速连续调用
            for (let i = 0; i < callCount; i++) {
              debouncedFn(i);
            }
            
            // 在延迟时间内，函数不应被调用
            expect(mockFn).not.toHaveBeenCalled();
            
            // 等待防抖延迟
            vi.advanceTimersByTime(100);
            
            // 函数应只被调用一次
            expect(mockFn).toHaveBeenCalledTimes(1);
            
            // 应使用最后一次调用的参数
            expect(mockFn).toHaveBeenCalledWith(callCount - 1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意间隔小于延迟时间的调用，应合并为一次执行', () => {
      fc.assert(
        fc.property(
          // 生成 10 到 99ms 的间隔（小于 100ms 延迟）
          fc.integer({ min: 10, max: 99 }),
          fc.integer({ min: 2, max: 10 }),
          (interval, callCount) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            // 以小于延迟时间的间隔调用
            for (let i = 0; i < callCount; i++) {
              debouncedFn(i);
              vi.advanceTimersByTime(interval);
            }
            
            // 在最后一次调用后等待剩余时间
            vi.advanceTimersByTime(100 - interval);
            
            // 函数应只被调用一次
            expect(mockFn).toHaveBeenCalledTimes(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12.2: 对于任意延迟时间，防抖应在指定延迟后执行
   */
  describe('Property 12.2: 延迟时间正确性', () => {
    it('对于任意延迟时间，函数应在指定延迟后执行', () => {
      fc.assert(
        fc.property(
          // 生成 50 到 500ms 的延迟时间
          fc.integer({ min: 50, max: 500 }),
          (delay) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, delay);
            
            debouncedFn('test');
            
            // 在延迟时间前，函数不应被调用
            vi.advanceTimersByTime(delay - 1);
            expect(mockFn).not.toHaveBeenCalled();
            
            // 在延迟时间后，函数应被调用
            vi.advanceTimersByTime(1);
            expect(mockFn).toHaveBeenCalledTimes(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('默认延迟应为 100ms', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn);
      
      debouncedFn('test');
      
      // 99ms 后不应执行
      vi.advanceTimersByTime(99);
      expect(mockFn).not.toHaveBeenCalled();
      
      // 100ms 后应执行
      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Property 12.3: cancel 方法应取消待执行的调用
   */
  describe('Property 12.3: cancel 方法正确性', () => {
    it('对于任意待执行的调用，cancel 应阻止执行', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (callCount) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            // 调用多次
            for (let i = 0; i < callCount; i++) {
              debouncedFn(i);
            }
            
            // 取消
            debouncedFn.cancel();
            
            // 等待延迟时间
            vi.advanceTimersByTime(100);
            
            // 函数不应被调用
            expect(mockFn).not.toHaveBeenCalled();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('cancel 后可以重新调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('first');
      debouncedFn.cancel();
      
      debouncedFn('second');
      vi.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });

  /**
   * Property 12.4: flush 方法应立即执行待执行的调用
   */
  describe('Property 12.4: flush 方法正确性', () => {
    it('对于任意待执行的调用，flush 应立即执行', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (arg) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            debouncedFn(arg);
            
            // 立即 flush
            debouncedFn.flush();
            
            // 函数应立即被调用
            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenCalledWith(arg);
            
            // 等待延迟时间后不应再次调用
            vi.advanceTimersByTime(100);
            expect(mockFn).toHaveBeenCalledTimes(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('没有待执行调用时 flush 不应执行', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn.flush();
      
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  /**
   * Property 12.5: createResizeHandler 应正确创建 resize 处理器
   */
  describe('Property 12.5: createResizeHandler 正确性', () => {
    it('createResizeHandler 应使用默认 100ms 延迟', () => {
      const mockHandler = vi.fn();
      const resizeHandler = createResizeHandler(mockHandler);
      
      resizeHandler(1920, 1080);
      
      // 99ms 后不应执行
      vi.advanceTimersByTime(99);
      expect(mockHandler).not.toHaveBeenCalled();
      
      // 100ms 后应执行
      vi.advanceTimersByTime(1);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(1920, 1080);
    });

    it('对于任意视口尺寸，createResizeHandler 应正确传递参数', () => {
      fc.assert(
        fc.property(
          // 生成合理的视口尺寸
          fc.integer({ min: 320, max: 3840 }),
          fc.integer({ min: 480, max: 2160 }),
          (width, height) => {
            const mockHandler = vi.fn();
            const resizeHandler = createResizeHandler(mockHandler);
            
            resizeHandler(width, height);
            vi.advanceTimersByTime(100);
            
            expect(mockHandler).toHaveBeenCalledWith(width, height);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('createResizeHandler 应支持自定义延迟', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }),
          (delay) => {
            const mockHandler = vi.fn();
            const resizeHandler = createResizeHandler(mockHandler, delay);
            
            resizeHandler(1920, 1080);
            
            // 延迟前不应执行
            vi.advanceTimersByTime(delay - 1);
            expect(mockHandler).not.toHaveBeenCalled();
            
            // 延迟后应执行
            vi.advanceTimersByTime(1);
            expect(mockHandler).toHaveBeenCalledTimes(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12.6: 防抖应保持参数类型正确性
   */
  describe('Property 12.6: 参数类型正确性', () => {
    it('对于任意类型的参数，防抖函数应正确传递', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.integer()),
            fc.record({ key: fc.string(), value: fc.integer() })
          ),
          (arg) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            debouncedFn(arg);
            vi.advanceTimersByTime(100);
            
            expect(mockFn).toHaveBeenCalledWith(arg);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于多个参数，防抖函数应正确传递所有参数', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          (arg1, arg2, arg3) => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            debouncedFn(arg1, arg2, arg3);
            vi.advanceTimersByTime(100);
            
            expect(mockFn).toHaveBeenCalledWith(arg1, arg2, arg3);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 边界条件测试
   */
  describe('边界条件测试', () => {
    it('延迟为 0 时应立即执行（在下一个事件循环）', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);
      
      debouncedFn('test');
      
      // 同步时不应执行
      expect(mockFn).not.toHaveBeenCalled();
      
      // 下一个事件循环应执行
      vi.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('多次 cancel 不应报错', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('test');
      debouncedFn.cancel();
      debouncedFn.cancel();
      debouncedFn.cancel();
      
      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('多次 flush 不应重复执行', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('test');
      debouncedFn.flush();
      debouncedFn.flush();
      debouncedFn.flush();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
