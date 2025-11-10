# 文本处理器

一个功能强大的在线文本处理工具，支持智能分章、内容优化和多格式导出。

## 功能特点

- 📁 **多格式支持**：支持UTF-8、GBK、ANSI等多种编码格式
- 🧩 **智能分章**：自动识别章节格式，支持手动调整
- 🛠️ **内容优化**：去除空行、优化缩进等文本处理功能
- 💾 **本地保存**：支持本地存储和自动保存
- 📱 **响应式设计**：完美适配桌面和移动设备
- 📖 **阅读模式**：自定义阅读体验，专注内容
- 🔄 **兼容性测试**：检测浏览器兼容性，确保最佳体验
- ⚡ **性能优化**：针对大文件优化，流畅处理

## 快速开始

### 在线使用

访问 [GitHub Pages](https://[您的用户名].github.io/text-processor/) 直接使用文本处理器。

### 本地部署

1. 克隆仓库：
   ```bash
   git clone https://github.com/[您的用户名]/text-processor.git
   cd text-processor
   ```

2. 使用本地服务器运行：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve .
   ```

3. 在浏览器中访问 `http://localhost:8000`

## 使用指南

### 上传文件

1. 点击上传区域或拖拽文件到上传区域
2. 系统会自动检测文件编码和格式
3. 点击"开始处理"进入编辑界面

### 分章处理

1. 系统会自动检测章节格式并进行分章
2. 如需调整，可使用手动分章工具：
   - 自定义规则：输入自定义章节格式
   - 拆分章节：将当前章节拆分为多个章节
   - 合并章节：将多个章节合并为一个章节

### 导出文件

1. 点击工具栏中的"导出TXT文件"按钮
2. 配置导出选项：
   - 设置文件名
   - 选择是否包含章节名
   - 选择是否保留原空行
3. 点击"导出"完成下载

详细使用说明请参考 [使用指南](guide.html)。

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **存储**：IndexedDB, LocalStorage
- **样式**：CSS Grid, Flexbox, CSS Variables
- **兼容性**：Chrome, Firefox, Safari, Edge, 移动端浏览器

## 项目结构

```
text-processor/
├── index.html          # 主页面
├── guide.html          # 使用指南
├── README.md           # 项目说明
├── DEPLOYMENT.md       # 部署指南
├── css/                # 样式文件
│   ├── main.css        # 主样式
│   ├── upload.css      # 上传界面样式
│   └── editor.css      # 编辑器样式
├── js/                 # JavaScript文件
│   ├── app.js          # 应用入口
│   ├── fileHandler.js  # 文件处理
│   ├── chapterDetector.js # 章节检测
│   ├── storage.js      # 存储管理
│   ├── editor.js       # 编辑器功能
│   ├── testCases.js    # 测试用例
│   ├── testRunner.js   # 测试执行器
│   ├── compatibilityTest.js # 兼容性测试
│   └── optimizationEngine.js # 优化引擎
└── assets/             # 资源文件
    └── images/         # 图片资源
```

## 部署

### GitHub Pages部署

1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支和文件夹
4. 访问生成的URL

详细部署说明请参考 [部署指南](DEPLOYMENT.md)。

## 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 12+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| IE | 11 | ⚠️ 部分支持 |

## 贡献

欢迎提交问题报告和功能请求！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0 (2023-11-10)

- ✨ 初始版本发布
- 📁 支持多种文件编码格式
- 🧩 智能章节检测和分章
- 🛠️ 内容优化工具
- 💾 本地保存和自动保存
- 📱 响应式设计
- 📖 阅读模式
- 🔄 兼容性测试
- ⚡ 性能优化
- 📚 使用指南

## 支持

如果您在使用过程中遇到问题，请：

1. 查看 [使用指南](guide.html)
2. 运行兼容性测试检查浏览器支持情况
3. 提交 [Issue](https://github.com/[您的用户名]/text-processor/issues)

---

**文本处理器** - 让文本处理更简单、更高效！