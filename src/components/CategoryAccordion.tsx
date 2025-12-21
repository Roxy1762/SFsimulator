/**
 * CategoryAccordion 组件
 * 实现折叠/展开功能的操作类别手风琴组件
 * 显示类别图标、名称、可执行操作数量
 * 
 * 需求: 12.2, 12.3, 12.4, 12.5
 */

import { useCallback } from 'react';
import type { Operation, GameState, OperationCategoryConfig, OperationCategory } from '../types';
import { OperationButton } from './OperationButton';
import './CategoryAccordion.css';

interface CategoryAccordionProps {
  category: OperationCategoryConfig;
  operations: Operation[];
  gameState: GameState;
  onExecuteOperation: (operationId: string) => void;
  disabled?: boolean;
  isExpanded: boolean;
  onToggle: (categoryId: OperationCategory) => void;
}

export function CategoryAccordion({
  category,
  operations,
  gameState,
  onExecuteOperation,
  disabled = false,
  isExpanded,
  onToggle
}: CategoryAccordionProps) {
  // Calculate executable operations count
  const executableCount = operations.filter(op => op.canExecute(gameState)).length;
  const totalCount = operations.length;

  const handleToggle = useCallback(() => {
    onToggle(category.id);
  }, [category.id, onToggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  return (
    <div className={`category-accordion ${category.id} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="accordion-header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`category-content-${category.id}`}
        type="button"
      >
        <span className="accordion-icon">{category.icon}</span>
        <span className="accordion-name">{category.name}</span>
        <span className="accordion-count" title={`${executableCount} 个可执行操作 / 共 ${totalCount} 个`}>
          <span className={`count-executable ${executableCount > 0 ? 'has-executable' : ''}`}>
            {executableCount}
          </span>
          <span className="count-separator">/</span>
          <span className="count-total">{totalCount}</span>
        </span>
        <span className={`accordion-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>

      <div
        id={`category-content-${category.id}`}
        className={`accordion-content ${isExpanded ? 'expanded' : 'collapsed'}`}
        role="region"
        aria-labelledby={`category-header-${category.id}`}
      >
        {operations.length > 0 ? (
          <div className="accordion-operations">
            {operations.map((operation) => (
              <OperationButton
                key={operation.id}
                operation={operation}
                gameState={gameState}
                onExecute={onExecuteOperation}
                disabled={disabled}
              />
            ))}
          </div>
        ) : (
          <div className="accordion-empty">
            <span className="empty-icon">📭</span>
            <span className="empty-text">暂无可用操作</span>
          </div>
        )}
      </div>
    </div>
  );
}
