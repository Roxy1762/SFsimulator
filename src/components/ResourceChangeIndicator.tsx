/**
 * ResourceChangeIndicator 组件
 * 显示资源变化的动画效果
 * 
 * 需求: 8.6
 */

import { useEffect, useState } from 'react';
import './ResourceChangeIndicator.css';

interface ResourceChange {
  id: string;
  value: number;
  x: number;
  y: number;
}

interface ResourceChangeIndicatorProps {
  changes: ResourceChange[];
  onAnimationComplete: (id: string) => void;
}

/**
 * 单个变化指示器
 */
function ChangeItem({ 
  change, 
  onComplete 
}: { 
  change: ResourceChange; 
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const isPositive = change.value > 0;
  const displayValue = isPositive ? `+${change.value}` : change.value.toString();

  return (
    <div
      className={`resource-change-indicator ${isPositive ? 'positive' : 'negative'}`}
      style={{ left: change.x, top: change.y }}
    >
      {displayValue}
    </div>
  );
}

/**
 * 资源变化指示器容器
 */
export function ResourceChangeIndicator({ 
  changes, 
  onAnimationComplete 
}: ResourceChangeIndicatorProps) {
  return (
    <div className="resource-change-container">
      {changes.map((change) => (
        <ChangeItem
          key={change.id}
          change={change}
          onComplete={() => onAnimationComplete(change.id)}
        />
      ))}
    </div>
  );
}

/**
 * Hook: 管理资源变化动画
 */
let changeIdCounter = 0;

export function useResourceChanges() {
  const [changes, setChanges] = useState<ResourceChange[]>([]);

  const addChange = (value: number, x: number, y: number) => {
    const id = `change_${Date.now()}_${changeIdCounter++}`;
    setChanges((prev) => [...prev, { id, value, x, y }]);
    return id;
  };

  const removeChange = (id: string) => {
    setChanges((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    changes,
    addChange,
    removeChange,
  };
}

export default ResourceChangeIndicator;