/**
 * TeamPanel 组件
 * 整合 TeamMemberCard 和 HiringPool，显示完整的团队管理界面
 * 包含工资总览显示
 * 
 * 需求: 18.4, 18.5, 25.4, 25.6
 */

import type { TeamMember } from '../types';
import { TeamMemberCard } from './TeamMemberCard';
import { HiringPool } from './HiringPool';
import { TEAM_CONSTANTS } from '../engine/TeamSystem';
import './TeamPanel.css';

interface TeamPanelProps {
  team: TeamMember[];
  hiringPool: TeamMember[];
  currentBudget: number;
  onHire: (memberId: string) => void;
  onFire: (memberId: string) => void;
  disabled?: boolean;
  turnsUntilExam?: number; // 距离下次考核的回合数
}

/**
 * 格式化金额显示
 */
function formatMoney(amount: number): string {
  return amount.toLocaleString();
}

/**
 * TeamPanel 组件
 */
export function TeamPanel({ 
  team, 
  hiringPool, 
  currentBudget, 
  onHire, 
  onFire,
  disabled,
  turnsUntilExam = 5
}: TeamPanelProps) {
  const teamSize = team.length;
  const maxTeamSize = TEAM_CONSTANTS.MAX_TEAM_SIZE;
  const isTeamFull = teamSize >= maxTeamSize;
  
  // 计算团队总工资
  const totalSalary = team.reduce((sum, member) => sum + member.salary, 0);
  const canAffordSalary = currentBudget >= totalSalary;

  return (
    <div className="team-panel">
      <div className="team-panel-header">
        <h3 className="panel-title">
          <span className="title-icon">👥</span>
          团队管理
        </h3>
        <div className={`team-count ${isTeamFull ? 'full' : ''}`}>
          {teamSize} / {maxTeamSize}
        </div>
      </div>

      {/* 工资总览 - 需求 25.4, 25.6 */}
      {team.length > 0 && (
        <div className={`salary-overview ${!canAffordSalary ? 'warning' : ''}`}>
          <div className="salary-overview-header">
            <span className="salary-overview-icon">💰</span>
            <span className="salary-overview-title">工资总览</span>
          </div>
          <div className="salary-overview-content">
            <div className="salary-row">
              <span className="salary-label">团队总工资</span>
              <span className={`salary-amount ${!canAffordSalary ? 'danger' : ''}`}>
                {formatMoney(totalSalary)}/考核
              </span>
            </div>
            <div className="salary-row">
              <span className="salary-label">下次考核</span>
              <span className="salary-turns">{turnsUntilExam} 回合后</span>
            </div>
            {!canAffordSalary && (
              <div className="salary-warning">
                ⚠️ 资金不足以支付工资，考核时可能被迫解雇成员
              </div>
            )}
          </div>
        </div>
      )}

      {/* 当前团队成员 */}
      <div className="team-section">
        <h4 className="section-title">当前团队</h4>
        {team.length === 0 ? (
          <div className="empty-team">
            暂无团队成员，从候选人池中雇佣吧！
          </div>
        ) : (
          <div className="team-members-list">
            {team.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onFire={onFire}
                showFireButton={!disabled}
              />
            ))}
          </div>
        )}
      </div>

      {/* 候选人池 */}
      <div className="hiring-section">
        <HiringPool
          candidates={hiringPool}
          currentBudget={currentBudget}
          onHire={onHire}
          disabled={disabled || isTeamFull}
        />
        {isTeamFull && (
          <div className="team-full-warning">
            ⚠️ 团队已满，需解雇成员后才能雇佣新人
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamPanel;
