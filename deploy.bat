@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Text Processor - GitHub Pages Deployment Script (Windows)
REM Usage: deploy.bat [GitHub username] [Repository name]

set "USERNAME=%~1"
if "%USERNAME%"=="" set "USERNAME=your-username"

set "REPO_NAME=%~2"
if "%REPO_NAME%"=="" set "REPO_NAME=TextProcessorApp"

echo ========================================
echo   Text Processor - GitHub Pages Deploy
echo ========================================
echo.

REM Check username
if "%USERNAME%"=="your-username" (
  set /p "input_username=Enter your GitHub username: "
  if "!input_username!"=="" (
    echo [ERROR] GitHub username is required
    pause
    exit /b 1
  )
  set "USERNAME=!input_username!"
)

echo [INFO] Will deploy to: https://github.com/%USERNAME%/%REPO_NAME%
echo.

REM Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Git is not installed, please install Git first
  pause
  exit /b 1
)
echo [INFO] Git is installed

REM Check if Git user info is set
git config --global user.name >nul 2>nul
if %errorlevel% neq 0 (
  echo [WARNING] Git user info is not set
  set /p "name=Enter your name: "
  set /p "email=Enter your email: "
  git config --global user.name "!name!"
  git config --global user.email "!email!"
  echo [INFO] Git user info has been set
)

REM Initialize Git repository
if not exist ".git" (
  echo [INFO] Initializing Git repository...
  git init
) else (
  echo [INFO] Git repository already exists
)

REM Add remote repository
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
  echo [INFO] Adding remote repository...
  git remote add origin "https://github.com/%USERNAME%/%REPO_NAME%.git"
) else (
  echo [INFO] Remote repository already exists
)

REM Add all files
echo [INFO] Adding files to Git...
git add .

REM Check if there are changes
git diff --cached --quiet >nul 2>nul
if %errorlevel% neq 0 (
  REM Commit changes
  echo [INFO] Committing changes...
  git commit -m "Initial commit - Text Processor Application"
  
  REM Push to GitHub
  echo [INFO] Pushing to GitHub...
  git push -u origin main
  if %errorlevel% neq 0 (
    echo [ERROR] Push failed, please check your GitHub credentials
    pause
    exit /b 1
  )
  echo [INFO] Code has been pushed to GitHub
) else (
  echo [WARNING] No changes to commit
)

REM Prompt to enable GitHub Pages
echo.
echo [INFO] Please manually enable GitHub Pages:
echo 1. Visit https://github.com/%USERNAME%/%REPO_NAME%/settings/pages
echo 2. In the Source section, select Deploy from a branch
echo 3. Select main branch and /(root) folder
echo 4. Click Save
echo.
set /p "continue=After completing the above steps, press Enter to continue..."

REM Display deployment result
echo.
echo [INFO] Deployment completed!
echo.
echo Your application will be available at the following URL in a few minutes:
echo https://%USERNAME%.github.io/%REPO_NAME%/
echo.
echo If you encounter problems, please check:
echo 1. If the repository is public (private repositories require GitHub Pro)
echo 2. If you have waited long enough for GitHub to complete deployment
echo 3. If the file structure is correct (index.html should be in the root directory)
echo.

pause