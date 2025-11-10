/**
 * 章节检测器模块
 * 负责根据规则库检测文本中的章节
 */
class ChapterDetector {
  constructor() {
    // 章节规则库，按优先级排序（优先级高的在前）
    this.chapterRules = [
      {
        name: "中文数字章节",
        pattern: /第[一二三四五六七八九十百千万零]+章/g,
        priority: 10,
        description: "匹配'第一章'、'第二章'等中文数字章节"
      },
      {
        name: "中文数字节",
        pattern: /第[一二三四五六七八九十百千万零]+节/g,
        priority: 9,
        description: "匹配'第一节'、'第二节'等中文数字节"
      },
      {
        name: "阿拉伯数字章节",
        pattern: /第\d+章/g,
        priority: 8,
        description: "匹配'第1章'、'第2章'等阿拉伯数字章节"
      },
      {
        name: "阿拉伯数字节",
        pattern: /第\d+节/g,
        priority: 7,
        description: "匹配'第1节'、'第2节'等阿拉伯数字节"
      },
      {
        name: "英文Chapter",
        pattern: /Chapter\s+\d+/gi,
        priority: 6,
        description: "匹配'Chapter 1'、'Chapter 2'等英文章节"
      },
      {
        name: "特殊标记章节",
        pattern: /【第\d+章】/g,
        priority: 5,
        description: "匹配'【第1章】'、'【第2章】'等特殊标记章节"
      },
      {
        name: "特殊标记节",
        pattern: /【第\d+节】/g,
        priority: 4,
        description: "匹配'【第1节】'、'【第2节】'等特殊标记节"
      },
      {
        name: "括号章节",
        pattern: /\(第\d+章\)/g,
        priority: 3,
        description: "匹配'(第1章)'、'(第2章)'等括号章节"
      },
      {
        name: "括号节",
        pattern: /\(第\d+节\)/g,
        priority: 2,
        description: "匹配'(第1节)'、'(第2节)'等括号节"
      },
      {
        name: "纯数字章节",
        pattern: /^\d+\./gm,
        priority: 1,
        description: "匹配'1.'、'2.'等纯数字章节"
      }
    ];

    // 章节标题后可能跟随的内容模式
    this.titlePatterns = [
      /\s*[：:]\s*/,  // 冒号
      /\s+/,          // 空格
      /$/             // 行尾
    ];
  }

  /**
   * 检测文本中的章节
   * @param {string} content - 文本内容
   * @returns {Array} - 章节数组
   */
  detectChapters(content) {
    // 统计每种规则的匹配次数
    const ruleMatches = this.evaluateRules(content);

    // 按优先级和匹配次数排序规则
    const sortedRules = this.sortRulesByPriorityAndMatches(ruleMatches);

    // 使用最佳规则检测章节
    const bestRule = sortedRules.length > 0 ? sortedRules[0] : null;

    if (!bestRule || bestRule.matches.length === 0) {
      return [];
    }

    // 提取章节信息
    const chapters = this.extractChapterInfo(content, bestRule);

    return chapters;
  }

  /**
   * 评估所有规则的匹配情况
   * @param {string} content - 文本内容
   * @returns {Array} - 规则匹配结果
   */
  evaluateRules(content) {
    const results = [];

    for (const rule of this.chapterRules) {
      const matches = [...content.matchAll(rule.pattern)];
      results.push({
        rule: rule,
        matches: matches,
        count: matches.length
      });
    }

    return results;
  }

  /**
   * 按优先级和匹配次数排序规则
   * @param {Array} ruleMatches - 规则匹配结果
   * @returns {Array} - 排序后的规则
   */
  sortRulesByPriorityAndMatches(ruleMatches) {
    // 过滤出有匹配的规则
    const validRules = ruleMatches.filter(result => result.count > 0);

    // 按优先级降序排序，优先级相同时按匹配次数降序排序
    validRules.sort((a, b) => {
      if (a.rule.priority !== b.rule.priority) {
        return b.rule.priority - a.rule.priority;
      }
      return b.count - a.count;
    });

    return validRules;
  }

  /**
   * 提取章节信息
   * @param {string} content - 文本内容
   * @param {Object} ruleMatch - 规则匹配结果
   * @returns {Array} - 章节数组
   */
  extractChapterInfo(content, ruleMatch) {
    const chapters = [];
    const { rule, matches } = ruleMatch;

    for (const match of matches) {
      const position = match.index;
      const title = match[0];

      // 提取章节标题
      const fullTitle = this.extractFullTitle(content, position, title);

      // 提取章节内容
      const chapterContent = this.extractChapterContent(content, position, matches);

      chapters.push({
        title: title,
        fullTitle: fullTitle,
        position: position,
        content: chapterContent,
        rule: rule.name
      });
    }

    return chapters;
  }

  /**
   * 提取完整章节标题
   * @param {string} content - 文本内容
   * @param {number} position - 章节标记位置
   * @param {string} title - 章节标记
   * @returns {string} - 完整章节标题
   */
  extractFullTitle(content, position, title) {
    // 获取章节标记后的内容
    const afterTitle = content.substring(position + title.length);

    // 尝试匹配标题模式
    for (const pattern of this.titlePatterns) {
      const match = afterTitle.match(pattern);
      if (match) {
        const titleEnd = match.index + match[0].length;
        const fullTitle = title + afterTitle.substring(0, titleEnd);

        // 如果标题在同一行，返回完整标题
        if (!fullTitle.includes('\n')) {
          return fullTitle.trim();
        }
      }
    }

    // 如果没有匹配到模式，返回章节标记
    return title;
  }

  /**
   * 提取章节内容
   * @param {string} content - 文本内容
   * @param {number} currentPosition - 当前章节位置
   * @param {Array} allMatches - 所有章节匹配
   * @returns {string} - 章节内容
   */
  extractChapterContent(content, currentPosition, allMatches) {
    // 找到下一个章节的位置
    const nextChapterIndex = allMatches.findIndex(match => match.index > currentPosition);

    let endPosition;
    if (nextChapterIndex !== -1) {
      // 如果有下一个章节，内容到下一个章节之前
      endPosition = allMatches[nextChapterIndex].index;
    } else {
      // 如果没有下一个章节，内容到文件末尾
      endPosition = content.length;
    }

    // 提取章节内容
    const chapterContent = content.substring(currentPosition, endPosition);

    return chapterContent;
  }

  /**
   * 获取所有规则
   * @returns {Array} - 规则数组
   */
  getAllRules() {
    return this.chapterRules;
  }

  /**
   * 添加自定义规则
   * @param {Object} rule - 规则对象
   */
  addRule(rule) {
    if (rule.name && rule.pattern && rule.priority !== undefined) {
      this.chapterRules.push(rule);
      // 按优先级排序
      this.chapterRules.sort((a, b) => b.priority - a.priority);
      return true;
    }
    return false;
  }

  /**
   * 删除规则
   * @param {string} ruleName - 规则名称
   * @returns {boolean} - 是否删除成功
   */
  removeRule(ruleName) {
    const index = this.chapterRules.findIndex(rule => rule.name === ruleName);
    if (index !== -1) {
      this.chapterRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 更新规则优先级
   * @param {string} ruleName - 规则名称
   * @param {number} newPriority - 新优先级
   * @returns {boolean} - 是否更新成功
   */
  updateRulePriority(ruleName, newPriority) {
    const rule = this.chapterRules.find(rule => rule.name === ruleName);
    if (rule) {
      rule.priority = newPriority;
      // 重新排序
      this.chapterRules.sort((a, b) => b.priority - a.priority);
      return true;
    }
    return false;
  }
}

// 导出模块
window.ChapterDetector = ChapterDetector;
