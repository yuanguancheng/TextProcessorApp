/**
 * 优化迭代引擎
 * 根据测试结果自动调整分章规则和大文件处理逻辑
 */
class OptimizationEngine {
  constructor() {
    this.performanceMetrics = {
      chapterDetectionAccuracy: 0,
      largeFileProcessingTime: 0,
      domUpdateFrequency: 0,
      userFeedbackScore: 0
    };
    
    this.optimizationHistory = [];
    this.customRules = [];
    this.optimizationThresholds = {
      lowAccuracyThreshold: 0.7,      // 分章准确率低于70%时触发优化
      slowProcessingThreshold: 3000,  // 处理时间超过3秒时触发优化
      highDomUpdateThreshold: 10       // DOM更新频率超过10次/秒时触发优化
    };
  }

  /**
   * 分析测试结果并确定优化方向
   * @param {Object} testResults - 测试结果对象
   * @returns {Object} - 优化建议
   */
  analyzeTestResults(testResults) {
    const optimizations = {
      chapterRules: [],
      performance: [],
      userExperience: []
    };

    // 分析分章准确率
    if (testResults.chapterAccuracy) {
      const accuracy = testResults.chapterAccuracy.accuracy;
      this.performanceMetrics.chapterDetectionAccuracy = accuracy;
      
      if (accuracy < this.optimizationThresholds.lowAccuracyThreshold) {
        optimizations.chapterRules.push(this.generateChapterRuleOptimizations(testResults.chapterAccuracy));
      }
    }

    // 分析大文件处理性能
    if (testResults.performance) {
      const processingTime = testResults.performance.largeFileProcessingTime;
      this.performanceMetrics.largeFileProcessingTime = processingTime;
      
      if (processingTime > this.optimizationThresholds.slowProcessingThreshold) {
        optimizations.performance.push(this.generatePerformanceOptimizations(testResults.performance));
      }
    }

    // 分析DOM更新频率
    if (testResults.performance && testResults.performance.domUpdateFrequency) {
      const domFrequency = testResults.performance.domUpdateFrequency;
      this.performanceMetrics.domUpdateFrequency = domFrequency;
      
      if (domFrequency > this.optimizationThresholds.highDomUpdateThreshold) {
        optimizations.performance.push(this.generateDomOptimizations(testResults.performance));
      }
    }

    // 分析用户反馈
    if (testResults.userFeedback) {
      this.performanceMetrics.userFeedbackScore = testResults.userFeedback.score;
      optimizations.userExperience = this.generateUserExperienceOptimizations(testResults.userFeedback);
    }

    return optimizations;
  }

  /**
   * 生成分章规则优化建议
   * @param {Object} chapterAccuracy - 分章准确率数据
   * @returns {Object} - 分章规则优化建议
   */
  generateChapterRuleOptimizations(chapterAccuracy) {
    const optimization = {
      type: 'chapterRules',
      priority: 'high',
      description: '分章准确率较低，建议补充规则库',
      actions: []
    };

    // 分析未匹配的章节格式
    const unmatchedFormats = chapterAccuracy.unmatchedFormats || [];
    for (const format of unmatchedFormats) {
      if (format.count > 1) { // 只考虑出现多次的格式
        const suggestedRule = this.createRuleFromFormat(format.pattern);
        if (suggestedRule) {
          optimization.actions.push({
            action: 'addRule',
            rule: suggestedRule,
            reason: `检测到未识别的章节格式"${format.pattern}"出现${format.count}次`
          });
        }
      }
    }

    // 分析误匹配的章节
    const falsePositives = chapterAccuracy.falsePositives || [];
    if (falsePositives.length > 0) {
      optimization.actions.push({
        action: 'adjustPriorities',
        reason: '检测到误匹配的章节，建议调整规则优先级',
        details: falsePositives
      });
    }

    return optimization;
  }

  /**
   * 根据格式模式创建新规则
   * @param {string} pattern - 格式模式
   * @returns {Object|null} - 新规则对象或null
   */
  createRuleFromFormat(pattern) {
    // 常见的章节格式模式
    const commonPatterns = [
      {
        pattern: /卷[一二三四五六七八九十百千万零\d]+/g,
        name: "卷格式-无第字",
        priority: 9,
        description: "匹配'卷一'、'卷2'等卷格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+篇/g,
        name: "篇格式",
        priority: 8,
        description: "匹配'第一篇'、'第2篇'等篇格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+部/g,
        name: "部格式",
        priority: 7,
        description: "匹配'第一部'、'第2部'等部格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+回/g,
        name: "回格式",
        priority: 6,
        description: "匹配'第一回'、'第2回'等回格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+集/g,
        name: "集格式",
        priority: 5,
        description: "匹配'第一集'、'第2集'等集格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+幕/g,
        name: "幕格式",
        priority: 4,
        description: "匹配'第一幕'、'第2幕'等幕格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+场/g,
        name: "场格式",
        priority: 3,
        description: "匹配'第一场'、'第2场'等场格式"
      },
      {
        pattern: /第[一二三四五六七八九十百千万零\d]+折/g,
        name: "折格式",
        priority: 2,
        description: "匹配'第一折'、'第2折'等折格式"
      }
    ];

    // 尝试匹配常见模式
    for (const commonPattern of commonPatterns) {
      if (commonPattern.pattern.test(pattern)) {
        return {
          name: commonPattern.name,
          pattern: commonPattern.pattern,
          priority: commonPattern.priority,
          description: commonPattern.description,
          isCustom: true
        };
      }
    }

    // 如果没有匹配到常见模式，尝试生成通用规则
    const genericMatch = pattern.match(/第([一二三四五六七八九十百千万零\d]+)([章卷节篇部回集幕场折])/);
    if (genericMatch) {
      const number = genericMatch[1];
      const type = genericMatch[2];
      
      return {
        name: `自定义${type}格式`,
        pattern: new RegExp(`第[一二三四五六七八九十百千万零\\d]+${type}`, 'g'),
        priority: 5,
        description: `匹配'第${number}${type}'等${type}格式`,
        isCustom: true
      };
    }

    return null;
  }

  /**
   * 生成性能优化建议
   * @param {Object} performance - 性能数据
   * @returns {Object} - 性能优化建议
   */
  generatePerformanceOptimizations(performance) {
    const optimization = {
      type: 'performance',
      priority: 'high',
      description: '大文件处理性能较慢，建议优化处理逻辑',
      actions: []
    };

    // 分析处理时间
    const processingTime = performance.largeFileProcessingTime;
    if (processingTime > this.optimizationThresholds.slowProcessingThreshold) {
      optimization.actions.push({
        action: 'optimizeChunkSize',
        reason: `处理时间${processingTime}ms超过阈值，建议调整分片大小`,
        suggestedChunkSize: this.calculateOptimalChunkSize(processingTime, performance.fileSize)
      });
    }

    // 分析内存使用
    if (performance.memoryUsage && performance.memoryUsage > 100) { // 假设100MB为阈值
      optimization.actions.push({
        action: 'reduceMemoryUsage',
        reason: `内存使用${performance.memoryUsage}MB较高，建议优化内存管理`,
        suggestions: [
          '减少DOM操作频率',
          '使用虚拟滚动',
          '及时释放不需要的对象引用'
        ]
      });
    }

    return optimization;
  }

  /**
   * 生成DOM优化建议
   * @param {Object} performance - 性能数据
   * @returns {Object} - DOM优化建议
   */
  generateDomOptimizations(performance) {
    const optimization = {
      type: 'dom',
      priority: 'medium',
      description: 'DOM更新频率过高，建议减少DOM操作',
      actions: []
    };

    const domFrequency = performance.domUpdateFrequency;
    if (domFrequency > this.optimizationThresholds.highDomUpdateThreshold) {
      optimization.actions.push({
        action: 'batchDomUpdates',
        reason: `DOM更新频率${domFrequency}次/秒过高，建议批量更新`,
        suggestions: [
          '使用requestAnimationFrame批量更新',
          '减少不必要的重排和重绘',
          '使用DocumentFragment批量插入DOM'
        ]
      });
    }

    return optimization;
  }

  /**
   * 生成用户体验优化建议
   * @param {Object} userFeedback - 用户反馈数据
   * @returns {Object} - 用户体验优化建议
   */
  generateUserExperienceOptimizations(userFeedback) {
    const optimization = {
      type: 'userExperience',
      priority: 'medium',
      description: '根据用户反馈优化用户体验',
      actions: []
    };

    // 分析用户反馈
    if (userFeedback.complaints) {
      for (const complaint of userFeedback.complaints) {
        if (complaint.type === 'chapterDetection') {
          optimization.actions.push({
            action: 'improveChapterDetection',
            reason: complaint.description,
            details: complaint.details
          });
        } else if (complaint.type === 'performance') {
          optimization.actions.push({
            action: 'improvePerformance',
            reason: complaint.description,
            details: complaint.details
          });
        }
      }
    }

    return optimization;
  }

  /**
   * 计算最优分片大小
   * @param {number} processingTime - 当前处理时间(ms)
   * @param {number} fileSize - 文件大小(bytes)
   * @returns {number} - 建议的分片大小(bytes)
   */
  calculateOptimalChunkSize(processingTime, fileSize) {
    // 基于处理时间和文件大小计算最优分片大小
    // 目标是使处理时间在1-2秒之间
    
    const targetTime = 1500; // 目标处理时间1.5秒
    const currentChunkSize = fileSize / Math.ceil(processingTime / 100); // 假设当前每100ms处理一个分片
    
    // 计算建议的分片大小
    const suggestedChunkSize = Math.round(currentChunkSize * (targetTime / processingTime));
    
    // 限制分片大小在合理范围内
    const minChunkSize = 50 * 1024; // 50KB
    const maxChunkSize = 2 * 1024 * 1024; // 2MB
    
    return Math.max(minChunkSize, Math.min(maxChunkSize, suggestedChunkSize));
  }

  /**
   * 应用优化建议
   * @param {Object} optimizations - 优化建议对象
   * @param {Object} targetModule - 目标模块对象
   * @returns {Object} - 优化结果
   */
  applyOptimizations(optimizations, targetModule) {
    const results = {
      applied: [],
      failed: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };

    // 应用分章规则优化
    if (optimizations.chapterRules && optimizations.chapterRules.length > 0) {
      for (const opt of optimizations.chapterRules) {
        for (const action of opt.actions) {
          results.summary.total++;
          
          try {
            if (action.action === 'addRule' && targetModule.addChapterRule) {
              targetModule.addChapterRule(action.rule);
              results.applied.push({
                type: 'chapterRule',
                action: action.action,
                description: action.reason
              });
              results.summary.successful++;
            } else if (action.action === 'adjustPriorities' && targetModule.adjustRulePriorities) {
              targetModule.adjustRulePriorities(action.details);
              results.applied.push({
                type: 'chapterRule',
                action: action.action,
                description: action.reason
              });
              results.summary.successful++;
            } else {
              results.failed.push({
                type: 'chapterRule',
                action: action.action,
                reason: '目标模块不支持此操作'
              });
              results.summary.failed++;
            }
          } catch (error) {
            results.failed.push({
              type: 'chapterRule',
              action: action.action,
              reason: error.message
            });
            results.summary.failed++;
          }
        }
      }
    }

    // 应用性能优化
    if (optimizations.performance && optimizations.performance.length > 0) {
      for (const opt of optimizations.performance) {
        for (const action of opt.actions) {
          results.summary.total++;
          
          try {
            if (action.action === 'optimizeChunkSize' && targetModule.setChunkSize) {
              targetModule.setChunkSize(action.suggestedChunkSize);
              results.applied.push({
                type: 'performance',
                action: action.action,
                description: action.reason
              });
              results.summary.successful++;
            } else if (action.action === 'batchDomUpdates' && targetModule.enableBatchDomUpdates) {
              targetModule.enableBatchDomUpdates();
              results.applied.push({
                type: 'performance',
                action: action.action,
                description: action.reason
              });
              results.summary.successful++;
            } else {
              results.failed.push({
                type: 'performance',
                action: action.action,
                reason: '目标模块不支持此操作'
              });
              results.summary.failed++;
            }
          } catch (error) {
            results.failed.push({
              type: 'performance',
              action: action.action,
              reason: error.message
            });
            results.summary.failed++;
          }
        }
      }
    }

    // 记录优化历史
    this.optimizationHistory.push({
      timestamp: new Date().toISOString(),
      optimizations,
      results
    });

    return results;
  }

  /**
   * 获取优化历史
   * @returns {Array} - 优化历史数组
   */
  getOptimizationHistory() {
    return this.optimizationHistory;
  }

  /**
   * 重置优化引擎
   */
  reset() {
    this.performanceMetrics = {
      chapterDetectionAccuracy: 0,
      largeFileProcessingTime: 0,
      domUpdateFrequency: 0,
      userFeedbackScore: 0
    };
    
    this.optimizationHistory = [];
    this.customRules = [];
  }
}

// 导出模块
window.OptimizationEngine = OptimizationEngine;