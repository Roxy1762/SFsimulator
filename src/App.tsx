/**
 * App 组件
 * 游戏主入口组件
 * - 包装 GameProvider
 * - 条件渲染 GameIntro、GameInitializer 或 GameBoard
 * - 添加全局样式
 * - 集成新手引导系统
 * 
 * 需求: 10.1, 27.1, 27.8, 28.1, 29.1, 29.7, 29.8
 */

import { useState, useEffect, useCallback } from 'react';
import { GameProvider, useGameState, useGameActions } from './context/GameContext';
import { GameInitializer, GameBoard, TutorialModal, OnboardingGuide, hasCompletedOnboarding } from './components';
import { GameIntro, hasViewedIntro } from './components/GameIntro';
import './App.css';
import './components/TouchOptimization.css';

/**
 * 游戏主内容组件
 * 根据游戏状态显示简介界面、初始化界面或游戏界面
 */
function GameContent() {
  const { isInitialized, gameState } = useGameState();
  const { initializeGame, loadSavedGame, checkHasSavedGame } = useGameActions();
  
  // 简介界面显示状态
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // 首次进入且没有存档时显示简介
    return !hasViewedIntro();
  });
  
  // 教程弹窗状态 - 需求 28.1
  const [showTutorial, setShowTutorial] = useState(false);
  
  // 新手引导状态 - 需求 29.1, 29.7
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // 追踪是否是新游戏（用于判断是否启动引导）
  const [isNewGame, setIsNewGame] = useState(false);

  // 当游戏初始化完成且是新游戏时，检查是否需要启动引导 - 需求 29.1
  useEffect(() => {
    if (isInitialized && gameState && isNewGame) {
      // 首次游戏自动启动引导
      if (!hasCompletedOnboarding()) {
        // 延迟启动引导，让游戏界面先渲染完成
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
        return () => clearTimeout(timer);
      }
      setIsNewGame(false);
    }
  }, [isInitialized, gameState, isNewGame]);

  // 处理开始游戏
  const handleStartGame = () => {
    setShowIntro(false);
  };

  // 处理查看教程 - 需求 28.1
  const handleViewTutorial = () => {
    setShowIntro(false);
    setShowTutorial(true);
  };

  // 关闭教程弹窗
  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  // 处理初始化游戏（新游戏）
  const handleInitializeGame = useCallback((archetype: Parameters<typeof initializeGame>[0], difficulty: Parameters<typeof initializeGame>[1]) => {
    setIsNewGame(true);
    initializeGame(archetype, difficulty);
  }, [initializeGame]);

  // 处理加载存档（不是新游戏，不启动引导）
  const handleLoadGame = useCallback(() => {
    setIsNewGame(false);
    loadSavedGame();
  }, [loadSavedGame]);

  // 引导完成回调 - 需求 29.7
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // 跳过引导回调 - 需求 29.6
  const handleOnboardingSkip = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // 如果显示简介界面
  if (showIntro) {
    return (
      <>
        <GameIntro
          onStartGame={handleStartGame}
          onViewTutorial={handleViewTutorial}
        />
        {/* 教程弹窗可以从简介界面打开 */}
        <TutorialModal
          isOpen={showTutorial}
          onClose={handleCloseTutorial}
        />
      </>
    );
  }

  // 如果游戏未初始化，显示初始化界面
  if (!isInitialized || !gameState) {
    return (
      <>
        <GameInitializer
          onSelectArchetype={handleInitializeGame}
          onLoadGame={handleLoadGame}
          hasSavedGame={checkHasSavedGame()}
        />
        {/* 教程弹窗可以从初始化界面打开 */}
        <TutorialModal
          isOpen={showTutorial}
          onClose={handleCloseTutorial}
        />
      </>
    );
  }

  // 游戏已初始化，显示游戏主界面
  // 注意：GameBoard 组件内部也有自己的教程弹窗
  return (
    <>
      <GameBoard onRestartOnboarding={() => setShowOnboarding(true)} />
      {/* 新手引导系统 - 需求 29.1 */}
      <OnboardingGuide
        isActive={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
}

/**
 * App 组件
 * 应用根组件，提供游戏状态上下文
 */
function App() {
  return (
    <GameProvider>
      <div className="app">
        <GameContent />
      </div>
    </GameProvider>
  );
}

export default App;
