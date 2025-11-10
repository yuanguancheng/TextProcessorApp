# 文本处理器部署指南

本指南将帮助您将文本处理器项目部署到GitHub Pages，使您的应用可以通过互联网访问。

## 前置条件

1. 拥有一个GitHub账户
2. 已安装Git（如果需要本地操作）

## 部署步骤

### 方法一：通过GitHub网页界面部署（推荐）

1. **创建新仓库**
   - 登录GitHub账户
   - 点击右上角的"+"图标，选择"New repository"
   - 仓库名称填写：`text-processor`
   - 选择"Public"（公开）或"Private"（私有）
   - 勾选"Add a README file"
   - 点击"Create repository"

2. **上传项目文件**
   - 在新创建的仓库页面，点击"Add file"按钮，选择"Upload files"
   - 将项目中的所有文件和文件夹拖拽到上传区域
   - 确保包含以下文件和文件夹：
     ```
     index.html
     guide.html
     css/
     js/
     assets/
     ```
   - 在"Commit changes"区域填写提交信息，如"Initial commit"
   - 点击"Commit changes"完成上传

3. **启用GitHub Pages**
   - 在仓库页面，点击"Settings"选项卡
   - 在左侧菜单中找到"Pages"选项
   - 在"Source"部分，选择"Deploy from a branch"
   - 在"Branch"下拉菜单中选择"main"分支
   - 文件夹选择"/ (root)"
   - 点击"Save"保存设置

4. **访问您的应用**
   - 等待几分钟让GitHub完成部署
   - 在Pages设置页面会显示您的网站URL，格式为：`https://[您的用户名].github.io/text-processor/`
   - 点击此链接即可访问您的文本处理器应用

### 方法二：通过Git命令行部署

1. **克隆仓库到本地**
   ```bash
   git clone https://github.com/[您的用户名]/text-processor.git
   cd text-processor
   ```

2. **复制项目文件**
   - 将项目中的所有文件和文件夹复制到克隆的仓库目录中

3. **提交并推送更改**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. **启用GitHub Pages**
   - 按照方法一中的步骤3启用GitHub Pages

## 自定义域名（可选）

如果您想使用自定义域名，可以按照以下步骤操作：

1. **在仓库中添加CNAME文件**
   - 在仓库根目录创建一个名为`CNAME`的文件
   - 文件内容为您的域名，例如：`www.yourdomain.com`
   - 提交此文件到仓库

2. **配置DNS**
   - 登录您的域名提供商
   - 添加以下DNS记录：
     - 类型：CNAME
     - 名称：www（或您的子域名）
     - 值：[您的用户名].github.io
     - TTL：自动或默认值

3. **在GitHub中配置**
   - 在仓库的Settings > Pages中，您会看到自定义域名选项
   - 输入您的域名并保存

## 故障排除

### 页面显示404错误

1. 检查仓库名称是否正确
2. 确保已启用GitHub Pages
3. 检查文件路径是否正确，特别是`index.html`是否在根目录

### 样式或脚本不加载

1. 检查CSS和JS文件的路径是否正确
2. 确保所有文件都已上传到仓库
3. 检查文件名大小写是否匹配（GitHub Pages区分大小写）

### 功能无法正常工作

1. 检查浏览器控制台是否有错误信息
2. 确保所有JavaScript文件都已正确加载
3. 某些功能可能需要HTTPS环境，确保通过HTTPS访问

## 更新应用

当您需要更新应用时：

1. 修改本地文件
2. 提交并推送更改到GitHub：
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```
3. GitHub会自动更新部署的网站

## 性能优化建议

1. **压缩资源**
   - 使用工具压缩CSS和JavaScript文件
   - 优化图片大小

2. **启用缓存**
   - 在HTML中添加缓存控制头
   - 使用Service Worker缓存静态资源

3. **使用CDN**
   - 考虑使用CDN加速静态资源加载

## 安全注意事项

1. **输入验证**
   - 确保所有用户输入都经过适当验证
   - 防止XSS攻击

2. **HTTPS**
   - GitHub Pages自动提供HTTPS
   - 确保所有资源都通过HTTPS加载

3. **敏感信息**
   - 不要在前端代码中存储敏感信息
   - 使用环境变量管理配置

## 其他部署选项

除了GitHub Pages，您还可以考虑以下平台：

1. **Netlify**
   - 提供更快的构建和部署
   - 支持表单处理和函数

2. **Vercel**
   - 优秀的性能和全球CDN
   - 支持无服务器函数

3. **Firebase Hosting**
   - Google提供的托管服务
   - 与其他Firebase服务集成良好

这些平台通常提供类似的拖拽上传或Git集成部署方式。