@echo off
REM PromptVow VSCode扩展 - 推送到GitHub仓库脚本
REM 使用方法: publish-to-github.bat

echo ==========================================
echo PromptVow VSCode扩展 - GitHub发布脚本
echo ==========================================

REM 检查是否在正确的目录
if not exist "package.json" (
    echo 错误: 请在extension/VSCode目录下运行此脚本
    pause
    exit /b 1
)

REM 清理不需要的文件
echo 步骤 1/5: 清理不需要的文件...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "out" rmdir /s /q "out"
echo 清理完成

REM 初始化Git仓库（如果还没有初始化）
if not exist ".git" (
    echo 步骤 2/5: 初始化Git仓库...
    git init
    echo Git仓库初始化完成
) else (
    echo 步骤 2/5: Git仓库已存在，跳过初始化
)

REM 添加远程仓库
echo 步骤 3/5: 添加GitHub远程仓库...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/LueYueqing/vscode-promptvow.git
echo 远程仓库添加完成

REM 添加所有文件
echo 步骤 4/5: 添加文件到暂存区...
git add .
echo 文件添加完成

REM 提交
echo 步骤 5/5: 提交更改...
set /p commit_msg="请输入提交信息 (默认: Initial commit for PromptVow VSCode extension): "
if "%commit_msg%"=="" set commit_msg=Initial commit for PromptVow VSCode extension
git commit -m "%commit_msg%"
echo 提交完成

echo.
echo ==========================================
echo 准备推送到GitHub...
echo ==========================================
echo.
echo 执行以下命令推送到GitHub:
echo   git push -u origin main
echo.
echo 或者如果主分支是master:
echo   git push -u origin master
echo.
echo 注意: 首次推送可能需要GitHub认证
echo ==========================================
pause
