#!/bin/bash

# PromptVow VSCode扩展 - 推送到GitHub仓库脚本
# 使用方法: bash publish-to-github.sh

echo "=========================================="
echo "PromptVow VSCode扩展 - GitHub发布脚本"
echo "=========================================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "错误: 请在extension/VSCode目录下运行此脚本"
    exit 1
fi

# 清理不需要的文件
echo "步骤 1/5: 清理不需要的文件..."
rm -rf node_modules
rm -rf out
echo "✓ 清理完成"

# 初始化Git仓库（如果还没有初始化）
if [ ! -d ".git" ]; then
    echo "步骤 2/5: 初始化Git仓库..."
    git init
    echo "✓ Git仓库初始化完成"
else
    echo "步骤 2/5: Git仓库已存在，跳过初始化"
fi

# 添加远程仓库
echo "步骤 3/5: 添加GitHub远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/LueYueqing/vscode-promptvow.git
echo "✓ 远程仓库添加完成"

# 添加所有文件
echo "步骤 4/5: 添加文件到暂存区..."
git add .
echo "✓ 文件添加完成"

# 提交
echo "步骤 5/5: 提交更改..."
read -p "请输入提交信息 (默认: Initial commit for PromptVow VSCode extension): " commit_msg
commit_msg=${commit_msg:-"Initial commit for PromptVow VSCode extension"}
git commit -m "$commit_msg"
echo "✓ 提交完成"

echo ""
echo "=========================================="
echo "准备推送到GitHub..."
echo "=========================================="
echo ""
echo "执行以下命令推送到GitHub:"
echo "  git push -u origin main"
echo ""
echo "或者如果主分支是master:"
echo "  git push -u origin master"
echo ""
echo "注意: 首次推送可能需要GitHub认证"
echo "=========================================="
