/**
 * DimensionsDisplay 组件
 * 显示四个能力维度的当前值和进度条，支持雷达图和进度条两种显示模式
 * 
 * 需求: 13.4 - THE UI_Dashboard SHALL 显示所有维度的当前能力值和进度条
 */

import { useState } from 'react';
import type { Dimensions, DimensionType } from '../types';
import './DimensionsDisplay.css';

interface DimensionsDisplayProps {
  dimensions: Dimensions;
  effectiveDimensions?: Dimensions; // 包含团队加成后的有效值
}

/**
 * 维度配置
 */
const DIMENSION_CONFIG: Record<DimensionType, { name: string; icon: string; colorClass: string; description: string; color: string }> = {
  algorithm: {
    name: '算法优化',
    icon: '🧮',
    colorClass: 'algorithm',
    description: '影响算法相关考核的表现',
    color: '#3b82f6'
  },
  dataProcessing: {
    name: '数据处理',
    icon: '📊',
    colorClass: 'data-processing',
    description: '影响数据相关考核的表现',
    color: '#8b5cf6'
  },
  stability: {
    name: '系统稳定',
    icon: '🛡️',
    colorClass: 'stability',
    description: '影响稳定性相关考核的表现',
    color: '#10b981'
  },
  userExperience: {
    name: '用户体验',
    icon: '👤',
    colorClass: 'user-experience',
    description: '影响用户体验相关考核的表现',
    color: '#f59e0b'
  }
};

const DIMENSION_ORDER: DimensionType[] = ['algorithm', 'dataProcessing', 'stability', 'userExperience'];

/**
 * 获取维度等级描述
 */
function getDimensionLevel(value: number): { level: string; colorClass: string } {
  if (value >= 70) return { level: '优秀', colorClass: 'excellent' };
  if (value >= 50) return { level: '良好', colorClass: 'good' };
  if (value >= 30) return { level: '一般', colorClass: 'average' };
  return { level: '较弱', colorClass: 'weak' };
}

/**
 * 单个维度进度条组件
 */
interface DimensionBarProps {
  type: DimensionType;
  baseValue: number;
  effectiveValue: number;
}

function DimensionBar({ type, baseValue, effectiveValue }: DimensionBarProps) {
  const config = DIMENSION_CONFIG[type];
  const { level, colorClass: levelClass } = getDimensionLevel(effectiveValue);
  const hasBonus = effectiveValue > baseValue;
  const bonusAmount = effectiveValue - baseValue;
  
  return (
    <div className={`dimension-bar ${config.colorClass}`} title={config.description}>
      <div className="dimension-header">
        <div className="dimension-icon-wrapper" style={{ '--dimension-color': config.color } as React.CSSProperties}>
          <span className="dimension-icon">{config.icon}</span>
        </div>
        <span className="dimension-name">{config.name}</span>
        <div className="dimension-values">
          <span className="dimension-value">{effectiveValue}</span>
          {hasBonus && (
            <span className="dimension-bonus">+{bonusAmount}</span>
          )}
        </div>
      </div>
      <div className="dimension-track">
        <div 
          className="dimension-fill"
          style={{ width: `${Math.min(100, effectiveValue)}%` }}
        />
        {hasBonus && (
          <div 
            className="dimension-bonus-fill"
            style={{ 
              left: `${Math.min(100, baseValue)}%`,
              width: `${Math.min(100 - baseValue, bonusAmount)}%`
            }}
          />
        )}
        {/* 阈值标记 */}
        <div className="dimension-threshold threshold-40" />
        <div className="dimension-threshold threshold-60" />
      </div>
      <div className="dimension-footer">
        <span className={`dimension-level ${levelClass}`}>{level}</span>
      </div>
    </div>
  );
}

/**
 * 雷达图组件
 */
interface RadarChartProps {
  dimensions: Dimensions;
  effectiveDimensions: Dimensions;
}

function RadarChart({ dimensions, effectiveDimensions }: RadarChartProps) {
  const size = 200;
  const center = size / 2;
  const maxRadius = size * 0.4;
  
  // 计算多边形顶点
  const getPoint = (index: number, value: number): { x: number; y: number } => {
    const angle = (Math.PI * 2 * index) / 4 - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };
  
  // 生成多边形路径
  const getPolygonPath = (values: number[]): string => {
    return values.map((value, index) => {
      const point = getPoint(index, value);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';
  };
  
  // 生成网格线
  const gridLevels = [20, 40, 60, 80, 100];
  
  const baseValues = DIMENSION_ORDER.map(type => dimensions[type]);
  const effectiveValues = DIMENSION_ORDER.map(type => effectiveDimensions[type]);
  
  return (
    <div className="radar-chart-container">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart">
        {/* 背景网格 */}
        {gridLevels.map(level => (
          <polygon
            key={level}
            className={`radar-grid ${level === 40 || level === 60 ? 'threshold-grid' : ''}`}
            points={DIMENSION_ORDER.map((_, i) => {
              const point = getPoint(i, level);
              return `${point.x},${point.y}`;
            }).join(' ')}
          />
        ))}
        
        {/* 轴线 */}
        {DIMENSION_ORDER.map((type, index) => {
          const point = getPoint(index, 100);
          return (
            <line
              key={type}
              className="radar-axis"
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
            />
          );
        })}
        
        {/* 基础值多边形 */}
        <path
          className="radar-polygon base-polygon"
          d={getPolygonPath(baseValues)}
        />
        
        {/* 有效值多边形（包含加成） */}
        <path
          className="radar-polygon effective-polygon"
          d={getPolygonPath(effectiveValues)}
        />
        
        {/* 数据点 */}
        {DIMENSION_ORDER.map((type, index) => {
          const point = getPoint(index, effectiveValues[index]);
          const config = DIMENSION_CONFIG[type];
          return (
            <circle
              key={type}
              className="radar-point"
              cx={point.x}
              cy={point.y}
              r="4"
              style={{ fill: config.color }}
            />
          );
        })}
        
        {/* 维度标签 */}
        {DIMENSION_ORDER.map((type, index) => {
          const labelPoint = getPoint(index, 120);
          const config = DIMENSION_CONFIG[type];
          return (
            <g key={`label-${type}`} className="radar-label-group">
              <text
                className="radar-label"
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {config.icon}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* 维度数值列表 */}
      <div className="radar-values">
        {DIMENSION_ORDER.map(type => {
          const config = DIMENSION_CONFIG[type];
          const baseValue = dimensions[type];
          const effectiveValue = effectiveDimensions[type];
          const hasBonus = effectiveValue > baseValue;
          const { level, colorClass } = getDimensionLevel(effectiveValue);
          
          return (
            <div key={type} className="radar-value-item" style={{ '--dimension-color': config.color } as React.CSSProperties}>
              <span className="radar-value-icon">{config.icon}</span>
              <span className="radar-value-name">{config.name}</span>
              <span className="radar-value-number">{effectiveValue}</span>
              {hasBonus && <span className="radar-value-bonus">+{effectiveValue - baseValue}</span>}
              <span className={`radar-value-level ${colorClass}`}>{level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * DimensionsDisplay 组件
 * 显示四个能力维度的当前值和进度条
 */
export function DimensionsDisplay({ dimensions, effectiveDimensions }: DimensionsDisplayProps) {
  const [viewMode, setViewMode] = useState<'bars' | 'radar'>('bars');
  const effective = effectiveDimensions || dimensions;
  
  const hasBonus = DIMENSION_ORDER.some(type => effective[type] > dimensions[type]);
  
  return (
    <div className="dimensions-display">
      <div className="dimensions-header">
        <h4 className="dimensions-title">
          <span className="title-icon">📈</span>
          能力维度
        </h4>
        <div className="view-mode-toggle">
          <button 
            className={`view-mode-btn ${viewMode === 'bars' ? 'active' : ''}`}
            onClick={() => setViewMode('bars')}
            title="进度条视图"
          >
            ▤
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'radar' ? 'active' : ''}`}
            onClick={() => setViewMode('radar')}
            title="雷达图视图"
          >
            ◇
          </button>
        </div>
      </div>
      
      {viewMode === 'bars' ? (
        <>
          <div className="dimensions-grid">
            {DIMENSION_ORDER.map(type => (
              <DimensionBar
                key={type}
                type={type}
                baseValue={dimensions[type]}
                effectiveValue={effective[type]}
              />
            ))}
          </div>
          <div className="dimensions-legend">
            <span className="legend-item">
              <span className="legend-marker threshold-marker" />
              考核阈值 (40/60)
            </span>
            {hasBonus && (
              <span className="legend-item">
                <span className="legend-marker bonus-marker" />
                团队加成
              </span>
            )}
          </div>
        </>
      ) : (
        <RadarChart dimensions={dimensions} effectiveDimensions={effective} />
      )}
    </div>
  );
}

export default DimensionsDisplay;
