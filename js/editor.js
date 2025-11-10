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
