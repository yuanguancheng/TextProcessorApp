/**
 * 浏览器兼容性测试模块
 * 用于检测应用在不同浏览器和设备上的兼容性
 */
class CompatibilityTest {
  constructor() {
    this.testResults = [];
    this.browserInfo = this.getBrowserInfo();
    this.deviceInfo = this.getDeviceInfo();
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    // 检测浏览器类型和版本
    if (ua.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)[1];
    } else if (ua.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)[1];
    } else if (ua.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)[1];
    } else if (ua.indexOf('Edge') > -1) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edge\/(\d+)/)[1];
    } else if (ua.indexOf('MSIE') > -1) {
      browserName = 'Internet Explorer';
      browserVersion = ua.match(/MSIE (\d+)/)[1];
    }

    // 检测微信浏览器
    const isWeChat = /MicroMessenger/i.test(ua);
    if (isWeChat) {
      browserName = 'WeChat';
      browserVersion = ua.match(/MicroMessenger\/(\d+\.\d+\.\d+)/)[1];
    }

    return {
      name: browserName,
      version: browserVersion,
      isWeChat: isWeChat,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      userAgent: ua
    };
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return {
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      language: navigator.language
    };
  }

  /**
   * 运行所有兼容性测试
   */
  async runAllTests() {
    this.testResults = [];
    
    // 基础API测试
    await this.testBasicAPIs();
    
    // 文件处理测试
    await this.testFileHandling();
    
    // 存储功能测试
    await this.testStorageFeatures();
    
    // UI交互测试
    await this.testUIInteractions();
    
    // 性能测试
    await this.testPerformance();
    
    // 移动端特定测试
    if (this.browserInfo.isMobile) {
      await this.testMobileSpecificFeatures();
    }
    
    return this.testResults;
  }

  /**
   * 测试基础API兼容性
   */
  async testBasicAPIs() {
    const tests = [
      {
        name: 'File API支持',
        test: () => typeof File !== 'undefined' && typeof FileReader !== 'undefined',
        critical: true
      },
      {
        name: 'Blob API支持',
        test: () => typeof Blob !== 'undefined',
        critical: true
      },
      {
        name: 'URL.createObjectURL支持',
        test: () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
        critical: true
      },
      {
        name: 'TextDecoder支持',
        test: () => typeof TextDecoder !== 'undefined',
        critical: false
      },
      {
        name: 'Promise支持',
        test: () => typeof Promise !== 'undefined',
        critical: true
      },
      {
        name: 'Fetch API支持',
        test: () => typeof fetch === 'function',
        critical: false
      },
      {
        name: 'IndexedDB支持',
        test: () => typeof indexedDB !== 'undefined',
        critical: true
      },
      {
        name: 'LocalStorage支持',
        test: () => typeof localStorage !== 'undefined',
        critical: true
      },
      {
        name: 'SessionStorage支持',
        test: () => typeof sessionStorage !== 'undefined',
        critical: false
      },
      {
        name: 'CSS Grid支持',
        test: () => CSS.supports('display', 'grid'),
        critical: false
      },
      {
        name: 'CSS Flexbox支持',
        test: () => CSS.supports('display', 'flex'),
        critical: true
      },
      {
        name: 'CSS变量支持',
        test: () => CSS.supports('color', 'var(--test)'),
        critical: false
      }
    ];

    for (const test of tests) {
      try {
        const result = test.test();
        this.addTestResult('基础API', test.name, result, test.critical);
      } catch (error) {
        this.addTestResult('基础API', test.name, false, test.critical, error.message);
      }
    }
  }

  /**
   * 测试文件处理功能
   */
  async testFileHandling() {
    const tests = [
      {
        name: '文件读取',
        test: async () => {
          const testContent = '测试内容';
          const blob = new Blob([testContent], { type: 'text/plain' });
          const file = new File([blob], 'test.txt', { type: 'text/plain' });
          
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result === testContent);
            reader.onerror = () => resolve(false);
            reader.readAsText(file);
          });
        },
        critical: true
      },
      {
        name: '文件下载',
        test: () => {
          try {
            const testContent = '测试内容';
            const blob = new Blob([testContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'test.txt';
            // 不实际触发下载，只测试创建过程
            URL.revokeObjectURL(url);
            return true;
          } catch (error) {
            return false;
          }
        },
        critical: true
      },
      {
        name: '文件拖放',
        test: () => {
          return 'draggable' in document.createElement('div') && 
                 'ondragstart' in document.createElement('div') &&
                 'ondrop' in document.createElement('div');
        },
        critical: false
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult('文件处理', test.name, result, test.critical);
      } catch (error) {
        this.addTestResult('文件处理', test.name, false, test.critical, error.message);
      }
    }
  }

  /**
   * 测试存储功能
   */
  async testStorageFeatures() {
    const tests = [
      {
        name: 'LocalStorage写入/读取',
        test: () => {
          try {
            const testKey = 'compatibility_test_' + Date.now();
            const testValue = 'test_value';
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return retrieved === testValue;
          } catch (error) {
            return false;
          }
        },
        critical: true
      },
      {
        name: 'IndexedDB创建',
        test: async () => {
          return new Promise((resolve) => {
            try {
              const request = indexedDB.open('test_db', 1);
              request.onerror = () => resolve(false);
              request.onsuccess = () => {
                request.result.close();
                indexedDB.deleteDatabase('test_db');
                resolve(true);
              };
            } catch (error) {
              resolve(false);
            }
          });
        },
        critical: true
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult('存储功能', test.name, result, test.critical);
      } catch (error) {
        this.addTestResult('存储功能', test.name, false, test.critical, error.message);
      }
    }
  }

  /**
   * 测试UI交互
   */
  async testUIInteractions() {
    const tests = [
      {
        name: '模态对话框支持',
        test: () => {
          try {
            const dialog = document.createElement('dialog');
            return typeof dialog.showModal === 'function' || 
                   (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype);
          } catch (error) {
            // 即使原生dialog不支持，也可以通过CSS和JS实现
            return true;
          }
        },
        critical: false
      },
      {
        name: '滚动事件支持',
        test: () => {
          return 'onscroll' in window;
        },
        critical: true
      },
      {
        name: '触摸事件支持',
        test: () => {
          return 'ontouchstart' in window;
        },
        critical: this.browserInfo.isMobile
      },
      {
        name: 'CSS过渡动画',
        test: () => {
          return CSS.supports('transition', 'all 0.3s');
        },
        critical: false
      }
    ];

    for (const test of tests) {
      try {
        const result = test.test();
        this.addTestResult('UI交互', test.name, result, test.critical);
      } catch (error) {
        this.addTestResult('UI交互', test.name, false, test.critical, error.message);
      }
    }
  }

  /**
   * 测试性能
   */
  async testPerformance() {
    const tests = [
      {
        name: '性能API支持',
        test: () => {
          return 'performance' in window && 'now' in performance;
        },
        critical: false
      },
      {
        name: 'requestAnimationFrame支持',
        test: () => {
          return 'requestAnimationFrame' in window;
        },
        critical: false
      },
      {
        name: '大文本处理性能',
        test: async () => {
          const startTime = performance.now();
          const largeText = '测试文本'.repeat(10000); // 约50KB文本
          
          // 模拟文本处理
          const processed = largeText.replace(/\n/g, ' ').split(' ').filter(word => word.length > 0);
          
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          
          // 如果处理时间超过1秒，认为性能不佳
          return processingTime < 1000;
        },
        critical: false
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.addTestResult('性能', test.name, result, test.critical);
      } catch (error) {
        this.addTestResult('性能', test.name, false, test.critical, error.message);
      }
    }
  }

  /**
   * 测试移动端特定功能
   */
  async testMobileSpecificFeatures() {
    const tests = [
      {
        name: '视口元标签支持',
        test: () => {
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          return viewportMeta && viewportMeta.content.includes('width=device-width');
        },
        critical: true
      },
      {
        name: '触摸手势支持',
        test: () => {
          return 'ontouchstart' in window && 'ontouchend' in window;
        },
        critical: true
      },
      {
        name: '移动端菜单适配',
        test: () => {
          const menuButton = document.querySelector('.mobile-menu-button');
          return menuButton && window.getComputedStyle(menuButton).display !== 'none';
        },
        critical: true
      },
      {
        name: '响应式布局',
        test: () => {
          const editorContainer = document.querySelector('.editor-container');
          if (!editorContainer) return false;
          
          const containerStyle = window.getComputedStyle(editorContainer);
          return containerStyle.display === 'flex' || containerStyle.display === 'block';
        },
        critical: true
      }
    ];

    for (const test of tests) {
      try {
        const result = test.test();
        this.addTestResult('移动端', test.name, result, test.critical);
      } catch (error) {
        this.addTestResult('移动端', test.name, false, test.critical, error.message);
      }
    }
  }

  /**
   * 添加测试结果
   */
  addTestResult(category, name, passed, critical, error = null) {
    this.testResults.push({
      category,
      name,
      passed,
      critical,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成兼容性报告
   */
  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const criticalFailed = this.testResults.filter(r => !r.passed && r.critical).length;
    
    // 按类别分组
    const groupedResults = {};
    for (const result of this.testResults) {
      if (!groupedResults[result.category]) {
        groupedResults[result.category] = [];
      }
      groupedResults[result.category].push(result);
    }
    
    return {
      browserInfo: this.browserInfo,
      deviceInfo: this.deviceInfo,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        criticalFailed,
        passRate: Math.round((passedTests / totalTests) * 100),
        compatible: criticalFailed === 0
      },
      groupedResults,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 生成兼容性建议
   */
  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);
    
    // 基于失败的测试生成建议
    for (const test of failedTests) {
      switch (test.name) {
        case 'TextDecoder支持':
          recommendations.push({
            type: 'warning',
            title: '编码检测可能受限',
            description: '当前浏览器不支持TextDecoder API，可能影响非UTF-8编码文件的正确识别。建议使用现代浏览器以获得最佳体验。'
          });
          break;
          
        case 'IndexedDB支持':
          recommendations.push({
            type: 'error',
            title: '本地存储功能不可用',
            description: '当前浏览器不支持IndexedDB，文档保存和自动保存功能将无法使用。请升级浏览器或使用Chrome、Firefox、Edge等现代浏览器。'
          });
          break;
          
        case 'CSS Grid支持':
          recommendations.push({
            type: 'warning',
            title: '布局可能显示异常',
            description: '当前浏览器不支持CSS Grid，可能导致布局显示不正常。建议使用支持CSS Grid的现代浏览器。'
          });
          break;
          
        case '触摸事件支持':
          recommendations.push({
            type: 'warning',
            title: '移动端交互受限',
            description: '当前设备不支持触摸事件，移动端交互体验可能不佳。'
          });
          break;
          
        case '视口元标签支持':
          recommendations.push({
            type: 'error',
            title: '移动端适配问题',
            description: '页面缺少正确的视口设置，可能导致在移动设备上显示异常。'
          });
          break;
      }
    }
    
    // 基于浏览器信息生成建议
    if (this.browserInfo.name === 'Internet Explorer') {
      recommendations.push({
        type: 'error',
        title: '浏览器兼容性差',
        description: 'Internet Explorer对现代Web标准支持有限，建议使用Chrome、Firefox、Edge或Safari等现代浏览器。'
      });
    }
    
    if (this.browserInfo.isMobile && this.deviceInfo.screenWidth < 768) {
      recommendations.push({
        type: 'info',
        title: '移动端使用提示',
        description: '在小屏幕设备上使用时，建议横屏放置设备以获得更好的编辑体验。'
      });
    }
    
    return recommendations;
  }
}

// 导出模块
window.CompatibilityTest = CompatibilityTest;