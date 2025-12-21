/**
 * OperationsPanel 组件
 * 使用折叠式二级菜单按类别分组显示操作
 * 支持同时展开多个类别，默认折叠所有类别
 * 
 * 需求: 8.4, 12.4, 12.6
 */

import { useState, useCallback } from 'react';
import type { GameState, OperationCategory } from '../types';
import { OPERATION_CATEGORIES } from '../types';
import { 
  getOperationsByCategory
} from '../operations';
import { CategoryAccordion } from './CategoryAccordion';
import './OperationsPanel.css';

interface OperationsPanelProps {
  gameState: GameState;
  onExecuteOperation: (operationId: string) => void;
  disabled?: boolean;
}

export function OperationsPanel({ 
  gameState, 
  onExecuteOperation,
  disabled = false 
}: OperationsPanelProps) {
  // Track which categories are expanded (default: all collapsed)
  const [expandedCategories, setExpandedCategories] = useState<Set<OperationCategory>>(new Set());

  // Toggle category expansion
  const handleToggleCategory = useCallback((categoryId: OperationCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Get operations for each category
  const getOperationsForCategory = (categoryId: OperationCategory) => {
    return getOperationsByCategory(categoryId);
  };

  return (
    <div className={`operations-panel ${gameState.risks.serverMeltdown ? 'meltdown' : ''}`}>
      <h3 className="panel-title">可用操作</h3>
      
      <div className="operations-categories">
        {OPERATION_CATEGORIES.map((category) => (
          <CategoryAccordion
            key={category.id}
            category={category}
            operations={getOperationsForCategory(category.id)}
            gameState={gameState}
            onExecuteOperation={onExecuteOperation}
            disabled={disabled}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={handleToggleCategory}
          />
        ))}
      </div>
    </div>
  );
}
