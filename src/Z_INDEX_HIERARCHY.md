# Z-Index 层级文档

本文档定义了整个应用中所有浮动元素的 z-index 堆叠顺序，确保 UI 元素不会相互遮挡。

## Z-Index 层级表

| 层级 | Z-Index | 组件 | 说明 |
|------|---------|------|------|
| 1 | 1 | DimensionsDisplay | 内部元素，最低层 |
| 2 | 100 | GameBoard (sticky header) | 粘性头部 |
| 3 | 100 | Skip Link | 无障碍跳过链接 |
| 4 | 800 | ResourceChangeIndicator | 浮动数值变化指示器 |
| 5 | 950 | MobileNav | 移动端底部导航栏 |
| 6 | 1000 | GameBoard (loading spinner) | 加载动画 |
| 7 | 1025 | GameBoard (pause overlay) | 游戏暂停遮罩 |
| 8 | 1050 | GameBoard (loading spinner) | 加载旋转器 |
| 9 | 1100 | ExamModal (overlay) | 考核弹窗遮罩 |
| 10 | 1100 | GameOverModal (overlay) | 游戏结束弹窗遮罩 |
| 11 | 1100 | TutorialModal (overlay) | 教程弹窗遮罩 |
| 12 | 1100 | OperationsModal (overlay) | 操作弹窗遮罩 |
| 13 | 1100 | SaveLoadPanel (modal overlay) | 存档弹窗遮罩 |
| 14 | 1200 | OnboardingGuide (overlay) | 新手引导遮罩 |
| 15 | 1201 | OnboardingGuide (spotlight) | 新手引导聚光灯 |
| 16 | 1202 | OnboardingGuide (tooltip) | 新手引导提示框 |
| 17 | 10000 | Toast Container | 通知提示，最高层 |
| 18 | 10000 | Skip Link (focused) | 无障碍跳过链接（获得焦点时） |
| 19 | 10000 | Keyboard Nav Indicator | 键盘导航指示器 |

## 设计原则

1. **分层清晰**：不同功能的元素使用不同的 z-index 范围
   - 0-100: 基础布局元素
   - 800: 浮动指示器
   - 950: 导航栏
   - 1000-1050: 游戏状态指示器
   - 1100: 模态框
   - 1200-1202: 新手引导（高于模态框，确保引导时可交互）
   - 10000: 顶层通知

2. **避免冲突**：
   - 模态框统一使用 z-index: 1100
   - 新手引导使用 1200-1202 范围，高于模态框和导航栏
   - Toast 使用最高的 z-index: 10000

3. **可维护性**：
   - 每个组件的 z-index 都有明确的用途
   - 新增浮动元素时参考此文档
   - 避免使用过大的 z-index 值

## 修复历史

### 2025-12-26 (第三次修复)
- 修复 OnboardingGuide 在移动端被 MobileNav 遮挡的问题
  - 根本原因：OnboardingGuide 的 z-index (900-902) 低于 MobileNav (950)
  - 解决方案：将 OnboardingGuide 的 z-index 提升到 1200-1202，高于所有模态框和导航栏
  - 同时优化了移动端 tooltip 位置计算，避免被底部导航栏遮挡
  - 增大了移动端按钮的触摸目标尺寸 (min-height: 44px)

### 2025-12-26 (第二次修复)
- 修复 SaveLoadPanel 导入弹窗被遮挡的问题
  - 根本原因：`.game-sidebar` 和 `.game-center` 使用了 `will-change: transform` 和 `contain: layout style`，创建了新的堆叠上下文
  - 解决方案：使用 React Portal 将弹窗渲染到 `document.body`，脱离堆叠上下文限制
- 同样修复 OperationsModal 的弹窗遮挡问题
  - 使用 React Portal 渲染弹窗到 `document.body`

### 2025-12-26 (第一次修复)
- 修复 OnboardingGuide 遮挡模态框的问题
  - 从 z-index: 2000-2003 降低到 900-902
- 统一所有模态框的 z-index 为 1100
- 调整 MobileNav 的 z-index 为 950
- 调整 ResourceChangeIndicator 的 z-index 为 800
- 调整 GameBoard 加载动画的 z-index 为 1050

## 常见问题

### Q: 为什么模态框的 z-index 是 1100？
A: 1100 是一个合理的中间值，高于导航栏和指示器（950 以下），低于通知（10000）。

### Q: 为什么教程引导的 z-index 高于模态框？
A: 新手引导是首次游戏时的关键交互，需要确保用户能够完成引导流程。引导期间不应该有其他元素遮挡引导界面的按钮。

### Q: 为什么某些弹窗需要使用 React Portal？
A: 当弹窗的父容器使用了以下 CSS 属性时，会创建新的堆叠上下文：
- `transform` (包括 `will-change: transform`)
- `filter`
- `perspective`
- `contain: layout` 或 `contain: paint`
- `isolation: isolate`
- `opacity` < 1
- `mix-blend-mode` (非 normal)

在新的堆叠上下文中，子元素的 z-index 只在该上下文内有效，无法超越父容器的同级元素。使用 React Portal 将弹窗渲染到 `document.body` 可以脱离这个限制。

### Q: 如何添加新的浮动元素？
A: 
1. 确定元素的功能和优先级
2. 在合适的范围内选择 z-index
3. 检查父容器是否有创建堆叠上下文的属性
4. 如果有，考虑使用 React Portal
5. 更新此文档
6. 测试确保没有遮挡问题
