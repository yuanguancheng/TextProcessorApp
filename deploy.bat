@echo off
REM 文本处理器 - GitHub Pages 部署脚本 (Windows版本)
REM 使用方法: deploy.bat [GitHub用户名] [仓库名称]

setlocal enabledelayedexpansion

REM 默认值
set "USERNAME=%~1"
if "%USERNAME%"=="" set "USERNAME=your-username"

set "REPO_NAME=%~2"
if "%REPO_NAME%"=="" set "REPO_NAME=text-processor"

echo ========================================
echo   文本处理器 - GitHub Pages 部署脚本
echo ========================================
echo.

REM 检查用户名
if "%USERNAME%"=="your-username" (
  set /p "input_username=请输入您的GitHub用户名: "
  if "!input_username!"=="" (
    echo [ERROR] 必须提供GitHub用户名
    pause
    exit /b 1
  )
  set "USERNAME=!input_username!"
)

echo [INFO] 将部署到: https://github.com/%USERNAME%/%REPO_NAME%
echo.

REM 检查Git是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Git未安装，请先安装Git
  pause
  exit /b 1
)
echo [INFO] Git已安装

REM 检查是否已设置Git用户信息
git config --global user.name >nul 2>nul
if %errorlevel% neq 0 (
  echo [WARNING] 未设置Git用户信息
  set /p "name=请输入您的姓名: "
  set /p "email=请输入您的邮箱: "
  git config --global user.name "!name!"
  git config --global user.email "!email!"
  echo [INFO] Git用户信息已设置
)

REM 初始化Git仓库
if not exist ".git" (
  echo [INFO] 初始化Git仓库...
  git init
) else (
  echo [INFO] Git仓库已存在
)

REM 添加远程仓库
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
  echo [INFO] 添加远程仓库...
  git remote add origin "https://github.com/%USERNAME%/%REPO_NAME%.git"
) else (
  echo [INFO] 远程仓库已存在
)

REM 添加所有文件
echo [INFO] 添加文件到Git...
git add .

REM 检查是否有更改
git diff --cached --quiet >nul 2>nul
if %errorlevel% neq 0 (
  REM 提交更改
  echo [INFO] 提交更改...
  git commit -m "Initial commit - Text Processor Application"
  
  REM 推送到GitHub
  echo [INFO] 推送到GitHub...
  git push -u origin main
  if %errorlevel% neq 0 (
    echo [ERROR] 推送失败，请检查您的GitHub凭据
    pause
    exit /b 1
  )
  echo [INFO] 代码已推送到GitHub
) else (
  echo [WARNING] 没有更改需要提交
)

REM 提示启用GitHub Pages
echo.
echo [INFO] 请手动启用GitHub Pages:
echo 1. 访问 https://github.com/%USERNAME%/%REPO_NAME%/settings/pages
echo 2. 在Source部分，选择Deploy from a branch
echo 3. 选择main分支和/(root)文件夹
echo 4. 点击Save
echo.
set /p "continue=完成上述步骤后，按Enter键继续..."

REM 显示部署结果
echo.
echo [INFO] 部署完成！
echo.
echo 您的应用将在几分钟内可通过以下URL访问：
echo https://%USERNAME%.github.io/%REPO_NAME%/
echo.
echo 如果遇到问题，请检查：
echo 1. 仓库是否为公开（私有仓库需要升级到GitHub Pro）
echo 2. 是否等待足够时间让GitHub完成部署
echo 3. 文件结构是否正确（index.html应在根目录）
echo.

pause