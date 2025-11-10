/**
 * 文本编辑器类 - 任务3：章节列表展示与跳转
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

    // 章节数据
    this.chapters = [];
    this.currentChapter = null;

    // 初始化事件监听
    this.initEventListeners();
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

    // 编辑器滚动事件，用于高亮当前章节
    if (this.editor) {
      this.editor.addEventListener('scroll', () => this.highlightCurrentChapter());
    }

    // 预览区滚动事件，用于高亮当前章节
    if (this.preview) {
      this.preview.addEventListener('scroll', () => this.highlightCurrentChapter());
    }
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

      // 章节序号
      const chapterNumber = document.createElement('span');
      chapterNumber.className = 'chapter-number';
      chapterNumber.textContent = `${index + 1}.`;

      // 章节标题
      const chapterTitle = document.createElement('span');
      chapterTitle.className = 'chapter-title';
      chapterTitle.textContent = chapter.title;

      // 折叠/展开按钮（仅当章节内容较长时显示）
      const chapterToggle = document.createElement('span');
      chapterToggle.className = 'chapter-toggle';
      chapterToggle.textContent = '▼';
      chapterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleChapter(index);
      });

      // 组装元素
      li.appendChild(chapterNumber);
      li.appendChild(chapterTitle);
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

  /**
   * 将章节内容分成几个部分
   * @param {string} content - 章节内容
   * @param {number} sectionCount - 要分成的段落数
   * @returns {Array} - 段落数组
   */
  splitChapterIntoSections(content, sectionCount) {
    if (!content || content.length <= 1000) {
      return [content];
    }

    const sectionLength = Math.floor(content.length / sectionCount);
    const sections = [];

    for (let i = 0; i < sectionCount; i++) {
      const start = i * sectionLength;
      const end = i === sectionCount - 1 ? content.length : (i + 1) * sectionLength;
      sections.push(content.substring(start, end));
    }

    return sections;
  }

  /**
   * 跳转到指定章节
   * @param {number} chapterIndex - 章节索引
   */
  jumpToChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= this.chapters.length) {
      return;
    }

    const chapter = this.chapters[chapterIndex];
    this.currentChapter = chapterIndex;

    // 更新章节列表中的活动状态
    this.updateActiveChapter(chapterIndex);

    // 在编辑器中滚动到章节位置
    if (this.editor) {
      this.editor.focus();
      this.editor.setSelectionRange(chapter.startPosition, chapter.startPosition);

      // 计算滚动位置
      const lineHeight = parseInt(window.getComputedStyle(this.editor).lineHeight) || 21;
      const lines = this.editor.value.substring(0, chapter.startPosition).split('\n').length;
      const scrollTop = (lines - 1) * lineHeight;

      // 滚动到指定位置
      this.editor.scrollTop = scrollTop;
    }

    // 在预览区中滚动到章节位置
    if (this.preview) {
      // 预览区中的位置计算比较复杂，这里简化处理
      const previewContent = this.preview.textContent;
      const chapterPreviewStart = previewContent.indexOf(chapter.content.substring(0, 50));

      if (chapterPreviewStart !== -1) {
        // 简单估算滚动位置
        const previewLineHeight = parseInt(window.getComputedStyle(this.preview).lineHeight) || 21;
        const lines = previewContent.substring(0, chapterPreviewStart).split('\n').length;
        const scrollTop = (lines - 1) * previewLineHeight;

        this.preview.scrollTop = scrollTop;
      }
    }
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

    // 计算段落在章节中的起始位置
    let sectionStartPos = chapter.startPosition;
    for (let i = 0; i < sectionIndex; i++) {
      sectionStartPos += sections[i].length;
    }

    // 在编辑器中滚动到段落位置
    if (this.editor) {
      this.editor.focus();
      this.editor.setSelectionRange(sectionStartPos, sectionStartPos);

      // 计算滚动位置
      const lineHeight = parseInt(window.getComputedStyle(this.editor).lineHeight) || 21;
      const lines = this.editor.value.substring(0, sectionStartPos).split('\n').length;
      const scrollTop = (lines - 1) * lineHeight;

      // 滚动到指定位置
      this.editor.scrollTop = scrollTop;
    }
  }

  /**
   * 更新章节列表中的活动状态
   * @param {number} chapterIndex - 章节索引
   */
  updateActiveChapter(chapterIndex) {
    // 移除所有活动状态
    const allItems = this.chapterList.querySelectorAll('.chapter-item, .sub-chapter-item');
    allItems.forEach(item => item.classList.remove('active'));

    // 添加当前章节的活动状态
    const currentItem = this.chapterList.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);
    if (currentItem) {
      currentItem.classList.add('active');
    }
  }

  /**
   * 高亮当前章节（基于滚动位置）
   */
  highlightCurrentChapter() {
    if (!this.editor || this.chapters.length === 0) {
      return;
    }

    // 获取当前滚动位置
    const scrollTop = this.editor.scrollTop;
    const lineHeight = parseInt(window.getComputedStyle(this.editor).lineHeight) || 21;
    const currentLine = Math.floor(scrollTop / lineHeight);

    // 计算当前光标位置
    const textBeforeCursor = this.editor.value.substring(0, this.editor.selectionStart);
    const currentLineInText = textBeforeCursor.split('\n').length;

    // 查找当前所在的章节
    let currentChapterIndex = -1;
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];
      const chapterStartLine = this.editor.value.substring(0, chapter.startPosition).split('\n').length;

      if (chapterStartLine <= currentLineInText) {
        currentChapterIndex = i;
      } else {
        break;
      }
    }

    // 更新活动章节
    if (currentChapterIndex !== -1 && currentChapterIndex !== this.currentChapter) {
      this.currentChapter = currentChapterIndex;
      this.updateActiveChapter(currentChapterIndex);
    }
  }

  /**
   * 折叠/展开章节
   * @param {number} chapterIndex - 章节索引
   */
  toggleChapter(chapterIndex) {
    const subList = document.getElementById(`chapter-sub-list-${chapterIndex}`);
    const toggle = document.querySelector(`.chapter-item[data-index="${chapterIndex}"] .chapter-toggle`);

    if (subList && toggle) {
      if (subList.classList.contains('expanded')) {
        subList.classList.remove('expanded');
        toggle.classList.add('collapsed');
        toggle.textContent = '▶';
      } else {
        subList.classList.add('expanded');
        toggle.classList.remove('collapsed');
        toggle.textContent = '▼';
      }
    }
  }

  /**
   * 展开所有章节
   */
  expandAllChapters() {
    const subLists = document.querySelectorAll('.chapter-sub-list');
    const toggles = document.querySelectorAll('.chapter-toggle');

    subLists.forEach(list => list.classList.add('expanded'));
    toggles.forEach(toggle => {
      toggle.classList.remove('collapsed');
      toggle.textContent = '▼';
    });
  }

  /**
   * 折叠所有章节
   */
  collapseAllChapters() {
    const subLists = document.querySelectorAll('.chapter-sub-list');
    const toggles = document.querySelectorAll('.chapter-toggle');

    subLists.forEach(list => list.classList.remove('expanded'));
    toggles.forEach(toggle => {
      toggle.classList.add('collapsed');
      toggle.textContent = '▶';
    });
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
