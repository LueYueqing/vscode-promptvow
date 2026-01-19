# GitHub Release 发布指南

本文档介绍如何将 PromptVow VS Code 插件发布到 GitHub Releases。

## 📋 前置要求

### 1. 安装 GitHub CLI
```bash
# Windows (使用 winget)
winget install --id GitHub.cli

# 或访问下载页面
# https://cli.github.com/
```

### 2. 登录 GitHub CLI
```bash
gh auth login
```
按照提示选择：
- GitHub.com
- HTTPS
- Yes (authenticate Git with your GitHub credentials)
- Login with a web browser

### 3. 验证登录状态
```bash
gh auth status
```

---

## 🚀 发布方式

### 方式一：使用 npm 脚本（推荐）⭐

#### 步骤 1: 打包插件
```bash
cd extension/VSCode
npm run package
```
这会生成 `promptvow-x.x.x.vsix` 文件

#### 步骤 2: 发布到 GitHub Releases
```bash
# 发布正式版本
npm run publish:github

# 或发布预览版本（Pre-release）
npm run publish:github:pre
```

#### 步骤 3: 一键发布到所有平台
```bash
# 同时发布到: VS Code Marketplace + Open VSX + GitHub Releases
npm run publish:all
```

---

### 方式二：手动使用 GitHub CLI

#### 步骤 1: 打包插件
```bash
vsce package
```

#### 步骤 2: 创建 Release
```bash
# 基本发布
gh release create v0.1.18 promptvow-0.1.18.vsix \
  --title "PromptVow v0.1.18" \
  --notes "发布说明内容"

# 发布预览版
gh release create v0.1.18-beta promptvow-0.1.18.vsix \
  --title "PromptVow v0.1.18 Beta" \
  --notes "测试版本" \
  --prerelease
```

---

### 方式三：通过 GitHub 网页界面

#### 步骤 1: 打包插件
```bash
vsce package
```

#### 步骤 2: 访问 GitHub Releases 页面
打开: https://github.com/LueYueqing/vscode-promptvow/releases

#### 步骤 3: 创建新 Release
1. 点击 **"Draft a new release"**
2. 填写信息：
   - **Tag version**: `v0.1.18`
   - **Release title**: `PromptVow v0.1.18`
   - **Description**: 发布说明（见下方模板）
3. 上传 `.vsix` 文件：
   - 拖拽或点击上传 `promptvow-0.1.18.vsix`
4. 选择发布类型：
   - ✅ **正式版**: 不勾选 "This is a pre-release"
   - ⚠️ **预览版**: 勾选 "This is a pre-release"
5. 点击 **"Publish release"**

---

## 📝 Release 说明模板

```markdown
## 🎉 PromptVow v0.1.18

### 📥 安装方式

#### 方式 1: VS Code Marketplace (推荐)
在 VS Code 中搜索 "PromptVow" 并安装

#### 方式 2: 手动安装 .vsix 文件
```bash
# 下载 .vsix 文件后执行:
code --install-extension promptvow-0.1.18.vsix
```

#### 方式 3: VS Code GUI 安装
1. 下载下方的 .vsix 文件
2. 打开 VS Code
3. 按 Ctrl+Shift+P (或 Cmd+Shift+P)
4. 输入 "Extensions: Install from VSIX..."
5. 选择下载的文件

### ✨ 新功能
- 新增功能 1
- 新增功能 2

### 🐛 Bug 修复
- 修复问题 1
- 修复问题 2

### 🔗 相关链接
- 📦 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow)
- 🌐 [项目主页](https://promptvow.com)
- 📖 [使用文档](https://github.com/LueYueqing/vscode-promptvow#readme)
- 🐛 [问题反馈](https://github.com/LueYueqing/vscode-promptvow/issues)

---
**PromptVow** - 让承诺，秒级兑现 🚀
```

---

## 🔄 完整发布流程

### 正式版本发布流程

```bash
# 1. 更新版本号
cd extension/VSCode
npm version patch  # 或 minor, major

# 2. 更新 CHANGELOG.md
# 手动编辑 CHANGELOG.md，添加更新内容

# 3. 提交更改
git add .
git commit -m "chore: release v0.1.18"
git push

# 4. 编译和打包
npm run compile
npm run package

# 5. 发布到所有平台
npm run publish:all

# 6. 验证发布
# - 检查 VS Code Marketplace
# - 检查 Open VSX Registry
# - 检查 GitHub Releases
```

### 预览版本发布流程

```bash
# 1. 创建预览版本
npm version prerelease --preid=beta

# 2. 打包
npm run package

# 3. 发布到 GitHub Releases (仅预览版)
npm run publish:github:pre

# 4. 分享链接给测试用户
# https://github.com/LueYueqing/vscode-promptvow/releases
```

---

## 🛠️ 常用命令

```bash
# 查看所有 releases
gh release list

# 查看特定 release
gh release view v0.1.18

# 删除 release（如果发布错误）
gh release delete v0.1.18

# 编辑 release 说明
gh release edit v0.1.18 --notes "新的发布说明"

# 下载 release 资源
gh release download v0.1.18
```

---

## ⚠️ 注意事项

### 1. 版本号规范
- 使用语义化版本: `major.minor.patch`
- 示例: `0.1.18`, `1.0.0`, `2.1.3`
- Git tag 必须加 `v` 前缀: `v0.1.18`

### 2. 发布前检查
- [ ] 代码已编译: `npm run compile`
- [ ] 代码检查通过: `npm run lint`
- [ ] 功能已测试
- [ ] CHANGELOG.md 已更新
- [ ] README.md 信息准确
- [ ] 版本号已更新

### 3. 文件命名
- .vsix 文件名格式: `promptvow-{version}.vsix`
- 示例: `promptvow-0.1.18.vsix`

### 4. Release 类型
- **正式版 (Release)**: 稳定版本，推荐给所有用户
- **预览版 (Pre-release)**: 测试版本，仅给测试用户

---

## 🔍 故障排查

### 问题 1: GitHub CLI 未安装
```bash
# 错误信息: 'gh' 不是内部或外部命令
# 解决方案: 安装 GitHub CLI
winget install --id GitHub.cli
```

### 问题 2: 未登录 GitHub
```bash
# 错误信息: authentication required
# 解决方案: 登录 GitHub CLI
gh auth login
```

### 问题 3: .vsix 文件不存在
```bash
# 错误信息: 未找到 promptvow-x.x.x.vsix 文件
# 解决方案: 先打包
npm run package
```

### 问题 4: Tag 已存在
```bash
# 错误信息: tag already exists
# 解决方案: 删除旧 tag 或使用新版本号
git tag -d v0.1.18
git push origin :refs/tags/v0.1.18
```

---

## 📊 发布后验证

### 1. 检查 GitHub Releases
访问: https://github.com/LueYueqing/vscode-promptvow/releases
- ✅ Release 已创建
- ✅ .vsix 文件已上传
- ✅ 发布说明正确

### 2. 测试下载和安装
```bash
# 下载 .vsix 文件
gh release download v0.1.18

# 安装到 VS Code
code --install-extension promptvow-0.1.18.vsix

# 验证安装
code --list-extensions | grep promptvow
```

### 3. 检查所有平台
- [ ] VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow
- [ ] Open VSX Registry: https://open-vsx.org/extension/promptvow/promptvow
- [ ] GitHub Releases: https://github.com/LueYueqing/vscode-promptvow/releases

---

## 🎯 最佳实践

1. **定期发布**: 建议每 1-2 周发布一次更新
2. **语义化版本**: 严格遵循语义化版本规范
3. **详细说明**: Release 说明要详细，包含所有更新内容
4. **测试先行**: 重大更新先发布 Pre-release 测试
5. **备份文件**: 保留所有版本的 .vsix 文件
6. **自动化**: 使用 npm 脚本自动化发布流程

---

## 📚 相关文档

- [GitHub CLI 文档](https://cli.github.com/manual/)
- [GitHub Releases 指南](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [VS Code 扩展发布](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**更新日期**: 2026-01-19
**维护者**: PromptVow Team
