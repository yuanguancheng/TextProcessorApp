/**
 * 应用程序入口文件
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化存储管理器
  const storageManager = new StorageManager();

  // 初始化文件处理器
  const fileHandler = new FileHandler();

  // 初始化文本编辑器
  const textEditor = new TextEditor();

  // 初始化章节检测器
  const chapterDetector = new ChapterDetector();

  // 等待IndexedDB初始化完成
  try {
    await storageManager.initIndexedDB();
    
    // 加载文档列表
    setTimeout(() => {
      textEditor.loadDocumentList();
    }, 100);
    
    console.log('文本处理器应用已初始化');
  } catch (error) {
    console.error('应用初始化失败:', error);
    textEditor.showMessage('应用初始化失败，部分功能可能无法使用', 'error');
  }

  // 添加测试按钮事件监听
  const runTestsButton = document.getElementById('runTestsButton');
  if (runTestsButton) {
    runTestsButton.addEventListener('click', async () => {
      const testResults = document.getElementById('testResults');
      testResults.innerHTML = '<p>正在运行测试...</p>';
      
      const testRunner = new TestRunner();
      await testRunner.runAllTests();
      
      // 显示测试结果
      let html = '<h4>测试结果</h4>';
      
      const passedTests = testRunner.results.filter(r => r.passed).length;
      const totalTests = testRunner.results.length;
      
      html += `<p>通过: ${passedTests}/${totalTests}</p>`;
      
      // 按类型分组显示
      const groupedResults = {};
      for (const result of testRunner.results) {
        if (!groupedResults[result.type]) {
          groupedResults[result.type] = [];
        }
        groupedResults[result.type].push(result);
      }
      
      for (const [type, results] of Object.entries(groupedResults)) {
        html += `<h5>${type.toUpperCase()} 测试</h5><ul>`;
        
        for (const result of results) {
          if (result.passed) {
            html += `<li class="test-pass">✓ ${result.name}</li>`;
          } else {
            html += `<li class="test-fail">✗ ${result.name}: ${result.error || `期望: ${result.expected}, 实际: ${result.actual}`}</li>`;
          }
        }
        
        html += '</ul>';
      }
      
      testResults.innerHTML = html;
    });
  }

  // 添加兼容性测试按钮事件监听
  const runCompatibilityTestsButton = document.getElementById('runCompatibilityTestsButton');
  if (runCompatibilityTestsButton) {
    runCompatibilityTestsButton.addEventListener('click', async () => {
      const compatibilityResults = document.getElementById('compatibilityResults');
      compatibilityResults.innerHTML = '<p>正在运行兼容性测试...</p>';
      
      const compatibilityTest = new CompatibilityTest();
      await compatibilityTest.runAllTests();
      
      // 生成兼容性报告
      const report = compatibilityTest.generateReport();
      
      // 显示测试结果
      let html = '<div class="compatibility-report">';
      
      // 浏览器信息
      html += `<div class="browser-info">
        <h4>浏览器信息</h4>
        <p><strong>浏览器:</strong> ${report.browserInfo.name} ${report.browserInfo.version}</p>
        <p><strong>平台:</strong> ${report.deviceInfo.platform}</p>
        <p><strong>屏幕:</strong> ${report.deviceInfo.screenWidth}x${report.deviceInfo.screenHeight}</p>
        <p><strong>设备类型:</strong> ${report.browserInfo.isMobile ? '移动设备' : '桌面设备'}</p>
        ${report.browserInfo.isWeChat ? '<p><strong>微信浏览器:</strong> 是</p>' : ''}
      </div>`;
      
      // 测试摘要
      const statusClass = report.summary.compatible ? 'compatible' : 'not-compatible';
      html += `<div class="test-summary ${statusClass}">
        <h4>兼容性测试摘要</h4>
        <p><strong>总体通过率:</strong> ${report.summary.passRate}%</p>
        <p><strong>通过测试:</strong> ${report.summary.passed}/${report.summary.total}</p>
        <p><strong>失败测试:</strong> ${report.summary.failed}</p>
        <p><strong>关键功能失败:</strong> ${report.summary.criticalFailed}</p>
        <p><strong>兼容性状态:</strong> ${report.summary.compatible ? '✓ 兼容' : '✗ 不兼容'}</p>
      </div>`;
      
      // 详细测试结果
      html += '<div class="detailed-results">';
      for (const [category, results] of Object.entries(report.groupedResults)) {
        html += `<h5>${category}</h5><ul>`;
        
        for (const result of results) {
          const statusClass = result.passed ? 'test-pass' : 'test-fail';
          const criticalMark = result.critical ? ' (关键)' : '';
          html += `<li class="${statusClass}">${result.passed ? '✓' : '✗'} ${result.name}${criticalMark}`;
          
          if (!result.passed && result.error) {
            html += `<br><small>错误: ${result.error}</small>`;
          }
          
          html += '</li>';
        }
        
        html += '</ul>';
      }
      html += '</div>';
      
      // 兼容性建议
      if (report.recommendations.length > 0) {
        html += '<div class="recommendations"><h4>兼容性建议</h4>';
        
        for (const rec of report.recommendations) {
          const typeClass = rec.type;
          html += `<div class="recommendation ${typeClass}">
            <h5>${rec.title}</h5>
            <p>${rec.description}</p>
          </div>`;
        }
        
        html += '</div>';
      }
      
      html += '</div>';
      
      compatibilityResults.innerHTML = html;
    });
  }

  // 添加优化迭代按钮事件监听
  const runOptimizationButton = document.getElementById('runOptimizationButton');
  if (runOptimizationButton) {
    runOptimizationButton.addEventListener('click', async () => {
      const optimizationResults = document.getElementById('optimizationResults');
      optimizationResults.innerHTML = '<p>正在运行优化分析...</p>';
      
      // 创建优化引擎
      const optimizationEngine = new OptimizationEngine();
      
      // 模拟测试结果（实际应用中应该从真实测试中获取）
      const mockTestResults = {
        chapterAccuracy: {
          accuracy: 0.65, // 65%准确率，低于阈值
          unmatchedFormats: [
            { pattern: '卷一', count: 5 },
            { pattern: '第一篇', count: 3 },
            { pattern: '第一部', count: 2 }
          ],
          falsePositives: [
            { title: '第一章：引言', reason: '误匹配' }
          ]
        },
        performance: {
          largeFileProcessingTime: 4500, // 4.5秒，超过阈值
          fileSize: 15 * 1024 * 1024, // 15MB
          memoryUsage: 120, // 120MB，超过阈值
          domUpdateFrequency: 15 // 15次/秒，超过阈值
        },
        userFeedback: {
          score: 3.5, // 满分5分
          complaints: [
            { type: 'chapterDetection', description: '分章不准确' },
            { type: 'performance', description: '大文件处理慢' }
          ]
        }
      };
      
      // 分析测试结果并生成优化建议
      const optimizations = optimizationEngine.analyzeTestResults(mockTestResults);
      
      // 显示优化建议
      let html = '<div class="optimization-report">';
      
      // 优化摘要
      const totalOptimizations = 
        (optimizations.chapterRules ? optimizations.chapterRules.length : 0) +
        (optimizations.performance ? optimizations.performance.length : 0) +
        (optimizations.userExperience ? optimizations.userExperience.length : 0);
      
      html += `<div class="optimization-summary">
        <h4>优化建议摘要</h4>
        <p><strong>发现优化点:</strong> ${totalOptimizations}个</p>
        <p><strong>分章准确率:</strong> ${Math.round(mockTestResults.chapterAccuracy.accuracy * 100)}%</p>
        <p><strong>大文件处理时间:</strong> ${mockTestResults.performance.largeFileProcessingTime}ms</p>
        <p><strong>内存使用:</strong> ${mockTestResults.performance.memoryUsage}MB</p>
        <p><strong>DOM更新频率:</strong> ${mockTestResults.performance.domUpdateFrequency}次/秒</p>
      </div>`;
      
      // 分章规则优化
      if (optimizations.chapterRules && optimizations.chapterRules.length > 0) {
        html += '<div class="optimization-category"><h4>分章规则优化</h4>';
        
        for (const opt of optimizations.chapterRules) {
          html += `<div class="optimization-item">
            <h5>${opt.description}</h5>
            <ul>`;
          
          for (const action of opt.actions) {
            if (action.action === 'addRule') {
              html += `<li>添加新规则: ${action.rule.name} - ${action.rule.description}</li>`;
            } else if (action.action === 'adjustPriorities') {
              html += `<li>调整规则优先级: ${action.reason}</li>`;
            }
          }
          
          html += '</ul></div>';
        }
        
        html += '</div>';
      }
      
      // 性能优化
      if (optimizations.performance && optimizations.performance.length > 0) {
        html += '<div class="optimization-category"><h4>性能优化</h4>';
        
        for (const opt of optimizations.performance) {
          html += `<div class="optimization-item">
            <h5>${opt.description}</h5>
            <ul>`;
          
          for (const action of opt.actions) {
            if (action.action === 'optimizeChunkSize') {
              html += `<li>优化分片大小: ${action.reason}</li>`;
              html += `<li>建议分片大小: ${action.suggestedChunkSize}字节</li>`;
            } else if (action.action === 'batchDomUpdates') {
              html += `<li>批量DOM更新: ${action.reason}</li>`;
              if (action.suggestions) {
                html += '<ul>';
                for (const suggestion of action.suggestions) {
                  html += `<li>${suggestion}</li>`;
                }
                html += '</ul>';
              }
            }
          }
          
          html += '</ul></div>';
        }
        
        html += '</div>';
      }
      
      // 用户体验优化
      if (optimizations.userExperience && optimizations.userExperience.length > 0) {
        html += '<div class="optimization-category"><h4>用户体验优化</h4>';
        
        for (const opt of optimizations.userExperience) {
          html += `<div class="optimization-item">
            <h5>${opt.description}</h5>
            <ul>`;
          
          for (const action of opt.actions) {
            html += `<li>${action.reason}</li>`;
          }
          
          html += '</ul></div>';
        }
        
        html += '</div>';
      }
      
      // 应用优化按钮
      html += `<div class="optimization-actions">
        <button id="applyOptimizationsButton" class="control-button">应用优化</button>
        <button id="resetOptimizationsButton" class="control-button">重置优化</button>
      </div>`;
      
      html += '</div>';
      
      optimizationResults.innerHTML = html;
      
      // 添加应用优化按钮事件监听
      const applyOptimizationsButton = document.getElementById('applyOptimizationsButton');
      if (applyOptimizationsButton) {
        applyOptimizationsButton.addEventListener('click', () => {
          // 应用优化到相应模块
          const chapterDetector = new ChapterDetector();
          const fileHandler = new FileHandler();
          
          const results = optimizationEngine.applyOptimizations(optimizations, {
            addChapterRule: (rule) => chapterDetector.addChapterRule(rule),
            adjustRulePriorities: (adjustments) => chapterDetector.adjustRulePriorities(adjustments),
            setChunkSize: (size) => fileHandler.setChunkSize(size),
            enableBatchDomUpdates: () => fileHandler.enableBatchDomUpdates()
          });
          
          // 显示应用结果
          let resultHtml = '<div class="optimization-results">';
          resultHtml += `<h4>优化应用结果</h4>`;
          resultHtml += `<p><strong>总计:</strong> ${results.summary.total}个优化</p>`;
          resultHtml += `<p><strong>成功:</strong> ${results.summary.successful}个</p>`;
          resultHtml += `<p><strong>失败:</strong> ${results.summary.failed}个</p>`;
          
          if (results.applied.length > 0) {
            resultHtml += '<h5>已应用的优化:</h5><ul>';
            for (const applied of results.applied) {
              resultHtml += `<li>${applied.description}</li>`;
            }
            resultHtml += '</ul>';
          }
          
          if (results.failed.length > 0) {
            resultHtml += '<h5>失败的优化:</h5><ul>';
            for (const failed of results.failed) {
              resultHtml += `<li>${failed.reason}</li>`;
            }
            resultHtml += '</ul>';
          }
          
          resultHtml += '</div>';
          
          // 在优化结果区域显示应用结果
          const resultDiv = document.createElement('div');
          resultDiv.innerHTML = resultHtml;
          optimizationResults.appendChild(resultDiv);
        });
      }
      
      // 添加重置优化按钮事件监听
      const resetOptimizationsButton = document.getElementById('resetOptimizationsButton');
      if (resetOptimizationsButton) {
        resetOptimizationsButton.addEventListener('click', () => {
          optimizationEngine.reset();
          optimizationResults.innerHTML = '<p>优化引擎已重置</p>';
        });
      }
    });
  }
});
