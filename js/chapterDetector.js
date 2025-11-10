/**
 * 章节检测器模块
 * 负责根据规则库检测文本中的章节
 */
class ChapterDetector {
  constructor() {
    // 章节规则库，按优先级排序（优先级高的在前）
    this.chapterRules = [
      {
        name: "特殊标记章节-全角括号",
        pattern: /【第[一二三四五六七八九十百千万零\d]+章】/g,
        priority: 20,
        description: "匹配'【第一章】'、'【第1章】'等全角括号章节"
      },
      {
        name: "特殊标记节-全角括号",
        pattern: /【第[一二三四五六七八九十百千万零\d]+节】/g,
        priority: 19,
        description: "匹配'【第一节】'、'【第1节】'等全角括号节"
      },
      {
        name: "特殊标记章节-半角括号",
        pattern: /\[第[一二三四五六七八九十百千万零\d]+章\]/g,
        priority: 18,
        description: "匹配'[第一章]'、'[第1章]'等半角括号章节"
      },
      {
        name: "特殊标记节-半角括号",
        pattern: /\[第[一二三四五六七八九十百千万零\d]+节\]/g,
        priority: 17,
        description: "匹配'[第一节]'、'[第1节]'等半角括号节"
      },
      {
        name: "特殊标记章节-圆括号",
        pattern: /\(第[一二三四五六七八九十百千万零\d]+章\)/g,
        priority: 16,
        description: "匹配'(第一章)'、'(第1章)'等圆括号章节"
      },
      {
        name: "特殊标记节-圆括号",
        pattern: /\(第[一二三四五六七八九十百千万零\d]+节\)/g,
        priority: 15,
        description: "匹配'(第一节)'、'(第1节)'等圆括号节"
      },
      {
        name: "中文数字章节-带空格",
        pattern: /第[一二三四五六七八九十百千万零]+章\s*[：:]\s*/g,
        priority: 14,
        description: "匹配'第一章：'、'第二章：'等带冒号的中文数字章节"
      },
      {
        name: "中文数字章节",
        pattern: /第[一二三四五六七八九十百千万零]+章/g,
        priority: 13,
        description: "匹配'第一章'、'第二章'等中文数字章节"
      },
      {
        name: "中文数字节-带空格",
        pattern: /第[一二三四五六七八九十百千万零]+节\s*[：:]\s*/g,
        priority: 12,
        description: "匹配'第一节：'、'第二节：'等带冒号的中文数字节"
      },
      {
        name: "中文数字节",
        pattern: /第[一二三四五六七八九十百千万零]+节/g,
        priority: 11,
        description: "匹配'第一节'、'第二节'等中文数字节"
      },
      {
        name: "中文数字卷",
        pattern: /第[一二三四五六七八九十百千万零]+卷/g,
        priority: 10,
        description: "匹配'第一卷'、'第二卷'等中文数字卷"
      },
      {
        name: "阿拉伯数字章节-带空格",
        pattern: /第\d+章\s*[：:]\s*/g,
        priority: 9,
        description: "匹配'第1章：'、'第2章：'等带冒号的阿拉伯数字章节"
      },
      {
        name: "阿拉伯数字章节",
        pattern: /第\d+章/g,
        priority: 8,
        description: "匹配'第1章'、'第2章'等阿拉伯数字章节"
      },
      {
        name: "阿拉伯数字节-带空格",
        pattern: /第\d+节\s*[：:]\s*/g,
        priority: 7,
        description: "匹配'第1节：'、'第2节：'等带冒号的阿拉伯数字节"
      },
      {
        name: "阿拉伯数字节",
        pattern: /第\d+节/g,
        priority: 6,
        description: "匹配'第1节'、'第2节'等阿拉伯数字节"
      },
      {
        name: "阿拉伯数字卷",
        pattern: /第\d+卷/g,
        priority: 5,
        description: "匹配'第1卷'、'第2卷'等阿拉伯数字卷"
      },
      {
        name: "英文Chapter-带空格",
        pattern: /Chapter\s+\d+\s*[：:]\s*/gi,
        priority: 4,
        description: "匹配'Chapter 1:'、'Chapter 2:'等带冒号的英文章节"
      },
      {
        name: "英文Chapter",
        pattern: /Chapter\s+\d+/gi,
        priority: 3,
        description: "匹配'Chapter 1'、'Chapter 2'等英文章节"
      },
      {
        name: "英文Section",
        pattern: /Section\s+\d+/gi,
        priority: 2,
        description: "匹配'Section 1'、'Section 2'等英文节"
      },
      {
        name: "纯数字章节-带点",
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
   * 自动分章主函数
   * @param {string} content - 文本内容
   * @returns {Object} - 分章结果对象
   */
  autoChapterDivision(content) {
    // 1. 提取所有符合规则的章节名和起始位置
    const chapterMatches = this.extractChapterMatches(content);

    // 2. 按位置排序
    const sortedMatches = this.sortChapterMatches(chapterMatches);

    // 3. 分割全文为章节内容
    const chapters = this.splitContentIntoChapters(content, sortedMatches);

    // 4. 检查分章结果是否合理
    const validation = this.validateChapterDivision(chapters);

    return {
      chapters,
      matches: sortedMatches,
      validation,
      totalChapters: chapters.length
    };
  }

  /**
   * 提取所有符合规则的章节名和起始位置
   * @param {string} content - 文本内容
   * @returns {Array} - 章节匹配数组
   */
  extractChapterMatches(content) {
    const matches = [];

    // 使用所有规则进行匹配
    for (const rule of this.chapterRules) {
      let match;
      // 重置正则表达式的lastIndex，确保每次从头开始匹配
      rule.pattern.lastIndex = 0;

      while ((match = rule.pattern.exec(content)) !== null) {
        matches.push({
          title: match[0].trim(),
          position: match.index,
          rule: rule.name,
          priority: rule.priority
        });
      }
    }

    return matches;
  }

  /**
   * 按位置排序章节匹配
   * @param {Array} matches - 章节匹配数组
   * @returns {Array} - 排序后的章节匹配数组
   */
  sortChapterMatches(matches) {
    // 先按位置排序
    const sortedByPosition = [...matches].sort((a, b) => a.position - b.position);

    // 处理重叠的匹配，保留优先级更高的匹配
    const filteredMatches = [];

    for (const match of sortedByPosition) {
      // 检查是否与已有匹配重叠
      const hasOverlap = filteredMatches.some(existing => {
        // 如果两个匹配位置相差小于50个字符，认为可能重叠
        return Math.abs(existing.position - match.position) < 50;
      });

      if (!hasOverlap) {
        filteredMatches.push(match);
      } else {
        // 如果有重叠，检查优先级
        const overlappingIndex = filteredMatches.findIndex(existing =>
          Math.abs(existing.position - match.position) < 50
        );

        if (overlappingIndex !== -1 && match.priority > filteredMatches[overlappingIndex].priority) {
          // 如果新匹配优先级更高，替换旧匹配
          filteredMatches[overlappingIndex] = match;
        }
      }
    }

    // 再次按位置排序
    return filteredMatches.sort((a, b) => a.position - b.position);
  }

  /**
   * 分割全文为章节内容
   * @param {string} content - 文本内容
   * @param {Array} matches - 排序后的章节匹配数组
   * @returns {Array} - 章节数组
   */
  splitContentIntoChapters(content, matches) {
    const chapters = [];

    // 如果没有匹配到任何章节，返回整个内容作为一章
    if (matches.length === 0) {
      chapters.push({
        title: "全文",
        content: content,
        startPosition: 0,
        endPosition: content.length
      });
      return chapters;
    }

    // 处理第一章之前的内容
    if (matches[0].position > 0) {
      chapters.push({
        title: "前言",
        content: content.substring(0, matches[0].position),
        startPosition: 0,
        endPosition: matches[0].position
      });
    }

    // 处理各章节内容
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      // 计算章节内容的结束位置
      const endPosition = nextMatch ? nextMatch.position : content.length;

      // 提取章节内容
      const chapterContent = content.substring(currentMatch.position, endPosition);

      chapters.push({
        title: currentMatch.title,
        content: chapterContent,
        startPosition: currentMatch.position,
        endPosition: endPosition,
        rule: currentMatch.rule
      });
    }

    return chapters;
  }

  /**
   * 验证分章结果是否合理
   * @param {Array} chapters - 章节数组
   * @returns {Object} - 验证结果
   */
  validateChapterDivision(chapters) {
    const totalChapters = chapters.length;
    let isValid = true;
    let warnings = [];

    // 如果章节数少于3，给出警告
    if (totalChapters < 3) {
      isValid = false;
      warnings.push("分章可能不准确，建议手动调整");
    }

    // 检查是否有空章节
    const emptyChapters = chapters.filter(chapter =>
      !chapter.content || chapter.content.trim().length === 0
    );

    if (emptyChapters.length > 0) {
      warnings.push(`发现 ${emptyChapters.length} 个空章节`);
    }

    // 检查是否有异常短的章节（可能是误匹配）
    const shortChapters = chapters.filter(chapter =>
      chapter.content && chapter.content.trim().length < 50
    );

    if (shortChapters.length > 0) {
      warnings.push(`发现 ${shortChapters.length} 个异常短的章节，可能是误匹配`);
    }

    return {
      isValid,
      warnings,
      totalChapters
    };
  }

  /**
   * 执行自动分章
   * @param {string} content - 文本内容
   * @returns {Object} - 分章结果
   */
  performAutoChapterDivision(content) {
    const result = this.autoChapterDivision(content);
    return result;
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

  /**
   * 检测混合章节格式
   */
  detectMixedChapterFormats(content) {
    // 1. 统计所有章节格式的出现频率
    const formatStats = {};
    
    for (const rule of this.chapterRules) {
      const matches = [...content.matchAll(rule.pattern)];
      if (matches.length > 0) {
        formatStats[rule.name] = {
          count: matches.length,
          priority: rule.priority,
          rule: rule
        };
      }
    }
    
    // 2. 按优先级和出现频率排序
    const sortedFormats = Object.values(formatStats).sort((a, b) => {
      // 优先级高的排在前面
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // 优先级相同时，出现次数多的排在前面
      return b.count - a.count;
    });
    
    // 3. 检测是否为混合格式
    if (sortedFormats.length > 1) {
      const topFormat = sortedFormats[0];
      const secondFormat = sortedFormats[1];
      
      // 如果第二多的格式出现次数超过第一格式的30%，认为是混合格式
      if (secondFormat.count / topFormat.count > 0.3) {
        return {
          isMixed: true,
          primaryFormat: topFormat,
          secondaryFormats: sortedFormats.slice(1),
          allFormats: sortedFormats
        };
      }
    }
    
    return {
      isMixed: false,
      primaryFormat: sortedFormats[0] || null,
      secondaryFormats: [],
      allFormats: sortedFormats
    };
  }

  /**
   * 处理混合格式的章节检测
   */
  performMixedFormatChapterDetection(content) {
    const formatAnalysis = this.detectMixedChapterFormats(content);
    
    if (!formatAnalysis.isMixed) {
      // 非混合格式，使用标准检测
      return this.performAutoChapterDivision(content);
    }
    
    // 混合格式处理
    const allMatches = [];
    
    // 收集所有格式的匹配项
    for (const format of formatAnalysis.allFormats) {
      const matches = [...content.matchAll(format.rule.pattern)];
      for (const match of matches) {
        allMatches.push({
          title: match[0].trim(),
          position: match.index,
          rule: format.rule.name,
          priority: format.rule.priority
        });
      }
    }
    
    // 按位置排序
    const sortedMatches = allMatches.sort((a, b) => a.position - b.position);
    
    // 处理重叠匹配
    const filteredMatches = this.filterOverlappingMatches(sortedMatches);
    
    // 分割内容
    const chapters = this.splitContentIntoChapters(content, filteredMatches);
    
    return {
      chapters,
      matches: filteredMatches,
      validation: this.validateChapterDivision(chapters),
      totalChapters: chapters.length,
      isMixedFormat: true,
      formatAnalysis
    };
  }

  /**
   * 添加新的章节规则
   * @param {Object} rule - 章节规则对象
   */
  addChapterRule(rule) {
    // 验证规则对象
    if (!rule.name || !rule.pattern || typeof rule.priority !== 'number') {
      throw new Error('无效的章节规则：必须包含name、pattern和priority属性');
    }

    // 检查规则是否已存在
    const existingRuleIndex = this.chapterRules.findIndex(r => r.name === rule.name);
    if (existingRuleIndex !== -1) {
      // 更新现有规则
      this.chapterRules[existingRuleIndex] = { ...rule };
      console.log(`章节规则"${rule.name}"已更新`);
    } else {
      // 添加新规则
      this.chapterRules.push({ ...rule });
      console.log(`章节规则"${rule.name}"已添加`);
    }

    // 按优先级重新排序
    this.chapterRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 调整规则优先级
   * @param {Array} adjustments - 优先级调整数组
   */
  adjustRulePriorities(adjustments) {
    for (const adjustment of adjustments) {
      const { ruleName, newPriority } = adjustment;
      const rule = this.chapterRules.find(r => r.name === ruleName);
      
      if (rule) {
        rule.priority = newPriority;
        console.log(`规则"${ruleName}"的优先级已调整为${newPriority}`);
      } else {
        console.warn(`未找到名为"${ruleName}"的规则`);
      }
    }

    // 按优先级重新排序
    this.chapterRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 移除章节规则
   * @param {string} ruleName - 规则名称
   * @returns {boolean} - 是否成功移除
   */
  removeChapterRule(ruleName) {
    const index = this.chapterRules.findIndex(r => r.name === ruleName);
    if (index !== -1) {
      this.chapterRules.splice(index, 1);
      console.log(`章节规则"${ruleName}"已移除`);
      return true;
    }
    return false;
  }

  /**
   * 获取所有章节规则
   * @returns {Array} - 章节规则数组
   */
  getChapterRules() {
    return [...this.chapterRules];
  }

  /**
   * 分析分章准确率
   * @param {string} content - 文本内容
   * @param {Array} expectedChapters - 期望的章节数组
   * @returns {Object} - 准确率分析结果
   */
  analyzeChapterAccuracy(content, expectedChapters) {
    const detectedChapters = this.detectChapters(content);
    
    // 计算准确率
    let matchedCount = 0;
    const unmatchedFormats = [];
    const falsePositives = [];
    
    // 检查检测到的章节是否匹配期望
    for (const detected of detectedChapters) {
      const matched = expectedChapters.find(expected => 
        expected.title === detected.title || 
        expected.content.includes(detected.title)
      );
      
      if (matched) {
        matchedCount++;
      } else {
        falsePositives.push(detected);
      }
    }
    
    // 检查期望的章节是否被检测到
    for (const expected of expectedChapters) {
      const matched = detectedChapters.find(detected => 
        detected.title === expected.title || 
        detected.content.includes(expected.title)
      );
      
      if (!matched) {
        // 尝试从未匹配的标题中提取格式
        const formatMatch = expected.title.match(/第[一二三四五六七八九十百千万零\d]+[章卷节篇部回集幕场折]/);
        if (formatMatch) {
          const format = formatMatch[0];
          const existingFormat = unmatchedFormats.find(f => f.pattern === format);
          
          if (existingFormat) {
            existingFormat.count++;
          } else {
            unmatchedFormats.push({
              pattern: format,
              count: 1,
              example: expected.title
            });
          }
        }
      }
    }
    
    const accuracy = expectedChapters.length > 0 ? matchedCount / expectedChapters.length : 0;
    
    return {
      accuracy,
      matchedCount,
      totalCount: expectedChapters.length,
      detectedCount: detectedChapters.length,
      unmatchedFormats,
      falsePositives
    };
  }
}

// 导出模块
window.ChapterDetector = ChapterDetector;
