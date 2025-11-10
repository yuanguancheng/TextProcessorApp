#!/bin/bash

# 文本处理器 - GitHub Pages 部署脚本
# 使用方法: ./deploy.sh [GitHub用户名] [仓库名称]

# 默认值
USERNAME=${1:-"your-username"}
REPO_NAME=${2:-"text-processor"}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Git是否安装
check_git() {
  if ! command -v git &> /dev/null; then
    print_error "Git未安装，请先安装Git"
    exit 1
  fi
  print_message "Git已安装"
}

# 检查是否已登录GitHub
check_github_auth() {
  if ! git config --global user.name &> /dev/null || ! git config --global user.email &> /dev/null; then
    print_warning "未设置Git用户信息，请设置："
    echo "git config --global user.name 'Your Name'"
    echo "git config --global user.email 'your.email@example.com'"
    read -p "是否现在设置？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      read -p "请输入您的姓名: " name
      read -p "请输入您的邮箱: " email
      git config --global user.name "$name"
      git config --global user.email "$email"
      print_message "Git用户信息已设置"
    else
      print_error "请设置Git用户信息后再运行此脚本"
      exit 1
    fi
  fi
}

# 创建GitHub仓库
create_repo() {
  print_message "检查GitHub仓库是否存在..."
  
  # 检查仓库是否已存在
  if git ls-remote "https://github.com/$USERNAME/$REPO_NAME.git" &> /dev/null; then
    print_warning "仓库已存在，将跳过创建步骤"
    return 0
  fi
  
  print_message "创建GitHub仓库..."
  
  # 使用GitHub CLI创建仓库（如果已安装）
  if command -v gh &> /dev/null; then
    gh repo create $USERNAME/$REPO_NAME --public --clone=false
    print_message "使用GitHub CLI创建仓库成功"
  else
    print_warning "GitHub CLI未安装，请手动创建仓库："
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名称: $REPO_NAME"
    echo "3. 选择Public或Private"
    echo "4. 不要添加README、.gitignore或license（我们已有这些文件）"
    echo "5. 点击Create repository"
    read -p "按Enter键继续..."
  fi
}

# 初始化Git仓库
init_git() {
  print_message "初始化Git仓库..."
  
  # 初始化仓库（如果尚未初始化）
  if [ ! -d ".git" ]; then
    git init
    print_message "Git仓库已初始化"
  else
    print_message "Git仓库已存在"
  fi
  
  # 添加远程仓库（如果尚未添加）
  if ! git remote get-url origin &> /dev/null; then
    git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"
    print_message "远程仓库已添加"
  else
    print_message "远程仓库已存在"
  fi
}

# 提交并推送代码
commit_and_push() {
  print_message "提交并推送代码..."
  
  # 添加所有文件
  git add .
  
  # 检查是否有更改
  if git diff --cached --quiet; then
    print_warning "没有更改需要提交"
  else
    # 提交更改
    git commit -m "Initial commit - Text Processor Application"
    
    # 推送到GitHub
    git push -u origin main
    
    print_message "代码已推送到GitHub"
  fi
}

# 启用GitHub Pages
enable_pages() {
  print_message "启用GitHub Pages..."
  
  # 使用GitHub CLI启用Pages（如果已安装）
  if command -v gh &> /dev/null; then
    gh api repos/$USERNAME/$REPO_NAME/pages -X POST -f source[branch]=main -f source[path]="/"
    print_message "GitHub Pages已启用"
  else
    print_warning "请手动启用GitHub Pages："
    echo "1. 访问 https://github.com/$USERNAME/$REPO_NAME/settings/pages"
    echo "2. 在Source部分，选择Deploy from a branch"
    echo "3. 选择main分支和/(root)文件夹"
    echo "4. 点击Save"
    read -p "按Enter键继续..."
  fi
}

# 显示部署结果
show_result() {
  print_message "部署完成！"
  echo ""
  echo "您的应用将在几分钟内可通过以下URL访问："
  echo -e "${GREEN}https://$USERNAME.github.io/$REPO_NAME/${NC}"
  echo ""
  echo "如果遇到问题，请检查："
  echo "1. 仓库是否为公开（私有仓库需要升级到GitHub Pro）"
  echo "2. 是否等待足够时间让GitHub完成部署"
  echo "3. 文件结构是否正确（index.html应在根目录）"
}

# 主函数
main() {
  echo "========================================"
  echo "  文本处理器 - GitHub Pages 部署脚本"
  echo "========================================"
  echo ""
  
  # 检查参数
  if [ "$USERNAME" = "your-username" ]; then
    read -p "请输入您的GitHub用户名: " input_username
    if [ -n "$input_username" ]; then
      USERNAME=$input_username
    else
      print_error "必须提供GitHub用户名"
      exit 1
    fi
  fi
  
  print_message "将部署到: https://github.com/$USERNAME/$REPO_NAME"
  echo ""
  
  # 执行部署步骤
  check_git
  check_github_auth
  create_repo
  init_git
  commit_and_push
  enable_pages
  show_result
}

# 运行主函数
main