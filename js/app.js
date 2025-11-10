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
});
