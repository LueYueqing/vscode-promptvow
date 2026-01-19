# 🚀 快速开始：发布到 GitHub Releases

## ⚡ 5 分钟快速设置

### 第 1 步: 安装 GitHub CLI (gh) 📥

选择以下任一方式安装：

#### 方式 1: 使用 winget (推荐)
```powershell
winget install --id GitHub.cli
```

#### 方式 2: 使用 Chocolatey
```powershell
choco install gh
```

#### 方式 3: 手动下载
访问: https://cli.github.com/
下载并安装 Windows 版本

### 第 2 步: 重启终端
安装后，**关闭并重新打开** PowerShell 或 VS Code 终端

### 第 3 步: 登录 GitHub
```powershell
gh auth login
```
按照提示操作：
1. 选择 `GitHub.com`
2. 选择 `HTTPS`
3. 选择 `Yes` (authenticate Git)
4. 选择 `Login with a web browser`
5. 复制显示的代码
6. 在浏览器中粘贴并授权

### 第 4 步: 验证安装
```powershell
gh auth status
```
应该显示: ✓ Logged in to github.com

---

## 🎯 现在就发布！

### 快速发布（3 个命令）

```powershell
# 1. 进入插件目录
cd extension/VSCode

# 2. 打包插件
npm run package

# 3. 发布到 GitHub Releases
npm run publish:github
```

就这么简单！✨

---

## 📋 完整发布流程

### 发布新版本

```powershell
# 1. 更新版本号（自动更新 package.json）
npm version patch
# 这会将版本从 0.1.18 → 0.1.19

# 2. 编译代码
npm run compile

# 3. 打包插件
npm run package

# 4. 发布到所有平台（VS Code Marketplace + Open VSX + GitHub）
npm run publish:all
```

### 发布测试版本

```powershell
# 1. 创建测试版本号
npm version prerelease --preid=beta
# 这会将版本从 0.1.18 → 0.1.19-beta.0

# 2. 打包
npm run package

# 3. 发布到 GitHub（仅测试版）
npm run publish:github:pre
```

---

## 🎨 可用的 npm 命令

```powershell
# 编译代码
npm run compile

# 打包成 .vsix 文件
npm run package

# 发布到 VS Code Marketplace
npm run publish:vsce

# 发布到 Open VSX Registry
npm run publish:ovsx

# 发布到 GitHub Releases（正式版）
npm run publish:github

# 发布到 GitHub Releases（预览版）
npm run publish:github:pre

# 一键发布到所有平台
npm run publish:all
```

---

## ✅ 发布前检查清单

在运行 `npm run publish:all` 之前，确保：

- [ ] 代码已测试，功能正常
- [ ] 版本号已更新（`npm version patch/minor/major`）
- [ ] CHANGELOG.md 已更新
- [ ] README.md 信息准确
- [ ] 代码已编译（`npm run compile`）
- [ ] 代码检查通过（`npm run lint`）

---

## 🔍 验证发布

发布后，检查以下链接：

### 1. GitHub Releases
https://github.com/LueYueqing/vscode-promptvow/releases

应该能看到：
- ✅ 新的 Release 版本
- ✅ .vsix 文件已上传
- ✅ 发布说明正确

### 2. VS Code Marketplace
https://marketplace.visualstudio.com/items?itemName=promptvow.promptvow

应该能看到：
- ✅ 版本号已更新
- ✅ 可以直接安装

### 3. Open VSX Registry
https://open-vsx.org/extension/promptvow/promptvow

应该能看到：
- ✅ 版本号已更新
- ✅ 可以下载安装

---

## 🆘 常见问题

### Q: 提示 "gh 不是内部或外部命令"
**A**: 需要安装 GitHub CLI
```powershell
winget install --id GitHub.cli
# 然后重启终端
```

### Q: 提示 "authentication required"
**A**: 需要登录 GitHub
```powershell
gh auth login
```

### Q: 提示 "未找到 .vsix 文件"
**A**: 需要先打包
```powershell
npm run package
```

### Q: 提示 "tag already exists"
**A**: 该版本已发布，需要更新版本号
```powershell
npm version patch  # 更新版本号
```

### Q: 如何删除错误的 Release？
**A**: 使用 GitHub CLI 删除
```powershell
gh release delete v0.1.18
git tag -d v0.1.18
git push origin :refs/tags/v0.1.18
```

---

## 📚 更多文档

- 详细指南: [docs/GITHUB_RELEASE_GUIDE.md](./GITHUB_RELEASE_GUIDE.md)
- 发布平台: [DISTRIBUTION_PLATFORMS.md](./DISTRIBUTION_PLATFORMS.md)
- GitHub CLI 文档: https://cli.github.com/manual/

---

## 🎉 开始发布吧！

现在您已经准备好了！运行以下命令开始您的第一次发布：

```powershell
cd extension/VSCode
npm run package
npm run publish:github
```

**PromptVow** - 让承诺，秒级兑现 🚀
