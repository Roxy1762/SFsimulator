/**
 * OperationsModal 组件
 * 弹窗式操作选择界面，替代原有的展开式菜单
 * 
 * 功能:
 * - 点击类别按钮打开弹窗
 * - 弹窗内显示该类别的所有操作
 * - 支持执行操作后自动关闭弹窗
 */

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { GameState, OperationCategory } from '../types';
import { OPERATION_CATEGORIES } from '../types';
import { getOperationsByCategory } from '../operations';
import { OperationButton } from './OperationButton';
import './OperationsModal.css';

interface OperationsModalProps {
  gameState: GameState;
  onExecuteOperation: (operationId: string) => void;
  disabled?: boolean;
}

export function OperationsModal({ 
  gameState, 
  onExecuteOperation,
  disabled = false 
}: OperationsModalProps) {
  // 当前打开的类别弹窗
  const [openCategory, setOpenCategory] = useState<OperationCategory | null>(null);

  // 打开类别弹窗
  const handleOpenCategory = useCallback((categoryId: OperationCategory) => {
    setOpenCategory(categoryId);
  }, []);

  // 关闭弹窗
  const handleCloseModal = useCallback(() => {
    setOpenCategory(null);
  }, []);

  // 执行操作并关闭弹窗
  const handleExecuteOperation = useCallback((operationId: string) => {
    onExecuteOperation(operationId);
    // 执行后关闭弹窗
    setOpenCategory(null);
  }, [onExecuteOperation]);

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openCategory) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCategory, handleCloseModal]);

  // 模态框打开时锁定背景滚动 - 需求 10.2
  useEffect(() => {
    if (openCategory) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [openCategory]);

  // 获取类别的可执行操作数量
  const getExecutableCount = (categoryId: OperationCategory) => {
    const operations = getOperationsByCategory(categoryId);
    return operations.filter(op => op.canExecute(gameState)).length;
  };

  // 获取当前打开类别的操作列表
  const currentOperations = openCategory ? getOperationsByCategory(openCategory) : [];
  const currentCategory = OPERATION_CATEGORIES.find(c => c.id === openCategory);

  return (
    <div className={`operations-modal-container operations-modal-trigger ${gameState.risks.serverMeltdown ? 'meltdown' : ''}`} role="region" aria-label="操作面板" tabIndex={0}>
      <h3 className="panel-title">
        <span className="title-icon" aria-hidden="true">⚡</span>
        可用操作
      </h3>
      
      {/* 类别按钮网格 */}
      <div className="category-buttons-grid" role="group" aria-label="操作类别">
        {OPERATION_CATEGORIES.map((category) => {
          const executableCount = getExecutableCount(category.id);
          const totalCount = getOperationsByCategory(category.id).length;
          
          return (
            <button
              key={category.id}
              className={`category-button ${category.id} ${executableCount > 0 ? 'has-executable' : ''}`}
              onClick={() => handleOpenCategory(category.id)}
              disabled={disabled}
              title={category.description}
            >
              <span className="category-btn-icon">{category.icon}</span>
              <span className="category-btn-name">{category.name}</span>
              <span className="category-btn-count">
                <span className={`exec-count ${executableCount > 0 ? 'active' : ''}`}>
                  {executableCount}
                </span>
                /{totalCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 弹窗遮罩和内容 - 使用 Portal 渲染到 body 以避免堆叠上下文问题 */}
      {openCategory && currentCategory && createPortal(
        <div className="modal-overlay" onClick={handleCloseModal} role="presentation">
          <div 
            className={`modal-content ${openCategory}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <span className="modal-icon" aria-hidden="true">{currentCategory.icon}</span>
              <h4 className="modal-title" id="modal-title">{currentCategory.name}</h4>
              <span className="modal-description">{currentCategory.description}</span>
              <button 
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body" role="list" aria-label="操作列表">
              {currentOperations.length > 0 ? (
                <div className="modal-operations">
                  {currentOperations.map((operation) => (
                    <OperationButton
                      key={operation.id}
                      operation={operation}
                      gameState={gameState}
                      onExecute={handleExecuteOperation}
                      disabled={disabled}
                    />
                  ))}
                </div>
              ) : (
                <div className="modal-empty">
                  <span className="empty-icon">📭</span>
                  <span className="empty-text">暂无可用操作</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default OperationsModal;
