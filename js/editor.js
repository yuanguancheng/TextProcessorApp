/**
 * 文本编辑器类 - 任务1：章节基础编辑
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

    // 章节数据
    this.chapters = [];
    this.currentChapter = null;
    this.selectedChapters = new Set(); // 用于存储选中的章节
    this.editingChapter = null; // 当前正在编辑的章节索引

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
   * 任务1：开始编辑章节标题
   * @param {number} chapterIndex - 章节索引
   */
  startEditChapterTitle(chapterIndex) {
    // 如果已经有章节在编辑，先保存
    if (this.editingChapter !== null && this.editingChapter !== chapterIndex) {
      this.saveChapterTitle(this.editingChapter);
    }

    // 设置当前编辑的章节
    this.editingChapter = chapterIndex;

    // 获取相关元素
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);
    const chapterTitle = document.getElementById(`chapter-title-${chapterIndex}`);
    const chapterTitleInput = document.getElementById(`chapter-title-input-${chapterIndex}`);
    const editButton = document.getElementById(`chapter-edit-${chapterIndex}`);

    // 切换显示状态
    chapterTitle.style.display = 'none';
    chapterTitleInput.style.display = 'block';
    editButton.style.display = 'none';

    // 添加编辑状态样式
    chapterItem.classList.add('editing');

    // 聚焦输入框并选中文本
    chapterTitleInput.focus();
    chapterTitleInput.select();
  }

  /**
   * 任务1：保存章节标题
   * @param {number} chapterIndex - 章节索引
   */
  saveChapterTitle(chapterIndex) {
    if (this.editingChapter !== chapterIndex) {
      return;
    }

    // 获取相关元素
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);
    const chapterTitle = document.getElementById(`chapter-title-${chapterIndex}`);
    const chapterTitleInput = document.getElementById(`chapter-title-input-${chapterIndex}`);
    const editButton = document.getElementById(`chapter-edit-${chapterIndex}`);

    // 获取新标题
    const newTitle = chapterTitleInput.value.trim();

    // 如果标题为空，恢复原标题
    if (!newTitle) {
      chapterTitleInput.value = chapterTitle.textContent;
      this.cancelEditChapterTitle(chapterIndex);
      return;
    }

    // 如果标题没有变化，直接取消编辑
    if (newTitle === chapterTitle.textContent) {
      this.cancelEditChapterTitle(chapterIndex);
      return;
    }

    // 更新章节数据
    const oldTitle = this.chapters[chapterIndex].title;
    this.chapters[chapterIndex].title = newTitle;

    // 更新编辑器中的章节标题
    const content = this.editor.value;
    const chapter = this.chapters[chapterIndex];
    const oldTitlePattern = new RegExp(oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(oldTitlePattern, newTitle);
    this.editor.value = newContent;

    // 更新显示
    chapterTitle.textContent = newTitle;

    // 切换显示状态
    chapterTitle.style.display = 'block';
    chapterTitleInput.style.display = 'none';
    editButton.style.display = 'inline-block';

    // 移除编辑状态样式
    chapterItem.classList.remove('editing');

    // 清除当前编辑状态
    this.editingChapter = null;

    // 显示成功消息
    this.showMessage(`章节标题已更新: "${newTitle}"`, 'success');
  }

  /**
   * 任务1：取消编辑章节标题
   * @param {number} chapterIndex - 章节索引
   */
  cancelEditChapterTitle(chapterIndex) {
    if (this.editingChapter !== chapterIndex) {
      return;
    }

    // 获取相关元素
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);
    const chapterTitle = document.getElementById(`chapter-title-${chapterIndex}`);
    const chapterTitleInput = document.getElementById(`chapter-title-input-${chapterIndex}`);
    const editButton = document.getElementById(`chapter-edit-${chapterIndex}`);

    // 恢复输入框的值
    chapterTitleInput.value = chapterTitle.textContent;

    // 切换显示状态
    chapterTitle.style.display = 'block';
    chapterTitleInput.style.display = 'none';
    editButton.style.display = 'inline-block';

    // 移除编辑状态样式
    chapterItem.classList.remove('editing');

    // 清除当前编辑状态
    this.editingChapter = null;
  }

  /**
   * 任务1：删除章节
   * @param {number} chapterIndex - 章节索引
   */
  deleteChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= this.chapters.length) {
      return;
    }

    const chapter = this.chapters[chapterIndex];

    // 显示删除确认对话框
    this.showDeleteChapterDialog(chapterIndex, chapter.title);
  }

  /**
   * 任务1：显示删除章节确认对话框
   * @param {number} chapterIndex - 章节索引
   * @param {string} chapterTitle - 章节标题
   */
  showDeleteChapterDialog(chapterIndex, chapterTitle) {
    // 创建对话框元素
    const dialog = document.createElement('div');
    dialog.className = 'chapter-delete-dialog';
    dialog.id = 'chapter-delete-dialog';

    // 创建对话框内容
    const dialogContent = document.createElement('div');
    dialogContent.className = 'chapter-delete-dialog-content';

    // 创建对话框头部
    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'chapter-delete-dialog-header';
    dialogHeader.innerHTML = '<h3>确认删除章节</h3>';

    // 创建对话框主体
    const dialogBody = document.createElement('div');
    dialogBody.className = 'chapter-delete-dialog-body';
    dialogBody.textContent = `确定要删除章节 "${chapterTitle}" 吗？此操作不可撤销。`;

    // 创建对话框底部按钮
    const dialogFooter = document.createElement('div');
    dialogFooter.className = 'chapter-delete-dialog-footer';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'chapter-delete-dialog-button cancel';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    const confirmButton = document.createElement('button');
    confirmButton.className = 'chapter-delete-dialog-button confirm';
    confirmButton.textContent = '删除';
    confirmButton.addEventListener('click', () => {
      this.confirmDeleteChapter(chapterIndex);
      document.body.removeChild(dialog);
    });

    // 组装对话框
    dialogFooter.appendChild(cancelButton);
    dialogFooter.appendChild(confirmButton);

    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(dialogBody);
    dialogContent.appendChild(dialogFooter);

    dialog.appendChild(dialogContent);

    // 添加到页面
    document.body.appendChild(dialog);

    // 点击对话框外部关闭
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });
  }

  /**
   * 任务1：确认删除章节
   * @param {number} chapterIndex - 章节索引
   */
  confirmDeleteChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= this.chapters.length) {
      return;
    }

    const chapter = this.chapters[chapterIndex];

    // 从编辑器中移除章节内容
    const content = this.editor.value;
    const newContent = content.substring(0, chapter.startPosition) +
      content.substring(chapter.endPosition);
    this.editor.value = newContent;

    // 从章节数据中移除章节
    this.chapters.splice(chapterIndex, 1);

    // 重新显示章节列表
    this.displayChapterList();

    // 显示成功消息
    this.showMessage(`章节 "${chapter.title}" 已删除`, 'success');
  }

  /**
   * 任务4：应用自定义规则
   */
  applyCustomRule() {
    const ruleText = this.customRuleInput.value.trim();

    if (!ruleText) {
      this.showMessage('请输入自定义规则', 'warning');
      return;
    }

    const content = this.editor.value;

    if (!content.trim()) {
      this.showMessage('请先输入文本内容', 'warning');
      return;
    }

    try {
      // 创建章节检测器实例
      const chapterDetector = new ChapterDetector();

      // 判断是关键词还是正则表达式
      let pattern;
      if (ruleText.startsWith('/') && ruleText.endsWith('/')) {
        // 正则表达式
        const regexParts = ruleText.slice(1, -1).split(':');
        const flags = regexParts.length > 1 ? regexParts[1] : 'g';
        pattern = new RegExp(regexParts[0], flags);
      } else {
        // 关键词，转换为正则表达式
        pattern = new RegExp(ruleText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      }

      // 创建临时规则
      const tempRule = {
        name: "自定义规则",
        pattern: pattern,
        priority: 100, // 设置高优先级
        description: `用户自定义规则: ${ruleText}`
      };

      // 添加临时规则到规则库
      chapterDetector.addRule(tempRule);

      // 使用自定义规则进行分章
      const result = chapterDetector.performAutoChapterDivision(content);

      // 更新章节数据
      this.chapters = result.chapters;

      // 显示章节列表
      this.displayChapterList();

      // 显示结果
      if (result.chapters.length > 0) {
        this.showMessage(`使用自定义规则成功分章，共 ${result.chapters.length} 个章节`, 'success');
      } else {
        this.showMessage('自定义规则未匹配到任何章节', 'warning');
      }

      // 移除临时规则
      chapterDetector.removeRule("自定义规则");

    } catch (error) {
      this.showMessage(`应用自定义规则时出错: ${error.message}`, 'error');
    }
  }

  /**
   * 任务4：拆分章节
   */
  splitChapter() {
    if (this.chapters.length === 0) {
      this.showMessage('请先进行章节检测', 'warning');
      return;
    }

    // 获取当前光标位置
    const cursorPosition = this.editor.selectionStart;

    // 查找光标所在的章节
    let currentChapterIndex = -1;
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];
      if (cursorPosition >= chapter.startPosition && cursorPosition <= chapter.endPosition) {
        currentChapterIndex = i;
        break;
      }
    }

    if (currentChapterIndex === -1) {
      this.showMessage('请将光标放在要拆分的章节内', 'warning');
      return;
    }

    const currentChapter = this.chapters[currentChapterIndex];

    // 如果光标在章节开头或结尾，不允许拆分
    if (cursorPosition <= currentChapter.startPosition || cursorPosition >= currentChapter.endPosition - 10) {
      this.showMessage('光标位置不适合拆分章节', 'warning');
      return;
    }

    // 确认拆分
    if (!confirm(`确定要在当前位置拆分章节 "${currentChapter.title}" 吗？`)) {
      return;
    }

    // 获取拆分点前后的内容
    const beforeContent = this.editor.value.substring(currentChapter.startPosition, cursorPosition);
    const afterContent = this.editor.value.substring(cursorPosition, currentChapter.endPosition);

    // 创建新章节标题
    const newChapterTitle = prompt('请输入新章节的标题:', `${currentChapter.title} (续)`);
    if (!newChapterTitle) {
      return;
    }

    // 在编辑器中插入新章节标题
    const newChapterText = `\n${newChapterTitle}\n`;
    this.editor.value =
      this.editor.value.substring(0, cursorPosition) +
      newChapterText +
      this.editor.value.substring(cursorPosition);

    // 重新检测章节
    this.detectChapters();

    this.showMessage('章节拆分成功', 'success');
  }

  /**
   * 任务4：合并章节
   */
  mergeChapters() {
    if (this.chapters.length === 0) {
      this.showMessage('请先进行章节检测', 'warning');
      return;
    }

    if (this.selectedChapters.size < 2) {
      this.showMessage('请选择至少两个章节进行合并', 'warning');
      return;
    }

    // 将选中的章节索引转换为数组并排序
    const selectedIndices = Array.from(this.selectedChapters).sort((a, b) => a - b);

    // 确认合并
    const chapterTitles = selectedIndices.map(i => this.chapters[i].title).join('、');
    if (!confirm(`确定要合并以下章节吗？\n${chapterTitles}`)) {
      return;
    }

    // 获取第一个章节（保留其标题）
    const firstChapter = this.chapters[selectedIndices[0]];

    // 合并章节内容
    let mergedContent = firstChapter.content;
    for (let i = 1; i < selectedIndices.length; i++) {
      const chapter = this.chapters[selectedIndices[i]];
      // 移除章节标题，只保留内容
      const contentWithoutTitle = chapter.content.replace(new RegExp(`^${chapter.title}\\s*[:：]?\\s*`), '');
      mergedContent += '\n\n' + contentWithoutTitle;
    }

    // 计算合并后的章节位置
    const startPosition = firstChapter.startPosition;
    const endPosition = this.chapters[selectedIndices[selectedIndices.length - 1]].endPosition;

    // 在编辑器中替换内容
    this.editor.value =
      this.editor.value.substring(0, startPosition) +
      firstChapter.title + '\n' +
      mergedContent +
      this.editor.value.substring(endPosition);

    // 清空选中状态
    this.selectedChapters.clear();

    // 重新检测章节
    this.detectChapters();

    this.showMessage('章节合并成功', 'success');
  }

  /**
   * 任务4：切换章节选择状态
   * @param {number} chapterIndex - 章节索引
   */
  toggleChapterSelection(chapterIndex) {
    const chapterItem = this.chapterList.querySelector(`.chapter-item[data-index="${chapterIndex}"]`);
    const checkbox = chapterItem.querySelector('.chapter-checkbox');

    if (this.selectedChapters.has(chapterIndex)) {
      this.selectedChapters.delete(chapterIndex);
      chapterItem.classList.remove('selected');
      checkbox.checked = false;
    } else {
      this.selectedChapters.add(chapterIndex);
      chapterItem.classList.add('selected');
      checkbox.checked = true;
    }

    // 更新合并按钮状态
    this.mergeChaptersButton.disabled = this.selectedChapters.size < 2;
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
