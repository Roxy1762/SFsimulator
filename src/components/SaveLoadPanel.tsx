/**
 * SaveLoadPanel 组件
 * 存档导出和导入功能面板
 * 
 * 需求: 22.2 - 导出按钮（复制到剪贴板）
 * 需求: 22.3 - 导入按钮和输入框
 * 需求: 22.5 - 显示成功提示
 * 需求: 22.6 - 显示错误提示
 */

import { useState, useCallback } from 'react';
import type { GameState } from '../types';
import { SaveSystem } from '../utils/SaveSystem';
import './SaveLoadPanel.css';

interface SaveLoadPanelProps {
  gameState: GameState | null;
  onImport: (state: GameState) => void;
  disabled?: boolean;
}

type MessageType = 'success' | 'error' | 'info';

interface Message {
  type: MessageType;
  text: string;
}

/**
 * SaveLoadPanel 组件
 */
export function SaveLoadPanel({ gameState, onImport, disabled }: SaveLoadPanelProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 清除消息
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  // 显示消息（3秒后自动消失）
  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text });
    setTimeout(clearMessage, 3000);
  }, [clearMessage]);

  // 导出存档
  const handleExport = useCallback(async () => {
    if (!gameState || disabled) return;

    setIsExporting(true);
    try {
      const exported = SaveSystem.exportSave(gameState);
      if (!exported) {
        showMessage('error', '导出失败：无法序列化游戏状态');
        return;
      }

      const success = await SaveSystem.copyToClipboard(exported);
      if (success) {
        showMessage('success', '存档已复制到剪贴板！');
      } else {
        showMessage('error', '复制到剪贴板失败，请手动复制');
        // 显示导出的字符串供手动复制
        setImportText(exported);
        setIsImportModalOpen(true);
      }
    } catch (error) {
      showMessage('error', `导出失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsExporting(false);
    }
  }, [gameState, disabled, showMessage]);

  // 打开导入弹窗
  const handleOpenImport = useCallback(() => {
    setImportText('');
    setIsImportModalOpen(true);
  }, []);

  // 关闭导入弹窗
  const handleCloseImport = useCallback(() => {
    setIsImportModalOpen(false);
    setImportText('');
  }, []);

  // 从剪贴板粘贴
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await SaveSystem.readFromClipboard();
      if (text) {
        setImportText(text);
        showMessage('info', '已从剪贴板粘贴');
      } else {
        showMessage('error', '无法读取剪贴板内容');
      }
    } catch {
      showMessage('error', '读取剪贴板失败');
    }
  }, [showMessage]);

  // 确认导入
  const handleConfirmImport = useCallback(() => {
    if (!importText.trim()) {
      showMessage('error', '请输入存档字符串');
      return;
    }

    const result = SaveSystem.importSave(importText.trim());
    if (result.success && result.state) {
      onImport(result.state);
      showMessage('success', '存档导入成功！');
      handleCloseImport();
    } else {
      showMessage('error', result.error || '导入失败：未知错误');
    }
  }, [importText, onImport, showMessage, handleCloseImport]);

  return (
    <div className="save-load-panel">
      <div className="save-load-header">
        <h3 className="panel-title">
          <span className="title-icon">💾</span>
          存档管理
        </h3>
      </div>

      <div className="save-load-buttons">
        <button
          className="save-load-btn export-btn"
          onClick={handleExport}
          disabled={disabled || !gameState || isExporting}
          title="导出存档到剪贴板"
        >
          <span className="btn-icon">📤</span>
          <span className="btn-text">{isExporting ? '导出中...' : '导出存档'}</span>
        </button>

        <button
          className="save-load-btn import-btn"
          onClick={handleOpenImport}
          disabled={disabled}
          title="从剪贴板导入存档"
        >
          <span className="btn-icon">📥</span>
          <span className="btn-text">导入存档</span>
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`save-load-message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' && '✅'}
            {message.type === 'error' && '❌'}
            {message.type === 'info' && 'ℹ️'}
          </span>
          <span className="message-text">{message.text}</span>
        </div>
      )}

      {/* 导入弹窗 */}
      {isImportModalOpen && (
        <div className="import-modal-overlay" onClick={handleCloseImport}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="import-modal-header">
              <h4>导入存档</h4>
              <button className="close-btn" onClick={handleCloseImport}>×</button>
            </div>

            <div className="import-modal-body">
              <p className="import-instructions">
                请粘贴存档字符串到下方输入框：
              </p>
              
              <textarea
                className="import-textarea"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="在此粘贴存档字符串..."
                rows={6}
              />

              <button
                className="paste-btn"
                onClick={handlePasteFromClipboard}
                type="button"
              >
                📋 从剪贴板粘贴
              </button>
            </div>

            <div className="import-modal-footer">
              <button
                className="cancel-btn"
                onClick={handleCloseImport}
              >
                取消
              </button>
              <button
                className="confirm-btn"
                onClick={handleConfirmImport}
                disabled={!importText.trim()}
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SaveLoadPanel;
