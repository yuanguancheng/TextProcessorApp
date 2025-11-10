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
    this.contentSection = document.getElementById('contentSection');
    this.contentDisplay = document.getElementById('contentDisplay');

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
    this.contentSection.setAttribute('hidden', '');
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
    this.contentSection.setAttribute('hidden', '');

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

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      this.displayFileContent(content);
    };

    reader.onerror = () => {
      this.showError('读取文件时出错！');
    };

    reader.readAsText(this.currentFile);
  }

  /**
   * 显示文件内容
   * @param {string} content - 文件内容
   */
  displayFileContent(content) {
    this.contentDisplay.textContent = content;
    this.contentSection.removeAttribute('hidden');
  }
}

// 导出模块
window.FileHandler = FileHandler;
