/**
 * TutorialModal 组件
 * 游戏教程弹窗，提供详细的游戏机制说明
 * 支持章节导航和翻页功能
 * 
 * 需求: 28.1, 28.2, 28.3, 28.4, 28.5
 */

import { useState, useCallback, useEffect } from 'react';
import './TutorialModal.css';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 教程章节数据结构
 */
interface TutorialChapter {
  id: string;
  title: string;
  icon: string;
  content: TutorialSection[];
}

/**
 * 教程内容区块
 */
interface TutorialSection {
  title?: string;
  paragraphs: string[];
  tips?: string[];
  highlights?: { label: string; value: string; color?: string }[];
}

/**
 * 教程章节内容 - 需求 28.2
 */
const TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: 'basics',
    title: '基础操作',
    icon: '🎮',
    content: [
      {
        title: '回合制游戏',
        paragraphs: [
          '《黑箱：算法飞升》是一款回合制策略游戏。每个回合你可以执行多个操作，直到算力（AP）耗尽或主动结束回合。',
          '每回合开始时，你的算力会恢复到上限。合理规划每回合的操作顺序是取胜的关键。'
        ],
        tips: [
          '点击"结束回合"按钮推进游戏',
          '注意观察剩余算力，避免浪费'
        ]
      },
      {
        title: '操作面板',
        paragraphs: [
          '操作面板按类别分组显示所有可执行的操作。点击类别标题可以展开或折叠该类别。',
          '每个操作都会显示所需的资源消耗和预期效果。灰色的操作表示当前资源不足，无法执行。'
        ],
        highlights: [
          { label: '数据获取', value: '获取和处理数据', color: '#22c55e' },
          { label: '模型训练', value: '提升拟合指数', color: '#3b82f6' },
          { label: '系统维护', value: '降低熵值', color: '#f59e0b' },
          { label: '专项培养', value: '提升能力维度', color: '#8b5cf6' }
        ]
      }
    ]
  },
  {
    id: 'resources',
    title: '资源管理',
    icon: '💎',
    content: [
      {
        title: '三大核心资源',
        paragraphs: [
          '游戏中有三种核心资源需要管理：资金、算力和数据。合理分配这些资源是成功的基础。'
        ],
        highlights: [
          { label: '💰 资金', value: '用于购买数据、雇佣团队、执行付费操作', color: '#f59e0b' },
          { label: '⚡ 算力 (AP)', value: '每回合可用的行动点数，执行操作消耗', color: '#3b82f6' },
          { label: '📊 数据', value: '分为脏数据和黄金数据，用于训练模型', color: '#22c55e' }
        ]
      },
      {
        title: '资金管理',
        paragraphs: [
          '资金是公司运营的命脉。主要通过流量考核获得奖励，也可以通过外快任务赚取。',
          '⚠️ 重要警告：如果资金连续2回合为负数，公司将破产，游戏结束！'
        ],
        tips: [
          '保持资金储备，应对突发情况',
          '考核前确保有足够资金支付团队工资',
          '合理使用外快任务补充收入'
        ]
      },
      {
        title: '数据类型',
        paragraphs: [
          '脏数据：通过爬虫等方式快速获取，数量大但质量低。可用于基础训练（SGD）。',
          '黄金数据：经过清洗的高质量数据，用于精细微调，训练效果更好。'
        ],
        tips: [
          '使用"数据清洗"将脏数据转化为黄金数据',
          '黄金数据的训练效果是脏数据的3倍'
        ]
      }
    ]
  },
  {
    id: 'training',
    title: '模型训练',
    icon: '🧠',
    content: [
      {
        title: '拟合指数',
        paragraphs: [
          '拟合指数代表你的推荐模型的性能水平，范围是0-100%。拟合指数越高，在考核中获得的收益越多。',
          '通过各种训练操作可以提升拟合指数，但同时也会增加系统熵值。'
        ],
        highlights: [
          { label: 'SGD训练', value: '消耗脏数据，拟合+5，熵值+10', color: '#3b82f6' },
          { label: '精细微调', value: '消耗黄金数据，拟合+15，熵值+25', color: '#8b5cf6' },
          { label: '对抗训练', value: '50%概率拟合+30或-15', color: '#ef4444' }
        ]
      },
      {
        title: '熵值/技术债',
        paragraphs: [
          '熵值代表系统的混乱程度和技术债务。大多数操作都会增加熵值，需要通过维护操作来降低。'
        ],
        highlights: [
          { label: '0-40%', value: '安全区：稳定性系数1.2，收益+20%', color: '#22c55e' },
          { label: '41-80%', value: '危险区：稳定性系数0.8，收益-20%', color: '#f59e0b' },
          { label: '81-100%', value: '崩溃区：每回合30%概率服务熔断！', color: '#ef4444' }
        ],
        tips: [
          '定期使用"代码重构"降低熵值',
          '熵值过高时优先维护，避免熔断'
        ]
      },
      {
        title: '服务熔断',
        paragraphs: [
          '当熵值超过80%时，每回合开始有30%概率触发服务熔断。熔断期间无法执行任何操作，且需要支付维修费用。',
          '如果在考核时处于熔断状态，稳定性系数为0，收益将为0！'
        ]
      }
    ]
  },
  {
    id: 'exam',
    title: '考核系统',
    icon: '📊',
    content: [
      {
        title: '流量考核',
        paragraphs: [
          '每5回合进行一次流量洪峰考核。考核会随机选择一个场景（如"双11购物节"、"突发新闻"等），并根据你的模型表现计算收益。'
        ],
        highlights: [
          { label: '考核周期', value: '每5回合一次', color: '#3b82f6' },
          { label: '收益公式', value: '基础流量 × 拟合指数 × 稳定性 × 维度加成', color: '#8b5cf6' }
        ]
      },
      {
        title: '维度考核',
        paragraphs: [
          '每次考核会随机选择1-2个重点考核维度。你在这些维度上的能力值会影响最终收益。',
          '随着考核次数增加，会出现维度门槛要求。未达到门槛将导致考核失败。'
        ],
        highlights: [
          { label: '维度≥60', value: '加成系数1.5（+50%）', color: '#22c55e' },
          { label: '维度40-59', value: '加成系数1.0（±0%）', color: '#f59e0b' },
          { label: '维度<40', value: '加成系数0.6（-40%）', color: '#ef4444' }
        ]
      },
      {
        title: '难度递进',
        paragraphs: [
          '考核难度会随着通过次数逐渐增加。基础流量要求会提高，但奖励也会相应增加。',
          '不同难度等级的增长速度不同：简单+5%/次，普通+8%/次，困难+12%/次，噩梦+15%/次。'
        ],
        tips: [
          '提前查看下次考核的维度要求',
          '平衡发展多个维度，避免短板',
          '考核失败会扣除资金，但不会直接结束游戏'
        ]
      }
    ]
  },
  {
    id: 'team',
    title: '团队系统',
    icon: '👥',
    content: [
      {
        title: '雇佣团队',
        paragraphs: [
          '你可以雇佣团队成员来获得各种加成。每回合会刷新3个候选人供你选择。团队最多可以有5名成员。',
          '团队成员有不同的稀有度：普通、稀有、史诗、传说。稀有度越高，基础属性越好，词条越多。'
        ],
        highlights: [
          { label: '普通', value: '0词条，基础工资200', color: '#9e9e9e' },
          { label: '稀有', value: '1词条，基础工资350', color: '#2196f3' },
          { label: '史诗', value: '2词条，基础工资550', color: '#9c27b0' },
          { label: '传说', value: '3词条，基础工资900', color: '#ff9800' }
        ]
      },
      {
        title: '能力词条',
        paragraphs: [
          '团队成员可能拥有各种能力词条，提供不同的加成效果。'
        ],
        highlights: [
          { label: '算法专家', value: '算法优化+8', color: '#3b82f6' },
          { label: '数据工程师', value: '数据处理+8', color: '#8b5cf6' },
          { label: '架构师', value: '系统稳定+8', color: '#22c55e' },
          { label: '效率达人', value: '每回合+1 AP', color: '#f59e0b' },
          { label: '成本控制', value: '资金消耗-8%', color: '#06b6d4' }
        ]
      },
      {
        title: '成员养成',
        paragraphs: [
          '团队成员可以通过参与操作获得经验值，升级后基础属性会提升（每级+8%）。',
          '升级到偶数级（2/4/6/8/10）时，有25%概率获得新词条（最多3个）。'
        ],
        tips: [
          '使用"团队培训"操作为所有成员增加经验',
          '成员工资会随等级增长（每级+8%）',
          '解雇成员只能返还30%雇佣费用'
        ]
      },
      {
        title: '工资系统',
        paragraphs: [
          '每次考核结算时，需要支付所有团队成员的工资。如果资金不足，系统会随机解雇成员。',
          '在雇佣前要考虑长期的工资支出，避免团队规模过大导致财务危机。'
        ]
      }
    ]
  },
  {
    id: 'sidejob',
    title: '外快系统',
    icon: '💰',
    content: [
      {
        title: '外快任务',
        paragraphs: [
          '除了考核奖励，你还可以通过外快任务赚取额外收入。每回合最多执行2次外快任务。'
        ],
        highlights: [
          { label: '接私活', value: '获得800-1200资金，熵值+5', color: '#22c55e' },
          { label: '技术咨询', value: '需要算法≥50，获得1500资金', color: '#3b82f6' },
          { label: '数据标注外包', value: '消耗200脏数据，获得600资金', color: '#8b5cf6' },
          { label: '开源贡献', value: '获得500资金，声望+10', color: '#f59e0b' },
          { label: '技术博客', value: '需要任意维度≥60，声望+15', color: '#06b6d4' }
        ]
      },
      {
        title: '声望系统',
        paragraphs: [
          '声望代表你在业界的知名度，范围是0-100。通过开源贡献、技术博客等方式可以提升声望。',
          '声望达到一定等级可以解锁更多外快任务，高声望还能获得考核奖励加成。'
        ],
        highlights: [
          { label: '声望≥30', value: '解锁"技术咨询"', color: '#3b82f6' },
          { label: '声望≥50', value: '解锁"技术博客"', color: '#8b5cf6' },
          { label: '声望≥70', value: '考核奖励+10%', color: '#22c55e' }
        ],
        tips: [
          '考核失败会扣除10点声望',
          '噩梦难度考核失败额外扣除5点声望'
        ]
      }
    ]
  }
];

/**
 * TutorialModal 组件
 * 显示游戏教程内容，支持章节导航
 */
export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // 模态框打开时锁定背景滚动 - 需求 10.2
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // 切换到指定章节
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < TUTORIAL_CHAPTERS.length) {
      setCurrentChapterIndex(index);
    }
  }, []);

  // 上一章
  const goToPrevChapter = useCallback(() => {
    goToChapter(currentChapterIndex - 1);
  }, [currentChapterIndex, goToChapter]);

  // 下一章
  const goToNextChapter = useCallback(() => {
    goToChapter(currentChapterIndex + 1);
  }, [currentChapterIndex, goToChapter]);

  // 关闭时重置到第一章
  const handleClose = useCallback(() => {
    setCurrentChapterIndex(0);
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  const currentChapter = TUTORIAL_CHAPTERS[currentChapterIndex];
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === TUTORIAL_CHAPTERS.length - 1;

  return (
    <div className="tutorial-modal-overlay" onClick={handleClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <header className="tutorial-header">
          <div className="tutorial-title-area">
            <span className="tutorial-icon">📚</span>
            <h2>游戏教程</h2>
          </div>
          <button 
            className="tutorial-close-button" 
            onClick={handleClose}
            aria-label="关闭教程"
          >
            ✕
          </button>
        </header>

        {/* 章节导航栏 - 需求 28.3 */}
        <nav className="tutorial-nav">
          {TUTORIAL_CHAPTERS.map((chapter, index) => (
            <button
              key={chapter.id}
              className={`tutorial-nav-item ${index === currentChapterIndex ? 'active' : ''}`}
              onClick={() => goToChapter(index)}
              aria-current={index === currentChapterIndex ? 'page' : undefined}
            >
              <span className="nav-icon">{chapter.icon}</span>
              <span className="nav-title">{chapter.title}</span>
            </button>
          ))}
        </nav>

        {/* 内容区域 - 需求 28.4 */}
        <main className="tutorial-content">
          <div className="chapter-header">
            <span className="chapter-icon">{currentChapter.icon}</span>
            <h3 className="chapter-title">{currentChapter.title}</h3>
          </div>

          <div className="chapter-body">
            {currentChapter.content.map((section, sectionIndex) => (
              <section key={sectionIndex} className="tutorial-section">
                {section.title && (
                  <h4 className="section-title">{section.title}</h4>
                )}
                
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="section-paragraph">{paragraph}</p>
                ))}

                {section.highlights && section.highlights.length > 0 && (
                  <div className="section-highlights">
                    {section.highlights.map((highlight, hIndex) => (
                      <div 
                        key={hIndex} 
                        className="highlight-item"
                        style={{ '--highlight-color': highlight.color } as React.CSSProperties}
                      >
                        <span className="highlight-label">{highlight.label}</span>
                        <span className="highlight-value">{highlight.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.tips && section.tips.length > 0 && (
                  <div className="section-tips">
                    <div className="tips-header">
                      <span className="tips-icon">💡</span>
                      <span>小贴士</span>
                    </div>
                    <ul className="tips-list">
                      {section.tips.map((tip, tIndex) => (
                        <li key={tIndex}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>
        </main>

        {/* 底部导航 - 需求 28.3 */}
        <footer className="tutorial-footer">
          <button
            className="tutorial-nav-button prev"
            onClick={goToPrevChapter}
            disabled={isFirstChapter}
          >
            <span className="nav-arrow">←</span>
            <span>上一章</span>
          </button>

          {/* 页码指示器 */}
          <div className="tutorial-pagination">
            {TUTORIAL_CHAPTERS.map((_, index) => (
              <button
                key={index}
                className={`pagination-dot ${index === currentChapterIndex ? 'active' : ''}`}
                onClick={() => goToChapter(index)}
                aria-label={`跳转到第${index + 1}章`}
              />
            ))}
          </div>

          <button
            className="tutorial-nav-button next"
            onClick={goToNextChapter}
            disabled={isLastChapter}
          >
            <span>下一章</span>
            <span className="nav-arrow">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TutorialModal;
