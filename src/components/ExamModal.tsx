/**
 * ExamModal 组件
 * 显示考核结果弹窗
 * - 显示考核场景名称
 * - 显示重点考核维度
 * - 显示计算详情：基础流量、拟合指数、稳定性系数、维度加成
 * - 显示难度等级
 * - 显示最终收益
 * - 提供"继续"按钮关闭弹窗
 * 
 * 需求: 6.2, 6.3, 16.2, 17.6
 */

import { useEffect } from 'react';
import type { ExamResult, DimensionType } from '../types';
import './ExamModal.css';

interface ExamModalProps {
  result: ExamResult;
  onClose: () => void;
}

/**
 * 维度名称配置
 */
const DIMENSION_NAMES: Record<DimensionType, { name: string; icon: string }> = {
  algorithm: { name: '算法优化', icon: '🧮' },
  dataProcessing: { name: '数据处理', icon: '📊' },
  stability: { name: '系统稳定', icon: '🛡️' },
  userExperience: { name: '用户体验', icon: '👤' },
};

/**
 * 获取稳定性系数描述
 */
function getStabilityDescription(coefficient: number): string {
  if (coefficient === 0) return '服务熔断';
  if (coefficient === 1.2) return '系统稳定 (+20%)';
  if (coefficient === 0.8) return '危险区 (-20%)';
  if (coefficient === 0.5) return '崩溃区 (-50%)';
  return `${(coefficient * 100).toFixed(0)}%`;
}

/**
 * 获取稳定性系数样式类
 */
function getStabilityClass(coefficient: number): string {
  if (coefficient === 0) return 'stability-meltdown';
  if (coefficient >= 1.0) return 'stability-safe';
  if (coefficient >= 0.8) return 'stability-warning';
  return 'stability-danger';
}

/**
 * 获取维度加成描述
 */
function getDimensionBonusDescription(bonus: number): string {
  if (bonus >= 1.5) return '优秀 (+50%)';
  if (bonus >= 1.0) return '合格 (±0%)';
  return '不足 (-40%)';
}

/**
 * 获取维度加成样式类
 */
function getDimensionBonusClass(bonus: number): string {
  if (bonus >= 1.5) return 'dimension-bonus-high';
  if (bonus >= 1.0) return 'dimension-bonus-mid';
  return 'dimension-bonus-low';
}

/**
 * ExamModal 组件
 * 显示考核结果详情
 */
export function ExamModal({ result, onClose }: ExamModalProps) {
  const {
    scenario,
    baseTraffic,
    fitScoreMultiplier,
    stabilityCoefficient,
    dimensionBonus,
    focusDimensions,
    difficultyLevel,
    finalReward,
    passed,
    meetsThreshold,
    thresholdInfo,
  } = result;

  // 模态框打开时锁定背景滚动 - 需求 10.2
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const stabilityDescription = getStabilityDescription(stabilityCoefficient);
  const stabilityClass = getStabilityClass(stabilityCoefficient);
  const dimensionBonusDescription = getDimensionBonusDescription(dimensionBonus);
  const dimensionBonusClass = getDimensionBonusClass(dimensionBonus);

  return (
    <div className="exam-modal-overlay" onClick={onClose}>
      <div className="exam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exam-modal-header">
          <span className="exam-icon">📊</span>
          <h2>流量考核结果</h2>
        </div>

        <div className="exam-scenario">
          <span className="scenario-label">考核场景</span>
          <span className="scenario-name">{scenario}</span>
          <span className="difficulty-badge">难度 Lv.{difficultyLevel}</span>
        </div>

        {/* 重点考核维度 - 需求 16.2 */}
        <div className="exam-focus-dimensions">
          <span className="focus-label">重点考核维度</span>
          <div className="focus-dimensions-list">
            {focusDimensions.map((dim) => (
              <span key={dim} className={`focus-dimension-tag ${dim}`}>
                {DIMENSION_NAMES[dim].icon} {DIMENSION_NAMES[dim].name}
              </span>
            ))}
          </div>
        </div>

        <div className="exam-calculation">
          <h3>收益计算</h3>
          
          <div className="calc-row">
            <span className="calc-label">基础流量</span>
            <span className="calc-value">{baseTraffic.toLocaleString()}</span>
          </div>
          
          <div className="calc-row">
            <span className="calc-label">拟合指数</span>
            <span className="calc-value">× {(fitScoreMultiplier * 100).toFixed(0)}%</span>
          </div>
          
          <div className={`calc-row ${stabilityClass}`}>
            <span className="calc-label">稳定性系数</span>
            <span className="calc-value">
              × {stabilityCoefficient.toFixed(1)}
              <span className="stability-desc">({stabilityDescription})</span>
            </span>
          </div>
          
          {/* 维度加成详情 - 需求 16.4, 16.5, 16.6, 16.7 */}
          <div className={`calc-row ${dimensionBonusClass}`}>
            <span className="calc-label">维度加成</span>
            <span className="calc-value">
              × {dimensionBonus.toFixed(1)}
              <span className="dimension-bonus-desc">({dimensionBonusDescription})</span>
            </span>
          </div>
          
          <div className="calc-divider"></div>
          
          <div className="calc-formula">
            <span className="formula-text">
              {baseTraffic.toLocaleString()} × {(fitScoreMultiplier * 100).toFixed(0)}% × {stabilityCoefficient.toFixed(1)} × {dimensionBonus.toFixed(1)}
            </span>
          </div>
        </div>

        <div className={`exam-result ${passed ? 'result-passed' : 'result-failed'}`}>
          <span className="result-label">最终收益</span>
          <span className="result-value">
            {passed ? '+' : ''}{finalReward.toLocaleString()}
          </span>
          <span className="result-icon">{passed ? '💰' : '😢'}</span>
        </div>

        {!passed && (
          <div className="exam-warning">
            {!meetsThreshold && thresholdInfo?.required ? (
              <>
                ⚠️ 未达到维度门槛要求！需要 {thresholdInfo.required.dimCount} 个维度 ≥ {thresholdInfo.required.value}，
                当前达标 {thresholdInfo.current} 个
              </>
            ) : (
              <>⚠️ 本次考核收益为零，请注意系统稳定性！</>
            )}
          </div>
        )}

        {/* 显示维度门槛要求 */}
        {thresholdInfo?.required && (
          <div className={`exam-threshold ${meetsThreshold ? 'threshold-met' : 'threshold-not-met'}`}>
            <span className="threshold-label">维度门槛</span>
            <span className="threshold-value">
              {thresholdInfo.required.dimCount} 个维度 ≥ {thresholdInfo.required.value}
            </span>
            <span className="threshold-status">
              {meetsThreshold ? '✓ 已达标' : `✗ 当前 ${thresholdInfo.current}/${thresholdInfo.required.dimCount}`}
            </span>
          </div>
        )}

        <button className="exam-continue-button" onClick={onClose}>
          继续
        </button>
      </div>
    </div>
  );
}

export default ExamModal;
