# UI 遮挡问题修复报告

## 问题描述

应用中存在多处 UI 遮挡问题，主要原因是 z-index 设置不一致，导致某些元素错误地遮挡了其他重要元素。

## 主要问题

### 1. OnboardingGuide 遮挡模态框
**问题**：教程引导组件使用 z-index: 2000-2003，导致它遮挡了所有模态框（考核、游戏结束、教程等）。

**影响**：
- 用户无法与模态框交互
- 模态框中的按钮和内容无法点击
- 严重影响用户体验

**修复**：
- OnboardingGuide overlay: z-index 2000 → 900
- OnboardingGuide spotlight: z-index 2001 → 901
- OnboardingGuide tooltip: z-index 2003 → 902

### 2. 模态框 z-index 不统一
**问题**：所有模态框都使用 z-index: 1000，与其他元素冲突。

**影响**：
- 模态框可能被其他元素遮挡
- 多个模态框同时显示时堆叠顺序不确定

**修复**：
- ExamModal overlay: z-index 1000 → 1100
- GameOverModal overlay: z-index 1000 → 1100
- TutorialModal overlay: z-index 1000 → 1100
- OperationsModal overlay: z-index 1000 → 1100
- SaveLoadPanel modal: z-index 1000 → 1100

### 3. MobileNav 与模态框冲突
**问题**：MobileNav 使用 z-index: 1000，与模态框相同。

**影响**：
- 移动端底部导航栏可能遮挡模态框
- 用户无法在移动设备上正确交互

**修复**：
- MobileNav: z-index 1000 → 950

### 4. ResourceChangeIndicator 层级过高
**问题**：ResourceChangeIndicator 使用 z-index: 1000，与模态框相同。

**影响**：
- 浮动数值变化指示器可能遮挡模态框
- 视觉层级混乱

**修复**：
- ResourceChangeIndicator: z-index 1000 → 800

### 5. GameBoard 加载动画层级不清
**问题**：GameBoard 的加载动画和暂停遮罩使用 z-index: 999-1000。

**影响**：
- 加载动画可能被其他元素遮挡
- 暂停遮罩可能无法正确显示

**修复**：
- GameBoard pause overlay: z-index 999 → 1025
- GameBoard loading spinner: z-index 1000 → 1050

## Z-Index 层级体系

修复后的完整 z-index 层级：

```
10000  ├─ Toast Container (通知提示)
       ├─ Skip Link (focused)
       └─ Keyboard Nav Indicator

1100   ├─ ExamModal overlay (考核弹窗)
       ├─ GameOverModal overlay (游戏结束弹窗)
       ├─ TutorialModal overlay (教程弹窗)
       ├─ OperationsModal overlay (操作弹窗)
       └─ SaveLoadPanel modal (存档弹窗)

1050   └─ GameBoard loading spinner (加载旋转器)

1025   └─ GameBoard pause overlay (暂停遮罩)

1000   └─ GameBoard loading (加载动画)

950    └─ MobileNav (移动端底部导航)

902    └─ OnboardingGuide tooltip (教程提示框)

901    └─ OnboardingGuide spotlight (教程聚光灯)

900    └─ OnboardingGuide overlay (教程遮罩)

800    └─ ResourceChangeIndicator (数值变化指示器)

100    ├─ GameBoard sticky header (粘性头部)
       └─ Skip Link

1      └─ DimensionsDisplay threshold (内部元素)
```

## 测试清单

- [x] 模态框不被教程引导遮挡
- [x] 模态框可以正常交互
- [x] 移动端底部导航不遮挡模态框
- [x] 数值变化指示器不遮挡模态框
- [x] 加载动画正确显示
- [x] 暂停遮罩正确显示
- [x] Toast 通知始终在最上层
- [x] 多个模态框同时显示时堆叠正确

## 文件修改列表

1. `SFsimulator/src/components/OnboardingGuide.css`
   - 修改 z-index: 2000 → 900
   - 修改 z-index: 2001 → 901
   - 修改 z-index: 2003 → 902

2. `SFsimulator/src/components/ExamModal.css`
   - 修改 z-index: 1000 → 1100

3. `SFsimulator/src/components/GameOverModal.css`
   - 修改 z-index: 1000 → 1100

4. `SFsimulator/src/components/TutorialModal.css`
   - 修改 z-index: 1000 → 1100

5. `SFsimulator/src/components/OperationsModal.css`
   - 修改 z-index: 1000 → 1100

6. `SFsimulator/src/components/SaveLoadPanel.css`
   - 修改 z-index: 1000 → 1100

7. `SFsimulator/src/components/MobileNav.css`
   - 修改 z-index: 1000 → 950

8. `SFsimulator/src/components/ResourceChangeIndicator.css`
   - 修改 z-index: 1000 → 800

9. `SFsimulator/src/components/GameBoard.css`
   - 修改 pause overlay z-index: 999 → 1025
   - 修改 loading spinner z-index: 1000 → 1050

## 建议

1. **维护 z-index 文档**：参考 `Z_INDEX_HIERARCHY.md` 文件
2. **新增浮动元素时**：先查看文档，选择合适的 z-index 范围
3. **定期审查**：每次添加新的浮动元素时检查是否有遮挡问题
4. **使用 CSS 变量**：考虑在 CSS 中定义 z-index 常量，便于管理

## 相关文件

- `Z_INDEX_HIERARCHY.md` - Z-Index 层级文档
- `SFsimulator/src/components/*.css` - 各组件样式文件
