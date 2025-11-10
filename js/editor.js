/**
 * 文本编辑器类 - 任务2：内容优化工具
 */
class TextEditor {
  constructor() {
    this.editor = document.getElementById('textEditor');
    this.preview = document.getElementById('previewText');
    this.chapterList = document.getElementById('chapterList');
    this.chapterListContent = document.getElementById('chapterListContent');
    this.chapterListLoading = document.getElementById('chapterListLoading');
    this.expandAllButton = document.getElementById('expandAllButton');
    this.collapseAllButton = document.getElementById('collapseAllButton');

    // 任务4：手动分章工具元素
    this.customRuleInput = document.getElementById('customRuleInput');
    this.applyCustomRuleButton = document.getElementById('applyCustomRuleButton');
    this.splitChapterButton = document.getElementById('splitChapterButton');
    this.mergeChaptersButton = document.getElementById('mergeChaptersButton');

    // 任务2：内容优化工具元素
    this.removeEmptyLinesButton = document.getElementById('removeEmptyLinesButton');
    this.optimizeIndentButton = document.getElementById('optimizeIndentButton');

    // 任务1：本地保存功能元素
    this.saveButton = document.getElementById('saveButton');
    this.autoSaveToggle = document.getElementById('autoSaveToggle');

    // 响应式布局元素
    this.mobileMenuButton = document.getElementById('mobileMenuButton');
    this.chapterListPane = document.getElementById('chapterListPane');
    this.chapterListOverlay = document.getElementById('chapterListOverlay');

    // 交互体验增强元素
    this.readingModeButton = document.getElementById('readingModeButton');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.messageContainer = document.getElementById('messageContainer');

    // 阅读模式状态
    this.readingModeEnabled = false;
    this.readingSettings = {
      fontFamily: "'Microsoft YaHei', sans-serif",
      fontSize: "16px",
      lineHeight: "1.6",
      backgroundColor: "#f8f9fa",
      textColor: "#333333"
    };

    // 章节数据
    this.chapters = [];
    this.currentChapter = null;
    this.selectedChapters = new Set(); // 用于存储选中的章节
    this.editingChapter = null; // 当前正在编辑的章节索引

    // 任务2：内容优化工具状态
    this.indentEnabled = true; // 缩进优化是否启用
    this.indentSize = 2; // 缩进大小（空格数）

    // 任务1：本地保存功能状态
    this.currentDocument = {
      id: null,
      fileName: '',
      uploadTime: null,
      lastEditTime: null,
      chapters: [],
      content: ''
    };
    this.autoSaveEnabled = true;

    // 初始化存储管理器
    this.storageManager = new StorageManager();

    // 初始化事件监听
    this.initEventListeners();

    // 初始化字数统计
    this.initWordCount();

    // 启动自动保存
    this.startAutoSave();
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    // 章节检测按钮
    const chapterDetectButton = document.getElementById('chapterDetectButton');
    if (chapterDetectButton) {
      chapterDetectButton.addEventListener('click', () => this.detectChapters());
    }

    // 展开/折叠所有章节按钮
    if (this.expandAllButton) {
      this.expandAllButton.addEventListener('click', () => this.expandAllChapters());
    }

    if (this.collapseAllButton) {
      this.collapseAllButton.addEventListener('click', () => this.collapseAllChapters());
    }

    // 任务4：手动分章工具事件监听
    if (this.applyCustomRuleButton) {
      this.applyCustomRuleButton.addEventListener('click', () => this.applyCustomRule());
    }

    if (this.splitChapterButton) {
      this.splitChapterButton.addEventListener('click', () => this.splitChapter());
    }

    if (this.mergeChaptersButton) {
      this.mergeChaptersButton.addEventListener('click', () => this.mergeChapters());
    }

    // 任务2：内容优化工具事件监听
    if (this.removeEmptyLinesButton) {
      this.removeEmptyLinesButton.addEventListener('click', () => this.removeEmptyLines());
    }

    if (this.optimizeIndentButton) {
      this.optimizeIndentButton.addEventListener('click', () => this.optimizeIndent());
    }

    // 任务1：本地保存功能事件监听
    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => this.manualSave());
    }

    if (this.autoSaveToggle) {
      this.autoSaveToggle.addEventListener('click', () => this.toggleAutoSave());
    }

    // 任务4：导出功能事件监听
    const exportTxtButton = document.getElementById('exportTxtButton');
    if (exportTxtButton) {
      exportTxtButton.addEventListener('click', () => this.exportToTxt());
    }

    const backToDocumentsButton = document.getElementById('backToDocumentsButton');
    if (backToDocumentsButton) {
      backToDocumentsButton.addEventListener('click', () => this.backToDocuments());
    }

    // 文档管理相关事件监听
    const newDocumentButton = document.getElementById('newDocumentButton');
    if (newDocumentButton) {
      newDocumentButton.addEventListener('click', () => this.createNewDocument());
    }

    const uploadDocumentButton = document.getElementById('uploadDocumentButton');
    if (uploadDocumentButton) {
      uploadDocumentButton.addEventListener('click', () => this.showUploadSection());
    }

    const refreshDocumentsButton = document.getElementById('refreshDocumentsButton');
    if (refreshDocumentsButton) {
      refreshDocumentsButton.addEventListener('click', () => this.loadDocumentList());
    }

    // 编辑器内容变化事件，用于更新字数统计
    if (this.editor) {
      this.editor.addEventListener('input', () => this.updateWordCount());
      this.editor.addEventListener('scroll', () => this.highlightCurrentChapter());
    }

    // 预览区滚动事件，用于高亮当前章节
    if (this.preview) {
      this.preview.addEventListener('scroll', () => this.highlightCurrentChapter());
    }

    // 移动端菜单按钮事件监听
    if (this.mobileMenuButton) {
      this.mobileMenuButton.addEventListener('click', () => this.toggleMobileMenu());
    }

    // 移动端遮罩层点击事件
    if (this.chapterListOverlay) {
      this.chapterListOverlay.addEventListener('click', () => this.closeMobileMenu());
    }

    // 阅读模式按钮事件监听
    if (this.readingModeButton) {
      this.readingModeButton.addEventListener('click', () => this.toggleReadingMode());
    }

    // 预览区滚动事件，用于章节高亮同步
    if (this.preview) {
      this.preview.addEventListener('scroll', () => this.highlightCurrentChapter());
    }

    // 编辑器滚动事件，用于章节高亮同步
    if (this.editor) {
      this.editor.addEventListener('scroll', () => this.highlightCurrentChapter());
    }
  }

  /**
   * 任务2：初始化字数统计
   */
  initWordCount() {
    // 创建字数统计元素
    const wordCountElement = document.getElementById('wordCount');
    if (wordCountElement) {
      wordCountElement.innerHTML = `
        <div class="word-count-info">
          <div class="word-count-item">
            <span class="word-count-label">总字数:</span>
            <span class="word-count-value" id="totalWordCount">0</span>
          </div>
          <div class="word-count-item">
            <span class="word-count-label">当前章节:</span>
            <span class="word-count-value" id="currentChapterWordCount">0</span>
          </div>
        </div>
      `;
    }

    // 初始更新字数统计
    this.updateWordCount();
  }

  /**
   * 任务2：更新字数统计
   */
  updateWordCount() {
    if (!this.editor) return;

    const content = this.editor.value;

    // 计算总字数（中文字符+英文单词）
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    const totalWordCount = chineseChars + englishWords;

    // 更新总字数显示
    const totalWordCountElement = document.getElementById('totalWordCount');
    if (totalWordCountElement) {
      totalWordCountElement.textContent = totalWordCount.toLocaleString();
    }

    // 计算当前章节字数
    let currentChapterWordCount = 0;
    if (this.currentChapter !== null && this.chapters.length > 0) {
      const chapter = this.chapters[this.currentChapter];
      if (chapter && chapter.content) {
        const chapterChineseChars = (chapter.content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const chapterEnglishWords = (chapter.content.match(/[a-zA-Z]+/g) || []).length;
        currentChapterWordCount = chapterChineseChars + chapterEnglishWords;
      }
    }

    // 更新当前章节字数显示
    const currentChapterWordCountElement = document.getElementById('currentChapterWordCount');
    if (currentChapterWordCountElement) {
      currentChapterWordCountElement.textContent = currentChapterWordCount.toLocaleString();
    }

    // 更新章节列表中的字数统计
    this.updateChapterWordCounts();
  }

  /**
   * 任务2：更新章节列表中的字数统计
   */
  updateChapterWordCounts() {
    if (!this.chapterList || this.chapters.length === 0) return;

    this.chapters.forEach((chapter, index) => {
      // 计算章节字数
      const chineseChars = (chapter.content.match(/[\u4e00-\u9fa5]/g) || []).length;
      const englishWords = (chapter.content.match(/[a-zA-Z]+/g) || []).length;
      const wordCount = chineseChars + englishWords;

      // 查找章节项
      const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${index}"]`);
      if (chapterItem) {
        // 查找或创建字数统计元素
        let wordCountElement = chapterItem.querySelector('.chapter-word-count');
        if (!wordCountElement) {
          wordCountElement = document.createElement('span');
          wordCountElement.className = 'chapter-word-count';
          chapterItem.appendChild(wordCountElement);
        }

        // 更新字数统计
        wordCountElement.textContent = `(${wordCount.toLocaleString()}字)`;
      }
    });
  }

  /**
   * 任务4：合并选中的章节
   */
  mergeChapters() {
    // 获取选中的章节索引
    const selectedChapters = Array.from(this.selectedChapters);

    // 验证至少选中2个章节
    if (selectedChapters.length < 2) {
      this.showMessage('请至少选择2个章节进行合并', 'warning');
      return;
    }

    // 按索引排序选中的章节
    selectedChapters.sort((a, b) => a - b);

    // 确认合并操作
    if (!confirm(`确定要合并选中的 ${selectedChapters.length} 个章节吗？合并后将保留第一个章节的标题。`)) {
      return;
    }

    // 获取第一个章节的标题（将作为合并后的章节标题）
    const firstChapterIndex = selectedChapters[0];
    const mergedTitle = this.chapters[firstChapterIndex].title;

    // 合并章节内容
    let mergedContent = '';
    const mergedChapters = [];

    // 遍历所有章节，将选中的章节合并，未选中的章节保持不变
    for (let i = 0; i < this.chapters.length; i++) {
      if (selectedChapters.includes(i)) {
        // 如果是选中的章节，合并内容
        mergedContent += this.chapters[i].content;

        // 如果是最后一个选中的章节，创建合并后的章节
        if (i === selectedChapters[selectedChapters.length - 1]) {
          mergedChapters.push({
            title: mergedTitle,
            content: mergedContent,
            startPosition: this.chapters[firstChapterIndex].startPosition,
            endPosition: this.chapters[i].endPosition
          });
        }
      } else {
        // 如果是未选中的章节，保持不变
        mergedChapters.push(this.chapters[i]);
      }
    }

    // 更新章节数据
    this.chapters = mergedChapters;

    // 清空选中状态
    this.selectedChapters.clear();

    // 更新编辑器内容
    this.updateEditorContentFromChapters();

    // 重新显示章节列表
    this.displayChapterList();

    // 更新字数统计
    this.updateWordCount();

    // 显示成功消息
    this.showMessage(`成功合并 ${selectedChapters.length} 个章节`, 'success');
  }

  /**
   * 切换章节选中状态
   * @param {number} chapterIndex - 章节索引
   */
  toggleChapterSelection(chapterIndex) {
    if (this.selectedChapters.has(chapterIndex)) {
      this.selectedChapters.delete(chapterIndex);
    } else {
      this.selectedChapters.add(chapterIndex);
    }

    // 更新章节项的选中状态
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);
    if (chapterItem) {
      const checkbox = chapterItem.querySelector('.chapter-checkbox');
      if (checkbox) {
        checkbox.checked = this.selectedChapters.has(chapterIndex);
      }

      // 添加/移除选中样式
      if (this.selectedChapters.has(chapterIndex)) {
        chapterItem.classList.add('selected');
      } else {
        chapterItem.classList.remove('selected');
      }
    }

    // 更新合并按钮状态
    this.updateMergeButtonState();
  }

  /**
   * 更新合并按钮状态
   */
  updateMergeButtonState() {
    if (this.mergeChaptersButton) {
      if (this.selectedChapters.size >= 2) {
        this.mergeChaptersButton.disabled = false;
        this.mergeChaptersButton.title = `合并选中的 ${this.selectedChapters.size} 个章节`;
      } else {
        this.mergeChaptersButton.disabled = true;
        this.mergeChaptersButton.title = '请至少选择2个章节进行合并';
      }
    }
  }

  /**
   * 根据章节数据更新编辑器内容
   */
  updateEditorContentFromChapters() {
    if (!this.editor) return;

    // 将所有章节内容拼接起来
    const fullContent = this.chapters.map(chapter => chapter.content).join('');

    // 更新编辑器内容
    this.editor.value = fullContent;

    // 更新预览
    this.updatePreview();
  }

  /**
   * 开始编辑章节标题
   * @param {number} index - 章节索引
   */
  startEditChapterTitle(index) {
    // 如果正在编辑其他章节，先保存
    if (this.editingChapter !== null && this.editingChapter !== index) {
      this.saveChapterTitle(this.editingChapter);
    }

    this.editingChapter = index;

    const titleElement = document.getElementById(`chapter-title-${index}`);
    const titleInput = document.getElementById(`chapter-title-input-${index}`);
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${index}"]`);

    if (titleElement && titleInput && chapterItem) {
      // 隐藏标题显示，显示输入框
      titleElement.style.display = 'none';
      titleInput.style.display = 'inline-block';

      // 设置输入框值
      titleInput.value = this.chapters[index].title;

      // 选中输入框内容
      titleInput.focus();
      titleInput.select();

      // 添加编辑状态样式
      chapterItem.classList.add('editing');
    }
  }

  /**
   * 保存章节标题
   * @param {number} index - 章节索引
   */
  saveChapterTitle(index) {
    const titleInput = document.getElementById(`chapter-title-input-${index}`);
    const titleElement = document.getElementById(`chapter-title-${index}`);
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${index}"]`);

    if (titleInput && titleElement && chapterItem) {
      const newTitle = titleInput.value.trim();

      if (newTitle) {
        // 更新章节标题
        this.chapters[index].title = newTitle;
        titleElement.textContent = newTitle;

        // 更新编辑器内容
        this.updateEditorContentFromChapters();

        this.showMessage('章节标题已更新', 'success');
      }

      // 恢复显示状态
      titleElement.style.display = 'inline-block';
      titleInput.style.display = 'none';

      // 移除编辑状态样式
      chapterItem.classList.remove('editing');

      this.editingChapter = null;
    }
  }

  /**
   * 取消编辑章节标题
   * @param {number} index - 章节索引
   */
  cancelEditChapterTitle(index) {
    const titleElement = document.getElementById(`chapter-title-${index}`);
    const titleInput = document.getElementById(`chapter-title-input-${index}`);
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${index}"]`);

    if (titleElement && titleInput && chapterItem) {
      // 恢复显示状态
      titleElement.style.display = 'inline-block';
      titleInput.style.display = 'none';

      // 移除编辑状态样式
      chapterItem.classList.remove('editing');

      this.editingChapter = null;
    }
  }

  /**
   * 删除章节
   * @param {number} index - 章节索引
   */
  deleteChapter(index) {
    // 二次确认
    if (!confirm(`确定要删除章节 "${this.chapters[index].title}" 吗？此操作不可恢复。`)) {
      return;
    }

    // 从选中章节中移除
    if (this.selectedChapters.has(index)) {
      this.selectedChapters.delete(index);
    }

    // 删除章节
    this.chapters.splice(index, 1);

    // 更新编辑器内容
    this.updateEditorContentFromChapters();

    // 重新显示章节列表
    this.displayChapterList();

    // 更新字数统计
    this.updateWordCount();

    // 更新合并按钮状态
    this.updateMergeButtonState();

    this.showMessage('章节已删除', 'success');
  }

  /**
   * 跳转到指定章节
   * @param {number} index - 章节索引
   */
  jumpToChapter(index) {
    if (index < 0 || index >= this.chapters.length) {
      return;
    }

    this.currentChapter = index;

    // 更新章节选中状态
    this.updateChapterSelection();

    // 更新字数统计
    this.updateWordCount();

    // 滚动到章节位置（如果支持）
    this.scrollToChapter(index);
  }

  /**
   * 更新章节选中状态
   */
  updateChapterSelection() {
    if (!this.chapterList) return;

    // 移除所有选中状态
    const allItems = this.chapterList.querySelectorAll('.chapter-item');
    allItems.forEach(item => item.classList.remove('active'));

    // 添加当前章节选中状态
    if (this.currentChapter !== null) {
      const currentItem = this.chapterList.querySelector(`.chapter-item[data-index="${this.currentChapter}"]`);
      if (currentItem) {
        currentItem.classList.add('active');
      }
    }
  }

  /**
   * 滚动到指定章节
   * @param {number} index - 章节索引
   */
  scrollToChapter(index) {
    if (!this.editor || !this.chapters[index]) return;

    const chapter = this.chapters[index];

    // 计算章节在编辑器中的位置（简单实现）
    const content = this.editor.value;
    const position = chapter.startPosition || 0;

    // 设置光标位置
    this.editor.focus();
    this.editor.setSelectionRange(position, position);

    // 滚动到可见区域（简单实现）
    const lineHeight = 20; // 估计的行高
    const linesBefore = Math.floor(position / 80); // 估计每行80字符
    const scrollTop = linesBefore * lineHeight;

    this.editor.scrollTop = Math.max(0, scrollTop - 100); // 留出一些顶部空间
  }

  /**
   * 切换章节折叠/展开状态
   * @param {number} index - 章节索引
   */
  toggleChapter(index) {
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${index}"]`);
    const subList = document.getElementById(`chapter-sub-list-${index}`);
    const toggleButton = chapterItem.querySelector('.chapter-toggle');

    if (chapterItem && subList && toggleButton) {
      if (subList.style.display === 'none') {
        // 展开章节
        subList.style.display = 'block';
        toggleButton.textContent = '▼';
        chapterItem.classList.add('expanded');
      } else {
        // 折叠章节
        subList.style.display = 'none';
        toggleButton.textContent = '▶';
        chapterItem.classList.remove('expanded');
      }
    }
  }

  /**
   * 展开所有章节
   */
  expandAllChapters() {
    const chapterItems = this.chapterList.querySelectorAll('.chapter-item');

    chapterItems.forEach((item, index) => {
      const subList = document.getElementById(`chapter-sub-list-${index}`);
      const toggleButton = item.querySelector('.chapter-toggle');

      if (subList && toggleButton) {
        subList.style.display = 'block';
        toggleButton.textContent = '▼';
        item.classList.add('expanded');
      }
    });

    this.showMessage('已展开所有章节', 'info');
  }

  /**
   * 折叠所有章节
   */
  collapseAllChapters() {
    const chapterItems = this.chapterList.querySelectorAll('.chapter-item');

    chapterItems.forEach((item, index) => {
      const subList = document.getElementById(`chapter-sub-list-${index}`);
      const toggleButton = item.querySelector('.chapter-toggle');

      if (subList && toggleButton) {
        subList.style.display = 'none';
        toggleButton.textContent = '▶';
        item.classList.remove('expanded');
      }
    });

    this.showMessage('已折叠所有章节', 'info');
  }

  /**
   * 将章节内容分割为多个部分
   * @param {string} content - 章节内容
   * @param {number} maxSections - 最大分割数
   * @returns {Array} - 分割后的部分数组
   */
  splitChapterIntoSections(content, maxSections = 3) {
    if (!content || content.length === 0) {
      return [];
    }

    const sections = [];
    const sectionLength = Math.ceil(content.length / maxSections);

    for (let i = 0; i < maxSections; i++) {
      const start = i * sectionLength;
      const end = Math.min((i + 1) * sectionLength, content.length);

      if (start < content.length) {
        sections.push(content.substring(start, end));
      }
    }

    return sections;
  }

  /**
   * 跳转到章节的指定段落
   * @param {number} chapterIndex - 章节索引
   * @param {number} sectionIndex - 段落索引
   */
  jumpToChapterSection(chapterIndex, sectionIndex) {
    if (chapterIndex < 0 || chapterIndex >= this.chapters.length) {
      return;
    }

    const chapter = this.chapters[chapterIndex];
    const sections = this.splitChapterIntoSections(chapter.content, 3);

    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      return;
    }

    // 计算段落在全文中的位置
    const sectionStart = chapter.startPosition +
      sections.slice(0, sectionIndex).reduce((sum, section) => sum + section.length, 0);

    // 设置光标位置
    if (this.editor) {
      this.editor.focus();
      this.editor.setSelectionRange(sectionStart, sectionStart);

      // 滚动到可见区域
      const lineHeight = 20;
      const linesBefore = Math.floor(sectionStart / 80);
      const scrollTop = linesBefore * lineHeight;
      this.editor.scrollTop = Math.max(0, scrollTop - 100);
    }

    this.showMessage(`已跳转到第${chapterIndex + 1}章第${sectionIndex + 1}段`, 'info');
  }

  /**
   * 任务2：自动去空行
   */
  removeEmptyLines() {
    if (!this.editor) return;

    const content = this.editor.value;

    // 使用正则表达式移除连续的空行，保留单空行分隔段落
    const optimizedContent = content.replace(/\n\s*\n\s*\n+/g, '\n\n');

    // 如果内容没有变化，提示用户
    if (optimizedContent === content) {
      this.showMessage('文本中没有需要移除的连续空行', 'info');
      return;
    }

    // 计算移除的空行数
    const originalLines = content.split('\n').length;
    const optimizedLines = optimizedContent.split('\n').length;
    const removedLines = originalLines - optimizedLines;

    // 更新编辑器内容
    this.editor.value = optimizedContent;

    // 更新预览
    this.updatePreview();

    // 重新检测章节（如果有）
    if (this.chapters.length > 0) {
      this.detectChapters();
    }

    // 更新字数统计
    this.updateWordCount();

    // 显示成功消息
    this.showMessage(`已移除 ${removedLines} 个空行`, 'success');
  }

  /**
   * 任务2：统一缩进
   */
  optimizeIndent() {
    if (!this.editor) return;

    const content = this.editor.value;

    // 如果缩进优化未启用，直接返回
    if (!this.indentEnabled) {
      this.showMessage('缩进优化已关闭', 'info');
      return;
    }

    // 分割内容为行
    const lines = content.split('\n');

    // 处理每一行
    const optimizedLines = lines.map(line => {
      // 如果是空行，不做处理
      if (!line.trim()) {
        return line;
      }

      // 如果行首已经有缩进，不做处理
      if (/^[\s\t]/.test(line)) {
        return line;
      }

      // 为段落首行添加指定数量的空格
      return ' '.repeat(this.indentSize) + line;
    });

    // 重新组合内容
    const optimizedContent = optimizedLines.join('\n');

    // 如果内容没有变化，提示用户
    if (optimizedContent === content) {
      this.showMessage('文本中没有需要优化的缩进', 'info');
      return;
    }

    // 计算处理的段落数
    const processedParagraphs = lines.filter(line =>
      line.trim() && !/^[\s\t]/.test(line)
    ).length;

    // 更新编辑器内容
    this.editor.value = optimizedContent;

    // 更新预览
    this.updatePreview();

    // 重新检测章节（如果有）
    if (this.chapters.length > 0) {
      this.detectChapters();
    }

    // 更新字数统计
    this.updateWordCount();

    // 显示成功消息
    this.showMessage(`已为 ${processedParagraphs} 个段落添加缩进`, 'success');
  }

  /**
   * 更新预览区内容
   */
  updatePreview() {
    if (!this.preview || !this.editor) return;

    // 更新预览内容
    this.preview.textContent = this.editor.value;
  }

  /**
   * 检测章节并显示章节列表
   */
  detectChapters() {
    const content = this.editor.value;

    if (!content.trim()) {
      this.showMessage('请先输入文本内容');
      return;
    }

    // 使用章节检测器进行自动分章
    const chapterDetector = new ChapterDetector();
    const result = chapterDetector.performAutoChapterDivision(content);

    // 更新章节数据
    this.chapters = result.chapters;

    // 显示章节列表
    this.displayChapterList();

    // 更新字数统计
    this.updateWordCount();

    // 显示验证结果
    if (!result.validation.isValid) {
      this.showMessage(result.validation.warnings.join('; '), 'warning');
    } else {
      this.showMessage(`成功检测到 ${this.chapters.length} 个章节`, 'success');
    }
  }

  /**
   * 显示章节列表
   */
  displayChapterList() {
    // 隐藏加载提示，显示章节列表
    this.chapterListLoading.style.display = 'none';
    this.chapterList.style.display = 'block';

    // 清空现有列表
    this.chapterList.innerHTML = '';

    // 生成章节列表项
    this.chapters.forEach((chapter, index) => {
      const li = document.createElement('li');
      li.className = 'chapter-item';
      li.dataset.index = index;

      // 选择框（用于多选）
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'chapter-checkbox';
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleChapterSelection(index);
      });

      // 章节序号
      const chapterNumber = document.createElement('span');
      chapterNumber.className = 'chapter-number';
      chapterNumber.textContent = `${index + 1}.`;

      // 章节标题（显示模式）
      const chapterTitle = document.createElement('span');
      chapterTitle.className = 'chapter-title';
      chapterTitle.id = `chapter-title-${index}`;
      chapterTitle.textContent = chapter.title;
      chapterTitle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startEditChapterTitle(index);
      });

      // 章节标题（编辑模式）
      const chapterTitleInput = document.createElement('input');
      chapterTitleInput.type = 'text';
      chapterTitleInput.className = 'chapter-title-input';
      chapterTitleInput.id = `chapter-title-input-${index}`;
      chapterTitleInput.value = chapter.title;
      chapterTitleInput.style.display = 'none';
      chapterTitleInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      chapterTitleInput.addEventListener('blur', () => {
        this.saveChapterTitle(index);
      });
      chapterTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveChapterTitle(index);
        } else if (e.key === 'Escape') {
          this.cancelEditChapterTitle(index);
        }
      });

      // 任务1：编辑按钮
      const editButton = document.createElement('button');
      editButton.className = 'chapter-edit-button';
      editButton.id = `chapter-edit-${index}`;
      editButton.title = '编辑章节名';
      editButton.textContent = '✏️';
      editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startEditChapterTitle(index);
      });

      // 任务1：删除按钮
      const deleteButton = document.createElement('button');
      deleteButton.className = 'chapter-delete-button';
      deleteButton.id = `chapter-delete-${index}`;
      deleteButton.title = '删除章节';
      deleteButton.textContent = '🗑️';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteChapter(index);
      });

      // 任务2：章节字数统计
      const chapterWordCount = document.createElement('span');
      chapterWordCount.className = 'chapter-word-count';

      // 计算章节字数
      const chineseChars = (chapter.content.match(/[\u4e00-\u9fa5]/g) || []).length;
      const englishWords = (chapter.content.match(/[a-zA-Z]+/g) || []).length;
      const wordCount = chineseChars + englishWords;
      chapterWordCount.textContent = `(${wordCount.toLocaleString()}字)`;

      // 折叠/展开按钮（仅当章节内容较长时显示）
      const chapterToggle = document.createElement('span');
      chapterToggle.className = 'chapter-toggle';
      chapterToggle.textContent = '▼';
      chapterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleChapter(index);
      });

      // 组装元素
      li.appendChild(checkbox);
      li.appendChild(chapterNumber);
      li.appendChild(chapterTitle);
      li.appendChild(chapterTitleInput);
      li.appendChild(editButton);
      li.appendChild(deleteButton);
      li.appendChild(chapterWordCount);
      li.appendChild(chapterToggle);

      // 添加点击事件
      li.addEventListener('click', () => this.jumpToChapter(index));

      // 添加到列表
      this.chapterList.appendChild(li);

      // 如果章节内容较长，创建子列表
      if (chapter.content && chapter.content.length > 1000) {
        const subList = document.createElement('ul');
        subList.className = 'chapter-sub-list';
        subList.id = `chapter-sub-list-${index}`;

        // 可以在这里添加子章节或段落
        // 这里简单地将长章节分成几个部分
        const sections = this.splitChapterIntoSections(chapter.content, 3);
        sections.forEach((section, sectionIndex) => {
          const subLi = document.createElement('li');
          subLi.className = 'sub-chapter-item';
          subLi.textContent = `段落 ${sectionIndex + 1}`;
          subLi.addEventListener('click', (e) => {
            e.stopPropagation();
            this.jumpToChapterSection(index, sectionIndex);
          });
          subList.appendChild(subLi);
        });

        li.appendChild(subList);
      }
    });
  }

  // 其他方法保持不变...

  /**
   * 任务1：本地保存功能 - 启动自动保存
   */
  startAutoSave() {
    if (this.autoSaveEnabled) {
      this.storageManager.startAutoSave(() => this.getCurrentDocumentData());
      this.updateAutoSaveButton();
    }
  }

  /**
   * 任务1：本地保存功能 - 停止自动保存
   */
  stopAutoSave() {
    this.storageManager.stopAutoSave();
    this.updateAutoSaveButton();
  }

  /**
   * 任务1：本地保存功能 - 切换自动保存状态
   */
  toggleAutoSave() {
    this.autoSaveEnabled = !this.autoSaveEnabled;

    if (this.autoSaveEnabled) {
      this.startAutoSave();
      this.showMessage('自动保存已开启', 'success');
    } else {
      this.stopAutoSave();
      this.showMessage('自动保存已关闭', 'warning');
    }
  }

  /**
   * 任务1：本地保存功能 - 更新自动保存按钮状态
   */
  updateAutoSaveButton() {
    if (this.autoSaveToggle) {
      if (this.autoSaveEnabled) {
        this.autoSaveToggle.textContent = '⏱️';
        this.autoSaveToggle.title = '自动保存已开启';
        this.autoSaveToggle.classList.add('active');
      } else {
        this.autoSaveToggle.textContent = '⏱️';
        this.autoSaveToggle.title = '自动保存已关闭';
        this.autoSaveToggle.classList.remove('active');
      }
    }
  }

  /**
   * 任务1：本地保存功能 - 手动保存
   */
  async manualSave() {
    const documentData = this.getCurrentDocumentData();

    if (!documentData.content || documentData.content.trim().length === 0) {
      this.showMessage('文档内容为空，无法保存', 'warning');
      return;
    }

    this.showMessage('正在保存文档...', 'info');

    const result = await this.storageManager.saveDocument(documentData);

    if (result.success) {
      this.currentDocument.id = result.documentId;
      this.showMessage('文档保存成功', 'success');
    } else {
      this.showMessage(`保存失败: ${result.error}`, 'error');
    }
  }

  /**
   * 任务1：本地保存功能 - 获取当前文档数据
   */
  getCurrentDocumentData() {
    return {
      id: this.currentDocument.id,
      fileName: this.currentDocument.fileName || '未命名文档',
      uploadTime: this.currentDocument.uploadTime || new Date().toISOString(),
      lastEditTime: new Date().toISOString(),
      chapters: this.chapters,
      content: this.editor ? this.editor.value : ''
    };
  }

  /**
   * 任务1：本地保存功能 - 加载文档列表
   */
  async loadDocumentList() {
    const documentListLoading = document.getElementById('documentListLoading');
    const documentListContent = document.getElementById('documentListContent');
    const documentListEmpty = document.getElementById('documentListEmpty');
    const documentTableBody = document.getElementById('documentTableBody');

    if (!documentListLoading || !documentListContent || !documentListEmpty || !documentTableBody) {
      return;
    }

    documentListLoading.style.display = 'block';
    documentListContent.style.display = 'none';
    documentListEmpty.style.display = 'none';

    try {
      const documents = await this.storageManager.getAllDocuments();

      documentTableBody.innerHTML = '';

      if (documents.length === 0) {
        documentListLoading.style.display = 'none';
        documentListEmpty.style.display = 'block';
        return;
      }

      documents.forEach(doc => {
        const row = document.createElement('tr');

        // 格式化时间
        const uploadTime = new Date(doc.uploadTime).toLocaleString('zh-CN');
        const lastEditTime = new Date(doc.lastEditTime).toLocaleString('zh-CN');

        row.innerHTML = `
          <td class="document-name">${doc.fileName}</td>
          <td class="document-upload-time">${uploadTime}</td>
          <td class="document-last-edit">${lastEditTime}</td>
          <td class="document-chapter-count">${doc.chapters ? doc.chapters.length : 0}</td>
          <td class="document-actions">
            <button class="action-button edit-button" data-doc-id="${doc.id}">继续编辑</button>
            <button class="action-button delete-button" data-doc-id="${doc.id}">删除</button>
          </td>
        `;

        documentTableBody.appendChild(row);
      });

      // 添加事件监听
      documentTableBody.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const docId = e.target.dataset.docId;
          this.loadDocument(docId);
        });
      });

      documentTableBody.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const docId = e.target.dataset.docId;
          this.deleteDocument(docId);
        });
      });

      documentListLoading.style.display = 'none';
      documentListContent.style.display = 'block';

    } catch (error) {
      console.error('加载文档列表失败:', error);
      documentListLoading.style.display = 'none';
      documentListEmpty.style.display = 'block';
      this.showMessage('加载文档列表失败', 'error');
    }
  }

  /**
   * 任务1：本地保存功能 - 加载文档
   */
  async loadDocument(documentId) {
    try {
      const document = await this.storageManager.getDocument(documentId);

      if (!document) {
        this.showMessage('文档不存在', 'error');
        return;
      }

      // 更新当前文档信息
      this.currentDocument = { ...document };

      // 设置编辑器内容
      if (this.editor) {
        this.editor.value = document.content || '';
      }

      // 设置章节数据
      this.chapters = document.chapters || [];

      // 更新预览
      this.updatePreview();

      // 显示章节列表（如果有章节）
      if (this.chapters.length > 0) {
        this.displayChapterList();
      }

      // 切换到编辑器界面
      this.showEditorSection();

      this.showMessage(`已加载文档: ${document.fileName}`, 'success');

    } catch (error) {
      console.error('加载文档失败:', error);
      this.showMessage('加载文档失败', 'error');
    }
  }

  /**
   * 任务1：本地保存功能 - 删除文档
   */
  async deleteDocument(documentId) {
    if (!confirm('确定要删除这个文档吗？此操作不可恢复。')) {
      return;
    }

    try {
      const success = await this.storageManager.deleteDocument(documentId);

      if (success) {
        this.showMessage('文档删除成功', 'success');
        // 重新加载文档列表
        this.loadDocumentList();
      } else {
        this.showMessage('文档删除失败', 'error');
      }

    } catch (error) {
      console.error('删除文档失败:', error);
      this.showMessage('删除文档失败', 'error');
    }
  }

  /**
   * 任务1：本地保存功能 - 创建新文档
   */
  createNewDocument() {
    this.currentDocument = {
      id: null,
      fileName: '新文档',
      uploadTime: new Date().toISOString(),
      lastEditTime: new Date().toISOString(),
      chapters: [],
      content: ''
    };

    if (this.editor) {
      this.editor.value = '';
    }

    this.chapters = [];
    this.updatePreview();

    this.showEditorSection();
    this.showMessage('已创建新文档', 'success');
  }

  /**
   * 任务1：本地保存功能 - 显示上传界面
   */
  showUploadSection() {
    const documentManagerSection = document.getElementById('documentManagerSection');
    const uploadSection = document.getElementById('uploadSection');

    if (documentManagerSection && uploadSection) {
      documentManagerSection.style.display = 'none';
      uploadSection.style.display = 'block';
    }
  }

  /**
   * 任务1：本地保存功能 - 显示编辑器界面
   */
  showEditorSection() {
    const documentManagerSection = document.getElementById('documentManagerSection');
    const uploadSection = document.getElementById('uploadSection');
    const editorSection = document.getElementById('editorSection');

    if (documentManagerSection && uploadSection && editorSection) {
      documentManagerSection.style.display = 'none';
      uploadSection.style.display = 'none';
      editorSection.style.display = 'block';
    }
  }

  /**
   * 任务4：导出TXT文件
   */
  exportToTxt() {
    if (!this.editor || !this.editor.value.trim()) {
      this.showMessage('文档内容为空，无法导出', 'warning');
      return;
    }

    // 显示导出设置对话框
    this.showExportSettingsDialog();
  }

  /**
   * 显示导出设置对话框
   */
  showExportSettingsDialog() {
    const exportSettingsDialog = document.getElementById('exportSettingsDialog');
    const exportFileNameInput = document.getElementById('exportFileName');
    const includeChapterNamesCheckbox = document.getElementById('includeChapterNames');
    const preserveEmptyLinesCheckbox = document.getElementById('preserveEmptyLines');
    const exportDialogClose = document.getElementById('exportDialogClose');
    const cancelExportButton = document.getElementById('cancelExportButton');
    const confirmExportButton = document.getElementById('confirmExportButton');

    if (!exportSettingsDialog || !exportFileNameInput || !includeChapterNamesCheckbox ||
      !preserveEmptyLinesCheckbox || !exportDialogClose || !cancelExportButton || !confirmExportButton) {
      // 如果对话框元素不存在，使用默认设置直接导出
      this.performExport('未命名文档.txt', true, true);
      return;
    }

    // 设置默认文件名
    const fileName = this.currentDocument.fileName || '未命名文档';
    exportFileNameInput.value = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;

    // 显示对话框
    exportSettingsDialog.hidden = false;

    // 添加事件监听
    const closeDialog = () => {
      exportSettingsDialog.hidden = true;
    };

    exportDialogClose.onclick = closeDialog;
    cancelExportButton.onclick = closeDialog;

    confirmExportButton.onclick = () => {
      const fileName = exportFileNameInput.value.trim() || '未命名文档.txt';
      const includeChapterNames = includeChapterNamesCheckbox.checked;
      const preserveEmptyLines = preserveEmptyLinesCheckbox.checked;

      closeDialog();
      this.performExport(fileName, includeChapterNames, preserveEmptyLines);
    };

    // 点击对话框外部关闭
    exportSettingsDialog.onclick = (e) => {
      if (e.target === exportSettingsDialog) {
        closeDialog();
      }
    };
  }

  /**
   * 执行导出操作
   * @param {string} fileName - 导出文件名
   * @param {boolean} includeChapterNames - 是否包含章节名
   * @param {boolean} preserveEmptyLines - 是否保留原空行
   */
  performExport(fileName, includeChapterNames, preserveEmptyLines) {
    // 获取文档内容
    let content = this.editor.value;

    // 根据用户设置处理内容
    if (!preserveEmptyLines) {
      // 移除连续空行，保留单空行分隔段落
      content = content.replace(/\s*\s*+/g, '');
    }

    // 如果有章节信息且用户选择包含章节名，按章节格式导出
    if (this.chapters.length > 0 && includeChapterNames) {
      content = this.formatContentWithChapters();
    }

    // 确保文件名以.txt结尾
    const exportFileName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;

    // 创建Blob对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    URL.revokeObjectURL(url);

    this.showMessage('TXT文件导出成功', 'success');
  }

  /**
   * 格式化带章节的内容
   */
  formatContentWithChapters() {
    let formattedContent = '';

    this.chapters.forEach((chapter, index) => {
      // 章节名前加换行（除了第一个章节）
      if (index > 0) {
        formattedContent += '';
      }

      // 添加章节标题
      formattedContent += chapter.title;

      // 章节标题后加换行
      formattedContent += '';

      // 添加章节内容
      formattedContent += chapter.content;
    });

    return formattedContent;
  }

  /**
   * 切换移动端菜单显示/隐藏
   */
  toggleMobileMenu() {
    if (this.chapterListPane && this.chapterListOverlay) {
      if (this.chapterListPane.classList.contains('mobile-open')) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    }
  }

  /**
   * 打开移动端菜单
   */
  openMobileMenu() {
    if (this.chapterListPane && this.chapterListOverlay) {
      this.chapterListPane.classList.add('mobile-open');
      this.chapterListOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
  }

  /**
   * 关闭移动端菜单
   */
  closeMobileMenu() {
    if (this.chapterListPane && this.chapterListOverlay) {
      this.chapterListPane.classList.remove('mobile-open');
      this.chapterListOverlay.classList.remove('active');
      document.body.style.overflow = ''; // 恢复背景滚动
    }
  }

  /**
   * 显示加载动画
   */
  showLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('active');
    }
  }

  /**
   * 隐藏加载动画
   */
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('active');
    }
  }

  /**
   * 显示消息提示
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 ('info', 'success', 'warning', 'error')
   */
  showMessage(message, type = 'info') {
    if (!this.messageContainer) return;

    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = `message-toast ${type}`;
    messageElement.textContent = message;

    // 添加到容器
    this.messageContainer.appendChild(messageElement);

    // 3秒后自动移除
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
  }

  /**
   * 滚动同步：高亮当前章节
   */
  highlightCurrentChapter() {
    if (!this.editor || !this.preview || this.chapters.length === 0) return;

    // 获取编辑器滚动位置
    const editorScrollTop = this.editor.scrollTop;
    const editorHeight = this.editor.clientHeight;
    
    // 计算当前可见区域
    const visibleStart = editorScrollTop;
    const visibleEnd = editorScrollTop + editorHeight;

    // 查找当前可见的章节
    let currentHighlightedChapter = -1;
    
    this.chapters.forEach((chapter, index) => {
      // 简单实现：根据章节在内容中的大致位置判断
      const content = this.editor.value;
      const chapterStart = content.indexOf(chapter.content);
      
      if (chapterStart >= 0) {
        // 估算章节在编辑器中的位置（简单实现）
        const estimatedPosition = (chapterStart / content.length) * this.editor.scrollHeight;
        
        if (estimatedPosition >= visibleStart && estimatedPosition <= visibleEnd) {
          currentHighlightedChapter = index;
        }
      }
    });

    // 更新章节高亮
    this.updateChapterHighlight(currentHighlightedChapter);
  }

  /**
   * 更新章节高亮状态
   * @param {number} chapterIndex - 要高亮的章节索引
   */
  updateChapterHighlight(chapterIndex) {
    if (!this.chapterList) return;

    // 移除所有高亮
    const chapterItems = this.chapterList.querySelectorAll('.chapter-item');
    chapterItems.forEach(item => {
      item.classList.remove('highlighted');
    });

    // 添加当前章节高亮
    if (chapterIndex >= 0 && chapterIndex < chapterItems.length) {
      chapterItems[chapterIndex].classList.add('highlighted');
    }
  }

  /**
   * 切换阅读模式
   */
  toggleReadingMode() {
    this.readingModeEnabled = !this.readingModeEnabled;
    
    if (this.readingModeEnabled) {
      this.showReadingModeSettings();
    } else {
      this.exitReadingMode();
    }
  }

  /**
   * 显示阅读模式设置
   */
  showReadingModeSettings() {
    const readingModeDialog = document.getElementById('readingModeDialog');
    const readingDialogClose = document.getElementById('readingDialogClose');
    const resetReadingSettings = document.getElementById('resetReadingSettings');
    const applyReadingSettings = document.getElementById('applyReadingSettings');
    
    if (!readingModeDialog || !readingDialogClose || !resetReadingSettings || !applyReadingSettings) {
      this.enterReadingMode();
      return;
    }

    // 设置当前值
    this.setReadingModeDialogValues();

    // 显示对话框
    readingModeDialog.hidden = false;

    // 添加事件监听
    const closeDialog = () => {
      readingModeDialog.hidden = true;
    };

    readingDialogClose.onclick = closeDialog;

    resetReadingSettings.onclick = () => {
      this.resetReadingSettings();
      this.setReadingModeDialogValues();
    };

    applyReadingSettings.onclick = () => {
      this.applyReadingSettings();
      closeDialog();
      this.enterReadingMode();
    };

    // 实时更新显示值
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const lineHeightInput = document.getElementById('lineHeight');
    const lineHeightValue = document.getElementById('lineHeightValue');

    if (fontSizeInput && fontSizeValue) {
      fontSizeInput.addEventListener('input', () => {
        fontSizeValue.textContent = `${fontSizeInput.value}px`;
      });
    }

    if (lineHeightInput && lineHeightValue) {
      lineHeightInput.addEventListener('input', () => {
        lineHeightValue.textContent = lineHeightInput.value;
      });
    }

    // 点击对话框外部关闭
    readingModeDialog.onclick = (e) => {
      if (e.target === readingModeDialog) {
        closeDialog();
      }
    };
  }

  /**
   * 设置阅读模式对话框的值
   */
  setReadingModeDialogValues() {
    const fontFamilySelect = document.getElementById('fontFamily');
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const lineHeightInput = document.getElementById('lineHeight');
    const lineHeightValue = document.getElementById('lineHeightValue');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const textColorInput = document.getElementById('textColor');

    if (fontFamilySelect) fontFamilySelect.value = this.readingSettings.fontFamily;
    if (fontSizeInput) fontSizeInput.value = parseInt(this.readingSettings.fontSize);
    if (fontSizeValue) fontSizeValue.textContent = this.readingSettings.fontSize;
    if (lineHeightInput) lineHeightInput.value = this.readingSettings.lineHeight;
    if (lineHeightValue) lineHeightValue.textContent = this.readingSettings.lineHeight;
    if (backgroundColorInput) backgroundColorInput.value = this.readingSettings.backgroundColor;
    if (textColorInput) textColorInput.value = this.readingSettings.textColor;
  }

  /**
   * 应用阅读模式设置
   */
  applyReadingSettings() {
    const fontFamilySelect = document.getElementById('fontFamily');
    const fontSizeInput = document.getElementById('fontSize');
    const lineHeightInput = document.getElementById('lineHeight');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const textColorInput = document.getElementById('textColor');

    if (fontFamilySelect) this.readingSettings.fontFamily = fontFamilySelect.value;
    if (fontSizeInput) this.readingSettings.fontSize = `${fontSizeInput.value}px`;
    if (lineHeightInput) this.readingSettings.lineHeight = lineHeightInput.value;
    if (backgroundColorInput) this.readingSettings.backgroundColor = backgroundColorInput.value;
    if (textColorInput) this.readingSettings.textColor = textColorInput.value;
  }

  /**
   * 重置阅读模式设置
   */
  resetReadingSettings() {
    this.readingSettings = {
      fontFamily: "'Microsoft YaHei', sans-serif",
      fontSize: "16px",
      lineHeight: "1.6",
      backgroundColor: "#f8f9fa",
      textColor: "#333333"
    };
  }

  /**
   * 进入阅读模式
   */
  enterReadingMode() {
    const editorSection = document.getElementById('editorSection');
    if (editorSection) {
      editorSection.classList.add('reading-mode');
    }

    // 应用CSS变量
    this.applyReadingModeStyles();

    // 更新按钮文本
    if (this.readingModeButton) {
      this.readingModeButton.textContent = '退出阅读';
    }

    this.showMessage('已进入阅读模式', 'success');
  }

  /**
   * 退出阅读模式
   */
  exitReadingMode() {
    const editorSection = document.getElementById('editorSection');
    if (editorSection) {
      editorSection.classList.remove('reading-mode');
    }

    // 移除CSS变量
    this.removeReadingModeStyles();

    // 更新按钮文本
    if (this.readingModeButton) {
      this.readingModeButton.textContent = '阅读模式';
    }

    this.showMessage('已退出阅读模式', 'info');
  }

  /**
   * 应用阅读模式CSS变量
   */
  applyReadingModeStyles() {
    const root = document.documentElement;
    root.style.setProperty('--reading-font-family', this.readingSettings.fontFamily);
    root.style.setProperty('--reading-font-size', this.readingSettings.fontSize);
    root.style.setProperty('--reading-line-height', this.readingSettings.lineHeight);
    root.style.setProperty('--reading-bg-color', this.readingSettings.backgroundColor);
    root.style.setProperty('--reading-text-color', this.readingSettings.textColor);
  }

  /**
   * 移除阅读模式CSS变量
   */
  removeReadingModeStyles() {
    const root = document.documentElement;
    root.style.removeProperty('--reading-font-family');
    root.style.removeProperty('--reading-font-size');
    root.style.removeProperty('--reading-line-height');
    root.style.removeProperty('--reading-bg-color');
    root.style.removeProperty('--reading-text-color');
  }

  /**
   * 任务1：本地保存功能 - 返回文档列表
   */
  backToDocuments() {
    const documentManagerSection = document.getElementById('documentManagerSection');
    const uploadSection = document.getElementById('uploadSection');
    const editorSection = document.getElementById('editorSection');

    if (documentManagerSection && uploadSection && editorSection) {
      documentManagerSection.style.display = 'block';
      uploadSection.style.display = 'none';
      editorSection.style.display = 'none';
    }
  }

  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 ('info', 'success', 'warning', 'error')
   */
  showMessage(message, type = 'info') {
    // 这里可以实现一个简单的消息提示
    console.log(`[${type.toUpperCase()}] ${message}`);

    // 如果您使用的是Bootstrap或其他UI框架，可以这样实现：
    // const notification = document.createElement('div');
    // notification.className = `alert alert-${type}`;
    // notification.textContent = message;
    // document.getElementById('notifications').appendChild(notification);

    // 3秒后自动消失
    // setTimeout(() => {
    //   notification.remove();
    // }, 3000);
  }
}

// 导出模块
window.TextEditor = TextEditor;
