/**
 * 文件处理器模块
 * 负责处理文件上传、验证和读取
 */
class FileHandler {
  constructor() {
    this.uploadArea = document.getElementById('uploadArea');
    this.fileInput = document.getElementById('fileInput');
    this.uploadButton = document.getElementById('uploadButton');
    this.errorMessage = document.getElementById('errorMessage');
    this.fileInfo = document.getElementById('fileInfo');
    this.fileName = document.getElementById('fileName');
    this.fileSize = document.getElementById('fileSize');
    this.fileType = document.getElementById('fileType');
    this.processButton = document.getElementById('processButton');
    this.uploadSection = document.getElementById('uploadSection');
    this.editorSection = document.getElementById('editorSection');
    this.textEditor = document.getElementById('textEditor');
    this.previewText = document.getElementById('previewText');
    this.encodingInfo = document.getElementById('encodingInfo');
    this.lineInfo = document.getElementById('lineInfo');
    this.wordCount = document.getElementById('wordCount');

    // 添加进度条元素
    this.progressContainer = document.getElementById('progressContainer');
    this.progressBar = document.getElementById('progressBar');
    this.progressText = document.getElementById('progressText');

    // 文件读取相关属性
    this.currentFile = null;
    this.fileReader = null;
    this.chunkSize = 1024 * 1024; // 1MB 分片大小
    this.currentChunk = 0;
    this.totalChunks = 0;
    this.fileContent = '';

    // 支持的编码列表
    this.encodings = ['utf-8', 'gbk', 'gb2312', 'big5', 'utf-16le', 'utf-16be'];
    this.currentEncoding = 'utf-8';

    this.initEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    // 点击上传区域触发文件选择
    this.uploadArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    // 点击上传按钮触发文件选择
    this.uploadButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    // 文件选择变化处理
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });

    // 拖拽事件处理
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('dragover');
    });

    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('dragover');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('dragover');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });

    // 处理文件按钮点击事件
    this.processButton.addEventListener('click', () => {
      this.processFile();
    });
  }

  /**
   * 处理文件
   * @param {File} file - 文件对象
   */
  handleFile(file) {
    // 验证文件类型
    if (!this.validateFileType(file)) {
      this.showError('仅支持 .txt 文件！');
      return;
    }

    // 显示文件信息
    this.displayFileInfo(file);
    this.hideError();
  }

  /**
   * 验证文件类型
   * @param {File} file - 文件对象
   * @returns {boolean} - 是否为有效的文件类型
   */
  validateFileType(file) {
    // 检查文件扩展名
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.txt')) {
      return false;
    }

    // 检查MIME类型
    if (file.type !== 'text/plain') {
      return false;
    }

    return true;
  }

  /**
   * 显示错误信息
   * @param {string} message - 错误信息
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.style.display = 'block';
    this.fileInfo.setAttribute('hidden', '');
    this.hideProgress();
  }

  /**
   * 隐藏错误信息
   */
  hideError() {
    this.errorMessage.style.display = 'none';
  }

  /**
   * 显示文件信息
   * @param {File} file - 文件对象
   */
  displayFileInfo(file) {
    this.fileName.textContent = file.name;
    this.fileSize.textContent = this.formatFileSize(file.size);
    this.fileType.textContent = file.type || '未知';
    this.fileInfo.removeAttribute('hidden');

    // 保存文件引用以便后续处理
    this.currentFile = file;
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} - 格式化后的文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 处理文件内容
   */
  processFile() {
    if (!this.currentFile) {
      this.showError('没有选择文件！');
      return;
    }

    // 边界测试：检查空文档
    if (this.currentFile.size === 0) {
      this.showError('文件为空，无法处理！');
      return;
    }

    // 边界测试：检查超大文件（超过50MB）
    if (this.currentFile.size > 50 * 1024 * 1024) {
      this.showError('文件过大（超过50MB），可能影响性能！');
      return;
    }

    // 重置文件内容
    this.fileContent = '';
    this.currentChunk = 0;

    // 根据文件大小选择读取方式
    if (this.currentFile.size < 5 * 1024 * 1024) { // 小于5MB使用文本模式
      this.readFileAsText();
    } else { // 大文件使用分片模式
      this.readFileInChunks();
    }
  }

  /**
   * 文本模式读取文件
   */
  readFileAsText() {
    this.showProgress('正在读取文件...');

    this.fileReader = new FileReader();

    this.fileReader.onload = (e) => {
      const content = e.target.result;
      this.displayFileContent(content);
      this.hideProgress();
    };

    this.fileReader.onerror = () => {
      this.showError('读取文件时出错！');
      this.hideProgress();
    };

    this.fileReader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentLoaded = Math.round((e.loaded / e.total) * 100);
        this.updateProgress(percentLoaded);
      }
    };

    this.fileReader.readAsText(this.currentFile, this.currentEncoding);
  }

  /**
   * 分片模式读取文件
   */
  readFileInChunks() {
    this.totalChunks = Math.ceil(this.currentFile.size / this.chunkSize);
    this.showProgress(`正在读取文件 (分片 ${this.currentChunk + 1}/${this.totalChunks})...`);

    this.readNextChunk();
  }

  /**
   * 读取下一个分片
   */
  readNextChunk() {
    if (this.currentChunk >= this.totalChunks) {
      // 所有分片读取完成
      this.displayFileContent(this.fileContent);
      this.hideProgress();
      return;
    }

    const start = this.currentChunk * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.currentFile.size);
    const blob = this.currentFile.slice(start, end);

    this.fileReader = new FileReader();

    this.fileReader.onload = (e) => {
      const arrayBuffer = e.target.result;

      try {
        // 尝试使用当前编码解码
        const decoder = new TextDecoder(this.currentEncoding);
        const chunk = decoder.decode(arrayBuffer);
        this.fileContent += chunk;

        this.currentChunk++;
        const progress = Math.round((this.currentChunk / this.totalChunks) * 100);
        this.updateProgress(progress, `正在读取文件 (分片 ${this.currentChunk}/${this.totalChunks})...`);

        // 使用setTimeout避免阻塞UI
        setTimeout(() => this.readNextChunk(), 10);
      } catch (error) {
        // 解码失败，尝试下一个编码
        this.tryNextEncoding(arrayBuffer);
      }
    };

    this.fileReader.onerror = () => {
      this.showError('读取文件分片时出错！');
      this.hideProgress();
    };

    this.fileReader.readAsArrayBuffer(blob);
  }

  /**
   * 尝试下一个编码
   * @param {ArrayBuffer} arrayBuffer - 文件分片数据
   */
  tryNextEncoding(arrayBuffer) {
    const currentIndex = this.encodings.indexOf(this.currentEncoding);

    if (currentIndex < this.encodings.length - 1) {
      // 尝试下一个编码
      this.currentEncoding = this.encodings[currentIndex + 1];

      try {
        const decoder = new TextDecoder(this.currentEncoding);
        const chunk = decoder.decode(arrayBuffer);
        this.fileContent += chunk;

        this.currentChunk++;
        const progress = Math.round((this.currentChunk / this.totalChunks) * 100);
        this.updateProgress(progress, `正在读取文件 (分片 ${this.currentChunk}/${this.totalChunks})... [使用编码: ${this.currentEncoding}]`);

        // 使用setTimeout避免阻塞UI
        setTimeout(() => this.readNextChunk(), 10);
      } catch (error) {
        // 继续尝试下一个编码
        this.tryNextEncoding(arrayBuffer);
      }
    } else {
      // 所有编码都尝试失败
      this.showError('无法识别文件编码，读取失败！');
      this.hideProgress();
    }
  }

  /**
   * 显示进度条
   * @param {string} text - 进度文本
   */
  showProgress(text = '处理中...') {
    if (this.progressContainer) {
      this.progressContainer.style.display = 'block';
      this.progressBar.style.width = '0%';
      this.progressText.textContent = text;
    }
  }

  /**
   * 更新进度条
   * @param {number} percent - 进度百分比
   * @param {string} text - 进度文本
   */
  updateProgress(percent, text = null) {
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }

    if (this.progressText && text) {
      this.progressText.textContent = text;
    }
  }

  /**
   * 隐藏进度条
   */
  hideProgress() {
    if (this.progressContainer) {
      this.progressContainer.style.display = 'none';
    }
  }

  /**
   * 显示文件内容
   * @param {string} content - 文件内容
   */
  displayFileContent(content) {
    // 切换到编辑器视图
    this.uploadSection.setAttribute('hidden', '');
    this.editorSection.removeAttribute('hidden');

    // 设置编辑器内容
    this.textEditor.value = content;

    // 设置预览内容
    this.previewText.textContent = content;

    // 更新状态栏信息
    this.updateStatusBar(content);

    // 触发自定义事件，通知文件已加载
    const event = new CustomEvent('fileLoaded', {
      detail: {
        content: content,
        encoding: this.currentEncoding,
        fileName: this.currentFile.name
      }
    });
    document.dispatchEvent(event);

    // 任务1：本地保存功能 - 创建新文档并设置当前文档信息
    if (window.textEditor) {
      window.textEditor.currentDocument = {
        id: null,
        fileName: this.currentFile.name,
        uploadTime: new Date().toISOString(),
        lastEditTime: new Date().toISOString(),
        chapters: [],
        content: content
      };
      
      // 自动保存新文档
      setTimeout(() => {
        window.textEditor.manualSave();
      }, 1000);
    }
  }

  /**
   * 更新状态栏信息
   * @param {string} content - 文件内容
   */
  updateStatusBar(content) {
    // 更新编码信息
    this.encodingInfo.textContent = `编码: ${this.currentEncoding}`;

    // 更新行数信息
    const lines = content.split('\n').length;
    this.lineInfo.textContent = `行数: ${lines}`;

    // 更新字数信息
    const words = content.replace(/\s/g, '').length;
    this.wordCount.textContent = `字数: ${words}`;
  }

  /**
   * 检测文件编码
   */
  detectFileEncoding(arrayBuffer) {
    // 检测BOM标记
    if (arrayBuffer.byteLength >= 3) {
      const view = new Uint8Array(arrayBuffer);
      
      // UTF-8 BOM
      if (view[0] === 0xEF && view[1] === 0xBB && view[2] === 0xBF) {
        return 'utf-8';
      }
      
      // UTF-16 LE BOM
      if (view[0] === 0xFF && view[1] === 0xFE) {
        return 'utf-16le';
      }
      
      // UTF-16 BE BOM
      if (view[0] === 0xFE && view[1] === 0xFF) {
        return 'utf-16be';
      }
    }
    
    // 尝试使用不同编码解码
    const encodings = ['utf-8', 'gbk', 'gb2312', 'big5'];
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: true });
        const decoded = decoder.decode(arrayBuffer.slice(0, Math.min(1024, arrayBuffer.byteLength)));
        
        // 检查解码结果是否有效
        if (this.isValidText(decoded)) {
          return encoding;
        }
      } catch (e) {
        // 解码失败，尝试下一个编码
        continue;
      }
    }
    
    // 默认返回UTF-8
    return 'utf-8';
  }

  /**
   * 检查文本是否有效
   */
  isValidText(text) {
    if (!text || text.length === 0) return false;
    
    // 计算非ASCII字符比例
    const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
    const ratio = nonAsciiCount / text.length;
    
    // 如果非ASCII字符比例过高，可能是乱码
    if (ratio > 0.8 && text.length > 10) {
      return false;
    }
    
    // 检查是否包含过多控制字符
    const controlCharCount = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
    if (controlCharCount / text.length > 0.1) {
      return false;
    }
    
    return true;
  }
}

// 导出模块
window.FileHandler = FileHandler;
