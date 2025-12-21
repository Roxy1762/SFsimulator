/**
 * OperationButton 组件
 * 显示操作名称、描述、资源消耗
 * 根据资源是否足够禁用/启用按钮
 * 处理点击事件派发操作
 * 
 * 需求: 8.4, 8.5
 */

import type { Operation, GameState } from '../types';
import './OperationButton.css';

interface OperationButtonProps {
  operation: Operation;
  gameState: GameState;
  onExecute: (operationId: string) => void;
  disabled?: boolean;
}

/**
 * 格式化资源消耗显示
 */
function formatCost(operation: Operation): React.ReactNode {
  const costs: string[] = [];
  
  if (operation.cost.budget && operation.cost.budget > 0) {
    costs.push(`💰 ${operation.cost.budget}`);
  }
  if (operation.cost.computePoints > 0) {
    costs.push(`⚡ ${operation.cost.computePoints} AP`);
  }
  if (operation.cost.dirtyData && operation.cost.dirtyData > 0) {
    costs.push(`📊 ${operation.cost.dirtyData}`);
  }
  if (operation.cost.goldenData && operation.cost.goldenData > 0) {
    costs.push(`✨ ${operation.cost.goldenData}`);
  }
  
  return costs.length > 0 ? costs.join(' | ') : '无消耗';
}

/**
 * 格式化操作效果显示
 */
function formatEffects(operation: Operation): React.ReactNode {
  const effects: string[] = [];
  const e = operation.effects;
  
  // 处理赌博类操作
  if (e.isGamble) {
    const successRate = (e.gambleSuccessRate || 0.5) * 100;
    return `🎲 ${successRate}% 成功率`;
  }
  
  if (e.dirtyDataChange && e.dirtyDataChange > 0) {
    effects.push(`+${e.dirtyDataChange} 脏数据`);
  }
  if (e.goldenDataChange && e.goldenDataChange > 0) {
    effects.push(`+${e.goldenDataChange} 黄金数据`);
  }
  if (e.fitScoreChange && e.fitScoreChange > 0) {
    effects.push(`+${e.fitScoreChange} 拟合度`);
  }
  if (e.entropyChange) {
    if (e.entropyChange > 0) {
      effects.push(`+${e.entropyChange} 熵值`);
    } else {
      effects.push(`${e.entropyChange} 熵值`);
    }
  }
  if (e.legalRiskChange && e.legalRiskChange > 0) {
    effects.push(`+${e.legalRiskChange}% 法律风险`);
  }
  if (e.fitScoreCapChange && e.fitScoreCapChange < 0) {
    effects.push(`${e.fitScoreCapChange}% 拟合上限`);
  }
  
  return effects.length > 0 ? effects.join(', ') : '无效果';
}

/**
 * 获取缺少的资源提示
 */
function getMissingResources(operation: Operation, gameState: GameState): string[] {
  const missing: string[] = [];
  
  if (operation.cost.budget && gameState.resources.budget < operation.cost.budget) {
    missing.push(`资金不足 (需要 ${operation.cost.budget})`);
  }
  if (operation.cost.computePoints > 0 && gameState.resources.computePoints < operation.cost.computePoints) {
    missing.push(`算力不足 (需要 ${operation.cost.computePoints} AP)`);
  }
  if (operation.cost.dirtyData && gameState.resources.dirtyData < operation.cost.dirtyData) {
    missing.push(`脏数据不足 (需要 ${operation.cost.dirtyData})`);
  }
  if (operation.cost.goldenData && gameState.resources.goldenData < operation.cost.goldenData) {
    missing.push(`黄金数据不足 (需要 ${operation.cost.goldenData})`);
  }
  
  return missing;
}

export function OperationButton({ 
  operation, 
  gameState, 
  onExecute,
  disabled = false 
}: OperationButtonProps) {
  const canExecute = operation.canExecute(gameState);
  const isDisabled = disabled || !canExecute;
  const missingResources = getMissingResources(operation, gameState);
  
  const handleClick = () => {
    if (!isDisabled) {
      onExecute(operation.id);
    }
  };
  
  // 获取操作类别的图标
  const getCategoryIcon = () => {
    switch (operation.category) {
      case 'data':
        return '📁';
      case 'training':
        return '🧠';
      case 'maintenance':
        return '🔧';
      default:
        return '⚙️';
    }
  };
  
  return (
    <button
      className={`operation-button ${operation.category} ${isDisabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isDisabled && missingResources.length > 0 ? missingResources.join('\n') : undefined}
    >
      <div className="operation-header">
        <span className="operation-icon">{getCategoryIcon()}</span>
        <span className="operation-name">{operation.name}</span>
      </div>
      
      <p className="operation-description">{operation.description}</p>
      
      <div className="operation-details">
        <div className="operation-cost">
          <span className="detail-label">消耗:</span>
          <span className="detail-value">{formatCost(operation)}</span>
        </div>
        <div className="operation-effects">
          <span className="detail-label">效果:</span>
          <span className="detail-value">{formatEffects(operation)}</span>
        </div>
      </div>
      
      {isDisabled && missingResources.length > 0 && (
        <div className="operation-warning">
          ⚠️ {missingResources[0]}
        </div>
      )}
    </button>
  );
}
