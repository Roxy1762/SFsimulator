# Z-Index 快速参考指南

## 修复摘要

已修复多处 UI 遮挡问题，通过重新组织 z-index 层级确保所有元素正确显示。

## 修改概览

| 组件 | 旧值 | 新值 | 原因 |
|------|------|------|------|
| OnboardingGuide overlay | 2000 | 900 | 降低优先级，不遮挡模态框 |
| OnboardingGuide spotlight | 2001 | 901 | 降低优先级，不遮挡模态框 |
| OnboardingGuide tooltip | 2003 | 902 | 降低优先级，不遮挡模态框 |
| ExamModal overlay | 1000 | 1100 | 统一模态框层级 |
| GameOverModal overlay | 1000 | 1100 | 统一模态框层级 |
| TutorialModal overlay | 1000 | 1100 | 统一模态框层级 |
| OperationsModal overlay | 1000 | 1100 | 统一模态框层级 |
| SaveLoadPanel modal | 1000 | 1100 | 统一模态框层级 |
| MobileNav | 1000 | 950 | 降低优先级，不遮挡模态框 |
| ResourceChangeIndicator | 1000 | 800 | 降低优先级，不遮挡模态框 |
| GameBoard pause overlay | 999 | 1025 | 提高优先级，确保正确显示 |
| GameBoard loading spinner | 1000 | 1050 | 提高优先级，确保正确显示 |

## 当前 Z-Index 层级

```
最高 ┌─ 10000: Toast 通知
     │
     ├─ 1100: 所有模态框 (考核、游戏结束、教程、操作、存档)
     │
     ├─ 1050: GameBoard 加载旋转器
     │
     ├─ 1025: GameBoard 暂停遮罩
     │
     ├─ 1000: GameBoard 加载动画
     │
     ├─ 950: MobileNav (移动端底部导航)
     │
     ├─ 902: OnboardingGuide 提示框
     │
     ├─ 901: OnboardingGuide 聚光灯
     │
     ├─ 900: OnboardingGuide 遮罩
     │
     ├─ 800: ResourceChangeIndicator (数值变化)
     │
     └─ 100: 粘性头部、跳过链接
最低
```

## 关键改进

✅ **模态框不再被遮挡** - 所有模态框现在都在 z-index: 1100
✅ **教程引导优先级降低** - 不再遮挡重要的交互元素
✅ **移动端导航正确显示** - 不遮挡模态框
✅ **加载动画清晰可见** - 优先级提高到 1050
✅ **数值指示器不干扰** - 优先级降低到 800

## 测试建议

1. 打开任何模态框（考核、游戏结束等）
2. 验证模态框完全可见且可交互
3. 在移动设备上测试底部导航
4. 检查教程引导是否正确显示
5. 验证加载动画和暂停遮罩

## 文件位置

- 详细文档: `Z_INDEX_HIERARCHY.md`
- 修复报告: `UI_OCCLUSION_FIXES.md`
- 本文件: `Z_INDEX_QUICK_REFERENCE.md`

## 维护建议

添加新的浮动元素时：
1. 查看本文档确定合适的 z-index
2. 在 `Z_INDEX_HIERARCHY.md` 中记录
3. 测试确保没有遮挡问题
4. 更新此快速参考指南
