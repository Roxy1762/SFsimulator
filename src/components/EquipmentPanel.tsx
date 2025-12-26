/**
 * EquipmentPanel 组件
 * 显示设备状态和升级选项
 */

import { useGameState, useGameActions } from '../context/GameContext';
import { GameEngine, EQUIPMENT_LEVELS } from '../engine/GameEngine';
import type { EquipmentType } from '../types';
import './EquipmentPanel.css';

const EQUIPMENT_INFO: Record<EquipmentType, { name: string; icon: string; description: string }> = {
  gpu: { name: 'GPU', icon: '🖥️', description: '提升训练效率和算力上限' },
  storage: { name: '存储', icon: '💾', description: '增加数据容量' },
  network: { name: '网络', icon: '🌐', description: '提升数据获取和推理速度' },
  cooling: { name: '散热', icon: '❄️', description: '降低熵值增长和熔断概率' },
};

interface EquipmentItemProps {
  type: EquipmentType;
  onUpgrade: (type: EquipmentType) => void;
  disabled: boolean;
}

function EquipmentItem({ type, onUpgrade, disabled }: EquipmentItemProps) {
  const { gameState } = useGameState();
  if (!gameState) return null;

  const equipment = gameState.equipment[type];
  const currentLevel = EQUIPMENT_LEVELS[type][equipment.level - 1];
  const nextLevel = equipment.level < equipment.maxLevel ? EQUIPMENT_LEVELS[type][equipment.level] : null;
  const canUpgrade = GameEngine.canUpgradeEquipment(gameState, type);
  const info = EQUIPMENT_INFO[type];

  return (
    <div className={`equipment-item ${canUpgrade && !disabled ? 'can-upgrade' : ''}`}>
      <div className="equipment-header">
        <span className="equipment-icon">{info.icon}</span>
        <div className="equipment-info">
          <span className="equipment-name">{info.name}</span>
          <span className="equipment-level">Lv.{equipment.level}</span>
        </div>
      </div>
      
      <div className="equipment-current">
        <span className="current-name">{currentLevel.name}</span>
        {currentLevel.bonus > 0 && (
          <span className="current-bonus">+{currentLevel.bonus}{type === 'storage' ? '' : '%'}</span>
        )}
      </div>

      {nextLevel ? (
        <button
          className="upgrade-button"
          onClick={() => onUpgrade(type)}
          disabled={!canUpgrade || disabled}
        >
          <span className="upgrade-text">升级到 {nextLevel.name}</span>
          <span className="upgrade-cost">💰 {nextLevel.upgradeCost.toLocaleString()}</span>
        </button>
      ) : (
        <div className="max-level">已满级</div>
      )}
    </div>
  );
}

export function EquipmentPanel() {
  const { gameState } = useGameState();
  const { upgradeEquipment } = useGameActions();

  if (!gameState) return null;

  const isGameOver = gameState.gameStatus !== 'playing';

  return (
    <div className="equipment-panel">
      <h3 className="panel-title">设备升级</h3>
      <div className="equipment-grid">
        {(['gpu', 'storage', 'network', 'cooling'] as EquipmentType[]).map(type => (
          <EquipmentItem
            key={type}
            type={type}
            onUpgrade={upgradeEquipment}
            disabled={isGameOver}
          />
        ))}
      </div>
    </div>
  );
}

export default EquipmentPanel;