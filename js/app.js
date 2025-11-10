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
});
