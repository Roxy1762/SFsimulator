/**
 * ResourcePanel 组件
 * 显示资金、算力、脏数据、黄金数据
 * 使用进度条显示算力使用情况
 * 
 * 需求: 8.1
 */

import type { Resources } from '../types';
import './ResourcePanel.css';

interface ResourcePanelProps {
  resources: Resources;
}

/**
 * 格式化数字显示
 */
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString();
}

/**
 * 资源项组件
 */
interface ResourceItemProps {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
  isNegative?: boolean;
}

function ResourceItem({ label, value, icon, colorClass, isNegative }: ResourceItemProps) {
  return (
    <div className={`resource-item ${colorClass} ${isNegative ? 'negative' : ''}`}>
      <span className="resource-icon">{icon}</span>
      <div className="resource-info">
        <span className="resource-item-label">{label}</span>
        <span className="resource-item-value">{formatNumber(value)}</span>
      </div>
    </div>
  );
}

/**
 * 算力进度条组件
 */
interface ComputeBarProps {
  current: number;
  max: number;
}

function ComputeBar({ current, max }: ComputeBarProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  return (
    <div className="compute-bar-container">
      <div className="compute-bar-header">
        <span className="compute-icon">⚡</span>
        <span className="compute-label">算力</span>
        <span className="compute-value">{current} / {max}</span>
      </div>
      <div className="compute-bar-track">
        <div 
          className="compute-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
        {/* 显示每个算力点的分隔线 */}
        <div className="compute-bar-segments">
          {Array.from({ length: max - 1 }, (_, i) => (
            <div 
              key={i} 
              className="compute-segment-line"
              style={{ left: `${((i + 1) / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ResourcePanel 组件
 * 显示当前资金、算力、数据数量
 */
export function ResourcePanel({ resources }: ResourcePanelProps) {
  const { budget, computePoints, computeMax, dirtyData, goldenData, dataCapacity } = resources;
  const totalData = dirtyData + goldenData;
  const dataUsagePercent = dataCapacity > 0 ? Math.min(100, (totalData / dataCapacity) * 100) : 0;

  return (
    <div className="resource-panel">
      <h3 className="panel-title">资源</h3>
      
      {/* 资金 */}
      <ResourceItem
        label="资金"
        value={budget}
        icon="💰"
        colorClass="budget"
        isNegative={budget < 0}
      />
      
      {/* 算力进度条 */}
      <ComputeBar current={computePoints} max={computeMax} />
      
      {/* 数据区域 */}
      <div className="data-section">
        <h4 className="data-section-title">数据 ({formatNumber(totalData)} / {formatNumber(dataCapacity)})</h4>
        <div className="data-capacity-bar">
          <div 
            className="data-capacity-fill" 
            style={{ width: `${dataUsagePercent}%` }}
          />
        </div>
        <div className="data-items">
          <ResourceItem
            label="脏数据"
            value={dirtyData}
            icon="📊"
            colorClass="dirty-data"
          />
          <ResourceItem
            label="黄金数据"
            value={goldenData}
            icon="✨"
            colorClass="golden-data"
          />
        </div>
      </div>
    </div>
  );
}

export default ResourcePanel;
