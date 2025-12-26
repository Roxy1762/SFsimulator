# Z-Index 层级文档

本文档定义了整个应用中所有浮动元素的 z-index 堆叠顺序，确保 UI 元素不会相互遮挡。

## Z-Index 层级表

| 层级 | Z-Index | 组件 | 说明 |
|------|---------|------|------|
| 1 | 1 | DimensionsDisplay | 内部元素，最低层 |
| 2 | 100 | GameBoard (sticky header) | 粘性头部 |
| 3 | 100 | Skip Link | 无障碍跳过链接 |
| 4 | 800 | ResourceChangeIndicator | 浮动数值变化指示器 |
| 5 | 900 | OnboardingGuide (overlay) | 教程引导遮罩 |
| 6 | 901 | OnboardingGuide (spotlight) | 教程引导聚光灯 |
| 7 | 902 | OnboardingGuide (tooltip) | 教程引导提示框 |
| 8 | 950 | MobileNav | 移动端底部导航栏 |
| 9 | 1000 | GameBoard (loading spinner) | 加载动画 |
| 10 | 1025 | GameBoard (pause overlay) | 游戏暂停遮罩 |
| 11 | 1050 | GameBoard (loading spinner) | 加载旋转器 |
| 12 | 1100 | ExamModal (overlay) | 考核弹窗遮罩 |
| 13 | 1100 | GameOverModal (overlay) | 游戏结束弹窗遮罩 |
| 14 | 1100 | TutorialModal (overlay) | 教程弹窗遮罩 |
| 15 | 1100 | OperationsModal (overlay) | 操作弹窗遮罩 |
| 16 | 1100 | SaveLoadPanel (modal overlay) | 存档弹窗遮罩 |
| 17 | 10000 | Toast Container | 通知提示，最高层 |
| 18 | 10000 | Skip Link (focused) | 无障碍跳过链接（获得焦点时） |
| 19 | 10000 | Keyboard Nav Indicator | 键盘导航指示器 |

## 设计原则

1. **分层清晰**：不同功能的元素使用不同的 z-index 范围
   - 0-100: 基础布局元素
   - 800-902: 教程和引导元素
   - 950: 导航栏
   - 1000-1050: 游戏状态指示器
   - 1100: 模态框
   - 10000: 顶层通知

2. **避免冲突**：
   - 模态框统一使用 z-index: 1100
   - 教程引导使用 900-902 范围，低于模态框
   - Toast 使用最高的 z-index: 10000

3. **可维护性**：
   - 每个组件的 z-index 都有明确的用途
   - 新增浮动元素时参考此文档
   - 避免使用过大的 z-index 值

## 修复历史

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

### Q: 为什么教程引导的 z-index 低于模态框？
A: 教程引导应该在用户交互时不阻挡模态框，模态框是更重要的交互元素。

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
