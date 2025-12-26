/**
 * MetricsPanel 组件
 * 显示多维度模型指标和熵值
 * 使用颜色标识熵值危险等级（绿色<40%, 黄色41-80%, 红色>80%）
 * 显示当前回合数和距离考核回合数
 * 
 * 需求: 8.2, 8.3, 13.4, 24.5
 */

import type { Metrics, Progress, Dimensions } from '../types';
import { DimensionsDisplay } from './DimensionsDisplay';
import { ReputationDisplay } from './ReputationDisplay';
import './MetricsPanel.css';

interface MetricsPanelProps {
  metrics: Metrics;
  progress: Progress;
  dimensions: Dimensions;
  effectiveDimensions?: Dimensions;
  reputation?: number;
}

/**
 * 获取熵值危险等级
 */
function getEntropyLevel(entropy: number): 'safe' | 'warning' | 'danger' {
  if (entropy <= 40) return 'safe';
  if (entropy <= 80) return 'warning';
  return 'danger';
}

/**
 * 获取熵值等级描述
 */
function getEntropyLevelText(level: 'safe' | 'warning' | 'danger'): string {
  switch (level) {
    case 'safe': return '稳定';
    case 'warning': return '危险区';
    case 'danger': return '崩溃区';
  }
}

/**
 * 小型进度条组件
 */
interface MiniBarProps {
  value: number;
  max: number;
  label: string;
  icon: string;
  colorClass: string;
}

function MiniBar({ value, max, label, icon, colorClass }: MiniBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className={`mini-bar ${colorClass}`}>
      <div className="mini-bar-header">
        <span className="mini-bar-icon">{icon}</span>
        <span className="mini-bar-label">{label}</span>
        <span className="mini-bar-value">{value}</span>
      </div>
      <div className="mini-bar-track">
        <div 
          className="mini-bar-fill" 
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 圆形进度指示器组件
 */
interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
  colorClass: string;
  icon: string;
  sublabel?: string;
}

function CircularGauge({ value, max, label, colorClass, icon, sublabel }: CircularGaugeProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`circular-gauge ${colorClass}`}>
      <svg viewBox="0 0 100 100" className="gauge-svg">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="gauge-background"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="gauge-progress"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="gauge-content">
        <span className="gauge-icon">{icon}</span>
        <span className="gauge-value">{value.toFixed(0)}%</span>
      </div>
      <div className="gauge-label">{label}</div>
      {sublabel && <div className="gauge-sublabel">{sublabel}</div>}
    </div>
  );
}

/**
 * 回合信息组件
 */
interface TurnInfoProps {
  turn: number;
  turnsUntilExam: number;
}

function TurnInfo({ turn, turnsUntilExam }: TurnInfoProps) {
  return (
    <div className="turn-info">
      <div className="turn-current">
        <span className="turn-icon">🎯</span>
        <div className="turn-details">
          <span className="turn-label">当前回合</span>
          <span className="turn-value">{turn}</span>
        </div>
      </div>
      <div className="turn-exam">
        <span className="exam-icon">⏱️</span>
        <div className="exam-details">
          <span className="exam-label">距离考核</span>
          <span className="exam-value">{turnsUntilExam} 回合</span>
        </div>
        {turnsUntilExam <= 2 && (
          <span className="exam-warning">即将考核!</span>
        )}
      </div>
    </div>
  );
}

/**
 * MetricsPanel 组件
 * 显示多维度指标、熵值和回合信息
 */
export function MetricsPanel({ metrics, progress, dimensions, effectiveDimensions, reputation = 0 }: MetricsPanelProps) {
  const { fitScore, entropy, fitScoreCap, accuracy, speed, creativity, robustness } = metrics;
  const { turn, turnsUntilExam } = progress;
  
  const entropyLevel = getEntropyLevel(entropy);
  const entropyLevelText = getEntropyLevelText(entropyLevel);

  return (
    <div className="metrics-panel">
      <h3 className="panel-title">模型指标</h3>
      
      {/* 多维度指标 */}
      <div className="model-metrics">
        <MiniBar value={accuracy} max={fitScoreCap} label="准确率" icon="🎯" colorClass="accuracy" />
        <MiniBar value={speed} max={fitScoreCap} label="推理速度" icon="⚡" colorClass="speed" />
        <MiniBar value={creativity} max={fitScoreCap} label="创造力" icon="💡" colorClass="creativity" />
        <MiniBar value={robustness} max={fitScoreCap} label="鲁棒性" icon="🛡️" colorClass="robustness" />
      </div>
      
      <div className="gauges-container">
        {/* 综合拟合指数 */}
        <CircularGauge
          value={fitScore}
          max={fitScoreCap}
          label="综合拟合"
          colorClass="fit-score"
          icon="📈"
          sublabel={fitScoreCap < 100 ? `上限: ${fitScoreCap}%` : undefined}
        />
        
        {/* 熵值 */}
        <CircularGauge
          value={entropy}
          max={100}
          label="熵值"
          colorClass={`entropy entropy-${entropyLevel}`}
          icon="🔥"
          sublabel={entropyLevelText}
        />
      </div>
      
      {/* 熵值状态提示 */}
      <div className={`entropy-status entropy-status-${entropyLevel}`}>
        {entropyLevel === 'safe' && (
          <span>✅ 系统稳定，考核收益 +20%</span>
        )}
        {entropyLevel === 'warning' && (
          <span>⚠️ 危险区：考核收益 -20%</span>
        )}
        {entropyLevel === 'danger' && (
          <span>🚨 崩溃区：每回合可能服务熔断！</span>
        )}
      </div>
      
      {/* 能力维度显示 - 需求 13.4 */}
      <DimensionsDisplay 
        dimensions={dimensions} 
        effectiveDimensions={effectiveDimensions}
      />
      
      {/* 声望显示 - 需求 24.5 */}
      <ReputationDisplay reputation={reputation} />
      
      {/* 回合信息 */}
      <TurnInfo turn={turn} turnsUntilExam={turnsUntilExam} />
    </div>
  );
}

export default MetricsPanel;
