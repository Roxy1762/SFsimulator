/**
 * ReputationDisplay 组件
 * 显示声望值和已解锁的外快任务
 * 
 * 需求: 24.5 - THE UI_Dashboard SHALL 显示当前声望值和已解锁的外快任务
 */

import './ReputationDisplay.css';

interface ReputationDisplayProps {
  reputation: number;
}

/**
 * 声望等级配置
 */
interface ReputationLevel {
  threshold: number;
  name: string;
  colorClass: string;
  icon: string;
}

const REPUTATION_LEVELS: ReputationLevel[] = [
  { threshold: 0, name: '无名小卒', colorClass: 'novice', icon: '🌱' },
  { threshold: 20, name: '初露锋芒', colorClass: 'beginner', icon: '⭐' },
  { threshold: 40, name: '小有名气', colorClass: 'intermediate', icon: '🌟' },
  { threshold: 60, name: '业界新星', colorClass: 'advanced', icon: '💫' },
  { threshold: 80, name: '技术大牛', colorClass: 'expert', icon: '🏆' },
  { threshold: 95, name: '传奇人物', colorClass: 'legendary', icon: '👑' }
];

/**
 * 外快任务解锁配置
 */
interface SideJobUnlock {
  name: string;
  icon: string;
  requiredReputation: number;
  description: string;
}

const SIDE_JOB_UNLOCKS: SideJobUnlock[] = [
  { name: '接私活', icon: '💼', requiredReputation: 0, description: '基础外快任务' },
  { name: '数据标注外包', icon: '🏷️', requiredReputation: 0, description: '消耗脏数据换取收入' },
  { name: '开源贡献', icon: '🌐', requiredReputation: 0, description: '获得收入和声望' },
  { name: '技术咨询', icon: '🎓', requiredReputation: 30, description: '需要声望≥30' },
  { name: '技术博客', icon: '✍️', requiredReputation: 50, description: '需要声望≥50' }
];

/**
 * 获取当前声望等级
 */
function getReputationLevel(reputation: number): ReputationLevel {
  for (let i = REPUTATION_LEVELS.length - 1; i >= 0; i--) {
    if (reputation >= REPUTATION_LEVELS[i].threshold) {
      return REPUTATION_LEVELS[i];
    }
  }
  return REPUTATION_LEVELS[0];
}

/**
 * 获取下一个声望等级
 */
function getNextReputationLevel(reputation: number): ReputationLevel | null {
  for (const level of REPUTATION_LEVELS) {
    if (reputation < level.threshold) {
      return level;
    }
  }
  return null;
}

/**
 * ReputationDisplay 组件
 */
export function ReputationDisplay({ reputation }: ReputationDisplayProps) {
  const currentLevel = getReputationLevel(reputation);
  const nextLevel = getNextReputationLevel(reputation);
  
  // 计算到下一等级的进度
  const progressToNext = nextLevel 
    ? ((reputation - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
    : 100;
  
  // 检查是否有考核奖励加成
  const hasExamBonus = reputation >= 70;
  
  return (
    <div className="reputation-display">
      <div className="reputation-header">
        <h4 className="reputation-title">
          <span className="title-icon">⭐</span>
          声望系统
        </h4>
      </div>
      
      {/* 声望值显示 */}
      <div className={`reputation-main ${currentLevel.colorClass}`}>
        <div className="reputation-icon-wrapper">
          <span className="reputation-level-icon">{currentLevel.icon}</span>
        </div>
        <div className="reputation-info">
          <div className="reputation-level-name">{currentLevel.name}</div>
          <div className="reputation-value-row">
            <span className="reputation-value">{reputation}</span>
            <span className="reputation-max">/ 100</span>
          </div>
        </div>
        <div className="reputation-gauge">
          <svg viewBox="0 0 36 36" className="reputation-circle">
            <path
              className="reputation-circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="reputation-circle-fill"
              strokeDasharray={`${reputation}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>
      
      {/* 进度到下一等级 */}
      {nextLevel && (
        <div className="reputation-progress">
          <div className="progress-label">
            <span>距离 {nextLevel.icon} {nextLevel.name}</span>
            <span>{nextLevel.threshold - reputation} 点</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}
      
      {/* 声望加成提示 */}
      {hasExamBonus && (
        <div className="reputation-bonus">
          <span className="bonus-icon">🎁</span>
          <span className="bonus-text">考核奖励 +10%</span>
        </div>
      )}
      
      {/* 已解锁的外快任务 */}
      <div className="side-jobs-section">
        <div className="side-jobs-title">外快任务解锁</div>
        <div className="side-jobs-list">
          {SIDE_JOB_UNLOCKS.map(job => {
            const isUnlocked = reputation >= job.requiredReputation;
            return (
              <div 
                key={job.name}
                className={`side-job-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                title={job.description}
              >
                <span className="side-job-icon">{job.icon}</span>
                <span className="side-job-name">{job.name}</span>
                {!isUnlocked && (
                  <span className="side-job-requirement">
                    🔒 {job.requiredReputation}
                  </span>
                )}
                {isUnlocked && (
                  <span className="side-job-unlocked">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ReputationDisplay;
