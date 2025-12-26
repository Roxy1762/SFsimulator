/**
 * EventLog 组件
 * 显示最近的游戏事件和操作结果
 * 使用滚动列表显示历史记录
 * 区分不同类型的消息（操作、事件、考核）
 * 
 * 需求: 8.7
 */

import { useEffect, useRef } from 'react';
import type { LogEntry, LogEntryType } from '../types';
import { useGameState } from '../context/GameContext';
import './EventLog.css';

/**
 * 获取日志类型的图标
 */
function getLogIcon(type: LogEntryType): string {
  switch (type) {
    case 'operation': return '⚙️';
    case 'event': return '🎲';
    case 'exam': return '📊';
    case 'system': return '💻';
    default: return '📝';
  }
}

/**
 * 获取日志类型的标签
 */
function getLogLabel(type: LogEntryType): string {
  switch (type) {
    case 'operation': return '操作';
    case 'event': return '事件';
    case 'exam': return '考核';
    case 'system': return '系统';
    default: return '日志';
  }
}

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 单条日志条目组件
 */
interface LogItemProps {
  entry: LogEntry;
}

function LogItem({ entry }: LogItemProps) {
  const { type, message, turn, timestamp } = entry;
  const icon = getLogIcon(type);
  const label = getLogLabel(type);

  return (
    <div className={`log-item log-item-${type}`}>
      <div className="log-item-header">
        <span className="log-icon">{icon}</span>
        <span className="log-label">{label}</span>
        <span className="log-turn">回合 {turn}</span>
        <span className="log-time">{formatTimestamp(timestamp)}</span>
      </div>
      <div className="log-message">{message}</div>
    </div>
  );
}

/**
 * EventLog 组件
 * 显示游戏日志列表
 */
export function EventLog() {
  const { logs } = useGameState();
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新日志
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // 按时间倒序显示（最新的在下面）
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="event-log">
      <h3 className="panel-title">
        <span className="title-icon">📜</span>
        游戏日志
        <span className="log-count">{logs.length}</span>
      </h3>
      
      <div className="log-container" ref={logContainerRef}>
        {sortedLogs.length === 0 ? (
          <div className="log-empty">
            <span className="empty-icon">📭</span>
            <span className="empty-text">暂无日志</span>
          </div>
        ) : (
          sortedLogs.map((entry) => (
            <LogItem key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

export default EventLog;
