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
});
